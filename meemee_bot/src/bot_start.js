import 'dotenv/config';
import { Telegraf, Scenes, session } from 'telegraf';
import { UserService } from './services/User.service.js';
import { OrderService } from './services/Order.service.js';
import { PaymentCryptoService } from './services/PaymentCrypto.service.js';
import { PaymentFiatService } from './services/PaymentFiat.service.js';
import { GenerationService } from './services/Generation.service.js';
import { ReferralService } from './services/Referral.service.js';
import { MESSAGES, KEYBOARDS, PACKAGES, SUPPORTED_CRYPTO, REFERRAL_ENABLED } from './config.js';
import { 
    createCatalogKeyboard, 
    createCryptoKeyboard, 
    createChainKeyboard,
    createPaymentCryptoKeyboard,
    createAfterPaymentKeyboard 
} from './screens/keyboards.js';
import { getMemeById } from './utils/memeLoader.js';

// Проверка токена бота
if (!process.env.BOT_TOKEN) {
    console.error('❌ BOT_TOKEN not found in .env file');
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);
const userService = new UserService();
const orderService = new OrderService();
const paymentCryptoService = new PaymentCryptoService();
const paymentFiatService = new PaymentFiatService();
const generationService = new GenerationService();
const referralService = new ReferralService();

// Session middleware
bot.use(session());

// Middleware для логирования
bot.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    console.log(`⏱️ Response time: ${ms}ms`);
});

// Обработка команды /start
bot.start(async (ctx) => {
    try {
        const userId = ctx.from.id;
        const startPayload = ctx.startPayload;

        // Обработка реферальных ссылок
        if (startPayload) {
            if (startPayload.startsWith('ref_')) {
                const referrerId = parseInt(startPayload.replace('ref_', ''));
                await referralService.processUserReferral(referrerId, userId);
            } else if (startPayload.startsWith('expert_')) {
                const expertId = parseInt(startPayload.replace('expert_', ''));
                await referralService.processExpertReferral(expertId, userId);
            }
        }

        // Создание пользователя
        await userService.createUser(ctx.from, startPayload);

        // Отправка приветственного сообщения
        await ctx.reply(MESSAGES.WELCOME, { reply_markup: KEYBOARDS.MAIN_MENU });
    } catch (err) {
        console.error('❌ Error in /start:', err);
        await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
});

// Обработка главного меню
bot.action('main_menu', async (ctx) => {
    try {
        await ctx.editMessageText(MESSAGES.WELCOME, { reply_markup: KEYBOARDS.MAIN_MENU });
    } catch (err) {
        await ctx.reply(MESSAGES.WELCOME, { reply_markup: KEYBOARDS.MAIN_MENU });
    }
});

// Обработка каталога мемов
bot.action(/catalog.*/, async (ctx) => {
    try {
        const callbackData = ctx.callbackQuery.data;
        let page = 0;
        
        if (callbackData.includes('catalog_page_')) {
            page = parseInt(callbackData.replace('catalog_page_', ''));
        }
        
        const keyboard = createCatalogKeyboard(page);
        await ctx.editMessageText(MESSAGES.MEMES_CATALOG, { reply_markup: keyboard });
    } catch (err) {
        console.error('❌ Error in catalog:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
});

// Обработка выбора мема
bot.action(/meme_(.+)/, async (ctx) => {
    try {
        const memeId = ctx.match[1];
        const meme = getMemeById(memeId);
        
        if (!meme) {
            return await ctx.answerCbQuery('Мем не найден');
        }
        
        if (meme.status === 'soon') {
            return await ctx.answerCbQuery(MESSAGES.MEME_SOON, { show_alert: true });
        }
        
        // Проверка квоты
        const userId = ctx.from.id;
        const hasQuota = await userService.hasQuota(userId);
        
        if (!hasQuota) {
            await ctx.editMessageText(MESSAGES.NO_QUOTA, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '💳 Купить видео', callback_data: 'buy' }],
                        [{ text: '🔙 Назад', callback_data: 'catalog' }]
                    ]
                }
            });
            return;
        }
        
        // Сохраняем выбранный мем в контексте (для дальнейших шагов)
        ctx.session = ctx.session || {};
        ctx.session.selectedMeme = memeId;
        
        // Запрашиваем имя
        await ctx.editMessageText(MESSAGES.ENTER_NAME, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🔙 Назад', callback_data: 'catalog' }]
                ]
            }
        });
        
        // Устанавливаем флаг ожидания ввода имени
        ctx.session.waitingFor = 'name';
        ctx.session.memeId = memeId;
        
    } catch (err) {
        console.error('❌ Error selecting meme:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
});

