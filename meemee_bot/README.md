# MeeMee Telegram Bot - Генератор вирусных видео-мемов

Бот для создания персонализированных видео-мемов с использованием Google Veo3 API.

## Возможности

- 🎬 Генерация персонализированных видео-мемов
- 💳 Оплата через карты (LavaTop), криптовалюту (0xprocessing) и Telegram Stars
- 🎁 Система бесплатных и платных генераций
- 👥 Реферальная программа для пользователей и экспертов
- 📊 Админ-панель со статистикой
- ⚡ Очередь генераций видео

## Установка

### 1. Установите зависимости

```bash
cd /app/meemee_bot
npm install
```

### 2. Настройте .env файл

Скопируйте `.env.example` в `.env` и заполните необходимые переменные:

```bash
cp .env.example .env
nano .env
```

**Обязательные переменные:**
- `BOT_TOKEN` - токен бота от @BotFather
- `REDIS_URL` - URL подключения к Redis
- `GOOGLE_VEO3_API_KEY` - API ключ Google Veo3
- `PAYMENT_API` - API ключ 0xprocessing
- `LAVA_PAYMENT_API` - API ключ Lava

### 3. Создайте бота в Telegram

1. Напишите @BotFather в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям и получите токен
4. Добавьте токен в `.env` как `BOT_TOKEN`

### 4. Настройте Redis

**Локально (Docker):**
```bash
docker run -p 6379:6379 redis
```

**Или используйте облачный Redis** (например, Redis Cloud)

### 5. Получите Google Veo3 API ключ

1. Перейдите на https://labs.google/flow/about
2. Следуйте инструкциям для получения API доступа
3. Добавьте ключ в `.env` как `GOOGLE_VEO3_API_KEY`

### 6. Настройте платежные системы

**0xprocessing (крипта):**
- Зарегистрируйтесь на https://0xprocessing.com
- Получите API ключ и Merchant ID
- Добавьте в `.env`

**LavaTop (карты):**
- Зарегистрируйтесь на https://lava.top
- Получите API ключ
- Создайте оферы для каждого пакета генераций
- Добавьте Offer ID в `src/config.js`

## Запуск

### Основной бот

```bash
npm start
```

Или через PM2:
```bash
pm2 start src/bot_start.js --name meemee-bot
```

### Админ бот

```bash
npm run admin
```

Или через PM2:
```bash
pm2 start src/bot_start_admin.js --name meemee-admin
```

### Backend для webhook'ов (Lava)

```bash
npm run backend
```

Или через PM2:
```bash
pm2 start src/backend/index.js --name meemee-backend
```

## Настройка мемов

Мемы и их промпты настраиваются через JSON файлы в папке `src/memes/`:

```json
{
  "id": "mama_taxi",
  "name": "Мама, вызывай такси",
  "status": "active",
  "preview": "https://example.com/preview.jpg",
  "prompt": "Создай видео где {name} ({gender}) говорит: 'Мама, вызывай такси!'...",
  "duration": 5
}
```

**Статусы:**
- `active` - мем доступен для генерации
- `soon` - показывается как "скоро"
- `hidden` - не отображается в списке

## Настройка цен

Цены настраиваются в `src/config.js` в объекте `PACKAGES`:

```javascript
export const PACKAGES = {
  single: {
    title: '1 видео',
    generations: 1,
    usdt: 5.8,
    rub: 580,
    stars: 100
  }
};
```

## Админ-панель

Админ-бот предоставляет:
- 📈 Статистику платежей по методам
- 🎬 Топ мемов по генерациям
- 👥 Управление пользователями
- 📊 Отчеты (успешные/неуспешные генерации)
- 📢 Рассылка сообщений

**Настройка админов:**
Добавьте Telegram ID админов в `src/config.js` в массив `ADMINS`:

```javascript
export const ADMINS = [123456789, 987654321];
```

## Структура проекта

```
meemee_bot/
├── src/
│   ├── bot_start.js           # Основной бот
│   ├── bot_start_admin.js     # Админ бот
│   ├── config.js              # Конфигурация
│   ├── redis.js               # Подключение Redis
│   ├── services/              # Бизнес-логика
│   │   ├── User.service.js
│   │   ├── Order.service.js
│   │   ├── PaymentCrypto.service.js
│   │   ├── PaymentFiat.service.js
│   │   ├── Generation.service.js
│   │   └── Referral.service.js
│   ├── scenes/                # Telegraf сцены
│   ├── screens/               # UI сообщения
│   ├── controllers/           # Обработчики
│   ├── memes/                 # JSON промпты мемов
│   └── backend/               # Webhook сервер
├── package.json
├── .env
└── README.md
```

## Возможные проблемы

**Бот не запускается:**
- Проверьте `BOT_TOKEN` в `.env`
- Убедитесь что Redis запущен и доступен

**Генерация не работает:**
- Проверьте `GOOGLE_VEO3_API_KEY`
- Проверьте логи бота
- Убедитесь что у вас есть квота API

**Платежи не работают:**
- Для крипты: проверьте `PAYMENT_API` и `MERCHANT_ID`
- Для карт: проверьте `LAVA_PAYMENT_API` и Offer ID в config.js
- Убедитесь что webhook сервер запущен (для Lava)

## Логи

Логи сохраняются в папке `logs/`:
- `combined.log` - все логи
- `error.log` - только ошибки

## Поддержка

По вопросам работы бота обращайтесь к администратору проекта.