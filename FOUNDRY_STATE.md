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
Objective: establish the first framework-agnostic analytical kernel before adding UI work.
Branch: `foundry/core-race-analysis-v0`.
Files: `src/core/race.ts`, `src/core/analysis.ts`, `src/core/analysis.test.ts`.
Implemented: typed race/baseline schemas; finite/non-negative validation; total-time decomposition; baseline-normalized segment deltas; deterministic bottleneck ranking using an explicit recoverable-time assumption; target-time simulation; synthetic deterministic fixtures.
Evidence boundary: fixtures are SYNTHETIC and contain no athlete claims. The recoverable fraction is an explicit scenario parameter, not a causal training claim.
Validation: source and deterministic checks are committed, but checks are NOT YET EXECUTED in CI because opening a PR would trigger hosted CI for all PR paths. No green result is claimed.
Blocker: install/run the deterministic checks locally or via a deliberately approved CI run, then add ingestion parsers.
Next step: make deterministic checks executable through a low-cost test script, validate them, then add CSV/JSON ingestion with strict schema errors.
Claim status: core architecture SUPPORTED by explicit deterministic definitions; runtime correctness NOT YET PROVEN.

## Acceptance
Given one race and one comparison baseline, the tool must reproducibly explain where time was lost, how sensitive that conclusion is to baseline assumptions, and what combinations of segment improvements can reach a requested finish time.

## Initial evidence target
Use public or synthetic HYROX-style split examples only. Do not fabricate athlete performance data or claim causal training advice from race splits alone.

Status: ACTIVE / NOT YET PROVEN
