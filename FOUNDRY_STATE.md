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
Implementation head before this state update: `ee1afabad3d19b630a442f78680d7550c840ac99`.
Files: `src/core/race.ts`, `src/core/analysis.ts`, `src/core/analysis.test.ts`, `scripts/run-core-checks.mjs`, `src/core/ingest.ts`, `src/core/ingest.test.ts`, `src/core/report.ts`, `src/core/report.test.ts`, `package.json`.
Implemented: typed race/baseline schemas; finite/non-negative validation; total-time decomposition; baseline-normalized segment deltas; deterministic bottleneck ranking using an explicit recoverable-time assumption; target-time simulation; synthetic deterministic fixtures; dependency-free Node invariant runner; strict JSON/CSV/manual ingestion through one semantic validation boundary; deterministic race debrief export; recoverable-fraction sensitivity grid; stable-top-bottleneck flag; target-feasibility analysis that greedily allocates only explicitly recoverable savings in deterministic bottleneck order and reports feasible/infeasible without inventing savings.
Evidence boundary: fixtures are SYNTHETIC and contain no athlete claims. Measured vs synthetic provenance is mandatory at segment ingestion. Recoverable fraction is an explicit scenario parameter, not a causal training claim. Target feasibility is mathematical under the supplied baseline/recoverability assumptions, not a prediction that an athlete can physically realize those improvements.
Validation: dependency-free arithmetic fixture was independently reproduced in the Foundry execution environment (520 s total, deltas 20/60/5, recoverable 10/30/2.5, max opportunity 30 s, simulated finish 490 s). The dependency-free runner now encodes 10 invariant groups spanning race/baseline totals, +85 s deficit, segment deltas, stable bottleneck sensitivity at 25/50/75%, 42.5 s available savings at 50%, feasible 480 s allocation (station-1 30 s + run-1 10 s), infeasible 470 s floor at 477.5 s, and an already-met target that must not invent savings. TypeScript parser/report tests have not yet executed in repository CI, so runtime correctness remains NOT YET PROVEN. A direct container clone attempt was blocked by unavailable external DNS/network access; no result was fabricated from that failure.
Compute discipline: no PR or hosted workflow was triggered solely to manufacture a green badge.
Blocker: execute TypeScript core/parser/report tests in a real repo runner without spending unnecessary hosted compute.
Next step: run `npm run test:core` and TypeScript tests on an available runner; if green, add multi-target feasibility tables / baseline perturbation scenarios and only then wire presentation/UI.
Claim status: analytical definitions and independently reproduced fixture arithmetic SUPPORTED; expanded dependency-free falsification contract SUPPORTED but not executed at this exact commit; JSON/CSV/manual ingestion, debrief/sensitivity, and target-feasibility architecture SUPPORTED; TypeScript runtime correctness NOT YET PROVEN.

## Acceptance
Given one race and one comparison baseline, the tool must reproducibly explain where time was lost, how sensitive that conclusion is to baseline assumptions, and what combinations of segment improvements can reach a requested finish time.

## Initial evidence target
Use public or synthetic HYROX-style split examples only. Do not fabricate athlete performance data or claim causal training advice from race splits alone.

Status: ACTIVE / NOT YET PROVEN
