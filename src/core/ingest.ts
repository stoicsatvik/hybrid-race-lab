import { EvidenceClass, RaceRecord, RaceSegment, SegmentKind, validateRace } from "./race";

const KINDS = new Set<SegmentKind>(["run", "station", "transition"]);
const EVIDENCE = new Set<EvidenceClass>(["measured", "synthetic"]);

function object(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${field} must be an object`);
  return value as Record<string, unknown>;
}

function nonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} must be a non-empty string`);
  return value;
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  return nonEmptyString(value, field);
}

function exactKeys(value: Record<string, unknown>, allowed: readonly string[], field: string): void {
  const allowedSet = new Set(allowed);
  const extras = Object.keys(value).filter((key) => !allowedSet.has(key));
  if (extras.length) throw new Error(`${field} contains unknown field(s): ${extras.sort().join(", ")}`);
}

function parseSegment(value: unknown, index: number): RaceSegment {
  const raw = object(value, `segments[${index}]`);
  exactKeys(raw, ["id", "label", "kind", "durationSeconds", "evidence"], `segments[${index}]`);
  const id = nonEmptyString(raw.id, `segments[${index}].id`);
  const label = nonEmptyString(raw.label, `segments[${index}].label`);
  if (typeof raw.kind !== "string" || !KINDS.has(raw.kind as SegmentKind)) throw new Error(`segments[${index}].kind is invalid`);
  if (typeof raw.evidence !== "string" || !EVIDENCE.has(raw.evidence as EvidenceClass)) throw new Error(`segments[${index}].evidence is invalid`);
  if (typeof raw.durationSeconds !== "number") throw new Error(`segments[${index}].durationSeconds must be a number`);
  return { id, label, kind: raw.kind as SegmentKind, durationSeconds: raw.durationSeconds, evidence: raw.evidence as EvidenceClass };
}

export function parseRaceJson(input: string): RaceRecord {
  let decoded: unknown;
  try {
    decoded = JSON.parse(input);
  } catch {
    throw new Error("race JSON is malformed");
  }
  const raw = object(decoded, "race");
  exactKeys(raw, ["id", "athleteLabel", "eventLabel", "segments"], "race");
  if (!Array.isArray(raw.segments) || raw.segments.length === 0) throw new Error("race.segments must be a non-empty array");
  const race: RaceRecord = {
    id: nonEmptyString(raw.id, "race.id"),
    athleteLabel: optionalString(raw.athleteLabel, "race.athleteLabel"),
    eventLabel: optionalString(raw.eventLabel, "race.eventLabel"),
    segments: raw.segments.map(parseSegment),
  };
  validateRace(race);
  return race;
}
