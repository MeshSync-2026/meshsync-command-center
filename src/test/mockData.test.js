import { describe, it, expect } from "vitest";
import {
  incidents,
  clusters,
  responderSquads,
  squadMembers,
  registeredDevices,
  meshEvents,
  syncSessions,
  satelliteUplinks,
  responseZones,
  DISTRICTS,
  computeKPIs,
} from "../data/mockData";

describe("mockData", () => {
  it("DISTRICTS has 24 Sri Lankan districts", () => {
    expect(DISTRICTS.length).toBe(24);
    expect(DISTRICTS[0].name).toBe("Colombo");
  });

  it("incidents have required v3.2 fields", () => {
    const inc = incidents[0];
    expect(inc.id).toBeDefined();
    expect(inc.confidence_code).toBeDefined();
    expect(inc.assigned_squad_id).toBeDefined();
    expect(inc.is_cloud_synced).toBeDefined();
    expect(inc.latitude).toBeDefined();
    expect(inc.longitude).toBeDefined();
  });

  it("responderSquads do NOT have cluster_id (§10.6 fix)", () => {
    responderSquads.forEach((s) => {
      expect(s.cluster_id).toBeUndefined();
    });
  });

  it("squadMembers key on authority_user_id, NOT registered_device_id (§10.6 fix)", () => {
    squadMembers.forEach((m) => {
      expect(m.authority_user_id).toBeDefined();
      expect(m.registered_device_id).toBeUndefined();
    });
  });

  it("meshEvents do NOT have a stored priority field (§11.7 fix)", () => {
    meshEvents.forEach((e) => {
      expect(e.priority).toBeUndefined();
      expect(e.event_type_code).toBeDefined();
    });
  });

  it("satelliteUplinks have queue breakdown by priority", () => {
    const sat = satelliteUplinks[0];
    expect(sat.queue_critical).toBeDefined();
    expect(sat.queue_high).toBeDefined();
    expect(sat.queue_normal).toBeDefined();
    expect(sat.queue_depth).toBe(sat.queue_critical + sat.queue_high + sat.queue_normal);
  });

  it("responseZones have required fields", () => {
    const zone = responseZones[0];
    expect(zone.id).toBeDefined();
    expect(zone.name).toBeDefined();
    expect(zone.center_lat).toBeDefined();
    expect(zone.center_lng).toBeDefined();
  });

  it("computeKPIs returns all expected metrics", () => {
    const kpis = computeKPIs();
    expect(kpis.totalIncidents).toBeGreaterThan(0);
    expect(kpis.resolutionRate).toBeGreaterThanOrEqual(0);
    expect(kpis.resolutionRate).toBeLessThanOrEqual(100);
    expect(kpis.activeSquads).toBeDefined();
    expect(kpis.satConnected).toBeDefined();
    expect(kpis.pendingSync).toBeDefined();
  });
});
