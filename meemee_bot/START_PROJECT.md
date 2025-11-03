# 🚀 MeeMee Bot - Полное руководство по запуску

## 📋 Содержание
1. [Проверка текущего состояния](#1-проверка-текущего-состояния)
2. [Установка зависимостей](#2-установка-зависимостей)
3. [Настройка переменных окружения](#3-настройка-переменных-окружения)
4. [Настройка Offer ID в Lava](#4-настройка-offer-id-в-lava)
5. [Запуск сервисов](#5-запуск-сервисов)
6. [Настройка публичных webhook'ов](#6-настройка-публичных-webhookов)
7. [Тестирование](#7-тестирование)
8. [Мониторинг и отладка](#8-мониторинг-и-отладка)

---

## 1. Проверка текущего состояния

### Проверьте, что все файлы на месте:
```bash
cd /app/meemee_bot
ls -la
```

Должны быть папки: `src/`, `test/`, файлы `package.json`, `.env`

### Проверьте Node.js и yarn:
```bash
node --version   # Должно быть >= v16
yarn --version   # Должно быть >= 1.22
```

---

## 2. Установка зависимостей

### Установите Redis (если не установлен):
```bash
sudo apt-get update
sudo apt-get install -y redis-server
redis-server --version
```

### Установите Node.js зависимости:
```bash
cd /app/meemee_bot
yarn install
```

Должно установиться без ошибок.

---

## 3. Настройка переменных окружения

### Проверьте файл .env:
```bash
cat /app/meemee_bot/.env
```

**Обязательные переменные:**
```env
# Бот
BOT_TOKEN=ваш_токен_бота_от_BotFather
BOT_NAME=имя_бота_без_@

# Redis
REDIS_URL=redis://127.0.0.1:6379/0

# API для генерации видео
KIE_AI_API_KEY=ваш_ключ_api

# Криптоплатежи (0xProcessing)
PAYMENT_API=ваш_ключ_0xprocessing
MERCHANT_ID=ваш_merchant_id

# Фиат платежи (Lava)
LAVA_PAYMENT_API=ваш_ключ_lava

# Webhook безопасность
WEBHOOK_USERNAME=webhook_user
WEBHOOK_PASSWORD=сложный_пароль
WEBHOOK_PASSWORD_PROCESSING=секретная_строка_для_MD5

# Поддержка
SUPPORT_USERNAME=username_поддержки_без_@

# Опционально
FREE_QUOTA_PER_USER=1
REFERRAL_ENABLED=true
REFERRAL_BONUS_GENERATIONS=1
EXPERT_REFERRAL_CASHBACK_PERCENT=50
```

### Если .env не существует, создайте его:
```bash
cp /app/meemee_bot/.env.example /app/meemee_bot/.env
nano /app/meemee_bot/.env
# Заполните все переменные
```

---

## 4. Настройка Offer ID в Lava

### 4.1. Создайте офферы в Lava

1. Зайдите на https://gate.lava.top/
2. Войдите в личный кабинет
3. Перейдите в раздел **"Товары"** → **"Создать товар"**

**Создайте 4 оффера (или 1 универсальный):**

| Пакет | Цена | Описание |
|-------|------|----------|
| single | 580₽ | 1 видео |
| pack_5 | 2900₽ | 5 видео |
| pack_10 | 5800₽ | 10 видео |
| pack_50 | 29000₽ | 50 видео |

4. Скопируйте **Offer ID** из URL каждого товара
5. Обновите файл `/app/meemee_bot/src/config.js`:

```bash
nano /app/meemee_bot/src/config.js
```

Найдите секцию `PACKAGES` и замените `offerIdLava`:

```javascript
export const PACKAGES = {
    single: {
        // ...
        offerIdLava: 'ваш-offer-id-для-single'
    },
    pack_5: {
        // ...
        offerIdLava: 'ваш-offer-id-для-pack5'
    },
    // и т.д.
};
```

---

## 5. Запуск сервисов

### 5.1. Запустите Redis
```bash
# Проверьте, запущен ли Redis
redis-cli ping
# Если ответ "PONG" - всё ок

# Если не запущен:
redis-server --daemonize yes
redis-cli ping  # Проверьте снова
```

### 5.2. Настройте Supervisor

Скопируйте конфигурацию:
```bash
sudo cp /app/meemee_bot/supervisor_meemee.conf /etc/supervisor/conf.d/meemee.conf
```

Обновите Supervisor:
```bash
sudo supervisorctl reread
sudo supervisorctl update
```

### 5.3. Запустите все сервисы
```bash
sudo supervisorctl start meemee_bot
sudo supervisorctl start meemee_webhook
```

### 5.4. Проверьте статус
```bash
sudo supervisorctl status | grep meemee
```

Должно быть:
```
meemee_bot       RUNNING   pid 1234, uptime 0:00:05
meemee_webhook   RUNNING   pid 1235, uptime 0:00:05
```

---

## 6. Настройка публичных webhook'ов

### Вариант 1: Использование ngrok (для тестирования) ⭐ РЕКОМЕНДУЕТСЯ

#### 6.1. Зарегистрируйтесь на ngrok
1. Зайдите на https://ngrok.com/
2. Зарегистрируйтесь (бесплатно)
3. Скопируйте ваш **Authtoken** из дашборда

#### 6.2. Установите и настройте ngrok
```bash
# Уже установлен, просто добавьте токен:
ngrok config add-authtoken ваш-токен-из-ngrok
```

#### 6.3. Запустите ngrok
```bash
# В новом терминале или в фоне:
nohup ngrok http 3000 > /tmp/ngrok.log 2>&1 &

# Подождите 5 секунд и получите URL:
sleep 5
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4
```

Вы получите URL типа: `https://abc123.ngrok-free.app`

#### 6.4. Настройте webhook в Lava
1. Зайдите на https://gate.lava.top/
2. Перейдите в **"Настройки"** → **"Webhook"**
3. Введите URL: `https://abc123.ngrok-free.app/webhook/lava`
4. Сохраните

#### 6.5. Настройте webhook в 0xProcessing
1. Зайдите на https://app.0xprocessing.com/
2. Перейдите в **"Settings"** → **"Webhook URL"**
3. Введите URL: `https://abc123.ngrok-free.app/webhook/crypto`
4. Сохраните

### Вариант 2: Использование своего домена с SSL

Если у вас есть домен:
1. Настройте A-запись домена на IP: `35.184.53.215`
2. Установите SSL сертификат (Let's Encrypt)
3. Настройте Nginx proxy на порт 3000
4. Используйте URL: `https://yourdomain.com/webhook/lava`

---

## 7. Тестирование

### 7.1. Проверьте webhook сервер
```bash
# Локально
curl http://localhost:3000/health
# Должен ответить: {"status":"ok","timestamp":"..."}

curl http://localhost:3000/webhook/lava
# Должен ответить: {"status":"ready",...}
```

### 7.2. Проверьте бота
1. Откройте Telegram
2. Найдите вашего бота: `@meemee12_bot`
3. Нажмите `/start`
4. Должно появиться меню с кнопками

### 7.3. Тестовая оплата

**ВАЖНО:** Перед реальной оплатой проверьте тестовый webhook:

```bash
# Создайте тестовый заказ вручную в Redis:
redis-cli SET "order:TEST-123" '{
  "orderId": "TEST-123",
  "userId": 123456789,
  "email": "test@test.com",
  "package": "single",
  "amount": 580,
  "isPaid": false
}'

# Отправьте тестовый webhook:
curl -X POST http://localhost:3000/webhook/lava \
  -H "Content-Type: application/json" \
  -d '{
    "id": "lava-test-123",
    "status": "success",
    "email": "test@test.com"
  }'

# Проверьте логи:
tail -20 /var/log/supervisor/meemee_webhook.out.log
```

### 7.4. Реальная оплата
1. В боте нажмите **"💳 Купить видео"**
2. Выберите пакет (например, "1 видео")
3. Выберите **"💵 Карта"**
4. Введите email
5. Выберите тип карты (российская/международная)
6. Нажмите **"✅ Оплатить"**
7. Перейдите по ссылке и оплатите

**После оплаты:**
- Lava отправит webhook на ваш URL
- Webhook сервер обработает платеж
- Пользователю добавятся генерации
- Проверьте в боте: **"👤 Личный кабинет"**

---

## 8. Мониторинг и отладка

### 8.1. Логи в реальном времени

```bash
# Логи бота
tail -f /var/log/supervisor/meemee_bot.out.log

# Ошибки бота
tail -f /var/log/supervisor/meemee_bot.err.log

# Логи webhook
tail -f /var/log/supervisor/meemee_webhook.out.log

# Ошибки webhook
tail -f /var/log/supervisor/meemee_webhook.err.log
```

### 8.2. Проверка статуса сервисов

```bash
# Все сервисы
sudo supervisorctl status

# Только MeeMee
sudo supervisorctl status | grep meemee

# Redis
redis-cli ping

# Проверка портов
sudo netstat -tulpn | grep -E "3000|6379"
```

### 8.3. Перезапуск сервисов

```bash
# Перезапуск бота
sudo supervisorctl restart meemee_bot

# Перезапуск webhook
sudo supervisorctl restart meemee_webhook

# Перезапуск всего
sudo supervisorctl restart meemee_bot meemee_webhook

# Остановка
sudo supervisorctl stop meemee_bot meemee_webhook

# Запуск
sudo supervisorctl start meemee_bot meemee_webhook
```

### 8.4. Проверка Redis

```bash
# Подключение к Redis
redis-cli

# В Redis CLI:
KEYS *                    # Посмотреть все ключи
GET user:123456789       # Получить данные пользователя
KEYS order:*             # Посмотреть все заказы
GET order:FIAT-...       # Получить данные заказа
```

### 8.5. Типичные проблемы и решения

#### Проблема: Бот не отвечает
```bash
# Проверьте логи
tail -50 /var/log/supervisor/meemee_bot.err.log

# Проверьте BOT_TOKEN
grep BOT_TOKEN /app/meemee_bot/.env

# Перезапустите
sudo supervisorctl restart meemee_bot
```

#### Проблема: Webhook не получает платежи
```bash
# Проверьте, работает ли сервер
curl http://localhost:3000/health

# Проверьте ngrok
curl http://localhost:4040/api/tunnels

# Проверьте логи
tail -50 /var/log/supervisor/meemee_webhook.out.log
```

#### Проблема: Redis connection refused
```bash
# Запустите Redis
redis-server --daemonize yes

# Проверьте
redis-cli ping

# Перезапустите бота
sudo supervisorctl restart meemee_bot
```

#### Проблема: Ошибка 404 при создании платежа
```bash
# Проверьте Offer ID в config.js
cat /app/meemee_bot/src/config.js | grep offerIdLava

# Проверьте API ключ Lava
grep LAVA_PAYMENT_API /app/meemee_bot/.env

# Перезапустите бота
sudo supervisorctl restart meemee_bot
```

---

## 9. Быстрая команда для полного рестарта

Создайте скрипт для быстрого перезапуска:

```bash
cat > /app/meemee_bot/restart.sh << 'SCRIPT'
#!/bin/bash
echo "🔄 Перезапуск MeeMee Bot..."

# Проверка Redis
redis-cli ping > /dev/null 2>&1 || redis-server --daemonize yes

# Перезапуск сервисов
sudo supervisorctl restart meemee_bot meemee_webhook

sleep 3

# Проверка статуса
echo "📊 Статус сервисов:"
sudo supervisorctl status | grep meemee

echo "✅ Готово!"
SCRIPT

chmod +x /app/meemee_bot/restart.sh
```

Использование:
```bash
/app/meemee_bot/restart.sh
```

---

## 10. Чек-лист перед запуском

- [ ] Node.js установлен (>= v16)
- [ ] Yarn установлен (>= 1.22)
- [ ] Redis установлен и запущен
- [ ] Все зависимости установлены (`yarn install`)
- [ ] `.env` файл настроен со всеми ключами
- [ ] Offer ID настроены в `config.js`
- [ ] Supervisor конфиг скопирован
- [ ] Сервисы запущены (бот + webhook)
- [ ] Ngrok запущен (или домен настроен)
- [ ] Webhook URL настроены в Lava и 0xProcessing
- [ ] Тестовый платёж прошёл успешно

---

## 📞 Поддержка

Если что-то не работает:
1. Проверьте логи (раздел 8.1)
2. Проверьте статус сервисов (раздел 8.2)
3. Посмотрите типичные проблемы (раздел 8.5)
4. Напишите в поддержку: @${SUPPORT_USERNAME}

---

**Удачи! 🚀**
