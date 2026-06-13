CREATE TABLE IF NOT EXISTS forecasts (
    id SERIAL PRIMARY KEY,
    sport VARCHAR(50) NOT NULL,
    sport_icon VARCHAR(10) NOT NULL DEFAULT '⚽',
    match_name VARCHAR(255) NOT NULL,
    league VARCHAR(100),
    match_date VARCHAR(100),
    odds VARCHAR(20),
    prediction TEXT,
    confidence INTEGER DEFAULT 75,
    price INTEGER NOT NULL DEFAULT 500,
    result VARCHAR(20) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_forecasts_active ON forecasts(is_active);
CREATE INDEX IF NOT EXISTS idx_forecasts_created ON forecasts(created_at DESC);

INSERT INTO forecasts (sport, sport_icon, match_name, league, match_date, odds, prediction, confidence, price, result) VALUES
('Теннис', '🎾', 'Джокович — Алькарас', 'Уимблдон', '13 июня, 15:00', '1.65', 'П1 — Победа Джоковича в 3 сетах. Подача Новака в отличной форме, Алькарас устал после полуфинала.', 82, 490, 'win'),
('Баскетбол', '🏀', 'ЦСКА Москва — Химки', 'VTB Лига', '13 июня, 18:00', '1.95', 'Фора ЦСКА -5.5. Преимущество домашней площадки, сильный состав ЦСКА в этом сезоне.', 74, 790, 'win'),
('Футбол', '⚽', 'Реал Мадрид — Барселона', 'Ла Лига', '14 июня, 21:00', '2.15', 'П1 + Тотал больше 2.5', 87, 990, NULL),
('Хоккей', '🏒', 'ЦСКА — СКА', 'КХЛ', '15 июня, 19:30', '1.85', 'П2 — Победа гостей', 79, 690, NULL);
