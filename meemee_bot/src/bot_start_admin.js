import 'dotenv/config';
import { Telegraf, session, Input } from 'telegraf';
import { UserService } from './services/User.service.js';
import { OrderService } from './services/Order.service.js';
import { GenerationService } from './services/Generation.service.js';
import { ADMINS } from './config.js';
import axios from 'axios';

if (!process.env.BOT_TOKEN_ADMIN) {
    console.error('❌ BOT_TOKEN_ADMIN not found in .env file');
    process.exit(1);
}

if (!process.env.BOT_TOKEN) {
    console.error('❌ BOT_TOKEN not found in .env file (needed for broadcast)');
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN_ADMIN);
console.log(`✅ Admin bot initialized with token: ${process.env.BOT_TOKEN_ADMIN?.substring(0, 10)}...`);

// Создаём отдельный экземпляр для рассылки через основной бот
const mainBot = new Telegraf(process.env.BOT_TOKEN);
console.log(`✅ Main bot initialized with token: ${process.env.BOT_TOKEN?.substring(0, 10)}...`);

const userService = new UserService();
const orderService = new OrderService();
const generationService = new GenerationService();

// Session middleware
bot.use(session());

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
        if (!ctx.session) ctx.session = {};
        
        // Очищаем предыдущие данные
        ctx.session.broadcast = {
            step: 'content',
            text: null,
            photoBuffer: null,
            buttonText: null,
            buttonUrl: null
        };
        
        await ctx.editMessageText(
            '📢 Рассылка сообщений\n\n' +
            '📝 Шаг 1: Отправьте содержание\n\n' +
            '▫️ Текст - просто напишите сообщение\n' +
            '▫️ Фото с текстом - отправьте фото с подписью\n' +
            '▫️ Только фото - отправьте фото\n\n' +
            '💡 HTML разметка: <b>жирный</b>, <i>курсив</i>',
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Отмена', callback_data: 'main_menu' }]
                    ]
                }
            }
        );
    } catch (err) {
        console.error('❌ Error in broadcast:', err);
        await ctx.answerCbQuery('Ошибка');
    }
});

// Экспорт отчётов
bot.action('export_reports', async (ctx) => {
    try {
        await ctx.editMessageText(
            '📥 Экспорт отчётов\n\nВыберите тип отчёта:',
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '👥 Пользователи', callback_data: 'export_users' }],
                        [{ text: '💳 Платежи', callback_data: 'export_payments' }],
                        [{ text: '🎬 Генерации', callback_data: 'export_generations' }],
                        [{ text: '🔙 Назад', callback_data: 'main_menu' }]
                    ]
                }
            }
        );
    } catch (err) {
        console.error('❌ Error in export_reports:', err);
        await ctx.answerCbQuery('Ошибка');
    }
});

// Экспорт пользователей
bot.action('export_users', async (ctx) => {
    try {
        await ctx.answerCbQuery('Подготовка отчёта...');
        const allUsers = await userService.getAllUsers();
        
        let csvData = 'User ID,Username,First Name,Free Quota,Paid Quota,Total Spent,Successful Generations,Failed Generations,Created At\n';
        
        for (const user of allUsers) {
            csvData += `${user.userId},`;
            csvData += `${user.username || ''},`;
            csvData += `${user.firstName || ''},`;
            csvData += `${user.free_quota || 0},`;
            csvData += `${user.paid_quota || 0},`;
            csvData += `${user.total_spent || 0},`;
            csvData += `${user.successful_generations || 0},`;
            csvData += `${user.failed_generations || 0},`;
            csvData += `${user.createdAt || ''}\n`;
        }
        
        // Отправляем как документ
        await ctx.replyWithDocument(
            {
                source: Buffer.from(csvData, 'utf-8'),
                filename: `users_export_${new Date().toISOString().split('T')[0]}.csv`
            },
            { caption: `📊 Отчёт по пользователям\nВсего: ${allUsers.length}` }
        );
        
        await ctx.reply('✅ Отчёт готов!', ADMIN_MENU);
    } catch (err) {
        console.error('❌ Error exporting users:', err);
        await ctx.reply('❌ Ошибка при экспорте');
    }
});

