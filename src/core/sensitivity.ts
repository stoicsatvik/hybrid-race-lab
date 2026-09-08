import { BaselineSegment, RaceRecord, validateRace } from './race';
import { rankBottlenecks, simulateTarget } from './analysis';

export interface SensitivityScenario {
  id: string;
  baseline: readonly BaselineSegment[];
  improvementsSeconds?: Readonly<Record<string, number>>;
}

export interface SensitivityScenarioResult {
  scenarioId: string;
  bottleneckOrder: readonly string[];
  topBottleneckId: string | null;
  projectedSeconds: number;
}

export interface SensitivityReport {
  scenarios: readonly SensitivityScenarioResult[];
  topBottleneckStable: boolean;
  orderingStable: boolean;
  targetSeconds?: number;
  targetFeasibleInAllScenarios?: boolean;
  targetFeasibleInAnyScenario?: boolean;
}

export function analyzeSensitivity(
  race: RaceRecord,
  scenarios: readonly SensitivityScenario[],
  targetSeconds?: number,
): SensitivityReport {
  validateRace(race);
  if (scenarios.length === 0) throw new Error('at least one sensitivity scenario is required');
  if (targetSeconds !== undefined && (!Number.isFinite(targetSeconds) || targetSeconds < 0)) {
    throw new Error('targetSeconds must be finite and non-negative');
  }

  const scenarioIds = new Set<string>();
  const results = scenarios.map((scenario) => {
    if (!scenario.id.trim()) throw new Error('scenario id is required');
    if (scenarioIds.has(scenario.id)) throw new Error(`duplicate scenario id: ${scenario.id}`);
    scenarioIds.add(scenario.id);

    const ranking = rankBottlenecks(race, scenario.baseline);
    const simulation = simulateTarget(race, scenario.improvementsSeconds ?? {});
    return {
      scenarioId: scenario.id,
      bottleneckOrder: ranking.map((item) => item.segmentId),
      topBottleneckId: ranking[0]?.segmentId ?? null,
      projectedSeconds: simulation.projectedSeconds,
    };
  });

  const firstOrder = results[0].bottleneckOrder.join('\u0000');
  const firstTop = results[0].topBottleneckId;
  const report: SensitivityReport = {
    scenarios: results,
    topBottleneckStable: results.every((result) => result.topBottleneckId === firstTop),
    orderingStable: results.every((result) => result.bottleneckOrder.join('\u0000') === firstOrder),
  };

  if (targetSeconds !== undefined) {
    const feasibility = results.map((result) => result.projectedSeconds <= targetSeconds);
    report.targetSeconds = targetSeconds;
    report.targetFeasibleInAllScenarios = feasibility.every(Boolean);
    report.targetFeasibleInAnyScenario = feasibility.some(Boolean);
  }

  return report;
}
