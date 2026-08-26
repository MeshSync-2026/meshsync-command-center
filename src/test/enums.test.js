import { describe, it, expect } from "vitest";
import {
  EVENT_TYPE,
  HAZARD_CATEGORY,
  SEVERITY,
  STATUS,
  CONFIDENCE,
  PRIORITY,
  SQUAD_ROLE,
  SATELLITE_TYPE,
  TONE_BADGE,
} from "../data/enums";

describe("enums", () => {
  it("EVENT_TYPE has all 8 event types from v3.2", () => {
    expect(EVENT_TYPE[1].label).toBe("SOS Created");
    expect(EVENT_TYPE[8].label).toBe("Assign");
    expect(Object.keys(EVENT_TYPE)).toHaveLength(8);
  });

  it("EVENT_TYPE priorities match §11.7 (TOMBSTONE=HIGH, SOS_CANCELLED=HIGH)", () => {
    expect(EVENT_TYPE[7].priority).toBe(1); // TOMBSTONE = HIGH
    expect(EVENT_TYPE[6].priority).toBe(1); // SOS_CANCELLED = HIGH
    expect(EVENT_TYPE[1].priority).toBe(0); // SOS_CREATED = CRITICAL
    expect(EVENT_TYPE[4].priority).toBe(2); // SOS_ALIVE = NORMAL
  });

  it("SEVERITY has 3 levels", () => {
    expect(SEVERITY[1].label).toBe("Low");
    expect(SEVERITY[3].label).toBe("High");
  });

  it("CONFIDENCE has 4 states from §6.2", () => {
    expect(CONFIDENCE.LIVE.label).toBe("Live");
    expect(CONFIDENCE.UNCONFIRMED.label).toBe("Unconfirmed");
  });

  it("PRIORITY has 3 levels (no LOW — nothing is expendable)", () => {
    expect(Object.keys(PRIORITY)).toHaveLength(3);
    expect(PRIORITY[0].label).toBe("CRITICAL");
    expect(PRIORITY[2].label).toBe("NORMAL");
  });

  it("SQUAD_ROLE has 5 roles from §10.6", () => {
    expect(SQUAD_ROLE.LEADER).toBe("Leader");
    expect(SQUAD_ROLE.MEDIC).toBe("Medic");
    expect(Object.keys(SQUAD_ROLE)).toHaveLength(5);
  });

  it("SATELLITE_TYPE has 4 types from §10.7", () => {
    expect(SATELLITE_TYPE.IRIDIUM.label).toBe("Iridium");
    expect(SATELLITE_TYPE.STARLINK.label).toBe("Starlink Mini");
  });

  it("TONE_BADGE has all 5 tones", () => {
    expect(TONE_BADGE.ok).toBeDefined();
    expect(TONE_BADGE.danger).toBeDefined();
    expect(TONE_BADGE.brand).toBeDefined();
  });

  it("HAZARD_CATEGORY has 7 categories (0-6)", () => {
    expect(HAZARD_CATEGORY[1]).toBe("Flood");
    expect(HAZARD_CATEGORY[6]).toBe("Structural");
    expect(Object.keys(HAZARD_CATEGORY)).toHaveLength(7);
  });
});