// Обработка текстовых сообщений (ввод имени)
bot.on('text', async (ctx) => {
    try {
        ctx.session = ctx.session || {};
        
        if (ctx.session.waitingFor === 'name') {
            const name = ctx.message.text.trim();
            
            // Валидация имени
            if (name.length < 2 || name.length > 30) {
                return await ctx.reply('❌ Имя должно быть от 2 до 30 символов. Попробуйте ещё раз.');
            }
            
            // Проверка на маты и запрещённые слова
            const badWords = [
                'хуй', 'пизд', 'ебл', 'ебан', 'ебат', 'бля', 'сука', 'уеб', 
                'мудак', 'мудил', 'гандон', 'педик', 'пидор', 'хер', 'манда',
                'шлюха', 'блядь', 'ублюдок', 'долбоеб', 'говно', 'жопа',
                'fuck', 'shit', 'bitch', 'ass', 'dick', 'cunt', 'whore'
            ];
            const hasBadWords = badWords.some(word => name.toLowerCase().includes(word));
            
            if (hasBadWords) {
                return await ctx.reply('❌ Пожалуйста, используйте корректное имя без оскорблений.');
            }
            
            // Сохраняем имя и запрашиваем пол
            ctx.session.generationName = name;
            ctx.session.waitingFor = 'gender';
            
            await ctx.reply(MESSAGES.CHOOSE_GENDER, { reply_markup: KEYBOARDS.GENDER_CHOICE });
            
        } else if (ctx.session.waitingFor === 'email') {
            // Обработка ввода email для оплаты картой
            const email = ctx.message.text.trim();
            
            // Простая валидация email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return await ctx.reply('❌ Некорректный email. Попробуйте ещё раз.');
            }
            
            const packageKey = ctx.session.selectedPackage || 'single';
            const pkg = PACKAGES[packageKey];
            
            ctx.session.email = email;
            delete ctx.session.waitingFor;
            
            // Создаём платёж через Lava
            const payment = await paymentFiatService.createPayment({
                userId: ctx.from.id,
                email: email,
                amount: pkg.rub,
                bank: 'BANK131',
                package: packageKey
            });
            
            if (payment.error) {
                return await ctx.reply('❌ Ошибка создания платежа: ' + payment.error);
            }
            
            await ctx.reply(
                `💳 Оплата картой\n\n${pkg.emoji} ${pkg.title}\nСумма: ${pkg.rub}₽\n\nУ вас есть 1 час для завершения оплаты!`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '💳 Перейти к оплате', url: payment.output.url }],
                            [{ text: '🔙 Назад', callback_data: 'buy' }]
                        ]
                    }
                }
            );
        }
    } catch (err) {
        console.error('❌ Error in text handler:', err);
        await ctx.reply('Произошла ошибка. Попробуйте позже.');
    }
});

