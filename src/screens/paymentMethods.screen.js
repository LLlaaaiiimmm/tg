import 'dotenv/config';
import { sendOrEdit } from '../utils/media.js';

const keyboard = [
    [{ text: '💳 Оплатить картой', command: 'pay_card' }],
    [{ text: '💰 Оплатить криптой', command: 'pay_crypto' }],
    [{ text: '❓ Задать вопрос', command: 'ask_question' }],
    [{ text: '⏪ Вернуться назад', command: 'back' }],
];

export const paymentMethodsScreen = async (ctx, editMessage) => {
    const message = `Выберите удобный способ оплаты
  
* Если вы находитесь в стране с ограниченным доступом, включите VPN.`;

    const reply_markup = {
        inline_keyboard: keyboard.map((row) =>
            row.map((item) => {
                if (item.command === 'ask_question') {
                    return {
                        text: item.text,
                        url: `https://t.me/${process.env.SUPPORT_USERNAME}`,
                    };
                }
                return {
                    text: item.text,
                    callback_data: JSON.stringify({ command: item.command }),
                };
            }),
        ),
    };

    if (!ctx?.chat?.id) return;

    await sendOrEdit(ctx, {
        editMessage,
        text: message,
        reply_markup,
        photoCandidates: ['src/data/paymentMethods.jpg'],
        parse_mode: 'HTML',
        disable_web_page_preview: true,
    });
};
