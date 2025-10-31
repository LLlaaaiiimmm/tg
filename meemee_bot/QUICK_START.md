# 🚀 Быстрый старт MeeMee Bot

## ✅ Что уже настроено:

- ✅ `.env` файл создан
- ✅ **Реферальная программа ВКЛЮЧЕНА** (`REFERRAL_ENABLED=true`)
- ✅ Бонус за реферала: 1 генерация
- ✅ Кешбэк для экспертов: 50%
- ✅ Бесплатных генераций при старте: 1

---

## ⚠️ Что нужно настроить для запуска:

### 1. **Telegram Bot Tokens** (обязательно)

Получите токены от @BotFather в Telegram:

```bash
# В /app/meemee_bot/.env замените:
BOT_TOKEN=your_bot_token_here              # → токен основного бота
BOT_TOKEN_ADMIN=your_admin_bot_token_here  # → токен админ-бота
```

**Как получить:**
1. Напишите @BotFather в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте токен

### 2. **Redis** (обязательно)

Redis уже настроен на `redis://127.0.0.1:6379/0`

**Установка Redis:**
```bash
# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Или через Docker
docker run -d -p 6379:6379 redis
```

**Проверка:**
```bash
redis-cli ping
# Должно вернуть: PONG
```

### 3. **Google Veo3 API** (для генерации видео)

```bash
# В .env замените:
GOOGLE_VEO3_API_KEY=your_google_veo3_api_key_here
GOOGLE_VEO3_PROJECT_ID=your_project_id
```

### 4. **Платежные системы** (опционально на старте)

Можно настроить позже:
- `PAYMENT_API` - для крипто-платежей (0xprocessing)
- `LAVA_PAYMENT_API` - для карт (LavaTop)

---

## 🏃 Запуск:

### Установка зависимостей:
```bash
cd /app/meemee_bot
npm install
```

### Запуск основного бота:
```bash
npm start
```

### Запуск админ-бота (в отдельном терминале):
```bash
cd /app/meemee_bot
npm run admin
```

### Запуск backend для webhook (в отдельном терминале):
```bash
cd /app/meemee_bot
npm run backend
```

---

## 📱 Проверка работы:

### 1. Основной бот работает:
- Напишите боту `/start`
- Должно появиться меню с кнопками

### 2. Реферальная программа работает:
- Нажмите "🎁 Приведи друга"
- Выберите тип ссылки
- Скопируйте и откройте в другом аккаунте

### 3. Админ-бот работает:
- Напишите админ-боту `/start`
- Должна появиться админ-панель (только для админов из `ADMINS` в config.js)

---

## 🔧 Настройка админов:

Добавьте свой Telegram ID в файл `/app/meemee_bot/src/config.js`:

```javascript
export const ADMINS = [
    470239748,    // ID администратора 1
    892965815,    // ID администратора 2
    123456789     // ← Добавьте свой ID сюда
];
```

**Как узнать свой ID:**
1. Напишите боту @userinfobot
2. Скопируйте свой ID

---

## 📊 Статус настройки:

```
✅ .env файл создан
✅ Реферальная программа включена
⚠️  BOT_TOKEN - нужно добавить
⚠️  BOT_TOKEN_ADMIN - нужно добавить
⚠️  Redis - нужно запустить
⚠️  Google Veo3 API - нужно добавить (для генерации видео)
✅ Все файлы бота готовы к работе
```

---

## 🐛 Устранение проблем:

### Бот не запускается:
```bash
# Проверьте логи
cd /app/meemee_bot
npm start

# Проверьте Redis
redis-cli ping

# Проверьте .env
cat .env
```

### Redis ошибка:
```bash
# Запустите Redis
sudo systemctl start redis

# Или через Docker
docker run -d -p 6379:6379 redis
```

### "BOT_TOKEN not found":
- Проверьте что в `.env` есть `BOT_TOKEN=ваш_токен`
- Убедитесь что нет пробелов вокруг `=`

---

## 📚 Дополнительная документация:

- **Реферальная программа:** `/app/meemee_bot/REFERRAL_SETUP.md`
- **Полное README:** `/app/meemee_bot/README.md`
- **Кнопки и UI:** `/app/meemee_bot/BUTTONS_GUIDE.md`

---

## ✨ Готово к использованию после настройки токенов и Redis!

Минимальные требования для запуска:
1. ✅ BOT_TOKEN
2. ✅ BOT_TOKEN_ADMIN (для админ-панели)
3. ✅ Redis запущен

Всё остальное можно настроить позже! 🚀
