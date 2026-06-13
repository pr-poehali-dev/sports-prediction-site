CREATE TABLE IF NOT EXISTS payment_requests (
    id SERIAL PRIMARY KEY,
    forecast_id INTEGER NOT NULL,
    forecast_name VARCHAR(255) NOT NULL,
    forecast_price INTEGER NOT NULL,
    client_name VARCHAR(255),
    client_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_email ON payment_requests(client_email);
