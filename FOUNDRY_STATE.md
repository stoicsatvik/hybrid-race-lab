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
- Framework-agnostic race schema: `792136d2a1e56560d33b0b0d5c546b0ef2558e9b`.
- Deterministic decomposition, baseline-delta/recoverable-time ranking, and target-time simulation: `2c13446f41c8d8fcdadcf45a98922f0112210c1f`.
- Measured durations are kept distinct from the explicit `recoverableFraction` scenario assumption; the core makes no causal training or medical claim.
- CI falsification harness was added, but run `34148115658` failed before tests because package.json added Jest dependencies without updating package-lock.json. This remains preserved as a reproducibility failure, not a core-analysis failure.
- Dependency-free repair restored lock compatibility. Run `34151948824` then proved `npm ci`, Expo Doctor, and repository-wide TypeScript verification all pass, but `npm run test:core` failed before contract execution because TypeScript 6 rejects deprecated `moduleResolution=node10` inherited from the test config's `Node` alias.
- Commit `02afbe3e583da38b0c1dc2c67c2a18f975920474` migrates the isolated core-test compiler to matched `module: Node16` + `moduleResolution: Node16` instead of suppressing the deprecation. Exact-head execution remains the gate.

## Validation / claim boundary
- Core architecture: **SUPPORTED** by inspectable deterministic pure functions and fail-closed input validation.
- CI/reproducibility at `4cfbc4ad...`: **REJECTED**. `npm ci` failed because package.json/package-lock.json were out of sync; analysis tests never executed.
- Dependency installation and general project verification at run `34151948824`: **SUPPORTED** (`npm ci`, Expo Doctor 21/21, and `npx tsc --noEmit` passed).
- Core-test compiler configuration at pre-fix head `57449ab...`: **REJECTED** under TypeScript 6 because `moduleResolution=node10` is deprecated and treated as an error.
- Node16 compiler-config challenger at `02afbe3e...`: **NOT YET PROVEN** until exact-head CI executes.
- Core analysis contracts themselves remain **NOT YET PROVEN** because the failed run did not reach JavaScript contract execution.
- Bottleneck ranking represents baseline-relative recoverable-time scenarios only; causal explanations of why a segment was slow are **NOT YET PROVEN** and intentionally absent.
- No athlete/private data is committed; public boundary remains clean.

## Acceptance
Given one race and one comparison baseline, the tool must reproducibly explain where time was lost, how sensitive that conclusion is to baseline assumptions, and what combinations of segment improvements can reach a requested finish time.

## Initial evidence target
Use public or synthetic HYROX-style split examples only. Do not fabricate athlete performance data or claim causal training advice from race splits alone.

## Highest-EV next move
Obtain exact-head CI for the Node16 core-test compiler repair. If compilation clears, preserve any actual deterministic contract failure as the first semantic counterexample. Only after `npm ci`, TypeScript verification, core-test compilation, and the contracts all pass should CSV/JSON/manual ingestion become eligible.

Status: ACTIVE / NOT YET PROVEN
