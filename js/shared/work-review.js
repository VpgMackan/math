(() => {
  

  const { $, storage } = window.GaussShared;
  let reports = [],
    auto = true,
    returnFocus = null,
    shouldResume = false;
  try {
    auto = storage.readString("gausskamp-auto-grade", "true") !== "false";
    const saved = storage.readJson("gausskamp-work", []);
    if (Array.isArray(saved)) reports = saved.slice(-30);
  } catch {}
  const api = {
    get auto() {
      return auto;
    },
    id: () =>
      Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9),
    record(report) {
      const i = reports.findIndex((r) => r.id === report.id);
      if (i < 0) reports.push(report);
      else reports[i] = report;
      reports = reports.slice(-30);
      storage.writeJson("gausskamp-work", reports);
    },
    show,
  };
  window.WorkReview = api;
  function setting() {
    $("autoGrade").checked = auto;
    $("gradingDescription").textContent = auto
      ? "Du får återkoppling direkt efter varje svar."
      : "Spara dina steg utan återkoppling. Rätta hela lösningen när du är klar.";
  }
  $("autoGrade").onchange = () => {
    auto = $("autoGrade").checked;
    storage.writeString("gausskamp-auto-grade", String(auto));
    setting();
    window.dispatchEvent(new Event("gradingchange"));
  };
  setting();
  function show() {
    window.dispatchEvent(new Event("workreviewbefore"));
    returnFocus = document.activeElement;
    shouldResume =
      !!window.GaussGame &&
      !window.GaussGame.paused &&
      ![
        "resultOverlay",
        "helpOverlay",
        "statsOverlay",
        "customOverlay",
        "pauseOverlay",
        "confirmOverlay",
      ].some((id) => $(id) && !$(id).hidden);
    window.GaussGame?.pause();
    const content = $("workReports");
    content.replaceChildren();
    if (!reports.length) {
      const p = document.createElement("p");
      p.textContent = "Spara ditt första steg för att se ditt arbete här.";
      content.append(p);
    }
    reports
      .slice()
      .reverse()
      .forEach((report) => {
        const article = document.createElement("article");
        article.className = "work-report";
        const h = document.createElement("h3"),
          status = document.createElement("p");
        h.textContent = report.title;
        status.textContent = report.status;
        status.className = "report-status";
        article.append(h, status);
        (report.texts || []).forEach((item) => {
          const block = document.createElement("section"),
            heading = document.createElement("h4"),
            body = document.createElement("p");
          block.className = "report-step report-text";
          heading.textContent = item.label;
          body.textContent = item.text;
          block.append(heading, body);
          article.append(block);
        });
        (report.matrices || []).forEach((item) => {
          const section = document.createElement("section"),
            label = document.createElement("h4"),
            grid = document.createElement("div");
          section.className = "report-step";
          label.textContent = item.label;
          grid.className = "snapshot-grid";
          grid.style.setProperty("--cols", item.values[0].length);
          item.values.forEach((row) =>
            row.forEach((value) => {
              const span = document.createElement("span");
              span.textContent = String(value);
              grid.append(span);
            }),
          );
          section.append(label, grid);
          if (item.note) {
            const note = document.createElement("p");
            note.textContent = item.note;
            section.append(note);
          }
          article.append(section);
        });
        content.append(article);
      });
    $("reviewOverlay").hidden = false;
    $("closeReview").focus();
  }
  function close() {
    $("reviewOverlay").hidden = true;
    if (
      shouldResume &&
      $("resultOverlay")?.hidden &&
      $("pauseOverlay")?.hidden &&
      !["helpOverlay", "statsOverlay", "confirmOverlay", "customOverlay"].some(
        (id) => !$(id).hidden,
      )
    )
      window.GaussGame?.resume();
    returnFocus?.focus();
  }
  $("reviewWork").onclick = show;
  $("resultReview")?.addEventListener("click", show);
  $("closeReview").onclick = close;
  $("printWork").onclick = () => window.print();
  $("reviewOverlay").addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
    }
    if (event.key === "Tab") {
      const buttons = [...$("reviewOverlay").querySelectorAll("button")],
        first = buttons[0],
        last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
})();
