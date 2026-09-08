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

## Current champion
- Branch: `foundry/v0-core-analysis`; draft PR #1; never merge without explicit approval.
- V0 analysis core and deterministic contracts: **SUPPORTED** on committed synthetic cases.
- Manual + JSON canonical ingestion at `7afc9d2d885af4719505bf96ffdfc1088a10e8a4`: **SUPPORTED** by workflow run `34163553635`.
- CSV canonical ingestion: **SUPPORTED** by successful exact-head CI before the debrief increment; contracts require manual/JSON/CSV equivalence and malformed-input rejection.
- Deterministic exportable debrief at `a0849181dd1b7e55cf498f3bad27a725bbb8d757`: **SUPPORTED** by workflow run `34173731537`; dependency install, Expo Doctor, repository TypeScript, and `test:core` all completed successfully.
- Debrief keeps measured decomposition, supplied-baseline comparison, and explicit target scenarios separate; it does not infer causal training, fitness, or medical explanations.

## Preserved failures
- Run `34148115658`: REJECTED reproducibility configuration because package.json/package-lock.json were out of sync; tests never executed.
- Run `34151948824`: dependency install, Expo Doctor and repository TypeScript passed, but the isolated harness was REJECTED because TypeScript 6 rejects deprecated `moduleResolution=node10`; contracts never executed.

## Validation / claim boundary
- V0 deterministic analysis core: **SUPPORTED** on committed synthetic contracts.
- Manual + JSON + CSV canonical ingestion: **SUPPORTED** on committed deterministic contracts.
- Exportable debrief: **SUPPORTED** on committed deterministic contracts at run `34173731537`.
- Real-athlete generality: **NOT YET PROVEN**.
- Causal explanations of why a segment was slow: **NOT YET PROVEN** and intentionally absent.
- No athlete/private data is committed; public boundary remains clean.

## Acceptance
Given one race and one comparison baseline, the tool must reproducibly explain where time was lost, how sensitive that conclusion is to baseline assumptions, and what combinations of segment improvements can reach a requested finish time.

## Initial evidence target
Use public or synthetic HYROX-style split examples only. Do not fabricate athlete performance data or claim causal training advice from race splits alone.

## Highest-EV next move
Freeze the current V0 pure-function core as champion. Add a deterministic sensitivity layer that sweeps explicit baseline/recoverability assumptions and reports whether bottleneck ordering and target feasibility are stable across the declared range. Require matched synthetic cases and preserve rank reversals as evidence rather than hiding them. Do not add UI before this gate.

Status: ACTIVE / V0 CORE SUPPORTED / SENSITIVITY NOT YET PROVEN
