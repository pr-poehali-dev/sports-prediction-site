"""
CRUD для прогнозов на спорт.
GET /        — список активных прогнозов (публично)
POST /       — создать прогноз (только админ)
PUT /        — обновить прогноз (только админ)
DELETE /     — удалить прогноз (только админ)
"""

import json
import os
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
}

ADMIN_KEY = os.environ.get("ADMIN_SECRET_KEY", "propognoz-admin-2024")


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def is_admin(event: dict) -> bool:
    headers = event.get("headers") or {}
    key = headers.get("X-Admin-Key") or headers.get("x-admin-key", "")
    return key == ADMIN_KEY


def row_to_dict(r) -> dict:
    return {
        "id": r[0],
        "sport": r[1],
        "sport_icon": r[2],
        "match_name": r[3],
        "league": r[4],
        "match_date": r[5],
        "odds": r[6],
        "prediction": r[7],
        "confidence": r[8],
        "price": r[9],
        "result": r[10],
        "is_active": r[11],
        "created_at": r[12].isoformat() if r[12] else None,
    }


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        return get_forecasts(event)
    if method == "POST":
        return create_forecast(event)
    if method == "PUT":
        return update_forecast(event)
    if method == "DELETE":
        return delete_forecast(event)

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}


def get_forecasts(event: dict) -> dict:
    admin = is_admin(event)
    conn = get_conn()
    cur = conn.cursor()
    if admin:
        cur.execute("""
            SELECT id, sport, sport_icon, match_name, league, match_date, odds,
                   prediction, confidence, price, result, is_active, created_at
            FROM forecasts ORDER BY created_at DESC
        """)
    else:
        cur.execute("""
            SELECT id, sport, sport_icon, match_name, league, match_date, odds,
                   prediction, confidence, price, result, is_active, created_at
            FROM forecasts WHERE is_active = TRUE ORDER BY created_at DESC
        """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"forecasts": [row_to_dict(r) for r in rows]}),
    }


def create_forecast(event: dict) -> dict:
    if not is_admin(event):
        return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}

    body = json.loads(event.get("body") or "{}")
    sport = body.get("sport", "").strip()
    sport_icon = body.get("sport_icon", "⚽").strip()
    match_name = body.get("match_name", "").strip()
    league = body.get("league", "").strip()
    match_date = body.get("match_date", "").strip()
    odds = body.get("odds", "").strip()
    prediction = body.get("prediction", "").strip()
    confidence = int(body.get("confidence", 75))
    price = int(body.get("price", 500))

    if not sport or not match_name or not price:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполни обязательные поля"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO forecasts (sport, sport_icon, match_name, league, match_date, odds, prediction, confidence, price)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id, sport, sport_icon, match_name, league, match_date, odds,
                  prediction, confidence, price, result, is_active, created_at
    """, (sport, sport_icon, match_name, league, match_date, odds, prediction, confidence, price))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"success": True, "forecast": row_to_dict(row)}),
    }


def update_forecast(event: dict) -> dict:
    if not is_admin(event):
        return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}

    body = json.loads(event.get("body") or "{}")
    fid = body.get("id")
    if not fid:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажи id"})}

    fields = []
    values = []
    for col in ["sport", "sport_icon", "match_name", "league", "match_date", "odds", "prediction", "confidence", "price", "result", "is_active"]:
        if col in body:
            fields.append(f"{col} = %s")
            values.append(body[col])

    if not fields:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Нет данных для обновления"})}

    fields.append("updated_at = NOW()")
    values.append(fid)

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"UPDATE forecasts SET {', '.join(fields)} WHERE id = %s RETURNING id, sport, sport_icon, match_name, league, match_date, odds, prediction, confidence, price, result, is_active, created_at",
        values,
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not row:
        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Прогноз не найден"})}

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"success": True, "forecast": row_to_dict(row)}),
    }


def delete_forecast(event: dict) -> dict:
    if not is_admin(event):
        return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}

    body = json.loads(event.get("body") or "{}")
    fid = body.get("id")
    if not fid:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажи id"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("UPDATE forecasts SET is_active = FALSE, updated_at = NOW() WHERE id = %s", (fid,))
    conn.commit()
    cur.close()
    conn.close()
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"success": True})}
