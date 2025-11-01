# 📝 Что осталось доделать в MVP MeeMee

## 🔴 КРИТИЧНО (перед запуском):

### 1. Конфигурация и API ключи

#### .env файл (создать и заполнить):
```bash
# Скопировать пример
cp /app/meemee_bot/.env.example /app/meemee_bot/.env

# Заполнить следующие ключи:
BOT_TOKEN=                    # ❌ Получить у @BotFather
BOT_TOKEN_ADMIN=              # ❌ Получить у @BotFather (отдельный бот)
BOT_NAME=meemee_bot           # ❌ Указать username бота без @

REDIS_URL=redis://127.0.0.1:6379/0  # ✅ Можно оставить

GOOGLE_VEO3_API_KEY=          # ❌ Получить в Google AI Studio
GOOGLE_VEO3_PROJECT_ID=       # ❌ Google Cloud Project ID

PAYMENT_API=                  # ❌ Получить у 0xprocessing
MERCHANT_ID=0xMR8252827       # ❌ Ваш Merchant ID от 0xprocessing

LAVA_PAYMENT_API=             # ❌ Получить у Lava.top

WEBHOOK_USERNAME=webhook_user      # ⚠️ Задать для безопасности
WEBHOOK_PASSWORD=webhook_pass      # ⚠️ Задать для безопасности
WEBHOOK_PASSWORD_PROCESSING=secret # ⚠️ Задать для безопасности

FREE_QUOTA_PER_USER=1         # ✅ Можно оставить или изменить

REFERRAL_ENABLED=false        # ⚠️ Включить когда готовы: true
REFERRAL_BONUS_GENERATIONS=1  # ✅ Можно оставить
EXPERT_REFERRAL_CASHBACK_PERCENT=50  # ✅ Можно оставить

STARS_ENABLED=false           # ⚠️ Включить когда реализуете Stars

SUPPORT_USERNAME=your_support # ❌ Указать ваш Telegram username для поддержки
```

#### config.js (заменить плейсхолдеры):

**Файл:** `/app/meemee_bot/src/config.js`

```javascript
// Строка 12 - Lava Offer ID для пакета "1 видео"
offerIdLava: 'YOUR_LAVA_OFFER_ID_SINGLE'  // ❌ Заменить на реальный

// Строка 22 - Lava Offer ID для пакета "10 видео"
offerIdLava: 'YOUR_LAVA_OFFER_ID_PACK10'  // ❌ Заменить на реальный

// Строка 32 - Lava Offer ID для пакета "100 видео"
offerIdLava: 'YOUR_LAVA_OFFER_ID_PACK100' // ❌ Заменить на реальный

// Строка 42 - Lava Offer ID для пакета "300 видео"
offerIdLava: 'YOUR_LAVA_OFFER_ID_PACK300' // ❌ Заменить на реальный

// Строка 215 - YouTube канал
{ text: '📺 YouTube канал', url: 'https://youtube.com/@meemee' }  // ❌ Заменить ссылку

// Строка 216 - FAQ на Телетайпе
{ text: '❓ FAQ', url: 'https://teletype.in/@meemee/faq' }  // ❌ Заменить ссылку
```

---

### 2. Webhook для платежей

#### Backend для вебхуков (опционально но рекомендуется):

**Файл:** `/app/meemee_bot/src/backend/index.js` - проверить что запущен

```bash
# Запуск backend для приёма вебхуков
cd /app/meemee_bot
npm run backend
```

**Проверить:**
- ✅ Код уже есть в `src/backend/index.js`
- ❌ Нужно настроить URL вебхука в панелях Lava и 0xprocessing
- ❌ Указать ваш домен или использовать ngrok для тестов

**Webhooks URLs:**
- Lava: `https://ваш-домен/webhook/lava`
- 0xprocessing: `https://ваш-домен/webhook/processing`

---

### 3. Redis

```bash
# Проверить что Redis запущен
redis-cli ping
# Должно вернуть: PONG

# Если не запущен:
service redis start
# или
systemctl start redis
```

---

## 🟡 ВАЖНО (для полноценной работы):

### 4. Telegram Stars (опционально на MVP)

**Если хотите включить:**
1. Изучить документацию: https://core.telegram.org/bots/payments#telegram-stars
2. Реализовать обработчик платежей Stars
3. Добавить в `src/controllers/paymentController.js`
4. Включить: `STARS_ENABLED=true` в .env

**Текущий статус:** Заглушка "скоро" ✅

---

### 5. Проверка работы генераций

#### Google Veo 3.1 API:

**Возможные проблемы:**
- API может быть в бета-тестировании
- Нужен доступ к Google AI Studio
- Возможны лимиты на количество запросов

**Альтернатива для тестов (MOCK):**

Создать файл `/app/meemee_bot/src/services/Generation.service.mock.js`:

```javascript
// Для тестирования без реального API
async generateVideo(prompt) {
    console.log('🧪 MOCK: Generating video for prompt:', prompt);
    
    // Симуляция задержки
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Возвращаем тестовое видео
    return 'https://www.example.com/test-video.mp4';
}
```

Включить мок в `src/bot_start.js` при разработке.

---

### 6. Тестирование платежей

#### Sandbox режимы:

**Lava.top:**
- Узнать есть ли тестовый режим
- Получить тестовые ключи API
- Протестировать оплату картой

**0xprocessing:**
- Использовать testnet криптовалюты
- Протестировать крипто-платежи
- Проверить вебхуки

---

### 7. Контент для пользователей

