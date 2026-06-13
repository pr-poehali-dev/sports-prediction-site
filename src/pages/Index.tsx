import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/fb611246-965d-4a2f-b66e-515a74afc85b/files/447b1fc3-60e1-4c17-b213-9d8b78bb60ff.jpg";

const forecasts = [
  {
    id: 1,
    sport: "Футбол",
    sportIcon: "⚽",
    match: "Реал Мадрид — Барселона",
    league: "Ла Лига",
    date: "14 июня, 21:00",
    odds: "2.15",
    prediction: "П1 + Тотал больше 2.5",
    confidence: 87,
    price: 990,
    result: null,
  },
  {
    id: 2,
    sport: "Хоккей",
    sportIcon: "🏒",
    match: "ЦСКА — СКА",
    league: "КХЛ",
    date: "15 июня, 19:30",
    odds: "1.85",
    prediction: "П2 — Победа гостей",
    confidence: 79,
    price: 690,
    result: null,
  },
  {
    id: 3,
    sport: "Теннис",
    sportIcon: "🎾",
    match: "Джокович — Алькарас",
    league: "Уимблдон",
    date: "13 июня, 15:00",
    odds: "1.65",
    prediction: "П1 — Победа Джоковича",
    confidence: 82,
    price: 490,
    result: "win",
  },
  {
    id: 4,
    sport: "Баскетбол",
    sportIcon: "🏀",
    match: "ЦСКА Москва — Химки",
    league: "VTB Лига",
    date: "13 июня, 18:00",
    odds: "1.95",
    prediction: "Фора ЦСКА -5.5",
    confidence: 74,
    price: 790,
    result: "win",
  },
];

const stats = [
  { label: "Проходимость", value: "78%", icon: "Target" },
  { label: "Прогнозов дано", value: "1240+", icon: "Activity" },
  { label: "Клиентов", value: "3800+", icon: "Users" },
  { label: "Лет опыта", value: "7", icon: "Award" },
];

const ticker = [
  "⚽ Реал Мадрид - Барселона • СЕГОДНЯ 21:00",
  "🏒 ЦСКА - СКА • ЗАВТРА 19:30",
  "🎾 Джокович - Алькарас • ✅ ПРОШЛО",
  "🏀 ЦСКА - Химки • ✅ ПРОШЛО",
  "⚽ Манчестер Сити - Арсенал • 16 ИЮНЯ 20:00",
];

