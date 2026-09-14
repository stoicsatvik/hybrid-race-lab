import { buildRaceDebrief, exportRaceDebriefJson, targetFeasibility } from "./report";
import { RaceBaseline, RaceRecord } from "./race";

const race: RaceRecord = {
  id: "synthetic-race",
  segments: [
    { id: "run-1", label: "Run 1", kind: "run", durationSeconds: 300, evidence: "synthetic" },
    { id: "station-1", label: "Station 1", kind: "station", durationSeconds: 180, evidence: "synthetic" },
    { id: "transition-1", label: "Transition 1", kind: "transition", durationSeconds: 40, evidence: "synthetic" },
  ],
};

const baseline: RaceBaseline = {
  id: "synthetic-baseline",
  segments: [
    { segmentId: "run-1", durationSeconds: 280 },
    { segmentId: "station-1", durationSeconds: 120 },
    { segmentId: "transition-1", durationSeconds: 35 },
  ],
};

describe("race debrief", () => {
  it("exports deterministic totals and sensitivity without causal claims", () => {
    const report = buildRaceDebrief(race, baseline, [0.25, 0.5, 0.75]);
    expect(report.totalSeconds).toBe(520);
    expect(report.baselineTotalSeconds).toBe(435);
    expect(report.totalDeltaSeconds).toBe(85);
    expect(report.sensitivity.map((point) => point.topSegmentId)).toEqual(["station-1", "station-1", "station-1"]);
    expect(report.sensitivity.map((point) => point.topRecoverableSeconds)).toEqual([15, 30, 45]);
    expect(report.stableTopBottleneck).toBe(true);
    expect(JSON.parse(exportRaceDebriefJson(report))).toEqual(report);
  });

  it("constructs a deterministic feasible target from ranked recoverable savings", () => {
    const result = targetFeasibility(race, baseline, 480, 0.5);
    expect(result.requiredSavingsSeconds).toBe(40);
    expect(result.availableSavingsSeconds).toBe(42.5);
    expect(result.feasible).toBe(true);
    expect(result.selectedSavings).toEqual({ "station-1": 30, "run-1": 10 });
    expect(result.projectedFinishSeconds).toBe(480);
  });

  it("reports an infeasible target without pretending missing savings exist", () => {
    const result = targetFeasibility(race, baseline, 470, 0.5);
    expect(result.requiredSavingsSeconds).toBe(50);
    expect(result.availableSavingsSeconds).toBe(42.5);
    expect(result.feasible).toBe(false);
    expect(result.projectedFinishSeconds).toBe(477.5);
  });

  it("rejects invalid targets and an empty sensitivity grid", () => {
    expect(() => targetFeasibility(race, baseline, -1)).toThrow("targetSeconds must be finite and non-negative");
    expect(() => buildRaceDebrief(race, baseline, [])).toThrow("recoverableFractions must not be empty");
  });
});
