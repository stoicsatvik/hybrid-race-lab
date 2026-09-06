import { parseRaceCsv, parseRaceJson } from "./ingest";

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

describe("parseRaceCsv", () => {
  const header = "raceId,athleteLabel,eventLabel,segmentId,segmentLabel,kind,durationSeconds,evidence";
  const valid = [
    header,
    'synthetic-001,,"Synthetic, hybrid fixture",run-1,"Run, 1",run,300,synthetic',
    'synthetic-001,,"Synthetic, hybrid fixture",station-1,Station 1,station,180,synthetic',
  ].join("\n");

  it("accepts strict CSV including quoted commas", () => {
    const race = parseRaceCsv(valid);
    expect(race.id).toBe("synthetic-001");
    expect(race.eventLabel).toBe("Synthetic, hybrid fixture");
    expect(race.segments[0].label).toBe("Run, 1");
    expect(race.segments).toHaveLength(2);
  });

  it("rejects a reordered or extended header", () => expect(() => parseRaceCsv(valid.replace(header, `${header},extra`))).toThrow("header must be exactly"));
  it("rejects inconsistent race metadata across rows", () => expect(() => parseRaceCsv(valid.replace("station-1,Station 1", "synthetic-002,,Synthetic hybrid fixture,station-1,Station 1"))).toThrow());
  it("rejects unterminated quotes", () => expect(() => parseRaceCsv(`${header}\nsynthetic-001,,,run-1,\"Run 1,run,300,synthetic`)).toThrow("unterminated"));
  it("rejects invalid numeric durations", () => expect(() => parseRaceCsv(valid.replace("run,300,synthetic", "run,fast,synthetic"))).toThrow("finite number"));
  it("shares enum validation with JSON ingestion", () => expect(() => parseRaceCsv(valid.replace("run,300,synthetic", "swim,300,synthetic"))).toThrow("kind is invalid"));
  it("shares duplicate-id validation with JSON ingestion", () => expect(() => parseRaceCsv(valid.replace("station-1,Station 1", "run-1,Station 1"))).toThrow("duplicate segment id"));
});
