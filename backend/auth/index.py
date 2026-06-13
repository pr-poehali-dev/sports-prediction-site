"""
Регистрация, вход и профиль пользователя.
POST /register — регистрация (email, password, name)
POST /login    — вход (email, password) → token
GET  /profile  — профиль + купленные прогнозы (X-Auth-Token)
"""

import json
import os
import hashlib
import secrets
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def make_token(user_id: int, email: str) -> str:
    raw = f"{user_id}:{email}:{secrets.token_hex(16)}"
    return hashlib.sha256(raw.encode()).hexdigest()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    if method == "POST" and action == "register":
        return register(event)
    if method == "POST" and action == "login":
        return login(event)
    if method == "GET" and action == "profile":
        return profile(event)

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}


def register(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    email = body.get("email", "").strip().lower()
    password = body.get("password", "").strip()
    name = body.get("name", "").strip()

    if not email or not password:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажи email и пароль"})}
    if len(password) < 6:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Пароль минимум 6 символов"})}

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Этот email уже зарегистрирован"})}

    password_hash = hash_password(password)
    cur.execute(
        "INSERT INTO users (email, password_hash, name) VALUES (%s, %s, %s) RETURNING id",
        (email, password_hash, name),
    )
    user_id = cur.fetchone()[0]

    token = make_token(user_id, email)
    cur.execute(
        "UPDATE users SET password_hash = %s WHERE id = %s",
        (password_hash, user_id),
    )
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"success": True, "token": token, "user": {"id": user_id, "email": email, "name": name}}),
    }


def login(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    email = body.get("email", "").strip().lower()
    password = body.get("password", "").strip()

    if not email or not password:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажи email и пароль"})}

    password_hash = hash_password(password)

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, email, name FROM users WHERE email = %s AND password_hash = %s", (email, password_hash))
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный email или пароль"})}

    user_id, user_email, user_name = row
    token = f"{user_id}:{hash_password(email + password_hash)}"

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"success": True, "token": token, "user": {"id": user_id, "email": user_email, "name": user_name}}),
    }


def profile(event: dict) -> dict:
    headers = event.get("headers") or {}
    token = headers.get("X-Auth-Token") or headers.get("x-auth-token", "")

    if not token or ":" not in token:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    user_id_str = token.split(":")[0]
    if not user_id_str.isdigit():
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    user_id = int(user_id_str)

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("SELECT id, email, name, password_hash FROM users WHERE id = %s", (user_id,))
    user_row = cur.fetchone()
    if not user_row:
        cur.close()
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Пользователь не найден"})}

    uid, email, name, password_hash = user_row
    expected_token = f"{uid}:{hash_password(email + password_hash)}"
    if token != expected_token:
        cur.close()
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Не авторизован"})}

    cur.execute("""
        SELECT f.id, f.sport, f.sport_icon, f.match_name, f.league,
               f.match_date, f.odds, f.prediction, f.confidence, f.price,
               f.result, uf.granted_at
        FROM user_forecasts uf
        JOIN forecasts f ON f.id = uf.forecast_id
        WHERE uf.user_id = %s
        ORDER BY uf.granted_at DESC
    """, (user_id,))
    forecast_rows = cur.fetchall()
    cur.close()
    conn.close()

    forecasts = []
    for r in forecast_rows:
        forecasts.append({
            "id": r[0], "sport": r[1], "sport_icon": r[2], "match_name": r[3],
            "league": r[4], "match_date": r[5], "odds": r[6], "prediction": r[7],
            "confidence": r[8], "price": r[9], "result": r[10],
            "granted_at": r[11].isoformat() if r[11] else None,
        })

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"user": {"id": uid, "email": email, "name": name}, "forecasts": forecasts}),
    }