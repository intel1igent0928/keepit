from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException, Request
import httpx
import os
import json
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN", "")
ADMIN_CHAT_ID = os.getenv("ADMIN_CHAT_ID", "-5108588026") # Chat/group ID to receive feedback

app = FastAPI(title="KeepIt Notification Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

TG_API = f"https://api.telegram.org/bot{BOT_TOKEN}"


class NotifyRequest(BaseModel):
    tg_user_id: int
    text: str
    parse_mode: str = "HTML"

class FeedbackRequest(BaseModel):
    user_name: str
    user_id: int
    text: str


class ScheduledNotify(BaseModel):
    tg_user_id: int
    event: str          # 'salary_day' | 'salary_pending' | 'debt_reminder' | 'event_reminder'
    payload: dict = {}


@app.get("/health")
async def health():
    if not BOT_TOKEN:
        return {"status": "degraded", "reason": "BOT_TOKEN not set"}
    return {"status": "ok", "bot_configured": True}


@app.post("/notify")
async def send_notification(req: NotifyRequest):
    """
    Send a message to the Telegram user.
    Called by the Mini App on key events:
      - salary confirmed / dismissed
      - debt added / closed
      - big expense added
      - savings goal reached
    """
    if not BOT_TOKEN:
        raise HTTPException(status_code=500, detail="BOT_TOKEN not configured on server")

    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{TG_API}/sendMessage",
            json={
                "chat_id": req.tg_user_id,
                "text": req.text,
                "parse_mode": req.parse_mode,
            },
        )

    data = resp.json()
    if not data.get("ok"):
        # Telegram returned an error (e.g. user hasn't started the bot)
        raise HTTPException(status_code=400, detail=data.get("description", "Telegram API error"))

    return {"ok": True, "message_id": data["result"]["message_id"]}


@app.post("/notify/salary-reminder")
async def salary_reminder(req: ScheduledNotify):
    """Called on salary day — asks user if salary arrived."""
    text = (
        "💰 <b>Сегодня день зарплаты!</b>\n\n"
        "Откройте KeepIt и подтвердите получение зарплаты, "
        "чтобы баланс обновился и авто-накопления перешли в копилку. 🏦"
    )
    return await send_notification(NotifyRequest(tg_user_id=req.tg_user_id, text=text))


@app.post("/notify/debt-reminder")
async def debt_reminder(req: ScheduledNotify):
    """Remind about unpaid debts."""
    name = req.payload.get("name", "")
    amount = req.payload.get("amount", 0)
    debt_type = req.payload.get("type", "owe")
    emoji = "💸" if debt_type == "owe" else "🤝"
    who = "должны вы" if debt_type == "owe" else "должны вам"
    text = (
        f"{emoji} <b>Напоминание о долге</b>\n\n"
        f"<b>{name}</b> — {who}: <code>{amount:,} сум</code>\n\n"
        "Откройте KeepIt → Долги для подробностей."
    )
    return await send_notification(NotifyRequest(tg_user_id=req.tg_user_id, text=text))


@app.post("/notify/event-reminder")
async def event_reminder(req: ScheduledNotify):
    """Remind about upcoming events."""
    event_name = req.payload.get("name", "")
    days_left = req.payload.get("days_left", 0)
    budget = req.payload.get("budget", 0)
    text = (
        f"🎉 <b>Событие через {days_left} дн.</b>\n\n"
        f"<b>{event_name}</b>\n"
        + (f"Бюджет на подарок: <code>{budget:,} сум</code>" if budget else "")
        + "\n\nОткройте KeepIt → История для деталей."
    )
    return await send_notification(NotifyRequest(tg_user_id=req.tg_user_id, text=text))

