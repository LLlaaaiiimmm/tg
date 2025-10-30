# MeeMee Bot - Инструкция по настройке и запуску

## ✅ ЧТО СДЕЛАНО

### 1. Структура проекта
- ✅ Полная архитектура бота в отдельной директории `/app/meemee_bot/`
- ✅ Не затронуты файлы оригинального бота @aiviral_academy_bot

### 2. Основной функционал
- ✅ **Основной бот** (`src/bot_start.js`)
  - Приветственное меню
  - Каталог мемов с пагинацией
  - Система генерации видео (готова к интеграции с Google Veo3)
  - Процесс генерации: ввод имени → выбор пола → подтверждение → генерация
  - Проверка и списание квот (free_quota, paid_quota)

- ✅ **Админ-бот** (`src/bot_start_admin.js`)
  - Статистика пользователей
  - Статистика платежей (по дням/неделям/месяцам)
  - Статистика генераций
  - Топ мемов
  - Поиск пользователей
  - Рассылка сообщений

- ✅ **Платежная система**
  - Интеграция с 0xprocessing (крипта) - скопирована из оригинального бота
  - Интеграция с LavaTop (карты) - скопирована из оригинального бота
  - Webhook сервер для обработки платежей (`src/backend/index.js`)
  - Telegram Stars - заглушка "скоро" (можно включить через STARS_ENABLED=true)

- ✅ **Реферальная программа**
  - Пользовательские рефералы (за каждого друга +1 генерация обоим)
  - Экспертные рефералы (кешбэк 50% с оплат рефералов)
  - Отслеживание статистики рефералов
  - Включается через REFERRAL_ENABLED=true в .env

- ✅ **Система генераций**
  - Очередь генераций
  - Обработка статусов (queued → processing → done/failed)
  - Автоматический возврат квоты при ошибке
  - Polling для проверки статуса генерации

- ✅ **Мемы**
  - 3 мема: "Мама, вызывай такси", "Кола-Пепси", "228" (скоро)
  - JSON файлы с промптами в `src/memes/`
  - Статусы: active, soon, hidden
  - Легко добавлять новые мемы через JSON

### 3. Сервисы (Services)
- ✅ `User.service.js` - управление пользователями и квотами
- ✅ `Order.service.js` - управление заказами
- ✅ `PaymentCrypto.service.js` - крипто-платежи
- ✅ `PaymentFiat.service.js` - фиат-платежи
- ✅ `Generation.service.js` - генерация видео
- ✅ `Referral.service.js` - реферальная программа

### 4. База данных
- ✅ Redis для хранения всех данных
- ✅ Структуры для пользователей, заказов, генераций, рефералов

### 5. Конфигурация
- ✅ `config.js` - все тексты, цены, настройки
- ✅ `.env.example` - шаблон переменных окружения
- ✅ README.md с подробной документацией

---

## ⚙️ НАСТРОЙКА ПЕРЕД ЗАПУСКОМ

### 1. Создайте .env файл

```bash
cd /app/meemee_bot
cp .env.example .env
nano .env
```

### 2. Заполните обязательные переменные

**КРИТИЧЕСКИ ВАЖНО:**
```bash
# Основной бот
BOT_TOKEN=your_bot_token_from_botfather
BOT_NAME=your_bot_username

# Redis (если используете существующий)
REDIS_URL=redis://127.0.0.1:6379/1  # Используйте базу 1, чтобы не конфликтовать с оригинальным ботом!

# Google Veo3 API
GOOGLE_VEO3_API_KEY=your_api_key_here
GOOGLE_VEO3_PROJECT_ID=your_project_id

# Платежи (из оригинального бота)
PAYMENT_API=your_0xprocessing_api_key
MERCHANT_ID=0xMR8252827
LAVA_PAYMENT_API=your_lava_api_key

# Админ бот
BOT_TOKEN_ADMIN=your_admin_bot_token
```

### 3. Настройте Lava Offer ID

Откройте `src/config.js` и замените:
```javascript
export const PACKAGES = {
    single: {
        title: '1 видео',
        emoji: '🎬',
        generations: 1,
        usdt: 5.8,
        rub: 580,
        stars: 100,
        offerIdLava: 'YOUR_LAVA_OFFER_ID_HERE' // ← ЗАМЕНИТЕ ЭТО
    }
};
```

### 4. Настройте админов

В `src/config.js`:
```javascript
export const ADMINS = [YOUR_TELEGRAM_ID, ANOTHER_ADMIN_ID];
```

---

## 🚀 ЗАПУСК

### 1. Установите зависимости (уже установлены)
```bash
cd /app/meemee_bot
yarn install  # или npm install
```

### 2. Запустите боты

**Основной бот:**
```bash
node src/bot_start.js

# Или через PM2:
pm2 start src/bot_start.js --name meemee-bot
```

**Админ бот:**
```bash
node src/bot_start_admin.js

# Или через PM2:
pm2 start src/bot_start_admin.js --name meemee-admin
```

