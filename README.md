# Hybrid Race Lab

Open-source performance intelligence for HYROX-style hybrid racing and endurance athletes.

## What it should answer
Instead of giving an athlete another dashboard full of numbers, Hybrid Race Lab should answer a narrower question:

> **Where am I actually losing time, how much is plausibly recoverable, and what race/training change has the highest expected payoff?**

## V0
- Ingest race splits from CSV/JSON/manual entry.
- Represent running, stations and transitions as typed segments.
- Decompose total race time and rank bottlenecks.
- Compare segments against a chosen baseline or cohort without pretending correlation proves causation.
- Simulate target finish times and pacing trade-offs.
- Generate a reproducible race debrief with assumptions and confidence labels.
- Export shareable summaries for athletes, coaches and creators.

The initial schema is optimized for HYROX-style run/station/transition races, but the core model should remain extensible to running, triathlon and other endurance formats.

## Design rules
1. **Evidence before advice.** Keep measured race data separate from inferred explanations.
2. **No fake precision.** Unknown recovery, physiology or causal effects stay unknown unless supported by data.
3. **Local-first where practical.** Athletes should be able to analyze exported data without surrendering an entire training history to a hosted service.
4. **Generic public engine.** No proprietary private athlete data or private strategy engines belong in this repository.
5. **Reproducible analysis.** Every debrief should be reproducible from its input data, configuration and code version.

## Example future output
```text
Total: 1:05:12
Largest relative losses:
1. Wall balls        +02:04 vs baseline
2. Run km 6          +01:18
3. Transition total  +00:57

Target 59:59 requires ~313 s improvement.
Current modeled recoverable time: 274–356 s depending on assumptions.
Assumptions most capable of changing the conclusion: run-decay model, wall-ball baseline, transition normalization.
```

## Status
Early research/build stage. No performance claims are proven yet.
