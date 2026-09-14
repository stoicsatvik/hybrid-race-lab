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

export interface BaselineScenarioResult {
  baselineId: string;
  topSegmentId: string | null;
  targetFeasibility: TargetFeasibility[];
}

export interface BaselineScenarioRobustness {
  recoverableFraction: number;
  targetSeconds: number[];
  scenarioCoverage: {
    scenarioCount: number;
    baselineIds: string[];
    exhaustive: false;
  };
  scenarios: BaselineScenarioResult[];
  distinctTopSegmentIds: Array<string | null>;
  topRankAgreement: boolean;
  targetFeasibilityAgreement: Array<{
    targetSeconds: number;
    agreement: boolean;
    feasibleScenarioCount: number;
    scenarioCount: number;
  }>;
  allTargetFeasibilityAgree: boolean;
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

export function baselineScenarioRobustness(
  race: RaceRecord,
  baselines: readonly RaceBaseline[],
  targetSeconds: readonly number[],
  recoverableFraction = 0.5,
): BaselineScenarioRobustness {
  if (baselines.length === 0) throw new Error("baselines must not be empty");
  if (targetSeconds.length === 0) throw new Error("targetSeconds must not be empty");
  if (!Number.isFinite(recoverableFraction) || recoverableFraction < 0 || recoverableFraction > 1) {
    throw new Error("recoverableFraction must be within [0, 1]");
  }

  const baselineIds = baselines.map((baseline) => baseline.id);
  if (new Set(baselineIds).size !== baselineIds.length) throw new Error("baseline ids must be unique");

  const scenarios = baselines.map((baseline): BaselineScenarioResult => {
    const ranked = rankBottlenecks(race, baseline, recoverableFraction);
    const top = ranked[0];
    return {
      baselineId: baseline.id,
      topSegmentId: top?.recoverableSeconds > 0 ? top.segmentId : null,
      targetFeasibility: targetSeconds.map((target) => targetFeasibility(race, baseline, target, recoverableFraction)),
    };
  });

  const distinctTopSegmentIds = Array.from(new Set(scenarios.map((scenario) => scenario.topSegmentId)));
  const targetFeasibilityAgreement = targetSeconds.map((target, index) => {
    const feasibility = scenarios.map((scenario) => scenario.targetFeasibility[index].feasible);
    const feasibleScenarioCount = feasibility.filter(Boolean).length;
    return {
      targetSeconds: target,
      agreement: new Set(feasibility).size === 1,
      feasibleScenarioCount,
      scenarioCount: scenarios.length,
    };
  });

  return {
    recoverableFraction,
    targetSeconds: [...targetSeconds],
    scenarioCoverage: { scenarioCount: baselines.length, baselineIds: [...baselineIds], exhaustive: false },
    scenarios,
    distinctTopSegmentIds,
    topRankAgreement: distinctTopSegmentIds.length === 1,
    targetFeasibilityAgreement,
    allTargetFeasibilityAgree: targetFeasibilityAgreement.every((point) => point.agreement),
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
