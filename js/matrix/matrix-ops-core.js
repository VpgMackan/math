(() => {
  "use strict";

  function multiply(a, b) {
    if (a[0].length !== b.length) throw Error("Incompatible dimensions");
    return a.map((row) =>
      b[0].map((_, j) => row.reduce((sum, x, k) => sum + x * b[k][j], 0)),
    );
  }

  function createMatrixOpsCore(detFn) {
    function calculate(kind, a, b, k) {
      if (kind === "multiply") return multiply(a, b);
      if (kind === "add") return a.map((r, i) => r.map((v, j) => v + b[i][j]));
      if (kind === "subtract")
        return a.map((r, i) => r.map((v, j) => v - b[i][j]));
      if (kind === "scale") return a.map((r) => r.map((v) => k * v));
      if (kind === "transpose") return a[0].map((_, j) => a.map((r) => r[j]));
      if (kind === "determinant") return [[detFn(a)]];
      throw Error("Unknown operation");
    }
    return { multiply, calculate };
  }

  const root = typeof window !== "undefined" ? window : globalThis;
  const api = { createMatrixOpsCore, multiply };
  root.MatrixOpsCore = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
