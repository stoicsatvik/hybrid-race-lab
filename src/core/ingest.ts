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
