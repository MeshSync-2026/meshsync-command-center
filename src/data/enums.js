// Enum definitions for event types, statuses, and roles
export const EVENT_TYPE = {
  1: { label: "SOS Created",       tone: "danger", priority: 0 },
  2: { label: "Responder En Route", tone: "brand",  priority: 1 },
  3: { label: "Status Update",     tone: "brand",  priority: 1 },
  4: { label: "SOS Alive",         tone: "ok",     priority: 2 },
  5: { label: "SOS Resolved",      tone: "ok",     priority: 0 },
  6: { label: "SOS Cancelled",     tone: "warn",   priority: 1 },
  7: { label: "Tombstone",         tone: "gray",   priority: 1 },
  8: { label: "Assign",            tone: "brand",  priority: 1 },
};


export const HAZARD_CATEGORY = {
  0: "None",
  1: "Flood",
  2: "Landslide",
  3: "Storm",
  4: "Fire",
  5: "Medical",
  6: "Structural",
};

export const RESOURCE_CATEGORY = {
  0: "None",
  1: "Water",
  2: "Boat",
  3: "Medical",
};


export const SEVERITY = {
  1: { label: "Low", tone: "ok" },
  2: { label: "Medium", tone: "warn" },
  3: { label: "High", tone: "danger" },
  4: { label: "Very High", tone: "danger" },
};


export const STATUS = {
  UNASSIGNED: { label: "Unassigned", tone: "danger" },
  OPEN:       { label: "Open",       tone: "danger" },
  ASSIGNED:   { label: "Assigned",   tone: "warn" },
  EN_ROUTE:   { label: "En Route",   tone: "brand" },
  ON_SCENE:   { label: "On Scene",   tone: "brand" },
  RESOLVED:   { label: "Resolved",   tone: "ok" },
  1:          { label: "Open",       tone: "danger" },
  2:          { label: "Assigned",   tone: "warn" },
  3:          { label: "En Route",   tone: "brand" },
  4:          { label: "On Scene",   tone: "brand" },
  5:          { label: "Resolved",   tone: "ok" },
};

export const REPORT_TYPE = {
  SOS: "SOS",
  HAZARD: "Hazard",
  STATUS: "Status",
  1: "SOS",
  2: "Hazard",
  3: "Status",
};


export const ROLE = {
  1: "Victim",
  2: "Civilian Responder",
  3: "Registered Responder",
};

export const CLEARANCE = {
  DISPATCHER: "Dispatcher",
  COMMANDER:  "Commander",
};


export const ACTION_TYPE = {
  1: "Created",
  2: "Self-Assigned",
  3: "Status Updated",
  4: "Cancelled",
  5: "Resolved",
  6: "Admin Override",
  7: "Dispatched",
};

export const CONFIDENCE = {
  LIVE:        { label: "Live",        tone: "ok" },
  UNCONFIRMED: { label: "Unconfirmed", tone: "warn" },
  RESOLVED:    { label: "Resolved",    tone: "gray" },
  CANCELLED:   { label: "Cancelled",   tone: "gray" },
  1:           { label: "Live",        tone: "ok" },
  2:           { label: "Unconfirmed", tone: "warn" },
  3:           { label: "Resolved",    tone: "gray" },
  4:           { label: "Cancelled",   tone: "gray" },
};


export const PRIORITY = {
  0: { label: "CRITICAL", tone: "danger" },
  1: { label: "HIGH",     tone: "warn" },
  2: { label: "NORMAL",   tone: "brand" },
};

export const SATELLITE_TYPE = {
  IRIDIUM: { label: "Iridium", bandwidth: "2.4 Kbps" },
  STARLINK: { label: "Starlink Mini", bandwidth: "~100 Mbps" },
  GARMIN: { label: "Garmin inReach", bandwidth: "Iridium SBD" },
  NONE: { label: "None", bandwidth: "—" },
};


export const SQUAD_ROLE = {
  LEADER:  "Leader",
  MEDIC:   "Medic",
  RESCUER: "Rescuer",
  DRIVER:  "Driver",
  COMMS:   "Comms Officer",
};

export const SYNC_STATUS = {
  PENDING: { label: "Pending", tone: "warn" },
  IN_PROGRESS: { label: "In Progress", tone: "brand" },
  COMPLETED: { label: "Completed", tone: "ok" },
  FAILED: { label: "Failed", tone: "danger" },
};


export const TONE_BADGE = {
  ok:     "bg-ok-500/15 text-ok-500",
  warn:   "bg-warn-500/15 text-warn-500",
  danger: "bg-danger-600/15 text-danger-600",
  brand:  "bg-brand-100 text-brand-600",
  gray:   "bg-gray-200 text-gray-600",
};
