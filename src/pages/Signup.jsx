// Signup/access request page
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useNavigate, Link } from "react-router-dom";
import { CLEARANCE } from "../data/enums";

export default function Signup() {
  const { t, signUp, toastSuccess } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "DISPATCHER",
    organization: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const result = signUp(form);
    if (result.ok) {
      toastSuccess(t("auth.signupSuccess"));
      navigate("/login");
    } else {
      setError(t(`auth.${result.error}`));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src="/logo-full.png"
            alt="MeshSync"
            className="h-16 mx-auto mb-4 object-contain"
          />
          <p className="text-sm text-gray-500">{t("auth.signup")}</p>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t("auth.signup")}</h2>

          {error && (
            <div className="mb-4 rounded-lg border border-danger-600/30 bg-danger-600/10 px-3 py-2 text-sm text-danger-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                {t("auth.name")}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="you@meshsync.lk"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                {t("auth.role")}
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="select"
              >
                <option value="DISPATCHER">{CLEARANCE.DISPATCHER}</option>
                <option value="COMMANDER">{CLEARANCE.COMMANDER}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">
                {t("auth.organization")}
              </label>
              <input
                type="text"
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                className="input"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              {t("auth.signupBtn")}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              {t("auth.haveAccount")}{" "}
              <Link
                to="/login"
                className="text-brand-600 hover:text-brand-700 font-medium"
              >
                {t("auth.login")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
