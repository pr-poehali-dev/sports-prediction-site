"""
Создание и управление заявками на оплату прогнозов (перевод на карту).
POST / — создать заявку
GET /  — список всех заявок (для админа)
POST /confirm — подтвердить оплату
"""

import json
import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
}

ADMIN_KEY = os.environ.get("ADMIN_SECRET_KEY", "propognoz-admin-2024")


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")

    # POST /confirm — подтвердить оплату
    if method == "POST" and path.endswith("/confirm"):
        return confirm_payment(event)

    # POST / — создать заявку
    if method == "POST":
        return create_request(event)

    # GET / — список заявок для админа
    if method == "GET":
        return list_requests(event)

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}


def create_request(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    forecast_id = body.get("forecast_id")
    forecast_name = body.get("forecast_name", "")
    forecast_price = body.get("forecast_price", 0)
    client_email = body.get("client_email", "").strip().lower()
    client_name = body.get("client_name", "").strip()

    if not forecast_id or not client_email or not forecast_price:
        return {
            "statusCode": 400,
            "headers": CORS,
            "body": json.dumps({"error": "Заполни все поля"}),
        }

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO payment_requests (forecast_id, forecast_name, forecast_price, client_email, client_name)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id, created_at
        """,
        (forecast_id, forecast_name, forecast_price, client_email, client_name),
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "success": True,
            "request_id": row[0],
            "message": "Заявка принята. После перевода мы откроем прогноз.",
        }),
    }


def list_requests(event: dict) -> dict:
    headers = event.get("headers") or {}
    admin_key = headers.get("X-Admin-Key") or headers.get("x-admin-key", "")
    if admin_key != ADMIN_KEY:
        return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, forecast_id, forecast_name, forecast_price, client_name, client_email,
               status, created_at, confirmed_at
        FROM payment_requests
        ORDER BY created_at DESC
        LIMIT 100
        """
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    requests = []
    for r in rows:
        requests.append({
            "id": r[0],
            "forecast_id": r[1],
            "forecast_name": r[2],
            "forecast_price": r[3],
            "client_name": r[4],
            "client_email": r[5],
            "status": r[6],
            "created_at": r[7].isoformat() if r[7] else None,
            "confirmed_at": r[8].isoformat() if r[8] else None,
        })

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"requests": requests}),
    }


def confirm_payment(event: dict) -> dict:
    headers = event.get("headers") or {}
    admin_key = headers.get("X-Admin-Key") or headers.get("x-admin-key", "")
    if admin_key != ADMIN_KEY:
        return {"statusCode": 403, "headers": CORS, "body": json.dumps({"error": "Нет доступа"})}

    body = json.loads(event.get("body") or "{}")
    request_id = body.get("request_id")
    if not request_id:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Укажи request_id"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE payment_requests
        SET status = 'confirmed', confirmed_at = NOW()
        WHERE id = %s AND status = 'pending'
        RETURNING id, client_email, forecast_name
        """,
        (request_id,),
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not row:
        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Заявка не найдена"})}

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "success": True,
            "message": f"Оплата подтверждена для {row[1]}",
        }),
    }