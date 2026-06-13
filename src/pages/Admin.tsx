import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const REQUESTS_API = "https://functions.poehali.dev/ec6e7ae0-d9ba-4575-abe3-b05c5b7e0af7";
const FORECASTS_API = "https://functions.poehali.dev/6559d529-8bdd-4e54-aa52-25fc5461017d";
const ADMIN_KEY = "propognoz-admin-2024";

const SPORT_OPTIONS = [
  { label: "Футбол", icon: "⚽" },
  { label: "Хоккей", icon: "🏒" },
  { label: "Баскетбол", icon: "🏀" },
  { label: "Теннис", icon: "🎾" },
  { label: "Волейбол", icon: "🏐" },
  { label: "ММА", icon: "🥊" },
];

interface Request {
  id: number; forecast_id: number; forecast_name: string; forecast_price: number;
  client_name: string; client_email: string; status: string;
  created_at: string; confirmed_at: string | null;
}

interface Forecast {
  id: number; sport: string; sport_icon: string; match_name: string;
  league: string; match_date: string; odds: string; prediction: string;
  confidence: number; price: number; result: string | null; is_active: boolean;
}

const EMPTY_FORM = {
  sport: "Футбол", sport_icon: "⚽", match_name: "", league: "",
  match_date: "", odds: "", prediction: "", confidence: 80, price: 500,
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

const Admin = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [tab, setTab] = useState<"requests" | "forecasts">("requests");

  // Requests state
  const [requests, setRequests] = useState<Request[]>([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [reqFilter, setReqFilter] = useState<"pending" | "confirmed" | "all">("pending");

  // Forecasts state
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [fcLoading, setFcLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleLogin = () => {
    if (keyInput === ADMIN_KEY) { setIsAuth(true); setKeyError(""); }
    else setKeyError("Неверный пароль");
  };

  const fetchRequests = async () => {
    setReqLoading(true);
    try {
      const res = await fetch(REQUESTS_API, { headers: { "X-Admin-Key": ADMIN_KEY } });
      const data = await res.json();
      setRequests(data.requests || []);
    } finally { setReqLoading(false); }
  };

  const fetchForecasts = async () => {
    setFcLoading(true);
    try {
      const res = await fetch(FORECASTS_API, { headers: { "X-Admin-Key": ADMIN_KEY } });
      const data = await res.json();
      setForecasts(data.forecasts || []);
    } finally { setFcLoading(false); }
  };

  useEffect(() => {
    if (isAuth) { fetchRequests(); fetchForecasts(); }
  }, [isAuth]);

  const handleConfirm = async (id: number) => {
    setConfirming(id);
    try {
      await fetch(`${REQUESTS_API}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY },
        body: JSON.stringify({ request_id: id }),
      });
      await fetchRequests();
    } finally { setConfirming(null); }
  };

  const handleSportChange = (sport: string) => {
    const found = SPORT_OPTIONS.find((s) => s.label === sport);
    setForm((f) => ({ ...f, sport, sport_icon: found?.icon || "⚽" }));
  };

  const handleSave = async () => {
    if (!form.match_name || !form.price) return;
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { ...form, id: editingId } : form;
      await fetch(FORECASTS_API, {
        method,
        headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY },
        body: JSON.stringify(body),
      });
      await fetchForecasts();
      setShowForm(false);
      setEditingId(null);
      setForm({ ...EMPTY_FORM });
    } finally { setSaving(false); }
  };

  const handleEdit = (f: Forecast) => {
    setForm({
      sport: f.sport, sport_icon: f.sport_icon, match_name: f.match_name,
      league: f.league, match_date: f.match_date, odds: f.odds,
      prediction: f.prediction, confidence: f.confidence, price: f.price,
    });
    setEditingId(f.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSetResult = async (id: number, result: string | null) => {
    await fetch(FORECASTS_API, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY },
      body: JSON.stringify({ id, result }),
    });
    await fetchForecasts();
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await fetch(FORECASTS_API, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY },
        body: JSON.stringify({ id }),
      });
      await fetchForecasts();
    } finally { setDeletingId(null); }
  };

  const filteredReq = requests.filter((r) =>
    reqFilter === "all" ? true : r.status === reqFilter
  );
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  if (!isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#0A0C12" }}>
        <div className="w-full max-w-sm rounded-2xl p-8 neon-border" style={{ backgroundColor: "#111420" }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00)" }}>
              <Icon name="ShieldCheck" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="section-title text-lg text-white uppercase">Админ-панель</h1>
              <p className="text-white/30 text-xs font-golos">ПроПрогноз</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Пароль</label>
              <input type="password" value={keyInput}
                onChange={(e) => { setKeyInput(e.target.value); setKeyError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none"
                style={{ backgroundColor: "#0A0C12", border: `1px solid ${keyError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}` }} />
              {keyError && <p className="text-red-400 text-xs font-golos mt-1">{keyError}</p>}
            </div>
            <button onClick={handleLogin} className="btn-orange w-full py-3 rounded-xl text-sm uppercase tracking-wider">Войти</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0C12" }}>
      {/* Header */}
      <div className="glass border-b border-white/5 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00)" }}>
              <Icon name="TrendingUp" size={15} className="text-white" />
            </div>
            <span className="font-oswald text-white uppercase tracking-wider">
              ПроПрогноз <span className="text-orange-500">/ Админ</span>
            </span>
          </div>
          <Link to="/" className="text-white/40 hover:text-white/70 text-xs font-golos transition-colors">← На сайт</Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Новые заявки", value: pendingCount, color: "#FF6B00" },
            { label: "Прогнозов", value: forecasts.filter(f => f.is_active).length, color: "#00B4D8" },
            { label: "Всего продаж", value: requests.filter(r => r.status === "confirmed").length, color: "#22c55e" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center neon-border" style={{ backgroundColor: "#111420" }}>
              <div className="font-oswald text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-white/40 text-xs font-golos">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "requests" as const, label: "Заявки на оплату", badge: pendingCount },
            { key: "forecasts" as const, label: "Прогнозы" },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-oswald uppercase tracking-wider border transition-all ${
                tab === t.key ? "border-orange-500 text-orange-500 bg-orange-500/10" : "border-white/10 text-white/50 hover:border-white/25 hover:text-white/80"
              }`}>
              {t.label}
              {t.badge ? (
                <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: "#FF6B00", color: "white" }}>{t.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* ===== REQUESTS TAB ===== */}
        {tab === "requests" && (
          <div>
            <div className="flex gap-2 mb-5">
              {[
                { key: "pending" as const, label: "Новые" },
                { key: "confirmed" as const, label: "Подтверждённые" },
                { key: "all" as const, label: "Все" },
              ].map((f) => (
                <button key={f.key} onClick={() => setReqFilter(f.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-oswald uppercase tracking-wider border transition-all ${
                    reqFilter === f.key ? "border-orange-500 text-orange-500 bg-orange-500/10" : "border-white/10 text-white/40 hover:border-white/25"
                  }`}>
                  {f.label}
                </button>
              ))}
              <button onClick={fetchRequests} className="ml-auto flex items-center gap-1.5 text-white/30 hover:text-orange-400 text-xs font-golos transition-colors">
                <Icon name="RefreshCw" size={12} /> Обновить
              </button>
            </div>

            {reqLoading ? (
              <div className="text-center py-16"><Icon name="Loader" size={28} className="text-orange-400 animate-spin mx-auto" /></div>
            ) : filteredReq.length === 0 ? (
              <div className="text-center py-16 rounded-2xl neon-border" style={{ backgroundColor: "#111420" }}>
                <Icon name="Inbox" size={32} className="text-white/15 mx-auto mb-3" />
                <p className="text-white/30 font-golos text-sm">Заявок нет</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredReq.map((r) => (
                  <div key={r.id} className="rounded-2xl p-5 neon-border relative overflow-hidden" style={{ backgroundColor: "#111420" }}>
                    {r.status === "pending" && (
                      <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-15 pointer-events-none" style={{ background: "#FF6B00", transform: "translate(40%,-40%)" }} />
                    )}
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {r.status === "pending" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-oswald uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.4)", color: "#FF6B00" }}>
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" /> Ожидает
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-oswald uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}>
                              <Icon name="Check" size={10} /> Подтверждено
                            </span>
                          )}
                          <span className="text-white/25 text-xs font-golos">#{r.id}</span>
                        </div>
                        <p className="text-white/80 font-golos text-sm mb-1">
                          {r.client_name || "—"} · <span className="text-white/50">{r.client_email}</span>
                        </p>
                        <p className="text-white/30 text-xs font-golos">{r.forecast_name}</p>
                        <div className="flex gap-4 mt-2">
                          <span className="text-white/30 text-xs font-golos flex items-center gap-1"><Icon name="Clock" size={11} /> {formatDate(r.created_at)}</span>
                          <span className="text-orange-400/80 text-xs font-oswald font-semibold">{r.forecast_price} ₽</span>
                        </div>
                      </div>
                      {r.status === "pending" && (
                        <button onClick={() => handleConfirm(r.id)} disabled={confirming === r.id}
                          className="btn-orange px-5 py-2.5 rounded-xl text-sm uppercase tracking-wider flex items-center gap-2 flex-shrink-0 disabled:opacity-60">
                          {confirming === r.id
                            ? <><Icon name="Loader" size={14} className="animate-spin" /> Подтверждаем...</>
                            : <><Icon name="CheckCircle" size={14} /> Подтвердить оплату</>}
                        </button>
                      )}
                      {r.status === "confirmed" && r.confirmed_at && (
                        <span className="text-white/25 text-xs font-golos flex-shrink-0">{formatDate(r.confirmed_at)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== FORECASTS TAB ===== */}
        {tab === "forecasts" && (
          <div>
            {/* Add/Edit form */}
            {showForm && (
              <div className="rounded-2xl p-6 neon-border mb-6" style={{ backgroundColor: "#111420" }}>
                <h3 className="section-title text-lg text-white uppercase mb-5">
                  {editingId ? "Редактировать прогноз" : "Новый прогноз"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sport */}
                  <div>
                    <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Вид спорта</label>
                    <select value={form.sport} onChange={(e) => handleSportChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none"
                      style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {SPORT_OPTIONS.map((s) => (
                        <option key={s.label} value={s.label}>{s.icon} {s.label}</option>
                      ))}
                    </select>
                  </div>
                  {/* League */}
                  <div>
                    <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Лига / Турнир</label>
                    <input type="text" value={form.league} onChange={(e) => setForm(f => ({ ...f, league: e.target.value }))}
                      placeholder="Ла Лига" className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none"
                      style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  {/* Match */}
                  <div className="md:col-span-2">
                    <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Матч <span className="text-orange-500">*</span></label>
                    <input type="text" value={form.match_name} onChange={(e) => setForm(f => ({ ...f, match_name: e.target.value }))}
                      placeholder="Реал Мадрид — Барселона"
                      className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none"
                      style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  {/* Date */}
                  <div>
                    <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Дата и время</label>
                    <input type="text" value={form.match_date} onChange={(e) => setForm(f => ({ ...f, match_date: e.target.value }))}
                      placeholder="14 июня, 21:00"
                      className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none"
                      style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  {/* Odds */}
                  <div>
                    <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Коэффициент</label>
                    <input type="text" value={form.odds} onChange={(e) => setForm(f => ({ ...f, odds: e.target.value }))}
                      placeholder="2.15"
                      className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none"
                      style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  {/* Price */}
                  <div>
                    <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Цена (₽) <span className="text-orange-500">*</span></label>
                    <input type="number" value={form.price} onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                      placeholder="990"
                      className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none"
                      style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  {/* Confidence */}
                  <div>
                    <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Уверенность: {form.confidence}%</label>
                    <input type="range" min={50} max={99} value={form.confidence}
                      onChange={(e) => setForm(f => ({ ...f, confidence: Number(e.target.value) }))}
                      className="w-full accent-orange-500" />
                  </div>
                  {/* Prediction */}
                  <div className="md:col-span-2">
                    <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Прогноз (текст — виден только после оплаты)</label>
                    <textarea value={form.prediction} onChange={(e) => setForm(f => ({ ...f, prediction: e.target.value }))}
                      placeholder="П1 + Тотал больше 2.5. Подробный разбор матча..."
                      rows={3} className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none resize-none"
                      style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={handleSave} disabled={saving || !form.match_name || !form.price}
                    className="btn-orange px-8 py-3 rounded-xl text-sm uppercase tracking-wider flex items-center gap-2 disabled:opacity-60">
                    {saving ? <><Icon name="Loader" size={14} className="animate-spin" /> Сохраняем...</> : <><Icon name="Save" size={14} /> {editingId ? "Сохранить" : "Добавить прогноз"}</>}
                  </button>
                  <button onClick={() => { setShowForm(false); setEditingId(null); setForm({ ...EMPTY_FORM }); }}
                    className="px-6 py-3 rounded-xl text-sm font-oswald uppercase tracking-wider border border-white/15 text-white/50 hover:border-white/30 hover:text-white/80 transition-all">
                    Отмена
                  </button>
                </div>
              </div>
            )}

            {!showForm && (
              <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ ...EMPTY_FORM }); }}
                className="btn-orange px-6 py-3 rounded-xl text-sm uppercase tracking-wider flex items-center gap-2 mb-5">
                <Icon name="Plus" size={16} /> Добавить прогноз
              </button>
            )}

            {fcLoading ? (
              <div className="text-center py-16"><Icon name="Loader" size={28} className="text-orange-400 animate-spin mx-auto" /></div>
            ) : forecasts.length === 0 ? (
              <div className="text-center py-16 rounded-2xl neon-border" style={{ backgroundColor: "#111420" }}>
                <Icon name="Inbox" size={32} className="text-white/15 mx-auto mb-3" />
                <p className="text-white/30 font-golos text-sm">Прогнозов ещё нет</p>
              </div>
            ) : (
              <div className="space-y-3">
                {forecasts.map((f) => (
                  <div key={f.id} className={`rounded-2xl p-5 neon-border transition-all ${!f.is_active ? "opacity-40" : ""}`} style={{ backgroundColor: "#111420" }}>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{f.sport_icon}</span>
                          <span className="sport-tag text-orange-400/80">{f.sport}</span>
                          <span className="text-white/30 text-xs font-golos">{f.league}</span>
                          {!f.is_active && <span className="text-xs font-oswald text-white/30 uppercase tracking-wider">(скрыт)</span>}
                        </div>
                        <p className="text-white/90 font-golos text-sm font-medium">{f.match_name}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                          <span className="text-white/30 text-xs font-golos flex items-center gap-1"><Icon name="Clock" size={11} /> {f.match_date}</span>
                          <span className="text-orange-400/80 text-xs font-oswald">× {f.odds}</span>
                          <span className="text-orange-400 text-xs font-oswald font-semibold">{f.price} ₽</span>
                          <span className="text-white/30 text-xs font-golos">Уверенность: {f.confidence}%</span>
                        </div>
                      </div>

                      {/* Result & actions */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Result buttons */}
                        {f.result === null ? (
                          <>
                            <button onClick={() => handleSetResult(f.id, "win")}
                              className="px-3 py-1.5 rounded-lg text-xs font-oswald uppercase tracking-wider border border-green-500/30 text-green-400/70 hover:bg-green-500/10 transition-all">
                              ✓ Победа
                            </button>
                            <button onClick={() => handleSetResult(f.id, "lose")}
                              className="px-3 py-1.5 rounded-lg text-xs font-oswald uppercase tracking-wider border border-red-500/30 text-red-400/70 hover:bg-red-500/10 transition-all">
                              ✗ Мимо
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={f.result === "win" ? "win-badge" : "lose-badge"}>
                              {f.result === "win" ? "Победа ✓" : "Мимо ✗"}
                            </span>
                            <button onClick={() => handleSetResult(f.id, null)}
                              className="text-white/25 hover:text-white/50 text-xs font-golos transition-colors">
                              сбросить
                            </button>
                          </div>
                        )}

                        <button onClick={() => handleEdit(f)}
                          className="p-2 rounded-lg border border-white/10 text-white/40 hover:border-orange-500/40 hover:text-orange-400 transition-all">
                          <Icon name="Pencil" size={14} />
                        </button>
                        <button onClick={() => handleDelete(f.id)} disabled={deletingId === f.id}
                          className="p-2 rounded-lg border border-white/10 text-white/40 hover:border-red-500/40 hover:text-red-400 transition-all disabled:opacity-40">
                          {deletingId === f.id ? <Icon name="Loader" size={14} className="animate-spin" /> : <Icon name="Trash2" size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
