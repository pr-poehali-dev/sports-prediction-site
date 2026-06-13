import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";
import { useYookassa, openPaymentPage, isValidEmail } from "@/components/extensions/yookassa/useYookassa";

const YOOKASSA_API_URL = "https://functions.poehali.dev/bd7f99c9-18a9-4eec-845e-42dbed91ee81";

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

  const [step, setStep] = useState<"details" | "pay">("details");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const returnUrl = `${window.location.origin}/payment-success`;

  const { createPayment, isLoading, error } = useYookassa({
    apiUrl: YOOKASSA_API_URL,
    onError: (err) => console.error("Payment error:", err),
  });

  const handlePay = async () => {
    if (!forecast) return;
    const response = await createPayment({
      amount: forecast.price,
      userEmail: email,
      description: `Прогноз на матч: ${forecast.match}`,
      returnUrl,
      cartItems: [
        {
          id: String(forecast.id),
          name: `Прогноз: ${forecast.match}`,
          price: forecast.price,
          quantity: 1,
        },
      ],
    });
    if (response?.payment_url) {
      openPaymentPage(response.payment_url);
    }
  };

  const handleEmailNext = () => {
    if (!isValidEmail(email)) {
      setEmailError("Введите корректный email");
      return;
    }
    setEmailError("");
    setStep("pay");
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
                {step === "details" ? "Контактные данные" : "Оплата через ЮKassa"}
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
                      Email для получения прогноза
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl text-white font-golos text-sm outline-none transition-all"
                      style={{
                        backgroundColor: "#0A0C12",
                        border: `1px solid ${emailError ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`,
                      }}
                    />
                    {emailError && (
                      <p className="text-red-400 text-xs font-golos mt-1">{emailError}</p>
                    )}
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
                      На этот email придёт подтверждение оплаты. Прогноз будет доступен в личном кабинете.
                    </p>
                  </div>
                  <button
                    onClick={handleEmailNext}
                    className="btn-orange w-full py-3.5 rounded-xl text-sm uppercase tracking-wider mt-2"
                  >
                    Продолжить к оплате
                  </button>
                </div>
              )}

              {step === "pay" && (
                <div className="space-y-5">
                  {/* Email summary */}
                  <div
                    className="rounded-xl p-3 flex items-center gap-2"
                    style={{ backgroundColor: "#0A0C12", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <Icon name="Mail" size={14} className="text-white/30" />
                    <span className="text-white/50 text-sm font-golos">{email}</span>
                    <button
                      onClick={() => setStep("details")}
                      className="ml-auto text-orange-400/70 text-xs font-oswald hover:text-orange-400 transition-colors uppercase tracking-wider"
                    >
                      Изменить
                    </button>
                  </div>

                  {/* YooKassa badge */}
                  <div
                    className="rounded-xl p-4 flex items-center gap-3"
                    style={{ backgroundColor: "rgba(255,107,0,0.05)", border: "1px solid rgba(255,107,0,0.2)" }}
                  >
                    <Icon name="ShieldCheck" size={20} className="text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="text-white/80 text-sm font-golos font-medium">Оплата через ЮKassa</p>
                      <p className="text-white/40 text-xs font-golos mt-0.5">
                        Банковская карта, СБП, ЮMoney — всё защищено SSL
                      </p>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div
                      className="rounded-xl p-3 flex items-center gap-2"
                      style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)" }}
                    >
                      <Icon name="AlertCircle" size={16} className="text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-xs font-golos">{error.message}</p>
                    </div>
                  )}

                  <button
                    onClick={handlePay}
                    disabled={isLoading}
                    className="btn-orange w-full py-4 rounded-xl text-base uppercase tracking-wider animate-pulse-glow disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Icon name="Loader" size={18} className="animate-spin" />
                        Создаём платёж...
                      </span>
                    ) : (
                      `Оплатить ${forecast.price} ₽`
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-white/25 font-golos">
                    <Icon name="Lock" size={12} className="text-green-500" />
                    Защищённое соединение · ЮKassa · SSL
                  </div>

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
