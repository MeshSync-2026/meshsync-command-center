// Audit trail page showing system activity log
import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";
import { Badge, PageHeader, EmptyState } from "../components/ui";
import Icon from "../components/Icon";

const ACTION_META = {
  LOGIN: { label: "Login", tone: "brand" },
  LOGOUT: { label: "Logout", tone: "gray" },
  ASSIGN_SQUAD: { label: "Assign Squad", tone: "warn" },
  CREATE_ZONE: { label: "Create Zone", tone: "brand" },
  RESOLVE_CLUSTER: { label: "Resolve Cluster", tone: "ok" },
  APPROVE_USER: { label: "Approve User", tone: "ok" },
  REVOKE_DEVICE: { label: "Revoke Device", tone: "danger" },
  DISPATCH: { label: "Dispatch", tone: "warn" },
  VIEW_INCIDENT: { label: "View Incident", tone: "gray" },
};

function formatDateTime(iso) {
  if (!iso) return "—";

  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AuditTrail() {
  const { t, isCommander } = useApp();
  const { activity } = useData();
  const [actionFilter, setActionFilter] = useState("all");

  const actionTypes = useMemo(() => {
    const set = new Set(activity.map((a) => a.action));
    return ["all", ...Array.from(set).sort()];
  }, [activity]);


  const filtered = useMemo(() => {
    if (actionFilter === "all") return activity;

    return activity.filter((a) => a.action === actionFilter);
  }, [activity, actionFilter]);

  if (!isCommander) {
    return (
      <div className="space-y-4">
        <PageHeader title={t("nav.audit")} icon="audit" />
        <div className="card p-8 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-danger-600/10 text-danger-600">
            <Icon name="shield" className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-gray-700">Commander Access Required</p>
          <p className="mt-1 text-xs text-gray-500">
            Only commanders can view the audit trail.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader title={t("nav.audit")} icon="audit" />

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <Icon name="filter" className="h-4 w-4" />
          Filter:
        </span>
        {actionTypes.map((a) => (
          <button
            key={a}
            onClick={() => setActionFilter(a)}
            className={`btn-ghost text-xs ${
              actionFilter === a ? "bg-brand-50 text-brand-600" : "text-gray-500"
            }`}
          >
            {a === "all" ? t("common.all") : ACTION_META[a]?.label || a}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="audit" message={t("common.noData")} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 font-medium">{t("audit.timestamp")}</th>
                  <th className="px-4 py-3 font-medium">{t("audit.actor")}</th>
                  <th className="px-4 py-3 font-medium">{t("audit.action")}</th>
                  <th className="px-4 py-3 font-medium">{t("audit.target")}</th>
                  <th className="px-4 py-3 font-medium">{t("audit.node") || "Origin node"}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => {
                  const meta = ACTION_META[entry.action] || { label: entry.action, tone: "gray" };
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-300/10 transition-colors hover:bg-white/60 last:border-0"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                        {formatDateTime(entry.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {entry.actor_email}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-brand-600">
                        {entry.target}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">
                        {entry.origin_node_id || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