// Экспорт платежей
bot.action('export_payments', async (ctx) => {
    try {
        await ctx.answerCbQuery('Подготовка отчёта...');
        const allOrders = await orderService.getAllOrders();
        
        let csvData = 'Order ID,User ID,Amount,Package,Method,Status,Paid,Created At\n';
        
        for (const order of allOrders) {
            csvData += `${order.orderId},`;
            csvData += `${order.userId},`;
            csvData += `${order.amount || 0},`;
            csvData += `${order.package || ''},`;
            csvData += `${order.isFiat ? 'Card' : 'Crypto'},`;
            csvData += `${order.status || ''},`;
            csvData += `${order.isPaid ? 'Yes' : 'No'},`;
            csvData += `${order.createdAt || ''}\n`;
        }
        
        await ctx.replyWithDocument(
            {
                source: Buffer.from(csvData, 'utf-8'),
                filename: `payments_export_${new Date().toISOString().split('T')[0]}.csv`
            },
            { caption: `💳 Отчёт по платежам\nВсего: ${allOrders.length}` }
        );
        
        await ctx.reply('✅ Отчёт готов!', ADMIN_MENU);
    } catch (err) {
        console.error('❌ Error exporting payments:', err);
        await ctx.reply('❌ Ошибка при экспорте');
    }
});

// Экспорт генераций
bot.action('export_generations', async (ctx) => {
    try {
        await ctx.answerCbQuery('Подготовка отчёта...');
        
        // Получаем все генерации из Redis
        const redisModule = await import('./redis.js');
        const redisClient = redisModule.default;
        const allKeys = await redisClient.keys('generation:*');
        const generations = [];
        
        for (const key of allKeys) {
            const gen = await redisClient.get(key);
            if (gen) {
                generations.push(JSON.parse(gen));
            }
        }
        
        let csvData = 'Generation ID,User ID,Meme ID,Meme Name,Name,Gender,Status,Created At,Updated At\n';
        
        for (const gen of generations) {
            csvData += `${gen.generationId},`;
            csvData += `${gen.userId},`;
            csvData += `${gen.memeId},`;
            csvData += `${gen.memeName || ''},`;
            csvData += `${gen.name || ''},`;
            csvData += `${gen.gender || ''},`;
            csvData += `${gen.status || ''},`;
            csvData += `${gen.createdAt || ''},`;
            csvData += `${gen.updatedAt || ''}\n`;
        }
        
        await ctx.replyWithDocument(
            {
                source: Buffer.from(csvData, 'utf-8'),
                filename: `generations_export_${new Date().toISOString().split('T')[0]}.csv`
            },
            { caption: `🎬 Отчёт по генерациям\nВсего: ${generations.length}` }
        );
        
        await ctx.reply('✅ Отчёт готов!', ADMIN_MENU);
    } catch (err) {
        console.error('❌ Error exporting generations:', err);
        console.error('Error details:', err.stack);
        await ctx.reply('❌ Ошибка при экспорте: ' + err.message);
    }
});

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
    try {
        if (!ctx.session) ctx.session = {};
        
        // Поиск пользователя
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
            return;
        }
        
        // Рассылка - шаг 1: получение текста
        if (ctx.session.broadcast && ctx.session.broadcast.step === 'content') {
            ctx.session.broadcast.text = ctx.message.text;
            ctx.session.broadcast.step = 'button_choice';
            
            await ctx.reply(
                '📢 Шаг 2: Добавить кнопку?',
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '✅ Да', callback_data: 'broadcast_add_button' }],
                            [{ text: '⏭️ Нет', callback_data: 'broadcast_skip_button' }],
                            [{ text: '🔙 Отмена', callback_data: 'main_menu' }]
                        ]
                    }
                }
            );
            return;
        }
        
        // Рассылка - текст кнопки
        if (ctx.session.broadcast && ctx.session.broadcast.step === 'button_text') {
            ctx.session.broadcast.buttonText = ctx.message.text;
            ctx.session.broadcast.step = 'button_url';
            
            await ctx.reply(
                '📢 Шаг 3: Отправьте URL для кнопки\n\nПример: https://t.me/your_channel',
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🔙 Отмена', callback_data: 'main_menu' }]
                        ]
                    }
                }
            );
            return;
        }
        
        // Рассылка - URL кнопки
        if (ctx.session.broadcast && ctx.session.broadcast.step === 'button_url') {
            const url = ctx.message.text;
            
            try {
                new URL(url);
                ctx.session.broadcast.buttonUrl = url;
                await showBroadcastPreview(ctx);
            } catch (err) {
                await ctx.reply('❌ Некорректный URL. Попробуйте ещё раз.');
            }
            return;
        }
        
    } catch (err) {
        console.error('❌ Error in text handler:', err);
        await ctx.reply('Произошла ошибка');
    }
});

