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
Validation: dependency-free arithmetic fixture was independently reproduced in the Foundry execution environment (520 s total, deltas 20/60/5, recoverable 10/30/2.5, max opportunity 30 s, simulated finish 490 s). The dependency-free runner encodes deterministic invariants spanning race/baseline totals, +85 s deficit, segment deltas, stable bottleneck sensitivity at 25/50/75%, 42.5 s available savings at 50%, feasible 480 s allocation (station-1 30 s + run-1 10 s), infeasible 470 s floor at 477.5 s, and an already-met target that must not invent savings.
Compute discipline: no PR or hosted workflow was triggered solely to manufacture a green badge.

## 2026-09-14 foundry cycle: CI separation
Objective: convert the stranded core branch into an explicit CI evidence boundary without conflating framework health with kernel correctness.
Branch: `foundry/core-race-analysis-v0`.
PR: `#2` (draft, open, unmerged).
Observed Mobile CI remains an independent framework-health gate and has failed at Expo Doctor; that failure is preserved rather than treated as mathematical-kernel evidence.
Action: added `.github/workflows/core-ci.yml` as a separate deterministic core gate and later scoped production-core TypeScript checking via `tsconfig.core.json`, excluding legacy Jest-style test files whose globals are not configured in repository-wide TypeScript.
Validated core head before perturbation increment: `e4aaf7b305b2cb56944a3ca1085bb7987b9ca378`; Core CI `34796258513` SUCCESS.
Claim: deterministic runtime invariants and scoped production-core TypeScript correctness SUPPORTED. Mobile/Expo environment health remains REJECTED by its separate gate.

## 2026-09-14 foundry cycle: baseline perturbation falsification
Objective: test whether apparently stable bottleneck rankings survive changes in the comparison baseline, and whether target feasibility behaves monotonically as targets tighten.
Branch: `foundry/core-race-analysis-v0`.
PR: `#2` (draft, open, unmerged).
Implementation commit: `79edcb7ba7ddddd0cfb0289a0f128ec4b5577379`.
Implemented: expanded the dependency-free synthetic runner from 10 to 12 invariant groups. Added three preregistered baseline scenarios (`reference`, `station-lenient`, `run-lenient`) and a 500/490/480/470 s target grid.
Falsification result: the reference and run-lenient baselines rank `station-1` first, while the station-lenient baseline ranks `run-1` first. Therefore a top bottleneck that appears stable under global 25/50/75% recoverability scaling is not invariant to baseline choice. Claim `top bottleneck is baseline-robust` is REJECTED by synthetic counterexample.
Target-frontier result: feasibility across 500/490/480/470 s is `[true, true, true, false]`; required savings are monotone as targets tighten and best projected finish does not worsen. These are mathematical properties under supplied synthetic baseline/recoverability assumptions, not athlete predictions.
Validation: exact implementation commit `79edcb7b...` Core CI `34803023133` completed SUCCESS. Independent Mobile CI `34803023158` completed FAILURE; this remains a separate Expo/mobile claim and does not negate the core result.
Claim status: baseline-choice invariance REJECTED; 12-group deterministic synthetic falsification contract SUPPORTED at exact implementation commit; real athlete predictive validity and causal coaching usefulness NOT YET PROVEN.
Safety/privacy: synthetic fixtures and generic race mathematics only; no private athlete data, credentials, proprietary coaching heuristics, or causal training claims.
Blocker: no blocker for core robustness work. Mobile/Expo health remains independently REJECTED and should not be silently folded into core evidence.
Next step: implement an explicit baseline-scenario robustness report that exposes top-rank agreement and target-feasibility agreement across preregistered baselines, then falsify it with additional sealed scenarios before any UI work.

## 2026-09-14 foundry cycle: explicit baseline-scenario robustness report
Objective: turn baseline uncertainty into an auditable output instead of hiding it behind one selected baseline.
Branch: `foundry/core-race-analysis-v0`.
PR: `#2` (draft, open, unmerged).
Implementation commits: `d8bb97ef99b511c2872be13c992964ac8fa9d008` and `400318b4a4d92dbe942af13fed0a8f12a344e6a0`.
Implemented: `baselineScenarioRobustness` in `src/core/report.ts`, reporting per-baseline top bottleneck, per-target feasibility, distinct top segment IDs, top-rank agreement, per-target agreement counts, and aggregate target-agreement status. Inputs require non-empty baseline/target sets, unique baseline IDs, and a bounded recoverable fraction.
Initial sealed expectation was falsified by Core CI `34810001524`: `npm ci` passed, `npm run test:core` failed, and TypeScript was skipped. The expected feasible-scenario counts at 490/480 s had been incorrectly preregistered as 2/1; direct recomputation of the same sealed arithmetic gives 3/2. The report algorithm was not changed.
Correction commit: `9e334b958ef37b6a3e2fc49e7fc42f502620e122` updates only the expected synthetic counts. Correct sealed feasibility counts for 500/490/480/470 s are 3/3/2/0, giving agreement `[true, true, false, true]`. Top-rank agreement remains false with distinct tops `station-1` and `run-1`.
Validation contract: dependency-free runner remains 15 invariant groups. Exact correction head `9e334b95...` requires unchanged Core CI before promotion.
Claim status: prior analytical core remains SUPPORTED; baseline-choice invariance remains REJECTED; the first robustness-report test expectation at `400318b4...` is REJECTED; explicit robustness report at `9e334b95...` is NOT YET PROVEN pending exact-head CI; real athlete predictive validity and causal coaching usefulness remain NOT YET PROVEN.
Safety/privacy: synthetic fixtures and generic race mathematics only; no private athlete data, credentials, proprietary coaching heuristics, or causal training claims.
Blocker: exact-head Core CI evidence for `9e334b95...` has not yet been observed. Mobile/Expo health remains independently REJECTED and is not part of this claim.
Next step: require exact-head Core CI for the corrected 15-group contract. If green, attack scenario-set sensitivity itself: determine whether adding/removing preregistered baselines changes agreement conclusions and expose coverage limits rather than calling three scenarios exhaustive.

## Acceptance
Given one race and one comparison baseline, the tool must reproducibly explain where time was lost, how sensitive that conclusion is to baseline assumptions, and what combinations of segment improvements can reach a requested finish time.

## Initial evidence target
Use public or synthetic HYROX-style split examples only. Do not fabricate athlete performance data or claim causal training advice from race splits alone.

Status: ACTIVE / SUPPORTED CORE, BASELINE ROBUSTNESS REJECTED, ROBUSTNESS REPORT NOT YET PROVEN, REAL-WORLD VALIDITY NOT YET PROVEN
