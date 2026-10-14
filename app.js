(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const storeKey = "gausskamp-v4";
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
  const randomInt = (min, max, rng = Math.random) => min + Math.floor(rng() * (max - min + 1));
  function seeded(seed) {
    let t = seed >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let v = t;
      v = Math.imul(v ^ (v >>> 15), v | 1);
      v ^= v + Math.imul(v ^ (v >>> 7), v | 61);
      return ((v ^ (v >>> 14)) >>> 0) / 4294967296;
    };
  }
  function dateKey() {
    return new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Europe/Stockholm",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }
  function hash(s) {
    let h = 2166136261;
    for (const c of s) {
      h ^= c.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
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
    const x = Array.from({ length: size }, () =>
      randomInt(difficulty === 1 ? 1 : -limit, limit, rng),
    );
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
  const initialStats = { score: 0, solved: 0, bestStreak: 0, streak: 0, fastest: null, daily: {} };
  let stats = { ...initialStats },
    game = {
      mode: "practice",
      method: "solve",
      size: 2,
      difficulty: 1,
      taskNo: 0,
      matrix: [],
      initial: [],
      history: [],
      steps: [],
      hints: 0,
      hintLevel: 0,
      mistakes: 0,
      done: false,
      round: 0,
      lives: 3,
      remaining: 360000,
      deadline: null,
      paused: false,
      over: false,
      date: null,
      drafts: {},
      selectedRow: 0,
    };
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey) || "null");
    if (saved?.stats) {
      stats = { ...initialStats, ...saved.stats, daily: saved.stats.daily || {} };
      if (
        saved.game &&
        ["practice", "daily", "custom"].includes(saved.game.mode) &&
        Array.isArray(saved.game.matrix)
      ) {
        game = { ...game, ...saved.game, deadline: null, paused: false, over: false };
      }
    } else {
      stats.score = Number(localStorage.getItem("gauss_score")) || 0;
      stats.bestStreak = Number(localStorage.getItem("gauss_best")) || 0;
    }
  } catch {}
  let timerId = null,
    modalReturn = null,
    modalWasPaused = false,
    wrongFields = new Set(),
    lastInputIndex = 0,
    pendingReplace = null;
  function save() {
    try {
      const safe = ["practice", "daily", "custom"].includes(game.mode)
        ? { ...game, deadline: null, paused: false }
        : null;
      localStorage.setItem(storeKey, JSON.stringify({ stats, game: safe }));
    } catch {}
  }
  function feedback(text, type = "") {
    const node = $("feedback");
    node.textContent = text;
    node.className = "feedback" + (type ? " " + type : "");
  }
  function active() {
    return !game.done && !game.over && !game.paused;
  }
  function fillEntry() {
    const grid = $("entryGrid"),
      row = Number($("editRow").value) || 0;
    grid.style.setProperty("--cols", game.matrix[0].length);
    grid.replaceChildren();
    wrongFields.clear();
    lastInputIndex = 0;
    game.matrix[row].forEach((_, col) => {
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = window.matchMedia("(pointer:coarse)").matches ? "decimal" : "text";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.placeholder = "·";
      input.value = game.drafts?.[row]?.[col] || "";
      input.setAttribute("aria-label", `Rad ${row + 1}, kolumn ${col + 1}`);
      if (col === game.size) input.classList.add("aug-input");
      grid.append(input);
    });
    game.selectedRow = row;
    showCurrentRow(row);
  }
  function stashDraft() {
    const row = Number($("editRow").value);
    game.drafts ??= {};
    game.drafts[row] = [...$("entryGrid").querySelectorAll("input")].map((input) => input.value);
    save();
  }
  function showCurrentRow(row) {
    const node = $("currentRow");
    node.style.setProperty("--cols", game.matrix[row].length);
    node.replaceChildren();
    game.matrix[row].forEach((value, j) => {
      const cell = document.createElement("span");
      cell.textContent = format(value);
      if (j === game.size) cell.className = "aug-value";
      node.append(cell);
    });
  }
  function matrixSnapshot(matrix, label) {
    const wrap = document.createElement("div"),
      title = document.createElement("div"),
      grid = document.createElement("div");
    wrap.className = "snapshot";
    title.className = "snapshot-label";
    title.textContent = label;
    grid.className = "snapshot-grid";
    grid.style.setProperty("--cols", matrix[0].length);
    matrix.forEach((row) =>
      row.forEach((value, j) => {
        const cell = document.createElement("span");
        cell.textContent = format(value);
        if (j === game.size) cell.className = "aug-value";
        grid.append(cell);
      }),
    );
    wrap.append(title, grid);
    return wrap;
  }
  function focusNextRow() {
    if (window.matchMedia("(pointer:fine)").matches && active())
      $("entryGrid").querySelector("input")?.focus();
  }
  function requestReplace(action, force = null) {
    const hasDraft = Object.values(game.drafts || {}).some((row) =>
      row.some((value) => value.trim()),
    );
    if (force ?? (!game.done && (game.steps.length || hasDraft || game.mode === "challenge"))) {
      pendingReplace = action;
      openSecondary("confirmOverlay");
    } else action();
  }
  function render() {
    $("gaussDifficulty").value = String(game.difficulty || 1);
    $("gaussDifficulty").disabled = game.mode !== "practice";
    syncGrading();
    recordWork();
    const matrix = $("matrix");
    matrix.replaceChildren();
    matrix.style.setProperty("--cols", game.matrix[0].length);
    game.matrix.forEach((row, i) =>
      row.forEach((cell, j) => {
        const el = document.createElement("div");
        el.className =
          "matrix-cell" +
          (j === game.size ? " aug" : "") +
          (i === Number($("editRow").value) ? " current" : "");
        el.dataset.row = i;
        el.textContent = format(cell);
        el.title = "Välj rad " + (i + 1);
        matrix.append(el);
      }),
    );
    $("score").textContent = stats.score;
    $("stepCount").textContent = game.steps.length;
    $("historyCount").textContent = game.steps.length + " steg";
    $("history").replaceChildren();
    game.steps.forEach((step, index) => {
      const li = document.createElement("li");
      const detail = document.createElement("details"),
        summary = document.createElement("summary");
      summary.textContent = step;
      detail.append(summary);
      const before = game.history[index]?.matrix;
      const after = game.history[index + 1]?.matrix || game.matrix;
      if (before) detail.append(matrixSnapshot(before, "Före"));
      detail.append(matrixSnapshot(after, "Efter"));
      li.append(detail);
      $("history").append(li);
    });
    $("emptyHistory").hidden = game.steps.length > 0;
    $("undoButton").disabled = !game.history.length || !active();
    $("hintButton").disabled = !active();
    $("submitButton").disabled = !active();
    $("hearts").textContent = "♥ ".repeat(game.lives) + "♡ ".repeat(3 - game.lives);
    $("hearts").setAttribute("aria-label", game.lives + " av 3 liv kvar");
    $("roundInfo").textContent = "RUNDA " + game.round + " / 3";
    updateTimer();
    $("method").value = game.method;
    $("size").value = String(game.size);
    $("method").disabled = game.mode !== "practice";
    $("size").disabled = game.mode !== "practice";
    $("gameTitle").textContent =
      game.method === "solve" ? "Lös ekvationssystemet" : "Hitta inversen";
    $("matrixType").textContent = game.method === "solve" ? "[ A | b ]" : "[ A | I ]";
    $("goal").textContent =
      game.method === "solve"
        ? "Mål: få [ I | x ]. Lösningen står då till höger."
        : "Mål: få [ I | A⁻¹ ]. Inversen står då till höger.";
    $("roundLabel").textContent =
      game.mode === "challenge"
        ? `Tidskamp · runda ${game.round} av 3`
        : game.mode === "daily"
          ? `Dagens matris · ${game.date}`
          : game.mode === "custom"
            ? "Egen matris"
            : `Fri träning · uppgift ${game.taskNo}`;
    $("gameDescription").textContent =
      game.mode === "challenge"
        ? "Tre matriser. Tre liv. Sex minuter."
        : game.mode === "daily"
          ? "Samma uppgift för alla som spelar i dag. Slå ditt bästa antal steg."
          : game.mode === "custom"
            ? "Din matris, dina steg."
            : "Gör vänster sida till identitetsmatrisen I.";
    $("sessionInfo").textContent =
      game.mode === "challenge"
        ? "Tre rundor"
        : game.mode === "daily"
          ? "Ny matris varje dag"
          : game.mode === "custom"
            ? "Din uppgift"
            : "Ingen tidsgräns";
    $("challengeHud").hidden = game.mode !== "challenge";
    $("newButton").innerHTML =
      game.mode === "challenge"
        ? game.done && !game.over
          ? "Nästa runda"
          : "Starta om"
        : game.mode === "daily"
          ? "Börja om"
          : game.mode === "custom"
            ? "Börja om"
            : "Ny uppgift";
    document
      .querySelectorAll(".mode[data-mode]")
      .forEach((b) => b.classList.toggle("active", b.dataset.mode === game.mode));
  }
  function resetBoard(matrix) {
    recordWork();
    game.workId = window.WorkReview.id();
    game.review = null;
    game.matrix = clone(matrix);
    game.initial = clone(matrix);
    game.history = [];
    game.steps = [];
    game.hints = 0;
    game.hintLevel = 0;
    game.drafts = {};
    game.selectedRow = 0;
    game.mistakes = 0;
    game.done = false;
    game.over = false;
    wrongFields.clear();
    $("editRow").replaceChildren();
    for (let i = 0; i < game.size; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = "Rad " + (i + 1);
      $("editRow").append(option);
    }
    fillEntry();
    feedback("Välj en rad och skriv nästa rad.");
    render();
    save();
  }
  function practice(newTask = true) {
    stopTimer();
    game.mode = "practice";
    game.method = $("method").value;
    game.size = Number($("size").value);
    game.difficulty = Number($("gaussDifficulty").value) || 1;
    if (newTask) game.taskNo++;
    resetBoard(makePuzzle(game.size, game.method, Math.random, game.difficulty));
  }
  function challenge() {
    stopTimer();
    game.mode = "challenge";
    game.method = "solve";
    game.size = 2;
    game.round = 1;
    game.lives = 3;
    game.remaining = 360000;
    game.paused = false;
    game.over = false;
    challengeTask();
    startTimer();
  }
  function challengeTask() {
    game.size = game.round === 3 ? 3 : 2;
    game.method = game.round === 3 ? "inverse" : "solve";
    resetBoard(makePuzzle(game.size, game.method));
  }
  function daily() {
    stopTimer();
    game.mode = "daily";
    game.date = dateKey();
    const rng = seeded(hash(game.date));
    game.size = rng() < 0.67 ? 2 : 3;
    game.method = rng() < 0.67 ? "solve" : "inverse";
    resetBoard(makePuzzle(game.size, game.method, rng));
    const record = stats.daily[game.date];
    if (record) feedback("Dagens bästa: " + record.steps + " steg. Du kan försöka förbättra det.");
  }
  function custom(matrix, size, method) {
    stopTimer();
    game.mode = "custom";
    game.size = size;
    game.method = method;
    resetBoard(matrix);
  }
  function updateTimer() {
    const total = Math.max(0, Math.ceil(game.remaining / 1000));
    $("timer").textContent =
      String(Math.floor(total / 60)).padStart(2, "0") + ":" + String(total % 60).padStart(2, "0");
  }
  function startTimer() {
    clearInterval(timerId);
    game.deadline = Date.now() + game.remaining;
    timerId = setInterval(() => {
      if (game.mode !== "challenge" || game.paused || game.over) return;
      game.remaining = Math.max(0, game.deadline - Date.now());
      updateTimer();
      if (game.remaining <= 0) endChallenge(false);
    }, 200);
  }
  function stopTimer() {
    clearInterval(timerId);
    timerId = null;
    game.deadline = null;
    game.paused = false;
    $("pauseOverlay").hidden = true;
  }
  function pause(showOverlay = true) {
    if (game.mode !== "challenge" || game.over || game.paused) return;
    game.remaining = Math.max(0, game.deadline - Date.now());
    game.paused = true;
    clearInterval(timerId);
    timerId = null;
    if (showOverlay) $("pauseOverlay").hidden = false;
    render();
  }
  function resume() {
    if (game.mode !== "challenge" || !game.paused) return;
    $("pauseOverlay").hidden = true;
    game.paused = false;
    startTimer();
    render();
  }
  function solved() {
    return game.matrix.every((row, i) =>
      row.slice(0, game.size).every((x, j) => (i === j ? isOne(x) : isZero(x))),
    );
  }
  function outcome() {
    game.done = true;
    stats.solved++;
    stats.streak++;
    stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
    let earned = Math.max(20, 120 - game.steps.length * 7 - game.hints * 9 - game.mistakes * 5);
    if (game.mode === "challenge") earned += 35;
    if (game.mode === "daily") {
      const prior = stats.daily[game.date];
      if (prior && prior.steps <= game.steps.length) earned = 0;
      else stats.daily[game.date] = { steps: game.steps.length, date: game.date };
    }
    stats.score += earned;
    save();
    render();
    let result =
      game.method === "solve"
        ? game.matrix.map((r, i) => `x${i + 1} = ${format(r[game.size])}`).join("   ·   ")
        : game.matrix.map((r) => "[" + r.slice(game.size).map(format).join(", ") + "]").join(" ");
    feedback(
      "Löst! " + (earned ? "+" + earned + " poäng." : "Du förbättrade inte dagens rekord."),
      "win",
    );
    if (game.mode === "challenge" && game.round === 3) {
      endChallenge(true);
      return;
    }
    showResult(
      game.mode === "challenge" ? "RUNDA KLAR" : "UPPGIFT KLAR",
      game.mode === "challenge" ? `Runda ${game.round} av 3 avklarad.` : "Snyggt räknat.",
      `${game.steps.length} steg · ${game.hints} ledtrådar · ${earned} poäng`,
      result,
      game.mode === "challenge" ? "Nästa runda" : "Nästa uppgift",
      () => {
        if (game.mode === "challenge") {
          game.round++;
          challengeTask();
        } else if (game.mode === "daily") daily();
        else if (game.mode === "custom") resetBoard(game.initial);
        else practice();
      },
    );
  }
  function endChallenge(won) {
    if (game.over) return;
    game.over = true;
    game.done = true;
    clearInterval(timerId);
    timerId = null;
    if (won) {
      const used = Math.ceil((360000 - game.remaining) / 1000);
      stats.fastest = stats.fastest === null ? used : Math.min(stats.fastest, used);
    } else stats.streak = 0;
    save();
    render();
    feedback(won ? "Tre av tre lösta!" : "Tiden eller liven tog slut.", won ? "win" : "bad");
    showResult(
      "TIDSKAMP",
      won ? "Du klarade alla tre." : "Försök igen.",
      won
        ? `Tid kvar: ${$("timer").textContent} · ${game.lives} liv kvar.`
        : "Ta en ny runda och pröva en annan väg.",
      null,
      "Spela igen",
      challenge,
    );
  }
  function showResult(eyebrow, title, text, solution, label, callback) {
    $("resultEyebrow").textContent = eyebrow;
    $("resultTitle").textContent = title;
    $("resultText").textContent = text;
    $("resultSolution").hidden = !solution;
    if (solution) $("resultSolution").textContent = solution;
    $("resultNext").innerHTML = label + "";
    $("resultNext").onclick = () => {
      close("resultOverlay");
      callback();
    };
    open("resultOverlay");
  }
  function move(row, values) {
    const old = game.matrix[row];
    if (sameRow(values, old)) throw Error("Raden är oförändrad. Gör ett nytt steg.");
    for (let i = 0; i < game.size; i++)
      if (i !== row && sameRow(values, game.matrix[i]))
        return {
          label: `R${row + 1} ↔ R${i + 1}`,
          apply: () => {
            game.matrix[i] = old;
            game.matrix[row] = values;
          },
        };
    const f = ratio(values, old);
    if (
      f &&
      !isZero(f) &&
      !isOne(f) &&
      sameRow(
        values,
        old.map((x) => times(f, x)),
      )
    )
      return {
        label: `R${row + 1} ← ${format(f)}R${row + 1}`,
        apply: () => {
          game.matrix[row] = values;
        },
      };
    for (let i = 0; i < game.size; i++)
      if (i !== row) {
        const delta = values.map((x, j) => plus(x, negative(old[j]))),
          k = ratio(delta, game.matrix[i]);
        if (
          k &&
          !isZero(k) &&
          sameRow(
            delta,
            game.matrix[i].map((x) => times(k, x)),
          )
        )
          return {
            label: `R${row + 1} ← R${row + 1} + (${format(k)})R${i + 1}`,
            apply: () => {
              game.matrix[row] = values;
            },
          };
      }
    return null;
  }
  function audit() {
    const current = game.matrix;
    try {
      return game.history.map((entry, index) => {
        const after = game.history[index + 1]?.matrix || current;
        for (let row = 0; row < game.size; row++) {
          game.matrix = clone(entry.matrix);
          try {
            const step = move(row, after[row]);
            if (!step) continue;
            step.apply();
            if (game.matrix.every((r, i) => sameRow(r, after[i])))
              return { valid: true, label: step.label };
          } catch {}
        }
        return { valid: false, label: "Steget följer inte av en giltig radoperation." };
      });
    } finally {
      game.matrix = current;
    }
  }
  function recordWork() {
    if (!game.initial.length) return;
    game.workId ??= window.WorkReview.id();
    const fm = (m) => m.map((r) => r.map(format));
    window.WorkReview.record({
      id: game.workId,
      title:
        game.method === "solve"
          ? "Gausselimination · ekvationssystem"
          : "Gausselimination · invers",
      status: game.done ? "Avslutad" : game.review ? "Rättad · se stegen" : "Ej sluträttad",
      matrices: [
        { label: "Ursprunglig matris", values: fm(game.initial) },
        ...game.steps.map((label, i) => ({
          label: "Steg " + (i + 1) + " · " + label,
          values: fm(game.history[i + 1]?.matrix || game.matrix),
          note: game.review?.[i]
            ? game.review[i].valid
              ? "Giltigt steg · " + game.review[i].label
              : game.review[i].label
            : "",
        })),
      ],
    });
  }
  function syncGrading() {
    const auto = window.WorkReview.auto;
    $("submitButton").textContent = auto ? "Kontrollera raden" : "Spara raden";
    $("gradeGauss").disabled = !active() || !game.steps.length;
    $("hintButton").hidden = !auto;
  }
  function gradeAll() {
    if (!active()) return;
    game.review = audit();
    save();
    render();
    const bad = game.review.map((r, i) => (r.valid ? null : i + 1)).filter(Boolean);
    if (bad.length)
      feedback("Granska steg " + bad.join(", ") + ". Visa arbetet för att se rättningen.", "bad");
    else if (solved()) outcome();
    else feedback("Alla steg är giltiga. Vänster sida är ännu inte identitetsmatrisen.", "good");
  }
  $("gradeGauss").onclick = gradeAll;
  window.addEventListener("gradingchange", () => {
    wrongFields.clear();
    fillEntry();
    feedback("Inställningen är ändrad.");
    syncGrading();
  });
  function closest(row, values) {
    const old = game.matrix[row],
      candidates = [];
    for (let i = 0; i < game.size; i++)
      if (i !== row) {
        candidates.push(game.matrix[i]);
        const delta = values.map((x, j) => plus(x, negative(old[j]))),
          k = ratio(delta, game.matrix[i]);
        if (k && !isZero(k))
          candidates.push(old.map((x, j) => plus(x, times(k, game.matrix[i][j]))));
      }
    const f = ratio(values, old);
    if (f && !isZero(f)) candidates.push(old.map((x) => times(f, x)));
    if (!candidates.length) return 0;
    candidates.sort(
      (a, b) =>
        a.filter((x, j) => !equals(x, values[j])).length -
        b.filter((x, j) => !equals(x, values[j])).length,
    );
    wrongFields.clear();
    [...$("entryGrid").querySelectorAll("input")].forEach((input, j) => {
      const wrong = !equals(values[j], candidates[0][j]);
      input.classList.toggle("wrong", wrong);
      if (wrong) wrongFields.add(j);
    });
    return wrongFields.size;
  }
  function submit() {
    if (!active()) return;
    const inputs = [...$("entryGrid").querySelectorAll("input")];
    let values;
    try {
      values = inputs.map((x) => parse(x.value));
      if (values.some((x) => Math.abs(x[0]) > 100000 || x[1] > 10000))
        throw Error("Talen är för stora. Prova ett mindre steg.");
      inputs.forEach((x) => x.classList.remove("wrong"));
    } catch (e) {
      feedback(e.message, "bad");
      return;
    }
    const row = Number($("editRow").value);
    if (!window.WorkReview.auto) {
      const before = clone(game.matrix);
      let swap = -1;
      for (let i = 0; i < game.size; i++)
        if (i !== row && sameRow(values, game.matrix[i])) swap = i;
      if (swap >= 0) game.matrix[swap] = before[row];
      game.matrix[row] = values;
      const label = swap >= 0 ? `R${row + 1} ↔ R${swap + 1}` : `R${row + 1} uppdaterad`;
      game.history.push({ matrix: before, label });
      game.steps.push(label);
      game.review = null;
      game.drafts = {};
      feedback("Steg sparat.");
      render();
      fillEntry();
      save();
      focusNextRow();
      return;
    }
    let step;
    try {
      step = move(row, values);
    } catch (e) {
      feedback(e.message, "bad");
      return;
    }
    if (!step) {
      game.mistakes++;
      const wrong = closest(row, values);
      if (game.mode === "challenge") {
        game.lives--;
        if (game.lives <= 0) {
          endChallenge(false);
          return;
        }
      }
      render();
      feedback(
        `Raden följer inte av ett enda giltigt steg. ${wrong ? `Kontrollera ${wrong === 1 ? "det markerade fältet" : "de markerade fälten"}. Markeringen utgår från ett möjligt steg.` : "Granska raden igen."}${game.mode === "challenge" ? " Ett liv förlorat." : ""}`,
        "bad",
      );
      save();
      return;
    }
    game.review = null;
    game.history.push({ matrix: clone(game.matrix), label: step.label });
    step.apply();
    game.drafts ??= {};
    game.matrix.forEach((r, i) => {
      if (!sameRow(r, game.history[game.history.length - 1].matrix[i])) delete game.drafts[i];
    });
    game.steps.push(step.label);
    game.hintLevel = 0;
    feedback("Korrekt. " + step.label, "good");
    render();
    fillEntry();
    save();
    if (solved()) {
      game.review = audit();
      if (game.review.every((r) => r.valid)) outcome();
      else {
        save();
        render();
        feedback("Slutraden är klar. Rätta hela lösningen för att granska tidigare steg.");
      }
    } else focusNextRow();
  }
  function suggestion() {
    const n = game.size,
      m = game.matrix;
    for (let c = 0; c < n; c++) {
      if (m.every((row, r) => equals(row[c], frac(r === c ? 1 : 0)))) continue;
      const pivot = m[c][c];
      if (isZero(pivot)) {
        let source = m.findIndex((row, i) => i !== c && !isZero(row[c]));
        if (source >= 0)
          return {
            row: c,
            values: clone([m[source]])[0],
            label: `Byt R${c + 1} och R${source + 1}`,
            focus: `Sök en pivot i kolumn ${c + 1}.`,
          };
        continue;
      }
      if (!isOne(pivot)) {
        const f = frac(pivot[1], pivot[0]);
        return {
          row: c,
          values: m[c].map((x) => times(f, x)),
          label: `Multiplicera R${c + 1} med ${format(f)}`,
          focus: `Gör pivoten i R${c + 1} till 1.`,
        };
      }
      const r = m.findIndex((row, i) => i !== c && !isZero(row[c]));
      if (r >= 0) {
        const factor = negative(m[r][c]);
        return {
          row: r,
          values: m[r].map((x, j) => plus(x, times(factor, m[c][j]))),
          label: `Addera ${format(factor)}·R${c + 1} till R${r + 1}`,
          focus: `Nolla kolumn ${c + 1} i R${r + 1}.`,
        };
      }
    }
    return null;
  }
  function hint() {
    if (!active()) return;
    const s = suggestion();
    if (!s) {
      feedback("Kontrollera vänster sida. Den är nästan klar.");
      return;
    }
    game.hints++;
    game.hintLevel = Math.min(3, game.hintLevel + 1);
    if (game.hintLevel === 1) feedback("Ledtråd 1/3: " + s.focus);
    else if (game.hintLevel === 2) feedback("Ledtråd 2/3: " + s.label + ".");
    else {
      $("editRow").value = String(s.row);
      render();
      fillEntry();
      [...$("entryGrid").querySelectorAll("input")].forEach(
        (input, j) => (input.value = format(s.values[j])),
      );
      stashDraft();
      feedback("Ledtråd 3/3: Ett möjligt nästa steg är ifyllt. Kontrollera raden när du är redo.");
    }
    save();
  }
  function open(id) {
    modalReturn = document.activeElement;
    $(id).hidden = false;
    document.body.style.overflow = "hidden";
    const first = $(id).querySelector("button");
    first?.focus();
  }
  function close(id) {
    $(id).hidden = true;
    document.body.style.overflow = "";
    modalReturn?.focus();
    if (modalWasPaused && game.mode === "challenge" && game.paused) {
      modalWasPaused = false;
      resume();
    }
  }
  function openSecondary(id) {
    modalWasPaused = game.mode === "challenge" && !game.paused && !game.over;
    if (modalWasPaused) pause(false);
    open(id);
  }
  function buildCustom() {
    const size = Number($("customSize").value),
      method = $("customMethod").value,
      cols = size + (method === "solve" ? 1 : 0),
      grid = $("customGrid");
    grid.replaceChildren();
    grid.style.setProperty("--cols", cols);
    for (let i = 0; i < size; i++) {
      const row = document.createElement("div");
      row.className = "custom-row";
      row.style.setProperty("--cols", cols);
      for (let j = 0; j < cols; j++) {
        const input = document.createElement("input");
        input.inputMode = "text";
        input.placeholder = i === j ? "1" : "0";
        input.value = i === j ? "1" : "0";
        input.setAttribute("aria-label", `Rad ${i + 1}, kolumn ${j + 1}`);
        if (j === size) input.classList.add("aug-input");
        row.append(input);
      }
      grid.append(row);
    }
    $("customError").textContent = "";
  }
  function startCustom() {
    try {
      const size = Number($("customSize").value),
        method = $("customMethod").value;
      const rows = [...$("customGrid").querySelectorAll(".custom-row")].map((row) =>
        [...row.querySelectorAll("input")].map((input) => parse(input.value)),
      );
      const a = rows.map((row) => row.slice(0, size));
      if (rows.some((row) => row.some((x) => Math.abs(x[0]) > 1000 || x[1] > 1000)))
        throw Error("Använd mindre tal i den egna matrisen.");
      if (!invertible(a))
        throw Error("Koefficientmatrisen är inte inverterbar. Ändra något tal och försök igen.");
      if (a.every((row, i) => row.every((x, j) => equals(x, frac(i === j ? 1 : 0)))))
        throw Error("Vänster sida är redan I. Välj en matris som behöver reduceras.");
      const full =
        method === "inverse"
          ? a.map((r, i) => [
              ...r,
              ...Array.from({ length: size }, (_, j) => frac(i === j ? 1 : 0)),
            ])
          : rows;
      modalWasPaused = false;
      close("customOverlay");
      custom(full, size, method);
    } catch (e) {
      $("customError").textContent = e.message;
    }
  }
  function statsModal() {
    $("statSolved").textContent = stats.solved;
    $("statBest").textContent = stats.bestStreak;
    $("statChallenge").textContent =
      stats.fastest === null
        ? "—"
        : Math.floor(stats.fastest / 60) + ":" + String(stats.fastest % 60).padStart(2, "0");
    $("statDaily").textContent = stats.daily[dateKey()]?.steps ?? "—";
    openSecondary("statsOverlay");
  }
  function restore() {
    if (game.mode === "daily" && game.date !== dateKey()) {
      daily();
      return;
    }
    if (!Array.isArray(game.matrix) || !game.matrix.length) {
      game.taskNo = 0;
      practice();
      return;
    }
    if (!Array.isArray(game.initial) || !game.initial.length) {
      practice();
      return;
    }
    $("editRow").replaceChildren();
    for (let i = 0; i < game.size; i++) {
      const o = document.createElement("option");
      o.value = i;
      o.textContent = "Rad " + (i + 1);
      $("editRow").append(o);
    }
    $("editRow").value = String(game.selectedRow || 0);
    render();
    fillEntry();
    feedback(
      game.done ? "Uppgiften är löst. Välj en ny uppgift." : "Du fortsätter där du slutade.",
    );
    if (game.done) {
      $("submitButton").disabled = true;
      $("hintButton").disabled = true;
    }
  }

  $("submitButton").onclick = submit;
  $("hintButton").onclick = hint;
  $("undoButton").onclick = () => {
    if (!active() || !game.history.length) return;
    const last = game.history.pop();
    game.matrix = last.matrix;
    game.steps.pop();
    game.review = null;
    game.hintLevel = 0;
    game.drafts = {};
    feedback("Senaste steget ångrades.");
    render();
    fillEntry();
    save();
  };
  $("newButton").onclick = () =>
    requestReplace(() => {
      if (game.mode === "challenge") {
        if (game.done && !game.over) {
          game.round++;
          challengeTask();
        } else challenge();
      } else if (game.mode === "daily") daily();
      else if (game.mode === "custom") resetBoard(game.initial);
      else practice();
    });
  $("editRow").onchange = () => {
    render();
    fillEntry();
    save();
  };
  $("matrix").onclick = (e) => {
    const r = e.target.closest("[data-row]");
    if (!r || !active()) return;
    $("editRow").value = r.dataset.row;
    render();
    fillEntry();
    save();
    if (window.innerWidth < 761)
      $("entryGrid").scrollIntoView({ behavior: "smooth", block: "center" });
  };
  $("entryGrid").addEventListener("keydown", (e) => {
    const inputs = [...$("entryGrid").querySelectorAll("input")],
      index = inputs.indexOf(e.target);
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
    if (e.key === "ArrowRight" && index < inputs.length - 1) {
      e.preventDefault();
      inputs[index + 1].focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputs[index - 1].focus();
    }
  });
  document.querySelectorAll(".mode[data-mode]").forEach(
    (b) =>
      (b.onclick = () => {
        const m = b.dataset.mode;
        if (m === game.mode) return;
        requestReplace(() => {
          close("resultOverlay");
          if (m === "practice") practice();
          else if (m === "challenge") challenge();
          else daily();
        });
      }),
  );
  $("method").onchange = () => {
    const method = $("method").value;
    $("method").value = game.method;
    requestReplace(() => {
      $("method").value = method;
      practice();
    });
  };
  $("size").onchange = () => {
    const size = $("size").value;
    $("size").value = String(game.size);
    requestReplace(() => {
      $("size").value = size;
      practice();
    });
  };
  $("pauseButton").onclick = () => pause();
  $("resumeButton").onclick = resume;
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && game.mode === "challenge" && !game.paused && !game.over) pause();
  });
  $("customButton").onclick = () =>
    requestReplace(() => {
      buildCustom();
      openSecondary("customOverlay");
    });
  $("customMethod").onchange = buildCustom;
  $("customSize").onchange = buildCustom;
  $("startCustom").onclick = startCustom;
  $("customClose").onclick = () => close("customOverlay");
  $("helpButton").onclick = () => openSecondary("helpOverlay");
  $("helpClose").onclick = $("helpDone").onclick = () => close("helpOverlay");
  $("statsButton").onclick = statsModal;
  $("statsClose").onclick = $("statsDone").onclick = () => close("statsOverlay");
  $("resultClose").onclick = () => close("resultOverlay");
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    for (const id of [
      "confirmOverlay",
      "helpOverlay",
      "statsOverlay",
      "customOverlay",
      "resultOverlay",
    ])
      if (!$(id).hidden) {
        close(id);
        return;
      }
  });
  $("cancelReplace").onclick = () => {
    pendingReplace = null;
    close("confirmOverlay");
  };
  $("confirmReplace").onclick = () => {
    const action = pendingReplace;
    pendingReplace = null;
    close("confirmOverlay");
    action?.();
  };
  $("entryGrid").addEventListener("input", stashDraft);
  $("entryGrid").addEventListener("focusin", (event) => {
    lastInputIndex = [...$("entryGrid").querySelectorAll("input")].indexOf(event.target);
  });
  function insertSymbol(symbol) {
    if (!active()) return;
    const inputs = [...$("entryGrid").querySelectorAll("input")],
      input = inputs[Math.max(0, lastInputIndex)];
    if (!input) return;
    const start = input.selectionStart ?? input.value.length,
      end = input.selectionEnd ?? start;
    input.value = input.value.slice(0, start) + symbol + input.value.slice(end);
    input.focus();
    input.setSelectionRange(start + 1, start + 1);
    input.classList.remove("wrong");
    stashDraft();
  }
  for (const id of ["minusKey", "fractionKey", "nextField"])
    $(id).addEventListener("pointerdown", (event) => event.preventDefault());
  $("minusKey").onclick = () => insertSymbol("-");
  $("fractionKey").onclick = () => insertSymbol("/");
  $("nextField").onclick = () => {
    const inputs = [...$("entryGrid").querySelectorAll("input")];
    inputs[(Math.max(0, lastInputIndex) + 1) % inputs.length]?.focus();
  };
  if (document.modelContext?.registerTool) {
    const register = (name, description, properties, required, execute) => {
      try {
        Promise.resolve(
          document.modelContext.registerTool({
            name,
            title: description,
            description,
            inputSchema: { type: "object", properties, required, additionalProperties: false },
            annotations: { readOnlyHint: false },
            execute,
          }),
        ).catch(() => {});
      } catch {}
    };
    register(
      "start_gauss_problem",
      "Starta en ny Gaussuppgift",
      {
        method: { type: "string", enum: ["solve", "inverse"] },
        size: { type: "integer", enum: [2, 3] },
      },
      ["method", "size"],
      ({ method, size }) => {
        if (!["solve", "inverse"].includes(method) || ![2, 3].includes(size))
          throw Error("Ogiltigt läge eller storlek");
        $("method").value = method;
        $("size").value = String(size);
        practice();
        return { matrix: game.matrix.map((r) => r.map(format)), method, size };
      },
    );
    register(
      "submit_gauss_row",
      "Skriv in en ny matrisrad",
      { row: { type: "integer" }, values: { type: "array", items: { type: "string" } } },
      ["row", "values"],
      ({ row, values }) => {
        if (
          !Number.isInteger(row) ||
          row < 1 ||
          row > game.size ||
          !Array.isArray(values) ||
          values.length !== game.matrix[0].length ||
          !values.every((v) => typeof v === "string")
        )
          throw Error("Ogiltig rad");
        $("editRow").value = String(row - 1);
        render();
        fillEntry();
        [...$("entryGrid").querySelectorAll("input")].forEach(
          (input, i) => (input.value = values[i]),
        );
        const before = game.steps.length;
        submit();
        return {
          accepted: game.steps.length > before,
          feedback: $("feedback").textContent,
          matrix: game.matrix.map((r) => r.map(format)),
          complete: game.done,
        };
      },
    );
  }
  window.GaussMath = { frac, plus, times, parse, equals, format, det };
  $("gaussDifficulty").onchange = () => {
    const value = $("gaussDifficulty").value;
    $("gaussDifficulty").value = String(game.difficulty || 1);
    requestReplace(() => {
      $("gaussDifficulty").value = value;
      practice();
    });
  };
  window.GaussGame = {
    startBeginner: () =>
      requestReplace(() => {
        $("method").value = "solve";
        $("size").value = "2";
        $("gaussDifficulty").value = "1";
        practice();
        $("beginnerExample").open = true;
      }),
    get paused() {
      return game.paused;
    },
    requestReplace,
    pause: () => pause(false),
    resume,
    refresh: render,
    addPoints: (points) => {
      stats.score += points;
      stats.solved++;
      save();
      render();
    },
  };
  restore();
})();
