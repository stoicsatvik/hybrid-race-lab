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
- Deterministic exportable debrief at `a0849181dd1b7e55cf498f3bad27a725bbb8d757`: **SUPPORTED** by workflow run `34173731537`.
- Sensitivity layer at `5e25d9f6b1f1d85cf14307e92a76728ab06b80df`: **SUPPORTED** by workflow run `34180267144`; dependency install, Expo Doctor, repository TypeScript, and `test:core` all passed. Contracts preserve deliberate top-bottleneck and full-order rank reversals across declared assumption scenarios.

## Preserved failures
- Run `34148115658`: REJECTED reproducibility configuration because package.json/package-lock.json were out of sync; tests never executed.
- Run `34151948824`: dependency install, Expo Doctor and repository TypeScript passed, but the isolated harness was REJECTED because TypeScript 6 rejects deprecated `moduleResolution=node10`; contracts never executed.

## Validation / claim boundary
- V0 deterministic analysis, canonical ingestion, exportable debrief, and declared-scenario sensitivity: **SUPPORTED** on committed deterministic synthetic contracts.
- Real-athlete generality: **NOT YET PROVEN**.
- Causal explanations of why a segment was slow: **NOT YET PROVEN** and intentionally absent.
- No athlete/private data is committed; public boundary remains clean.

## Acceptance
Given one race and one comparison baseline, the tool must reproducibly explain where time was lost, how sensitive that conclusion is to baseline assumptions, and what combinations of segment improvements can reach a requested finish time.

## Initial evidence target
Use public or synthetic HYROX-style split examples only. Do not fabricate athlete performance data or claim causal training advice from race splits alone.

## Current challenger
Extend sensitivity from binary stable/unstable flags to deterministic per-segment rank stability summaries: best rank, worst rank, top-scenario count, and top-scenario share. This must expose ambiguity rather than collapse assumption-sensitive rankings into a single recommendation.

## Highest-EV next move
Run the exact-head rank-stability contracts. If green, freeze the V0 pure-function analysis substrate and shift allocation to athlete-owned/public example integration or the next OSS stream rather than accumulating UI. If a contract fails, preserve the counterexample and repair semantics before promotion.

Status: ACTIVE / V0 CORE SUPPORTED / RANK-STABILITY CHALLENGER NOT YET PROVEN
