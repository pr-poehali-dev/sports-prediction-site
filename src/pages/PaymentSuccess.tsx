import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Icon from "@/components/ui/icon";

const PaymentSuccess = () => {
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("yookassa_pending_order");
      if (raw) {
        const data = JSON.parse(raw);
        setOrderNumber(data.order_number || null);
      }
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0A0C12" }}>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 pt-16">
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center neon-border relative overflow-hidden"
          style={{ backgroundColor: "#111420" }}
        >
          {/* Glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: "#22c55e", transform: "translateX(-50%) translateY(-50%)" }}
          />

          {/* Icon */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.4)",
            }}
          >
            <Icon name="CheckCircle" size={40} className="text-green-400" />
          </div>

          <h2 className="section-title text-2xl text-white uppercase mb-2">Оплата прошла!</h2>
          <p className="text-white/50 font-golos text-sm mb-6 leading-relaxed">
            Прогноз уже ждёт тебя в личном кабинете — проверь раздел «Мои прогнозы».
          </p>

          {orderNumber && (
            <div
              className="rounded-xl p-3 mb-6 flex items-center justify-between"
              style={{
                backgroundColor: "#0A0C12",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-white/30 text-xs font-golos">Номер заказа</span>
              <span className="text-white/70 text-xs font-oswald tracking-wider">{orderNumber}</span>
            </div>
          )}

          <div
            className="rounded-xl p-4 mb-6 flex items-center gap-3"
            style={{
              backgroundColor: "rgba(34,197,94,0.05)",
              border: "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <Icon name="MessageSquare" size={18} className="text-green-400 flex-shrink-0" />
            <p className="text-white/60 text-xs font-golos leading-relaxed text-left">
              Прогноз доступен в личном кабинете в разделе «Мои прогнозы»
            </p>
          </div>

          <div className="flex gap-3">
            <Link to="/profile" className="flex-1">
              <button className="btn-orange w-full py-3 rounded-xl text-sm uppercase tracking-wider">
                Личный кабинет
              </button>
            </Link>
            <Link to="/" className="flex-1">
              <button className="w-full py-3 rounded-xl text-sm font-oswald uppercase tracking-wider border border-white/15 text-white/60 hover:border-white/30 hover:text-white/80 transition-all">
                На главную
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
