# Gausskamp

A browser-based mathematics practice app built with plain HTML, CSS, and JavaScript. There is no framework, bundler, build step, or server-side code.

## Pages

- `index.html` — choose an exercise area.
- `gauss/index.html` — Gauss elimination, daily matrices, timed challenge, and custom matrices.
- `matrix/index.html` — matrix operations.
- `math5/index.html` — Matematik 5.

Each practice page links back to the selector and to the other practice areas. The pages share `style.css`, grading preferences, saved work reports, and score data. Matematik 5 progress is saved separately. Existing browser storage keys are retained.

## Project layout

```text
.
├── index.html
├── gauss/index.html
├── matrix/index.html
├── math5/index.html
├── style.css
├── js/
│   ├── shared/   # Storage, common UI, review, guide, and API
│   ├── gauss/    # Gauss game
│   ├── matrix/   # Matrix operations and math core
│   └── math5/    # Matematik 5 UI, engine, and generators
└── checks/regression.cjs
```

Pages use deferred classic scripts. Load order matters: shared utilities and math cores must load before the feature modules that depend on them. `js/shared/page-entry.js` starts the selected feature after its page modules have initialized.

## Run locally

From the repository root:

```sh
python3 -m http.server 8000
```

Open <http://localhost:8000/>.

## Verify changes

Run the math-core regression checks:

```sh
node checks/regression.cjs
```

For UI changes, serve the site over HTTP and smoke-test all routes: `/`, `/gauss/`, `/matrix/`, and `/math5/`.
