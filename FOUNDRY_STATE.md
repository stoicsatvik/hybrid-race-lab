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
Objective: establish and cheaply verify the framework-agnostic analytical kernel, complete strict ingestion, and expose assumption-sensitive debrief output without UI coupling.
Branch: `foundry/core-race-analysis-v0`.
Implementation head before this state update: `ebfec416bc5e2d741e08e4ff89e94b4a0285090c`.
Files: `src/core/race.ts`, `src/core/analysis.ts`, `src/core/analysis.test.ts`, `scripts/run-core-checks.mjs`, `src/core/ingest.ts`, `src/core/ingest.test.ts`, `src/core/report.ts`, `src/core/report.test.ts`, `package.json`.
Implemented: typed race/baseline schemas; finite/non-negative validation; total-time decomposition; baseline-normalized segment deltas; deterministic bottleneck ranking using an explicit recoverable-time assumption; target-time simulation; synthetic deterministic fixtures; dependency-free Node invariant runner; strict JSON/CSV/manual ingestion through one semantic validation boundary; deterministic race debrief export; recoverable-fraction sensitivity grid; stable-top-bottleneck flag.
Evidence boundary: fixtures are SYNTHETIC and contain no athlete claims. Measured vs synthetic provenance is mandatory at segment ingestion. Recoverable fraction is an explicit scenario parameter, not a causal training claim. Sensitivity output only reports whether ranking is stable across user-selected recoverability assumptions.
Validation: the dependency-free five-invariant arithmetic fixture has been independently reproduced in the Foundry execution environment (520 s total, deltas 20/60/5, recoverable 10/30/2.5, max opportunity 30 s, simulated finish 490 s). Debrief tests are committed for total 520 s, baseline 435 s, delta +85 s, station-1 top bottleneck at recoverable fractions 0.25/0.5/0.75 with opportunities 15/30/45 s, deterministic JSON round-trip, and empty-grid rejection. TypeScript parser/report tests have not yet executed in repository CI, so runtime correctness remains NOT YET PROVEN.
Compute discipline: no PR or hosted workflow was triggered solely to manufacture a green badge.
Blocker: execute TypeScript core/parser/report tests in a real repo runner without spending unnecessary hosted compute.
Next step: expose or use a cheap executable TypeScript test path; once it passes, add target-time feasibility/debrief scenario combinations and only then wire presentation/UI.
Claim status: analytical definitions and fixture arithmetic SUPPORTED; JSON/CSV/manual ingestion and debrief/sensitivity architecture SUPPORTED; TypeScript runtime correctness NOT YET PROVEN.

## Acceptance
Given one race and one comparison baseline, the tool must reproducibly explain where time was lost, how sensitive that conclusion is to baseline assumptions, and what combinations of segment improvements can reach a requested finish time.

## Initial evidence target
Use public or synthetic HYROX-style split examples only. Do not fabricate athlete performance data or claim causal training advice from race splits alone.

Status: ACTIVE / NOT YET PROVEN
