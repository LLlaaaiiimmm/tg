# 🚀 Инструкция по деплою сайта ФК "Александрія"

## Шаг 1: Подготовка MongoDB (5 минут)

1. Зайди на https://www.mongodb.com/cloud/atlas/register
2. Создай бесплатный аккаунт
3. Создай кластер (выбери FREE tier)
4. В разделе "Database Access" создай пользователя:
   - Username: `alexandria_admin`
   - Password: (придумай и сохрани)
5. В разделе "Network Access" добавь `0.0.0.0/0` (доступ отовсюду)
6. Нажми "Connect" → "Connect your application"
7. Скопируй connection string (будет вида: `mongodb+srv://alexandria_admin:PASSWORD@cluster0.xxxxx.mongodb.net/`)

## Шаг 2: Деплой Backend на Render.com (10 минут)

1. Зайди на https://render.com и зарегистрируйся через GitHub
2. Подключи свой GitHub репозиторий с проектом
3. Нажми "New +" → "Web Service"
4. Выбери свой репозиторий
5. Настройки:
   - **Name**: `alexandria-fc-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
6. Добавь Environment Variables:
   - `MONGO_URL` = (твой connection string из Шага 1)
   - `DB_NAME` = `alexandria_fc_db`
   - `CORS_ORIGINS` = `*`
   - `JWT_SECRET_KEY` = `alexandria-fc-secret-key-2024-change-in-production`
7. Нажми "Create Web Service"
8. Дождись деплоя (5-10 минут)
9. **СОХРАНИ URL** (будет вида: `https://alexandria-fc-backend.onrender.com`)

## Шаг 3: Настройка Frontend

1. Открой файл `frontend/.env`
2. Замени `REACT_APP_BACKEND_URL` на URL из Шага 2:
   ```
   REACT_APP_BACKEND_URL=https://alexandria-fc-backend.onrender.com
   ```
3. Сохрани изменения
4. Закоммить и запушь в GitHub:
   ```bash
   git add .
   git commit -m "Update backend URL"
   git push
   ```

## Шаг 4: Деплой Frontend на Vercel (5 минут)

1. Зайди на https://vercel.com и зарегистрируйся через GitHub
2. Нажми "Add New..." → "Project"
3. Выбери свой репозиторий
4. Настройки:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `yarn build`
   - **Output Directory**: `build`
5. Environment Variables:
   - `REACT_APP_BACKEND_URL` = (URL из Шага 2)
   - `REACT_APP_ENABLE_VISUAL_EDITS` = `false`
   - `ENABLE_HEALTH_CHECK` = `false`
6. Нажми "Deploy"
7. Дождись деплоя (3-5 минут)
8. **ГОТОВО!** Твой сайт доступен по URL от Vercel

## Шаг 5: Обновление CORS на Backend

1. Вернись в Render.com → твой backend сервис
2. Зайди в "Environment"
3. Измени `CORS_ORIGINS` на URL твоего frontend от Vercel:
   ```
   CORS_ORIGINS=https://твой-сайт.vercel.app
   ```
4. Сохрани (сервис перезапустится автоматически)

## 🎉 Готово!

Твой сайт работает:
- **Frontend**: https://твой-сайт.vercel.app
- **Backend API**: https://alexandria-fc-backend.onrender.com
- **Админ-панель**: https://твой-сайт.vercel.app/admin/login

### Данные для входа в админку:
- Email: `fcoleksandria2133@fc.com`
- Пароль: `Jingle2018!!!`

## 📝 Важные заметки:

1. **Бесплатный tier Render.com** засыпает после 15 минут неактивности. Первый запрос может быть медленным (30 сек).
2. Для production рекомендую перейти на платный план ($7/мес) или использовать VPS.
3. Все данные хранятся в MongoDB Atlas (бесплатно до 512MB).

## 🔄 Как обновлять сайт:

Просто пуш в GitHub:
```bash
git add .
git commit -m "Update"
git push
```

Vercel и Render автоматически задеплоят изменения!

## ❓ Проблемы?

- Backend не запускается → проверь MONGO_URL
- Frontend не видит данные → проверь CORS_ORIGINS
- Ошибка авторизации → проверь JWT_SECRET_KEY
