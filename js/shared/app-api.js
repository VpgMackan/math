(() => {
  "use strict";

  const api = {
    requestReplace(action, force = null) {
      if (window.GaussGame)
        return window.GaussGame.requestReplace(action, force);
      if (force) window.PracticeShell?.requestReplace(action);
      else action?.();
    },
    pauseGame() {
      window.GaussGame?.pause();
    },
    resumeGame() {
      window.GaussGame?.resume();
    },
    refreshGame() {
      window.GaussGame?.refresh();
    },
    addPoints(points) {
      if (window.GaussGame) {
        window.GaussGame.addPoints(points);
        return;
      }
      const key = "gausskamp-v4";
      const saved = window.GaussShared.storage.readJson(key, {});
      const stats = {
        score:
          Number(
            saved.stats?.score ??
              window.GaussShared.storage.readString("gauss_score", "0"),
          ) || 0,
        solved: Number(saved.stats?.solved) || 0,
        bestStreak:
          Number(
            saved.stats?.bestStreak ??
              window.GaussShared.storage.readString("gauss_best", "0"),
          ) || 0,
        streak: Number(saved.stats?.streak) || 0,
        fastest: saved.stats?.fastest ?? null,
        daily: saved.stats?.daily || {},
        ...saved.stats,
      };
      stats.score += points;
      stats.solved++;
      window.GaussShared.storage.writeJson(key, { ...saved, stats });
      const score = window.GaussShared.$("score");
      if (score) score.textContent = stats.score;
    },
    autoGrade() {
      return !!window.WorkReview?.auto;
    },
    workId() {
      return window.WorkReview?.id();
    },
    recordWork(report) {
      window.WorkReview?.record(report);
    },
    showWorkReview() {
      window.WorkReview?.show();
    },
  };

  window.GaussApi = api;
})();
