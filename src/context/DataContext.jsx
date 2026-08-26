// Data context for incidents, squads, devices, and other entities
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import * as mock from "../data/mockData";
import { edgeSyncApi, ccApi, fetchAllData } from "../api/client";

const DataContext = createContext(null);
const REFRESH_INTERVAL_MS = 15000;

export function DataProvider({ children }) {
  const [incidents, setIncidents] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [squads, setSquads] = useState([]);
  const [squadMembers, setSquadMembers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [events, setEvents] = useState([]);
  const [history, setHistory] = useState([]);
  const [syncSessions, setSyncSessions] = useState([]);
  const [satUplinks, setSatUplinks] = useState([]);
  const [batches, setBatches] = useState([]);
  const [activity, setActivity] = useState([]);
  const [zones, setZones] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [apiErrors, setApiErrors] = useState([]);
  const [isSeeded, setIsSeeded] = useState(false);
  const refreshTimer = useRef(null);


  const seedDemoData = useCallback(() => {
    setIncidents(mock.incidents);
    setClusters(mock.clusters);
    setSquads(mock.responderSquads);
    setSquadMembers(mock.squadMembers);
    setDevices(mock.registeredDevices);
    setEvents(mock.meshEvents);
    setHistory(mock.incidentHistory);
    setSyncSessions(mock.syncSessions);
    setSatUplinks(mock.satelliteUplinks);
    setBatches(mock.ingestionBatches);
    setActivity(mock.activityLog);
    setZones(mock.responseZones);
    setIsSeeded(true);
    setLastRefresh(new Date().toISOString());
  }, []);

  const clearData = useCallback(() => {
    setIncidents([]);
    setClusters([]);
    setSquads([]);
    setSquadMembers([]);
    setDevices([]);
    setEvents([]);
    setHistory([]);
    setSyncSessions([]);
    setSatUplinks([]);
    setBatches([]);
    setActivity([]);
    setZones([]);
    setIsSeeded(false);
    setLastRefresh(null);
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAllData();
      if (data.incidents.length > 0) setIncidents(data.incidents);
      if (data.events.length > 0) setEvents(data.events);
      if (data.batches.length > 0) setBatches(data.batches);
      if (data.squads.length > 0) setSquads(data.squads);
      if (data.devices.length > 0) setDevices(data.devices);
      if (data.zones.length > 0) setZones(data.zones);
      if (data.satUplinks.length > 0) setSatUplinks(data.satUplinks);
      if (data.clusters.length > 0) setClusters(data.clusters);
      if (data.syncSessions.length > 0) setSyncSessions(data.syncSessions);
      if (data.activity.length > 0) setActivity(data.activity);
      if (data.users.length > 0) setUsers(data.users);

      setApiErrors(data.errors || []);
      setLastRefresh(new Date().toISOString());
    } catch (err) {
      setApiErrors([err.message]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isSeeded) return;
    refreshAll();
    refreshTimer.current = setInterval(refreshAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshTimer.current);
  }, [refreshAll, isSeeded]);

  const updateIncident = useCallback((id, patch) => {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch, updated_at: new Date().toISOString() } : i))
    );
  }, []);

  const deleteIncident = useCallback((id) => {
    setIncidents((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const bulkAssign = useCallback((ids, squadId) => {
    setIncidents((prev) =>
      prev.map((i) =>
        ids.includes(i.id)
          ? { ...i, assigned_squad_id: squadId, status: "ASSIGNED", updated_at: new Date().toISOString() }
          : i
      )
    );
  }, []);

  const bulkStatus = useCallback((ids, status) => {
    setIncidents((prev) =>
      prev.map((i) => (ids.includes(i.id) ? { ...i, status, updated_at: new Date().toISOString() } : i))
    );
  }, []);

  const createSquad = useCallback((squad) => {
    const newSquad = {
      id: `SQD-${String(squads.length + 1).padStart(4, "0")}`,
      is_active: true,
      created_at: new Date().toISOString(),
      ...squad,
    };
    setSquads((prev) => [...prev, newSquad]);
    return newSquad;
  }, [squads]);

  const updateSquad = useCallback((id, patch) => {
    setSquads((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch, updated_at: new Date().toISOString() } : s))
    );
  }, []);

  const deleteSquad = useCallback((id) => {
    setSquads((prev) => prev.filter((s) => s.id !== id));
    setSquadMembers((prev) => prev.filter((m) => m.squad_id !== id));
  }, []);

  const assignSquadToZone = useCallback((squadId, zoneId) => {
    setSquads((prev) => prev.map((s) => (s.id === squadId ? { ...s, zone_id: zoneId } : s)));
  }, []);

  const addSquadMember = useCallback((member) => {
    const newMember = {
      id: `SM-${String(squadMembers.length + 1).padStart(4, "0")}`,
      is_active: true,
      joined_at: new Date().toISOString(),
      ...member,
    };
    setSquadMembers((prev) => [...prev, newMember]);
    return newMember;
  }, [squadMembers]);

  const removeSquadMember = useCallback((id) => {
    setSquadMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateSquadMember = useCallback((id, patch) => {
    setSquadMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const updateCluster = useCallback((id, patch) => {
    setClusters((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteCluster = useCallback((id) => {
    setClusters((prev) => prev.filter((c) => c.id !== id));
    setIncidents((prev) =>
      prev.map((i) => (i.cluster_id === id ? { ...i, cluster_id: null } : i))
    );
  }, []);

  const toggleDevice = useCallback((id) => {
    setDevices((prev) => prev.map((d) => (d.id === id ? { ...d, is_active: !d.is_active } : d)));
  }, []);

  const logActivity = useCallback((action, target, actorEmail) => {
    const entry = {
      id: `ACT-${String(activity.length + 1).padStart(4, "0")}`,
      actor_email: actorEmail || "system",
      action, target,
      timestamp: new Date().toISOString(),
      ip_address: "127.0.0.1",
    };
    setActivity((prev) => [entry, ...prev]);
  }, [activity]);

  const kpis = useMemo(() => {
    const total = incidents.length;
    const active = incidents.filter((i) => i.status !== "RESOLVED").length;
    const resolved = incidents.filter((i) => i.status === "RESOLVED").length;
    const unassigned = incidents.filter(
      (i) => i.status === "UNASSIGNED" || i.status === "OPEN"
    ).length;
    const live = incidents.filter(
      (i) => i.confidence_code === "LIVE" || i.confidence_code === 1
    ).length;
    const unconfirmed = incidents.filter(
      (i) => i.confidence_code === "UNCONFIRMED" || i.confidence_code === 2
    ).length;
    const critical = incidents.filter(
      (i) => i.severity_level === 3 && i.status !== "RESOLVED"
    ).length;
    const pendingSync = events.filter((e) => !e.is_cloud_synced).length;

    return {
      totalIncidents: total,
      activeIncidents: active,
      resolvedIncidents: resolved,
      unassignedIncidents: unassigned,
      liveIncidents: live,
      unconfirmedIncidents: unconfirmed,
      criticalIncidents: critical,
      activeSquads: squads.filter((s) => s.is_active).length,
      onlineDevices: devices.filter((d) => d.is_active).length,
      satConnected: satUplinks.filter((s) => s.is_connected).length,
      pendingSync,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      totalClusters: clusters.length,
      totalSquads: squads.length,
    };
  }, [incidents, clusters, squads, devices, satUplinks, events]);

  const value = useMemo(
    () => ({
      incidents,
      clusters,
      squads,
      squadMembers,
      devices,
      events,
      history,
      syncSessions,
      satUplinks,
      batches,
      activity,
      zones,
      users,
      kpis,
      loading,
      lastRefresh,
      apiErrors,
      refreshAll,
      isSeeded,
      seedDemoData,
      clearData,
      updateIncident,
      deleteIncident,
      bulkAssign,
      bulkStatus,
      createSquad,
      updateSquad,
      deleteSquad,
      assignSquadToZone,
      addSquadMember,
      removeSquadMember,
      updateSquadMember,
      updateCluster,
      deleteCluster,
      toggleDevice,
      logActivity,
    }),
    [
      incidents, clusters, squads, squadMembers, devices, events, history,
      syncSessions, satUplinks, batches, activity, zones, users, kpis,
      loading, lastRefresh, apiErrors, refreshAll,
      isSeeded, seedDemoData, clearData,
      updateIncident, deleteIncident, bulkAssign, bulkStatus,
      createSquad, updateSquad, deleteSquad, assignSquadToZone,
      addSquadMember, removeSquadMember, updateSquadMember,
      updateCluster, deleteCluster, toggleDevice, logActivity,
    ]
  );

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
