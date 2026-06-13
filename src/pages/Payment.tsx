import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

const FORECASTS_API = "https://functions.poehali.dev/6559d529-8bdd-4e54-aa52-25fc5461017d";
const REQUESTS_API = "https://functions.poehali.dev/ec6e7ae0-d9ba-4575-abe3-b05c5b7e0af7";
const CARD_NUMBER = "4817 7602 5816 3553";

interface Forecast {
  id: number; sport: string; sport_icon: string; match_name: string;
  league: string; match_date: string; odds: string; confidence: number; price: number;
}

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(true);
  const [step, setStep] = useState<"details" | "transfer" | "done">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(FORECASTS_API)
      .then((r) => r.json())
      .then((data) => {
        const found = (data.forecasts || []).find((f: Forecast) => f.id === Number(id));
        setForecast(found || null);
      })
      .catch(() => {})
      .finally(() => setLoadingForecast(false));
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(CARD_NUMBER.replace(/\s/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDetailsNext = () => {
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailError("Введите корректный email");
      return;
    }
    setEmailError("");
    setStep("transfer");
  };

  const handleConfirmSent = async () => {
    if (!forecast) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(REQUESTS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forecast_id: forecast.id,
          forecast_name: forecast.match_name,
          forecast_price: forecast.price,
          client_name: name,
          client_email: email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка");
      setStep("done");
    } catch {
      setError("Не удалось отправить заявку. Попробуй ещё раз.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingForecast) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0C12" }}>
        <Navbar />
        <Icon name="Loader" size={30} className="text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!forecast) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0C12" }}>
        <Navbar />
        <div className="text-center pt-16">
          <p className="text-white/40 font-golos mb-4">Прогноз не найден</p>
          <Link to="/"><button className="btn-orange px-6 py-2.5 rounded-xl text-sm uppercase tracking-wider">На главную</button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0C12" }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors font-golos text-sm mb-8">
          <Icon name="ArrowLeft" size={16} /> Назад
        </button>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <div className="rounded-2xl p-6 neon-border sticky top-24" style={{ backgroundColor: "#111420" }}>
              <span className="text-orange-500 text-xs font-oswald tracking-widest uppercase block mb-4">Ваш заказ</span>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{forecast.sport_icon}</span>
                <div>
                  <span className="sport-tag text-orange-400/80">{forecast.sport}</span>
                  <div className="text-white/40 text-xs font-golos">{forecast.league}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <Icon name="Lock" size={14} className="text-orange-400/60" />
                <span className="section-title text-base text-white/30 select-none tracking-widest">██████ — ██████</span>
              </div>
              <div className="text-white/30 text-xs font-golos mb-5 flex items-center gap-1">
                <Icon name="Clock" size={11} /> {forecast.match_date}
              </div>
              <div className="mb-5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/40 font-golos">Уверенность</span>
                  <span className="text-orange-400 font-oswald font-semibold">{forecast.confidence}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${forecast.confidence}%`, background: "linear-gradient(90deg, #FF6B00, #FFB347)" }} />
                </div>
              </div>
              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <span className="text-white/50 font-golos text-sm">Коэффициент</span>
                <span className="odds-badge">× {forecast.odds}</span>
              </div>
              <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between">
                <span className="text-white/50 font-golos text-sm">К оплате</span>
                <span className="section-title text-2xl text-white">{forecast.price} ₽</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="rounded-2xl p-6 neon-border" style={{ backgroundColor: "#111420" }}>
              {step !== "done" && (
                <div className="flex items-center gap-3 mb-8">
                  {[{ key: "details", label: "Контакт" }, { key: "transfer", label: "Перевод" }].map((s, i) => (
                    <div key={s.key} className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-oswald transition-all ${step === s.key ? "bg-orange-500 text-white" : step === "transfer" && s.key === "details" ? "bg-green-500 text-white" : "bg-white/10 text-white/40"}`}>
                          {step === "transfer" && s.key === "details" ? <Icon name="Check" size={12} /> : i + 1}
                        </div>
                        <span className={`text-xs font-oswald uppercase tracking-wider ${step === s.key ? "text-orange-400" : "text-white/30"}`}>{s.label}</span>
                      </div>
                      {i < 1 && <div className="w-8 h-px bg-white/15" />}
                    </div>
                  ))}
                </div>
              )}

              {step === "details" && (
                <div className="space-y-4">
                  <h2 className="section-title text-xl text-white uppercase mb-2">Контактные данные</h2>
                  <div>
                    <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Ваше имя</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван"
                      className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none"
                      style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.1)" }} />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">Email</label>
                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(""); }} placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none"
                      style={{ backgroundColor: "#0A0C12", border: `1px solid ${emailError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}` }} />
                    {emailError && <p className="text-red-400 text-xs font-golos mt-1">{emailError}</p>}
                  </div>
                  <div className="rounded-xl p-4 flex items-start gap-3" style={{ backgroundColor: "rgba(0,180,216,0.05)", border: "1px solid rgba(0,180,216,0.15)" }}>
                    <Icon name="Bell" size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-white/50 text-xs font-golos leading-relaxed">После подтверждения оплаты прогноз будет доступен в личном кабинете.</p>
                  </div>
                  <button onClick={handleDetailsNext} className="btn-orange w-full py-3.5 rounded-xl text-sm uppercase tracking-wider">Продолжить</button>
                </div>
              )}

              {step === "transfer" && (
                <div className="space-y-5">
                  <h2 className="section-title text-xl text-white uppercase mb-2">Перевод на карту</h2>
                  <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a1f35, #111420)", border: "1px solid rgba(255,107,0,0.3)" }}>
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none" style={{ background: "#FF6B00", transform: "translate(30%, -30%)" }} />
                    <div className="text-white/30 text-xs font-golos mb-3 uppercase tracking-widest">Номер карты</div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="section-title text-xl md:text-2xl text-white tracking-widest">{CARD_NUMBER}</span>
                      <button onClick={handleCopy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-oswald uppercase tracking-wider transition-all flex-shrink-0 ${copied ? "bg-green-500/20 text-green-400 border border-green-500/40" : "bg-white/5 text-white/50 border border-white/15 hover:border-orange-500/40 hover:text-orange-400"}`}>
                        <Icon name={copied ? "Check" : "Copy"} size={13} />
                        {copied ? "Скопировано" : "Копировать"}
                      </button>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                      <span className="text-white/40 text-xs font-golos">Сумма перевода</span>
                      <span className="section-title text-xl text-orange-400">{forecast.price} ₽</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { n: "1", text: "Переведи точную сумму на карту выше" },
                      { n: "2", text: "Нажми кнопку «Я перевёл» ниже" },
                      { n: "3", text: "Мы проверим перевод и откроем прогноз в течение 15 минут" },
                    ].map((item) => (
                      <div key={item.n} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-oswald" style={{ background: "rgba(255,107,0,0.15)", border: "1px solid rgba(255,107,0,0.3)", color: "#FF6B00" }}>{item.n}</div>
                        <p className="text-white/50 text-sm font-golos leading-relaxed pt-0.5">{item.text}</p>
                      </div>
                    ))}
                  </div>
                  {error && (
                    <div className="rounded-xl p-3 flex items-center gap-2" style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}>
                      <Icon name="AlertCircle" size={16} className="text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-xs font-golos">{error}</p>
                    </div>
                  )}
                  <button onClick={handleConfirmSent} disabled={isLoading}
                    className="btn-orange w-full py-4 rounded-xl text-base uppercase tracking-wider animate-pulse-glow disabled:opacity-60 disabled:cursor-not-allowed">
                    {isLoading ? <span className="flex items-center justify-center gap-2"><Icon name="Loader" size={18} className="animate-spin" /> Отправляем...</span> : "✓ Я перевёл деньги"}
                  </button>
                  <button onClick={() => setStep("details")} className="w-full py-2 text-white/30 text-xs font-golos hover:text-white/60 transition-colors">← Назад</button>
                </div>
              )}

              {step === "done" && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.4)" }}>
                    <Icon name="CheckCircle" size={34} className="text-green-400" />
                  </div>
                  <h2 className="section-title text-2xl text-white uppercase mb-2">Заявка принята!</h2>
                  <p className="text-white/50 font-golos text-sm mb-6 leading-relaxed max-w-xs mx-auto">
                    Мы проверим перевод и откроем прогноз в твоём личном кабинете в течение <span className="text-white/80">15 минут</span>.
                  </p>
                  <div className="rounded-xl p-3 mb-6 flex items-center justify-between" style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span className="text-white/30 text-xs font-golos">Уведомление придёт на</span>
                    <span className="text-white/70 text-xs font-golos">{email}</span>
                  </div>
                  <div className="flex gap-3">
                    <Link to="/profile" className="flex-1"><button className="btn-orange w-full py-3 rounded-xl text-sm uppercase tracking-wider">Личный кабинет</button></Link>
                    <Link to="/" className="flex-1"><button className="w-full py-3 rounded-xl text-sm font-oswald uppercase tracking-wider border border-white/15 text-white/60 hover:border-white/30 hover:text-white/80 transition-all">На главную</button></Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
