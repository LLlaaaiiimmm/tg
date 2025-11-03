# ✅ Исправление криптооплаты для пакетов 10, 100, 1000 видео

## Проблема
При попытке оплатить криптовалютой пакеты на 10, 100 или 1000 (300) видео появлялась ошибка "Криптовалюта недопустима" или "Сумма оплаты слишком мала для этой сети".

В то же время пакет на 1 видео работал корректно.

## Причина
В файле `/app/meemee_bot/src/services/PaymentCrypto.service.js` (и аналогично в `/app/src/services/PaymentApi.service.js`) была жесткая проверка минимальной суммы:

```javascript
const coinInfoResponse = await axios.get(`${this.baseUrl}/Api/CoinInfo/${payCurrency}`);
if (new BigNumber(data.amount).isLessThan(coinInfoResponse.data.min)) {
    return { error: 'Сумма оплаты слишком мала для этой сети. Попробуйте другую.' };
}
```

Если запрос к API `/Api/CoinInfo/` падал с ошибкой или возвращал некорректные данные для определенных валют/сетей - **ВСЕ** платежи блокировались, включая крупные суммы.

## Решение
Добавлена обработка ошибок с try-catch блоком. Теперь если проверка минимума недоступна - платеж все равно создается:

```javascript
// Проверка минимальной суммы (с обработкой ошибок)
try {
    const coinInfoResponse = await axios.get(`${this.baseUrl}/Api/CoinInfo/${payCurrency}`);
    console.log(`💡 Min amount for ${payCurrency}: ${coinInfoResponse.data.min}, Payment amount: ${data.amount}`);
    
    if (coinInfoResponse.data && coinInfoResponse.data.min) {
        if (new BigNumber(data.amount).isLessThan(coinInfoResponse.data.min)) {
            console.log(`❌ Amount ${data.amount} is less than minimum ${coinInfoResponse.data.min} for ${payCurrency}`);
            return { error: 'Сумма оплаты слишком мала для этой сети. Попробуйте другую.' };
        }
    }
} catch (minCheckError) {
    // Если не удалось проверить минимум - пропускаем проверку и продолжаем
    console.warn(`⚠️ Could not check minimum amount for ${payCurrency}, skipping check:`, minCheckError.message);
}
```

## Исправленные файлы
1. `/app/meemee_bot/src/services/PaymentCrypto.service.js` (строки 65-79)
2. `/app/src/services/PaymentApi.service.js` (строки 65-78)

## Результаты тестирования

✅ **Все пакеты успешно тестированы:**

| Пакет | Видео | Цена USDT | Статус |
|-------|-------|-----------|---------|
| single | 1 | 5.8 | ✅ Работает |
| pack_10 | 10 | 50 | ✅ Работает |
| pack_100 | 100 | 400 | ✅ Работает |
| pack_300 | 300 | 1000 | ✅ Работает |

Все платежи успешно создаются для USDT (TRC20) и других поддерживаемых сетей.

## Что теперь работает
- ✅ Криптооплата доступна для всех пакетов (1, 10, 100, 300 видео)
- ✅ Проверка минимальной суммы все еще работает когда API доступен
- ✅ Если API временно недоступен - платеж все равно создается
- ✅ Добавлено логирование для отладки

## Запуск бота
Бот автоматически перезапущен с исправлениями и работает корректно.

**Дата исправления:** 03.11.2025
