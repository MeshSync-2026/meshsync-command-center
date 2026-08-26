// Top header bar with navigation and user menu
import { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { usePrefs } from "../context/PrefsContext";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

export default function Header({ onMenuClick }) {
  const { t, user, signOut, lang, changeLang, langs } = useApp();
  const { activeDistrict, changeDistrict, districts } = usePrefs();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-sm border-b border-gray-200 flex items-center justify-between px-4 gap-4"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <Icon name="menu" className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <Icon name="pin" className="w-4 h-4 text-brand-600 hidden sm:block" />
          <select
            value={activeDistrict}
            onChange={(e) => changeDistrict(e.target.value)}
            className="select text-sm py-1.5 w-auto min-w-[140px]"
          >
            <option value="all">National Command</option>
            {districts.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
          {langs.map((l) => (
            <button
              key={l.code}
              onClick={() => changeLang(l.code)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                lang === l.code
                  ? "bg-brand-100 text-brand-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 grid place-items-center text-brand-600 text-sm font-bold">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
            <Icon name="chevronDown" className="w-4 h-4 text-gray-500 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 card shadow-elevated animate-slide-in overflow-hidden">
              <div className="p-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>

              <div className="p-1.5">
                <button
                  onClick={() => { setUserMenuOpen(false); navigate("/profile"); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                >
                  <Icon name="profile" className="w-4 h-4" />
                  {t("nav.profile")}
                </button>
                <button
                  onClick={() => { setUserMenuOpen(false); navigate("/settings"); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
                >
                  <Icon name="settings" className="w-4 h-4" />
                  {t("nav.settings")}
                </button>
                <button
                  onClick={() => { setUserMenuOpen(false); signOut(); navigate("/login"); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger-600 hover:bg-danger-600/10 rounded-lg transition-colors"
                >
                  <Icon name="logout" className="w-4 h-4" />
                  {t("nav.logout")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
