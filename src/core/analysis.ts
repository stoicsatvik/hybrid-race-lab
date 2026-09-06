import { RaceBaseline, RaceRecord, SegmentDelta, Bottleneck, validateRace, assertFiniteNonNegative } from "./race";

export function totalTimeSeconds(race: RaceRecord): number {
  validateRace(race);
  return race.segments.reduce((sum, s) => sum + s.durationSeconds, 0);
}

export function segmentDeltas(race: RaceRecord, baseline: RaceBaseline): SegmentDelta[] {
  validateRace(race);
  const byId = new Map(baseline.segments.map((s) => [s.segmentId, s.durationSeconds]));
  return race.segments.map((s) => {
    const b = byId.get(s.id);
    if (b === undefined) throw new Error(`baseline missing segment: ${s.id}`);
    assertFiniteNonNegative(b, `baseline ${s.id} durationSeconds`);
    const d = s.durationSeconds - b;
    return {
      segmentId: s.id,
      label: s.label,
      kind: s.kind,
      raceSeconds: s.durationSeconds,
      baselineSeconds: b,
      deltaSeconds: d,
      deltaFraction: b === 0 ? (d === 0 ? 0 : Number.POSITIVE_INFINITY) : d / b,
    };
  });
}

export function rankBottlenecks(race: RaceRecord, baseline: RaceBaseline, recoverableFraction = 0.5): Bottleneck[] {
  if (!Number.isFinite(recoverableFraction) || recoverableFraction < 0 || recoverableFraction > 1) {
    throw new Error("recoverableFraction must be between 0 and 1");
  }
  return segmentDeltas(race, baseline)
    .map((d) => ({ ...d, recoverableSeconds: Math.max(0, d.deltaSeconds) * recoverableFraction }))
    .sort((a, b) => b.recoverableSeconds - a.recoverableSeconds || a.segmentId.localeCompare(b.segmentId));
}

export function simulatedFinishSeconds(race: RaceRecord, timeSavings: Readonly<Record<string, number>>): number {
  validateRace(race);
  return race.segments.reduce((total, s) => {
    const saved = timeSavings[s.id] ?? 0;
    assertFiniteNonNegative(saved, `time saving ${s.id}`);
    if (saved > s.durationSeconds) throw new Error(`time saving exceeds segment duration: ${s.id}`);
    return total + s.durationSeconds - saved;
  }, 0);
}
