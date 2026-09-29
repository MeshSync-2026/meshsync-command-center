// Sidebar navigation with collapse support
import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useData } from "../context/DataContext";
import Icon from "./Icon";

const NAV_ITEMS = [
  { to: "/", icon: "dashboard", key: "nav.dashboard", end: true },
  { to: "/incidents", icon: "incidents", key: "nav.incidents" },
  { to: "/clusters", icon: "clusters", key: "nav.clusters" },
  { to: "/squads", icon: "squads", key: "nav.squads" },
  { to: "/responders", icon: "responders", key: "nav.responders" },
  { to: "/sync", icon: "sync", key: "nav.sync" },
  // Satellite uplink monitoring — hidden from navigation for now.
  // { to: "/satellite", icon: "satellite", key: "nav.satellite" },
  { to: "/analytics", icon: "analytics", key: "nav.analytics" },
  { to: "/access", icon: "access", key: "nav.access", commanderOnly: true },
  { to: "/audit", icon: "audit", key: "nav.audit", commanderOnly: true },
  { to: "/settings", icon: "settings", key: "nav.settings" },
];

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { t, isCommander } = useApp();
  const { kpis, users } = useData();

  const items = NAV_ITEMS.filter((item) => !item.commanderOnly || isCommander);
  const pendingCount = users.filter((u) => u.status === "PENDING" || u.is_active === false).length;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen
          bg-white border-r border-gray-200
          flex flex-col transition-all duration-200
          ${collapsed ? "w-16" : "w-60"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-200 flex-shrink-0">
          <img
            src="/logo-symbol.png"
            alt="MeshSync"
            className="w-9 h-9 rounded-lg flex-shrink-0 object-cover"
          />
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">MeshSync</p>
              <p className="text-xs text-gray-500 truncate">Command Center</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link-active" : ""} ${collapsed ? "justify-center px-2" : ""}`
              }
              title={collapsed ? t(item.key) : undefined}
            >
              <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{t(item.key)}</span>}
              {!collapsed && item.key === "nav.access" && pendingCount > 0 && (
                <span className="ml-auto badge bg-danger-600/20 text-danger-600 text-xs">
                  {pendingCount}
                </span>
              )}
              {!collapsed && item.key === "nav.incidents" && kpis.criticalIncidents > 0 && (
                <span className="ml-auto badge bg-danger-600/20 text-danger-600 text-xs">
                  {kpis.criticalIncidents}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center gap-2 px-3 py-2.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors border-t border-gray-200"
        >
          <Icon name={collapsed ? "chevronRight" : "chevronLeft"} className="w-4 h-4" />
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>
    </>
  );
}
