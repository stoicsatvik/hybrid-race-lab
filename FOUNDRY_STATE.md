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

## Current challenger
- Branch: `foundry/v0-core-analysis`; draft PR #1; never merge without explicit approval.
- V0 analysis core and deterministic contracts are SUPPORTED on committed synthetic cases after successful Node16 harness execution.
- Manual + JSON canonical ingestion at `7afc9d2d885af4719505bf96ffdfc1088a10e8a4` is SUPPORTED by workflow run `34163553635`: dependency install, Expo Doctor, repository TypeScript, and `test:core` all completed successfully.
- CSV challenger: `46a196f821ba2741191f65c58b35cd11f312ab1a` adds dependency-free RFC4180-style essentials needed by race splits: exact header, commas and escaped quotes inside quoted labels, CRLF tolerance, numeric duration parsing, row-order preservation, canonical label fallback, and fail-closed malformed input.
- CSV falsification contracts: `ab026b4a4b428c96cdc395f52d65ff3f8cd2e568` require manual/JSON/CSV canonical equivalence and attack malformed headers, nonnumeric durations, invalid kinds, duplicate IDs, unterminated quotes, and extra columns.
- Measured durations remain distinct from explicit scenario assumptions; no causal training or medical claim is inferred.

## Preserved failures
- Run `34148115658`: REJECTED reproducibility configuration because package.json/package-lock.json were out of sync; tests never executed.
- Run `34151948824`: dependency install, Expo Doctor and repository TypeScript passed, but the isolated harness was REJECTED because TypeScript 6 rejects deprecated `moduleResolution=node10`; contracts never executed.

## Validation / claim boundary
- V0 deterministic analysis core: **SUPPORTED** on committed synthetic contracts.
- Manual + JSON ingestion: **SUPPORTED** on committed synthetic contracts at run `34163553635`.
- CSV ingestion architecture/contracts at `ab026b4a...`: **NOT YET PROVEN** until exact-head CI executes.
- Real-athlete generality: **NOT YET PROVEN**.
- Causal explanations of why a segment was slow: **NOT YET PROVEN** and intentionally absent.
- No athlete/private data is committed; public boundary remains clean.

## Acceptance
Given one race and one comparison baseline, the tool must reproducibly explain where time was lost, how sensitive that conclusion is to baseline assumptions, and what combinations of segment improvements can reach a requested finish time.

## Initial evidence target
Use public or synthetic HYROX-style split examples only. Do not fabricate athlete performance data or claim causal training advice from race splits alone.

## Highest-EV next move
Execute exact-head CI for the CSV challenger. Preserve any parser/semantic failure as a counterexample. A clean pass completes the V0 canonical input boundary and unlocks a deterministic exportable debrief; do not add UI before that gate.

Status: ACTIVE / CSV NOT YET PROVEN
