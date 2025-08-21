import 'dotenv/config';

const keyboard = [
  [
    { text: '🤗 Посмотреть весь урок', command: 'lesson_link' },
  ],
  [
    { text: '⏪ Вернуться назад', command: 'back' },
  ],
];

export const freeLessonScreen = async (ctx, editMessage) => {
  const message = `💰Секреты агентства: как мы продаём AI-видео бизнесу делая от 5К$ в месяц?
  Чтобы посмотреть видео полностью.
  Нажми "Посмотреть весь урок"`;

  const reply_markup = {
    inline_keyboard: keyboard.map((row) =>
      row.map((item) => {
        if (item.command === 'lesson_link') {
          return { text: item.text, url: process.env.FREE_LESSON_URL };
        }
        return {
          text: item.text,
          callback_data: JSON.stringify({ command: item.command }),
        };
      })
    ),
  };

  if (!ctx?.chat?.id) return;

  if (!editMessage) {
    await ctx.telegram.sendMessage(ctx.chat.id, message, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup,
    });
  } else {
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      ctx.callbackQuery?.message?.message_id,
      undefined,
      message,
      {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup,
      }
    );
  }
};
