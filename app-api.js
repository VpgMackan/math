(() => {
  "use strict";

  const api = {
    requestReplace(action, force = null) {
      return window.GaussGame?.requestReplace(action, force);
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
      window.GaussGame?.addPoints(points);
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
