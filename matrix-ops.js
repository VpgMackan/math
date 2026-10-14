(() => {
  "use strict";
  const $ = (id) => document.getElementById(id),
    math = window.GaussMath;
  const kinds = ["multiply", "add", "subtract", "scale", "transpose", "determinant"];
  const titles = {
    multiply: "Matrismultiplikation",
    add: "Matrisaddition",
    subtract: "Matrissubtraktion",
    scale: "Skalärmultiplikation",
    transpose: "Transponering",
    determinant: "Determinanter",
  };
  const rules = {
    multiply:
      "För AB måste antalet kolumner i A vara lika med antalet rader i B. Elementet på rad i och kolumn j är skalärprodukten av rad i i A och kolumn j i B. Ordningen spelar roll: AB är i allmänhet inte samma som BA.",
    add: "Addition kräver matriser med samma storlek. Addera elementen som har samma rad och kolumn.",
    subtract:
      "Subtraktion kräver matriser med samma storlek. Subtrahera elementet i B från motsvarande element i A. Var uppmärksam på negativa tal.",
    scale: "Multiplicera varje element i A med skalären k. Matrisens storlek förändras inte.",
    transpose:
      "Byt plats på rader och kolumner. Elementet på plats (i, j) i A hamnar på plats (j, i) i Aᵀ.",
    determinant:
      "Determinanten är ett tal och beräknas för kvadratiska matriser. För 2 × 2 gäller ad − bc. För 3 × 3 kan du utveckla längs en rad. Determinanten noll betyder att matrisen saknar invers.",
  };
  const instructions = {
    multiply: "Beräkna A · B. Multiplicera rader i A med kolumner i B.",
    add: "Beräkna A + B, ett element i taget.",
    subtract: "Beräkna A − B, ett element i taget.",
    scale: "Multiplicera varje element i A med k.",
    transpose: "Byt plats på raderna och kolumnerna i A.",
    determinant: "Beräkna det(A). Svaret är ett tal.",
  };
  function multiply(a, b) {
    if (a[0].length !== b.length) throw Error("Incompatible dimensions");
    return a.map((row) => b[0].map((_, j) => row.reduce((sum, x, k) => sum + x * b[k][j], 0)));
  }
  function calculate(kind, a, b, k) {
    if (kind === "multiply") return multiply(a, b);
    if (kind === "add") return a.map((r, i) => r.map((v, j) => v + b[i][j]));
    if (kind === "subtract") return a.map((r, i) => r.map((v, j) => v - b[i][j]));
    if (kind === "scale") return a.map((r) => r.map((v) => k * v));
    if (kind === "transpose") return a[0].map((_, j) => a.map((r) => r[j]));
    if (kind === "determinant") return [[math.det(a)]];
    throw Error("Unknown operation");
  }
  const random = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const matrix = (rows, cols) => {
    const level = Number($("opsDifficulty").value) || 2;
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () =>
        random(level === 1 ? 0 : level === 3 ? -9 : -4, level === 1 ? 3 : level === 3 ? 9 : 4),
      ),
    );
  };
  let task = null,
    hints = new Set(),
    solved = false,
    attempts = 0,
    visibleTopic = "gauss";
  const helpList = $("helpOverlay").querySelector(".help-list"),
    helpExtra = $("helpOverlay").querySelector(".help-extra"),
    originalHelp = {
      title: $("helpTitle").textContent,
      list: helpList.innerHTML,
      extra: helpExtra.textContent,
    };
  function setHelp() {
    if (visibleTopic === "math5") {
      window.Math5?.setHelp();
      return;
    }
    if (visibleTopic === "gauss") {
      $("helpTitle").textContent = originalHelp.title;
      helpList.innerHTML = originalHelp.list;
      helpExtra.textContent = originalHelp.extra;
      return;
    }
    $("helpTitle").textContent = "Beräkna resultatet";
    helpList.replaceChildren();
    [
      "Välj operation och matrisstorlek. Blandade uppgifter växlar mellan sex operationer.",
      "Fyll i hela resultatmatrisen eller determinantens värde. Enter kontrollerar svaret.",
      "Kontrollera de markerade elementen. Visa beräkning för ett valt element om du behöver hjälp.",
    ].forEach((text, i) => {
      const row = document.createElement("div"),
        num = document.createElement("b"),
        p = document.createElement("p");
      num.textContent = "0" + (i + 1);
      p.textContent = text;
      row.append(num, p);
      helpList.append(row);
    });
    helpExtra.textContent =
      "Varje korrekt löst uppgift ger poäng. Visade beräkningar och extra försök minskar poängen.";
  }
  function changed() {
    return (
      !solved && [...$("opsAnswer").querySelectorAll("input")].some((input) => input.value.trim())
    );
  }
  function approve(action) {
    window.GaussGame.requestReplace(action, changed());
  }
  function makeTask() {
    recordWork();
    let kind = $("operation").value;
    if (kind === "mixed") {
      const options =
        Number($("opsDifficulty").value) === 1 ? ["add", "scale", "transpose", "multiply"] : kinds;
      kind = options[random(0, options.length - 1)];
    }
    const size = $("opsSize").value;
    let r = size === "3" ? 3 : 2,
      c = r,
      t = r;
    if (size === "rect" && kind !== "determinant") {
      r = random(2, 3);
      c = r === 2 ? 3 : 2;
      t = random(2, 3);
    }
    const a = matrix(r, c),
      b = kind === "multiply" ? matrix(c, t) : matrix(r, c);
    let k = 0;
    while (k === 0 || k === 1)
      k = random(
        Number($("opsDifficulty").value) === 1 ? 2 : -4,
        Number($("opsDifficulty").value) === 3 ? 9 : 4,
      );
    task = {
      id: window.WorkReview.id(),
      work: [],
      kind,
      a,
      b,
      k,
      difficulty: Number($("opsDifficulty").value) || 2,
      selection: $("operation").value,
      size: $("opsSize").value,
      answer: calculate(kind, a, b, k),
    };
    hints.clear();
    solved = false;
    attempts = 0;
    render();
  }
  function operand(data, label) {
    const wrap = document.createElement("section"),
      heading = document.createElement("h2"),
      grid = document.createElement("div");
    wrap.className = "operand";
    heading.textContent = label + " · " + data.length + " × " + data[0].length;
    grid.className = "matrix";
    grid.style.setProperty("--cols", data[0].length);
    data.forEach((row) =>
      row.forEach((value) => {
        const cell = document.createElement("div");
        cell.className = "matrix-cell";
        cell.textContent = value;
        grid.append(cell);
      }),
    );
    wrap.append(heading, grid);
    return wrap;
  }
  function render() {
    syncGrading();
    const { kind, a, b, k, answer } = task;
    $("opsTitle").textContent = titles[kind];
    $("opsInstruction").textContent = instructions[kind];
    $("operationRule").textContent = rules[kind];
    $("operands").replaceChildren(operand(a, "A"));
    if (["multiply", "add", "subtract"].includes(kind)) $("operands").append(operand(b, "B"));
    if (kind === "scale") {
      const span = document.createElement("p");
      span.textContent = "k = " + k;
      $("operands").append(span);
    }
    const scalar = kind === "determinant";
    $("dimensionNote").textContent =
      kind === "multiply"
        ? `A: ${a.length} × ${a[0].length} · B: ${b.length} × ${b[0].length} → AB: ${answer.length} × ${answer[0].length}`
        : scalar
          ? "Determinanten är ett tal."
          : "Resultatets storlek: " + answer.length + " × " + answer[0].length;
    $("answerLabel").textContent = scalar ? "Din determinant" : "Din resultatmatris";
    $("answerInstruction").textContent = scalar
      ? "Skriv determinantens värde."
      : "Fyll i varje element. Heltal och bråk fungerar.";
    $("opsAnswer").replaceChildren();
    $("opsAnswer").style.setProperty("--cols", answer[0].length);
    answer.forEach((row, i) =>
      row.forEach((_, j) => {
        const input = document.createElement("input");
        input.type = "text";
        input.inputMode = "text";
        input.autocomplete = "off";
        input.placeholder = "·";
        input.setAttribute(
          "aria-label",
          scalar ? "Determinant" : "Svar rad " + (i + 1) + ", kolumn " + (j + 1),
        );
        $("opsAnswer").append(input);
      }),
    );
    $("opsFeedback").textContent = "";
    $("opsFeedback").className = "feedback";
    $("calculationPanel").hidden = true;
    $("checkOperation").disabled = false;
    $("explainCell").replaceChildren();
    answer.forEach((row, i) =>
      row.forEach((_, j) => {
        const option = document.createElement("option");
        option.value = i + "," + j;
        option.textContent = scalar ? "det(A)" : `(${i + 1}, ${j + 1})`;
        $("explainCell").append(option);
      }),
    );
    const rect = $("opsSize").querySelector('option[value="rect"]');
    rect.disabled = $("operation").value === "determinant";
  }
  function check(force = false) {
    if (solved) return;
    const inputs = [...$("opsAnswer").querySelectorAll("input")];
    let values;
    try {
      values = inputs.map((input) => math.parse(input.value));
    } catch (error) {
      $("opsFeedback").className = "feedback bad";
      $("opsFeedback").textContent = error.message;
      return;
    }
    const width = task.answer[0].length,
      answerValues = task.answer.map((r, i) => r.map((_, j) => math.format(values[i * width + j])));
    if (!force || JSON.stringify(task.work.at(-1)?.values) !== JSON.stringify(answerValues)) {
      attempts++;
      task.work.push({ label: "Svar " + attempts, values: answerValues });
    }
    if (!window.WorkReview.auto && !force) {
      task.work.at(-1).note = "";
      $("opsFeedback").className = "feedback";
      $("opsFeedback").textContent = "Svar sparat. Rätta när du är klar.";
      recordWork();
      return;
    }
    let correct = 0;
    task.answer.flat().forEach((value, index) => {
      const ok = math.equals(values[index], math.frac(value));
      inputs[index].classList.toggle("wrong", !ok);
      inputs[index].classList.toggle("correct", ok);
      if (ok) correct++;
    });
    if (correct === inputs.length) {
      solved = true;
      const earned = Math.max(10, 60 - (attempts - 1) * 5 - hints.size * 7);
      window.GaussGame.addPoints(earned);
      $("opsFeedback").className = "feedback good";
      $("opsFeedback").textContent =
        "Rätt! +" + earned + " poäng. Välj Ny uppgift för att fortsätta.";
      $("checkOperation").disabled = true;
      $("gradeOps").disabled = true;
    } else {
      $("opsFeedback").className = "feedback bad";
      $("opsFeedback").textContent =
        correct + " av " + inputs.length + " element stämmer. Kontrollera de markerade fälten.";
    }
    task.work.at(-1).note = correct + " av " + inputs.length + " element rätt";
    recordWork();
  }
  function recordWork() {
    if (!task || !task.work.length) return;
    const matrices = [{ label: "A", values: task.a }];
    if (["multiply", "add", "subtract"].includes(task.kind))
      matrices.push({ label: "B", values: task.b });
    window.WorkReview.record({
      id: task.id,
      title: titles[task.kind] + (task.kind === "scale" ? " · k = " + task.k : ""),
      status: solved ? "Löst" : "Pågående",
      matrices: [...matrices, ...task.work],
    });
  }
  function syncGrading() {
    const auto = window.WorkReview.auto;
    $("checkOperation").textContent = auto ? "Kontrollera svaret" : "Spara svar";
    $("opsHint").hidden = !auto;
    if (!auto) $("calculationPanel").hidden = true;
    $("gradeOps").disabled = solved;
  }
  window.addEventListener("gradingchange", () => {
    document
      .querySelectorAll("#opsAnswer input")
      .forEach((x) => x.classList.remove("wrong", "correct"));
    $("opsFeedback").textContent = "";
    $("opsFeedback").className = "feedback";
    syncGrading();
  });
  function explanation(i, j) {
    const { kind, a, b, k, answer } = task;
    const p = (x) => "(" + x + ")";
    if (kind === "multiply")
      return (
        `Rad ${i + 1} i A × kolumn ${j + 1} i B: ` +
        a[i].map((v, l) => p(v) + " × " + p(b[l][j])).join(" + ") +
        " = " +
        answer[i][j]
      );
    if (kind === "add" || kind === "subtract")
      return p(a[i][j]) + (kind === "add" ? " + " : " − ") + p(b[i][j]) + " = " + answer[i][j];
    if (kind === "scale") return p(k) + " × " + p(a[i][j]) + " = " + answer[i][j];
    if (kind === "transpose") return `Aᵀ(${i + 1}, ${j + 1}) = A(${j + 1}, ${i + 1}) = ${a[j][i]}`;
    if (a.length === 2)
      return (
        p(a[0][0]) +
        " × " +
        p(a[1][1]) +
        " − " +
        p(a[0][1]) +
        " × " +
        p(a[1][0]) +
        " = " +
        answer[0][0]
      );
    return (
      a[0]
        .map(
          (v, col) =>
            (col === 1 ? "− " : col === 2 ? "+ " : "") +
            p(v) +
            " × " +
            p(math.det(a.slice(1).map((row) => row.filter((_, c) => c !== col)))),
        )
        .join(" ") +
      " = " +
      answer[0][0] +
      " (utveckling längs första raden)"
    );
  }
  function explain() {
    const [i, j] = $("explainCell").value.split(",").map(Number);
    hints.add(i + "," + j);
    $("cellCalculation").textContent = explanation(i, j);
    $("calculationPanel").hidden = false;
  }
  $("opsHint").onclick = explain;
  $("explainCell").onchange = explain;
  $("checkOperation").onclick = () => check();
  $("gradeOps").onclick = () => check(true);
  $("opsNext").onclick = () => approve(makeTask);
  $("operation").onchange = () => {
    const value = $("operation").value;
    $("operation").value = task.selection || task.kind;
    approve(() => {
      $("operation").value = value;
      if (value === "determinant" && $("opsSize").value === "rect") $("opsSize").value = "2";
      makeTask();
      task.selection = value;
    });
  };
  $("opsSize").onchange = () => {
    const value = $("opsSize").value;
    $("opsSize").value = task.size || "2";
    approve(() => {
      $("opsSize").value = value;
      makeTask();
      task.size = value;
    });
  };
  $("opsAnswer").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      check();
    }
  });
  $("topic").onchange = () => {
    const next = $("topic").value;
    $("topic").value = visibleTopic;
    const action = () => {
      visibleTopic = next;
      $("topic").value = next;
      $("gaussSurface").hidden = next !== "gauss";
      $("operationsSurface").hidden = next !== "operations";
      $("math5Surface").hidden = next !== "math5";
      setHelp();
      if (next !== "math5") {
        window.BeginnerGuide?.setArea(next);
        $("beginnerStart").hidden = false;
      }
      if (next === "math5") {
        window.GaussGame.pause();
        window.Math5?.enter();
      } else if (next === "operations") {
        window.GaussGame.pause();
        if (!task) makeTask();
      } else {
        window.GaussGame.resume();
        window.GaussGame.refresh();
      }
    };
    action();
  };
  $("opsDifficulty").onchange = () => {
    const value = $("opsDifficulty").value;
    $("opsDifficulty").value = String(task?.difficulty || 2);
    approve(() => {
      $("opsDifficulty").value = value;
      makeTask();
    });
  };
  window.MatrixOps = {
    startBeginner: () =>
      approve(() => {
        $("opsDifficulty").value = "1";
        $("opsSize").value = "2";
        $("operation").value = "add";
        makeTask();
        $("beginnerExample").open = true;
      }),
    multiply,
    calculate,
    explanation,
  };
})();