// Обработка фото
bot.on('photo', async (ctx) => {
    try {
        if (!ctx.session) ctx.session = {};
        
        if (ctx.session.broadcast && ctx.session.broadcast.step === 'content') {
            // Берём лучшее качество фото
            const photo = ctx.message.photo[ctx.message.photo.length - 1];
            const caption = ctx.message.caption || '';
            
            console.log(`📸 Photo received: file_id=${photo.file_id}, caption="${caption}"`);
            
            try {
                // Скачиваем фото через админ-бота
                console.log('⬇️ Downloading photo...');
                const fileLink = await ctx.telegram.getFileLink(photo.file_id);
                const response = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
                const photoBuffer = Buffer.from(response.data);
                
                console.log(`✅ Photo downloaded: ${photoBuffer.length} bytes`);
                
                // Сохраняем Buffer напрямую (не base64!)
                ctx.session.broadcast.photoBuffer = photoBuffer;
                ctx.session.broadcast.text = caption;
                ctx.session.broadcast.step = 'button_choice';
                
                await ctx.reply(
                    '📢 Шаг 2: Добавить кнопку?',
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: '✅ Да', callback_data: 'broadcast_add_button' }],
                                [{ text: '⏭️ Нет', callback_data: 'broadcast_skip_button' }],
                                [{ text: '🔙 Отмена', callback_data: 'main_menu' }]
                            ]
                        }
                    }
                );
            } catch (err) {
                console.error('❌ Error downloading photo:', err);
                await ctx.reply('❌ Ошибка при обработке фото. Попробуйте ещё раз.');
            }
        }
    } catch (err) {
        console.error('❌ Error in photo handler:', err);
        await ctx.reply('Произошла ошибка при обработке фото');
    }
});

// Callback для добавления кнопки
bot.action('broadcast_add_button', async (ctx) => {
    try {
        ctx.session.broadcast.step = 'button_text';
        
        await ctx.editMessageText(
            '📢 Шаг 2: Текст кнопки\n\nОтправьте текст для кнопки\n\nПример: Перейти в канал',
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Отмена', callback_data: 'main_menu' }]
                    ]
                }
            }
        );
    } catch (err) {
        console.error('❌ Error:', err);
    }
});

// Callback для пропуска кнопки
bot.action('broadcast_skip_button', async (ctx) => {
    try {
        await showBroadcastPreview(ctx);
    } catch (err) {
        console.error('❌ Error:', err);
    }
});

// Показ превью и подтверждение рассылки
async function showBroadcastPreview(ctx) {
    try {
        const allUsers = await userService.getAllUsers();
        const broadcast = ctx.session.broadcast;
        
        let message = '📢 Предпросмотр рассылки\n\n';
        message += `👥 Получателей: ${allUsers.length}\n\n`;
        message += '───────────────\n';
        message += broadcast.text || '(фото без подписи)';
        message += '\n───────────────\n\n';
        
        if (broadcast.photoBuffer) {
            message += '📷 С фото: ДА\n';
        }
        
        if (broadcast.buttonText) {
            message += `🔘 Кнопка: "${broadcast.buttonText}"\n`;
            message += `🔗 URL: ${broadcast.buttonUrl}\n`;
        }
        
        message += '\n⚠️ Отправить рассылку?';
        
        await ctx.reply(message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '✅ Да, отправить', callback_data: 'broadcast_confirm' }],
                    [{ text: '🔙 Отмена', callback_data: 'main_menu' }]
                ]
            }
        });
    } catch (err) {
        console.error('❌ Error in preview:', err);
        await ctx.reply('Произошла ошибка');
    }
}

