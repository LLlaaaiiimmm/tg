# Инструкция по настройке Webhook'ов для MeeMee Bot

## ✅ Webhook сервер запущен и готов к работе!

### 📍 Локальные URL (для тестирования):
- **Lava webhook:** http://localhost:3000/webhook/lava
- **Crypto webhook:** http://localhost:3000/webhook/crypto
- **Health check:** http://localhost:3000/health

---

## 🌐 Настройка публичных webhook'ов

### Вариант 1: Использование вашего домена (если есть)

Если у вас есть домен (например, `yourdomain.com`), настройте его так, чтобы он указывал на ваш сервер `35.184.53.215`, и webhook URL будут:

- **Lava:** `https://yourdomain.com/webhook/lava`
- **Crypto:** `https://yourdomain.com/webhook/crypto`

### Вариант 2: Использование IP напрямую (НЕ РЕКОМЕНДУЕТСЯ для продакшена)

⚠️ **Внимание:** Lava и многие платежные системы требуют HTTPS. Использование IP без SSL не будет работать.

### Вариант 3: Использование ngrok (для тестирования) ⭐ РЕКОМЕНДУЕТСЯ

1. Установите ngrok:
   ```bash
   cd /app/meemee_bot
   wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
   tar xvzf ngrok-v3-stable-linux-amd64.tgz
   ```

2. Запустите ngrok для порта 3000:
   ```bash
   ./ngrok http 3000
   ```

3. Вы получите публичный URL типа: `https://abc123.ngrok.io`

4. Используйте его для webhook'ов:
   - Lava: `https://abc123.ngrok.io/webhook/lava`
   - Crypto: `https://abc123.ngrok.io/webhook/crypto`

---

## 🔧 Настройка в Lava (gate.lava.top)

1. Войдите в личный кабинет Lava: https://gate.lava.top/
2. Перейдите в раздел **"Настройки"** → **"Webhook"**
3. Введите URL: `https://your-public-url/webhook/lava`
4. Сохраните настройки

### Важно для Lava:
- Webhook должен быть **HTTPS** (не HTTP)
- Webhook должен отвечать статусом **200 OK**
- Lava отправляет данные в формате JSON с полями:
  - `id` - ID платежа в Lava
  - `status` - статус платежа (success, failed, и т.д.)
  - `email` - email покупателя
  - `amount` - сумма платежа

---

## 🔧 Настройка в 0xProcessing

1. Войдите в личный кабинет 0xProcessing: https://app.0xprocessing.com/
2. Перейдите в раздел **"Настройки"** → **"Webhook URL"**
3. Введите URL: `https://your-public-url/webhook/crypto`
4. Сохраните настройки

### Важно для 0xProcessing:
- Webhook должен быть **HTTPS** (не HTTP)
- 0xProcessing отправляет данные с полями:
  - `billingID` или `BillingID` - ваш ID заказа
  - `status` или `Status` - статус платежа
  - `PaymentId` или `paymentId` - ID платежа в системе

---

## 🧪 Тестирование webhook'ов

### Тест Lava webhook:
```bash
curl -X POST http://localhost:3000/webhook/lava \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test123",
    "status": "success",
    "email": "test@test.com"
  }'
```

### Тест Crypto webhook:
```bash
curl -X POST http://localhost:3000/webhook/crypto \
  -H "Content-Type: application/json" \
  -d '{
    "billingID": "CRYPTO-20251103-1234567890",
    "status": "success"
  }'
```

### Проверка GET запросов (для браузера):
- http://localhost:3000/webhook/lava
- http://localhost:3000/webhook/crypto
- http://localhost:3000/health

Все три должны возвращать JSON ответ (не ошибку 404).

---

## 📋 Что нужно сделать сейчас:

1. ✅ **Выберите способ публикации webhook'ов** (домен, ngrok, и т.д.)
2. ✅ **Настройте webhook URL в Lava и 0xProcessing**
3. ✅ **Проверьте Offer ID** в Lava для каждого пакета:
   - single (580₽)
   - pack_5 (2900₽)
   - pack_10 (5800₽)
   - pack_50 (29000₽)
4. ✅ **Протестируйте оплату** в боте

---

## 🔍 Логи для отладки

Если что-то не работает, проверьте логи:

```bash
# Логи webhook сервера
tail -f /var/log/supervisor/meemee_webhook.out.log

# Логи бота
tail -f /var/log/supervisor/meemee_bot.out.log

# Ошибки webhook
tail -f /var/log/supervisor/meemee_webhook.err.log

# Ошибки бота
tail -f /var/log/supervisor/meemee_bot.err.log
```

---

## ✅ Текущий статус:

- ✅ Webhook сервер запущен
- ✅ Redis подключен
- ✅ Бот работает
- ✅ .env файл настроен
- ✅ Offer ID добавлен в config
- ⏳ Нужно настроить публичные URL для webhook'ов

