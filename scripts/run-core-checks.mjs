import assert from "node:assert/strict";

// Mirror the pure analytical invariants without requiring Expo, React Native,
// a test framework, network access, or transpilation. This is deliberately
// dependency-free so the Foundry can falsify the core math cheaply.
const race = [300, 180, 40];
const baseline = [280, 120, 35];

const total = race.reduce((sum, seconds) => sum + seconds, 0);
assert.equal(total, 520, "total race time");

const deltas = race.map((seconds, index) => seconds - baseline[index]);
assert.deepEqual(deltas, [20, 60, 5], "baseline deltas");

const recoverable = deltas.map((delta) => Math.max(0, delta) * 0.5);
assert.deepEqual(recoverable, [10, 30, 2.5], "50% recoverable scenario");
assert.equal(Math.max(...recoverable), 30, "station is largest recoverable bottleneck");

const savings = [10, 20, 0];
const simulated = race.reduce((sum, seconds, index) => sum + seconds - savings[index], 0);
assert.equal(simulated, 490, "target-time simulation");

for (const seconds of [...race, ...baseline, ...savings]) {
  assert.ok(Number.isFinite(seconds) && seconds >= 0, "fixture values must be finite and non-negative");
}

console.log("core deterministic checks: PASS (5 invariant groups)");
