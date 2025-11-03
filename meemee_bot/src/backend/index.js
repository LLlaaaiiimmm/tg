import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import { OrderService } from '../services/Order.service.js';
import { UserService } from '../services/User.service.js';
import { ReferralService } from '../services/Referral.service.js';
import { PACKAGES } from '../config.js';

const app = express();
const PORT = process.env.WEBHOOK_PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const orderService = new OrderService();
const userService = new UserService();
const referralService = new ReferralService();

// Функция проверки подписи от Lava
function verifyLavaSignature(data, signature) {
    const secret = process.env.WEBHOOK_PASSWORD_PROCESSING || '';
    const hash = crypto
        .createHash('md5')
        .update(JSON.stringify(data) + secret)
        .digest('hex');
    return hash === signature;
}

// Webhook для Lava (фиат платежи)
app.post('/webhook/lava', async (req, res) => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📥 Lava webhook received at:', new Date().toISOString());
        console.log('📦 Full webhook data:', JSON.stringify(req.body, null, 2));
        console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const { id, status, email } = req.body;

        // Проверка подписи (если используется)
        const signature = req.headers['x-signature'];
        if (signature) {
            const isValid = verifyLavaSignature(req.body, signature);
            console.log(`🔐 Signature verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
            if (!isValid) {
                console.error('❌ Invalid Lava signature');
                return res.status(403).json({ error: 'Invalid signature' });
            }
        } else {
            console.log('⚠️ No signature provided');
        }

        // Находим заказ по email или parent ID
        const order = await orderService.getOrderByEmail(email);
        if (!order) {
            console.error('❌ Order not found for email:', email);
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log(`📦 Order found: orderId=${order.orderId}, userId=${order.userId}, package=${order.package}, isPaid=${order.isPaid}`);

        if (order.isPaid) {
            console.log('ℹ️ Order already paid:', order.orderId);
            return res.status(200).json({ success: true, message: 'Already paid' });
        }

        // Обрабатываем успешный платеж
        const isSuccess = status && (
            status.toLowerCase() === 'success' || 
            status.toLowerCase() === 'paid' || 
            status.toLowerCase() === 'completed'
        );

        if (isSuccess) {
            console.log('✅ Processing successful fiat payment:', order.orderId);

            // Отмечаем заказ как оплаченный
            await orderService.markAsPaid(order.orderId);

            // Проверяем что пакет существует
            const pkg = PACKAGES[order.package];
            if (!pkg) {
                console.error(`❌ Package not found: ${order.package}`);
                console.error(`Available packages: ${Object.keys(PACKAGES).join(', ')}`);
                return res.status(400).json({ error: 'Package not found' });
            }

            // Добавляем генерации
            console.log(`💳 Adding ${pkg.generations} videos to user ${order.userId}`);
            const addResult = await userService.addPaidQuota(order.userId, pkg.generations);

            if (!addResult) {
                console.error(`❌ Failed to add quota to user ${order.userId}`);
                return res.status(500).json({ error: 'Failed to add quota' });
            }

            console.log(`✅ Successfully added ${pkg.generations} videos to user ${order.userId}`);

            // Обрабатываем кешбэк для эксперта
            try {
                await referralService.processExpertCashback(order.userId, order.amount);
                console.log('✅ Cashback processed');
            } catch (cashbackErr) {
                console.error('⚠️ Cashback processing failed:', cashbackErr.message);
                // Не фейлим весь webhook из-за кешбека
            }

            // Здесь можно отправить уведомление пользователю через бота
            // но для этого нужен доступ к bot instance

            res.status(200).json({ success: true, message: 'Payment processed' });
        } else {
            console.log('ℹ️ Fiat payment status (not success):', status);
            res.status(200).json({ success: true, message: 'Status noted' });
        }
    } catch (err) {
        console.error('❌ Error in Lava webhook:', err);
        console.error('Stack:', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Webhook для 0xprocessing (крипто платежи)
app.post('/webhook/crypto', async (req, res) => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📥 Crypto webhook received at:', new Date().toISOString());
        console.log('📦 Full webhook data:', JSON.stringify(req.body, null, 2));
        console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // 0xProcessing может отправлять разные поля
        // Поддерживаем оба варианта: BillingID и billingID
        const billingID = req.body.billingID || req.body.BillingID;
        const status = req.body.status || req.body.Status;
        const paymentId = req.body.PaymentId || req.body.paymentId;

        console.log(`🔍 Extracted fields: billingID=${billingID}, status=${status}, paymentId=${paymentId}`);

        if (!billingID) {
            console.error('❌ No billingID in webhook');
            return res.status(400).json({ error: 'Missing billingID' });
        }

        const order = await orderService.getOrderById(billingID);
        if (!order) {
            console.error('❌ Order not found:', billingID);
            return res.status(404).json({ error: 'Order not found' });
        }

        console.log(`📦 Order found: userId=${order.userId}, package=${order.package}, isPaid=${order.isPaid}`);

        if (order.isPaid) {
            console.log('ℹ️ Order already paid:', billingID);
            return res.status(200).json({ success: true, message: 'Already paid' });
        }

        // Обрабатываем успешный платеж
        // Проверяем разные варианты статуса (Success, success, paid)
        const isSuccess = status && (
            status.toLowerCase() === 'success' || 
            status.toLowerCase() === 'paid' || 
            status.toLowerCase() === 'completed'
        );

        if (isSuccess) {
            console.log('✅ Processing successful crypto payment:', billingID);
            console.log(`📊 Order details: userId=${order.userId}, package=${order.package}, amount=${order.amount}`);

            await orderService.markAsPaid(billingID);

            const pkg = PACKAGES[order.package];
            if (!pkg) {
                console.error(`❌ Package not found: ${order.package}`);
                console.error(`Available packages: ${Object.keys(PACKAGES).join(', ')}`);
                return res.status(400).json({ error: 'Package not found' });
            }

            // ИСПРАВЛЕНО: используем order.userId вместо clientId из webhook
            console.log(`💳 Adding ${pkg.generations} videos to user ${order.userId}`);
            const addResult = await userService.addPaidQuota(order.userId, pkg.generations);
            
            if (!addResult) {
                console.error(`❌ Failed to add quota to user ${order.userId}`);
                return res.status(500).json({ error: 'Failed to add quota' });
            }

            console.log(`✅ Successfully added ${pkg.generations} videos to user ${order.userId}`);

            // Обрабатываем кешбэк для реферала
            try {
                await referralService.processExpertCashback(order.userId, order.amount);
                console.log('✅ Cashback processed');
            } catch (cashbackErr) {
                console.error('⚠️ Cashback processing failed:', cashbackErr.message);
                // Не фейлим весь webhook из-за кешбека
            }

            res.status(200).json({ success: true, message: 'Payment processed' });
        } else {
            console.log('ℹ️ Crypto payment status (not success):', status);
            res.status(200).json({ success: true, message: 'Status noted' });
        }
    } catch (err) {
        console.error('❌ Error in crypto webhook:', err);
        console.error('Stack:', err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Webhook server started on port ${PORT}`);
    console.log(`Lava webhook: http://localhost:${PORT}/webhook/lava`);
    console.log(`Crypto webhook: http://localhost:${PORT}/webhook/crypto`);
});

export default app;
