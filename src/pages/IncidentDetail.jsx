// Incident detail page with map, history, and edit
import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import { Badge, PageHeader, Modal } from "../components/ui";
import SriLankaMap from "../components/SriLankaMap";
import Icon from "../components/Icon";
import { SEVERITY, STATUS, CONFIDENCE, HAZARD_CATEGORY, ACTION_TYPE } from "../data/enums";

const STATUS_OPTIONS = Object.entries(STATUS).map(([key, val]) => ({
  key,
  label: val.label,
}));
const SEVERITY_OPTIONS = Object.entries(SEVERITY).map(([key, val]) => ({
  key,
  label: val.label,
}));

const STATUS_LEVELS = {
  0: { label: "OK", tone: "ok" },
  1: { label: "Moderate", tone: "warn" },
  2: { label: "Critical", tone: "danger" },
};

export default function IncidentDetail() {
  const { id } = useParams();
  const { t, isCommander, user } = useApp();
  const {
    incidents, squads, history,
    updateIncident, logActivity,
  } = useData();
  const { toastSuccess } = useToast();

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    status: "",
    severity_level: "",
    assigned_squad_id: "",
  });

  const incident = useMemo(() => incidents.find((i) => i.id === id), [incidents, id]);

  const incidentHistory = useMemo(
    () =>
      history
        .filter((h) => h.incident_id === id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [history, id]
  );

  const assignedSquad = useMemo(
    () => (incident?.assigned_squad_id ? squads.find((s) => s.id === incident.assigned_squad_id) : null),
    [incident, squads]
  );

  if (!incident) {
    return (
      <div>
        <PageHeader title="Incident Not Found" icon="incidents" />
        <div className="card p-8 text-center">
          <Icon name="incidents" className="w-8 h-8 text-gray-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-4">
            Incident <span className="font-mono text-brand-600">{id}</span> could not be found.
          </p>
          <Link to="/incidents" className="btn-primary inline-flex">
            Back to Incidents
          </Link>
        </div>
      </div>
    );
  }

  function openEdit() {
    setEditForm({
      status: incident.status,
      severity_level: String(incident.severity_level),
      assigned_squad_id: incident.assigned_squad_id || "",
    });
    setEditOpen(true);
  }

  function handleSaveEdit() {
    const patch = {
      status: editForm.status,
      severity_level: Number(editForm.severity_level),
      assigned_squad_id: editForm.assigned_squad_id || null,
    };

    if (editForm.assigned_squad_id && editForm.status === "UNASSIGNED") {
      patch.status = "ASSIGNED";
    }

    updateIncident(incident.id, patch);
    logActivity("STATUS_UPDATE", incident.id, user?.email);
    toastSuccess(`Incident ${incident.id} updated`);
    setEditOpen(false);
  }

  return (
    <div>
      <PageHeader
        title={`Incident ${incident.id}`}
        subtitle={`${HAZARD_CATEGORY[incident.category_code] || "Unknown"} · ${incident.report_type}`}
        icon="incidents"
        actions={
          <div className="flex items-center gap-2">
            <Link to="/incidents" className="btn-secondary">
              <Icon name="chevronLeft" className="w-4 h-4 mr-1" />
              Back
            </Link>

            <button className="btn-primary" onClick={openEdit}>
              <Icon name="edit" className="w-4 h-4 mr-1" />
              {t("inc.edit")}
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-4">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge tone={SEVERITY[incident.severity_level]?.tone}>
                {SEVERITY[incident.severity_level]?.label} {t("common.severity")}
              </Badge>
              <Badge tone={STATUS[incident.status]?.tone}>{STATUS[incident.status]?.label}</Badge>
              <Badge tone={CONFIDENCE[incident.confidence_code]?.tone}>
                {CONFIDENCE[incident.confidence_code]?.label}
              </Badge>
              {incident.is_cloud_synced ? (
                <Badge tone="ok">Synced</Badge>
              ) : (
                <Badge tone="warn">{t("dash.pendingSync")}</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <InfoTile icon="users" label={t("common.people")} value={incident.people_count} />
              <InfoTile icon="pin" label="Latitude" value={incident.latitude.toFixed(4)} />
              <InfoTile icon="pin" label="Longitude" value={incident.longitude.toFixed(4)} />
              <InfoTile icon="map" label="Landmark" value={incident.landmark_name || "—"} />
              <InfoTile icon="radio" label="Creator Node" value={incident.creator_node_id} />
              <InfoTile
                icon="clusters"
                label="Cluster"
                value={incident.cluster_id || "None"}
              />
            </div>
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="alert" className="w-4 h-4 text-brand-600" />
              On-Site Conditions
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <ConditionTile label="Water Level" level={incident.status_water} />
              <ConditionTile label="Injuries" level={incident.status_injury} />
              <ConditionTile label="Safety" level={incident.status_safety} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Icon name="map" className="w-4 h-4 text-brand-600" />
              {t("inc.location")}
            </h3>
            <SriLankaMap incidents={[incident]} height="300px" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="squads" className="w-4 h-4 text-brand-600" />
              {t("inc.assigned")}
            </h3>
            {assignedSquad ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 grid place-items-center text-brand-600">
                    <Icon name="squads" className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{assignedSquad.squad_name}</p>
                    <p className="text-xs text-gray-500 font-mono">{assignedSquad.id}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{t("common.status")}</span>
                  <Badge tone={assignedSquad.is_active ? "ok" : "gray"}>
                    {assignedSquad.is_active ? t("squad.active") : t("squad.inactive")}
                  </Badge>
                </div>
                {assignedSquad.zone_id && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Zone</span>
                    <span className="text-gray-700 font-mono">{assignedSquad.zone_id}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <Icon name="squads" className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500">No squad assigned</p>
              </div>
            )}
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="clock" className="w-4 h-4 text-brand-600" />
              Incident History
            </h3>
            {incidentHistory.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No history recorded</p>
            ) : (
              <div className="relative space-y-3 before:content-[''] before:absolute before:left-[7px] before:top-1 before:bottom-1 before:w-px before:bg-gray-200">
                {incidentHistory.map((h) => (
                  <div key={h.id} className="relative pl-6">
                    <div className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-brand-100 border-2 border-brand-500" />

                    <p className="text-xs font-medium text-gray-700">
                      {ACTION_TYPE[h.action_type_code] || `Action ${h.action_type_code}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      by <span className="font-mono">{h.actor_node_id}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(h.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Icon name="settings" className="w-4 h-4 text-brand-600" />
              Metadata
            </h3>
            <div className="space-y-2 text-xs">
              <MetaRow label={t("common.created")} value={timeAgo(incident.created_at)} />
              <MetaRow label={t("inc.updated")} value={timeAgo(incident.updated_at)} />
              <MetaRow label="Zone" value={incident.zone_id || "—"} />
              <MetaRow
                label="Cloud Synced"
                value={incident.is_cloud_synced ? "Yes" : "No"}
              />
            </div>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit Incident ${incident.id}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("inc.status")}</label>
            <select
              className="select w-full"
              value={editForm.status}
              onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("inc.severity")}</label>
            <select
              className="select w-full"
              value={editForm.severity_level}
              onChange={(e) => setEditForm((f) => ({ ...f, severity_level: e.target.value }))}
            >
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("inc.assigned")}</label>
            <select
              className="select w-full"
              value={editForm.assigned_squad_id}
              onChange={(e) => setEditForm((f) => ({ ...f, assigned_squad_id: e.target.value }))}
            >
              <option value="">{t("squad.unassigned")}</option>
              {squads.filter((s) => s.is_active).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.squad_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button className="btn-secondary" onClick={() => setEditOpen(false)}>{t("common.cancel")}</button>
            <button className="btn-primary" onClick={handleSaveEdit}>{t("inc.saveChanges")}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="p-3 rounded-lg bg-gray-50">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon name={icon} className="w-3.5 h-3.5 text-gray-500" />
        <p className="text-xs text-gray-500">{label}</p>
      </div>
      <p className="text-sm text-gray-900 font-medium truncate">{value}</p>
    </div>
  );
}

function ConditionTile({ label, level }) {
  const info = STATUS_LEVELS[level] || STATUS_LEVELS[0];
  return (
    <div className="p-3 rounded-lg bg-gray-50 text-center">
      <p className="text-xs text-gray-500 mb-1.5">{label}</p>
      <Badge tone={info.tone}>{info.label}</Badge>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-700 font-medium">{value}</span>
    </div>
  );
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
