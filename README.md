# Gausskamp — editable static site

This repository contains a browser-based mathematics practice app built with plain HTML, CSS, and JavaScript. **There is no framework, bundler, build step, or server-side code:** the editable site is already in `dist/`.

## Run locally

From the repository root, start a static web server:

```sh
python3 -m http.server 8000 --directory dist
```

Then open <http://localhost:8000>. You can also host the contents of `dist/` directly; `.openai/hosting.json` is already configured to use that directory.

## Where to make changes

- `dist/index.html` — page structure, labels, controls, and app sections.
- `dist/style.css` — colors, spacing, layout, responsive rules, and print styles.
- `dist/app.js` — Gauss elimination, inverse, game modes, and general app behavior.
- `dist/matrix-ops.js` — matrix-operation exercises and answers.
- `dist/math5.js` — Matematik 5 interface, progress, and test flow.
- `dist/math5-engine.js` — Matematik 5 exercise generation and answer checking.
- `dist/learning-guide.js` — beginner examples and guidance.
- `dist/work-review.js` — saved work, grading preferences, and print/review UI.

The JavaScript files are separated by feature and formatted for easier reading. `index.html` loads them with `defer`; preserve their current order because later files use globals created by earlier ones.

## Verify changes

After editing, run the app in a browser and run the smoke tests from the repository root:

```sh
node checks/math5-smoke.cjs
```

The app stores scores, settings, and saved work in the browser's `localStorage`. There are no source maps or separate pre-build source files in this checkout, so the formatted files in `dist/` are the practical editable source; their exact match to any original authoring files cannot be confirmed.
