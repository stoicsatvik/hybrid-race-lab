import { parseRaceJson } from "./ingest";

describe("parseRaceJson", () => {
  const valid = JSON.stringify({
    id: "synthetic-001",
    eventLabel: "Synthetic hybrid fixture",
    segments: [
      { id: "run-1", label: "Run 1", kind: "run", durationSeconds: 300, evidence: "synthetic" },
      { id: "station-1", label: "Station 1", kind: "station", durationSeconds: 180, evidence: "synthetic" },
    ],
  });

  it("accepts a strict synthetic race record", () => {
    const race = parseRaceJson(valid);
    expect(race.id).toBe("synthetic-001");
    expect(race.segments).toHaveLength(2);
  });

  it("rejects malformed JSON", () => expect(() => parseRaceJson("{")).toThrow("malformed"));
  it("rejects unknown top-level fields", () => expect(() => parseRaceJson(valid.replace('"segments"', '"secret":1,"segments"'))).toThrow("unknown field"));
  it("rejects empty segment arrays", () => expect(() => parseRaceJson('{"id":"x","segments":[]}')).toThrow("non-empty array"));
  it("rejects invalid kinds", () => expect(() => parseRaceJson(valid.replace('"run"', '"swim"'))).toThrow("kind is invalid"));
  it("rejects invalid evidence labels", () => expect(() => parseRaceJson(valid.replace('"synthetic"', '"inferred"'))).toThrow("evidence is invalid"));
  it("rejects duplicate segment ids", () => expect(() => parseRaceJson(valid.replace('"station-1"', '"run-1"'))).toThrow("duplicate segment id"));
  it("rejects negative durations", () => expect(() => parseRaceJson(valid.replace("300", "-1"))).toThrow("finite non-negative"));
});