// Подтверждение и отправка рассылки
bot.action('broadcast_confirm', async (ctx) => {
    try {
        if (!ctx.session || !ctx.session.broadcast) {
            await ctx.answerCbQuery('❌ Ошибка: данные рассылки не найдены', { show_alert: true });
            return;
        }

        const allUsers = await userService.getAllUsers();
        const broadcast = ctx.session.broadcast;
        const { text, photoBuffer, buttonText, buttonUrl } = broadcast;
        
        console.log('\n📤 Starting broadcast...');
        console.log(`  Recipients: ${allUsers.length}`);
        console.log(`  Has photo: ${!!photoBuffer}`);
        console.log(`  Has text: ${!!text}`);
        console.log(`  Has button: ${!!buttonText}`);
        
        if (allUsers.length === 0) {
            await ctx.editMessageText('❌ Нет пользователей для рассылки!', ADMIN_MENU);
            return;
        }
        
        await ctx.editMessageText(`📤 Начинаю рассылку ${allUsers.length} пользователям...`);
        
        let success = 0;
        let failed = 0;
        
        // Подготавливаем опции для фото
        const photoOptions = {};
        if (text) {
            photoOptions.caption = text;
            photoOptions.parse_mode = 'HTML';
        }
        if (buttonText && buttonUrl) {
            photoOptions.reply_markup = {
                inline_keyboard: [[{ text: buttonText, url: buttonUrl }]]
            };
        }
        
        // Опции для текста
        const textOptions = { parse_mode: 'HTML' };
        if (buttonText && buttonUrl) {
            textOptions.reply_markup = {
                inline_keyboard: [[{ text: buttonText, url: buttonUrl }]]
            };
        }
        
        // Рассылка
        for (const user of allUsers) {
            try {
                if (!user.userId) {
                    failed++;
                    continue;
                }
                
                if (photoBuffer) {
                    // Отправка с фото используя Buffer
                    await mainBot.telegram.sendPhoto(
                        user.userId, 
                        { source: photoBuffer },
                        photoOptions
                    );
                } else if (text) {
                    // Только текст
                    await mainBot.telegram.sendMessage(user.userId, text, textOptions);
                } else {
                    console.log(`⚠️ Skip user ${user.userId}: no content`);
                    failed++;
                    continue;
                }
                
                success++;
                
                // Задержка 50мс между сообщениями
                await new Promise(resolve => setTimeout(resolve, 50));
                
            } catch (err) {
                failed++;
                console.error(`❌ Failed to send to ${user.userId}: ${err.message}`);
            }
        }
        
        console.log(`✅ Broadcast complete: ${success} sent, ${failed} failed\n`);
        
        await ctx.reply(
            `✅ Рассылка завершена!\n\n✔️ Отправлено: ${success}\n❌ Ошибок: ${failed}`,
            ADMIN_MENU
        );
        
        // Очищаем сессию
        delete ctx.session.broadcast;
        
    } catch (err) {
        console.error('❌ Error in broadcast confirm:', err);
        await ctx.reply('❌ Ошибка при рассылке: ' + err.message);
    }
});

// Обработка неизвестных callback (для отладки)
bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    console.log('⚠️ Unhandled admin callback:', callbackData);
    await ctx.answerCbQuery('Функция в разработке');
});

// Обработка ошибок
bot.catch((err, ctx) => {
    console.error('❌ Admin bot error:', err);
    if (ctx) {
        ctx.reply('Произошла ошибка. Попробуйте позже.')
            .catch(e => console.error('Failed to send error message:', e));
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
