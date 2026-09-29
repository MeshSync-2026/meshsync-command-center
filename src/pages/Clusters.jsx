// Clusters management page
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { Badge, PageHeader, Modal, ConfirmDialog, EmptyState } from "../components/ui";
import Icon from "../components/Icon";
import { SEVERITY } from "../data/enums";

export default function Clusters() {
  const { t, isCommander } = useApp();
  const { clusters, incidents, resolveCluster, recalculateClusters, loading } = useData();
  const { toastSuccess, toastError } = useToast();

  const [detailCluster, setDetailCluster] = useState(null);
  const [confirmResolve, setConfirmResolve] = useState(null);

  const incidentsOf = (clusterId) => incidents.filter((i) => i.cluster_id === clusterId);

  const handleRecalculate = async () => {
    try {
      await recalculateClusters();
      toastSuccess("Clusters recalculated");
    } catch (err) {
      toastError(err.message);
    }
  };

  const handleResolve = async () => {
    try {
      await resolveCluster(confirmResolve.id);
      toastSuccess("Cluster resolved");
      setConfirmResolve(null);
      setDetailCluster(null);
    } catch (err) {
      toastError(err.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={t("cluster.title")}
        action={
          <button className="btn-secondary" onClick={handleRecalculate} disabled={loading}>
            <Icon name="sync" className="w-4 h-4 mr-1.5" />
            Recalculate
          </button>
        }
      />

      {clusters.length === 0 ? (
        <EmptyState icon="clusters" message={t("cluster.empty")} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clusters.map((cluster) => {
            const sev = SEVERITY[cluster.max_severity] ?? SEVERITY[1];
            return (
              <div key={cluster.id} className="card p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{cluster.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{cluster.id}</p>
                  </div>
                  <Badge tone={sev.tone}>{sev.label}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">{t("cluster.members")}</p>
                    <p className="text-gray-900 font-medium flex items-center gap-1.5">
                      <Icon name="incidents" className="w-4 h-4 text-brand-600" />
                      {cluster.member_count}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">{t("cluster.radius")}</p>
                    <p className="text-gray-900 font-medium">
                      {cluster.radius_meters.toLocaleString()} m
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">{t("cluster.status")}</p>
                    <Badge tone={cluster.status === "ACTIVE" ? "brand" : "gray"}>
                      {cluster.status === "ACTIVE" ? t("cluster.active") : t("cluster.resolved")}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">{t("cluster.maxSeverity")}</p>
                    <p className="text-gray-900 font-medium">{sev.label}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    className="btn-secondary flex-1"
                    onClick={() => setDetailCluster(cluster)}
                  >
                    <Icon name="layers" className="w-4 h-4 mr-1.5" />
                    View Members
                  </button>

                  {isCommander && cluster.status === "ACTIVE" && (
                    <button
                      className="btn-danger"
                      onClick={() => setConfirmResolve(cluster)}
                      title="Resolve cluster"
                    >
                      <Icon name="check" className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!detailCluster} onClose={() => setDetailCluster(null)} title={detailCluster?.name}>
        {detailCluster && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Badge tone={SEVERITY[detailCluster.max_severity]?.tone ?? "gray"}>
                {SEVERITY[detailCluster.max_severity]?.label ?? "Low"}
              </Badge>
              <Badge tone={detailCluster.status === "ACTIVE" ? "brand" : "gray"}>
                {detailCluster.status === "ACTIVE" ? t("cluster.active") : t("cluster.resolved")}
              </Badge>
              <span className="text-gray-500">
                {incidentsOf(detailCluster.id).length} incidents
              </span>
            </div>

            <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {incidentsOf(detailCluster.id).length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">{t("common.noData")}</p>
              ) : (
                incidentsOf(detailCluster.id).map((inc) => (
                  <div key={inc.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-mono text-gray-900 truncate">{inc.id}</p>
                      <p className="text-xs text-gray-500">
                        {inc.report_type} · {inc.status}
                      </p>
                    </div>
                    <Badge tone={SEVERITY[inc.severity_level]?.tone ?? "gray"}>
                      {SEVERITY[inc.severity_level]?.label ?? "Low"}
                    </Badge>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button className="btn-ghost" onClick={() => setDetailCluster(null)}>{t("common.close")}</button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmResolve}
        title="Resolve Cluster"
        message={`Mark cluster ${confirmResolve?.id || ""} as resolved? Member incidents stay open until individually resolved.`}
        confirmLabel="Resolve"
        tone="danger"
        onConfirm={handleResolve}
        onCancel={() => setConfirmResolve(null)}
      />
    </div>
  );
}
