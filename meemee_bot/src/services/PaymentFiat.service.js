import 'dotenv/config';
import axios from 'axios';
import { OrderService } from './Order.service.js';
import { PACKAGES } from '../config.js';

export class PaymentFiatService {
    constructor() {
        this.baseUrl = 'https://gate.lava.top';
        this.api = process.env.LAVA_PAYMENT_API;
        this.currency = {
            'BANK131': 'RUB',
            'UNLIMINT': 'USD'
        };
    }

    // Создание фиат-платежа
    async createPayment({ userId, email, amount, bank = 'BANK131', package: pkg }) {
        try {
            const orderService = new OrderService();
            const orderId = orderService.generateOrderId('FIAT');

            // Получаем Offer ID из конфига
            const packageConfig = PACKAGES[pkg];
            if (!packageConfig || !packageConfig.offerIdLava) {
                return { error: 'Некорректный пакет или не настроен Lava Offer ID' };
            }

            const data = {
                email,
                offerId: packageConfig.offerIdLava,
                buyerLanguage: 'RU',
                currency: this.currency[bank],
            };

            const response = await axios.post(
                `${this.baseUrl}/api/v2/invoice`,
                data,
                {
                    headers: {
                        'X-Api-Key': this.api
                    }
                }
            );

            if (response.data.error) {
                console.error(`❌ Lava error: ${response.data.error}`);
                return { error: response.data.error };
            }

            const orderData = {
                orderId,
                userId,
                email,
                input: data,
                output: response.data,
                isPaid: false,
                isFiat: true,
                package: pkg,
                amount: amount,
                parentId: response.data.id,
                createdAt: new Date().toISOString()
            };

            await orderService.createOrder(orderData);
            console.log(`💵 Fiat payment created: ${orderId}`);
            return orderData;
        } catch (err) {
            console.error(`❌ Error creating fiat payment: ${err.message}`);
            return { error: err.toString() };
        }
    }

    // Сохранение связи Lava ID с нашим Order ID
    async saveLavaMapping(lavaOrderId, orderId) {
        const redis = (await import('../redis.js')).default;
        await redis.set(`lava_id:${lavaOrderId}`, orderId);
    }

    // Получение Order ID по Lava ID
    async getOrderIdByLavaId(lavaOrderId) {
        const redis = (await import('../redis.js')).default;
        return await redis.get(`lava_id:${lavaOrderId}`);
    }
}