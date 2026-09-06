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
Objective: establish and cheaply verify the framework-agnostic analytical kernel, complete strict ingestion, expose assumption-sensitive debrief output, and make target feasibility explicit without UI coupling.
Branch: `foundry/core-race-analysis-v0`.
Implementation head before this state update: `bfbd379cbf7312115dfa7a6f104a54a02d689a51`.
Files: `src/core/race.ts`, `src/core/analysis.ts`, `src/core/analysis.test.ts`, `scripts/run-core-checks.mjs`, `src/core/ingest.ts`, `src/core/ingest.test.ts`, `src/core/report.ts`, `src/core/report.test.ts`, `package.json`.
Implemented: typed race/baseline schemas; finite/non-negative validation; total-time decomposition; baseline-normalized segment deltas; deterministic bottleneck ranking using an explicit recoverable-time assumption; target-time simulation; synthetic deterministic fixtures; dependency-free Node invariant runner; strict JSON/CSV/manual ingestion through one semantic validation boundary; deterministic race debrief export; recoverable-fraction sensitivity grid; stable-top-bottleneck flag; target-feasibility analysis that greedily allocates only explicitly recoverable savings in deterministic bottleneck order and reports feasible/infeasible without inventing savings.
Evidence boundary: fixtures are SYNTHETIC and contain no athlete claims. Measured vs synthetic provenance is mandatory at segment ingestion. Recoverable fraction is an explicit scenario parameter, not a causal training claim. Target feasibility is mathematical under the supplied baseline/recoverability assumptions, not a prediction that an athlete can physically realize those improvements.
Validation: dependency-free arithmetic fixture was independently reproduced in the Foundry execution environment (520 s total, deltas 20/60/5, recoverable 10/30/2.5, max opportunity 30 s, simulated finish 490 s). New committed target tests specify: at 50% recoverability total available savings = 42.5 s; a 480 s target requires 40 s and selects station-1 30 s + run-1 10 s; a 470 s target requires 50 s, is infeasible, and bottoms out at 477.5 s. TypeScript parser/report tests have not yet executed in repository CI, so runtime correctness remains NOT YET PROVEN.
Compute discipline: no PR or hosted workflow was triggered solely to manufacture a green badge.
Blocker: execute TypeScript core/parser/report tests in a real repo runner without spending unnecessary hosted compute.
Next step: expose or use a cheap executable TypeScript test path; once it passes, add multi-target feasibility tables / baseline perturbation scenarios and only then wire presentation/UI.
Claim status: analytical definitions and independently reproduced fixture arithmetic SUPPORTED; JSON/CSV/manual ingestion, debrief/sensitivity, and target-feasibility architecture SUPPORTED; TypeScript runtime correctness NOT YET PROVEN.

## Acceptance
Given one race and one comparison baseline, the tool must reproducibly explain where time was lost, how sensitive that conclusion is to baseline assumptions, and what combinations of segment improvements can reach a requested finish time.

## Initial evidence target
Use public or synthetic HYROX-style split examples only. Do not fabricate athlete performance data or claim causal training advice from race splits alone.

Status: ACTIVE / NOT YET PROVEN
