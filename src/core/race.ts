export type SegmentKind = 'run' | 'station' | 'transition';

export interface RaceSegment {
  id: string;
  kind: SegmentKind;
  label: string;
  durationSeconds: number;
}

export interface RaceRecord {
  id: string;
  segments: readonly RaceSegment[];
}

export interface BaselineSegment {
  segmentId: string;
  durationSeconds: number;
  /** Maximum fraction of the observed deficit considered plausibly recoverable. */
  recoverableFraction?: number;
}

export function validateRace(race: RaceRecord): void {
  if (!race.id.trim()) throw new Error('race id is required');
  if (race.segments.length === 0) throw new Error('race must contain segments');
  const ids = new Set<string>();
  for (const segment of race.segments) {
    if (!segment.id.trim()) throw new Error('segment id is required');
    if (ids.has(segment.id)) throw new Error(`duplicate segment id: ${segment.id}`);
    ids.add(segment.id);
    if (!Number.isFinite(segment.durationSeconds) || segment.durationSeconds < 0) {
      throw new Error(`invalid duration for ${segment.id}`);
    }
  }
}
