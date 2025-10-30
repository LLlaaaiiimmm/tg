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
        console.log('📥 Lava webhook received:', JSON.stringify(req.body));

        const { id, status, email } = req.body;

        // Проверка подписи (если используется)
        const signature = req.headers['x-signature'];
        if (signature && !verifyLavaSignature(req.body, signature)) {
            console.error('❌ Invalid Lava signature');
            return res.status(403).json({ error: 'Invalid signature' });
        }

        // Находим заказ по email или parent ID
        const order = await orderService.getOrderByEmail(email);
        if (!order) {
            console.error('❌ Order not found for email:', email);
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.isPaid) {
            console.log('ℹ️ Order already paid:', order.orderId);
            return res.status(200).json({ success: true, message: 'Already paid' });
        }

        // Обрабатываем успешный платеж
        if (status === 'success' || status === 'paid') {
            console.log('✅ Processing successful payment:', order.orderId);

            // Отмечаем заказ как оплаченный
            await orderService.markAsPaid(order.orderId);

            // Добавляем генерации
            const pkg = PACKAGES[order.package];
            await userService.addPaidQuota(order.userId, pkg.generations);

            // Обрабатываем кешбэк для эксперта
            await referralService.processExpertCashback(order.userId, order.amount);

            // Здесь можно отправить уведомление пользователю через бота
            // но для этого нужен доступ к bot instance

            res.status(200).json({ success: true });
        } else {
            console.log('ℹ️ Payment status:', status);
            res.status(200).json({ success: true });
        }
    } catch (err) {
        console.error('❌ Error in Lava webhook:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Webhook для 0xprocessing (крипто платежи)
app.post('/webhook/crypto', async (req, res) => {
    try {
        console.log('📥 Crypto webhook received:', JSON.stringify(req.body));

        const { billingID, status, clientId } = req.body;

        const order = await orderService.getOrderById(billingID);
        if (!order) {
            console.error('❌ Order not found:', billingID);
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.isPaid) {
            console.log('ℹ️ Order already paid:', billingID);
            return res.status(200).json({ success: true, message: 'Already paid' });
        }

        // Обрабатываем успешный платеж
        if (status === 'success' || status === 'paid') {
            console.log('✅ Processing successful crypto payment:', billingID);

            await orderService.markAsPaid(billingID);

            const pkg = PACKAGES[order.package];
            await userService.addPaidQuota(clientId, pkg.generations);

            await referralService.processExpertCashback(clientId, order.amount);

            res.status(200).json({ success: true });
        } else {
            console.log('ℹ️ Crypto payment status:', status);
            res.status(200).json({ success: true });
        }
    } catch (err) {
        console.error('❌ Error in crypto webhook:', err);
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
