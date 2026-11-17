# Ripple

**What-if planning for small teams.** Enter a project plan, change one assumption, and see how the schedule ripples through the tasks that depend on it. Then compare practical ways to respond before saving a revised plan.

> “Plans are worthless, but planning is everything.” — Dwight D. Eisenhower

## What it does

1. Create a project (or load the sample).
2. Add tasks with a name and a duration in working days.
3. Set dependencies: which tasks must finish before another can start.
4. View the calculated schedule: start and finish days, project completion, critical path and float.
5. Delay a task or change its duration. The whole schedule is recalculated.
6. See original vs new completion, the affected tasks, and a plain-English explanation.
7. If the finish date moves, choose a response and save it as the revised plan:
   - **Keep the original deadline** by shortening one task (trade-off shown, applied only on confirmation)
   - **Move the deadline** with all durations unchanged
   - **Remove or defer** a non-critical task

Ripple never picks an option for you.

## Run it

No build step and no dependencies.

```bash
# Option 1: open index.html in a browser
# Option 2: serve the folder locally
npx serve .
```

**GitHub Pages:** push the repo, then Settings → Pages → deploy from the `main` branch, root folder.

## Tests

```bash
npm test        # or: node tests/scheduler.test.js
```

Covers the sample project (Day 11), a 2-day delay to B (Day 13), a 2-day delay to D (no change), circular-dependency rejection, multi-predecessor start days, plus validation and defer edge cases. The five core checks can also be run in the app from **About & README**.

## Project structure

```
index.html            page shell
css/styles.css        styles (palette: #ECEFF1, #4A6274, #6B9080)
js/scheduler.js       scheduling logic: validation, schedule, float, comparison (no DOM)
js/app.js             user interface
tests/                Node tests for the scheduler
```

## How the schedule is calculated

- **Forward pass:** `Start = latest predecessor finish + 1` (Day 1 if none); `Finish = Start + Duration − 1`.
- **Backward pass:** `Float = Latest finish − Finish`.
- **Critical path:** tasks with zero float.
- Changing a duration recalculates everything. It never just adds days to the old completion date.
- Circular dependencies are detected and rejected.

## Assumptions

- Tasks start on Day 1; durations are whole working days.
- Tasks run in parallel when their dependencies are complete.
- No weekends, holidays or resource limits.

## What it does not do

- No accounts, collaboration, notifications or integrations.
- No automatic delay detection, AI duration estimates, budgets or resource planning.
- No saving between browser sessions.
- It recalculates from user-entered assumptions and does not predict real-world delays.
- It is an early-stage project and not a replacement for professional project-management software.

## Quotes used in the app

Eisenhower (planning); Fred Brooks, *The Mythical Man-Month* (late projects); Douglas Hofstadter, *Gödel, Escher, Bach* (estimates); C. Northcote Parkinson, *The Economist*, 1955 (time and work).
