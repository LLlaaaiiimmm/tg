# ⚡ БЫСТРАЯ ПАМЯТКА - MeeMee Bot

## 🚀 Запуск webhook сервера (ЭТО УЖЕ СДЕЛАНО ✅)

```bash
cd /app/meemee_bot
node src/backend/index.js > /tmp/webhook.log 2>&1 &
```

**Проверка:**
```bash
curl http://localhost:3000/health
```

---

## 📊 Проверка статуса

```bash
cd /app/meemee_bot
bash check_status.sh
```

---

## 📜 Просмотр логов webhook

```bash
# В реальном времени
tail -f /tmp/webhook.log

# Последние 50 строк
tail -50 /tmp/webhook.log

# Ошибки
grep "❌" /tmp/webhook.log | tail -20
```

---

## 👤 Добавить видео клиенту

```bash
cd /app/meemee_bot
node add_quota_manually.js <USER_ID> <КОЛИЧЕСТВО>
```

**Пример:**
```bash
node add_quota_manually.js 1916527652 50
```

---

## 🔄 Перезапуск webhook

```bash
pkill -f "backend/index.js"
cd /app/meemee_bot
node src/backend/index.js > /tmp/webhook.log 2>&1 &
```

---

## 🛑 Остановка webhook

```bash
pkill -f "backend/index.js"
```

---

## 🔍 Проверка клиента

```bash
redis-cli GET "user:1916527652" | python3 -m json.tool
```

---

## 📚 Полная шпаргалка

```bash
bash /app/meemee_bot/commands_cheatsheet.sh
```

---

## ✅ ТЕКУЩИЙ СТАТУС

- ✅ Redis: Работает
- ✅ Webhook сервер: Запущен на порту 3000
- ✅ Клиент 1916527652: 50 видео добавлено
- ⚠️ MeeMee бот: Не запущен (не критично для webhook)

---

## 🎯 Осталось сделать

1. **Уведомить клиента 1916527652** - отправьте сообщение что видео добавлены
2. **Проверить цены** в `/app/meemee_bot/src/config.js` (клиент заплатил 2.5 USDT за 50 видео)

---

**Всё готово к работе!** 🚀
