(function () {
  "use strict";

  const SECTIONS = [
    {
      title: "Numbers",
      description: "Digits and repeated forms",
      chars: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    },
    {
      title: "Uppercase",
      description: "Selected Latin capitals",
      chars: "ABCDEFGHIJKLMNPQRSTUVWXYZ".split(""),
    },
    {
      title: "Lowercase",
      description: "Selected Latin lowercase",
      chars: "abcdefghijklmnpqrstuvwxyz".split(""),
    },
    {
      title: "Punctuation",
      description: "Punctuation used heavily in code",
      chars: [".", ",", "~", "*", "_", "^", "`", "'", "(", "{"],
    },
    {
      title: "Symbols",
      description: "Currency, separators, and common symbols",
      chars: ["«", "#", "&", "@", "$", "¢", "%", "|", "?", "¶", "µ", "❮"],
    },
    {
      title: "Operators",
      description: "Relations and arrows",
      chars: ["≤", "≥", "≠", "⇐", "⇒", "←", "→"],
    },
  ];

  const STORAGE_KEY = "glyph-verifier-config-v1";
  const VALID_MODES = ["overlay", "side", "a-only", "b-only"];

  const root = document.documentElement;
  const body = document.body;
  const board = document.getElementById("board");

  const nameA = document.getElementById("name-a");
  const urlA = document.getElementById("url-a");
  const opA = document.getElementById("opacity-a");
  const opAVal = document.getElementById("opacity-a-val");

  const nameB = document.getElementById("name-b");
  const urlB = document.getElementById("url-b");
  const opB = document.getElementById("opacity-b");
  const opBVal = document.getElementById("opacity-b-val");

  const size = document.getElementById("size");
  const sizeVal = document.getElementById("size-val");
  const guides = document.getElementById("guides");
  const modeSelect = document.getElementById("mode-select");
  const swapBtn = document.getElementById("swap-btn");

  const statusA = document.getElementById("status-a");
  const statusAText = document.getElementById("status-a-text");
  const statusB = document.getElementById("status-b");
  const statusBText = document.getElementById("status-b-text");

  const loadedCache = new Map();

  const storage = {
    get() {
      try {
        return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      } catch {
        return {};
      }
    },
    set(config) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch {
        /* Local storage can be unavailable for local files or locked profiles. */
      }
    },
  };

  function codepointLabel(ch) {
    return [...ch]
      .map((c) => `U+${c.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`)
      .join(" ");
  }

  function createTextElement(tag, className, text) {
    const el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    el.textContent = text;
    return el;
  }

  function renderBoard() {
    const fragment = document.createDocumentFragment();

    SECTIONS.forEach((sectionData) => {
      const section = document.createElement("section");
      section.className = "glyph-section";

      const head = document.createElement("div");
      head.className = "glyph-section-head";

      const titleBlock = document.createElement("div");
      titleBlock.className = "glyph-section-title";
      titleBlock.append(
        createTextElement("h3", "", sectionData.title),
        createTextElement("p", "", sectionData.description),
      );

      const count = createTextElement(
        "div",
        "glyph-count",
        `${String(sectionData.chars.length).padStart(2, "0")} glyphs`,
      );

      head.append(titleBlock, count);

      const grid = document.createElement("div");
      grid.className = "grid";

      sectionData.chars.forEach((ch) => {
        const cell = document.createElement("div");
        cell.className = "cell";

        cell.append(
          createTextElement("span", "cell-codepoint", codepointLabel(ch)),
          createTextElement("div", "guide guide-capheight", ""),
          createTextElement("div", "guide guide-xheight", ""),
          createTextElement("div", "guide guide-baseline", ""),
        );

        const stage = document.createElement("div");
        stage.className = "stage";
        stage.append(
          createTextElement("span", "glyph glyph-a", ch),
          createTextElement("span", "glyph glyph-b", ch),
        );

        cell.appendChild(stage);
        grid.appendChild(cell);
      });

      section.append(head, grid);
      fragment.appendChild(section);
    });

    board.replaceChildren(fragment);
  }

  function setStatus(dotEl, textEl, kind, message) {
    dotEl.className = `status-dot${kind ? ` status-dot--${kind}` : ""}`;
    textEl.textContent = message;
  }

  function cssFontName(name) {
    return `"${name.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}", var(--font-mono)`;
  }

  async function applyFont(slot, name, url, dotEl, textEl) {
    const trimmedName = (name || "").trim();
    const trimmedUrl = (url || "").trim();

    if (!trimmedName) {
      root.style.setProperty(`--font-${slot}`, "var(--font-mono)");
      setStatus(dotEl, textEl, "", "Idle");
      return;
    }

    if (trimmedUrl) {
      const key = `${trimmedName}::${trimmedUrl}`;
      setStatus(dotEl, textEl, "loading", "Loading");

      try {
        if (!loadedCache.has(key)) {
          const face = new FontFace(trimmedName, `url("${trimmedUrl.replace(/"/g, '\\"')}")`, {
            display: "swap",
          });
          const loaded = await face.load();
          document.fonts.add(loaded);
          loadedCache.set(key, loaded);
        }

        root.style.setProperty(`--font-${slot}`, cssFontName(trimmedName));
        setStatus(dotEl, textEl, "loaded", "Loaded");
      } catch (error) {
        console.warn("Font load failed:", trimmedName, trimmedUrl, error);
        root.style.setProperty(`--font-${slot}`, cssFontName(trimmedName));
        setStatus(dotEl, textEl, "error", "Failed");
      }

      return;
    }

    root.style.setProperty(`--font-${slot}`, cssFontName(trimmedName));

    try {
      const available = document.fonts.check(`16px "${trimmedName.replace(/"/g, '\\"')}"`);
      setStatus(dotEl, textEl, available ? "system" : "error", available ? "System" : "Not found");
    } catch {
      setStatus(dotEl, textEl, "system", "System");
    }
  }

  function debounce(fn, ms) {
    let timer;
    return function debounced(...args) {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => fn.apply(this, args), ms);
    };
  }

  const updateA = debounce(() => applyFont("a", nameA.value, urlA.value, statusA, statusAText), 320);
  const updateB = debounce(() => applyFont("b", nameB.value, urlB.value, statusB, statusBText), 320);

  function activeMode() {
    const active = modeSelect.querySelector("button.is-active");
    return active ? active.dataset.mode : "overlay";
  }

  function save() {
    storage.set({
      nameA: nameA.value,
      urlA: urlA.value,
      nameB: nameB.value,
      urlB: urlB.value,
      opA: opA.value,
      opB: opB.value,
      size: size.value,
      guides: guides.checked,
      mode: activeMode(),
    });
  }

  function syncOpacity(input, output, property) {
    root.style.setProperty(property, String(Number(input.value) / 100));
    output.textContent = `${input.value}%`;
  }

  function syncSize() {
    root.style.setProperty("--glyph-size", `${size.value}px`);
    sizeVal.textContent = `${size.value}px`;
  }

  function setMode(mode) {
    if (!VALID_MODES.includes(mode)) {
      return;
    }

    modeSelect.querySelectorAll("button[data-mode]").forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    body.classList.remove("mode-overlay", "mode-side", "mode-a-only", "mode-b-only");
    body.classList.add(`mode-${mode}`);
  }

  function load() {
    const config = storage.get();

    if (config.nameA !== undefined) nameA.value = config.nameA;
    if (config.urlA !== undefined) urlA.value = config.urlA;
    if (config.nameB !== undefined) nameB.value = config.nameB;
    if (config.urlB !== undefined) urlB.value = config.urlB;

    if (config.opA !== undefined) opA.value = config.opA;
    if (config.opB !== undefined) opB.value = config.opB;
    if (config.size !== undefined) size.value = config.size;
    if (config.guides !== undefined) guides.checked = Boolean(config.guides);

    syncOpacity(opA, opAVal, "--opacity-a");
    syncOpacity(opB, opBVal, "--opacity-b");
    syncSize();
    body.classList.toggle("guides-on", guides.checked);
    setMode(config.mode || "overlay");

    updateA();
    updateB();
  }

  [nameA, urlA].forEach((el) => {
    el.addEventListener("input", () => {
      updateA();
      save();
    });
  });

  [nameB, urlB].forEach((el) => {
    el.addEventListener("input", () => {
      updateB();
      save();
    });
  });

  opA.addEventListener("input", () => {
    syncOpacity(opA, opAVal, "--opacity-a");
    save();
  });

  opB.addEventListener("input", () => {
    syncOpacity(opB, opBVal, "--opacity-b");
    save();
  });

  size.addEventListener("input", () => {
    syncSize();
    save();
  });

  guides.addEventListener("change", () => {
    body.classList.toggle("guides-on", guides.checked);
    save();
  });

  modeSelect.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-mode]");
    if (!button) {
      return;
    }

    setMode(button.dataset.mode);
    save();
  });

  swapBtn.addEventListener("click", () => {
    const tmpName = nameA.value;
    const tmpUrl = urlA.value;

    nameA.value = nameB.value;
    urlA.value = urlB.value;
    nameB.value = tmpName;
    urlB.value = tmpUrl;

    updateA();
    updateB();
    save();
  });

  window.addEventListener("keydown", (event) => {
    if (event.target.matches("input, textarea, select")) {
      return;
    }
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    const key = event.key.toLowerCase();
    if (key === "1") {
      setMode("overlay");
      save();
    } else if (key === "2") {
      setMode("side");
      save();
    } else if (key === "3") {
      setMode("a-only");
      save();
    } else if (key === "4") {
      setMode("b-only");
      save();
    } else if (key === "g") {
      guides.checked = !guides.checked;
      body.classList.toggle("guides-on", guides.checked);
      save();
    } else if (key === "s") {
      swapBtn.click();
    }
  });

  function updateDeviceInfo() {
    const el = document.getElementById("device-info");
    if (!el) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    el.textContent = `${dpr.toFixed(dpr % 1 === 0 ? 0 : 2)}x DPR`;
  }

  renderBoard();
  updateDeviceInfo();
  load();
})();
