import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

const API_URL = "https://functions.poehali.dev/ec6e7ae0-d9ba-4575-abe3-b05c5b7e0af7";
const ADMIN_KEY = "propognoz-admin-2024";

interface Request {
  id: number;
  forecast_id: number;
  forecast_name: string;
  forecast_price: number;
  client_name: string;
  client_email: string;
  status: string;
  created_at: string;
  confirmed_at: string | null;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

const Admin = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("pending");

  const handleLogin = () => {
    if (keyInput === ADMIN_KEY) {
      setIsAuth(true);
      setKeyError("");
    } else {
      setKeyError("Неверный пароль");
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        headers: { "X-Admin-Key": ADMIN_KEY },
      });
      const data = await res.json();
      setRequests(data.requests || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuth) fetchRequests();
  }, [isAuth]);

  const handleConfirm = async (id: number) => {
    setConfirming(id);
    try {
      await fetch(`${API_URL}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_KEY },
        body: JSON.stringify({ request_id: id }),
      });
      await fetchRequests();
    } finally {
      setConfirming(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (filter === "pending") return r.status === "pending";
    if (filter === "confirmed") return r.status === "confirmed";
    return true;
  });

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
              <input
                type="password"
                value={keyInput}
                onChange={(e) => { setKeyInput(e.target.value); setKeyError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none"
                style={{ backgroundColor: "#0A0C12", border: `1px solid ${keyError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}` }}
              />
              {keyError && <p className="text-red-400 text-xs font-golos mt-1">{keyError}</p>}
            </div>
            <button onClick={handleLogin} className="btn-orange w-full py-3 rounded-xl text-sm uppercase tracking-wider">
              Войти
            </button>
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
            <span className="font-oswald text-white uppercase tracking-wider">ПроПрогноз <span className="text-orange-500">/ Админ</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/40 hover:text-white/70 text-xs font-golos transition-colors">← На сайт</Link>
            <button onClick={fetchRequests} className="flex items-center gap-1.5 text-white/40 hover:text-orange-400 transition-colors text-xs font-golos">
              <Icon name="RefreshCw" size={13} /> Обновить
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Новые заявки", value: requests.filter(r => r.status === "pending").length, color: "#FF6B00" },
            { label: "Подтверждено", value: requests.filter(r => r.status === "confirmed").length, color: "#22c55e" },
            { label: "Всего заявок", value: requests.length, color: "#00B4D8" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 text-center neon-border" style={{ backgroundColor: "#111420" }}>
              <div className="font-oswald text-3xl font-bold mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-white/40 text-xs font-golos">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "pending" as const, label: "Новые", count: pendingCount },
            { key: "confirmed" as const, label: "Подтверждённые" },
            { key: "all" as const, label: "Все" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-oswald uppercase tracking-wider border transition-all ${
                filter === tab.key
                  ? "border-orange-500 text-orange-500 bg-orange-500/10"
                  : "border-white/10 text-white/40 hover:border-white/25 hover:text-white/70"
              }`}
            >
              {tab.label}
              {tab.count ? (
                <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center" style={{ background: "#FF6B00", color: "white" }}>{tab.count}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Requests list */}
        {loading ? (
          <div className="text-center py-20">
            <Icon name="Loader" size={30} className="text-orange-400 animate-spin mx-auto mb-3" />
            <p className="text-white/30 font-golos text-sm">Загружаем заявки...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl neon-border" style={{ backgroundColor: "#111420" }}>
            <Icon name="Inbox" size={36} className="text-white/15 mx-auto mb-3" />
            <p className="text-white/30 font-golos text-sm">Заявок пока нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-2xl p-5 neon-border relative overflow-hidden" style={{ backgroundColor: "#111420" }}>
                {r.status === "pending" && (
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-15 pointer-events-none" style={{ background: "#FF6B00", transform: "translate(40%, -40%)" }} />
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
                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1">
                      <div>
                        <span className="text-white/80 font-golos text-sm">{r.client_name || "—"}</span>
                        <span className="text-white/40 font-golos text-sm"> · {r.client_email}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                      <span className="text-white/30 text-xs font-golos flex items-center gap-1">
                        <Icon name="Clock" size={11} /> {formatDate(r.created_at)}
                      </span>
                      <span className="text-orange-400/80 text-xs font-oswald font-semibold">{r.forecast_price} ₽</span>
                    </div>
                  </div>
                  {r.status === "pending" && (
                    <button
                      onClick={() => handleConfirm(r.id)}
                      disabled={confirming === r.id}
                      className="btn-orange px-6 py-2.5 rounded-xl text-sm uppercase tracking-wider flex items-center gap-2 flex-shrink-0 disabled:opacity-60"
                    >
                      {confirming === r.id ? (
                        <><Icon name="Loader" size={15} className="animate-spin" /> Подтверждаем...</>
                      ) : (
                        <><Icon name="CheckCircle" size={15} /> Подтвердить оплату</>
                      )}
                    </button>
                  )}
                  {r.status === "confirmed" && r.confirmed_at && (
                    <span className="text-white/25 text-xs font-golos flex-shrink-0">
                      Подтверждено: {formatDate(r.confirmed_at)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