// Обработка выбора пола
bot.action(/gender_(male|female)/, async (ctx) => {
    try {
        ctx.session = ctx.session || {};
        const gender = ctx.match[1];
        ctx.session.generationGender = gender;
        
        const name = ctx.session.generationName;
        const genderText = gender === 'male' ? 'Мальчик' : 'Девочка';
        
        await ctx.editMessageText(
            MESSAGES.CONFIRM_GENERATION(name, gender),
            { reply_markup: KEYBOARDS.CONFIRM_GENERATION }
        );
    } catch (err) {
        console.error('❌ Error in gender selection:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
});

// Подтверждение генерации
bot.action('confirm_gen', async (ctx) => {
    try {
        const userId = ctx.from.id;
        const memeId = ctx.session.memeId;
        const name = ctx.session.generationName;
        const gender = ctx.session.generationGender;
        
        // Списываем квоту
        const deducted = await userService.deductQuota(userId);
        if (!deducted) {
            return await ctx.answerCbQuery('Недостаточно генераций', { show_alert: true });
        }
        
        // Создаём генерацию
        const generation = await generationService.createGeneration({
            userId,
            memeId,
            name,
            gender
        });
        
        if (generation.error) {
            // Возвращаем квоту при ошибке
            await userService.refundQuota(userId);
            return await ctx.answerCbQuery('Ошибка создания генерации', { show_alert: true });
        }
        
        await ctx.editMessageText(MESSAGES.GENERATION_STARTED);
        
        // Ожидаем завершения генерации
        await waitForGeneration(ctx, generation.generationId);
        
        // Очищаем сессию
        delete ctx.session.memeId;
        delete ctx.session.generationName;
        delete ctx.session.generationGender;
        delete ctx.session.waitingFor;
        
    } catch (err) {
        console.error('❌ Error confirming generation:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
});

// Функция ожидания завершения генерации
async function waitForGeneration(ctx, generationId, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Проверяем каждые 3 секунды
        
        const generation = await generationService.getGeneration(generationId);
        
        if (generation.status === 'done' && generation.videoUrl) {
            try {
                await ctx.replyWithVideo(
                    { url: generation.videoUrl },
                    { caption: MESSAGES.GENERATION_SUCCESS }
                );
            } catch (err) {
                await ctx.reply(
                    MESSAGES.GENERATION_SUCCESS + '\n\nСсылка на видео: ' + generation.videoUrl
                );
            }
            return;
        } else if (generation.status === 'failed') {
            // Возвращаем квоту
            await userService.refundQuota(ctx.from.id);
            await ctx.reply(MESSAGES.GENERATION_FAILED);
            return;
        }
    }
    
    // Timeout
    await ctx.reply('⏰ Генерация занимает больше времени. Мы отправим вам видео, когда оно будет готово.');
}

// Импорт контроллеров платежей
import * as paymentController from './controllers/paymentController.js';

// Обработка кнопки "Купить видео"
bot.action('buy', (ctx) => paymentController.handleBuy(ctx));

// Обработка выбора пакета
bot.action(/select_package_(.+)/, (ctx) => {
    const packageKey = ctx.match[1];
    paymentController.handleSelectPackage(ctx, packageKey);
});

// Обработка кнопки "О проекте"
bot.action('about', (ctx) => paymentController.handleAbout(ctx));

// Обработка личного кабинета
bot.action('profile', (ctx) => paymentController.handleProfile(ctx));
bot.action('profile_history', (ctx) => paymentController.handleProfileHistory(ctx));

// Обработка реферальной программы
bot.action('referral', (ctx) => paymentController.handleReferral(ctx));
bot.action('ref_user', (ctx) => paymentController.handleRefUser(ctx));
bot.action('ref_expert', (ctx) => paymentController.handleRefExpert(ctx));

// Обработка оплаты
bot.action(/pay_card_(.+)/, (ctx) => {
    const packageKey = ctx.match[1];
    paymentController.handlePayCard(ctx, packageKey);
});
bot.action(/pay_crypto_(.+)/, (ctx) => {
    const packageKey = ctx.match[1];
    paymentController.handlePayCrypto(ctx, packageKey);
});
bot.action('pay_stars', (ctx) => paymentController.handlePayStarsSoon(ctx));

// Обработка выбора криптовалюты
bot.action(/crypto_(\w+)_(.+)/, (ctx) => {
    const crypto = ctx.match[1];
    const packageKey = ctx.match[2];
    paymentController.handleCryptoSelect(ctx, crypto, packageKey);
});

// Обработка выбора сети
bot.action(/chain_(\w+)_(.+)_(.+)/, (ctx) => {
    const crypto = ctx.match[1];
    const chain = ctx.match[2];
    const packageKey = ctx.match[3];
    paymentController.handleChainSelect(ctx, crypto, chain, packageKey);
});

// Обработка проверки платежа
bot.action(/check_payment_(.+)/, (ctx) => {
    const orderId = ctx.match[1];
    paymentController.handleCheckPayment(ctx, orderId);
});

// Обработка неизвестных callback (для отладки)
bot.on('callback_query', async (ctx) => {
    const callbackData = ctx.callbackQuery.data;
    console.log('⚠️ Unhandled callback:', callbackData);
    await ctx.answerCbQuery('Функция в разработке');
});

// Обработка ошибок
bot.catch((err, ctx) => {
    console.error('❌ Bot error:', err);
    if (ctx) {
        ctx.reply('Произошла ошибка. Попробуйте позже или обратитесь в поддержку.')
            .catch(e => console.error('Failed to send error message:', e));
    }
});

// Запуск бота
bot.launch()
    .then(() => {
        console.log('✅ MeeMee bot started successfully!');
        console.log(`Bot username: @${bot.botInfo.username}`);
    })
    .catch(err => {
        console.error('❌ Failed to start bot:', err);
        process.exit(1);
    });

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
