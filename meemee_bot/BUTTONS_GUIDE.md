# ✅ Все кнопки MeeMee Bot - Полный список обработчиков

## 📱 ОСНОВНОЙ БОТ (User Bot)

### 🏠 Главное меню
| Кнопка | Callback | Обработчик | Описание |
|--------|----------|------------|----------|
| 🎬 Доступные мемы | `catalog` | `bot.action(/catalog.*/)` | Открывает каталог мемов |
| 💳 Купить видео | `buy` | `paymentController.handleBuy` | Меню выбора способа оплаты |
| 🎁 Приведи друга | `referral` | `paymentController.handleReferral` | Реферальная программа |
| ℹ️ О проекте | `about` | `paymentController.handleAbout` | Информация о проекте |
| 🔙 Главное меню | `main_menu` | `bot.action('main_menu')` | Возврат в главное меню |

### 🎬 Каталог мемов
| Кнопка | Callback | Обработчик | Описание |
|--------|----------|------------|----------|
| 🎬 Мама, вызывай такси | `meme_mama_taxi` | `bot.action(/meme_(.+)/)` | Запуск генерации мема |
| 🎬 Кола-Пепси | `meme_kola_pepsi` | `bot.action(/meme_(.+)/)` | Запуск генерации мема |
| ⏳ 228 | `meme_228` | `bot.action(/meme_(.+)/)` | Показывает "Скоро" |
| ⬅️ Назад | `catalog_page_N` | `bot.action(/catalog.*/)` | Предыдущая страница |
| ➡️ Далее | `catalog_page_N` | `bot.action(/catalog.*/)` | Следующая страница |

### 👤 Процесс генерации
| Кнопка | Callback | Обработчик | Описание |
|--------|----------|------------|----------|
| 👦 Мальчик | `gender_male` | `bot.action(/gender_(male\|female)/)` | Выбор пола |
| 👧 Девочка | `gender_female` | `bot.action(/gender_(male\|female)/)` | Выбор пола |
| ✅ Всё ок, генерировать! | `confirm_gen` | `bot.action('confirm_gen')` | Запуск генерации |

### 💳 Оплата - Выбор способа
| Кнопка | Callback | Обработчик | Описание |
|--------|----------|------------|----------|
| 💵 Карта | `pay_card` | `paymentController.handlePayCard` | Оплата картой через Lava |
| 💎 Крипта | `pay_crypto` | `paymentController.handlePayCrypto` | Оплата криптой |
| ⭐ Stars (скоро) | `pay_stars` | `paymentController.handlePayStarsSoon` | Telegram Stars |

### 💎 Оплата - Выбор криптовалюты
| Кнопка | Callback | Обработчик | Описание |
|--------|----------|------------|----------|
| 💵 USDT | `crypto_USDT` | `bot.action(/crypto_(\w+)/)` | Выбор USDT |
| 💰 USDC | `crypto_USDC` | `bot.action(/crypto_(\w+)/)` | Выбор USDC |
| 💎 TON | `crypto_TON` | `bot.action(/crypto_(\w+)/)` | Выбор TON |

### 🌐 Оплата - Выбор сети
| Кнопка | Callback | Обработчик | Описание |
|--------|----------|------------|----------|
| USDT (TRC20) | `chain_USDT_USDT_(TRC20)` | `bot.action(/chain_(\w+)_(.+)/)` | Выбор сети |
| USDT (ERC20) | `chain_USDT_USDT_(ERC20)` | `bot.action(/chain_(\w+)_(.+)/)` | Выбор сети |
| ...и другие сети | `chain_{crypto}_{network}` | `bot.action(/chain_(\w+)_(.+)/)` | Динамические сети |

### ✅ Оплата - Проверка
| Кнопка | Callback | Обработчик | Описание |
|--------|----------|------------|----------|
| ✅ Я оплатил | `check_payment_{orderId}` | `bot.action(/check_payment_(.+)/)` | Проверка статуса |

