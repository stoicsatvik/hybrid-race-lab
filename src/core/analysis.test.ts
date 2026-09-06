import { rankBottlenecks, simulatedFinishSeconds, totalTimeSeconds } from "./analysis";
import { RaceBaseline, RaceRecord } from "./race";

const race: RaceRecord = {
  id: "synthetic-v0",
  segments: [
    { id: "run-1", label: "Run 1", kind: "run", durationSeconds: 300, evidence: "synthetic" },
    { id: "station-1", label: "Station 1", kind: "station", durationSeconds: 180, evidence: "synthetic" },
    { id: "transition-1", label: "Transition 1", kind: "transition", durationSeconds: 40, evidence: "synthetic" },
  ],
};

const baseline: RaceBaseline = {
  id: "synthetic-baseline-v0",
  segments: [
    { segmentId: "run-1", durationSeconds: 280 },
    { segmentId: "station-1", durationSeconds: 120 },
    { segmentId: "transition-1", durationSeconds: 35 },
  ],
};

function expectEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) throw new Error(`${label}: expected ${String(expected)}, got ${String(actual)}`);
}

export function runCoreDeterministicChecks(): void {
  expectEqual(totalTimeSeconds(race), 520, "total time");

  const bottlenecks = rankBottlenecks(race, baseline, 0.5);
  expectEqual(bottlenecks[0].segmentId, "station-1", "largest bottleneck");
  expectEqual(bottlenecks[0].deltaSeconds, 60, "largest delta");
  expectEqual(bottlenecks[0].recoverableSeconds, 30, "recoverable estimate");

  expectEqual(
    simulatedFinishSeconds(race, { "run-1": 10, "station-1": 20 }),
    490,
    "target-time simulation",
  );
}