#### FAQ на Телетайпе:
Создать статью с ответами на:
- ❓ Как это работает?
- 💰 Сколько стоит?
- 💾 Как сохранить видео?
- 🔄 Возврат средств
- 📞 Как связаться с поддержкой?
- ⏱️ Сколько делается видео?
- 🎬 Какие мемы доступны?
- 🎁 Как работает реферальная программа?

#### YouTube канал:
- Создать канал
- Загрузить примеры видео-мемов
- Добавить ссылку в config.js

---

## 🟢 ЖЕЛАТЕЛЬНО (улучшения):

### 8. Добавить больше мемов

**Текущие мемы:**
- ✅ Мама, вызывай такси
- ✅ Кола-Пепси
- ⏳ 228 (SOON)

**Как добавить новый мем:**

1. Создать файл `/app/meemee_bot/src/memes/новый_мем.json`:
```json
{
  "id": "новый_мем",
  "name": "Название мема",
  "status": "active",
  "preview": "",
  "prompt": "Промпт с {name} и {gender_text}",
  "duration": 5
}
```

2. Бот автоматически подхватит новый мем (без перезапуска)

---

### 9. Улучшить антиабуз для рефералов

**Текущая защита:**
- ✅ Самореферал
- ✅ Повторное использование

**Можно добавить:**
- ❌ Device fingerprinting
- ❌ Rate limiting
- ❌ Проверка на ботов
- ❌ Анализ поведения

**Файл:** `/app/meemee_bot/src/services/Referral.service.js`

---

### 10. Логирование и мониторинг

#### Winston уже установлен:

Добавить в `src/bot_start.js`:
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

---

### 11. Сохранение видео на сервер

**Текущая реализация:**
- ✅ Только ссылка от Veo3 в Redis
- ⚠️ Если Veo3 удалит видео, ссылка станет недействительной

**Улучшение:**
```javascript
// Скачать и сохранить видео
async downloadAndSaveVideo(videoUrl, generationId) {
    const response = await axios.get(videoUrl, { responseType: 'stream' });
    const filePath = path.join(__dirname, '../videos', `${generationId}.mp4`);
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
    });
}
```

---

### 12. Личный кабинет - история видео

**Текущая реализация:**
- ✅ Показывает историю генераций
- ⚠️ Не показывает сами видео (только статусы)

**Улучшение:**
- Добавить кнопку "Скачать видео" для завершённых генераций
- Сохранить video_file_id от Telegram для повторной отправки

---

## 📊 Чеклист перед запуском:

### Обязательно:
- [ ] Создан .env файл с ключами
- [ ] BOT_TOKEN и BOT_TOKEN_ADMIN получены
- [ ] GOOGLE_VEO3_API_KEY настроен
- [ ] PAYMENT_API (0xprocessing) настроен
- [ ] LAVA_PAYMENT_API настроен
- [ ] Lava Offer IDs заменены в config.js
- [ ] YouTube и FAQ ссылки заменены
- [ ] SUPPORT_USERNAME указан
- [ ] Redis запущен и доступен
- [ ] npm install выполнен
- [ ] Тестовый запуск бота (npm start)
- [ ] Тестовый запуск админ-бота (npm run admin)

### Желательно:
- [ ] Backend для вебхуков запущен (npm run backend)
- [ ] Вебхуки настроены в Lava и 0xprocessing
- [ ] FAQ статья на Телетайпе создана
- [ ] YouTube канал создан
- [ ] Тестовые платежи проверены
- [ ] Генерация видео протестирована
- [ ] Реферальная программа протестирована

---

## 🚀 Порядок запуска:

```bash
# 1. Установка
cd /app/meemee_bot
npm install

# 2. Создание .env
cp .env.example .env
nano .env  # Заполнить ключи

# 3. Редактирование config.js
nano src/config.js  # Заменить плейсхолдеры

# 4. Проверка Redis
redis-cli ping

# 5. Тест подключения к Redis
node test_redis.js

# 6. Запуск основного бота
npm start

# 7. Запуск админ-бота (в новом терминале)
npm run admin

# 8. Запуск backend для вебхуков (в новом терминале)
npm run backend

# 9. Тестирование в Telegram
# - Открыть бота
# - /start
# - Протестировать все функции
```

---

## 📞 Если что-то не работает:

### Проблемы с ботом:
```bash
# Проверить логи
npm start 2>&1 | tee bot.log

# Проверить Redis
node test_redis.js

# Проверить порты
netstat -tulpn | grep 3000  # backend
```

### Проблемы с платежами:
- Проверить API ключи в .env
- Проверить вебхуки в панелях Lava/0xprocessing
- Проверить логи backend

### Проблемы с генерацией:
- Проверить GOOGLE_VEO3_API_KEY
- Проверить квоты Google API
- Использовать мок для тестов

---

## 📝 Итого что осталось:

### 🔴 КРИТИЧНО (без этого не запустится):
1. Заполнить .env файл (все API ключи)
2. Заменить Lava Offer IDs в config.js
3. Заменить ссылки YouTube/FAQ в config.js
4. Указать SUPPORT_USERNAME

### 🟡 ВАЖНО (для полноценной работы):
5. Настроить вебхуки для платежей
6. Протестировать генерацию с Veo3 (или мок)
7. Создать FAQ на Телетайпе
8. Создать YouTube канал

### 🟢 ЖЕЛАТЕЛЬНО (улучшения):
9. Добавить больше мемов
10. Улучшить антиабуз
11. Добавить логирование
12. Сохранение видео на сервер

---

**Примерное время на доработку:**
- Критично: 1-2 часа (получение ключей + конфигурация)
- Важно: 3-4 часа (настройка платежей + контент)
- Желательно: 8+ часов (улучшения)

**MVP можно запустить после выполнения критичных пунктов!**
