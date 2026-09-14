import assert from "node:assert/strict";

// Dependency-free mirror of the pure analytical contracts. Synthetic only.
const race = [300, 180, 40];
const baseline = [280, 120, 35];
const ids = ["run-1", "station-1", "transition-1"];

const total = race.reduce((sum, seconds) => sum + seconds, 0);
const baselineTotal = baseline.reduce((sum, seconds) => sum + seconds, 0);
assert.equal(total, 520, "total race time");
assert.equal(baselineTotal, 435, "baseline total time");
assert.equal(total - baselineTotal, 85, "total baseline deficit");

function deltasFor(candidateBaseline) {
  assert.equal(candidateBaseline.length, race.length, "baseline shape must match race");
  candidateBaseline.forEach((seconds) => assert.ok(Number.isFinite(seconds) && seconds >= 0, "baseline values must be finite and non-negative"));
  return race.map((seconds, index) => seconds - candidateBaseline[index]);
}

function rankedRecoverable(fraction, candidateBaseline = baseline) {
  assert.ok(Number.isFinite(fraction) && fraction >= 0 && fraction <= 1, "recoverable fraction must be within [0, 1]");
  return deltasFor(candidateBaseline)
    .map((delta, index) => ({ id: ids[index], recoverable: Math.max(0, delta) * fraction }))
    .sort((a, b) => b.recoverable - a.recoverable || a.id.localeCompare(b.id));
}

assert.deepEqual(deltasFor(baseline), [20, 60, 5], "baseline deltas");
const sensitivity = [0.25, 0.5, 0.75].map((fraction) => rankedRecoverable(fraction)[0]);
assert.deepEqual(sensitivity.map((item) => item.id), ["station-1", "station-1", "station-1"], "stable top bottleneck");
assert.deepEqual(sensitivity.map((item) => item.recoverable), [15, 30, 45], "sensitivity magnitudes");

const recoverable50 = rankedRecoverable(0.5);
assert.equal(recoverable50.reduce((sum, item) => sum + item.recoverable, 0), 42.5, "50% available savings");

function targetFeasibility(targetSeconds, fraction = 0.5, candidateBaseline = baseline) {
  assert.ok(Number.isFinite(targetSeconds) && targetSeconds >= 0, "target must be finite and non-negative");
  const required = Math.max(0, total - targetSeconds);
  const ranked = rankedRecoverable(fraction, candidateBaseline);
  const available = ranked.reduce((sum, item) => sum + item.recoverable, 0);
  let remaining = required;
  const selected = {};
  for (const item of ranked) {
    if (remaining <= 0) break;
    const saving = Math.min(item.recoverable, remaining);
    if (saving > 0) selected[item.id] = saving;
    remaining -= saving;
  }
  const achieved = required - Math.max(0, remaining);
  return { required, available, feasible: available >= required, selected, projected: total - achieved };
}

const feasible480 = targetFeasibility(480);
assert.deepEqual(feasible480, { required: 40, available: 42.5, feasible: true, selected: { "station-1": 30, "run-1": 10 }, projected: 480 }, "480 s target feasibility");
const infeasible470 = targetFeasibility(470);
assert.equal(infeasible470.required, 50, "470 target required savings");
assert.equal(infeasible470.available, 42.5, "470 target available savings");
assert.equal(infeasible470.feasible, false, "470 target must be infeasible");
assert.equal(infeasible470.projected, 477.5, "best projected finish for infeasible target");
const alreadyMet = targetFeasibility(540);
assert.deepEqual(alreadyMet.selected, {}, "already-met target requires no invented savings");
assert.equal(alreadyMet.projected, 520, "already-met target preserves measured total");

// Baseline perturbation falsification: rankings that survive scalar recoverability
// can still flip when the comparison baseline changes. Preserve that instability.
const baselineScenarios = [
  { id: "reference", values: [280, 120, 35] },
  { id: "station-lenient", values: [260, 165, 35] },
  { id: "run-lenient", values: [295, 110, 35] },
];
const topByBaseline = baselineScenarios.map(({ id, values }) => ({ id, top: rankedRecoverable(0.5, values)[0].id }));
assert.deepEqual(topByBaseline, [
  { id: "reference", top: "station-1" },
  { id: "station-lenient", top: "run-1" },
  { id: "run-lenient", top: "station-1" },
], "baseline perturbations expose ranking instability");
assert.equal(new Set(topByBaseline.map((point) => point.top)).size, 2, "top bottleneck is not baseline-robust");

// Multi-target frontier must be monotone: harder targets cannot become easier.
const targetGrid = [500, 490, 480, 470].map((target) => ({ target, ...targetFeasibility(target) }));
assert.deepEqual(targetGrid.map((point) => point.feasible), [true, true, true, false], "multi-target feasibility frontier");
for (let index = 1; index < targetGrid.length; index += 1) {
  assert.ok(targetGrid[index].required >= targetGrid[index - 1].required, "required savings must be monotone as target tightens");
  assert.ok(targetGrid[index].projected <= targetGrid[index - 1].projected, "best projected finish must not worsen as target tightens");
}

for (const seconds of [...race, ...baseline]) assert.ok(Number.isFinite(seconds) && seconds >= 0, "fixture values must be finite and non-negative");

console.log("core deterministic checks: PASS (12 invariant groups)");
