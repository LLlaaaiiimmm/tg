import { MESSAGES, PACKAGES, SUPPORTED_CRYPTO, REFERRAL_ENABLED, REFERRAL_TYPE_KEYBOARD, ABOUT_KEYBOARD } from '../config.js';
import { createCryptoKeyboard, createChainKeyboard, createPaymentCryptoKeyboard, createAfterPaymentKeyboard } from '../screens/keyboards.js';
import { PaymentCryptoService } from '../services/PaymentCrypto.service.js';
import { PaymentFiatService } from '../services/PaymentFiat.service.js';
import { UserService } from '../services/User.service.js';
import { OrderService } from '../services/Order.service.js';
import { ReferralService } from '../services/Referral.service.js';

const paymentCryptoService = new PaymentCryptoService();
const paymentFiatService = new PaymentFiatService();
const userService = new UserService();
const orderService = new OrderService();
const referralService = new ReferralService();

// Обработчик "Купить видео"
export async function handleBuy(ctx) {
    try {
        await ctx.editMessageText(MESSAGES.CHOOSE_PAYMENT, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '💵 Карта', callback_data: 'pay_card' }],
                    [{ text: '💎 Крипта', callback_data: 'pay_crypto' }],
                    [{ text: '⭐ Stars (скоро)', callback_data: 'pay_stars_soon' }],
                    [{ text: '🔙 Назад', callback_data: 'main_menu' }]
                ]
            }
        });
    } catch (err) {
        console.error('❌ Error in handleBuy:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Обработчик оплаты картой
export async function handlePayCard(ctx) {
    try {
        ctx.session = ctx.session || {};
        ctx.session.waitingFor = 'email';
        
        await ctx.editMessageText(
            '📧 Пожалуйста, введите ваш email для отправки чека:',
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🔙 Назад', callback_data: 'buy' }]
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
export async function handlePayCrypto(ctx) {
    try {
        const keyboard = createCryptoKeyboard();
        await ctx.editMessageText('💎 Выберите криптовалюту:', { reply_markup: keyboard });
    } catch (err) {
        console.error('❌ Error in handlePayCrypto:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Обработчик выбора криптовалюты
export async function handleCryptoSelect(ctx, crypto) {
    try {
        const chains = SUPPORTED_CRYPTO[crypto];
        if (!chains || chains.length === 0) {
            return await ctx.answerCbQuery('Эта криптовалюта временно недоступна');
        }
        
        const keyboard = createChainKeyboard(crypto, chains);
        await ctx.editMessageText(`Выберите сеть для ${crypto}:`, { reply_markup: keyboard });
    } catch (err) {
        console.error('❌ Error in handleCryptoSelect:', err);
        await ctx.answerCbQuery('Произошла ошибка');
    }
}

// Обработчик выбора сети
export async function handleChainSelect(ctx, crypto, chain) {
    try {
        const userId = ctx.from.id;
        const payCurrency = chain.replace(/_/g, ' ');
        
        // Создаём платёж
        const payment = await paymentCryptoService.createPayment({
            userId,
            amount: PACKAGES.single.usdt,
            payCurrency,
            package: 'single'
        });
        
        if (payment.error) {
            return await ctx.answerCbQuery(payment.error, { show_alert: true });
        }
        
        const { address, amount, destinationTag } = payment.output;
        
        let message = `💎 Отправьте <code>${amount}</code> ${crypto}\n\n`;
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
        await referralService.processExpertCashback(order.userId, order.amount);
        
        // Отправляем уведомление пользователю
        const keyboard = createAfterPaymentKeyboard();
        await bot.telegram.sendMessage(
            order.userId,
            MESSAGES.PAYMENT_SUCCESS,
            { reply_markup: keyboard }
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
        
        let message = MESSAGES.EXPERT_REFERRAL_INFO(50) + `\n\n${refLink}\n\n`;
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
