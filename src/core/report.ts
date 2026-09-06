import { RaceBaseline, RaceRecord } from "./race";
import { rankBottlenecks, segmentDeltas, totalTimeSeconds } from "./analysis";

export interface BaselineSensitivityPoint {
  recoverableFraction: number;
  topSegmentId: string | null;
  topRecoverableSeconds: number;
}

export interface TargetFeasibility {
  targetSeconds: number;
  requiredSavingsSeconds: number;
  availableSavingsSeconds: number;
  feasible: boolean;
  selectedSavings: Readonly<Record<string, number>>;
  projectedFinishSeconds: number;
}

export interface RaceDebrief {
  raceId: string;
  baselineId: string;
  totalSeconds: number;
  baselineTotalSeconds: number;
  totalDeltaSeconds: number;
  segments: ReturnType<typeof segmentDeltas>;
  sensitivity: BaselineSensitivityPoint[];
  stableTopBottleneck: boolean;
}

export function baselineTotalSeconds(baseline: RaceBaseline): number {
  return baseline.segments.reduce((sum, segment) => {
    if (!Number.isFinite(segment.durationSeconds) || segment.durationSeconds < 0) {
      throw new Error(`baseline ${segment.segmentId} durationSeconds must be finite and non-negative`);
    }
    return sum + segment.durationSeconds;
  }, 0);
}

export function baselineSensitivity(
  race: RaceRecord,
  baseline: RaceBaseline,
  recoverableFractions: readonly number[] = [0.25, 0.5, 0.75],
): BaselineSensitivityPoint[] {
  if (recoverableFractions.length === 0) throw new Error("recoverableFractions must not be empty");
  return recoverableFractions.map((fraction) => {
    const ranked = rankBottlenecks(race, baseline, fraction);
    const top = ranked[0];
    return {
      recoverableFraction: fraction,
      topSegmentId: top?.recoverableSeconds > 0 ? top.segmentId : null,
      topRecoverableSeconds: top?.recoverableSeconds ?? 0,
    };
  });
}

export function targetFeasibility(
  race: RaceRecord,
  baseline: RaceBaseline,
  targetSeconds: number,
  recoverableFraction = 0.5,
): TargetFeasibility {
  if (!Number.isFinite(targetSeconds) || targetSeconds < 0) throw new Error("targetSeconds must be finite and non-negative");
  const total = totalTimeSeconds(race);
  const required = Math.max(0, total - targetSeconds);
  const ranked = rankBottlenecks(race, baseline, recoverableFraction);
  const available = ranked.reduce((sum, item) => sum + item.recoverableSeconds, 0);
  let remaining = required;
  const selected: Record<string, number> = {};
  for (const item of ranked) {
    if (remaining <= 0) break;
    const saving = Math.min(item.recoverableSeconds, remaining);
    if (saving > 0) selected[item.segmentId] = saving;
    remaining -= saving;
  }
  const achieved = required - Math.max(0, remaining);
  return {
    targetSeconds,
    requiredSavingsSeconds: required,
    availableSavingsSeconds: available,
    feasible: available >= required,
    selectedSavings: selected,
    projectedFinishSeconds: total - achieved,
  };
}

export function buildRaceDebrief(
  race: RaceRecord,
  baseline: RaceBaseline,
  recoverableFractions: readonly number[] = [0.25, 0.5, 0.75],
): RaceDebrief {
  const totalSeconds = totalTimeSeconds(race);
  const baselineSeconds = baselineTotalSeconds(baseline);
  const sensitivity = baselineSensitivity(race, baseline, recoverableFractions);
  const nonNullTopIds = sensitivity.map((point) => point.topSegmentId).filter((id): id is string => id !== null);
  return {
    raceId: race.id,
    baselineId: baseline.id,
    totalSeconds,
    baselineTotalSeconds: baselineSeconds,
    totalDeltaSeconds: totalSeconds - baselineSeconds,
    segments: segmentDeltas(race, baseline),
    sensitivity,
    stableTopBottleneck: nonNullTopIds.length > 0 && new Set(nonNullTopIds).size === 1,
  };
}

export function exportRaceDebriefJson(debrief: RaceDebrief): string {
  return JSON.stringify(debrief, null, 2);
}
