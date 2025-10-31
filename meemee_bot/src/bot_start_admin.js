import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { UserService } from './services/User.service.js';
import { OrderService } from './services/Order.service.js';
import { GenerationService } from './services/Generation.service.js';
import { ADMINS } from './config.js';

if (!process.env.BOT_TOKEN_ADMIN) {
    console.error('❌ BOT_TOKEN_ADMIN not found in .env file');
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN_ADMIN);
const userService = new UserService();
const orderService = new OrderService();
const generationService = new GenerationService();

// Middleware для проверки админа
bot.use(async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId || !ADMINS.includes(userId)) {
        return await ctx.reply('❌ Доступ запрещён');
    }
    await next();
});

// Главное меню админа
const ADMIN_MENU = {
    reply_markup: {
        inline_keyboard: [
            [{ text: '📊 Статистика', callback_data: 'stats' }],
            [{ text: '💳 Платежи', callback_data: 'payments' }],
            [{ text: '🎬 Генерации', callback_data: 'generations' }],
            [{ text: '👥 Пользователи', callback_data: 'users' }],
            [{ text: '📥 Экспорт отчётов', callback_data: 'export_reports' }],
            [{ text: '📢 Рассылка', callback_data: 'broadcast' }]
        ]
    }
};

// Команда /start
bot.start(async (ctx) => {
    await ctx.reply(
        '👨‍💼 Админ-панель MeeMee\n\nВыберите действие:',
        ADMIN_MENU
    );
});

// Главное меню
bot.action('main_menu', async (ctx) => {
    try {
        await ctx.editMessageText(
            '👨‍💼 Админ-панель MeeMee\n\nВыберите действие:',
            ADMIN_MENU
        );
    } catch (err) {
        await ctx.reply('👨‍💼 Админ-панель MeeMee\n\nВыберите действие:', ADMIN_MENU);
    }
});

// Статистика
bot.action('stats', async (ctx) => {
    try {
        const totalUsers = await userService.getTotalUsers();
        const paymentStats = await orderService.getPaymentStats();
        const generationStats = await generationService.getGenerationStats();

        let message = '📊 Общая статистика:\n\n';
        message += `👥 Всего пользователей: ${totalUsers}\n\n`;
        
        message += `💳 Платежи:\n`;
        message += `├─ Всего заказов: ${paymentStats.total}\n`;
        message += `├─ Оплачено: ${paymentStats.paid}\n`;
        message += `├─ В ожидании: ${paymentStats.unpaid}\n`;
        message += `├─ Крипто: ${paymentStats.crypto}\n`;
        message += `├─ Карты: ${paymentStats.fiat}\n`;
        message += `└─ Общая выручка: ${paymentStats.totalRevenue.toFixed(2)}₽\n\n`;
        
        message += `🎬 Генерации:\n`;
        message += `├─ Всего: ${generationStats.total}\n`;
        message += `├─ В очереди: ${generationStats.queued}\n`;
        message += `├─ Обрабатываются: ${generationStats.processing}\n`;
        message += `├─ Завершено: ${generationStats.done}\n`;
        message += `└─ Ошибок: ${generationStats.failed}`;

        await ctx.editMessageText(message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔙 Назад', callback_data: 'main_menu' }]
                ]
            }
        });
    } catch (err) {
        console.error('❌ Error in stats:', err);
        await ctx.answerCbQuery('Ошибка получения статистики');
    }
});

// Статистика платежей
bot.action('payments', async (ctx) => {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

        const allOrders = await orderService.getAllOrders();
        
        const todayOrders = allOrders.filter(o => new Date(o.createdAt) >= today);
        const weekOrders = allOrders.filter(o => new Date(o.createdAt) >= weekAgo);
        const monthOrders = allOrders.filter(o => new Date(o.createdAt) >= monthAgo);

        let message = '💳 Статистика платежей:\n\n';
        
        message += `📅 За сегодня:\n`;
        message += `├─ Заказов: ${todayOrders.length}\n`;
        message += `├─ Оплачено: ${todayOrders.filter(o => o.isPaid).length}\n`;
        message += `└─ Выручка: ${todayOrders.filter(o => o.isPaid).reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)}₽\n\n`;
        
        message += `📅 За неделю:\n`;
        message += `├─ Заказов: ${weekOrders.length}\n`;
        message += `├─ Оплачено: ${weekOrders.filter(o => o.isPaid).length}\n`;
        message += `└─ Выручка: ${weekOrders.filter(o => o.isPaid).reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)}₽\n\n`;
        
        message += `📅 За месяц:\n`;
        message += `├─ Заказов: ${monthOrders.length}\n`;
        message += `├─ Оплачено: ${monthOrders.filter(o => o.isPaid).length}\n`;
        message += `└─ Выручка: ${monthOrders.filter(o => o.isPaid).reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)}₽\n\n`;
        
        const cryptoOrders = allOrders.filter(o => !o.isFiat && o.isPaid);
        const fiatOrders = allOrders.filter(o => o.isFiat && o.isPaid);
        
        message += `💎 Крипто: ${cryptoOrders.length} (${cryptoOrders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)}₽)\n`;
        message += `💵 Карты: ${fiatOrders.length} (${fiatOrders.reduce((sum, o) => sum + (o.amount || 0), 0).toFixed(2)}₽)`;

        await ctx.editMessageText(message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔙 Назад', callback_data: 'main_menu' }]
                ]
            }
        });
    } catch (err) {
        console.error('❌ Error in payments:', err);
        await ctx.answerCbQuery('Ошибка получения статистики');
    }
});

