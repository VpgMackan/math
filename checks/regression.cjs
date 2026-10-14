#!/usr/bin/env node
"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
global.window = global;

global.GaussShared = {
  randomInt: (min, max, rng = Math.random) => min + Math.floor(rng() * (max - min + 1)),
};

const gauss = require(path.join(rootDir, "gauss-core.js"));
const matrixCore = require(path.join(rootDir, "matrix-ops-core.js"));
require(path.join(rootDir, "math5-engine-generators.js"));
const math5 = require(path.join(rootDir, "math5-engine.js"));

// Gauss core math checks
assert.deepEqual(gauss.frac(6, -8), [-3, 4]);
assert.deepEqual(gauss.parse("-3/2"), [-3, 2]);
assert.equal(gauss.format([5, 1]), "5");
assert.equal(gauss.det([[1, 2], [3, 4]]), -2);

// Matrix operations checks
const ops = matrixCore.createMatrixOpsCore(gauss.det);
assert.deepEqual(
  ops.calculate(
    "multiply",
    [
      [1, 2],
      [3, 4],
    ],
    [
      [2, 0],
      [1, 2],
    ],
  ),
  [
    [4, 4],
    [10, 8],
  ],
);
assert.deepEqual(ops.calculate("determinant", [[1, 2], [3, 4]]), [[-2]]);

// Math5 engine checks
assert.ok(math5.categories.combinatorics);
assert.ok(math5.availableTypes("combinatorics", 1).includes("product"));
assert.ok(!math5.availableTypes("combinatorics", 1).includes("restricted"));

const generated = math5.generate("combinatorics", "product", 1);
assert.equal(generated.category, "combinatorics");
assert.equal(generated.type, "product");
assert.ok(generated.fields.length >= 1);

const mockTask = {
  fields: [
    { type: "number", answer: 0.5, tolerance: 1e-6 },
    { type: "set", answer: [1, 3, 5] },
    { type: "digits", answer: "1AF" },
  ],
};
assert.deepEqual(math5.assess(mockTask, ["1/2", "{5,1,3}", "01af"]), [true, true, true]);
math5.validate(mockTask, ["0.5", "∅", "ABC"]);

console.log("Regression checks passed.");