**Webhook сервер (для платежей):**
```bash
node src/backend/index.js

# Или через PM2:
pm2 start src/backend/index.js --name meemee-backend
```

---

## ❌ ЧТО НУЖНО ДОДЕЛАТЬ

### 1. **Google Veo3 API интеграция** (КРИТИЧНО!)

Файл: `src/services/Generation.service.js`

Метод `generateVideo()` содержит **заглушку**. Нужно:

1. Получить документацию Google Veo3 API на https://labs.google/flow/about
2. Заменить заглушку на реальные API вызовы:

```javascript
// Найдите в файле src/services/Generation.service.js метод generateVideo():

async generateVideo(prompt) {
    // ТУТ НУЖНА РЕАЛЬНАЯ ИНТЕГРАЦИЯ!
    // Документация: https://labs.google/flow/about
    
    try {
        const response = await axios.post(
            `РЕАЛЬНЫЙ_URL_VEO3_API`,  // ← ЗАМЕНИТЕ
            {
                prompt: prompt,
                // ДОБАВЬТЕ НУЖНЫЕ ПАРАМЕТРЫ ПО ДОКУМЕНТАЦИИ
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,  // ← ПРОВЕРЬТЕ ФОРМАТ
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data.videoUrl;  // ← ПРОВЕРЬТЕ СТРУКТУРУ ОТВЕТА
    } catch (err) {
        console.error('Video generation error:', err);
        throw err;
    }
}
```

### 2. **Webhook URLs для платежных систем**

Нужно настроить публичные URLs для вебхуков:

**Lava (карты):**
- URL: `https://your-domain.com/webhook/lava`
- Настройте в личном кабинете Lava

**0xprocessing (крипта):**
- URL: `https://your-domain.com/webhook/crypto`
- Настройте в личном кабинете 0xprocessing

**Для локальной разработки** используйте ngrok:
```bash
ngrok http 3000
# Используйте полученный URL для вебхуков
```

### 3. **Telegram Stars** (опционально)

Если нужны Telegram Stars:
1. Изучите документацию: https://core.telegram.org/bots/payments#using-telegram-stars
2. Включите в .env: `STARS_ENABLED=true`
3. Реализуйте обработчик в `src/controllers/paymentController.js`:

```javascript
export async function handlePayStars(ctx) {
    // РЕАЛИЗОВАТЬ ПО ДОКУМЕНТАЦИИ TELEGRAM
}
```

### 4. **Тонкая настройка**

- Добавьте больше мемов в `src/memes/` (просто создайте новые JSON файлы)
- Настройте пакеты генераций (10, 100, 300 видео) в `src/config.js`
- Добавьте проверку на маты в имени (расширьте массив `badWords`)
- Настройте SSL сертификаты для webhook сервера (если нужно)

### 5. **Продакшен деплой**

Для деплоя на сервер:
1. Используйте PM2 для управления процессами
2. Настройте Nginx как reverse proxy
3. Добавьте логирование (Winston уже подключён)
4. Настройте мониторинг
5. Бекапы Redis базы данных

---

## 📋 ЧЕКЛИСТ ПЕРЕД ЗАПУСКОМ

- [ ] Создан .env файл с BOT_TOKEN
- [ ] Указан REDIS_URL (база 1, не 0!)
- [ ] Получен GOOGLE_VEO3_API_KEY
- [ ] Настроены PAYMENT_API и LAVA_PAYMENT_API
- [ ] Создан BOT_TOKEN_ADMIN
- [ ] В config.js указан правильный offerIdLava
- [ ] В config.js добавлены ID админов
- [ ] Redis запущен и доступен
- [ ] Реализована интеграция с Google Veo3 API
- [ ] Настроены webhook URLs для платежей

---

## 🆘 ВОЗМОЖНЫЕ ПРОБЛЕМЫ

### Бот не запускается
- Проверьте BOT_TOKEN в .env
- Убедитесь что Redis запущен: `redis-cli ping`

### Платежи не работают
- Проверьте API ключи в .env
- Убедитесь что webhook сервер запущен
- Проверьте, что webhook URLs настроены в личных кабинетах

### Генерация не работает
- Проверьте GOOGLE_VEO3_API_KEY
- Реализуйте интеграцию с Veo3 API (см. пункт "Что нужно доделать")
- Проверьте логи: `pm2 logs meemee-bot`

### Конфликт с оригинальным ботом
- Используйте разные базы Redis (в .env укажите `/1` вместо `/0`)
- Боты работают независимо друг от друга

---

## 📞 ПОДДЕРЖКА

Все основные компоненты готовы. Главное - **интегрировать Google Veo3 API** для генерации видео.

Для этого:
1. Изучите документацию на https://labs.google/flow/about
2. Замените заглушку в `src/services/Generation.service.js`
3. Протестируйте генерацию

Удачи! 🚀
