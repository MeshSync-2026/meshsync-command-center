// Mock data for development and demo purposes
import { SQUAD_ROLE } from "./enums";

export const DISTRICTS = [
  { name: "Colombo", lat: 6.9271, lng: 79.8612 },
  { name: "Gampaha", lat: 7.084, lng: 79.998 },
  { name: "Kalutara", lat: 6.5854, lng: 79.9613 },
  { name: "Galle", lat: 6.0535, lng: 80.221 },
  { name: "Matara", lat: 5.9485, lng: 80.5353 },
  { name: "Hambantota", lat: 6.0734, lng: 81.2139 },
  { name: "Ratnapura", lat: 6.7055, lng: 80.3847 },
  { name: "Kegalle", lat: 7.2529, lng: 80.3476 },
  { name: "Kandy", lat: 7.2906, lng: 80.6337 },
  { name: "Nuwara Eliya", lat: 6.9497, lng: 80.7891 },
  { name: "Badulla", lat: 6.9934, lng: 81.055 },
  { name: "Monaragala", lat: 6.8769, lng: 81.3498 },
  { name: "Kurunegala", lat: 7.4818, lng: 80.3609 },
  { name: "Puttalam", lat: 8.0411, lng: 79.8414 },
  { name: "Anuradhapura", lat: 8.3114, lng: 80.4037 },
  { name: "Polonnaruwa", lat: 7.9403, lng: 81.0188 },
  { name: "Jaffna", lat: 9.6615, lng: 80.0255 },
  { name: "Kilinochchi", lat: 9.3814, lng: 80.4103 },
  { name: "Mullaitivu", lat: 9.2674, lng: 80.8159 },
  { name: "Vavuniya", lat: 8.7536, lng: 80.4982 },
  { name: "Mannar", lat: 8.9812, lng: 79.9059 },
  { name: "Trincomalee", lat: 8.5874, lng: 81.2152 },
  { name: "Batticaloa", lat: 7.7132, lng: 81.6989 },
  { name: "Ampara", lat: 7.2936, lng: 81.669 },
];


function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20251125);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const jitter = (base, spread) => base + (rand() - 0.5) * spread;
const id = (prefix, n) => `${prefix}-${String(n).padStart(4, "0")}`;


export const authorities = [
  {
    id: "u-001", name: "Capt. Anjali Perera", email: "anjali@meshsync.lk",
    clearance_level: "COMMANDER", status: "APPROVED",
    requestedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    approvedBy: "system",
  },
  {
    id: "u-002", name: "Disp. Suresh Kanagaraj", email: "suresh@meshsync.lk",
    clearance_level: "DISPATCHER", status: "APPROVED",
    requestedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    approvedBy: "system",
  },
  {
    id: "u-003", name: "Disp. Tharindu Silva", email: "tharindu@meshsync.lk",
    clearance_level: "DISPATCHER", status: "APPROVED",
    requestedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    approvedBy: "system",
  },
  {
    id: "u-004", name: "Officer Nimal Fernando", email: "nimal@meshsync.lk",
    clearance_level: "DISPATCHER", status: "PENDING",
    requestedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    approvedBy: null,
  },
  {
    id: "u-005", name: "Cmdr. Kavita Rajapaksa", email: "kavita@meshsync.lk",
    clearance_level: "COMMANDER", status: "PENDING",
    requestedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    approvedBy: null,
  },
];

export const responseZones = DISTRICTS.slice(0, 12).map((d, i) => ({
  id: id("ZONE", i + 1),
  name: `${d.name} Zone`,
  district: d.name,
  center_lat: d.lat,
  center_lng: d.lng,
  is_active: true,
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
}));


export const registeredDevices = Array.from({ length: 24 }, (_, i) => ({
  id: id("DEV", i + 1),
  node_id: `N-${String(i + 1).padStart(5, "0")}`,
  authority_user_id: i < 3 ? authorities[i].id : null,
  role_code: i < 3 ? 3 : 2,
  is_active: rand() > 0.15,
  is_registered: true,
  last_seen_at: new Date(Date.now() - Math.floor(rand() * 72 * 3600000)).toISOString(),
  app_version: "1.0.0",
  registered_at: new Date(Date.now() - Math.floor(rand() * 30 * 86400000)).toISOString(),
}));

