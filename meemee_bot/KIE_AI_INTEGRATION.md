# Интеграция с Kie.ai Sora 2 API - Завершена ✅

## Выполненные изменения

### 1. **Замена Google Veo 3 → Kie.ai Sora 2**

**Файл:** `/app/meemee_bot/src/services/Generation.service.js`

#### Изменения в конструкторе:
```javascript
// БЫЛО (Google Veo 3):
this.apiKey = process.env.GOOGLE_VEO3_API_KEY;
this.apiUrl = `https://generativelanguage.googleapis.com/v1beta`;
this.modelName = 'veo-3.1-generate-preview';

// СТАЛО (Kie.ai Sora 2):
this.apiKey = process.env.KIE_AI_API_KEY;
this.apiUrl = `https://api.kie.ai/api/v1/jobs`;
this.modelName = 'sora-2-text-to-video';
```

#### Метод generateVideo():
- **Endpoint:** `POST /api/v1/jobs/createTask`
- **Аутентификация:** Bearer token в заголовке
- **Параметры:**
  - `model`: "sora-2-text-to-video"
  - `input.prompt`: текстовый промпт (макс 5000 символов)
  - `input.aspect_ratio`: "landscape" (для 16:9)
  - `input.n_frames`: "10" (10 секунд видео)
  - `input.remove_watermark`: true

#### Метод pollVideoGeneration():
- **Endpoint:** `GET /api/v1/jobs/recordInfo?taskId={taskId}`
- **Интервал:** 10 секунд между проверками
- **Максимум попыток:** 60 (10 минут)
- **Статусы:**
  - `waiting` - ожидание
  - `queuing` - в очереди
  - `generating` - генерация
  - `success` - успешно завершено
  - `fail` - ошибка

### 2. **Переменные окружения**

**Файлы:** `.env` и `.env.example`

```bash
# УДАЛЕНЫ:
# GOOGLE_VEO3_API_KEY
# GOOGLE_VEO3_PROJECT_ID

# ДОБАВЛЕНА:
KIE_AI_API_KEY=your_kie_ai_api_key_here
```

### 3. **Тестирование**

✅ **createTask** - работает корректно
✅ **recordInfo** - правильный endpoint для проверки статуса
⚠️ **Требуется:** кредиты на аккаунте Kie.ai для генерации видео

## Структура API

### Создание задачи
```javascript
POST https://api.kie.ai/api/v1/jobs/createTask
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_API_KEY"
}
Body: {
  "model": "sora-2-text-to-video",
  "input": {
    "prompt": "описание видео",
    "aspect_ratio": "landscape",
    "n_frames": "10",
    "remove_watermark": true
  }
}
```

**Ответ:**
```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "taskId": "task_12345678"
  }
}
```

### Проверка статуса
```javascript
GET https://api.kie.ai/api/v1/jobs/recordInfo?taskId=task_12345678
Headers: {
  "Authorization": "Bearer YOUR_API_KEY"
}
```

**Ответ (успех):**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "taskId": "task_12345678",
    "state": "success",
    "resultJson": "{\"resultUrls\":[\"https://example.com/video.mp4\"]}",
    "createTime": 1698765400000,
    "completeTime": 1698765432000
  }
}
```

## Как использовать

1. **Получите API ключ** от Kie.ai
2. **Добавьте в .env:**
   ```bash
   KIE_AI_API_KEY=ваш_ключ_здесь
   ```
3. **Пополните баланс** на https://kie.ai (если нужно)
4. **Запустите бота:**
   ```bash
   cd /app/meemee_bot
   npm start
   ```

## Цены Kie.ai Sora 2

- **Sora 2:** $0.015/сек ($0.15 за 10 сек видео)
- **Sora 2 Pro 720p:** $0.045/сек
- **Sora 2 Pro 1080p:** $0.075/сек

На 60% дешевле официального API OpenAI! 🎉

## Проверка работы

После запуска бота проверьте логи:
```bash
tail -f /var/log/supervisor/backend.*.log
```

Должны видеть:
```
🎬 Starting video generation with Kie.ai Sora 2...
✅ Task created successfully. Task ID: xxx
⏳ Starting polling for task completion...
```

## Поддержка

- Email: support@kie.ai
- Документация: https://docs.kie.ai
- Dashboard: https://kie.ai (для проверки кредитов)
