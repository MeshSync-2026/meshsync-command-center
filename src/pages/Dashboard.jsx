// Dashboard page with KPIs, map, and recent activity
import { useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";
import { usePrefs } from "../context/PrefsContext";
import { MetricCard, PageHeader, SectionHeader, Badge } from "../components/ui";
import SriLankaMap from "../components/SriLankaMap";
import Icon from "../components/Icon";
import { HAZARD_CATEGORY, SEVERITY, STATUS, CONFIDENCE } from "../data/enums";
import { TONE_BADGE } from "../data/enums";

export default function Dashboard() {
  const { t } = useApp();
  const {
    kpis, incidents, clusters, activity, syncSessions, satUplinks,
    isSeeded, demoSeedingEnabled, seedDemoData, clearData, apiErrors, loading, lastRefresh,
  } = useData();
  const { activeDistrict, districtCoords } = usePrefs();

  const filteredIncidents = useMemo(() => {
    if (activeDistrict === "all") return incidents;
    return incidents.filter((i) => {
      return (
        Math.abs(i.latitude - (districtCoords?.lat || 0)) < 0.5 &&
        Math.abs(i.longitude - (districtCoords?.lng || 0)) < 0.5
      );
    });
  }, [incidents, activeDistrict, districtCoords]);

  const recentActivity = activity.slice(0, 8);
  const recentIncidents = [...filteredIncidents]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 6);

  return (
    <div>
      <PageHeader
        title={t("dash.title")}
        subtitle={activeDistrict === "all" ? t("dash.nationalCommand") : activeDistrict}
        icon="dashboard"
      />

      {apiErrors.length > 0 && (
        <div className="card p-4 mb-4 border border-warn-500/40 bg-warn-500/5">
          <p className="text-xs font-medium text-warn-600 mb-1">Backend connection issues:</p>
          {apiErrors.map((e, i) => (
            <p key={i} className="text-xs text-warn-600">{e}</p>
          ))}
        </div>
      )}

      {demoSeedingEnabled && !isSeeded && (
        <div className="card p-6 mb-6 text-center">
          <Icon name="incidents" className="w-10 h-10 text-brand-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">No data loaded</h2>
          <p className="text-sm text-gray-500 mb-4">
            Live data is loading from the backend automatically{loading ? "…" : ""}.
            You can also load AI-generated demo data to explore the interface (dev only).
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={seedDemoData}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Load Demo Data
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            Demo data is AI-generated for evaluation purposes only.
          </p>
        </div>
      )}

      {demoSeedingEnabled && isSeeded && (
        <div className="flex justify-end mb-4">
          <button
            onClick={clearData}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Data
          </button>
        </div>
      )}


      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard
          label={t("dash.activeIncidents")}
          value={kpis.activeIncidents}
          icon="incidents"
          tone="danger"
          subtitle={`${kpis.criticalIncidents} critical`}
        />
        <MetricCard
          label={t("dash.livePins")}
          value={kpis.liveIncidents}
          icon="pin"
          tone="ok"
          subtitle={`${kpis.unconfirmedIncidents} unconfirmed`}
        />
        <MetricCard label={t("dash.resolved")} value={kpis.resolvedIncidents} icon="check" tone="ok" subtitle={`${kpis.resolutionRate}% rate`} />
        <MetricCard label={t("dash.activeSquads")} value={kpis.activeSquads} icon="squads" tone="brand" subtitle={`${kpis.totalSquads} total`} />
        <MetricCard label={t("dash.onlineDevices")} value={kpis.onlineDevices} icon="responders" tone="gray" />
        <MetricCard label={t("dash.satConnected")} value={kpis.satConnected} icon="satellite" tone="brand" />
        <MetricCard label={t("dash.pendingSync")} value={kpis.pendingSync} icon="sync" tone="warn" />
        <MetricCard label={t("dash.resolutionRate")} value={`${kpis.resolutionRate}%`} icon="analytics" tone="ok" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <SectionHeader title={t("dash.mapOverview")} icon="map" />
          <SriLankaMap
            incidents={filteredIncidents}
            clusters={clusters}
            districtCoords={districtCoords}
            height="380px"
          />
        </div>

        <div>
          <SectionHeader title={t("dash.recentActivity")} icon="clock" />
          <div className="card divide-y divide-gray-100 max-h-[380px] overflow-y-auto">
            {recentActivity.map((act) => (
              <div key={act.id} className="p-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 grid place-items-center flex-shrink-0">
                  <Icon name={getActivityIcon(act.action)} className="w-4 h-4 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-700 truncate">{act.action.replace(/_/g, " ")}</p>
                  <p className="text-xs text-gray-500 truncate">{act.actor_email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(act.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <SectionHeader title={t("inc.title")} icon="incidents" />
        <div className="card overflow-x-auto ms-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                <th className="px-4 py-2 font-medium">{t("inc.id")}</th>
                <th className="px-4 py-2 font-medium">{t("inc.type")}</th>
                <th className="px-4 py-2 font-medium">{t("inc.severity")}</th>
                <th className="px-4 py-2 font-medium">{t("inc.status")}</th>
                <th className="px-4 py-2 font-medium">{t("inc.confidence")}</th>
                <th className="px-4 py-2 font-medium">{t("inc.people")}</th>
                <th className="px-4 py-2 font-medium">{t("inc.created")}</th>
              </tr>
            </thead>
            <tbody>
              {recentIncidents.map((inc) => (
                <tr key={inc.id} className="table-row">
                  <td className="px-4 py-2.5 font-mono text-xs text-brand-600">{inc.id}</td>
                  <td className="px-4 py-2.5">{inc.report_type}</td>
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
                  <td className="px-4 py-2.5">{inc.people_count}</td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">{timeAgo(inc.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getActivityIcon(action) {
  const map = {
    LOGIN: "profile",
    LOGOUT: "logout",
    ASSIGN_SQUAD: "squads",
    CREATE_ZONE: "pin",
    RESOLVE_CLUSTER: "check",
    APPROVE_USER: "access",
    REVOKE_DEVICE: "shield",
    DISPATCH: "radio",
    VIEW_INCIDENT: "incidents",
    SOS_CREATED: "incidents",
    SOS_RESOLVED: "check",
    RESPONDER_EN_ROUTE: "radio",
    EVENT_INGESTED: "sync",
    STATUS_UPDATE: "dashboard",
  };

  return map[action] || "dashboard";
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
