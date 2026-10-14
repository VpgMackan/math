(() => {
  "use strict";
  const $ = (id) => document.getElementById(id),
    E = window.Math5Engine,
    C = E.categories,
    key = "gausskamp-math5-v1";
  let state = {
    category: "combinatorics",
    kind: "mixed",
    level: 1,
    version: 2,
    task: null,
    number: 0,
    progress: {},
    test: null,
    retry: [],
  };
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    if (saved && C[saved.category]) state = { ...state, ...saved, version: saved.version || 1 };
    if (state.task && !C[state.task.category]?.types[state.task.type]) state.task = null;
  } catch {}
  // Preserve old exercises and translate the former three-level preference.
  if (state.version !== 2) {
    const map = { 1: 2, 2: 3, 3: 4 };
    state.level = map[state.level] || 1;
    if (state.task) state.task.level = map[state.task.level] || state.level;
    if (state.test) state.test.tasks.forEach((t) => (t.level = map[t.level] || state.level));
    state.version = 2;
  }
  state.level = Math.max(1, Math.min(5, Number(state.level) || 1));
  function ensureKind() {
    if (state.kind !== "mixed" && (E.minimum[state.category][state.kind] || 1) > state.level)
      state.kind = "mixed";
  }
  ensureKind();
  persist();
  function persist() {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }
  function fresh(category = state.category, kind = state.kind) {
    const task = E.generate(category, kind, state.level);
    return {
      ...task,
      id: window.WorkReview.id(),
      draft: task.fields.map(() => ""),
      notes: "",
      submissions: [],
      grade: null,
      solved: false,
      hinted: false,
      solutionSeen: false,
      credited: false,
    };
  }
  const testing = () => !!state.test && !state.test.graded;
  function dirty() {
    return (
      !!state.task &&
      !state.task.solved &&
      (state.task.draft.some((x) => x.trim()) ||
        state.task.notes.trim() ||
        state.task.submissions.length)
    );
  }
  function capture() {
    if (!state.task) return;
    const fields = [...$("m5Fields").querySelectorAll("input")];
    if (fields.length === state.task.fields.length) state.task.draft = fields.map((x) => x.value);
    state.task.notes = $("m5Notes").value;
    persist();
  }
  function saveReport(task = state.task) {
    if (
      !task ||
      (!task.submissions.length && !task.notes.trim() && !task.draft.some((x) => x.trim()))
    )
      return;
    const texts = [
      {
        label: "Uppgift",
        text: task.prompt + (task.context.length ? "\n" + task.context.join("\n") : ""),
      },
    ];
    if (task.notes.trim()) texts.push({ label: "Mellanled och resonemang", text: task.notes });
    task.submissions.forEach((submission, i) => {
      texts.push({
        label: "Svar " + (i + 1),
        text:
          task.fields.map((f, j) => f.label + ": " + submission.values[j]).join("\n") +
          (submission.grade
            ? "\nRättning: " +
              submission.grade
                .map((ok, j) => task.fields[j].label + ": " + (ok ? "rätt" : "granska"))
                .join(" · ")
            : ""),
      });
    });
    if (!task.submissions.length && task.draft.some((x) => x.trim()))
      texts.push({
        label: "Påbörjat svar",
        text: task.fields.map((f, i) => f.label + ": " + (task.draft[i] || "—")).join("\n"),
      });
    if (task.solutionSeen) texts.push({ label: "Lösningsförslag", text: task.solution.join("\n") });
    if (task.reasoning)
      texts.push({
        label: "Bevis",
        text: "Automatisk rättning gäller kontrollpunkterna. Det skrivna resonemanget bedöms av användaren.",
      });
    window.WorkReview.record({
      id: task.id,
      title: "Matematik 5 · " + C[task.category].title + " · " + task.title,
      status: task.solved
        ? task.reasoning
          ? "Kontrollpunkter klara · bevis bedöms själv"
          : "Löst"
        : task.grade
          ? "Rättat · fortsätt öva"
          : "Ej rättat",
      texts,
      matrices: [],
    });
  }
  function options() {
    const select = $("m5Kind");
    select.replaceChildren();
    [["mixed", "Blandade övningar"], ...Object.entries(C[state.category].types)].forEach(
      ([value, title]) => {
        const option = document.createElement("option");
        option.value = value;
        const minimum = E.minimum[state.category][value] || 1;
        option.textContent =
          title + (value !== "mixed" && minimum > state.level ? " · från nivå " + minimum : "");
        option.disabled = value !== "mixed" && minimum > state.level;
        select.append(option);
      },
    );
    select.value = state.kind;
    $("m5Level").value = String(state.level);
  }
  function changeCategory(id) {
    if (testing()) return;
    capture();
    window.GaussGame.requestReplace(() => {
      saveReport();
      state.category = id;
      state.kind = "mixed";
      state.retry = [];
      state.test = null;
      state.task = fresh();
      state.number++;
      persist();
      options();
      render();
    }, dirty());
  }
  function topics() {
    const area = $("m5Area");
    area.replaceChildren();
    Object.entries(C).forEach(([id, cat]) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = cat.title;
      area.append(option);
    });
    area.value = state.category;
    const root = $("m5Topics");
    root.replaceChildren();
    Object.entries(C).forEach(([id, cat]) => {
      const button = document.createElement("button"),
        title = document.createElement("strong"),
        sub = document.createElement("span");
      button.className = "course-topic" + (state.category === id ? " selected" : "");
      button.setAttribute("aria-pressed", String(state.category === id));
      title.textContent = cat.title;
      const p = state.progress[id];
      sub.textContent = p?.solved ? p.solved + " lösta · " + cat.desc : cat.desc;
      button.append(title, sub);
      button.onclick = () => changeCategory(id);
      root.append(button);
    });
  }
  function message(text, type = "") {
    $("m5Feedback").textContent = text;
    $("m5Feedback").className = "feedback" + (type ? " " + type : "");
  }
  function diagram(task) {
    const root = $("m5Diagram");
    root.replaceChildren();
    root.hidden = !task.graph && !task.setData;
    if (root.hidden) return;
    const ns = "http://www.w3.org/2000/svg",
      svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 360 190");
    svg.setAttribute("role", "img");
    const title = document.createElementNS(ns, "title");
    title.textContent = task.graph
      ? "Oriktad graf med kantvikter"
      : "Mängderna A och B i universalmängden U";
    svg.append(title);
    const el = (tag, attrs, text) => {
      const e = document.createElementNS(ns, tag);
      Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
      if (text !== undefined) e.textContent = text;
      svg.append(e);
      return e;
    };
    if (task.graph) {
      const pos = { A: [40, 95], B: [180, 30], C: [180, 160], D: [320, 95] };
      task.graph.edges.forEach(([a, b, w]) => {
        const [x1, y1] = pos[a],
          [x2, y2] = pos[b];
        el("line", { x1, y1, x2, y2, stroke: "#999", "stroke-width": 1.5 });
        el("rect", {
          x: (x1 + x2) / 2 - 12,
          y: (y1 + y2) / 2 - 13,
          width: 24,
          height: 24,
          fill: "white",
        });
        el(
          "text",
          { x: (x1 + x2) / 2, y: (y1 + y2) / 2 + 5, "text-anchor": "middle", fill: "#242424" },
          w,
        );
      });
      Object.entries(pos).forEach(([name, [cx, cy]]) => {
        el("circle", { cx, cy, r: 17, fill: "#fff", stroke: "#242424", "stroke-width": 1.5 });
        el("text", { x: cx, y: cy + 5, "text-anchor": "middle" }, name);
      });
    } else {
      el("rect", { x: 8, y: 8, width: 344, height: 174, rx: 5, fill: "#fff", stroke: "#ddd" });
      el("circle", {
        cx: 142,
        cy: 99,
        r: 62,
        fill: "#fafafa",
        stroke: "#888",
        "fill-opacity": 0.5,
      });
      el("circle", {
        cx: 218,
        cy: 99,
        r: 62,
        fill: "#fafafa",
        stroke: "#888",
        "fill-opacity": 0.5,
      });
      el("text", { x: 25, y: 32 }, "U");
      el("text", { x: 113, y: 100 }, "A");
      el("text", { x: 237, y: 100 }, "B");
    }
    root.append(svg);
  }
  function controls() {
    const test = testing(),
      complete = test && state.test.index >= state.test.tasks.length,
      task = state.task;
    $("m5Submit").textContent = test
      ? "Spara och fortsätt"
      : window.WorkReview.auto
        ? "Kontrollera svaret"
        : "Spara svar";
    $("m5Submit").disabled = !!task?.solved || complete;
    $("m5Grade").hidden = test || window.WorkReview.auto;
    $("m5Grade").disabled = !!task?.solved;
    $("m5Hint").hidden = test || !window.WorkReview.auto;
    $("m5Reference").hidden = test;
    $("beginnerStart").hidden = test || !!state.test?.graded;
    $("m5AreaChooser").hidden = test;
    $("m5Kind").disabled = test;
    $("m5Level").disabled = test;
    $("m5Next").hidden = test;
    $("m5Next").textContent = task?.solved ? "Nästa uppgift" : "Byt uppgift";
    $("m5SolutionButton").hidden = test || !task?.grade;
    $("m5StartTest").hidden = test;
    $("m5Topics").hidden = test;
    $("m5Area").parentElement.hidden = test;
    $("m5TestBar").hidden = !test;
    $("m5TaskNumber").textContent = test
      ? "Uppgift " + Math.min(state.test.index + 1, 10) + " / 10"
      : "Uppgift " + state.number;
    $("m5TestProgress").textContent = Math.min(state.test?.index || 0, 10) + " av 10 sparade";
    $("m5Workspace").hidden = complete || !!state.test?.graded;
    $("m5TestSummary").hidden = !complete && !state.test?.graded;
    $("m5Solution").hidden = !task?.solutionSeen || test || !!state.test?.graded;
    $("m5HintText").hidden = !task?.hinted || test || !window.WorkReview.auto;
  }
  function render() {
    ensureKind();
    if (!state.task) {
      state.task = fresh();
      state.number++;
      persist();
    }
    const task = state.task;
    window.BeginnerGuide?.setArea(task.category);
    topics();
    options();
    $("m5LevelDescription").textContent =
      E.levels[task.level]?.description || E.levels[state.level].description;
    $("m5CategoryLabel").textContent = C[task.category].title;
    $("m5QuestionTitle").textContent = task.title;
    $("m5Prompt").textContent = task.prompt;
    $("m5Rule").textContent = C[task.category].rule;
    $("m5Context").replaceChildren();
    task.context.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      $("m5Context").append(p);
    });
    diagram(task);
    $("m5Fields").replaceChildren();
    task.fields.forEach((field, index) => {
      const label = document.createElement("label"),
        span = document.createElement("span"),
        input = document.createElement("input");
      span.textContent = field.label;
      input.type = "text";
      input.inputMode = field.type === "number" ? "decimal" : "text";
      input.autocomplete = "off";
      input.spellcheck = false;
      input.value = task.draft[index] || "";
      input.disabled = task.solved;
      input.placeholder =
        field.type === "set"
          ? "{1, 2, 3} eller ∅"
          : field.type === "digits"
            ? "Skriv siffrorna"
            : "Tal eller bråk";
      if (task.grade && !testing()) input.className = task.grade[index] ? "correct" : "wrong";
      input.oninput = () => {
        task.draft[index] = input.value;
        task.grade = null;
        task.solutionSeen = false;
        document
          .querySelectorAll("#m5Fields input")
          .forEach((x) => x.classList.remove("wrong", "correct"));
        $("m5Fields")
          .querySelectorAll("small")
          .forEach((x) => (x.textContent = ""));
        message("");
        controls();
        persist();
      };
      input.onkeydown = (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          submit();
        }
      };
      label.append(span, input);
      if (task.grade && !testing()) {
        const status = document.createElement("small");
        status.className = "m5-field-status";
        status.textContent = task.grade[index] ? "Stämmer" : "Kontrollera det här svaret";
        label.append(status);
      }
      $("m5Fields").append(label);
    });
    $("m5Notes").value = task.notes;
    $("m5Notebook").open = task.reasoning || !!task.notes;
    $("m5AnswerInstruction").textContent = task.reasoning
      ? "Kontrollpunkter till ditt bevis. Skriv resonemanget under Mellanled."
      : task.fields.some((f) => f.type === "set")
        ? "Mängder: {1, 2, 3}. Tom mängd: ∅. Ordningen spelar ingen roll."
        : "Heltal, decimaler och bråk fungerar. Decimal med komma eller punkt.";
    $("m5HintText").textContent = task.hint;
    $("m5SolutionSteps").replaceChildren();
    task.solution.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      $("m5SolutionSteps").append(li);
    });
    $("m5ProofNotice").hidden = !task.reasoning;
    message(
      task.grade
        ? task.solved
          ? task.reasoning
            ? "Kontrollpunkterna stämmer. Jämför också ditt bevis med lösningsförslaget."
            : "Rätt! Uppgiften är löst."
          : task.grade.filter(Boolean).length +
            " av " +
            task.fields.length +
            " svar stämmer. Du kan behålla de rätta svaren och ändra resten."
        : task.submissions.length
          ? "Ditt svar är sparat."
          : "",
      task.grade ? (task.solved ? "good" : "bad") : "",
    );
    const progress = Object.values(state.progress).reduce((sum, p) => sum + p.solved, 0);
    $("m5Progress").textContent =
      progress + " lösta uppgifter i Matematik 5 · sparas på den här enheten";
    controls();
    const canLevelUp =
      !state.test &&
      task.solved &&
      state.level < 5 &&
      (state.progress[task.category]?.byLevel?.[state.level] || 0) >= 3;
    $("m5LevelSuggestion").hidden = !canLevelUp;
    $("m5LevelSuggestionText").textContent =
      "Du har klarat minst tre uppgifter på " +
      E.levels[state.level].name.toLowerCase() +
      ". Vill du prova " +
      E.levels[Math.min(5, state.level + 1)].name.toLowerCase() +
      "?";
    if (state.test && (state.test.index >= 10 || state.test.graded)) summary();
  }
  function credit(task) {
    if (task.credited) return;
    task.credited = true;
    const p = (state.progress[task.category] ??= { solved: 0 });
    p.solved++;
    p.byLevel ??= {};
    p.byLevel[task.level] = (p.byLevel[task.level] || 0) + 1;
    window.GaussGame.addPoints(
      Math.max(
        10,
        30 + task.level * 10 - (task.submissions.length - 1) * 5 - (task.hinted ? 7 : 0),
      ),
    );
  }
  function gradeTask(task) {
    task.grade = E.assess(task, task.draft);
    task.solved = task.grade.every(Boolean);
    task.submissions.at(-1).grade = task.grade;
    if (task.solved) credit(task);
    saveReport(task);
  }
  function submit(force = false) {
    if (!state.task || state.task.solved || (testing() && state.test.index >= 10)) return;
    capture();
    const task = state.task;
    try {
      E.validate(task, task.draft);
    } catch (error) {
      message(error.message, "bad");
      return;
    }
    const previous = task.submissions.at(-1);
    if (!force || JSON.stringify(previous?.values) !== JSON.stringify(task.draft))
      task.submissions.push({ values: [...task.draft], grade: null });
    if (testing()) {
      saveReport(task);
      state.test.index++;
      if (state.test.index < 10) state.task = state.test.tasks[state.test.index];
      persist();
      render();
      return;
    }
    if (window.WorkReview.auto || force) gradeTask(task);
    else {
      task.grade = null;
      saveReport(task);
    }
    persist();
    render();
  }
  function next() {
    capture();
    window.GaussGame.requestReplace(() => {
      saveReport();
      state.test = null;
      if (state.retry.length) {
        const entry = state.retry.shift();
        state.category = entry.category;
        state.kind = entry.type;
        state.task = fresh(entry.category, entry.type);
      } else state.task = fresh();
      state.number++;
      persist();
      render();
    }, dirty());
  }
  function beginTest() {
    capture();
    window.GaussGame.requestReplace(() => {
      saveReport();
      const ids = Object.keys(C).filter((x) => x !== "graphs"),
        order = [...ids];
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
      while (order.length < 10) order.push(ids[Math.floor(Math.random() * ids.length)]);
      state.test = { index: 0, graded: false, tasks: order.map((id) => fresh(id, "mixed")) };
      state.task = state.test.tasks[0];
      state.retry = [];
      persist();
      render();
    }, dirty());
  }
  function summary() {
    const test = state.test,
      root = $("m5TestResults");
    root.replaceChildren();
    $("m5SummaryTitle").textContent = test.graded
      ? test.tasks.filter((t) => t.solved).length + " av 10 uppgifter klara"
      : "Alla tio svar är sparade";
    $("m5SummaryText").textContent = test.graded
      ? "Kontrollera svaren och jämför dina mellanled med lösningsförslagen. Bevisens fritext bedömer du själv."
      : "Dina svar och mellanled är samlade. Välj Rätta testet när du vill se återkoppling.";
    $("m5FinishTest").hidden = test.graded;
    $("m5Retry").hidden = !test.graded || test.tasks.every((t) => t.solved);
    test.tasks.forEach((task, index) => {
      const details = document.createElement("details"),
        heading = document.createElement("summary"),
        prompt = document.createElement("p");
      heading.textContent =
        index +
        1 +
        ". " +
        task.title +
        (test.graded
          ? task.solved
            ? " · " + (task.reasoning ? "kontrollpunkter rätt" : "rätt")
            : " · granska"
          : " · sparat");
      prompt.textContent = task.prompt;
      details.append(heading, prompt);
      task.context.forEach((text) => {
        const p = document.createElement("p");
        p.textContent = text;
        details.append(p);
      });
      task.fields.forEach((field, i) => {
        const p = document.createElement("p");
        p.textContent =
          field.label +
          ": " +
          task.draft[i] +
          (test.graded ? " · " + (task.grade[i] ? "rätt" : "granska") : "");
        details.append(p);
      });
      if (task.notes) {
        const p = document.createElement("p");
        p.className = "m5-written-notes";
        p.textContent = task.notes;
        details.append(p);
      }
      if (test.graded) {
        const nested = document.createElement("details"),
          title = document.createElement("summary"),
          list = document.createElement("ol");
        title.textContent = "Lösningsförslag";
        task.solution.forEach((text) => {
          const li = document.createElement("li");
          li.textContent = text;
          list.append(li);
        });
        nested.append(title, list);
        details.append(nested);
      }
      root.append(details);
    });
  }
  function finishTest() {
    if (!state.test || state.test.graded || state.test.index < 10) return;
    state.test.tasks.forEach((task) => {
      gradeTask(task);
      task.solutionSeen = true;
      saveReport(task);
    });
    state.test.graded = true;
    persist();
    render();
    $("m5TestSummary").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function backPractice() {
    state.test = null;
    state.task = fresh();
    state.number++;
    persist();
    render();
  }
  function setHelp() {
    $("helpTitle").textContent = "Öva Matematik 5";
    const list = $("helpOverlay").querySelector(".help-list");
    list.replaceChildren();
    [
      "Välj område, övning och nivå. Skriv dina egna svar; använd Mellanled för att spara ditt resonemang.",
      "Stäng av Rättning under arbetet för att spara utan feedback. Rätta svaret när du är klar. I självtest kommer rättningen efter alla tio uppgifter.",
      "Jämför med lösningsförslaget efter rättning. Visa arbete samlar dina svar och mellanled för utskrift eller PDF.",
    ].forEach((text, i) => {
      const row = document.createElement("div"),
        b = document.createElement("b"),
        p = document.createElement("p");
      b.textContent = "0" + (i + 1);
      p.textContent = text;
      row.append(b, p);
      list.append(row);
    });
    $("helpOverlay").querySelector(".help-extra").textContent =
      "Fritext och fullständiga bevis rättas inte automatiskt. De bedömer du själv med hjälp av lösningsförslagen.";
  }
  $("m5Area").onchange = () => {
    const id = $("m5Area").value;
    $("m5Area").value = state.category;
    changeCategory(id);
  };
  $("m5Submit").onclick = () => submit();
  $("m5Grade").onclick = () => submit(true);
  $("m5Next").onclick = next;
  $("m5StartTest").onclick = beginTest;
  $("m5FinishTest").onclick = finishTest;
  $("m5PrintTest").onclick = () => window.WorkReview.show();
  $("m5BackPractice").onclick = backPractice;
  $("m5Retry").onclick = () => {
    state.retry = state.test.tasks
      .filter((t) => !t.solved)
      .map((t) => ({ category: t.category, type: t.type }));
    state.test = null;
    const entry = state.retry.shift();
    state.category = entry.category;
    state.kind = entry.type;
    state.task = fresh(entry.category, entry.type);
    state.number++;
    persist();
    render();
  };
  $("m5EndTest").onclick = () =>
    window.GaussGame.requestReplace(() => {
      state.test.tasks.forEach(saveReport);
      backPractice();
    }, true);
  $("m5Kind").onchange = () => {
    const value = $("m5Kind").value;
    $("m5Kind").value = state.kind;
    capture();
    window.GaussGame.requestReplace(() => {
      saveReport();
      state.kind = value;
      state.test = null;
      state.retry = [];
      state.task = fresh();
      state.number++;
      persist();
      render();
    }, dirty());
  };
  $("m5Level").onchange = () => {
    const value = Number($("m5Level").value);
    $("m5Level").value = String(state.level);
    capture();
    window.GaussGame.requestReplace(() => {
      saveReport();
      state.level = value;
      ensureKind();
      state.test = null;
      state.task = fresh();
      state.number++;
      persist();
      render();
    }, dirty());
  };
  $("m5Notes").oninput = () => {
    if (!state.task) return;
    state.task.notes = $("m5Notes").value;
    persist();
  };
  $("m5Hint").onclick = () => {
    if (testing() || !window.WorkReview.auto) return;
    state.task.hinted = true;
    $("m5HintText").textContent = state.task.hint;
    $("m5HintText").hidden = false;
    persist();
  };
  $("m5SolutionButton").onclick = () => {
    if (!state.task.grade || testing()) return;
    state.task.solutionSeen = !state.task.solutionSeen;
    if (state.task.solutionSeen && !state.task.solved) state.task.hinted = true;
    persist();
    saveReport();
    controls();
  };
  window.addEventListener("gradingchange", () => {
    if (state.task && !state.task.solved && !state.test?.graded) {
      state.task.grade = null;
      state.task.solutionSeen = false;
      document
        .querySelectorAll("#m5Fields input")
        .forEach((x) => x.classList.remove("wrong", "correct"));
      message("Inställningen är ändrad.");
    }
    controls();
    persist();
  });
  window.addEventListener("workreviewbefore", () => {
    if ($("topic").value === "math5") capture();
    saveReport();
    if (state.test) state.test.tasks.forEach(saveReport);
  });
  function startBeginner() {
    capture();
    window.GaussGame.requestReplace(() => {
      saveReport();
      state.test = null;
      state.retry = [];
      state.level = 1;
      state.kind = "mixed";
      state.task = fresh();
      state.number++;
      persist();
      render();
      $("beginnerExample").open = true;
    }, dirty() || testing());
  }
  $("m5LevelUp").onclick = () => {
    if (state.level >= 5 || testing()) return;
    capture();
    saveReport();
    state.level++;
    state.kind = "mixed";
    state.task = fresh();
    state.number++;
    persist();
    render();
  };
  window.Math5 = {
    startBeginner,
    enter: () => {
      render();
      setHelp();
    },
    setHelp,
  };
  // JSON restores separate copies of current and test task; keep them linked.
  if (state.test) {
    const index = Math.min(state.test.index, 9);
    if (!state.test.graded) state.task = state.test.tasks[index];
  }
})();
