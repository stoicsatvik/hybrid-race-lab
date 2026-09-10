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
- Sensitivity layer at `5e25d9f6b1f1d85cf14307e92a76728ab06b80df`: **SUPPORTED** by workflow run `34180267144`.

## Preserved failures
- Run `34148115658`: REJECTED reproducibility configuration because package.json/package-lock.json were out of sync; tests never executed.
- Run `34151948824`: dependency install, Expo Doctor and repository TypeScript passed, but the isolated harness was REJECTED because TypeScript 6 rejects deprecated `moduleResolution=node10`; contracts never executed.
- Run `34437630234` on target-plan head `ce62e9a5c34d321c540460afef1e56d1c39bdbe6`: CI failed before TypeScript or `test:core` because Expo Doctor detected four SDK patch-version mismatches (`@expo/ui`, `expo`, `expo-glass-effect`, `expo-router`). This is an app-environment health failure, not evidence for or against the target-plan challenger.
- Run `34450278691` on `1e64a18273879684fe5087140d654a84f351f911`: the isolated core job successfully ran the established analysis/ingest/debrief/sensitivity contracts, then failed because `.core-test-dist/target-plan.contracts.js` did not exist. Root cause: `tsconfig.core-tests.json` omitted both `target-plan.ts` and `target-plan.contracts.ts` from its explicit include list. This is harness evidence, not algorithm evidence.
- Run `34460987215` on `77f79a31570c1ec06e4774aa4af3a5e670e52b58`: the target-plan contract was now included and reached by TypeScript, but compilation failed on `import assert from 'node:assert/strict'` because the isolated core harness intentionally had no Node type dependency. The algorithm still did not execute. This is a contract-environment failure, not algorithm evidence.

## Validation / claim boundary
- V0 deterministic analysis, canonical ingestion, exportable debrief, and declared-scenario sensitivity: **SUPPORTED** on committed deterministic synthetic contracts.
- CI evidence isolation: **SUPPORTED** by run `34450278691`, which executed core contracts independently while app health remained separately red.
- Target-plan enumerator: **NOT YET PROVEN** until its deterministic contracts execute successfully at an exact head.
- Target-plan harness inclusion: **SUPPORTED** insofar as run `34460987215` reached and compiled the contract before failing on its Node-only assertion import.
- Dependency-free target-plan contract at `6ba808541d824a243ba77a395a7a8f2eaa39e6c6`: **NOT YET PROVEN** pending exact-head CI.
- Expo SDK dependency health: **BLOCKED** on patch-version drift until dependencies are deliberately reconciled; do not silently ignore the warning.
- Real-athlete generality: **NOT YET PROVEN**.
- Causal explanations of why a segment was slow: **NOT YET PROVEN** and intentionally absent.
- No athlete/private data is committed; public boundary remains clean.

## CI evidence isolation
As of `7d1981a42b5884ca167561239e2131fc36fe6289`, CI separates `core-acceptance` from `app-health`. Core deterministic contracts can produce independent evidence even when Expo SDK health is red; app-health remains blocking/visible and is not suppressed.

As of `e005b5222cbacdf685c331f23b3fe2c1c15756a1`, the isolated TypeScript harness explicitly includes `target-plan.ts` and `target-plan.contracts.ts`, closing the missing-emission defect exposed by run `34450278691`.

As of `6ba808541d824a243ba77a395a7a8f2eaa39e6c6`, the target-plan contract uses the same dependency-free local assertion pattern as the established core contracts, removing the unnecessary Node typings dependency exposed by run `34460987215`. This contract repair is **NOT YET PROVEN** until exact-head CI executes.

## Acceptance
Given one race and one comparison baseline, the tool must reproducibly explain where time was lost, how sensitive that conclusion is to baseline assumptions, and what combinations of segment improvements can reach a requested finish time.

## Initial evidence target
Use public or synthetic HYROX-style split examples only. Do not fabricate athlete performance data or claim causal training advice from race splits alone.

## Current challenger
Target-plan enumerator: given a race, target time and explicit per-segment improvement assumptions, enumerate deterministic minimal-cardinality feasible combinations, rank feasible plans by least excess improvement, return no plan for impossible targets, and fail closed on malformed/unsafe search inputs.

## Highest-EV next move
Observe exact-head `core-acceptance` after the dependency-free contract repair. If the target-plan contracts execute and pass, promote the challenger to **SUPPORTED** on committed synthetic contracts. If they execute and fail, preserve the failure and modify the algorithm only in response to that evidence. Keep Expo dependency reconciliation separate.

Status: ACTIVE / V0 CORE SUPPORTED / TARGET-PLAN CHALLENGER NOT YET PROVEN / CONTRACT REPAIR NOT YET PROVEN / APP HEALTH BLOCKED
