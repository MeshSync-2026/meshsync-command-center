// Login page
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import Icon from "../components/Icon";

export default function Login() {
  const { t, signIn } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.ok) {
        navigate("/");
      } else {
        setError(t(`auth.${result.error}`));
      }
    } catch {
      setError(t("auth.invalid"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/logo-full.png"
            alt="MeshSync"
            width="512"
            height="256"
            className="h-16 mx-auto mb-4 object-contain"
          />
          <p className="text-sm text-gray-500">{t("dash.title")}</p>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t("auth.login")}</h2>

          {error && (
            <div className="mb-4 rounded-lg border border-danger-600/30 bg-danger-600/10 px-3 py-2 text-sm text-danger-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@meshsync.lk"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                {t("auth.password")}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "..." : t("auth.signinBtn")}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              {t("auth.noAccount")}{" "}
              <Link
                to="/signup"
                className="text-brand-600 hover:text-brand-700 font-medium"
              >
                {t("auth.signup")}
              </Link>
            </p>
          </div>
        </div>

        {import.meta.env.DEV && (
          <div className="mt-4 card p-3 text-xs text-gray-500">
            <p className="font-medium text-gray-600 mb-1">Demo accounts (local in-memory backend only):</p>
            <p>anjali@meshsync.lk / demo1234 (Commander)</p>
            <p>suresh@meshsync.lk / demo1234 (Dispatcher)</p>
          </div>
        )}

      </div>
    </main>
  );
}
