// API client for backend services
const EDGE_SYNC_URL = import.meta.env.VITE_EDGE_SYNC_URL || "http://localhost:4001";
const CC_URL = import.meta.env.VITE_CC_URL || "http://localhost:4002";

const STATUS_MAP = { 1: "OPEN", 2: "ASSIGNED", 3: "EN_ROUTE", 4: "ON_SCENE", 5: "RESOLVED" };
const CONFIDENCE_MAP = { 1: "LIVE", 2: "UNCONFIRMED", 3: "RESOLVED", 4: "CANCELLED" };
const REPORT_TYPE_MAP = { 1: "SOS", 2: "HAZARD", 3: "STATUS" };


function epochToIso(ts) {
  if (!ts) return null;
  if (typeof ts === "string") return ts;
  return new Date(ts).toISOString();
}


function mapIncident(inc) {
  return {
    ...inc,
    report_type: REPORT_TYPE_MAP[inc.report_type_code] || "SOS",
    status: STATUS_MAP[inc.status_code] || "OPEN",
    confidence: CONFIDENCE_MAP[inc.confidence_code] || "UNCONFIRMED",
    created_at: epochToIso(inc.created_at),
    updated_at: epochToIso(inc.updated_at),
    last_heartbeat_at: epochToIso(inc.last_heartbeat_at),
    is_cloud_synced: true,
  };
}

function mapEvent(evt) {
  return {
    ...evt,
    created_at: epochToIso(evt.created_at),
    is_cloud_synced: true,
  };
}


function mapSquad(sq) {
  return {
    ...sq,
    created_at: epochToIso(sq.created_at),
    updated_at: epochToIso(sq.updated_at),
  };
}

function mapDevice(dev) {
  return {
    ...dev,
    role_code: dev.role_code || 2,
    is_registered: true,
    app_version: dev.app_version || "1.0.0",
    registered_at: epochToIso(dev.registered_at),
    last_seen_at: epochToIso(dev.last_seen_at),
  };
}


function mapZone(zone) {
  return {
    ...zone,
    name: zone.area_name || zone.name,
    district: zone.area_name || zone.name,
    center_lat: zone.center_lat || null,
    center_lng: zone.center_lng || null,
    is_active: zone.is_active !== false,
    created_at: epochToIso(zone.created_at),
  };
}


function mapUser(u) {
  return {
    ...u,
    name: u.full_name || u.name,
    email: u.username || u.email,
    role: u.clearance_level || u.role,
    status: u.is_active ? "APPROVED" : "PENDING",
    requestedAt: epochToIso(u.created_at),
    approvedBy: u.is_active ? "system" : null,
  };
}

function mapSatellite(sat) {
  return {
    ...sat,
    type: sat.uplink_type || sat.type,
    last_sync_at: epochToIso(sat.last_sync_at),
    queue_depth: (sat.queue_depth_critical || 0) + (sat.queue_depth_high || 0) + (sat.queue_depth_normal || 0),
    queue_critical: sat.queue_depth_critical || 0,
    queue_high:     sat.queue_depth_high || 0,
    queue_normal:   sat.queue_depth_normal || 0,
  };
}


function mapBatch(b) {
  return {
    ...b,
    event_count: b.new_count || b.event_count || 0,
    status: b.rejected_count > 0 ? "PARTIAL" : "COMPLETED",
    sync_session_id: b.sync_session_id || null,
    received_at: epochToIso(b.received_at),
  };
}

let authToken = localStorage.getItem("meshsync_token") || null;


export function setAuthToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem("meshsync_token", token);
  } else {
    localStorage.removeItem("meshsync_token");
  }
}


export function getAuthToken() {
  return authToken;
}


function authHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
}


async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      const err = new Error(error.error || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    // 204 No Content / empty bodies are valid success responses (e.g. DELETE)
    if (res.status === 204) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (err) {
    if (err.message === "Failed to fetch" || err.message.includes("fetch")) {
      throw new Error(
        "Unable to reach backend services. Verify that the Edge Sync and Command Center APIs are running and that VITE_EDGE_SYNC_URL / VITE_CC_URL are configured correctly."
      );
    }
    throw err;
  }
}

