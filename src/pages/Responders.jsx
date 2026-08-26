// Registered devices/responders management page
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { Badge, PageHeader, ConfirmDialog, EmptyState } from "../components/ui";
import Icon from "../components/Icon";
import { ROLE } from "../data/enums";

function timeAgo(iso) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);

  if (h < 1) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Responders() {
  const { t, isCommander } = useApp();
  const { devices, toggleDevice } = useData();
  const { toastSuccess, toastError } = useToast();

  const [filter, setFilter] = useState("all");
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);

  const filtered = devices.filter((d) => {
    if (filter === "active") return d.is_active;
    if (filter === "inactive") return !d.is_active;
    return true;
  });


  const handleToggle = (device) => {
    toggleDevice(device.id);

    toastSuccess(device.is_active ? "Device deactivated" : "Device activated");
  };

  const handleConfirmDeactivate = () => {
    const device = confirmDeactivate;
    if (device.is_active) {
      toggleDevice(device.id);
      toastSuccess("Device deactivated");
    } else {
      toastError("Device is already inactive");
    }

    setConfirmDeactivate(null);
  };


  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t("responder.title")}
        action={
          <div className="flex items-center gap-1 bg-white rounded-lg p-1">
            {["all", "active", "inactive"].map((f) => (
              <button
                key={f}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                  filter === f ? "bg-brand-100 text-brand-600" : "text-gray-500 hover:text-gray-900"
                }`}
                onClick={() => setFilter(f)}
              >
                {f === "all" ? t("common.all") : f}
              </button>
            ))}
          </div>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState icon="responders" message={t("responder.empty")} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <th className="px-4 py-3 font-medium">{t("responder.nodeId")}</th>
                  <th className="px-4 py-3 font-medium">{t("responder.role")}</th>
                  <th className="px-4 py-3 font-medium">{t("responder.status")}</th>
                  <th className="px-4 py-3 font-medium">{t("responder.lastSeen")}</th>
                  <th className="px-4 py-3 font-medium">{t("responder.appVersion")}</th>
                  <th className="px-4 py-3 font-medium text-right">{t("common.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-400/10">
                {filtered.map((device) => (
                  <tr key={device.id} className="hover:bg-white/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-gray-900">
                      {device.node_id}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {ROLE[device.role_code] ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={device.is_active ? "ok" : "gray"}>
                        {device.is_active ? t("responder.active") : t("responder.inactive")}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="clock" className="w-3.5 h-3.5 text-gray-500" />
                        {timeAgo(device.last_seen_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                      {device.app_version}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="btn-ghost"
                          onClick={() => handleToggle(device)}
                          title={device.is_active ? "Deactivate" : "Activate"}
                        >
                          <Icon name={device.is_active ? "close" : "check"} className="w-4 h-4" />
                        </button>
                        {isCommander && device.is_active && (
                          <button
                            className="btn-danger"
                            onClick={() => setConfirmDeactivate(device)}
                            title="Deactivate device"
                          >
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDeactivate}
        title="Deactivate Device"
        message="Deactivate this device? It will lose access to the mesh network until reactivated."
        confirmLabel={t("common.confirm")}
        tone="danger"
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setConfirmDeactivate(null)}
      />
    </div>
  );
}
