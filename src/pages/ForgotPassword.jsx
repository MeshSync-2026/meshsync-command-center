// Forgot password page
import { useApp } from "../context/AppContext";
import { Link } from "react-router-dom";
import Icon from "../components/Icon";

export default function ForgotPassword() {
  const { t } = useApp();

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
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-warn-500/15 grid place-items-center mx-auto mb-4">
            <Icon name="alert" className="w-6 h-6 text-warn-500" />
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-2">{t("auth.forgot")}</h2>
          <p className="text-sm text-gray-500 mb-6">{t("auth.forgotDesc")}</p>

          <Link to="/login" className="btn-secondary w-full inline-flex">
            {t("auth.back")}
          </Link>
        </div>
      </div>
    </main>
  );
}