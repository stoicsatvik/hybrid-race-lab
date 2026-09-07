import { RaceRecord, RaceSegment, SegmentKind, validateRace } from './race';

export interface ManualSegmentInput {
  id: string;
  kind: SegmentKind;
  label?: string;
  durationSeconds: number;
}

export interface ManualRaceInput {
  id: string;
  segments: readonly ManualSegmentInput[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseKind(value: unknown): SegmentKind {
  if (value === 'run' || value === 'station' || value === 'transition') return value;
  throw new Error('segment kind must be run, station, or transition');
}

function parseSegment(value: unknown, index: number): RaceSegment {
  if (!isRecord(value)) throw new Error(`segment ${index} must be an object`);
  if (typeof value.id !== 'string') throw new Error(`segment ${index} id must be a string`);
  if (typeof value.durationSeconds !== 'number') throw new Error(`segment ${index} durationSeconds must be a number`);
  if (value.label !== undefined && typeof value.label !== 'string') throw new Error(`segment ${index} label must be a string`);
  return {
    id: value.id,
    kind: parseKind(value.kind),
    label: value.label ?? value.id,
    durationSeconds: value.durationSeconds,
  };
}

export function ingestManualRace(input: ManualRaceInput): RaceRecord {
  const race: RaceRecord = {
    id: input.id,
    segments: input.segments.map((segment) => ({
      id: segment.id,
      kind: segment.kind,
      label: segment.label ?? segment.id,
      durationSeconds: segment.durationSeconds,
    })),
  };
  validateRace(race);
  return race;
}

export function ingestJsonRace(json: string): RaceRecord {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new Error('invalid race JSON');
  }
  if (!isRecord(value)) throw new Error('race JSON must be an object');
  if (typeof value.id !== 'string') throw new Error('race id must be a string');
  if (!Array.isArray(value.segments)) throw new Error('race segments must be an array');
  const race: RaceRecord = {
    id: value.id,
    segments: value.segments.map(parseSegment),
  };
  validateRace(race);
  return race;
}

function parseCsvRows(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];
    if (quoted) {
      if (char === '"') {
        if (csv[i + 1] === '"') { field += '"'; i += 1; }
        else quoted = false;
      } else field += char;
    } else if (char === '"') {
      if (field.length !== 0) throw new Error('invalid CSV quoting');
      quoted = true;
    } else if (char === ',') {
      row.push(field); field = '';
    } else if (char === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else if (char !== '\r') field += char;
  }
  if (quoted) throw new Error('unterminated CSV quote');
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}

export function ingestCsvRace(raceId: string, csv: string): RaceRecord {
  const rows = parseCsvRows(csv);
  if (rows.length < 2) throw new Error('CSV must contain header and at least one segment');
  const expected = ['id', 'kind', 'label', 'durationSeconds'];
  if (rows[0].length !== expected.length || rows[0].some((value, index) => value !== expected[index])) {
    throw new Error('CSV header must be id,kind,label,durationSeconds');
  }
  const segments = rows.slice(1).map((fields, index): RaceSegment => {
    if (fields.length !== 4) throw new Error(`CSV row ${index + 2} must contain 4 fields`);
    const [id, kindValue, label, durationValue] = fields;
    if (!id) throw new Error(`CSV row ${index + 2} id must not be empty`);
    const durationSeconds = Number(durationValue);
    if (durationValue.trim() === '' || !Number.isFinite(durationSeconds)) throw new Error(`CSV row ${index + 2} durationSeconds must be numeric`);
    return { id, kind: parseKind(kindValue), label: label || id, durationSeconds };
  });
  const race: RaceRecord = { id: raceId, segments };
  validateRace(race);
  return race;
}
