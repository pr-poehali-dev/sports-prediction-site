CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_forecasts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    forecast_id INTEGER REFERENCES forecasts(id),
    payment_request_id INTEGER REFERENCES payment_requests(id),
    granted_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, forecast_id)
);

ALTER TABLE payment_requests ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);
