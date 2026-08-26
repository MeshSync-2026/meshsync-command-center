// Satellite uplinks status page
//
// This page is currently disabled and hidden from the navigation sidebar.
// The implementation is kept here commented out so it can be re-enabled
// once the satellite uplink backend integration is ready.
//
// To re-enable:
//   1. Uncomment the code below.
//   2. Uncomment the import and route in src/App.jsx.
//   3. Uncomment the nav entry in src/components/Sidebar.jsx.
//
// import { useApp } from "../context/AppContext";
// import { useData } from "../context/DataContext";
// import { useToast } from "../context/ToastContext";
// import { Badge, PageHeader, EmptyState } from "../components/ui";
// import Icon from "../components/Icon";
// import { SATELLITE_TYPE } from "../data/enums";
//
// function timeAgo(iso) {
//   if (!iso) return "Never";
//   const diff = Date.now() - new Date(iso).getTime();
//   const seconds = Math.floor(diff / 1000);
//
//   if (seconds < 60) return `${seconds}s ago`;
//
//   const minutes = Math.floor(seconds / 60);
//   if (minutes < 60) return `${minutes}m ago`;
//
//   const hours = Math.floor(minutes / 60);
//   if (hours < 24) return `${hours}h ago`;
//
//   const days = Math.floor(hours / 24);
//   return `${days}d ago`;
// }
//
// function QueueBar({ label, count, max, color }) {
//   const pct = max > 0 ? Math.min(100, (count / max) * 100) : 0;
//   return (
//     <div className="flex items-center gap-2">
//       <span className="w-14 text-xs text-gray-500">{label}</span>
//       <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
//         <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
//       </div>
//       <span className="w-6 text-right text-xs font-medium text-gray-700">{count}</span>
//     </div>
//   );
// }
//
// export default function Satellite() {
//   const { t } = useApp();
//   const { satUplinks, squads } = useData();
//   const { toastSuccess } = useToast();
//
//   const squadName = (squadId) => {
//     const squad = squads.find((s) => s.id === squadId);
//
//     return squad ? squad.squad_name : squadId;
//   };
//
//
//   const handleForceSync = (uplink) => {
//     toastSuccess(`Force sync triggered for ${squadName(uplink.squad_id)}`);
//   };
//
//   if (satUplinks.length === 0) {
//     return (
//       <div className="space-y-4">
//         <PageHeader title={t("sat.title")} icon="satellite" />
//         <EmptyState icon="satellite" message={t("sat.empty")} />
//       </div>
//     );
//   }
//
//   const maxQueue = Math.max(...satUplinks.map((u) => u.queue_depth || 0), 1);
//
//
//   return (
//     <div className="space-y-4">
//       <PageHeader title={t("sat.title")} icon="satellite" />
//
//       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//         {satUplinks.map((uplink) => {
//           const meta = SATELLITE_TYPE[uplink.type] || SATELLITE_TYPE.NONE;
//           return (
//             <div key={uplink.id} className="card p-5 space-y-4">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-3">
//                   <div
//                     className={`grid h-10 w-10 place-items-center rounded-lg ${
//                       uplink.is_connected ? "bg-brand-50 text-brand-600" : "bg-gray-100 text-gray-500"
//                     }`}
//                   >
//                     <Icon name="satellite" className="h-5 w-5" />
//                   </div>
//                   <div>
//                     <h3 className="text-sm font-semibold text-gray-900">{squadName(uplink.squad_id)}</h3>
//                     <p className="text-xs text-gray-500">{meta.label}</p>
//                   </div>
//                 </div>
//                 <Badge tone={uplink.is_connected ? "ok" : "danger"}>
//                   {uplink.is_connected ? t("sat.connected") : t("sat.disconnected")}
//                 </Badge>
//               </div>
//
//               <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
//                 <span className="text-xs text-gray-500">{t("sat.bandwidth")}</span>
//                 <span className="text-xs font-medium text-gray-700">{meta.bandwidth}</span>
//               </div>
//
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs font-medium text-gray-600">{t("sat.queueDepth")}</span>
//                   <span className="text-xs text-gray-500">
//                     {uplink.queue_depth} {t("common.events")}
//                   </span>
//                 </div>
//                 <QueueBar
//                   label={t("sat.critical")}
//                   count={uplink.queue_critical}
//                   max={maxQueue}
//                   color="bg-danger-600"
//                 />
//                 <QueueBar
//                   label={t("sat.high")}
//                   count={uplink.queue_high}
//                   max={maxQueue}
//                   color="bg-warn-500"
//                 />
//                 <QueueBar
//                   label={t("sat.normal")}
//                   count={uplink.queue_normal}
//                   max={maxQueue}
//                   color="bg-brand-600"
//                 />
//               </div>
//
//               <div className="flex items-center justify-between border-t border-gray-200 pt-3">
//                 <div className="flex items-center gap-1.5 text-xs text-gray-500">
//                   <Icon name="clock" className="h-4 w-4" />
//                   <span>
//                     {t("sat.lastSync")}: {timeAgo(uplink.last_sync_at)}
//                   </span>
//                 </div>
//                 <button
//                   onClick={() => handleForceSync(uplink)}
//                   disabled={uplink.type === "NONE"}
//                   className="btn-primary px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
//                 >
//                   <span className="flex items-center gap-1.5">
//                     <Icon name="refresh" className="h-3.5 w-3.5" />
//                     {t("sat.forceSync")}
//                   </span>
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

export default function Satellite() {
  return null;
}
