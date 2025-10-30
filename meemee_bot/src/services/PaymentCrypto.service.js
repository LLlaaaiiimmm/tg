import 'dotenv/config';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { OrderService } from './Order.service.js';

export class PaymentCryptoService {
    constructor() {
        this.baseUrl = 'https://app.0xprocessing.com';
        this.api = process.env.PAYMENT_API;
        this.merchant = process.env.MERCHANT_ID || '0xMR8252827';
    }

    // Создание крипто-платежа
    async createPayment({ userId, amount, payCurrency, package: pkg }) {
        try {
            const orderService = new OrderService();
            const orderId = orderService.generateOrderId('CRYPTO');

            const data = {
                merchantID: this.merchant,
                billingID: orderId,
                currency: payCurrency,
                email: 'user@meemee.bot',
                clientId: userId,
            };

            const response = await axios.post(
                `${this.baseUrl}/payment`,
                data,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            // Расчёт суммы
            data.amountUSD = amount;
            data.amount = new BigNumber(amount)
                .div(payCurrency.includes('USDT') || payCurrency.includes('USDC') 
                    ? 1 
                    : response.data.rate)
                .toFixed(5);
            data.package = pkg;
            data.createdAt = new Date().toISOString();

            // Проверка минимальной суммы
            const coinInfoResponse = await axios.get(`${this.baseUrl}/Api/CoinInfo/${payCurrency}`);
            if (new BigNumber(data.amount).isLessThan(coinInfoResponse.data.min)) {
                return { error: 'Сумма оплаты слишком мала для этой сети. Попробуйте другую.' };
            }

            const orderData = {
                orderId,
                userId,
                input: data,
                output: response.data,
                isPaid: false,
                isFiat: false,
                package: pkg,
                amount: amount,
                currency: payCurrency
            };

            await orderService.createOrder(orderData);
            console.log(`💎 Crypto payment created: ${orderId}`);
            return orderData;
        } catch (err) {
            console.error(`❌ Error creating crypto payment: ${err.message}`);
            return { error: err.message };
        }
    }

    // Проверка статуса платежа
    async checkPaymentStatus(orderId) {
        try {
            const orderService = new OrderService();
            const order = await orderService.getOrderById(orderId);
            
            if (!order) return { error: 'Заказ не найден' };
            if (order.isPaid) return { status: 'paid' };

            // Здесь должна быть логика проверки статуса через 0xprocessing API
            // Но обычно это делается через webhook
            return { status: 'pending' };
        } catch (err) {
            console.error(`❌ Error checking payment status: ${err.message}`);
            return { error: err.message };
        }
    }
}