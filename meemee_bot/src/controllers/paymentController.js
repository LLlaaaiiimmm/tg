import { MESSAGES, PACKAGES, SUPPORTED_CRYPTO, REFERRAL_ENABLED, REFERRAL_TYPE_KEYBOARD, ABOUT_KEYBOARD } from '../config.js';
import { createCryptoKeyboard, createChainKeyboard, createPaymentCryptoKeyboard, createAfterPaymentKeyboard } from '../screens/keyboards.js';
import { PaymentCryptoService } from '../services/PaymentCrypto.service.js';
import { PaymentFiatService } from '../services/PaymentFiat.service.js';
import { UserService } from '../services/User.service.js';
import { OrderService } from '../services/Order.service.js';
import { ReferralService } from '../services/Referral.service.js';
import { GenerationService } from '../services/Generation.service.js';

const paymentCryptoService = new PaymentCryptoService();
const paymentFiatService = new PaymentFiatService();
const userService = new UserService();
const orderService = new OrderService();
const referralService = new ReferralService();
const generationService = new GenerationService();

// Обработчик "Купить видео"
export async function handleBuy(ctx) {
    try {
        // Создаём кнопки для всех пакетов
        const packageButtons = Object.keys(PACKAGES).map(key => {
            const pkg = PACKAGES[key];
            const discount = pkg.discount ? ` 🔥 -${pkg.discount}` : '';
            return [{
                text: `${pkg.emoji} ${pkg.title} - ${pkg.rub}₽${discount}`,
                callback_data: `select_package_${key}`
            }];
        });
        
        await ctx.editMessageText(MESSAGES.CHOOSE_PACKAGE, {
            reply_markup: {
                inline_keyboard: [
                    ...packageButtons,
                    [{ text: '🔙 Назад', callback_data: 'main_menu' }]
                ]
            }
        });
    } catch (err) {
        console.error('❌ Error in handleBuy:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Обработчик выбора пакета
export async function handleSelectPackage(ctx, packageKey) {
    try {
        const pkg = PACKAGES[packageKey];
        if (!pkg) {
            return await ctx.answerCbQuery('Пакет не найден', { show_alert: true });
        }
        
        // Сохраняем выбранный пакет в сессии
        ctx.session = ctx.session || {};
        ctx.session.selectedPackage = packageKey;
        
        let message = `${pkg.emoji} ${pkg.title}\n\n`;
        message += `💎 Генераций: ${pkg.generations}\n`;
        message += `💰 Цена: ${pkg.rub}₽ / ${pkg.usdt} USDT\n`;
        if (pkg.discount) {
            message += `🔥 Скидка: ${pkg.discount}\n`;
        }
        const pricePerVideo = (pkg.rub / pkg.generations).toFixed(2);
        message += `\n📊 Цена за 1 видео: ${pricePerVideo}₽\n\n`;
        message += `Выберите способ оплаты:`;
        
        await ctx.editMessageText(message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '💵 Карта', callback_data: `pay_card_${packageKey}` }],
                    [{ text: '💎 Крипта', callback_data: `pay_crypto_${packageKey}` }],
                    [{ text: '⭐ Stars (скоро)', callback_data: 'pay_stars_soon' }],
                    [{ text: '🔙 Назад', callback_data: 'buy' }]
                ]
            }
        });
    } catch (err) {
        console.error('❌ Error in handleSelectPackage:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Обработчик оплаты картой
export async function handlePayCard(ctx, packageKey = 'single') {
    try {
        ctx.session = ctx.session || {};
        ctx.session.waitingFor = 'email';
        ctx.session.selectedPackage = packageKey;
        
        const pkg = PACKAGES[packageKey];
        
        await ctx.editMessageText(
            `💳 Оплата картой\n\n${pkg.emoji} ${pkg.title}: ${pkg.rub}₽\n\n📧 Пожалуйста, введите ваш email для отправки чека:`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Назад', callback_data: `select_package_${packageKey}` }]
                    ]
                }
            }
        );
    } catch (err) {
        console.error('❌ Error in handlePayCard:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Обработчик оплаты криптой
export async function handlePayCrypto(ctx, packageKey = 'single') {
    try {
        ctx.session = ctx.session || {};
        ctx.session.selectedPackage = packageKey;
        
        const pkg = PACKAGES[packageKey];
        const keyboard = createCryptoKeyboard(packageKey);
        
        await ctx.editMessageText(
            `💎 Оплата криптовалютой\n\n${pkg.emoji} ${pkg.title}: ${pkg.usdt} USDT\n\nВыберите криптовалюту:`,
            { reply_markup: keyboard }
        );
    } catch (err) {
        console.error('❌ Error in handlePayCrypto:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Обработчик выбора криптовалюты
export async function handleCryptoSelect(ctx, crypto, packageKey = 'single') {
    try {
        const chains = SUPPORTED_CRYPTO[crypto];
        if (!chains || chains.length === 0) {
            return await ctx.answerCbQuery('Эта криптовалюта временно недоступна');
        }
        
        ctx.session = ctx.session || {};
        ctx.session.selectedPackage = packageKey;
        
        const pkg = PACKAGES[packageKey];
        const keyboard = createChainKeyboard(crypto, chains, packageKey);
        
        await ctx.editMessageText(
            `${pkg.emoji} ${pkg.title}: ${pkg.usdt} USDT\n\nВыберите сеть для ${crypto}:`,
            { reply_markup: keyboard }
        );
    } catch (err) {
        console.error('❌ Error in handleCryptoSelect:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Обработчик выбора сети
export async function handleChainSelect(ctx, crypto, chain, packageKey = 'single') {
    try {
        const userId = ctx.from.id;
        const payCurrency = chain.replace(/_/g, ' ');
        const pkg = PACKAGES[packageKey];
        
        // Создаём платёж
        const payment = await paymentCryptoService.createPayment({
            userId,
            amount: pkg.usdt,
            payCurrency,
            package: packageKey
        });
        
        if (payment.error) {
            return await ctx.answerCbQuery(payment.error, { show_alert: true });
        }
        
        const { address, amount, destinationTag } = payment.output;
        
        let message = `${pkg.emoji} ${pkg.title}\n\n`;
        message += `💎 Отправьте <code>${amount}</code> ${crypto}\n\n`;
        message += `📍 На адрес:\n<code>${address}</code>\n\n`;
        
        if (destinationTag) {
            message += `🏷️ Memo/Tag: <code>${destinationTag}</code>\n⚠️ ТЕГ ОБЯЗАТЕЛЕН!\n\n`;
        }
        
        message += `⏰ У вас есть 30 минут для оплаты\n`;
        message += `💡 Нажмите на адрес, чтобы скопировать`;
        
        const keyboard = createPaymentCryptoKeyboard(payment.orderId);
        
        await ctx.editMessageText(message, {
            parse_mode: 'HTML',
            reply_markup: keyboard.inline_keyboard
        });
    } catch (err) {
        console.error('❌ Error in handleChainSelect:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Проверка статуса платежа
export async function handleCheckPayment(ctx, orderId) {
    try {
        const order = await orderService.getOrderById(orderId);
        
        if (!order) {
            return await ctx.answerCbQuery('Заказ не найден', { show_alert: true });
        }
        
        if (order.isPaid) {
            return await ctx.answerCbQuery('Этот заказ уже оплачен!', { show_alert: true });
        }
        
        // В реальности здесь должна быть проверка через API
        // Пока просто сообщаем, что проверяем
        await ctx.answerCbQuery('⏳ Проверяем транзакцию...');
        
    } catch (err) {
        console.error('❌ Error in handleCheckPayment:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Обработчик успешного платежа (вызывается из webhook)
export async function handlePaymentSuccess(bot, orderId) {
    try {
        const order = await orderService.getOrderById(orderId);
        if (!order) return;
        
        // Отмечаем заказ как оплаченный
        await orderService.markAsPaid(orderId);
        
        // Добавляем генерации пользователю
        const pkg = PACKAGES[order.package];
        await userService.addPaidQuota(order.userId, pkg.generations);
        
        // Обрабатываем реферальный кешбэк для эксперта
        const cashbackResult = await referralService.processExpertCashback(order.userId, order.amount);
        
        // Если был начислен кешбек, уведомляем эксперта
        if (cashbackResult) {
            try {
                await bot.telegram.sendMessage(
                    cashbackResult.expertId,
                    `💰 Новый кешбек!\n\nВаш реферал совершил покупку.\n\n` +
                    `💵 Сумма покупки: ${cashbackResult.originalAmount}₽\n` +
                    `🎁 Ваш кешбек (${cashbackResult.percent}%): ${cashbackResult.amount.toFixed(2)}₽\n\n` +
                    `📊 Общий заработок: ${(await userService.getUser(cashbackResult.expertId))?.totalCashback?.toFixed(2) || 0}₽`
                );
            } catch (notifyErr) {
                console.log(`Failed to notify expert ${cashbackResult.expertId}:`, notifyErr.message);
            }
        }
        
        // Отправляем уведомление пользователю
        const keyboard = createAfterPaymentKeyboard();
        await bot.telegram.sendMessage(
            order.userId,
            MESSAGES.PAYMENT_SUCCESS,
            { reply_markup: keyboard.inline_keyboard }
        );
        
        console.log(`✅ Payment ${orderId} processed successfully`);
    } catch (err) {
        console.error('❌ Error in handlePaymentSuccess:', err);
    }
}

// Обработчик "О проекте"
export async function handleAbout(ctx) {
    try {
        await ctx.editMessageText(MESSAGES.ABOUT, { reply_markup: ABOUT_KEYBOARD });
    } catch (err) {
        console.error('❌ Error in handleAbout:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Обработчик реферальной программы
export async function handleReferral(ctx) {
    try {
        if (!REFERRAL_ENABLED) {
            return await ctx.answerCbQuery('⏳ Реферальная программа скоро будет доступна!', { show_alert: true });
        }
        
        await ctx.editMessageText(
            '🎁 Приведи друга за бонус\n\nВыберите тип реферальной ссылки:',
            { reply_markup: REFERRAL_TYPE_KEYBOARD }
        );
    } catch (err) {
        console.error('❌ Error in handleReferral:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Обработчик пользовательской реферальной ссылки
export async function handleRefUser(ctx) {
    try {
        const userId = ctx.from.id;
        const botName = process.env.BOT_NAME || 'meemee_bot';
        const refLink = referralService.generateUserReferralLink(userId, botName);
        
        await ctx.editMessageText(
            MESSAGES.REFERRAL_INFO + `\n\n${refLink}`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📤 Поделиться', url: `https://t.me/share/url?url=${encodeURIComponent(refLink)}` }],
                        [{ text: '🔙 Назад', callback_data: 'referral' }]
                    ]
                }
            }
        );
    } catch (err) {
        console.error('❌ Error in handleRefUser:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Обработчик экспертной реферальной ссылки
export async function handleRefExpert(ctx) {
    try {
        const userId = ctx.from.id;
        const botName = process.env.BOT_NAME || 'meemee_bot';
        const refLink = referralService.generateExpertReferralLink(userId, botName);
        
        const stats = await referralService.getReferralStats(userId);
        
        // Импортируем процент из конфига
        const { EXPERT_CASHBACK_PERCENT } = await import('../config.js');
        
        let message = MESSAGES.EXPERT_REFERRAL_INFO(EXPERT_CASHBACK_PERCENT) + `\n\n${refLink}\n\n`;
        message += `📊 Статистика:\n`;
        message += `👥 Приглашено: ${stats.expertReferrals}\n`;
        message += `💰 Заработано: ${stats.totalCashback?.toFixed(2) || 0}₽`;
        
        await ctx.editMessageText(
            message,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '📤 Поделиться', url: `https://t.me/share/url?url=${encodeURIComponent(refLink)}` }],
                        [{ text: '🔙 Назад', callback_data: 'referral' }]
                    ]
                }
            }
        );
    } catch (err) {
        console.error('❌ Error in handleRefExpert:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Обработчик Stars (заглушка)
export async function handlePayStarsSoon(ctx) {
    await ctx.answerCbQuery('⭐ Telegram Stars скоро будут доступны!', { show_alert: true });
}

// Обработчик личного кабинета
export async function handleProfile(ctx) {
    try {
        const userId = ctx.from.id;
        const user = await userService.getUser(userId);
        const generations = await generationService.getUserGenerations(userId);
        const referralStats = await referralService.getReferralStats(userId);
        
        if (!user) {
            return await ctx.answerCbQuery('Ошибка загрузки профиля', { show_alert: true });
        }
        
        const message = MESSAGES.PROFILE(user, generations, referralStats);
        
        await ctx.editMessageText(message, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📜 История генераций', callback_data: 'profile_history' }],
                    [{ text: '💳 Купить видео', callback_data: 'buy' }],
                    [{ text: '🔙 Главное меню', callback_data: 'main_menu' }]
                ]
            }
        });
    } catch (err) {
        console.error('❌ Error in handleProfile:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Обработчик истории генераций
export async function handleProfileHistory(ctx) {
    try {
        const userId = ctx.from.id;
        const generations = await generationService.getUserGenerations(userId);
        
        if (!generations || generations.length === 0) {
            return await ctx.editMessageText(
                '📜 История генераций пуста\n\nВы ещё не создали ни одного видео.',
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🎬 Создать видео', callback_data: 'catalog' }],
                            [{ text: '🔙 Назад', callback_data: 'profile' }]
                        ]
                    }
                }
            );
        }
        
        let message = '📜 История генераций:\n\n';
        
        generations.forEach((gen, idx) => {
            const statusEmoji = gen.status === 'done' ? '✅' : gen.status === 'failed' ? '❌' : gen.status === 'processing' ? '⏳' : '🕐';
            const date = new Date(gen.createdAt).toLocaleString('ru-RU');
            message += `${idx + 1}. ${statusEmoji} ${gen.memeName}\n`;
            message += `   👤 Имя: ${gen.name} (${gen.gender === 'male' ? 'М' : 'Ж'})\n`;
            message += `   📅 ${date}\n`;
            
            if (gen.status === 'failed' && gen.error) {
                message += `   ⚠️ Ошибка: ${gen.error}\n`;
            }
            message += '\n';
        });
        
        // Создаём кнопки для пагинации если много генераций
        const keyboard = {
            inline_keyboard: [
                [{ text: '🔙 Назад в профиль', callback_data: 'profile' }],
                [{ text: '🏠 Главное меню', callback_data: 'main_menu' }]
            ]
        };
        
        await ctx.editMessageText(message, { reply_markup: keyboard });
    } catch (err) {
        console.error('❌ Error in handleProfileHistory:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}
