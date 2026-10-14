(() => {
  "use strict";

  const { $, storage, dateKey } = window.GaussShared;
  let pendingReplace = null;
  let modalReturn = null;
  let modalWasPaused = false;

  function open(id) {
    modalReturn = document.activeElement;
    const gameWasRunning = !!window.GaussGame && !window.GaussGame.paused;
    window.GaussGame?.pause();
    modalWasPaused ||= gameWasRunning;
    if ($(id).parentElement === document.body) document.body.append($(id));
    $(id).hidden = false;
    document.body.style.overflow = "hidden";
    $(id).querySelector("button")?.focus();
  }

  function close(id) {
    $(id).hidden = true;
    document.body.style.overflow = "";
    modalReturn?.focus();
    if (
      modalWasPaused &&
      ![
        "helpOverlay",
        "statsOverlay",
        "confirmOverlay",
        "customOverlay",
        "resultOverlay",
      ].some((overlayId) => $(overlayId) && !$(overlayId).hidden)
    ) {
      modalWasPaused = false;
      window.GaussGame?.resume();
    }
  }

  function requestReplace(action) {
    pendingReplace = action;
    $("confirmOverlay").querySelector("p").textContent =
      "Ditt påbörjade svar och dina anteckningar ersätts.";
    open("confirmOverlay");
  }

  function readStats() {
    const saved = storage.readJson("gausskamp-v4", {});
    return {
      score:
        Number(saved.stats?.score ?? storage.readString("gauss_score", "0")) ||
        0,
      solved: Number(saved.stats?.solved) || 0,
      bestStreak:
        Number(
          saved.stats?.bestStreak ?? storage.readString("gauss_best", "0"),
        ) || 0,
      fastest: saved.stats?.fastest ?? null,
      daily: saved.stats?.daily || {},
    };
  }

  function showStats() {
    const stats = readStats();
    $("statSolved").textContent = stats.solved;
    $("statBest").textContent = stats.bestStreak;
    $("statChallenge").textContent =
      stats.fastest === null
        ? "—"
        : Math.floor(stats.fastest / 60) +
          ":" +
          String(stats.fastest % 60).padStart(2, "0");
    $("statDaily").textContent = stats.daily[dateKey()]?.steps ?? "—";
    open("statsOverlay");
  }

  if (document.body.dataset.topic !== "gauss") {
    $("helpButton").onclick = () => {
      if (document.body.dataset.topic === "math5") window.Math5?.setHelp();
      else window.MatrixOps?.setHelp();
      open("helpOverlay");
    };
    $("helpClose").onclick = $("helpDone").onclick = () => close("helpOverlay");
    $("statsButton").onclick = showStats;
    $("statsClose").onclick = $("statsDone").onclick = () =>
      close("statsOverlay");
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
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      for (const id of ["confirmOverlay", "helpOverlay", "statsOverlay"])
        if (!$(id).hidden) {
          close(id);
          return;
        }
    });
  }

  window.PracticeShell = { requestReplace, readStats };
  const score = $("score");
  if (score) score.textContent = readStats().score;
})();