const Index = () => {
  const [filter, setFilter] = useState("Все");
  const sports = ["Все", "Футбол", "Хоккей", "Теннис", "Баскетбол"];
  const filtered = filter === "Все" ? forecasts : forecasts.filter((f) => f.sport === filter);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0C12" }}>
      <Navbar />

      {/* Ticker */}
      <div
        className="fixed top-16 left-0 right-0 z-40 py-2 border-b border-white/5"
        style={{ backgroundColor: "rgba(255,107,0,0.08)" }}
      >
        <div className="ticker-wrap">
          <div className="ticker-content text-xs text-white/60 font-golos">
            {[...ticker, ...ticker].map((item, i) => (
              <span key={i} className="mx-8">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-28">
        <div className="absolute inset-0">
          <img src={HERO_IMAGE} alt="hero" className="w-full h-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(10,12,18,0.96) 0%, rgba(10,12,18,0.75) 50%, rgba(10,12,18,0.92) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 80% 50%, rgba(255,107,0,0.1) 0%, transparent 60%)",
            }}
          />
        </div>
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 py-20 w-full">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 border border-orange-500/30"
              style={{ background: "rgba(255,107,0,0.1)" }}
            >
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-orange-400 text-xs font-oswald tracking-widest uppercase">
                Прогнозы онлайн
              </span>
            </div>

            <h1 className="section-title text-5xl md:text-7xl text-white mb-4 leading-none uppercase">
              Побеждай
              <br />
              <span className="gradient-text">со знанием</span>
            </h1>

            <p className="text-white/60 text-lg mb-8 font-golos leading-relaxed max-w-lg">
              Профессиональные прогнозы на спорт с проходимостью 78%. Получай прогноз мгновенно
              после оплаты в личный кабинет.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#forecasts">
                <button className="btn-orange px-8 py-3.5 rounded-xl text-base uppercase tracking-wider animate-pulse-glow">
                  Смотреть прогнозы
                </button>
              </a>
              <Link to="/profile">
                <button className="px-8 py-3.5 rounded-xl text-base uppercase tracking-wider border border-white/20 text-white/80 hover:border-orange-500/50 hover:text-white transition-all font-oswald font-semibold">
                  Личный кабинет
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating stats */}
        <div
          className="absolute bottom-10 right-4 md:right-10 glass neon-border rounded-2xl p-5 hidden md:block"
          style={{ minWidth: "280px" }}
        >
          <div className="grid grid-cols-2 gap-5">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="stat-number text-2xl">{s.value}</div>
                <div className="text-white/50 text-xs font-golos mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats mobile */}
      <section className="md:hidden py-8 px-4 border-b border-white/5">
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center glass rounded-xl p-4 neon-border">
              <div className="stat-number text-3xl">{s.value}</div>
              <div className="text-white/50 text-xs font-golos mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Forecasts */}
      <section id="forecasts" className="py-20 px-4 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-orange-500 text-xs font-oswald tracking-widest uppercase mb-2 block">
              Актуальные
            </span>
            <h2 className="section-title text-4xl text-white uppercase">Прогнозы</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {sports.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-oswald tracking-wider uppercase transition-all border ${
                  filter === s
                    ? "border-orange-500 text-orange-500 bg-orange-500/10"
                    : "border-white/15 text-white/50 hover:border-white/30 hover:text-white/80"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((f) => (
            <div
              key={f.id}
              className="card-hover neon-border rounded-2xl p-6 relative overflow-hidden"
              style={{ backgroundColor: "#111420" }}
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{
                  background: f.result === "win" ? "#22c55e" : "#FF6B00",
                  transform: "translate(50%, -50%)",
                }}
              />
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{f.sportIcon}</span>
                  <div>
                    <span className="sport-tag text-orange-400/80">{f.sport}</span>
                    <div className="text-white/40 text-xs font-golos">{f.league}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {f.result === "win" && <span className="win-badge">Победа ✓</span>}
                  {f.result === "lose" && <span className="lose-badge">Мимо ✗</span>}
                  {!f.result && (
                    <div className="flex items-center gap-1 text-white/40 text-xs font-golos">
                      <Icon name="Clock" size={12} />
                      {f.date}
                    </div>
                  )}
                </div>
              </div>

              {/* Матч скрыт до оплаты */}
              {f.result !== null ? (
                <>
                  <h3 className="section-title text-lg text-white mb-1">{f.match}</h3>
                  <div className="mb-4" />
                </>
              ) : (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Lock" size={14} className="text-orange-400/60" />
                    <span className="section-title text-lg text-white/30 select-none tracking-widest">
                      ██████ — ██████
                    </span>
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-golos"
                    style={{ backgroundColor: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)" }}
                  >
                    <Icon name="Lock" size={11} className="text-orange-400/70" />
                    <span className="text-orange-400/70">Матч откроется после оплаты</span>
                  </div>
                </div>
              )}

              <div className="mb-5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/40 font-golos">Уверенность</span>
                  <span className="text-orange-400 font-oswald font-semibold">{f.confidence}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${f.confidence}%`,
                      background: "linear-gradient(90deg, #FF6B00, #FFB347)",
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="odds-badge">× {f.odds}</span>
                  {f.result !== null && (
                    <div className="text-white/70 text-xs font-golos">{f.prediction}</div>
                  )}
                </div>
                {f.result === null ? (
                  <Link to={`/payment/${f.id}`}>
                    <button className="btn-orange px-5 py-2 rounded-xl text-sm uppercase tracking-wider">
                      {f.price} ₽
                    </button>
                  </Link>
                ) : (
                  <span className="text-white/30 text-xs font-golos uppercase tracking-wider">
                    Завершён
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why us */}
      <section className="py-20 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-orange-500 text-xs font-oswald tracking-widest uppercase mb-2 block">
              Преимущества
            </span>
            <h2 className="section-title text-4xl text-white uppercase">Почему мы?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "Zap",
                title: "Мгновенно",
                desc: "После оплаты прогноз сразу приходит в личный кабинет — никаких задержек.",
              },
              {
                icon: "ShieldCheck",
                title: "Проверено",
                desc: "78% проходимость подтверждена историей ставок за 7 лет работы.",
              },
              {
                icon: "Lock",
                title: "Безопасно",
                desc: "Оплата через защищённые платёжные системы. Данные надёжно защищены.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="card-hover neon-border rounded-2xl p-6 text-center"
                style={{ backgroundColor: "#111420" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: "rgba(255,107,0,0.15)",
                    border: "1px solid rgba(255,107,0,0.3)",
                  }}
                >
                  <Icon name={item.icon} fallback="Star" size={22} className="text-orange-400" />
                </div>
                <h3 className="section-title text-lg text-white mb-2 uppercase">{item.title}</h3>
                <p className="text-white/50 text-sm font-golos leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00)" }}
          >
            <Icon name="TrendingUp" size={12} className="text-white" />
          </div>
          <span className="font-oswald text-white/40 text-sm uppercase tracking-wider">
            ПроПрогноз
          </span>
        </div>
        <div className="text-white/25 text-xs font-golos">
          © 2024 ПроПрогноз · Все права защищены · 18+
        </div>
      </footer>
    </div>
  );
};

export default Index;