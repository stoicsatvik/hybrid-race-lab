import { RaceRecord } from './race';
import { decomposeRace } from './analysis';

export interface ImprovementOption {
  segmentId: string;
  seconds: number;
}

export interface TargetPlan {
  segmentIds: readonly string[];
  improvementsSeconds: Readonly<Record<string, number>>;
  savedSeconds: number;
  projectedSeconds: number;
  excessSavingsSeconds: number;
}

/**
 * Enumerate minimal-cardinality combinations of declared segment improvements
 * that reach a requested finish time. Improvement values are scenario inputs,
 * not causal training prescriptions.
 */
export function enumerateTargetPlans(
  race: RaceRecord,
  targetSeconds: number,
  options: readonly ImprovementOption[],
  maxPlans = 10,
): TargetPlan[] {
  const { totalSeconds } = decomposeRace(race);
  if (!Number.isFinite(targetSeconds) || targetSeconds < 0 || targetSeconds > totalSeconds) {
    throw new Error('targetSeconds must be finite and within [0, race total]');
  }
  if (!Number.isInteger(maxPlans) || maxPlans <= 0) throw new Error('maxPlans must be a positive integer');

  const durationById = new Map(race.segments.map((segment) => [segment.id, segment.durationSeconds]));
  const seen = new Set<string>();
  const normalized = options.map((option) => {
    if (!durationById.has(option.segmentId)) throw new Error(`unknown segment: ${option.segmentId}`);
    if (seen.has(option.segmentId)) throw new Error(`duplicate improvement option: ${option.segmentId}`);
    seen.add(option.segmentId);
    const actual = durationById.get(option.segmentId)!;
    if (!Number.isFinite(option.seconds) || option.seconds < 0 || option.seconds > actual) {
      throw new Error(`invalid improvement for ${option.segmentId}`);
    }
    return option;
  }).filter((option) => option.seconds > 0);

  const requiredSavings = totalSeconds - targetSeconds;
  if (requiredSavings === 0) {
    return [{ segmentIds: [], improvementsSeconds: {}, savedSeconds: 0, projectedSeconds: totalSeconds, excessSavingsSeconds: 0 }];
  }

  const feasible: TargetPlan[] = [];
  const n = normalized.length;
  if (n > 24) throw new Error('at most 24 improvement options are supported');
  for (let mask = 1; mask < 2 ** n; mask += 1) {
    const selected = normalized.filter((_, index) => (mask & (1 << index)) !== 0);
    const savedSeconds = selected.reduce((sum, option) => sum + option.seconds, 0);
    if (savedSeconds < requiredSavings) continue;
    const improvementsSeconds = Object.fromEntries(selected.map((option) => [option.segmentId, option.seconds]));
    feasible.push({
      segmentIds: selected.map((option) => option.segmentId).sort(),
      improvementsSeconds,
      savedSeconds,
      projectedSeconds: totalSeconds - savedSeconds,
      excessSavingsSeconds: savedSeconds - requiredSavings,
    });
  }

  if (feasible.length === 0) return [];
  const minCardinality = Math.min(...feasible.map((plan) => plan.segmentIds.length));
  return feasible
    .filter((plan) => plan.segmentIds.length === minCardinality)
    .sort((a, b) => a.excessSavingsSeconds - b.excessSavingsSeconds || a.segmentIds.join('\u0000').localeCompare(b.segmentIds.join('\u0000')))
    .slice(0, maxPlans);
}
