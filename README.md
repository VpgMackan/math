# Gausskamp — editable static site

This repository is a browser-based mathematics practice app built with plain HTML, CSS, and JavaScript.
There is no framework, bundler, build step, or server-side code.

## Run locally

From the repository root:

```sh
python3 -m http.server 8000 --directory /home/runner/work/math/math
```

Open <http://localhost:8000/index.html>.

## Project layout

- `/home/runner/work/math/math/index.html` — app structure, overlays, and script loading order.
- `/home/runner/work/math/math/style.css` — layout, theme, responsive and print styles.
- `/home/runner/work/math/math/shared-utils.js` — shared DOM and storage helpers plus seeded/random/date helpers.
- `/home/runner/work/math/math/gauss-core.js` — Gauss math primitives and puzzle generation helpers.
- `/home/runner/work/math/math/app.js` — Gauss gameplay state, persistence, rendering, and interactions.
- `/home/runner/work/math/math/app-api.js` — small shared API used by feature modules.
- `/home/runner/work/math/math/app-shell.js` — centralized topic/surface switching lifecycle.
- `/home/runner/work/math/math/matrix-ops.js` — matrix operation practice mode.
- `/home/runner/work/math/math/math5-engine-generators.js` — Matematik 5 task generation rules by category/level.
- `/home/runner/work/math/math/math5-engine.js` — Matematik 5 engine metadata, generation orchestration, parsing, and validation.
- `/home/runner/work/math/math/math5.js` — Matematik 5 UI flow, progress, grading, and test mode.
- `/home/runner/work/math/math/learning-guide.js` — beginner guidance content and quick-start entry.
- `/home/runner/work/math/math/work-review.js` — saved work, grading preference, and print/review overlay.

## Architecture and dependencies

The app is loaded with `defer` scripts and relies on intentional global exports:

1. `shared-utils.js` provides `window.GaussShared`.
2. `work-review.js` provides `window.WorkReview`.
3. `gauss-core.js` provides `window.GaussCore` and `window.GaussMath`.
4. `app-api.js` provides `window.GaussApi` (thin shared boundary over game/work systems).
5. `app.js` provides `window.GaussGame`.
6. `matrix-ops.js` provides `window.MatrixOps` and uses `GaussMath` + `GaussApi`.
7. `math5-engine-generators.js` provides `window.Math5EngineGenerators`.
8. `math5-engine.js` provides `window.Math5Engine`.
9. `math5.js` provides `window.Math5` and uses `Math5Engine` + `GaussApi`.
10. `app-shell.js` centralizes topic switching across Gauss, Matrix Ops, and Matematik 5.

Keep this order unless you also update the dependent globals.

## Verify changes

Run the lightweight regression checks from the repository root:

```sh
node /home/runner/work/math/math/checks/regression.cjs
```

Then open the app locally and smoke-test all three topics.
