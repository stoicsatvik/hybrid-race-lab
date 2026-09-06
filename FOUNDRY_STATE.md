# Foundry State

## Objective
Build an open-source race-performance analysis system for hybrid/endurance athletes that converts raw splits into bottleneck ranking, pacing insight, target-time simulation, and reproducible race debriefs.

## Public boundary
Public: generic schemas, parsers, analysis math, visualizations, examples, tests and athlete-owned local data workflows.
Private: proprietary athlete datasets, private coaching heuristics, private commercial recommendation engines, credentials, and any future paid intelligence layer.

## V0 milestone
- Typed race model: run / station / transition segments
- CSV/JSON/manual split ingestion
- Total-time decomposition
- Baseline-normalized segment deltas
- Bottleneck ranking by plausible time-saving opportunity
- Target-time simulator
- Exportable race debrief
- Deterministic fixtures and tests

## 2026-09-06 foundry cycle
Objective: establish and cheaply verify the first framework-agnostic analytical kernel before adding UI work.
Branch: `foundry/core-race-analysis-v0`.
Implementation head before this state update: `19137920d7faf6576805f76c9be592420a7d068e`.
Files: `src/core/race.ts`, `src/core/analysis.ts`, `src/core/analysis.test.ts`, `scripts/run-core-checks.mjs`, `package.json`.
Implemented: typed race/baseline schemas; finite/non-negative validation; total-time decomposition; baseline-normalized segment deltas; deterministic bottleneck ranking using an explicit recoverable-time assumption; target-time simulation; synthetic deterministic fixtures; dependency-free Node invariant runner exposed as `npm run test:core`.
Evidence boundary: fixtures are SYNTHETIC and contain no athlete claims. The recoverable fraction is an explicit scenario parameter, not a causal training claim.
Validation: the runner checks five deterministic invariant groups and requires only Node. It is committed but has not yet executed on a runner in this cycle, so runtime correctness remains NOT YET PROVEN and no green result is claimed.
Compute discipline: no PR was opened solely to trigger hosted CI.
Blocker: execute the core check command in a real runner.
Next step: after a successful core execution, add strict CSV/JSON ingestion and malformed-input fixtures.
Claim status: analytical definitions and low-cost verification harness SUPPORTED; runtime correctness NOT YET PROVEN.

## Acceptance
Given one race and one comparison baseline, the tool must reproducibly explain where time was lost, how sensitive that conclusion is to baseline assumptions, and what combinations of segment improvements can reach a requested finish time.

## Initial evidence target
Use public or synthetic HYROX-style split examples only. Do not fabricate athlete performance data or claim causal training advice from race splits alone.

Status: ACTIVE / NOT YET PROVEN
