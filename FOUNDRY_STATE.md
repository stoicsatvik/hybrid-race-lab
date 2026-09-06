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
Objective: establish and cheaply verify the framework-agnostic analytical kernel, then add strict ingestion without UI coupling.
Branch: `foundry/core-race-analysis-v0`.
Implementation head before this state update: `ab5881c8cc3a10106ff0bb1df34140c9df983979`.
Files: `src/core/race.ts`, `src/core/analysis.ts`, `src/core/analysis.test.ts`, `scripts/run-core-checks.mjs`, `src/core/ingest.ts`, `src/core/ingest.test.ts`, `package.json`.
Implemented: typed race/baseline schemas; finite/non-negative validation; total-time decomposition; baseline-normalized segment deltas; deterministic bottleneck ranking using an explicit recoverable-time assumption; target-time simulation; synthetic deterministic fixtures; dependency-free Node invariant runner; strict JSON ingestion; strict CSV ingestion with exact header contract, quoted-comma handling, consistent race-level metadata, finite numeric duration parsing, and shared canonical race validation.
Evidence boundary: fixtures are SYNTHETIC and contain no athlete claims. Measured vs synthetic provenance is mandatory at segment ingestion. Recoverable fraction is an explicit scenario parameter, not a causal training claim.
Validation: the dependency-free five-invariant arithmetic fixture has been independently reproduced in the Foundry execution environment (520 s total, deltas 20/60/5, recoverable 10/30/2.5, max opportunity 30 s, simulated finish 490 s). This supports fixture arithmetic but does not prove the TypeScript runtime path. JSON and CSV ingestion tests are committed but not yet executed by repository CI. CSV tests cover quoted commas, exact-header rejection, inconsistent metadata, unterminated quotes, invalid numeric durations, invalid kinds and duplicate segment IDs. Parser runtime correctness remains NOT YET PROVEN.
Compute discipline: commit status for the previous branch head contained no CI statuses; no PR or hosted workflow was triggered solely to manufacture a green badge.
Blocker: execute TypeScript core/parser tests in a real repo runner without spending unnecessary hosted compute.
Next step: expose or use a cheap executable TypeScript test path; once parser tests pass, add manual-record ingestion/debrief export and baseline sensitivity reporting rather than expanding UI first.
Claim status: analytical definitions and fixture arithmetic SUPPORTED; JSON/CSV ingestion architecture SUPPORTED; TypeScript runtime correctness NOT YET PROVEN.

## Acceptance
Given one race and one comparison baseline, the tool must reproducibly explain where time was lost, how sensitive that conclusion is to baseline assumptions, and what combinations of segment improvements can reach a requested finish time.

## Initial evidence target
Use public or synthetic HYROX-style split examples only. Do not fabricate athlete performance data or claim causal training advice from race splits alone.

Status: ACTIVE / NOT YET PROVEN
