import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Главная" },
    { to: "/profile", label: "Профиль" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #FF6B00, #FF8C00)" }}>
            <Icon name="TrendingUp" size={16} className="text-white" />
          </div>
          <span className="font-oswald font-700 text-lg tracking-wider text-white uppercase">
            Про<span style={{ color: "#FF6B00" }}>Прогноз</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-link text-sm uppercase tracking-widest ${
                location.pathname === l.to ? "text-orange-500" : "text-white/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/profile">
            <button className="btn-orange px-5 py-2 rounded-lg text-sm uppercase tracking-wider">
              Войти
            </button>
          </Link>
        </div>

        <button
          className="md:hidden text-white/70"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name={menuOpen ? "X" : "Menu"} size={22} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden glass border-t border-white/5 px-4 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={`nav-link text-sm uppercase tracking-widest ${
                location.pathname === l.to ? "text-orange-500" : "text-white/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/profile" onClick={() => setMenuOpen(false)}>
            <button className="btn-orange w-full py-2 rounded-lg text-sm uppercase tracking-wider">
              Войти
            </button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
