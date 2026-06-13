import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

const AUTH_API = "https://functions.poehali.dev/e6365229-ded0-4698-adfe-1810fefb92bf";

interface User {
  id: number;
  email: string;
  name: string;
}

interface Forecast {
  id: number;
  sport: string;
  sport_icon: string;
  match_name: string;
  league: string;
  match_date: string;
  odds: string;
  prediction: string;
  confidence: number;
  price: number;
  result: string | null;
  granted_at: string;
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState<"forecasts" | "settings">("forecasts");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState<User | null>(null);
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) loadProfile(token);
  }, []);

  const loadProfile = async (token: string) => {
    try {
      const res = await fetch(`${AUTH_API}?action=profile`, {
        headers: { "X-Auth-Token": token },
      });
      if (!res.ok) { localStorage.removeItem("auth_token"); return; }
      const text = await res.text();
      const data = JSON.parse(typeof text === "string" && text.startsWith('"') ? JSON.parse(text) : text);
      setUser(data.user);
      setForecasts(data.forecasts || []);
    } catch (e) { console.error(e); }
  };

  const handleLogin = async () => {
    if (!email || !password) { setError("Заполни все поля"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${AUTH_API}?action=login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const text = await res.text();
      const data = JSON.parse(typeof text === "string" && text.startsWith('"') ? JSON.parse(text) : text);
      if (!res.ok) { setError(data.error || "Ошибка входа"); return; }
      localStorage.setItem("auth_token", data.token);
      setUser(data.user);
      await loadProfile(data.token);
    } catch { setError("Ошибка соединения"); }
    finally { setLoading(false); }
  };

  const handleRegister = async () => {
    if (!email || !password || !name) { setError("Заполни все поля"); return; }
    if (password.length < 6) { setError("Пароль минимум 6 символов"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${AUTH_API}?action=register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const text = await res.text();
      const data = JSON.parse(typeof text === "string" && text.startsWith('"') ? JSON.parse(text) : text);
      if (!res.ok) { setError(data.error || "Ошибка регистрации"); return; }
      localStorage.setItem("auth_token", data.token);
      setUser(data.user);
      setForecasts([]);
    } catch { setError("Ошибка соединения"); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    setForecasts([]);
    setEmail("");
    setPassword("");
    setName("");
  };

  if (!user) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#0A0C12" }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4 pt-16">
          <div className="w-full max-w-md rounded-2xl p-8 neon-border" style={{ backgroundColor: "#111420" }}>
            <div className="text-center mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00)" }}
              >
                <Icon name="TrendingUp" size={26} className="text-white" />
              </div>
              <h1 className="section-title text-2xl text-white uppercase">
                {mode === "login" ? "Вход в кабинет" : "Регистрация"}
              </h1>
              <p className="text-white/40 text-sm font-golos mt-1">
                {mode === "login" ? "Войди, чтобы увидеть купленные прогнозы" : "Создай аккаунт для доступа к прогнозам"}
              </p>
            </div>

            <div className="space-y-4">
              {mode === "register" && (
                <div>
                  <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Имя</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Иван Петров"
                    className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none transition-all focus:border-orange-500/60"
                    style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                </div>
              )}
              <div>
                <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none transition-all focus:border-orange-500/60"
                  style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>
              <div>
                <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Пароль</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (mode === "login" ? handleLogin() : handleRegister())}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none transition-all focus:border-orange-500/60"
                  style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>

              {error && <p className="text-red-400 text-xs font-golos">{error}</p>}

              <button
                onClick={mode === "login" ? handleLogin : handleRegister}
                disabled={loading}
                className="btn-orange w-full py-3.5 rounded-xl text-sm uppercase tracking-wider mt-2 disabled:opacity-60"
              >
                {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
              </button>

              <div className="relative my-2">
                <div className="border-t border-white/10" />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/30 text-xs font-golos bg-[#111420] px-3">
                  или
                </span>
              </div>

              <button
                onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
                className="w-full py-3 rounded-xl text-sm font-oswald uppercase tracking-wider border border-white/15 text-white/60 hover:border-white/30 hover:text-white/90 transition-all"
              >
                {mode === "login" ? "Зарегистрироваться" : "Уже есть аккаунт? Войти"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0C12" }}>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="rounded-2xl p-6 mb-6 neon-border relative overflow-hidden" style={{ backgroundColor: "#111420" }}>
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: "#FF6B00", transform: "translate(30%, -30%)" }}
          />
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00)" }}
            >
              <Icon name="User" size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="section-title text-xl text-white">{user.name || "Пользователь"}</h2>
              <p className="text-white/40 text-sm font-golos">{user.email}</p>
            </div>
            <div className="text-right hidden sm:block">
              <div className="stat-number text-xl">{forecasts.length}</div>
              <div className="text-white/40 text-xs font-golos">куплено прогнозов</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/30 hover:text-white/60 transition-colors ml-2"
              title="Выйти"
            >
              <Icon name="LogOut" size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: "forecasts" as const, label: "Мои прогнозы", icon: "BookOpen" },
            { id: "settings" as const, label: "Настройки", icon: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-oswald uppercase tracking-wider transition-all border ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-500 bg-orange-500/10"
                  : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
              }`}
            >
              <Icon name={tab.icon} fallback="Circle" size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Forecasts tab */}
        {activeTab === "forecasts" && (
          <div className="space-y-4">
            {forecasts.length === 0 ? (
              <div className="rounded-2xl p-12 text-center neon-border" style={{ backgroundColor: "#111420" }}>
                <Icon name="ShoppingBag" size={40} className="text-white/20 mx-auto mb-4" />
                <p className="text-white/40 font-golos">У вас пока нет купленных прогнозов</p>
                <Link to="/">
                  <button className="btn-orange px-6 py-2.5 rounded-xl text-sm uppercase tracking-wider mt-4">
                    Смотреть прогнозы
                  </button>
                </Link>
              </div>
            ) : (
              forecasts.map((f) => (
                <div key={f.id} className="rounded-2xl p-6 neon-border relative overflow-hidden" style={{ backgroundColor: "#111420" }}>
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-15 pointer-events-none"
                    style={{
                      background: f.result === "win" ? "#22c55e" : f.result === "lose" ? "#ef4444" : "#FF6B00",
                      transform: "translate(50%, -50%)",
                    }}
                  />
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{f.sport_icon}</span>
                      <div>
                        <span className="sport-tag text-orange-400/80">{f.sport}</span>
                        <div className="text-white/40 text-xs font-golos">{f.league}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {f.result === "win" && <span className="win-badge">Победа ✓</span>}
                      {f.result === "lose" && <span className="lose-badge">Мимо ✗</span>}
                      <span className="odds-badge text-sm">× {f.odds}</span>
                    </div>
                  </div>

                  <h3 className="section-title text-lg text-white mb-1">{f.match_name}</h3>
                  <div className="text-white/30 text-xs font-golos mb-4 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={11} />
                      {f.match_date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="ShoppingCart" size={11} />
                      Куплено: {new Date(f.granted_at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div
                    className="rounded-xl p-4 border"
                    style={{ backgroundColor: "rgba(255,107,0,0.05)", borderColor: "rgba(255,107,0,0.2)" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="MessageSquare" size={14} className="text-orange-400" />
                      <span className="text-orange-400 text-xs font-oswald uppercase tracking-wider">Прогноз</span>
                    </div>
                    <p className="text-white/80 text-sm font-golos leading-relaxed">{f.prediction}</p>
                  </div>
                </div>
              ))
            )}

            {forecasts.length > 0 && (
              <div className="text-center pt-4">
                <Link to="/">
                  <button className="btn-orange px-8 py-3 rounded-xl text-sm uppercase tracking-wider">
                    Купить ещё прогноз
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Settings tab */}
        {activeTab === "settings" && (
          <div className="rounded-2xl p-6 neon-border" style={{ backgroundColor: "#111420" }}>
            <h3 className="section-title text-lg text-white uppercase mb-6">Настройки профиля</h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Имя</label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none"
                  style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.1)" }}
                />
              </div>
              <div>
                <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={user.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl text-white/40 font-golos text-sm outline-none cursor-not-allowed"
                  style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.05)" }}
                />
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl text-sm font-oswald uppercase tracking-wider border border-red-500/30 text-red-400/70 hover:border-red-500/60 hover:text-red-400 transition-all mt-2"
              >
                Выйти из аккаунта
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;