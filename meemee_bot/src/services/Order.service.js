import redis from '../redis.js';

export class OrderService {
    // Создание заказа
    async createOrder(orderData) {
        const { orderId, userId } = orderData;

        await redis.set(`order:${orderId}`, JSON.stringify(orderData));
        await redis.lpush('all_orders', orderId);
        await redis.lpush(`user_orders:${userId}`, orderId);

        if (orderData.isFiat && orderData.email) {
            await redis.set(`email_to_order:${orderData.email}`, orderId);
        }

        console.log(`📝 Order ${orderId} created for user ${userId}`);
        return orderData;
    }

    // Получение заказа по ID
    async getOrderById(orderId) {
        const order = await redis.get(`order:${orderId}`);
        return order ? JSON.parse(order) : null;
    }

    // Обновление заказа
    async updateOrder(orderId, data) {
        const order = await this.getOrderById(orderId);
        if (!order) return null;

        const updatedOrder = {
            ...order,
            ...data,
            updatedAt: new Date().toISOString()
        };

        await redis.set(`order:${orderId}`, JSON.stringify(updatedOrder));
        console.log(`✅ Order ${orderId} updated`);
        return updatedOrder;
    }

    // Получение заказов пользователя
    async getUserOrders(userId) {
        const orderIds = await redis.lrange(`user_orders:${userId}`, 0, -1);
        const orders = [];

        for (const orderId of orderIds) {
            const order = await this.getOrderById(orderId);
            if (order) orders.push(order);
        }

        return orders;
    }

    // Получение всех заказов
    async getAllOrders() {
        const orderIds = await redis.lrange('all_orders', 0, -1);
        const orders = [];

        for (const orderId of orderIds) {
            const order = await this.getOrderById(orderId);
            if (order) orders.push(order);
        }

        return orders;
    }

    // Отметка заказа как оплаченного
    async markAsPaid(orderId) {
        return await this.updateOrder(orderId, { 
            isPaid: true, 
            paidAt: new Date().toISOString() 
        });
    }

    // Получение заказа по email
    async getOrderByEmail(email) {
        const orderId = await redis.get(`email_to_order:${email}`);
        return orderId ? await this.getOrderById(orderId) : null;
    }

    // Получение статистики платежей
    async getPaymentStats() {
        const orders = await this.getAllOrders();
        
        const stats = {
            total: orders.length,
            paid: orders.filter(o => o.isPaid).length,
            unpaid: orders.filter(o => !o.isPaid).length,
            crypto: orders.filter(o => !o.isFiat && o.isPaid).length,
            fiat: orders.filter(o => o.isFiat && o.isPaid).length,
            totalRevenue: orders.filter(o => o.isPaid)
                .reduce((sum, o) => sum + (o.amount || 0), 0)
        };

        return stats;
    }

    // Генерация ID заказа
    generateOrderId(type = 'ORDER') {
        const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomPart = Math.floor(1000000000 + Math.random() * 9000000000);
        return `${type}-${datePart}-${randomPart}`;
    }
}