export const edgeSyncApi = {
  async getIncidents(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status_code) params.set("status_code", filters.status_code);
    if (filters.confidence_code) params.set("confidence_code", filters.confidence_code);
    if (filters.zone_id) params.set("zone_id", filters.zone_id);
    const query = params.toString();
    const data = await apiFetch(`${EDGE_SYNC_URL}/incidents${query ? `?${query}` : ""}`);
    return { ...data, incidents: (data.incidents || []).map(mapIncident) };
  },

  async getIncident(id) {
    const data = await apiFetch(`${EDGE_SYNC_URL}/incidents/${id}`);
    return mapIncident(data);
  },

  async getIncidentEvents(id) {
    const data = await apiFetch(`${EDGE_SYNC_URL}/incidents/${id}/events`);
    return { ...data, events: (data.events || []).map(mapEvent) };
  },

  async getIncidentResponders(id) {
    return apiFetch(`${EDGE_SYNC_URL}/incidents/${id}/responders`);
  },

  async getIncidentHistory(id) {
    return apiFetch(`${EDGE_SYNC_URL}/incidents/${id}/history`);
  },


  async getEvents(filters = {}) {
    const params = new URLSearchParams();
    if (filters.event_type_code) params.set("event_type_code", filters.event_type_code);
    if (filters.incident_id) params.set("incident_id", filters.incident_id);
    const query = params.toString();
    const data = await apiFetch(`${EDGE_SYNC_URL}/events${query ? `?${query}` : ""}`);
    return { ...data, events: (data.events || []).map(mapEvent) };
  },

  async getAssignments() {
    return apiFetch(`${EDGE_SYNC_URL}/assignments`);
  },

  async getBatches() {
    const data = await apiFetch(`${EDGE_SYNC_URL}/batches`);
    return { ...data, batches: (data.batches || []).map(mapBatch) };
  },

  async getBatchItems(batchId) {
    return apiFetch(`${EDGE_SYNC_URL}/batches/${batchId}/items`);
  },

  async getSyncEvents(sinceHlc) {
    return apiFetch(`${EDGE_SYNC_URL}/sync${sinceHlc ? `?since_hlc=${sinceHlc}` : ""}`);
  },

  async emitAssign(payload) {
    return apiFetch(`${EDGE_SYNC_URL}/internal/assign`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};


export const ccApi = {
  async login(username, password) {
    const result = await apiFetch(`${CC_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setAuthToken(result.token);
    return result;
  },

  async signup(data) {
    return apiFetch(`${CC_URL}/auth/signup`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getMe() {
    return apiFetch(`${CC_URL}/auth/me`);
  },


  async getUsers() {
    const data = await apiFetch(`${CC_URL}/users`);
    return { ...data, users: (data.users || []).map(mapUser) };
  },

  async approveUser(id) {
    return apiFetch(`${CC_URL}/users/${id}/approve`, { method: "POST" });
  },

  async rejectUser(id) {
    return apiFetch(`${CC_URL}/users/${id}/reject`, { method: "POST" });
  },

  async getDevices() {
    const data = await apiFetch(`${CC_URL}/devices`);
    return { ...data, devices: (data.devices || []).map(mapDevice) };
  },

  async registerDevice(data) {
    return apiFetch(`${CC_URL}/devices`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async revokeDevice(id) {
    return apiFetch(`${CC_URL}/devices/${id}/revoke`, { method: "POST" });
  },


  async getZones() {
    const data = await apiFetch(`${CC_URL}/zones`);
    return { ...data, zones: (data.zones || []).map(mapZone) };
  },

  async createZone(data) {
    return apiFetch(`${CC_URL}/zones`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateZone(id, data) {
    return apiFetch(`${CC_URL}/zones/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteZone(id) {
    return apiFetch(`${CC_URL}/zones/${id}`, { method: "DELETE" });
  },


  async getClusters() {
    return apiFetch(`${CC_URL}/clusters`);
  },

  async recalculateClusters() {
    return apiFetch(`${CC_URL}/clusters/recalculate`, { method: "POST" });
  },

  async resolveCluster(id) {
    return apiFetch(`${CC_URL}/clusters/${id}/resolve`, { method: "POST" });
  },


  async getSquads() {
    const data = await apiFetch(`${CC_URL}/squads`);
    return { ...data, squads: (data.squads || []).map(mapSquad) };
  },

  async getSquad(id) {
    return apiFetch(`${CC_URL}/squads/${id}`);
  },

  async createSquad(data) {
    return apiFetch(`${CC_URL}/squads`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateSquad(id, data) {
    return apiFetch(`${CC_URL}/squads/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteSquad(id) {
    return apiFetch(`${CC_URL}/squads/${id}`, { method: "DELETE" });
  },


  async addSquadMember(squadId, data) {
    return apiFetch(`${CC_URL}/squads/${squadId}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async removeSquadMember(squadId, memberId) {
    return apiFetch(`${CC_URL}/squads/${squadId}/members/${memberId}`, { method: "DELETE" });
  },

  async dispatchResponder(data) {
    return apiFetch(`${CC_URL}/dispatch/responder`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async dispatchSquad(data) {
    return apiFetch(`${CC_URL}/dispatch/squad`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },


  async getSatelliteUplinks() {
    const data = await apiFetch(`${CC_URL}/satellite`);
    return { ...data, uplinks: (data.uplinks || []).map(mapSatellite) };
  },

  async updateSatelliteUplink(id, data) {
    return apiFetch(`${CC_URL}/satellite/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },


  async resolveIncident(id) {
    return apiFetch(`${CC_URL}/incidents/${id}/resolve`, { method: "POST" });
  },

  async cancelIncident(id) {
    return apiFetch(`${CC_URL}/incidents/${id}/cancel`, { method: "POST" });
  },
};

export async function fetchAllData() {
  const results = await Promise.allSettled([
    edgeSyncApi.getIncidents(),
    edgeSyncApi.getEvents(),
    edgeSyncApi.getBatches(),
    edgeSyncApi.getAssignments(),
    ccApi.getSquads(),
    ccApi.getDevices(),
    ccApi.getZones(),
    ccApi.getUsers(),
    ccApi.getSatelliteUplinks(),
    ccApi.getClusters(),
  ]);

  const [incidents, events, batches, assignments, squads, devices, zones, users, satUplinks, clusters] = results;

  const syncSessions = batches.status === "fulfilled" && batches.value?.batches
    ? batches.value.batches.map((b, i) => ({
        id: `SYN-${String(i + 1).padStart(4, "0")}`,
        mule_node_id: b.uploading_node_id,
        status: "COMPLETED",
        events_ingested: b.event_count,
        events_failed: b.rejected_count || 0,
        started_at: b.received_at,
        completed_at: b.received_at,
        duration_ms: 5000,
      }))
    : [];

  const activity = events.status === "fulfilled" && events.value?.events
    ? events.value.events.slice(0, 20).map((e, i) => ({
        id: `ACT-${String(i + 1).padStart(4, "0")}`,
        action:
          e.event_type_code === 1 ? "SOS_CREATED"
          : e.event_type_code === 5 ? "SOS_RESOLVED"
          : e.event_type_code === 2 ? "RESPONDER_EN_ROUTE"
          : "EVENT_INGESTED",
        actor_email: e.origin_node_id,
        target: e.incident_id,
        timestamp: e.created_at,
        origin_node_id: e.origin_node_id,
      }))
    : [];

  return {
    incidents:     incidents.status === "fulfilled" ? incidents.value?.incidents || [] : [],
    events:        events.status === "fulfilled" ? events.value?.events || [] : [],
    batches:       batches.status === "fulfilled" ? batches.value?.batches || [] : [],
    assignments:   assignments.status === "fulfilled" ? assignments.value?.assignments || [] : [],
    squads:        squads.status === "fulfilled" ? squads.value?.squads || [] : [],
    squadMembers:  [],
    devices:       devices.status === "fulfilled" ? devices.value?.devices || [] : [],
    zones:         zones.status === "fulfilled" ? zones.value?.zones || [] : [],
    users:         users.status === "fulfilled" ? users.value?.users || [] : [],
    satUplinks:    satUplinks.status === "fulfilled" ? satUplinks.value?.uplinks || [] : [],
    clusters:      clusters.status === "fulfilled" ? clusters.value?.clusters || [] : [],
    syncSessions,
    activity,
    history: [],
    errors: results.filter(r => r.status === "rejected").map(r => r.reason?.message),
  };
}


export default { edgeSyncApi, ccApi, setAuthToken, getAuthToken, fetchAllData };
