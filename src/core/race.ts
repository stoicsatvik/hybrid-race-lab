export type SegmentKind = "run" | "station" | "transition";

export type EvidenceClass = "measured" | "synthetic";

export interface RaceSegment {
  id: string;
  label: string;
  kind: SegmentKind;
  durationSeconds: number;
  evidence: EvidenceClass;
}

export interface RaceRecord {
  id: string;
  athleteLabel?: string;
  eventLabel?: string;
  segments: RaceSegment[];
}

export interface BaselineSegment {
  segmentId: string;
  durationSeconds: number;
}

export interface RaceBaseline {
  id: string;
  segments: BaselineSegment[];
}

export interface SegmentDelta {
  segmentId: string;
  label: string;
  kind: SegmentKind;
  raceSeconds: number;
  baselineSeconds: number;
  deltaSeconds: number;
  deltaFraction: number;
}

export interface Bottleneck extends SegmentDelta {
  recoverableSeconds: number;
}

export function assertFiniteNonNegative(value: number, field: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${field} must be a finite non-negative number`);
  }
}

export function validateRace(race: RaceRecord): void {
  const seen = new Set<string>();
  for (const segment of race.segments) {
    if (!segment.id.trim()) throw new Error("segment id must be non-empty");
    if (seen.has(segment.id)) throw new Error(`duplicate segment id: ${segment.id}`);
    seen.add(segment.id);
    assertFiniteNonNegative(segment.durationSeconds, `segment ${segment.id} durationSeconds`);
  }
}
