// App context for auth, language, and user management
import { createContext, useContext, useMemo, useState, useCallback } from "react";
import bcrypt from "bcryptjs";
import { translations, LANGS } from "../i18n/translations";
import { ccApi } from "../api/client";

const AppContext = createContext(null);

const LS_LANG = "meshsync.lang";
const LS_SESSION = "meshsync.session";
const LS_USERS = "meshsync.users";

// Demo users with bcrypt-hashed passwords (cost factor 10).
// In production, credentials come from the Command Center backend,
// which stores hashes using the same bcrypt scheme.
const SEED_USERS = [
  {
    id: "u-001", name: "Capt. Anjali Perera", email: "anjali@meshsync.lk",
    password: "$2b$10$eu4Pze3I.ep7oBhyXUnNA.FrskxeW1acFAutDTz3fDyuAZKS8Gk4W",
    role: "COMMANDER", status: "APPROVED",
    requestedAt: new Date(Date.now() - 30 * 86400000).toISOString(), approvedBy: "system",
  },
  {
    id: "u-002", name: "Disp. Suresh Kanagaraj", email: "suresh@meshsync.lk",
    password: "$2b$10$7iiLNpzCfLoVYXrnpMg6Wu8S67fs88yv7NwkrzjEoVbljQfS34ElO",
    role: "DISPATCHER", status: "APPROVED",
    requestedAt: new Date(Date.now() - 20 * 86400000).toISOString(), approvedBy: "system",
  },
  {
    id: "u-003", name: "Disp. Tharindu Silva", email: "tharindu@meshsync.lk",
    password: "$2b$10$cFkFbfiuCfGkfVpu5gU4x./BjkO.un4csRwtQTqTjWxs/2cqamPVq",
    role: "DISPATCHER", status: "APPROVED",
    requestedAt: new Date(Date.now() - 15 * 86400000).toISOString(), approvedBy: "system",
  },
];

function loadUsers() {
  try {
    const raw = localStorage.getItem(LS_USERS);
    if (raw) return JSON.parse(raw);
  } catch { }
  localStorage.setItem(LS_USERS, JSON.stringify(SEED_USERS));
  return [...SEED_USERS];
}

function saveUsers(users) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem(LS_LANG) || "en");
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_SESSION);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });
  const [users, setUsers] = useState(() => loadUsers());

  const changeLang = useCallback((code) => {
    setLang(code);
    localStorage.setItem(LS_LANG, code);
  }, []);

  const signIn = useCallback(async (email, password) => {
    try {
      const result = await ccApi.login(email, password);
      if (result.token) {
        const sess = {
          id: result.user?.id || result.id,
          name: result.user?.full_name || result.user?.name || email,
          email: result.user?.username || email,
          role: result.user?.clearance_level || result.user?.role || "DISPATCHER",
        };
        setSession(sess);
        localStorage.setItem(LS_SESSION, JSON.stringify(sess));
        return { ok: true };
      }
    } catch (apiErr) {
    }

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !user.password || !bcrypt.compareSync(password, user.password)) {
      return { ok: false, error: "invalid" };
    }
    if (user.status === "PENDING") return { ok: false, error: "pending" };
    if (user.status === "REJECTED") return { ok: false, error: "rejected" };
    if (user.status === "DISABLED") return { ok: false, error: "disabled" };
    const sess = { id: user.id, name: user.name, email: user.email, role: user.role };
    setSession(sess);
    localStorage.setItem(LS_SESSION, JSON.stringify(sess));
    return { ok: true };
  }, [users]);

  const signOut = useCallback(() => {
    setSession(null);
    localStorage.removeItem(LS_SESSION);
  }, []);

  const signUp = useCallback(({ name, email, role, organization }) => {
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) return { ok: false, error: "exists" };
    const newUser = {
      id: `u-${String(users.length + 1).padStart(3, "0")}-${Date.now().toString(36)}`,
      name, email, password: null, role, organization: organization || "",
      status: "PENDING", requestedAt: new Date().toISOString(), approvedBy: null,
    };
    const next = [newUser, ...users];
    setUsers(next);
    saveUsers(next);
    return { ok: true };
  }, [users]);

  const DEFAULT_PASSWORD = "demo1234";
  const approveUser = useCallback((userId) => {
    const next = users.map((u) =>
      u.id === userId
        ? {
            ...u,
            status: "APPROVED",
            approvedBy: session?.email || "commander",
            password: u.password || bcrypt.hashSync(DEFAULT_PASSWORD, 10),
          }
        : u
    );
    setUsers(next);
    saveUsers(next);
  }, [users, session]);

  const rejectUser = useCallback((userId) => {
    const next = users.map((u) =>
      u.id === userId ? { ...u, status: "REJECTED", approvedBy: session?.email || "commander" } : u
    );
    setUsers(next);
    saveUsers(next);
  }, [users, session]);

  const pendingUsers = useMemo(() => users.filter((u) => u.status === "PENDING"), [users]);
  const approvedUsers = useMemo(() => users.filter((u) => u.status === "APPROVED"), [users]);

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
      user: session, signIn, signOut, signUp,
      approveUser, rejectUser, users, pendingUsers, approvedUsers,
      isCommander: session?.role === "COMMANDER",
    }),
    [lang, changeLang, t, session, signIn, signOut, signUp, approveUser, rejectUser, users, pendingUsers, approvedUsers]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
