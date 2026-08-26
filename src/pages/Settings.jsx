// Settings page for user preferences
import { useApp } from "../context/AppContext";
import { usePrefs } from "../context/PrefsContext";
import { useToast } from "../context/ToastContext";
import { PageHeader } from "../components/ui";
import Icon from "../components/Icon";

export default function Settings() {
  const { t } = useApp();
  const { updatePref, ...prefs } = usePrefs();
  const { toastSuccess } = useToast();

  const handleSave = (key, value) => {
    updatePref(key, value);

    toastSuccess(t("settings.saved"));
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title={t("settings.title")} icon="settings" />

      <div className="card p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            {t("settings.defaultDistrict")}
          </label>
          <select
            value={prefs.defaultDistrict}
            onChange={(e) => handleSave("defaultDistrict", e.target.value)}
            className="select"
          >
            <option value="all">{t("settings.nationalCommand")}</option>
            {prefs.districts.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            {t("settings.alertThreshold")}
          </label>
          <select
            value={prefs.alertThreshold}
            onChange={(e) => handleSave("alertThreshold", e.target.value)}
            className="select"
          >
            <option value="all">{t("settings.allIncidents")}</option>
            <option value="high">High Severity Only</option>
            <option value="critical">{t("settings.criticalOnly")}</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">{t("settings.autoRefresh")}</label>
            <p className="text-xs text-gray-500 mt-0.5">Auto-refresh dashboard data</p>
          </div>
          <button
            onClick={() => handleSave("autoRefresh", !prefs.autoRefresh)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              prefs.autoRefresh ? "bg-brand-200" : "bg-white"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full transition-transform ${
                prefs.autoRefresh ? "left-5 bg-brand-600" : "left-0.5 bg-ink-300"
              }`}
            />
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            {t("settings.muleTimeout")}
          </label>
          <input
            type="number"
            value={prefs.muleTimeout}
            onChange={(e) => handleSave("muleTimeout", parseInt(e.target.value) || 30)}
            className="input"
            min="5"
            max="120"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            {t("settings.mapLayer")}
          </label>
          <select
            value={prefs.mapLayer}
            onChange={(e) => handleSave("mapLayer", e.target.value)}
            className="select"
          >
            <option value="dark">Dark (OLED-friendly)</option>
            <option value="light">Light</option>
            <option value="satellite">Satellite</option>
          </select>
        </div>
      </div>

      <div className="card p-4 mt-4">
        <div className="flex items-center gap-3">
          <Icon name="shield" className="w-5 h-5 text-brand-600" />

          <div>
            <p className="text-sm font-medium text-gray-700">MeshSync Command Center v1.0.0</p>
            <p className="text-xs text-gray-500">Architecture Plan v3.2 — Tier 1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
