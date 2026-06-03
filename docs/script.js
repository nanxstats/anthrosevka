(function () {
  const storage = {
    get(key) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        /* Local storage can be unavailable for local files or locked profiles. */
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* Local storage can be unavailable for local files or locked profiles. */
      }
    },
  };

  const keys = {
    theme: "anthrosevka.theme",
    specimenTheme: "anthrosevka.specimenTheme",
    specimenText: "anthrosevka.specimenText",
    fontSize: "anthrosevka.fontSize",
    lineHeight: "anthrosevka.lineHeight",
    letterSpacing: "anthrosevka.letterSpacing",
    codeLanguage: "anthrosevka.codeLanguage",
  };

  const root = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeLabel = document.getElementById("themeLabel");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  function effectiveTheme() {
    const storedTheme = storage.get(keys.theme);
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }
    return prefersDark.matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    storage.set(keys.theme, theme);
    updateThemeButton();
  }

  function updateThemeButton() {
    const theme = effectiveTheme();
    themeLabel.textContent = theme === "dark" ? "Dark" : "Light";
    themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
    themeToggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );
  }

  const savedTheme = storage.get(keys.theme);
  if (savedTheme === "light" || savedTheme === "dark") {
    root.dataset.theme = savedTheme;
  } else {
    delete root.dataset.theme;
  }
  updateThemeButton();

  themeToggle.addEventListener("click", () => {
    applyTheme(effectiveTheme() === "dark" ? "light" : "dark");
  });

  function handleSchemeChange() {
    if (!storage.get(keys.theme)) {
      delete root.dataset.theme;
      updateThemeButton();
    }
  }

  if (typeof prefersDark.addEventListener === "function") {
    prefersDark.addEventListener("change", handleSchemeChange);
  } else if (typeof prefersDark.addListener === "function") {
    prefersDark.addListener(handleSchemeChange);
  }

  const workbench = document.getElementById("specimenWorkbench");
  const specimen = document.getElementById("liveSpecimen");
  const resetSpecimen = document.getElementById("resetSpecimen");
  const defaultSpecimen = specimen.value;

  const controls = [
    {
      input: document.getElementById("fontSize"),
      output: document.getElementById("fontSizeOutput"),
      key: keys.fontSize,
      property: "--specimen-size",
      format: (value) => `${Math.round(Number(value))}px`,
    },
    {
      input: document.getElementById("lineHeight"),
      output: document.getElementById("lineHeightOutput"),
      key: keys.lineHeight,
      property: "--specimen-leading",
      format: (value) => Number(value).toFixed(2).replace(/0$/, ""),
    },
    {
      input: document.getElementById("letterSpacing"),
      output: document.getElementById("letterSpacingOutput"),
      key: keys.letterSpacing,
      property: "--specimen-tracking",
      format: (value) => `${Number(value).toFixed(3).replace(/0$/, "")}em`,
    },
  ];

  function syncControl(control) {
    const formatted = control.format(control.input.value);
    control.output.textContent = formatted;
    workbench.style.setProperty(control.property, formatted);
    storage.set(control.key, control.input.value);
  }

  controls.forEach((control) => {
    const savedValue = storage.get(control.key);
    if (savedValue !== null) {
      control.input.value = savedValue;
    }
    syncControl(control);
    control.input.addEventListener("input", () => syncControl(control));
  });

  const specimenTheme = document.getElementById("specimenTheme");
  const savedSpecimenTheme = storage.get(keys.specimenTheme);
  if (["auto", "light", "dark"].includes(savedSpecimenTheme)) {
    specimenTheme.value = savedSpecimenTheme;
  }

  function applySpecimenTheme() {
    workbench.dataset.specimenTheme = specimenTheme.value;
    storage.set(keys.specimenTheme, specimenTheme.value);
  }

  applySpecimenTheme();
  specimenTheme.addEventListener("change", applySpecimenTheme);

  const savedText = storage.get(keys.specimenText);
  if (savedText !== null) {
    specimen.value = savedText;
  }

  specimen.addEventListener("input", () => {
    storage.set(keys.specimenText, specimen.value);
  });

  resetSpecimen.addEventListener("click", () => {
    specimen.value = defaultSpecimen;
    storage.remove(keys.specimenText);
    specimen.focus();
  });

  const tabs = Array.from(document.querySelectorAll("[role='tab']"));
  const panels = Array.from(document.querySelectorAll("[role='tabpanel']"));

  function activateTab(tab) {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-selected", String(selected));
      item.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    });

    storage.set(keys.codeLanguage, tab.dataset.language);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }

      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + direction + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex]);
    });
  });

  const savedLanguage = storage.get(keys.codeLanguage);
  const savedTab = tabs.find((tab) => tab.dataset.language === savedLanguage);
  if (savedTab) {
    activateTab(savedTab);
  }

  const glyphCells = Array.from(document.querySelectorAll(".glyph-cell"));
  const glyphPopover = document.getElementById("glyphPopover");
  const glyphPopoverCharacter = document.getElementById("glyphPopoverCharacter");
  const glyphPopoverLabel = document.getElementById("glyphPopoverLabel");
  let inspectedGlyph = null;

  function glyphPointFromCell(cell) {
    const rect = cell.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top,
    };
  }

  function positionGlyphPopover(point) {
    const margin = 14;
    const rect = glyphPopover.getBoundingClientRect();
    const halfWidth = rect.width / 2;
    const maxX = window.innerWidth - halfWidth - margin;
    const minX = halfWidth + margin;
    const x = Math.min(maxX, Math.max(minX, point.x));
    const needsBelow = point.y < rect.height + margin * 2;
    const y = needsBelow
      ? Math.min(window.innerHeight - rect.height - margin, point.y)
      : Math.max(rect.height + margin * 2, point.y);

    glyphPopover.classList.toggle("is-below", needsBelow);
    glyphPopover.style.left = `${x}px`;
    glyphPopover.style.top = `${y}px`;
  }

  function inspectGlyph(cell, point) {
    const glyph = cell.dataset.glyph || cell.textContent.trim();
    const label = cell.dataset.label || "glyph";

    if (inspectedGlyph && inspectedGlyph !== cell) {
      inspectedGlyph.classList.remove("is-inspected");
    }

    inspectedGlyph = cell;
    cell.classList.add("is-inspected");
    glyphPopoverCharacter.textContent = glyph;
    glyphPopoverLabel.textContent = label;
    glyphPopover.classList.add("is-visible");
    glyphPopover.setAttribute("aria-hidden", "false");
    positionGlyphPopover(point || glyphPointFromCell(cell));
  }

  function hideGlyphInspector() {
    if (inspectedGlyph) {
      inspectedGlyph.classList.remove("is-inspected");
    }
    inspectedGlyph = null;
    glyphPopover.classList.remove("is-visible", "is-below");
    glyphPopover.setAttribute("aria-hidden", "true");
  }

  if (glyphPopover && glyphPopoverCharacter && glyphPopoverLabel) {
    glyphCells.forEach((cell) => {
      const glyph = cell.dataset.glyph || cell.textContent.trim();
      const label = cell.dataset.label || "glyph";
      cell.setAttribute("aria-label", `Inspect ${label}: ${glyph}`);

      cell.addEventListener("mouseenter", (event) => {
        inspectGlyph(cell, { x: event.clientX, y: event.clientY });
      });

      cell.addEventListener("mousemove", (event) => {
        if (inspectedGlyph === cell) {
          positionGlyphPopover({ x: event.clientX, y: event.clientY });
        }
      });

      cell.addEventListener("mouseleave", hideGlyphInspector);
      cell.addEventListener("focus", () => inspectGlyph(cell));
      cell.addEventListener("blur", hideGlyphInspector);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        hideGlyphInspector();
      }
    });
  }
})();
