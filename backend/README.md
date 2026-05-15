# KeepIt Backend — Инструкция запуска

## Что это?
FastAPI сервер, который принимает запросы от Mini App и отправляет уведомления пользователю через Telegram Bot API. Пользователю ничего настраивать не нужно — всё работает автоматически.

## Архитектура
```
Telegram → Mini App → POST /notify → FastAPI → Telegram Bot API → Пользователь
```

## Шаг 1 — Создай бота
1. Открой [@BotFather](https://t.me/BotFather) в Telegram
2. Отправь `/newbot`
3. Придумай имя: `KeepIt Finance Bot`
4. Придумай username: `keepit_finance_bot`
5. Скопируй **токен**: `1234567890:AAxxxxxxxx...`

## Шаг 2 — Настрой сервер

```bash
cd backend

# Установи зависимости
pip install -r requirements.txt

# Создай .env файл
cp .env.example .env
# Открой .env и вставь свой BOT_TOKEN
```

## Шаг 3 — Запусти

```bash
# Локально (для разработки)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Проверь что работает
curl http://localhost:8000/health
# → {"status":"ok","bot_configured":true}
```

## Шаг 4 — Деплой (на сервер)

### Вариант А: Railway.app (бесплатно)
1. Зайди на [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Добавь переменную `BOT_TOKEN` в Settings → Variables
4. Скопируй URL вида `https://keepit-backend.up.railway.app`

### Вариант Б: VPS (любой)
```bash
# На сервере
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

# С nginx proxy + systemd для автозапуска
```

## Шаг 5 — Обнови frontend

В файле `app.jsx` измени строку:
```js
const BACKEND_URL = 'http://localhost:8000';
// На:
const BACKEND_URL = 'https://your-railway-url.up.railway.app';
```

## API Endpoints

| Метод | URL | Описание |
|-------|-----|----------|
| GET | `/health` | Проверка состояния |
| POST | `/notify` | Отправить произвольное уведомление |
| POST | `/notify/salary-reminder` | Напоминание о зарплате |
| POST | `/notify/debt-reminder` | Напоминание о долге |
| POST | `/notify/event-reminder` | Напоминание о событии |

## Когда отправляются уведомления?

| Событие | Сообщение в боте |
|---------|------------------|
| ✅ Зарплата подтверждена | "💰 Зарплата 4М получена! Авто-откложено 2М в копилку" |
| ⏰ Зарплата ещё не пришла | "⏰ Зарплата ещё не поступила. Напомним завтра" |
| 💸 Добавлен долг | "💸 Новый долг: Алишер — 500,000 UZS" |
| ✅ Долг закрыт | "✅ Долг закрыт! Алишер — 500,000 UZS" |
| 📤 Крупный расход | "📤 Крупный расход: Телефон — 2,000,000 UZS" |

## Важно
- Пользователь должен **сначала написать боту** (иначе бот не сможет отправить сообщение)
- Mini App автоматически берёт `tg_user_id` из `window.Telegram.WebApp.initDataUnsafe.user.id`
- Никакой регистрации не нужно — всё определяется автоматически
