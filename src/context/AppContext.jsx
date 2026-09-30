// App context for auth, language, and session
import { createContext, useContext, useMemo, useState, useCallback, useEffect } from "react";
import { translations, LANGS } from "../i18n/translations";
import { ccApi, setAuthToken, getAuthToken } from "../api/client";

const AppContext = createContext(null);

const LS_LANG = "meshsync.lang";
const LS_SESSION = "meshsync.session";

function sessionFromApi(result) {
  const u = result.user || result;
  return {
    id: u.id,
    name: u.full_name || u.name || u.username,
    email: u.username || u.email,
    role: u.clearance_level || u.role || "DISPATCHER",
  };
}

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(LS_LANG) || "en");
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [authChecked, setAuthChecked] = useState(false);

  const changeLang = useCallback((code) => {
    setLang(code);
    localStorage.setItem(LS_LANG, code);
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    setAuthToken(null);
    localStorage.removeItem(LS_SESSION);
  }, []);

  // On load, validate a persisted token against the backend. If the server is
  // unreachable we keep the stored session so the UI doesn't force re-login
  // during a temporary outage, but a real 401/403 always signs out.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getAuthToken() || !session) {
        setAuthChecked(true);
        return;
      }
      try {
        const me = await ccApi.getMe();
        if (!cancelled && me) {
          const refreshed = {
            id: me.id || session.id,
            name: me.full_name || session.name,
            email: me.username || session.email,
            role: me.clearance_level || session.role,
          };
          setSession(refreshed);
          localStorage.setItem(LS_SESSION, JSON.stringify(refreshed));
        }
      } catch (err) {
        if (!cancelled && (err.status === 401 || err.status === 403 || /401|403/.test(err.message || ""))) signOut();
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = useCallback(async (email, password) => {
    try {
      const result = await ccApi.login(email, password);
      const sess = sessionFromApi(result);
      setSession(sess);
      localStorage.setItem(LS_SESSION, JSON.stringify(sess));
      return { ok: true };
    } catch (err) {
      const msg = (err.message || "").toLowerCase();
      if (msg.includes("pending")) return { ok: false, error: "pending" };
      if (msg.includes("401") || msg.includes("invalid credentials")) return { ok: false, error: "invalid" };
      return { ok: false, error: "unreachable" };
    }
  }, []);

  const signUp = useCallback(async ({ name, email, password }) => {
    try {
      await ccApi.signup({ username: email, password, full_name: name });
      return { ok: true };
    } catch (err) {
      if ((err.message || "").includes("409") || /exists/i.test(err.message || "")) {
        return { ok: false, error: "exists" };
      }
      return { ok: false, error: "unreachable" };
    }
  }, []);

  const t = useMemo(() => {
    const dict = translations[lang] || translations.en;
    return (key, vars) => {
      let val = dict[key];
      if (val === undefined) val = translations.en[key];
      if (val === undefined) return key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          val = val.replace(new RegExp(`\\{${k}\\}`, "g"), v);
        }
      }
      return val;
    };
  }, [lang]);

  const value = useMemo(
    () => ({
      lang, changeLang, langs: LANGS, t,
      user: session, signIn, signOut, signUp, authChecked,
      isCommander: session?.role === "COMMANDER",
    }),
    [lang, changeLang, t, session, signIn, signOut, signUp, authChecked]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
