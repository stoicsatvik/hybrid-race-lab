import { EvidenceClass, RaceRecord, RaceSegment, SegmentKind, validateRace } from "./race";

const KINDS = new Set<SegmentKind>(["run", "station", "transition"]);
const EVIDENCE = new Set<EvidenceClass>(["measured", "synthetic"]);
const CSV_HEADER = ["raceId", "athleteLabel", "eventLabel", "segmentId", "segmentLabel", "kind", "durationSeconds", "evidence"] as const;

function object(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error(`${field} must be an object`);
  return value as Record<string, unknown>;
}

function nonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${field} must be a non-empty string`);
  return value;
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined || value === "") return undefined;
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

function parseCsvLine(line: string, lineNumber: number): string[] {
  const fields: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      fields.push(field);
      field = "";
    } else {
      field += char;
    }
  }
  if (quoted) throw new Error(`CSV line ${lineNumber} has an unterminated quoted field`);
  fields.push(field);
  return fields;
}

export function parseRaceCsv(input: string): RaceRecord {
  const lines = input.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((line) => line.trim().length > 0);
  if (lines.length < 2) throw new Error("race CSV must contain a header and at least one segment row");
  const header = parseCsvLine(lines[0], 1);
  if (header.length !== CSV_HEADER.length || header.some((value, index) => value !== CSV_HEADER[index])) {
    throw new Error(`race CSV header must be exactly: ${CSV_HEADER.join(",")}`);
  }

  let raceId: string | undefined;
  let athleteLabel: string | undefined;
  let eventLabel: string | undefined;
  const segments: RaceSegment[] = [];

  lines.slice(1).forEach((line, offset) => {
    const lineNumber = offset + 2;
    const fields = parseCsvLine(line, lineNumber);
    if (fields.length !== CSV_HEADER.length) throw new Error(`CSV line ${lineNumber} must contain exactly ${CSV_HEADER.length} fields`);
    const [rowRaceId, rowAthlete, rowEvent, segmentId, segmentLabel, kind, durationRaw, evidence] = fields;
    const parsedRaceId = nonEmptyString(rowRaceId, `CSV line ${lineNumber} raceId`);
    if (raceId === undefined) {
      raceId = parsedRaceId;
      athleteLabel = optionalString(rowAthlete, `CSV line ${lineNumber} athleteLabel`);
      eventLabel = optionalString(rowEvent, `CSV line ${lineNumber} eventLabel`);
    } else if (parsedRaceId !== raceId || optionalString(rowAthlete, `CSV line ${lineNumber} athleteLabel`) !== athleteLabel || optionalString(rowEvent, `CSV line ${lineNumber} eventLabel`) !== eventLabel) {
      throw new Error(`CSV line ${lineNumber} changes race-level metadata`);
    }
    const durationSeconds = Number(durationRaw);
    if (!durationRaw.trim() || !Number.isFinite(durationSeconds)) throw new Error(`CSV line ${lineNumber} durationSeconds must be a finite number`);
    segments.push(parseSegment({ id: segmentId, label: segmentLabel, kind, durationSeconds, evidence }, offset));
  });

  const race: RaceRecord = { id: raceId!, athleteLabel, eventLabel, segments };
  validateRace(race);
  return race;
}
