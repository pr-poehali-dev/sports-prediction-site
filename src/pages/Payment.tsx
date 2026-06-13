import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

const forecastsData: Record<
  number,
  {
    id: number;
    sport: string;
    sportIcon: string;
    match: string;
    league: string;
    date: string;
    odds: string;
    confidence: number;
    price: number;
  }
> = {
  1: {
    id: 1,
    sport: "Футбол",
    sportIcon: "⚽",
    match: "Реал Мадрид — Барселона",
    league: "Ла Лига",
    date: "14 июня, 21:00",
    odds: "2.15",
    confidence: 87,
    price: 990,
  },
  2: {
    id: 2,
    sport: "Хоккей",
    sportIcon: "🏒",
    match: "ЦСКА — СКА",
    league: "КХЛ",
    date: "15 июня, 19:30",
    odds: "1.85",
    confidence: 79,
    price: 690,
  },
};

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const forecast = forecastsData[Number(id)];

  const [step, setStep] = useState<"details" | "pay" | "success">("details");
  const [email, setEmail] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const formatCard = (val: string) => {
    return val
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})/g, "$1 ")
      .trim();
  };

  const formatExpiry = (val: string) => {
    return val
      .replace(/\D/g, "")
      .slice(0, 4)
      .replace(/(\d{2})(\d)/, "$1/$2");
  };

  if (!forecast) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0C12" }}>
        <Navbar />
        <div className="text-center pt-16">
          <p className="text-white/40 font-golos mb-4">Прогноз не найден</p>
          <Link to="/">
            <button className="btn-orange px-6 py-2.5 rounded-xl text-sm uppercase tracking-wider">
              На главную
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#0A0C12" }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen px-4 pt-16">
          <div
            className="w-full max-w-md rounded-2xl p-8 text-center neon-border"
            style={{ backgroundColor: "#111420" }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)" }}
            >
              <Icon name="CheckCircle" size={40} className="text-green-400" />
            </div>
            <h2 className="section-title text-2xl text-white uppercase mb-2">Оплата прошла!</h2>
            <p className="text-white/50 font-golos text-sm mb-6 leading-relaxed">
              Прогноз на матч <span className="text-white/80">{forecast.match}</span> отправлен в
              ваш личный кабинет. Проверьте раздел «Мои прогнозы».
            </p>
            <div
              className="rounded-xl p-4 mb-6 border"
              style={{
                backgroundColor: "rgba(34,197,94,0.05)",
                borderColor: "rgba(34,197,94,0.2)",
              }}
            >
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Icon name="MessageSquare" size={16} />
                <span className="font-oswald text-sm uppercase tracking-wider">
                  Прогноз доступен в кабинете
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/profile" className="flex-1">
                <button className="btn-orange w-full py-3 rounded-xl text-sm uppercase tracking-wider">
                  Личный кабинет
                </button>
              </Link>
              <Link to="/" className="flex-1">
                <button className="w-full py-3 rounded-xl text-sm font-oswald uppercase tracking-wider border border-white/15 text-white/60 hover:border-white/30 hover:text-white/80 transition-all">
                  Главная
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0C12" }}>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors font-golos text-sm mb-8"
        >
          <Icon name="ArrowLeft" size={16} />
          Назад
        </button>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Left: forecast info */}
          <div className="md:col-span-2">
            <div
              className="rounded-2xl p-6 neon-border sticky top-24"
              style={{ backgroundColor: "#111420" }}
            >
              <span className="text-orange-500 text-xs font-oswald tracking-widest uppercase block mb-4">
                Ваш заказ
              </span>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{forecast.sportIcon}</span>
                <div>
                  <span className="sport-tag text-orange-400/80">{forecast.sport}</span>
                  <div className="text-white/40 text-xs font-golos">{forecast.league}</div>
                </div>
              </div>

              <h3 className="section-title text-lg text-white mb-1">{forecast.match}</h3>
              <div className="text-white/40 text-xs font-golos mb-5 flex items-center gap-1">
                <Icon name="Clock" size={11} />
                {forecast.date}
              </div>

              <div className="mb-5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/40 font-golos">Уверенность</span>
                  <span className="text-orange-400 font-oswald font-semibold">
                    {forecast.confidence}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${forecast.confidence}%`,
                      background: "linear-gradient(90deg, #FF6B00, #FFB347)",
                    }}
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <span className="text-white/50 font-golos text-sm">Коэффициент</span>
                <span className="odds-badge">× {forecast.odds}</span>
              </div>

              <div className="border-t border-white/10 pt-4 mt-4 flex items-center justify-between">
                <span className="text-white/50 font-golos text-sm">Итого</span>
                <span className="section-title text-2xl text-white">{forecast.price} ₽</span>
              </div>

              <div
                className="mt-4 rounded-xl p-3 flex items-start gap-2"
                style={{
                  backgroundColor: "rgba(255,107,0,0.05)",
                  border: "1px solid rgba(255,107,0,0.15)",
                }}
              >
                <Icon name="Info" size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-white/40 text-xs font-golos leading-relaxed">
                  Прогноз придёт в личный кабинет сразу после оплаты
                </p>
              </div>
            </div>
          </div>

          {/* Right: payment form */}
          <div className="md:col-span-3">
            <div className="rounded-2xl p-6 neon-border" style={{ backgroundColor: "#111420" }}>
              <h2 className="section-title text-xl text-white uppercase mb-6">
                {step === "details" ? "Контактные данные" : "Оплата картой"}
              </h2>

              {/* Progress steps */}
              <div className="flex items-center gap-3 mb-8">
                {[
                  { key: "details", label: "Контакт" },
                  { key: "pay", label: "Оплата" },
                ].map((s, i) => (
                  <div key={s.key} className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-oswald transition-all ${
                          step === s.key
                            ? "bg-orange-500 text-white"
                            : step === "pay" && s.key === "details"
                            ? "bg-green-500 text-white"
                            : "bg-white/10 text-white/40"
                        }`}
                      >
                        {step === "pay" && s.key === "details" ? (
                          <Icon name="Check" size={12} />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span
                        className={`text-xs font-oswald uppercase tracking-wider ${
                          step === s.key ? "text-orange-400" : "text-white/30"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < 1 && <div className="w-8 h-px bg-white/15" />}
                  </div>
                ))}
              </div>

              {step === "details" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">
                      Email для уведомлений
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none transition-all"
                      style={{
                        backgroundColor: "#0A0C12",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    />
                  </div>
                  <div
                    className="rounded-xl p-4 flex items-start gap-3"
                    style={{
                      backgroundColor: "rgba(0,180,216,0.05)",
                      border: "1px solid rgba(0,180,216,0.15)",
                    }}
                  >
                    <Icon name="Bell" size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-white/50 text-xs font-golos leading-relaxed">
                      На этот email придёт подтверждение. Также прогноз будет в личном кабинете.
                    </p>
                  </div>
                  <button
                    onClick={() => setStep("pay")}
                    className="btn-orange w-full py-3.5 rounded-xl text-sm uppercase tracking-wider mt-2"
                  >
                    Продолжить к оплате
                  </button>
                </div>
              )}

              {step === "pay" && (
                <div className="space-y-4">
                  {/* Payment methods */}
                  <div className="flex gap-2 mb-2">
                    {["Карта", "СБП"].map((m) => (
                      <button
                        key={m}
                        className={`px-4 py-2 rounded-xl text-xs font-oswald uppercase tracking-wider border transition-all ${
                          m === "Карта"
                            ? "border-orange-500 text-orange-500 bg-orange-500/10"
                            : "border-white/15 text-white/40"
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">
                      Номер карты
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNum}
                        onChange={(e) => setCardNum(formatCard(e.target.value))}
                        placeholder="0000 0000 0000 0000"
                        className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none pr-12"
                        style={{
                          backgroundColor: "#0A0C12",
                          border: "1px solid rgba(255,255,255,0.1)",
                          letterSpacing: "1px",
                        }}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Icon name="CreditCard" size={18} className="text-white/20" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">
                        Срок
                      </label>
                      <input
                        type="text"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none"
                        style={{
                          backgroundColor: "#0A0C12",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-white/50 text-xs font-oswald uppercase tracking-wider block mb-2">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.slice(0, 3))}
                        placeholder="•••"
                        className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none"
                        style={{
                          backgroundColor: "#0A0C12",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 text-xs text-white/30 font-golos"
                  >
                    <Icon name="Lock" size={12} className="text-green-500" />
                    Защищённое соединение · SSL шифрование
                  </div>

                  <button
                    onClick={() => setStep("success")}
                    className="btn-orange w-full py-3.5 rounded-xl text-base uppercase tracking-wider animate-pulse-glow"
                  >
                    Оплатить {forecast.price} ₽
                  </button>

                  <button
                    onClick={() => setStep("details")}
                    className="w-full py-2 text-white/30 text-xs font-golos hover:text-white/60 transition-colors"
                  >
                    ← Назад
                  </button>
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
