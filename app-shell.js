(() => {
  "use strict";

  const { $ } = window.GaussShared;
  let currentTopic = "gauss";
  const listeners = new Set();

  function notify(previous, topic) {
    const detail = { previous, topic };
    document.dispatchEvent(new CustomEvent("gausskamp:topicchange", { detail }));
    listeners.forEach((fn) => {
      try {
        fn(detail);
      } catch {}
    });
  }

  function show(topic) {
    $("gaussSurface").hidden = topic !== "gauss";
    $("operationsSurface").hidden = topic !== "operations";
    $("math5Surface").hidden = topic !== "math5";
  }

  function setTopic(topic) {
    if (!["gauss", "operations", "math5"].includes(topic)) return;
    if (topic === currentTopic) {
      show(topic);
      return;
    }
    const previous = currentTopic;
    currentTopic = topic;
    $("topic").value = topic;
    show(topic);

    window.MatrixOps?.setTopic(topic);

    if (topic === "math5") {
      window.GaussApi?.pauseGame();
      window.Math5?.enter();
    } else if (topic === "operations") {
      window.GaussApi?.pauseGame();
      window.MatrixOps?.enter();
      window.BeginnerGuide?.onTopicChange("operations");
    } else {
      window.GaussApi?.resumeGame();
      window.GaussApi?.refreshGame();
      window.BeginnerGuide?.onTopicChange("gauss");
    }

    notify(previous, topic);
  }

  function init() {
    currentTopic = $("topic").value || "gauss";
    show(currentTopic);
    window.MatrixOps?.setTopic(currentTopic);
    if (currentTopic === "math5") window.Math5?.enter();
    else if (currentTopic === "operations") window.MatrixOps?.enter();
    else window.BeginnerGuide?.onTopicChange("gauss");

    $("topic").addEventListener("change", () => {
      setTopic($("topic").value);
    });
  }

  window.GaussApp = {
    init,
    setTopic,
    getTopic: () => currentTopic,
    onTopicChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };

  init();
})();
