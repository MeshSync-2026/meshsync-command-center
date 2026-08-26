// Incidents list page with filters, bulk actions, and pagination
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";
import { usePrefs } from "../context/PrefsContext";
import { useToast } from "../context/ToastContext";
import { Badge, PageHeader, Pagination, ConfirmDialog, EmptyState } from "../components/ui";
import Icon from "../components/Icon";
import { SEVERITY, STATUS, CONFIDENCE, HAZARD_CATEGORY, REPORT_TYPE } from "../data/enums";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = Object.entries(STATUS).map(([key, val]) => ({
  key,
  label: val.label,
}));
const SEVERITY_OPTIONS = Object.entries(SEVERITY).map(([key, val]) => ({
  key,
  label: val.label,
}));

export default function Incidents() {
  const { t, isCommander, user } = useApp();
  const {
    incidents, squads, deleteIncident,
    bulkAssign, bulkStatus, logActivity,
  } = useData();
  const { activeDistrict, districtCoords } = usePrefs();
  const { toastSuccess, toastDanger } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState([]);
  const [bulkSquad, setBulkSquad] = useState("");
  const [bulkStatusValue, setBulkStatusValue] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);

  const districtFiltered = useMemo(() => {
    if (activeDistrict === "all") return incidents;
    return incidents.filter(
      (i) =>
        Math.abs(i.latitude - (districtCoords?.lat || 0)) < 0.5 &&
        Math.abs(i.longitude - (districtCoords?.lng || 0)) < 0.5
    );
  }, [incidents, activeDistrict, districtCoords]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return districtFiltered
      .filter((inc) => {
        if (statusFilter !== "all" && inc.status !== statusFilter) return false;
        if (severityFilter !== "all" && String(inc.severity_level) !== severityFilter) return false;
        if (!q) return true;
        return (
          inc.id.toLowerCase().includes(q) ||
          (inc.report_type || "").toLowerCase().includes(q) ||
          (inc.landmark_name || "").toLowerCase().includes(q) ||
          (HAZARD_CATEGORY[inc.category_code] || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [districtFiltered, search, statusFilter, severityFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage = Math.min(page, totalPages || 1);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function resetPage() {
    setPage(1);
  }

  const pageIds = pageItems.map((i) => i.id);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.includes(id));

  function toggleSelectAll() {
    if (allOnPageSelected) {
      setSelected((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelected((prev) => [...new Set([...prev, ...pageIds])]);
    }
  }

  function toggleSelect(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function clearSelection() {
    setSelected([]);
  }

  function handleBulkAssign() {
    if (!bulkSquad || selected.length === 0) return;
    bulkAssign(selected, bulkSquad);
    logActivity("ASSIGN_SQUAD", `${selected.length} incidents`, user?.email);
    toastSuccess(
      `Assigned ${selected.length} incident${selected.length > 1 ? "s" : ""} to ${squads.find((s) => s.id === bulkSquad)?.squad_name || "squad"}`
    );
    setBulkSquad("");
    clearSelection();
  }

  function handleBulkStatus() {
    if (!bulkStatusValue || selected.length === 0) return;
    bulkStatus(selected, bulkStatusValue);
    logActivity("STATUS_UPDATE", `${selected.length} incidents`, user?.email);
    toastSuccess(
      `Updated ${selected.length} incident${selected.length > 1 ? "s" : ""} to ${STATUS[bulkStatusValue]?.label || bulkStatusValue}`
    );
    setBulkStatusValue("");
    clearSelection();
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteIncident(deleteTarget.id);
    logActivity("DELETE_INCIDENT", deleteTarget.id, user?.email);
    toastDanger(`Incident ${deleteTarget.id} deleted`);
    setSelected((prev) => prev.filter((id) => id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  function squadName(id) {
    if (!id) return "—";
    return squads.find((s) => s.id === id)?.squad_name || "—";
  }

  function locationLabel(inc) {
    return (
      inc.landmark_name ||
      `${inc.latitude.toFixed(3)}, ${inc.longitude.toFixed(3)}`
    );
  }

  return (
    <div>
      <PageHeader
        title={t("inc.title")}
        subtitle={activeDistrict === "all" ? t("dash.nationalCommand") : activeDistrict}
        icon="incidents"
      />

      <div className="card p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2"
            />
            <input
              className="input pl-9"
              placeholder={t("inc.search")}
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            />
          </div>
          <select
            className="select md:w-44"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
          >
            <option value="all">{t("inc.allStatuses")}</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            className="select md:w-40"
            value={severityFilter}
            onChange={(e) => { setSeverityFilter(e.target.value); resetPage(); }}
          >
            <option value="all">{t("inc.allSeverities")}</option>
            {SEVERITY_OPTIONS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="card p-3 mb-4 flex flex-wrap items-center gap-3 border border-brand-500/30">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Icon name="check" className="w-4 h-4 text-brand-600" />
            <span className="font-medium">
              {selected.length} {t("inc.selected")}
            </span>
          </div>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <select className="select w-44" value={bulkSquad} onChange={(e) => setBulkSquad(e.target.value)}>
              <option value="">{t("inc.assignSquad")}…</option>
              {squads.filter((s) => s.is_active).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.squad_name}
                </option>
              ))}
            </select>
            <button className="btn-primary" onClick={handleBulkAssign} disabled={!bulkSquad}>
              {t("inc.assign")}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select className="select w-40" value={bulkStatusValue} onChange={(e) => setBulkStatusValue(e.target.value)}>
              <option value="">{t("inc.status")}…</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <button className="btn-primary" onClick={handleBulkStatus} disabled={!bulkStatusValue}>
              {t("inc.update")}
            </button>
          </div>
          <button className="btn-ghost ml-auto" onClick={clearSelection}>
            {t("inc.clear")}
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="incidents"
          title="No incidents found"
          description="Try adjusting your search or filters to see incidents."
        />
      ) : (
        <div className="card overflow-x-auto ms-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                <th className="px-3 py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAll}
                    className="ms-checkbox"
                  />
                </th>
                <th className="px-4 py-2.5 font-medium">{t("inc.id")}</th>
                <th className="px-4 py-2.5 font-medium">{t("inc.type")}</th>
                <th className="px-4 py-2.5 font-medium">{t("inc.severity")}</th>
                <th className="px-4 py-2.5 font-medium">{t("inc.status")}</th>
                <th className="px-4 py-2.5 font-medium">{t("inc.confidence")}</th>
                <th className="px-4 py-2.5 font-medium">{t("inc.people")}</th>
                <th className="px-4 py-2.5 font-medium">{t("inc.location")}</th>
                <th className="px-4 py-2.5 font-medium">{t("inc.assigned")}</th>
                <th className="px-4 py-2.5 font-medium">{t("inc.created")}</th>
                <th className="px-4 py-2.5 font-medium text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((inc) => (
                <tr key={inc.id} className="table-row group">
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.includes(inc.id)}
                      onChange={() => toggleSelect(inc.id)}
                      className="ms-checkbox"
                    />
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-brand-600">
                    <Link to={`/incidents/${inc.id}`} className="hover:underline">
                      {inc.id}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-gray-700">{REPORT_TYPE[inc.report_type] || inc.report_type}</span>
                    {inc.category_code > 0 && (
                      <span className="block text-xs text-gray-500 mt-0.5">
                        {HAZARD_CATEGORY[inc.category_code]}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={SEVERITY[inc.severity_level]?.tone}>
                      {SEVERITY[inc.severity_level]?.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={STATUS[inc.status]?.tone}>{STATUS[inc.status]?.label}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={CONFIDENCE[inc.confidence_code]?.tone}>
                      {CONFIDENCE[inc.confidence_code]?.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">{inc.people_count}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{locationLabel(inc)}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-600">{squadName(inc.assigned_squad_id)}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{timeAgo(inc.created_at)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="btn-ghost p-1.5"
                        title="View details"
                      >
                        <Icon name="search" className="w-4 h-4" />
                      </Link>
                      {isCommander && (
                        <button
                          className="btn-ghost p-1.5 text-danger-600 hover:text-danger-600"
                          title="Delete incident"
                          onClick={() => setDeleteTarget(inc)}
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
      )}

      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Incident"
        message={`Are you sure you want to permanently delete incident ${deleteTarget?.id || ""}? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
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
