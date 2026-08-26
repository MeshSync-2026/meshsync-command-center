// User profile page
import { useApp } from "../context/AppContext";
import { PageHeader, Badge } from "../components/ui";
import Icon from "../components/Icon";
import { CLEARANCE } from "../data/enums";

export default function Profile() {
  const { user, t } = useApp();
  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <PageHeader title={t("nav.profile")} icon="profile" />

      <div className="card p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 grid place-items-center text-brand-600 text-2xl font-bold">
            {user.name?.charAt(0) || "U"}
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-1">
              <Badge tone="brand">{CLEARANCE[user.role] || user.role}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <Icon name="shield" className="w-5 h-5 text-brand-600" />
            <div>
              <p className="text-xs text-gray-500">{t("profile.role")}</p>
              <p className="text-sm text-gray-900">{CLEARANCE[user.role] || user.role}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
            <Icon name="profile" className="w-5 h-5 text-brand-600" />
            <div>
              <p className="text-xs text-gray-500">{t("profile.email")}</p>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
