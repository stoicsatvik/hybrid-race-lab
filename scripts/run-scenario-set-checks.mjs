import assert from "node:assert/strict";

const race = [300, 180, 40];
const ids = ["run-1", "station-1", "transition-1"];
const scenarios = [
  { id: "reference", values: [280, 120, 35] },
  { id: "station-lenient", values: [260, 165, 35] },
  { id: "run-lenient", values: [295, 110, 35] },
];
const targets = [500, 490, 480, 470];
const total = race.reduce((sum, value) => sum + value, 0);

function ranked(values, fraction = 0.5) {
  return race
    .map((seconds, index) => ({ id: ids[index], recoverable: Math.max(0, seconds - values[index]) * fraction }))
    .sort((a, b) => b.recoverable - a.recoverable || a.id.localeCompare(b.id));
}

function feasible(values, target, fraction = 0.5) {
  const available = ranked(values, fraction).reduce((sum, item) => sum + item.recoverable, 0);
  return available >= Math.max(0, total - target);
}

function summarize(candidateScenarios) {
  assert.ok(candidateScenarios.length > 0, "scenario set must not be empty");
  const tops = candidateScenarios.map((scenario) => ranked(scenario.values)[0]?.id ?? null);
  const targetAgreement = targets.map((target) => {
    const values = candidateScenarios.map((scenario) => feasible(scenario.values, target));
    return new Set(values).size === 1;
  });
  return {
    ids: candidateScenarios.map((scenario) => scenario.id),
    exhaustive: false,
    topRankAgreement: new Set(tops).size === 1,
    targetAgreement,
  };
}

const full = summarize(scenarios);
assert.equal(full.exhaustive, false, "finite synthetic scenarios must not claim exhaustive coverage");
assert.equal(full.topRankAgreement, false, "full set exposes top-rank disagreement");
assert.deepEqual(full.targetAgreement, [true, true, false, true], "full set exposes 480 s feasibility disagreement");

const leaveOutStationLenient = summarize(scenarios.filter((scenario) => scenario.id !== "station-lenient"));
assert.equal(leaveOutStationLenient.topRankAgreement, true, "removing one adversarial baseline can manufacture top-rank agreement");
assert.deepEqual(leaveOutStationLenient.targetAgreement, [true, true, true, true], "removing the adversarial baseline can also manufacture target-feasibility agreement");

const leaveOutReference = summarize(scenarios.filter((scenario) => scenario.id !== "reference"));
assert.equal(leaveOutReference.topRankAgreement, false, "different removal preserves top-rank disagreement");
assert.deepEqual(leaveOutReference.targetAgreement, [true, true, false, true], "480 s disagreement remains visible");

const singleton = summarize([scenarios[0]]);
assert.equal(singleton.topRankAgreement, true, "single-scenario agreement is vacuous");
assert.deepEqual(singleton.targetAgreement, [true, true, true, true], "single-scenario feasibility agreement is vacuous");
assert.equal(singleton.exhaustive, false, "agreement never implies exhaustive scenario coverage");

console.log("scenario-set sensitivity checks: PASS (4 sealed scenario-set contracts)");
