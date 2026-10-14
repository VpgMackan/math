(() => {
  "use strict";

  const topic = document.body.dataset.topic;
  const persistHandoff = () => {
    window.MatrixOps?.persistHandoff?.();
    window.GaussGame?.persistHandoff?.();
  };
  window.addEventListener("pagehide", persistHandoff);
  document.querySelectorAll(".page-nav a").forEach((link) => {
    link.addEventListener("click", persistHandoff);
  });

  if (topic === "math5") window.Math5?.enter();
  if (topic === "operations") {
    window.MatrixOps?.enter();
    window.BeginnerGuide?.onTopicChange("operations");
  }
  if (topic === "gauss") window.BeginnerGuide?.onTopicChange("gauss");
})();
