# 🔧 Полный гайд по настройке API для MeeMee Bot

## 📋 Список необходимых API ключей

### 1️⃣ **Telegram Bot Token** (ОБЯЗАТЕЛЬНО)

**Где получить:**
1. Открыть [@BotFather](https://t.me/BotFather) в Telegram
2. Отправить команду `/newbot`
3. Следовать инструкциям (выбрать имя и username бота)
4. Получить токен вида: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

**Что добавить в .env:**
```bash
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
BOT_NAME=ваш_бот_username  # без @
```

**Для админ-бота:**
- Повторить те же шаги для создания второго бота
```bash
BOT_TOKEN_ADMIN=9876543210:ZYXwvuTSRqponMLKjihGFEdcba
```

---

### 2️⃣ **Kie.ai Sora 2 API** (для генерации видео)

**Где получить:**
1. Зарегистрироваться на [kie.ai](https://kie.ai)
2. Перейти в раздел API Keys
3. Создать новый API ключ
4. Скопировать ключ

**Что добавить в .env:**
```bash
KIE_AI_API_KEY=ваш_kie_ai_api_ключ
```

**Документация API:**
- Endpoint: `https://api.kie.ai/api/v1/jobs`
- Модель: `sora-2-text-to-video`
- Формат запроса: POST с JSON

**Пример запроса (уже реализовано в коде):**
```javascript
{
  "model": "sora-2-text-to-video",
  "prompt": "текст промпта",
  "duration": 5
}
```

---

### 3️⃣ **Lava Top API** (оплата картами)

**Где получить:**
1. Зарегистрироваться на [lava.top](https://lava.top)
2. Перейти в раздел "API"
3. Создать API ключ
4. Создать Offer (товары/услуги) для каждого пакета

**Что добавить в .env:**
```bash
LAVA_PAYMENT_API=ваш_lava_api_ключ
WEBHOOK_PASSWORD=придумайте_секретный_пароль
```

**ВАЖНО: Создать Offer для каждого пакета:**

В личном кабинете Lava создайте 4 Offer:
1. **1 видео** - цена 580₽
2. **10 видео** - цена 5000₽  
3. **100 видео** - цена 40000₽
4. **300 видео** - цена 100000₽

Для каждого Offer скопируйте **Offer ID** и добавьте в `src/config.js`:

```javascript
// В файле /app/meemee_bot/src/config.js
export const PACKAGES = {
    single: {
        // ...
        offerIdLava: 'ваш_lava_offer_id_для_1_видео'  // строка 12
    },
    pack_10: {
        // ...
        offerIdLava: 'ваш_lava_offer_id_для_10_видео'  // строка 22
    },
    pack_100: {
        // ...
        offerIdLava: 'ваш_lava_offer_id_для_100_видео'  // строка 32
    },
    pack_300: {
        // ...
        offerIdLava: 'ваш_lava_offer_id_для_300_видео'  // строка 42
    }
};
```

**Настройка Webhook в Lava:**
- URL: `https://ваш-домен.com/webhook/lava`
- Метод: POST
- Добавить секретную подпись (WEBHOOK_PASSWORD из .env)

---

### 4️⃣ **0xprocessing API** (оплата криптой)

**Где получить:**
1. Зарегистрироваться на [0xprocessing.com](https://0xprocessing.com)
2. Получить **Merchant ID** (формат: 0xMR1234567)
3. Получить **API Key**

**Что добавить в .env:**
```bash
PAYMENT_API=ваш_0xprocessing_api_ключ
MERCHANT_ID=0xMR1234567  # ваш merchant ID
WEBHOOK_PASSWORD_PROCESSING=придумайте_секретный_пароль
```

**Настройка Webhook в 0xprocessing:**
- URL: `https://ваш-домен.com/webhook/crypto`
- Метод: POST

**Поддерживаемые криптовалюты (уже настроены):**
- USDT (ERC20, TRC20, BEP20, POLYGON, ARB, TON)
- USDC (ERC20, BEP20, POLYGON, BASE)
- TON

---

### 5️⃣ **Telegram Stars** (ОПЦИОНАЛЬНО)

**Статус:** В разработке, пока заглушка "скоро"

**Если хотите включить:**
```bash
STARS_ENABLED=true
```

**Документация:**
- [Telegram Stars API](https://core.telegram.org/bots/payments#telegram-stars)

---

## 🔗 Дополнительные настройки

### Контакт поддержки
```bash
SUPPORT_USERNAME=ваш_telegram_username  # без @
```

### YouTube канал и FAQ

Отредактировать в `src/config.js` (строки 215-216):
```javascript
[{ text: '📺 YouTube канал', url: 'https://youtube.com/@ваш_канал' }],
[{ text: '❓ FAQ', url: 'https://teletype.in/@ваш_профиль/faq' }],
```

---

## 📝 Пример заполненного .env файла

```bash
# Основной бот
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
BOT_NAME=meemee_bot

# Redis (уже настроен)
REDIS_URL=redis://127.0.0.1:6379/0

# Kie.ai Sora 2 API
KIE_AI_API_KEY=sk_kie_ai_your_api_key_here

# Крипто-платежи (0xprocessing)
PAYMENT_API=0xPROCESSING_API_KEY_HERE
MERCHANT_ID=0xMR8252827

# Фиат-платежи (Lava)
LAVA_PAYMENT_API=LAVA_API_KEY_HERE

# Telegram Stars
STARS_ENABLED=false

# Webhook безопасность
WEBHOOK_USERNAME=webhook_user
WEBHOOK_PASSWORD=my_super_secret_webhook_password_123
WEBHOOK_PASSWORD_PROCESSING=another_secret_for_crypto_456

# Админ-бот
BOT_TOKEN_ADMIN=9876543210:ZYXwvuTSRqponMLKjihGFEdcba

# Бесплатная квота
FREE_QUOTA_PER_USER=1

# Реферальная программа
REFERRAL_ENABLED=true
REFERRAL_BONUS_GENERATIONS=1
EXPERT_REFERRAL_CASHBACK_PERCENT=50

# Поддержка
SUPPORT_USERNAME=your_support_username
```

---

## ✅ Чек-лист перед запуском

### Обязательно:
- [ ] BOT_TOKEN получен от @BotFather
- [ ] BOT_TOKEN_ADMIN получен от @BotFather
- [ ] KIE_AI_API_KEY получен на kie.ai
- [ ] LAVA_PAYMENT_API получен на lava.top
- [ ] 4 Lava Offer созданы и ID добавлены в config.js
- [ ] PAYMENT_API и MERCHANT_ID получены от 0xprocessing
- [ ] SUPPORT_USERNAME указан
- [ ] YouTube и FAQ ссылки обновлены в config.js
- [ ] Redis запущен (`redis-cli ping` → PONG)
- [ ] Зависимости установлены (`npm install`)

### Для продакшена:
- [ ] Webhook настроены в Lava и 0xprocessing
- [ ] SSL сертификат настроен для webhook
- [ ] Домен настроен и работает
- [ ] Backend запущен на сервере

---

## 🚀 Запуск бота

```bash
# 1. Переход в директорию проекта
cd /app/meemee_bot

# 2. Проверка Redis
redis-cli ping  # Должно вернуть PONG

# 3. Установка зависимостей (если ещё не установлены)
npm install

# 4. Запуск основного бота
npm start

# 5. Запуск админ-бота (в новом терминале)
npm run admin

# 6. Запуск backend для webhook (в новом терминале)
npm run backend
```

---

## 🧪 Тестирование

### Тест основного бота:
1. Открыть бота в Telegram
2. Отправить `/start`
3. Проверить все пункты меню

### Тест платежей:
1. Нажать "💳 Купить видео"
2. Выбрать пакет
3. Попробовать оплату картой (с тестовым email)
4. Попробовать оплату криптой

### Тест генерации:
1. Выбрать мем
2. Ввести имя
3. Выбрать пол
4. Запустить генерацию
5. Дождаться видео

### Тест админ-панели:
1. Открыть админ-бота
2. Проверить статистику
3. Проверить экспорт данных
4. Протестировать рассылку

---

## 🆘 Решение проблем

### Бот не запускается
```bash
# Проверить Redis
redis-cli ping

# Проверить .env файл
cat .env

# Проверить логи
npm start 2>&1 | tee bot.log
```

### Платежи не работают
1. Проверить API ключи в .env
2. Проверить Lava Offer IDs в config.js
3. Проверить webhook настройки
4. Проверить логи backend: `npm run backend`

### Генерация не работает
1. Проверить KIE_AI_API_KEY
2. Проверить квоты на kie.ai
3. Проверить логи генерации в консоли

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверить все пункты чек-листа
2. Проверить логи: `npm start 2>&1 | tee bot.log`
3. Проверить Redis: `redis-cli ping`
4. Проверить порты: `netstat -tulpn | grep 3000`

---

**Дата создания:** 2025
**Версия:** 1.0
**Статус:** ✅ Готово к настройке