// Статистика генераций
bot.action('generations', async (ctx) => {
    try {
        const generationStats = await generationService.getGenerationStats();
        const topMemes = await generationService.getTopMemes();

        let message = '🎬 Статистика генераций:\n\n';
        message += `📊 Общая:\n`;
        message += `├─ Всего: ${generationStats.total}\n`;
        message += `├─ В очереди: ${generationStats.queued}\n`;
        message += `├─ Обрабатываются: ${generationStats.processing}\n`;
        message += `├─ Завершено: ${generationStats.done}\n`;
        message += `└─ Ошибок: ${generationStats.failed}\n\n`;

        if (topMemes.length > 0) {
            message += `🏆 Топ мемов:\n`;
            topMemes.forEach((meme, index) => {
                message += `${index + 1}. ${meme.memeName}: ${meme.count}\n`;
            });
        }

        await ctx.editMessageText(message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔙 Назад', callback_data: 'main_menu' }]
                ]
            }
        });
    } catch (err) {
        console.error('❌ Error in generations:', err);
        await ctx.answerCbQuery('Ошибка получения статистики');
    }
});

// Пользователи
bot.action('users', async (ctx) => {
    try {
        const totalUsers = await userService.getTotalUsers();
        const allUsers = await userService.getAllUsers();
        
        // Подсчёт активных пользователей (с генерациями)
        const activeUsers = allUsers.filter(u => u.total_generations > 0);
        const paidUsers = allUsers.filter(u => u.paid_quota > 0 || u.total_spent > 0);

        let message = '👥 Статистика пользователей:\n\n';
        message += `├─ Всего: ${totalUsers}\n`;
        message += `├─ Активных: ${activeUsers.length}\n`;
        message += `└─ Платных: ${paidUsers.length}\n\n`;
        
        message += `💡 Для поиска пользователя отправьте его ID`;

        await ctx.editMessageText(message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔙 Назад', callback_data: 'main_menu' }]
                ]
            }
        });
        
        ctx.session = ctx.session || {};
        ctx.session.waitingForUserId = true;
    } catch (err) {
        console.error('❌ Error in users:', err);
        await ctx.answerCbQuery('Ошибка получения данных');
    }
});

// Рассылка
bot.action('broadcast', async (ctx) => {
    try {
        await ctx.editMessageText(
            '📢 Рассылка сообщений\n\nОтправьте текст сообщения для рассылки всем пользователям.\n\n⚠️ Используйте осторожно!',
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Назад', callback_data: 'main_menu' }]
                    ]
                }
            }
        );
        
        ctx.session = ctx.session || {};
        ctx.session.waitingForBroadcast = true;
    } catch (err) {
        console.error('❌ Error in broadcast:', err);
        await ctx.answerCbQuery('Ошибка');
    }
});

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
    try {
        ctx.session = ctx.session || {};
        
        if (ctx.session.waitingForUserId) {
            const userId = parseInt(ctx.message.text);
            if (isNaN(userId)) {
                return await ctx.reply('❌ Некорректный ID');
            }
            
            const user = await userService.getUser(userId);
            if (!user) {
                return await ctx.reply('❌ Пользователь не найден');
            }
            
            let message = `👤 Пользователь ${userId}:\n\n`;
            message += `📝 Имя: ${user.firstName || ''} ${user.lastName || ''}\n`;
            message += `🆔 Username: @${user.username || 'нет'}\n\n`;
            message += `🎬 Генерации:\n`;
            message += `├─ Бесплатных: ${user.free_quota}\n`;
            message += `├─ Платных: ${user.paid_quota}\n`;
            message += `├─ Всего сделано: ${user.successful_generations || 0}\n`;
            message += `└─ Ошибок: ${user.failed_generations || 0}\n\n`;
            message += `💰 Потрачено: ${user.total_spent || 0}₽\n`;
            message += `📅 Регистрация: ${new Date(user.createdAt).toLocaleDateString('ru-RU')}`;
            
            await ctx.reply(message, ADMIN_MENU);
            delete ctx.session.waitingForUserId;
            
        } else if (ctx.session.waitingForBroadcast) {
            const text = ctx.message.text;
            const allUsers = await userService.getAllUsers();
            
            let success = 0;
            let failed = 0;
            
            await ctx.reply(`📤 Начинаю рассылку ${allUsers.length} пользователям...`);
            
            for (const user of allUsers) {
                try {
                    await bot.telegram.sendMessage(user.userId, text);
                    success++;
                    
                    // Задержка чтобы не превысить лимиты Telegram
                    await new Promise(resolve => setTimeout(resolve, 50));
                } catch (err) {
                    failed++;
                    console.error(`Failed to send to ${user.userId}:`, err.message);
                }
            }
            
            await ctx.reply(
                `✅ Рассылка завершена!\n\nОтправлено: ${success}\nОшибок: ${failed}`,
                ADMIN_MENU
            );
            
            delete ctx.session.waitingForBroadcast;
        }
    } catch (err) {
        console.error('❌ Error in text handler:', err);
        await ctx.reply('Произошла ошибка');
    }
});

// Запуск бота
bot.launch()
    .then(() => {
        console.log('✅ MeeMee Admin bot started successfully!');
        console.log(`Bot username: @${bot.botInfo.username}`);
    })
    .catch(err => {
        console.error('❌ Failed to start admin bot:', err);
        process.exit(1);
    });

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
