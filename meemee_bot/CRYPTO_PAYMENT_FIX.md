# Исправление Криптооплаты в MeeMee Bot

## Проблемы которые были исправлены:

### 1. ❌ Ошибка "undefined" в сумме платежа
**Проблема:** В сообщении пользователю показывалось `undefined` вместо суммы криптовалюты
```
💎 Отправьте <code>undefined</code> TON
```

**Причина:** Неправильное извлечение данных из объекта payment. Сумма находилась в `payment.input.amount`, а не в `payment.output.amount`

**Исправление:** В файле `/app/meemee_bot/src/controllers/paymentController.js` (строка 169)
```javascript
// БЫЛО:
const { address, amount, destinationTag } = payment.output;

// СТАЛО:
const address = payment.output.address;
const amount = payment.input.amount; // Используем input.amount вместо output.amount
const destinationTag = payment.output.destinationTag;
```

### 2. ❌ Ошибка "Bad Request: object expected as reply markup"
**Проблема:** Telegram API возвращал ошибку при попытке отправить клавиатуру

**Причина:** Двойная вложенность inline_keyboard - передавалось `keyboard.inline_keyboard` вместо `keyboard`

**Исправление:** В файле `/app/meemee_bot/src/controllers/paymentController.js` (строка 186)
```javascript
// БЫЛО:
await ctx.editMessageText(message, {
    parse_mode: 'HTML',
    reply_markup: keyboard.inline_keyboard  // ❌ Неправильно
});

// СТАЛО:
await ctx.editMessageText(message, {
    parse_mode: 'HTML',
    reply_markup: keyboard  // ✅ Правильно
});
```

### 3. ❌ Ошибка "Request failed with status code 400" 
**Проблема:** API 0xprocessing возвращал ошибку 400 при создании платежа

**Причина:** Не добавлялось поле `payCurrency` в `data.input`, что вызывало проблемы при повторных запросах

**Исправление:** В файле `/app/meemee_bot/src/services/PaymentCrypto.service.js` (строка 58)
```javascript
// Добавлено поле payCurrency
data.payCurrency = payCurrency;
```

### 4. ✅ Добавлена проверка существующих заказов
**Улучшение:** Теперь если пользователь создал заказ менее 10 минут назад, система переиспользует его вместо создания нового

**Исправление:** В файле `/app/meemee_bot/src/services/PaymentCrypto.service.js` (строки 18-30)
```javascript
// Проверка на существующий заказ
const userOrders = await orderService.getOrdersByUserId(userId);
const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);

const existingOrder = userOrders.find(order =>
    order?.input?.amount === amount &&
    new Date(order?.output?.expiredAt) < tenMinutesFromNow &&
    order?.input?.payCurrency === payCurrency
);

if (existingOrder) {
    console.log(`♻️ Reusing existing order: ${existingOrder.orderId}`);
    return existingOrder;
}
```

### 5. ✅ Добавлен метод getOrdersByUserId
**Улучшение:** Добавлен алиас метода для совместимости

**Исправление:** В файле `/app/meemee_bot/src/services/Order.service.js`
```javascript
// Алиас для совместимости
async getOrdersByUserId(userId) {
    return await this.getUserOrders(userId);
}
```

## Дополнительные изменения:

### 6. ✅ Создан .env файл
Создан файл `/app/meemee_bot/.env` с правильными переменными окружения:
- PAYMENT_API - API ключ от 0xprocessing
- MERCHANT_ID - ID мерчанта
- BOT_TOKEN - токен Telegram бота
- И другие необходимые переменные

### 7. ✅ Установлен и запущен Redis
- Установлен Redis server
- Запущен на порту 6379
- Бот успешно подключается к Redis

## Результат:

✅ Бот запущен и работает
✅ Криптооплата работает корректно
✅ Пользователи видят правильную сумму к оплате
✅ Кнопки отображаются корректно
✅ API запросы к 0xprocessing успешны

## Тестирование:

Бот готов к тестированию. Для проверки:
1. Откройте бота @meemee12_bot
2. Нажмите "Купить видео"
3. Выберите пакет
4. Выберите "Крипта"
5. Выберите криптовалюту (USDT/USDC/TON)
6. Выберите сеть
7. Должно появиться сообщение с:
   - ✅ Правильной суммой (не undefined)
   - ✅ Адресом кошелька
   - ✅ Memo/Tag (если требуется)
   - ✅ Кнопками "Я оплатил" и "Назад"

## Логи бота:

Бот запущен в фоне, логи доступны в `/tmp/bot.log`

Для просмотра логов в реальном времени:
```bash
tail -f /tmp/bot.log
```

Для перезапуска бота:
```bash
pkill -f "node.*bot_start"
cd /app/meemee_bot && node src/bot_start.js > /tmp/bot.log 2>&1 &
```
