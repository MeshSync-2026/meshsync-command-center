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
import { ccApi, fetchAllData } from "../api/client";

const RESOLVED_CODE = 5; // STATUS.RESOLVED

const DataContext = createContext(null);
const REFRESH_INTERVAL_MS = 15000;

// Demo data seeding is a dev-tool only — never available in production builds.
const DEMO_SEEDING_ENABLED = import.meta.env.DEV;

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
      // Always overwrite — empty results mean the DB is genuinely empty.
      // Guarding on length would leave stale or mock rows behind.
      setIncidents(data.incidents);
      setEvents(data.events);
      setBatches(data.batches);
      setSquads(data.squads);
      setDevices(data.devices);
      setZones(data.zones);
      setSatUplinks(data.satUplinks);
      setClusters(data.clusters);
      setSyncSessions(data.syncSessions);
      setActivity(data.activity);
      setUsers(data.users);

      setApiErrors(data.errors || []);
      setLastRefresh(new Date().toISOString());
    } catch (err) {
      setApiErrors([err.message]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch squad members once the squad list is known
  useEffect(() => {
    if (squads.length === 0) {
      setSquadMembers([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const members = [];
      for (const squad of squads) {
        try {
          const detail = await ccApi.getSquad(squad.id);
          for (const m of detail.members || []) members.push(m);
        } catch { /* squad detail unavailable — leave it out */ }
      }
      if (!cancelled) setSquadMembers(members);
    })();
    return () => { cancelled = true; };
  }, [squads]);

  useEffect(() => {
    refreshAll();
    refreshTimer.current = setInterval(refreshAll, REFRESH_INTERVAL_MS);
    return () => clearInterval(refreshTimer.current);
  }, [refreshAll]);

  // --- Write actions: every one calls the real backend, then refreshes ---

  const runAction = useCallback(async (fn) => {
    const result = await fn();
    await refreshAll();
    return result;
  }, [refreshAll]);

  // Incidents are event-sourced projections: status changes emit cloud events.
  const updateIncident = useCallback(async (id, patch = {}) => {
    return runAction(async () => {
      if (patch.status === "RESOLVED" || patch.status_code === RESOLVED_CODE) {
        await ccApi.resolveIncident(id);
      } else if (patch.status === "CANCELLED") {
        await ccApi.cancelIncident(id);
      }
      if (patch.assigned_squad_id) {
        const incident = incidents.find((i) => i.id === id);
        const squad = squads.find((s) => s.id === patch.assigned_squad_id);
        const zoneId = incident?.zone_id || squad?.zone_id;
        if (!zoneId) throw new Error("No zone on the incident or squad — assign a zone first");
        await ccApi.dispatchSquad({ squad_id: patch.assigned_squad_id, zone_id: zoneId, incident_id: id });
      }
    });
  }, [runAction, incidents, squads]);

  const assignIncidentSquad = useCallback(async (id, squadId) => {
    return runAction(async () => {
      const incident = incidents.find((i) => i.id === id);
      const squad = squads.find((s) => s.id === squadId);
      const zoneId = incident?.zone_id || squad?.zone_id;
      if (!zoneId) throw new Error("No zone on the incident or squad — assign a zone first");
      await ccApi.dispatchSquad({ squad_id: squadId, zone_id: zoneId, incident_id: id });
    });
  }, [runAction, incidents, squads]);

  const cancelIncident = useCallback(async (id) => {
    return runAction(() => ccApi.cancelIncident(id));
  }, [runAction]);

  const resolveIncident = useCallback(async (id) => {
    return runAction(() => ccApi.resolveIncident(id));
  }, [runAction]);

  const bulkAssign = useCallback(async (ids, squadId) => {
    return runAction(async () => {
      const squad = squads.find((s) => s.id === squadId);
      for (const id of ids) {
        const incident = incidents.find((i) => i.id === id);
        const zoneId = incident?.zone_id || squad?.zone_id;
        if (!zoneId) throw new Error(`Incident ${id}: no zone on incident or squad`);
        await ccApi.dispatchSquad({ squad_id: squadId, zone_id: zoneId, incident_id: id });
      }
    });
  }, [runAction, incidents, squads]);

  const bulkStatus = useCallback(async (ids, status) => {
    return runAction(async () => {
      for (const id of ids) {
        if (status === "RESOLVED" || String(status) === "5") await ccApi.resolveIncident(id);
        else if (status === "CANCELLED") await ccApi.cancelIncident(id);
        else throw new Error(`Status '${status}' cannot be set by command — only RESOLVED or CANCELLED`);
      }
    });
  }, [runAction]);

  const createSquad = useCallback(async (squad) => {
    return runAction(() => ccApi.createSquad(squad));
  }, [runAction]);

  const updateSquad = useCallback(async (id, patch) => {
    return runAction(() => ccApi.updateSquad(id, patch));
  }, [runAction]);

  const deleteSquad = useCallback(async (id) => {
    return runAction(() => ccApi.deleteSquad(id));
  }, [runAction]);

  const assignSquadToZone = useCallback(async (squadId, zoneId) => {
    return runAction(() => ccApi.updateSquad(squadId, { zone_id: zoneId }));
  }, [runAction]);

  const addSquadMember = useCallback(async (member) => {
    return runAction(() => ccApi.addSquadMember(member.squad_id, {
      authority_user_id: member.authority_user_id,
      role_in_squad: member.role_in_squad,
    }));
  }, [runAction]);

  const removeSquadMember = useCallback(async (squadId, memberId) => {
    return runAction(() => ccApi.removeSquadMember(squadId, memberId));
  }, [runAction]);

  const resolveCluster = useCallback(async (id) => {
    return runAction(() => ccApi.resolveCluster(id));
  }, [runAction]);

  const recalculateClusters = useCallback(async () => {
    return runAction(() => ccApi.recalculateClusters());
  }, [runAction]);

  const revokeDevice = useCallback(async (id) => {
    return runAction(() => ccApi.revokeDevice(id));
  }, [runAction]);

  const approveUser = useCallback(async (id) => {
    return runAction(() => ccApi.approveUser(id));
  }, [runAction]);

  const rejectUser = useCallback(async (id) => {
    return runAction(() => ccApi.rejectUser(id));
  }, [runAction]);

  const kpis = useMemo(() => {
    const total = incidents.length;
    const isResolved = (i) => i.status === "RESOLVED" || i.status_code === RESOLVED_CODE;
    const active = incidents.filter((i) => !isResolved(i)).length;
    const resolved = incidents.filter(isResolved).length;
    const unassigned = incidents.filter(
      (i) => i.status === "UNASSIGNED" || i.status === "OPEN" || i.status_code === 1
    ).length;
    const live = incidents.filter(
      (i) => i.confidence_code === "LIVE" || i.confidence_code === 1
    ).length;
    const unconfirmed = incidents.filter(
      (i) => i.confidence_code === "UNCONFIRMED" || i.confidence_code === 2
    ).length;
    const critical = incidents.filter(
      (i) => (i.severity_level === 3 || i.severity_level === 4) && !isResolved(i)
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
      demoSeedingEnabled: DEMO_SEEDING_ENABLED,
      seedDemoData,
      clearData,
      updateIncident,
      assignIncidentSquad,
      cancelIncident,
      resolveIncident,
      bulkAssign,
      bulkStatus,
      createSquad,
      updateSquad,
      deleteSquad,
      assignSquadToZone,
      addSquadMember,
      removeSquadMember,
      resolveCluster,
      recalculateClusters,
      revokeDevice,
      approveUser,
      rejectUser,
    }),
    [
      incidents, clusters, squads, squadMembers, devices, events, history,
      syncSessions, satUplinks, batches, activity, zones, users, kpis,
      loading, lastRefresh, apiErrors, refreshAll,
      isSeeded, seedDemoData, clearData,
      updateIncident, assignIncidentSquad, cancelIncident, resolveIncident, bulkAssign, bulkStatus,
      createSquad, updateSquad, deleteSquad, assignSquadToZone,
      addSquadMember, removeSquadMember,
      resolveCluster, recalculateClusters, revokeDevice, approveUser, rejectUser,
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
