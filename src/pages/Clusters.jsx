// Clusters management page
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { Badge, PageHeader, Modal, ConfirmDialog, EmptyState } from "../components/ui";
import Icon from "../components/Icon";
import { SEVERITY } from "../data/enums";

const SEVERITY_KEYS = Object.keys(SEVERITY);

export default function Clusters() {
  const { t, isCommander } = useApp();
  const { clusters, incidents, updateCluster, deleteCluster } = useData();
  const { toastSuccess, toastError } = useToast();

  const [detailCluster, setDetailCluster] = useState(null);
  const [editCluster, setEditCluster] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", max_severity: 1 });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const incidentsOf = (clusterId) => incidents.filter((i) => i.cluster_id === clusterId);

  const openEdit = (cluster) => {
    setEditCluster(cluster);
    setEditForm({ name: cluster.name, max_severity: cluster.max_severity });
  };

  const handleEdit = (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      toastError("Cluster name is required");
      return;
    }

    updateCluster(editCluster.id, {
      name: editForm.name.trim(),
      max_severity: Number(editForm.max_severity),
    });
    toastSuccess("Cluster updated");
    setEditCluster(null);
  };

  const handleDelete = () => {
    deleteCluster(confirmDelete.id);
    toastSuccess("Cluster deleted");
    setConfirmDelete(null);
    setDetailCluster(null);
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader title={t("cluster.title")} />

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

                  <button className="btn-ghost" onClick={() => openEdit(cluster)} title={t("inc.edit")}>
                    <Icon name="edit" className="w-4 h-4" />
                  </button>

                  {isCommander && (
                    <button
                      className="btn-danger"
                      onClick={() => setConfirmDelete(cluster)}
                      title={t("common.delete")}
                    >
                      <Icon name="trash" className="w-4 h-4" />
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

      <Modal open={!!editCluster} onClose={() => setEditCluster(null)} title={t("inc.edit")}>
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">{t("cluster.name")}</label>
            <input
              className="input"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">{t("cluster.maxSeverity")}</label>
            <select
              className="select"
              value={editForm.max_severity}
              onChange={(e) => setEditForm({ ...editForm, max_severity: e.target.value })}
            >
              {SEVERITY_KEYS.map((k) => (
                <option key={k} value={k}>
                  {SEVERITY[k].label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-ghost" onClick={() => setEditCluster(null)}>{t("common.cancel")}</button>
            <button type="submit" className="btn-primary">{t("common.save")}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Cluster"
        message="Delete this cluster? Member incidents will be unlinked but not deleted."
        confirmLabel={t("common.delete")}
        tone="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