@app.post("/api/feedback")
async def api_feedback(req: FeedbackRequest):
    """Receive feedback directly via POST request from Mini App."""
    if not ADMIN_CHAT_ID:
        return {"ok": False, "error": "Admin chat ID not set"}
    
    user_info = f"@{req.user_name} (ID: {req.user_id})" if req.user_name != "Аноним" else f"ID: {req.user_id}"
    msg = f"💡 <b>Новая идея/жалоба!</b>\n\nОт: {user_info}\nТекст: {req.text}"
    res = await send_notification(NotifyRequest(tg_user_id=int(ADMIN_CHAT_ID), text=msg))
    return {"ok": True, "result": res}

@app.post("/webhook")
async def telegram_webhook(req: Request):
    """Receive updates from Telegram Bot."""
    try:
        update = await req.json()
    except:
        return {"ok": True}
        
    message = update.get("message", {})
    
    # 1. Handle Admin Reply to Feedback
    if "reply_to_message" in message and "text" in message:
        reply_orig = message["reply_to_message"]
        orig_text = reply_orig.get("text", "")
        if "Новая идея/жалоба!" in orig_text and "ID:" in orig_text:
            import re
            match = re.search(r"ID:\s*(\d+)", orig_text)
            if match:
                user_id_to_reply = int(match.group(1))
                admin_text = message["text"]
                reply_msg = f"📩 <b>Ответ от разработчика:</b>\n\n{admin_text}"
                try:
                    await send_notification(NotifyRequest(tg_user_id=user_id_to_reply, text=reply_msg))
                    # Optionally confirm to admin
                    await send_notification(NotifyRequest(tg_user_id=message["chat"]["id"], text="✅ Ответ успешно отправлен пользователю!"))
                except Exception as e:
                    await send_notification(NotifyRequest(tg_user_id=message["chat"]["id"], text=f"❌ Ошибка отправки ответа: {e}"))
                return {"ok": True}

    # 2. Handle web_app_data (Fallback if used)
    if "web_app_data" in message:
        data_str = message["web_app_data"].get("data", "{}")
        user = message.get("from", {})
        try:
            data = json.loads(data_str)
            if data.get("action") == "feedback" and ADMIN_CHAT_ID:
                text = data.get("text", "")
                user_info = f"@{user.get('username')} (ID: {user.get('id')})" if user.get("username") else f"{user.get('first_name')} (ID: {user.get('id')})"
                msg = f"💡 <b>Новая идея/жалоба!</b>\n\nОт: {user_info}\nТекст: {text}"
                await send_notification(NotifyRequest(tg_user_id=int(ADMIN_CHAT_ID), text=msg))
        except Exception as e:
            print("Error parsing web_app_data:", e)
            
    # 3. Handle /start command
    if "text" in message and message["text"].startswith("/start"):
        user_id = message.get("from", {}).get("id")
        user_lang = message.get("from", {}).get("language_code", "en")
        
        if user_lang and user_lang.startswith("ru"):
            text = (
                "👋 <b>Добро пожаловать в KeepIt!</b>\n\n"
                "Я — ваш умный финансовый помощник. 💰\n\n"
                "🚀 <b>Что я умею:</b>\n"
                "• Распределять бюджет до копейки\n"
                "• Автоматически копить деньги 🏦\n"
                "• Напоминать о долгах и подписках 🤝\n"
                "• Планировать важные события 🎉\n\n"
                "👇 Нажмите кнопку <b>«Открыть / Open»</b> внизу, чтобы начать работу!"
            )
        else:
            text = (
                "👋 <b>Welcome to KeepIt!</b>\n\n"
                "I am your smart financial assistant. 💰\n\n"
                "🚀 <b>What I can do:</b>\n"
                "• Calculate your daily budget\n"
                "• Automatically save your money 🏦\n"
                "• Track and remind you about debts 🤝\n"
                "• Plan future events and expenses 🎉\n\n"
                "👇 Click the <b>«Open»</b> button below to get started!"
            )
            
        if user_id:
            try:
                await send_notification(NotifyRequest(tg_user_id=user_id, text=text))
            except:
                pass

    return {"ok": True}
