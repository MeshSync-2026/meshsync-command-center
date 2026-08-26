// Sync sessions page with batch details
import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";
import { Badge, PageHeader, Modal, EmptyState } from "../components/ui";
import { SYNC_STATUS } from "../data/enums";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "FAILED", label: "Failed" },
];

function formatDuration(ms) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms} ms`;

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return `${minutes}m ${rem}s`;
}

function formatDateTime(iso) {
  if (!iso) return "—";

  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const BATCH_TONE = {
  COMPLETED: "ok",
  PARTIAL: "warn",
  FAILED: "danger",
};

export default function SyncSessions() {
  const { t } = useApp();
  const { syncSessions, batches } = useData();
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    if (filter === "all") return syncSessions;
    return syncSessions.filter((s) => s.status === filter);
  }, [syncSessions, filter]);


  const sessionBatches = useMemo(() => {
    if (!selected) return [];
    return batches.filter((b) => b.sync_session_id === selected.id);
  }, [batches, selected]);


  return (
    <div className="space-y-4">
      <PageHeader title={t("sync.title")} icon="sync" />

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`btn-ghost text-sm ${
              filter === f.key ? "bg-brand-50 text-brand-600" : "text-gray-500"
            }`}
          >
            {f.key === "all" ? t("common.all") : SYNC_STATUS[f.key]?.label || f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="sync" message={t("sync.empty")} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 font-medium">{t("sync.id")}</th>
                  <th className="px-4 py-3 font-medium">{t("sync.mule")}</th>
                  <th className="px-4 py-3 font-medium">{t("sync.status")}</th>
                  <th className="px-4 py-3 font-medium text-right">{t("sync.events")}</th>
                  <th className="px-4 py-3 font-medium text-right">{t("sync.failed")}</th>
                  <th className="px-4 py-3 font-medium">{t("sync.started")}</th>
                  <th className="px-4 py-3 font-medium text-right">{t("sync.duration")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => {
                  const meta = SYNC_STATUS[s.status] || { label: s.status, tone: "gray" };
                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelected(s)}
                      className="border-b border-gray-300/10 cursor-pointer transition-colors hover:bg-white/60"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-brand-600">
                        {s.id}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {s.mule_node_id}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={meta.tone}>{meta.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {s.events_ingested}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {s.events_failed > 0 ? (
                          <span className="text-danger-600">{s.events_failed}</span>
                        ) : (
                          <span className="text-gray-500">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDateTime(s.started_at)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {formatDuration(s.duration_ms)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${t("sync.title")} · ${selected.id}` : ""}
      >
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-white p-3">
                <p className="text-xs text-gray-500">{t("sync.mule")}</p>
                <p className="mt-0.5 font-mono text-sm text-gray-900">
                  {selected.mule_node_id}
                </p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="text-xs text-gray-500">{t("sync.status")}</p>
                <div className="mt-0.5">
                  <Badge tone={SYNC_STATUS[selected.status]?.tone || "gray"}>
                    {SYNC_STATUS[selected.status]?.label || selected.status}
                  </Badge>
                </div>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="text-xs text-gray-500">{t("sync.events")}</p>
                <p className="mt-0.5 text-sm text-gray-900">
                  {selected.events_ingested}
                </p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="text-xs text-gray-500">{t("sync.duration")}</p>
                <p className="mt-0.5 text-sm text-gray-900">
                  {formatDuration(selected.duration_ms)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold text-gray-700">{t("sync.batches")}</h4>
              {sessionBatches.length === 0 ? (
                <p className="rounded-lg bg-white p-4 text-sm text-gray-500">{t("common.noData")}</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wider text-gray-500">
                        <th className="px-3 py-2 font-medium">{t("sync.batchId")}</th>
                        <th className="px-3 py-2 font-medium text-right">{t("common.events")}</th>
                        <th className="px-3 py-2 font-medium text-right">{t("common.duplicates")}</th>
                        <th className="px-3 py-2 font-medium">{t("common.status")}</th>
                        <th className="px-3 py-2 font-medium">{t("common.received")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionBatches.map((b) => (
                        <tr key={b.id} className="border-b border-gray-300/10 last:border-0">
                          <td className="px-3 py-2 font-mono text-xs text-brand-600">
                            {b.id}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-700">
                            {b.event_count}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-500">
                            {b.duplicate_count}
                          </td>
                          <td className="px-3 py-2">
                            <Badge tone={BATCH_TONE[b.status] || "gray"}>{b.status}</Badge>
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {formatDateTime(b.received_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelected(null)} className="btn-secondary">
                {t("common.close")}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