export const responderSquads = [
  { id: id("SQD", 1), squad_name: "Alpha Team", leader_authority_user_id: "u-001", zone_id: "ZONE-01", is_active: true, created_at: new Date(Date.now() - 25 * 86400000).toISOString() },
  { id: id("SQD", 2), squad_name: "Navy Unit 3", leader_authority_user_id: "u-002", zone_id: "ZONE-03", is_active: true, created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: id("SQD", 3), squad_name: "Medical Response Beta", leader_authority_user_id: "u-003", zone_id: "ZONE-05", is_active: true, created_at: new Date(Date.now() - 18 * 86400000).toISOString() },
  { id: id("SQD", 4), squad_name: "Search & Rescue Delta", leader_authority_user_id: "u-001", zone_id: null, is_active: true, created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: id("SQD", 5), squad_name: "Comms Relay Echo", leader_authority_user_id: "u-002", zone_id: "ZONE-07", is_active: false, created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
];


export const squadMembers = [
  { id: id("SM", 1), squad_id: id("SQD", 1), authority_user_id: "u-001", role_in_squad: SQUAD_ROLE.LEADER, is_active: true, joined_at: new Date(Date.now() - 25 * 86400000).toISOString() },
  { id: id("SM", 2), squad_id: id("SQD", 1), authority_user_id: "u-002", role_in_squad: SQUAD_ROLE.RESCUER, is_active: true, joined_at: new Date(Date.now() - 25 * 86400000).toISOString() },
  { id: id("SM", 3), squad_id: id("SQD", 1), authority_user_id: "u-003", role_in_squad: SQUAD_ROLE.MEDIC, is_active: true, joined_at: new Date(Date.now() - 24 * 86400000).toISOString() },
  { id: id("SM", 4), squad_id: id("SQD", 2), authority_user_id: "u-002", role_in_squad: SQUAD_ROLE.LEADER, is_active: true, joined_at: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: id("SM", 5), squad_id: id("SQD", 2), authority_user_id: "u-003", role_in_squad: SQUAD_ROLE.DRIVER, is_active: true, joined_at: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: id("SM", 6), squad_id: id("SQD", 3), authority_user_id: "u-003", role_in_squad: SQUAD_ROLE.LEADER, is_active: true, joined_at: new Date(Date.now() - 18 * 86400000).toISOString() },
  { id: id("SM", 7), squad_id: id("SQD", 4), authority_user_id: "u-001", role_in_squad: SQUAD_ROLE.LEADER, is_active: true, joined_at: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: id("SM", 8), squad_id: id("SQD", 4), authority_user_id: "u-002", role_in_squad: SQUAD_ROLE.COMMS, is_active: false, joined_at: new Date(Date.now() - 10 * 86400000).toISOString() },
];

const STATUS_KEYS = ["UNASSIGNED", "OPEN", "ASSIGNED", "EN_ROUTE", "ON_SCENE", "RESOLVED"];
const CONFIDENCE_KEYS = ["LIVE", "UNCONFIRMED", "RESOLVED", "CANCELLED"];


export const incidents = Array.from({ length: 48 }, (_, i) => {
  const district = DISTRICTS[Math.floor(rand() * DISTRICTS.length)];
  const status = pick(STATUS_KEYS);
  const confidence = status === "RESOLVED" ? "RESOLVED" : status === "UNASSIGNED" ? "LIVE" : pick(CONFIDENCE_KEYS);
  return {
    id: id("INC", i + 1),
    creator_node_id: `N-${String(Math.floor(rand() * 100) + 1).padStart(5, "0")}`,
    zone_id: pick(responseZones).id,
    cluster_id: rand() > 0.5 ? id("CLT", Math.floor(rand() * 8) + 1) : null,
    report_type: pick(["SOS", "HAZARD", "STATUS"]),
    category_code: Math.floor(rand() * 6) + 1,
    severity_level: Math.floor(rand() * 3) + 1,
    status,
    confidence_code: confidence,
    latitude: jitter(district.lat, 0.3),
    longitude: jitter(district.lng, 0.3),
    landmark_name: rand() > 0.6 ? pick(["Temple Road", "Main Street", "Hospital Junction", "School Lane", "Railway Station"]) : null,
    people_count: Math.floor(rand() * 20) + 1,
    status_water: Math.floor(rand() * 3),
    status_injury: Math.floor(rand() * 3),
    status_safety: Math.floor(rand() * 3),
    assigned_squad_id: status !== "UNASSIGNED" && status !== "OPEN" ? pick(responderSquads).id : null,
    created_at: new Date(Date.now() - Math.floor(rand() * 72 * 3600000)).toISOString(),
    updated_at: new Date(Date.now() - Math.floor(rand() * 12 * 3600000)).toISOString(),
    is_cloud_synced: rand() > 0.1,
  };
});


export const clusters = Array.from({ length: 8 }, (_, i) => {
  const district = DISTRICTS[Math.floor(rand() * DISTRICTS.length)];
  return {
    id: id("CLT", i + 1),
    name: `Cluster ${String.fromCharCode(65 + i)}`,
    centroid_lat: jitter(district.lat, 0.15),
    centroid_lng: jitter(district.lng, 0.15),
    radius_meters: Math.floor(rand() * 5000) + 500,
    member_count: Math.floor(rand() * 8) + 2,
    max_severity: Math.floor(rand() * 3) + 1,
    status: pick(["ACTIVE", "RESOLVED"]),
    created_at: new Date(Date.now() - Math.floor(rand() * 48 * 3600000)).toISOString(),
  };
});

const EVENT_TYPES = [1, 2, 3, 4, 5, 6, 7, 8];
export const meshEvents = Array.from({ length: 120 }, (_, i) => {
  const eventType = pick(EVENT_TYPES);
  const incident = pick(incidents);

  return {
    id: id("EVT", i + 1),
    incident_id: incident.id,
    origin_node_id: rand() > 0.2 ? `N-${String(Math.floor(rand() * 100) + 1).padStart(5, "0")}` : "CLOUD-0000",
    event_type_code: eventType,
    hlc_timestamp: `0001${String(Math.floor(rand() * 9999999999)).padStart(10, "0")}|${String(Math.floor(rand() * 99999)).padStart(5, "0")}|${String(Math.floor(rand() * 0xffffffff)).toString(16).padStart(8, "0")}`,
    is_cloud_synced: rand() > 0.15,
    created_at: new Date(Date.now() - Math.floor(rand() * 72 * 3600000)).toISOString(),
  };
});

export const incidentHistory = Array.from({ length: 80 }, (_, i) => {
  const incident = pick(incidents);
  return {
    id: id("HIS", i + 1),
    incident_id: incident.id,
    action_type_code: Math.floor(rand() * 7) + 1,
    actor_node_id: `N-${String(Math.floor(rand() * 100) + 1).padStart(5, "0")}`,
    hlc_timestamp: `0001${String(Math.floor(rand() * 9999999999)).padStart(10, "0")}|${String(Math.floor(rand() * 99999)).padStart(5, "0")}|${String(Math.floor(rand() * 0xffffffff)).toString(16).padStart(8, "0")}`,
    created_at: new Date(Date.now() - Math.floor(rand() * 72 * 3600000)).toISOString(),
  };
});


export const syncSessions = Array.from({ length: 20 }, (_, i) => ({
  id: id("SYN", i + 1),
  mule_node_id: `N-${String(Math.floor(rand() * 50) + 1).padStart(5, "0")}`,
  status: pick(["PENDING", "IN_PROGRESS", "COMPLETED", "COMPLETED", "COMPLETED", "FAILED"]),
  events_ingested: Math.floor(rand() * 500) + 10,
  events_failed: Math.floor(rand() * 5),
  started_at: new Date(Date.now() - Math.floor(rand() * 48 * 3600000)).toISOString(),
  completed_at: rand() > 0.3 ? new Date(Date.now() - Math.floor(rand() * 48 * 3600000)).toISOString() : null,
  duration_ms: Math.floor(rand() * 300000) + 5000,
}));


export const satelliteUplinks = [
  { id: id("SAT", 1), squad_id: id("SQD", 1), type: "IRIDIUM", is_connected: true, last_sync_at: new Date(Date.now() - 300000).toISOString(), queue_depth: 12, queue_critical: 2, queue_high: 5, queue_normal: 5 },
  { id: id("SAT", 2), squad_id: id("SQD", 2), type: "GARMIN", is_connected: true, last_sync_at: new Date(Date.now() - 600000).toISOString(), queue_depth: 8, queue_critical: 0, queue_high: 3, queue_normal: 5 },
  { id: id("SAT", 3), squad_id: id("SQD", 3), type: "IRIDIUM", is_connected: false, last_sync_at: new Date(Date.now() - 7200000).toISOString(), queue_depth: 45, queue_critical: 5, queue_high: 15, queue_normal: 25 },
  { id: id("SAT", 4), squad_id: id("SQD", 4), type: "STARLINK", is_connected: true, last_sync_at: new Date(Date.now() - 60000).toISOString(), queue_depth: 0, queue_critical: 0, queue_high: 0, queue_normal: 0 },
  { id: id("SAT", 5), squad_id: id("SQD", 5), type: "NONE", is_connected: false, last_sync_at: null, queue_depth: 0, queue_critical: 0, queue_high: 0, queue_normal: 0 },
];

export const ingestionBatches = Array.from({ length: 15 }, (_, i) => ({
  id: id("BAT", i + 1),
  sync_session_id: id("SYN", Math.floor(rand() * 20) + 1),
  event_count: Math.floor(rand() * 200) + 5,
  duplicate_count: Math.floor(rand() * 10),
  status: pick(["COMPLETED", "COMPLETED", "COMPLETED", "PARTIAL", "FAILED"]),
  received_at: new Date(Date.now() - Math.floor(rand() * 48 * 3600000)).toISOString(),
}));


export const activityLog = Array.from({ length: 50 }, (_, i) => ({
  id: id("ACT", i + 1),
  actor_email: pick(authorities).email,
  action: pick(["LOGIN", "LOGOUT", "ASSIGN_SQUAD", "CREATE_ZONE", "RESOLVE_CLUSTER", "APPROVE_USER", "REVOKE_DEVICE", "DISPATCH", "VIEW_INCIDENT"]),
  target: pick(incidents).id,
  timestamp: new Date(Date.now() - Math.floor(rand() * 72 * 3600000)).toISOString(),
  ip_address: `10.0.${Math.floor(rand() * 255)}.${Math.floor(rand() * 255)}`,
}));


export function computeKPIs() {
  const total = incidents.length;
  const active = incidents.filter((i) => i.status !== "RESOLVED").length;
  const resolved = incidents.filter((i) => i.status === "RESOLVED").length;
  const unassigned = incidents.filter((i) => i.status === "UNASSIGNED" || i.status === "OPEN").length;

  const live = incidents.filter((i) => i.confidence_code === "LIVE").length;
  const unconfirmed = incidents.filter((i) => i.confidence_code === "UNCONFIRMED").length;
  const critical = incidents.filter((i) => i.severity_level === 3 && i.status !== "RESOLVED").length;

  const activeSquads = responderSquads.filter((s) => s.is_active).length;
  const onlineDevices = registeredDevices.filter((d) => d.is_active).length;
  const satConnected = satelliteUplinks.filter((s) => s.is_connected).length;
  const pendingSync = meshEvents.filter((e) => !e.is_cloud_synced).length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return {
    totalIncidents: total, activeIncidents: active, resolvedIncidents: resolved,
    unassignedIncidents: unassigned, liveIncidents: live, unconfirmedIncidents: unconfirmed,
    criticalIncidents: critical, activeSquads, onlineDevices, satConnected,
    pendingSync, resolutionRate, totalClusters: clusters.length, totalSquads: responderSquads.length,
  };
}
