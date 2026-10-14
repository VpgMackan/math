(() => {
  "use strict";

  const root = typeof window !== "undefined" ? window : globalThis;
  const randomInt = root.GaussShared?.randomInt || ((min, max, rng = Math.random) => min + Math.floor(rng() * (max - min + 1)));

  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a) || 1);

  function frac(a, b = 1) {
    if (!Number.isSafeInteger(a) || !Number.isSafeInteger(b) || b === 0)
      throw Error("Ogiltigt eller för stort tal.");
    if (b < 0) {
      a = -a;
      b = -b;
    }
    const d = gcd(a, b);
    return [a / d, b / d];
  }

  const plus = (a, b) => frac(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
  const times = (a, b) => frac(a[0] * b[0], a[1] * b[1]);
  const negative = (a) => frac(-a[0], a[1]);
  const isZero = (a) => a[0] === 0;
  const isOne = (a) => a[0] === a[1];
  const equals = (a, b) => a[0] === b[0] && a[1] === b[1];
  const format = (a) => (a[1] === 1 ? String(a[0]) : a[0] + "/" + a[1]);
  const clone = (m) => m.map((row) => row.map((x) => [...x]));
  const sameRow = (a, b) => a.every((x, i) => equals(x, b[i]));

  function parse(value) {
    const s = String(value).trim().replaceAll("−", "-");
    if (!/^[+-]?\d+(\/[+-]?\d+)?$/.test(s))
      throw Error("Fyll i varje fält med ett heltal eller bråk, till exempel −3/2.");
    const [a, b = "1"] = s.split("/");
    return frac(Number(a), Number(b));
  }

  function ratio(a, b) {
    for (let i = 0; i < b.length; i++)
      if (!isZero(b[i])) return frac(a[i][0] * b[i][1], a[i][1] * b[i][0]);
    return null;
  }

  function det(a) {
    if (a.length === 2) return a[0][0] * a[1][1] - a[0][1] * a[1][0];
    return a[0].reduce(
      (total, x, j) =>
        total + (j % 2 ? -1 : 1) * x * det(a.slice(1).map((r) => r.filter((_, k) => k !== j))),
      0,
    );
  }

  function makePuzzle(size, kind, rng = Math.random, difficulty = 2) {
    let a,
      attempts = 0;
    const limit = difficulty === 3 ? 6 : 3;
    do {
      a = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => randomInt(-limit, limit, rng)),
      );
      attempts++;
    } while (
      (!det(a) ||
        Math.abs(det(a)) > (difficulty === 3 ? 120 : 24) ||
        a.every((row, i) => row.every((v, j) => v === (i === j ? 1 : 0)))) &&
      attempts < 5000
    );
    if (!det(a))
      a = Array.from({ length: size }, (_, i) =>
        Array.from({ length: size }, (_, j) => (i === j ? 2 : 1)),
      );
    if (difficulty === 1) {
      a = Array.from({ length: size }, (_, i) =>
        Array.from({ length: size }, (_, j) => (i === j ? 1 : j > i ? randomInt(0, 2, rng) : 0)),
      );
      a[0][1] = 1;
    }
    const x = Array.from({ length: size }, () => randomInt(difficulty === 1 ? 1 : -limit, limit, rng));
    const right =
      kind === "solve"
        ? a.map((row) => [row.reduce((sum, v, j) => sum + v * x[j], 0)])
        : a.map((_, i) => Array.from({ length: size }, (_, j) => +(i === j)));
    return a.map((row, i) => [...row, ...right[i]].map((v) => frac(v)));
  }

  function invertible(a) {
    const m = clone(a),
      n = m.length;
    for (let c = 0; c < n; c++) {
      let r = c;
      while (r < n && isZero(m[r][c])) r++;
      if (r === n) return false;
      [m[c], m[r]] = [m[r], m[c]];
      for (let i = c + 1; i < n; i++) {
        if (isZero(m[i][c])) continue;
        const k = times(m[i][c], frac(m[c][c][1], m[c][c][0]));
        m[i] = m[i].map((x, j) => plus(x, negative(times(k, m[c][j]))));
      }
    }
    return true;
  }

  root.GaussMath = { frac, plus, times, parse, equals, format, det };
  root.GaussCore = {
    frac,
    plus,
    times,
    negative,
    isZero,
    isOne,
    equals,
    format,
    clone,
    sameRow,
    parse,
    ratio,
    det,
    makePuzzle,
    invertible,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { frac, plus, times, parse, equals, format, det, makePuzzle, invertible };
  }
})();
