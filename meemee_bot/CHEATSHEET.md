# 🚀 MeeMee Bot - Краткая шпаргалка

## ⚡ Быстрый старт (ВСЁ В ОДНОЙ КОМАНДЕ)

```bash
cd /app/meemee_bot && bash check_and_start.sh
```

Эта команда автоматически:
- ✅ Проверит все зависимости
- ✅ Запустит Redis
- ✅ Запустит бота и webhook сервер
- ✅ Покажет статус всех сервисов

---

## 🌐 Настройка публичных webhook'ов

```bash
cd /app/meemee_bot && bash setup_ngrok.sh
```

Скрипт:
- Установит ngrok (если не установлен)
- Запустит ngrok для порта 3000
- Покажет публичные URL для настройки в Lava и 0xProcessing

---

## 📋 Основные команды

### Статус сервисов
```bash
sudo supervisorctl status | grep meemee
```

### Перезапуск
```bash
# Всё сразу
sudo supervisorctl restart meemee_bot meemee_webhook

# По отдельности
sudo supervisorctl restart meemee_bot
sudo supervisorctl restart meemee_webhook
```

### Остановка
```bash
sudo supervisorctl stop meemee_bot meemee_webhook
```

### Запуск
```bash
sudo supervisorctl start meemee_bot meemee_webhook
```

---

## 📊 Логи

### Просмотр логов в реальном времени
```bash
# Бот
tail -f /var/log/supervisor/meemee_bot.out.log

# Webhook
tail -f /var/log/supervisor/meemee_webhook.out.log

# Ошибки бота
tail -f /var/log/supervisor/meemee_bot.err.log

# Ошибки webhook
tail -f /var/log/supervisor/meemee_webhook.err.log
```

### Последние 50 строк логов
```bash
tail -50 /var/log/supervisor/meemee_bot.out.log
tail -50 /var/log/supervisor/meemee_webhook.out.log
```

---

## 🔧 Redis

### Проверка Redis
```bash
redis-cli ping
# Должен ответить: PONG
```

### Запуск Redis
```bash
redis-server --daemonize yes
```

### Просмотр данных в Redis
```bash
redis-cli

# В Redis CLI:
KEYS *                          # Все ключи
KEYS user:*                     # Все пользователи
KEYS order:*                    # Все заказы
GET user:123456789              # Данные пользователя
GET order:FIAT-20251103-...     # Данные заказа
```

---

## 🧪 Тестирование

### Проверка webhook сервера
```bash
# Health check
curl http://localhost:3000/health

# Lava webhook (GET)
curl http://localhost:3000/webhook/lava

# Crypto webhook (GET)
curl http://localhost:3000/webhook/crypto
```

### Тестовый webhook запрос
```bash
# Lava
curl -X POST http://localhost:3000/webhook/lava \
  -H "Content-Type: application/json" \
  -d '{"id": "test123", "status": "success", "email": "test@test.com"}'

# Crypto
curl -X POST http://localhost:3000/webhook/crypto \
  -H "Content-Type: application/json" \
  -d '{"billingID": "test123", "status": "success"}'
```

---

## 🌐 Ngrok

### Запуск ngrok
```bash
# Интерактивно (в отдельном терминале)
ngrok http 3000

# В фоне
nohup ngrok http 3000 > /tmp/ngrok.log 2>&1 &
```

### Получить ngrok URL
```bash
curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*"' | head -1 | cut -d'"' -f4
```

### Остановить ngrok
```bash
pkill ngrok
```

### Ngrok дашборд
Откройте в браузере: http://localhost:4040

---

## 🛠 Редактирование конфигурации

### Редактировать .env
```bash
nano /app/meemee_bot/.env
# После изменений перезапустите сервисы
```

### Редактировать config.js (Offer ID)
```bash
nano /app/meemee_bot/src/config.js
# После изменений перезапустите бота
```

---

## 🔍 Поиск проблем

### Бот не отвечает
```bash
# 1. Проверьте статус
sudo supervisorctl status meemee_bot

# 2. Проверьте логи
tail -50 /var/log/supervisor/meemee_bot.err.log

# 3. Проверьте Redis
redis-cli ping

# 4. Перезапустите
sudo supervisorctl restart meemee_bot
```

### Webhook не получает платежи
```bash
# 1. Проверьте сервер
curl http://localhost:3000/health

# 2. Проверьте ngrok
curl http://localhost:4040/api/tunnels

# 3. Проверьте логи
tail -50 /var/log/supervisor/meemee_webhook.out.log
```

### Ошибка 404 при создании платежа
```bash
# 1. Проверьте Offer ID
cat /app/meemee_bot/src/config.js | grep offerIdLava

# 2. Проверьте API ключ
cat /app/meemee_bot/.env | grep LAVA_PAYMENT_API

# 3. Перезапустите бота
sudo supervisorctl restart meemee_bot
```

---

## 📁 Важные файлы

| Файл | Описание |
|------|----------|
| `/app/meemee_bot/.env` | Переменные окружения (API ключи) |
| `/app/meemee_bot/src/config.js` | Конфигурация (Offer ID, пакеты) |
| `/app/meemee_bot/src/bot_start.js` | Главный файл бота |
| `/app/meemee_bot/src/backend/index.js` | Webhook сервер |
| `/etc/supervisor/conf.d/meemee.conf` | Supervisor конфигурация |

---

## 📚 Полная документация

- **Полное руководство:** `/app/meemee_bot/START_PROJECT.md`
- **Настройка webhook:** `/app/meemee_bot/WEBHOOK_SETUP.md`
- **Эта шпаргалка:** `/app/meemee_bot/CHEATSHEET.md`

---

## 🆘 Экстренное восстановление

Если всё сломалось:

```bash
# 1. Остановите всё
sudo supervisorctl stop meemee_bot meemee_webhook

# 2. Запустите Redis
redis-server --daemonize yes
redis-cli ping

# 3. Проверьте и запустите
cd /app/meemee_bot
bash check_and_start.sh

# 4. Настройте ngrok (если нужно)
bash setup_ngrok.sh
```

---

## ✅ Чек-лист перед запуском

```bash
# Скопируйте и вставьте эту команду для проверки всего:

echo "=== Проверка статуса MeeMee Bot ===" && \
echo "Redis: $(redis-cli ping 2>&1)" && \
echo "Bot: $(sudo supervisorctl status meemee_bot | awk '{print $2}')" && \
echo "Webhook: $(sudo supervisorctl status meemee_webhook | awk '{print $2}')" && \
echo "Health: $(curl -s http://localhost:3000/health | grep -o 'ok' || echo 'ERROR')" && \
echo "====================================="
```

Должен вывести:
```
=== Проверка статуса MeeMee Bot ===
Redis: PONG
Bot: RUNNING
Webhook: RUNNING
Health: ok
=====================================
```

---

**Удачи! 🚀**