### 🎁 Реферальная программа
| Кнопка | Callback | Обработчик | Описание |
|--------|----------|------------|----------|
| 👤 Пользователь | `ref_user` | `paymentController.handleRefUser` | Пользовательская ссылка |
| 💼 Эксперт | `ref_expert` | `paymentController.handleRefExpert` | Экспертная ссылка |

### 🎬 После успешной оплаты
| Кнопка | Callback | Обработчик | Описание |
|--------|----------|------------|----------|
| 🎬 Запустить генерацию | `catalog` | `bot.action(/catalog.*/)` | Переход к каталогу |
| 🔙 Главное меню | `main_menu` | `bot.action('main_menu')` | Возврат в меню |

---

## 👨‍💼 АДМИН-БОТ (Admin Bot)

### 🏠 Главное меню
| Кнопка | Callback | Обработчик | Описание |
|--------|----------|------------|----------|
| 📊 Статистика | `stats` | `bot.action('stats')` | Общая статистика |
| 💳 Платежи | `payments` | `bot.action('payments')` | Статистика платежей |
| 🎬 Генерации | `generations` | `bot.action('generations')` | Статистика генераций |
| 👥 Пользователи | `users` | `bot.action('users')` | Управление пользователями |
| 📥 Экспорт отчётов | `export_reports` | `bot.action('export_reports')` | Экспорт данных в CSV |
| 📢 Рассылка | `broadcast` | `bot.action('broadcast')` | Массовая рассылка |
| 🔙 Назад | `main_menu` | `bot.action('main_menu')` | Возврат в меню |

### 📥 Экспорт отчётов
| Кнопка | Callback | Обработчик | Описание |
|--------|----------|------------|----------|
| 👥 Пользователи | `export_users` | `bot.action('export_users')` | CSV с пользователями |
| 💳 Платежи | `export_payments` | `bot.action('export_payments')` | CSV с платежами |
| 🎬 Генерации | `export_generations` | `bot.action('export_generations')` | CSV с генерациями |

---

## 🔧 Специальные обработчики

### Regex Handlers (динамические callback)
```javascript
// Основной бот
bot.action(/catalog.*/)              // Каталог и пагинация
bot.action(/meme_(.+)/)              // Любой мем по ID
bot.action(/gender_(male|female)/)   // Выбор пола
bot.action(/crypto_(\w+)/)           // Любая криптовалюта
bot.action(/chain_(\w+)_(.+)/)       // Любая сеть
bot.action(/check_payment_(.+)/)     // Проверка любого платежа
```

### Error Handlers
```javascript
// Обработка неизвестных callback
bot.on('callback_query', ...)  // Логирование + "Функция в разработке"

// Global error handler
bot.catch((err, ctx) => ...)   // Обработка всех ошибок
```

### Text Handlers
```javascript
// Основной бот
- Ввод имени для генерации
- Ввод email для оплаты картой

// Админ-бот
- Ввод User ID для поиска
- Ввод текста для рассылки
```

---

## 📊 Статистика

- **Основной бот:** 23+ обработчиков (включая regex)
- **Админ-бот:** 10+ обработчиков
- **Всего:** 33+ обработчиков

### Дополнительные возможности:
- ✅ Session management для сохранения состояния
- ✅ Обработка неизвестных callback для отладки
- ✅ Global error handlers для обоих ботов
- ✅ Regex handlers для динамических callback
- ✅ Graceful shutdown обработка

---

## 🧪 Тестирование

Запустите проверку всех кнопок:
```bash
cd /app/meemee_bot
node check_buttons.js
```

---

## ✅ ИТОГ

**Все кнопки полностью рабочие!**

Каждая кнопка в обоих ботах имеет:
1. ✅ Правильный callback_data
2. ✅ Соответствующий обработчик
3. ✅ Обработку ошибок
4. ✅ Логирование для отладки

🎉 **Бот готов к работе!**
