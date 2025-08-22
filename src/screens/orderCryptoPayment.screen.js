import 'dotenv/config';
import {ERROR_PAYMENT_IS_LESS_THEN_MINIMUM, GLOBAL_CONFIG, PAY_ORDER_CRYPTO} from "../config.js";

const reply_markup = {
    inline_keyboard: [
        [ { text: '🔄 Проверить оплату', callback_data: JSON.stringify({ command: 'check_is_payment_completed' }) } ],
        [ { text: '⏪ Вернуться назад', callback_data: JSON.stringify({ command: 'back' }) } ],
    ],
};

export const orderCryptoPaymentScreenHandler = async (ctx, initialState, editMessage) => {
    const network = Object.values(GLOBAL_CONFIG.supportedCrypto)
        .flat()
        .find(chainObj => chainObj.processing === initialState.order.input.currency)
        .chainName;

    if (initialState.order.output.minimumAmount > initialState.order.input.amountUSD) {
        await ctx.telegram.sendMessage(ctx?.chat?.id, ERROR_PAYMENT_IS_LESS_THEN_MINIMUM, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
        });
    } else {
        const textOrder = PAY_ORDER_CRYPTO(
            initialState.order.input.amount,
            initialState.order.input.currency,
            network,
            initialState.order.output.address,
            initialState.order.output.destinationTag,
        );

        if (ctx?.chat?.id !== undefined) {
            if (!editMessage) {
                return await ctx.telegram.sendMessage(ctx?.chat?.id, textOrder, {
                    parse_mode: "HTML",
                    disable_web_page_preview: true,
                    reply_markup,
                });
            } else {
                return await ctx.telegram.editMessageText(
                    ctx?.chat?.id,
                    ctx?.callbackQuery?.message?.message_id,
                    undefined,
                    textOrder,
                    {
                        parse_mode: "HTML",
                        disable_web_page_preview: true,
                        reply_markup,
                    }
                )
            }
        }
    }
}