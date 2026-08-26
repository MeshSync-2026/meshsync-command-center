// Analytics page with charts and KPIs
import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";
import { PageHeader, MetricCard } from "../components/ui";
import { LineChart, BarChart, DonutChart } from "../components/charts/Charts";
import { STATUS, SEVERITY, REPORT_TYPE } from "../data/enums";

const RANGES = [
  { key: "7d", label: "7 Days", ms: 7 * 86400000 },
  { key: "30d", label: "30 Days", ms: 30 * 86400000 },
  { key: "all", label: "All Time", ms: null },
];

const PALETTE = [
  "#83D3D9", "#5eb4ba", "#3f8e94", "#2c6b70",
  "#1e555a", "#9ee0e4", "#4fb2b8", "#6fc4c9",
];

function formatHours(ms) {
  const hours = ms / 3600000;

  if (hours < 1) return `${Math.round(ms / 60000)}m`;
  return `${hours.toFixed(1)}h`;
}

export default function Analytics() {
  const { t } = useApp();
  const { incidents, zones } = useData();
  const [range, setRange] = useState("7d");

  const rangeMs = RANGES.find((r) => r.key === range)?.ms;
  const filtered = useMemo(() => {
    if (!rangeMs) return incidents;
    const cutoff = Date.now() - rangeMs;
    return incidents.filter((i) => new Date(i.created_at).getTime() >= cutoff);
  }, [incidents, rangeMs]);

  const kpis = useMemo(() => {
    const total = filtered.length;
    const resolved = filtered.filter((i) => i.status === "RESOLVED");
    const assigned = filtered.filter((i) =>
      ["ASSIGNED", "EN_ROUTE", "ON_SCENE", "RESOLVED"].includes(i.status)
    );

    const avgAssign = assigned.length
      ? assigned.reduce((sum, i) => sum + (new Date(i.updated_at) - new Date(i.created_at)), 0) / assigned.length
      : 0;

    const avgResolve = resolved.length
      ? resolved.reduce((sum, i) => sum + (new Date(i.updated_at) - new Date(i.created_at)), 0) / resolved.length
      : 0;

    const resolutionRate = total > 0 ? Math.round((resolved.length / total) * 100) : 0;

    return { avgAssign, avgResolve, resolutionRate, total };
  }, [filtered]);

  const trendData = useMemo(() => {
    if (filtered.length === 0) return [];
    const buckets = {};

    filtered.forEach((i) => {
      const d = new Date(i.created_at);
      const key = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      buckets[key] = (buckets[key] || 0) + 1;
    });

    const labels = Object.keys(buckets).sort((a, b) => new Date(a) - new Date(b));
    return labels.map((l) => ({ label: l, value: buckets[l] }));
  }, [filtered]);

  const districtData = useMemo(() => {
    const zoneDistrict = {};
    zones.forEach((z) => { zoneDistrict[z.id] = z.district; });

    const counts = {};
    filtered.forEach((i) => {
      const district = zoneDistrict[i.zone_id] || "Unknown";
      counts[district] = (counts[district] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return entries.map((e) => ({ label: e[0], value: e[1] }));
  }, [filtered, zones]);

  const statusData = useMemo(() => {
    const counts = {};
    filtered.forEach((i) => { counts[i.status] = (counts[i.status] || 0) + 1; });
    const entries = Object.entries(counts);
    return entries.map(([k, v], i) => ({
      label: STATUS[k]?.label || k,
      value: v,
      color: PALETTE[i % PALETTE.length],
    }));
  }, [filtered]);

  const severityData = useMemo(() => {
    const counts = {};
    filtered.forEach((i) => { counts[i.severity_level] = (counts[i.severity_level] || 0) + 1; });
    const entries = Object.entries(counts).sort((a, b) => a[0] - b[0]);
    const sevColors = ["#83D3D9", "#e0a83b", "#e0533b"];
    return entries.map(([k, v], i) => ({
      label: SEVERITY[k]?.label || `L${k}`,
      value: v,
      color: sevColors[i % sevColors.length],
    }));
  }, [filtered]);

  const reportData = useMemo(() => {
    const counts = {};
    filtered.forEach((i) => { counts[i.report_type] = (counts[i.report_type] || 0) + 1; });
    const entries = Object.entries(counts);
    const repColors = ["#83D3D9", "#5eb4ba", "#3f8e94"];
    return entries.map(([k, v], i) => ({
      label: REPORT_TYPE[k] || k,
      value: v,
      color: repColors[i % repColors.length],
    }));
  }, [filtered]);


  return (
    <div className="space-y-4">
      <PageHeader title={t("nav.analytics")} icon="analytics" />

      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`btn-ghost text-sm ${
              range === r.key ? "bg-brand-50 text-brand-600" : "text-gray-500"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Avg Assign Time"
          value={formatHours(kpis.avgAssign)}
          icon="clock"
        />
        <MetricCard
          label="Avg Resolve Time"
          value={formatHours(kpis.avgResolve)}
          icon="check"
        />
        <MetricCard
          label="Resolution Rate"
          value={`${kpis.resolutionRate}%`}
          icon="analytics"
        />
      </div>

      <div className="card p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">{t("analytics.trend")}</h3>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">{t("common.noData")}</p>
        ) : (
          <LineChart data={trendData} />
        )}
      </div>

      <div className="card p-5">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">{t("analytics.byZone")}</h3>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">{t("common.noData")}</p>
        ) : (
          <BarChart data={districtData} />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">{t("analytics.byStatus")}</h3>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">{t("common.noData")}</p>
          ) : (
            <DonutChart data={statusData} />
          )}
        </div>
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">{t("analytics.bySeverity")}</h3>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">{t("common.noData")}</p>
          ) : (
            <DonutChart data={severityData} />
          )}
        </div>
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">{t("analytics.byCategory")}</h3>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">{t("common.noData")}</p>
          ) : (
            <DonutChart data={reportData} />
          )}
        </div>
      </div>
    </div>
  );
}
