(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const storage = {
    readJson(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);
        return value == null ? fallback : JSON.parse(value);
      } catch {
        return fallback;
      }
    },
    writeJson(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    },
    readString(key, fallback = "") {
      try {
        const value = localStorage.getItem(key);
        return value == null ? fallback : String(value);
      } catch {
        return fallback;
      }
    },
    writeString(key, value) {
      try {
        localStorage.setItem(key, String(value));
      } catch {}
    },
  };

  const randomInt = (min, max, rng = Math.random) =>
    min + Math.floor(rng() * (max - min + 1));

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

  function hash(text) {
    let h = 2166136261;
    for (const c of text) {
      h ^= c.charCodeAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  window.GaussShared = {
    $,
    storage,
    randomInt,
    seeded,
    dateKey,
    hash,
  };
})();
