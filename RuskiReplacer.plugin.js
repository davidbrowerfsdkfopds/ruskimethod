/**
 * @name The Ruski Replacer
 * @version 1.1.0
 * @description Replaces specified text in Discord messages and sets a fixed message date. Optionally appends "(edited)".
 * @author Ruski
 * @source https://github.com/davidbrowerfsdkfopds/ruskimethod/blob/main/gaottalk
 */

const BdApi = global.BdApi;

module.exports = class RuskiReplacer {
  constructor() {
    this.observer = null;
    this.debounceTimer = null;
    // Load saved settings or set defaults
    this.settings = BdApi.loadData("RuskiReplacer", "settings") || {
      fromText: "lil yay",
      toText: "big nay",
      showEditedTag: false
    };
    // Fixed date to display
    this.fixedDate = "2/17/2025 12:56 AM";
  }

  start() {
    this.replaceContent();
    this.observeMutations();
  }

  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  // Combined function to replace both text and date content
  replaceContent = () => {
    // Replace text in message elements
    document.querySelectorAll("div[class*='messageContent'], span").forEach(el => {
      if (el.textContent.includes(this.settings.fromText)) {
        const replaced = el.textContent.replace(
          new RegExp(this.settings.fromText, "g"),
          this.settings.toText
        );
        // Append " (edited)" if enabled and not already present
        el.textContent = replaced + (this.settings.showEditedTag && !replaced.endsWith(" (edited)") ? " (edited)" : "");
      }
    });
    // Set all <time> elements to the fixed date
    document.querySelectorAll("time").forEach(el => {
      el.textContent = this.fixedDate;
    });
  };

  // Observe DOM changes and debounce replacement calls
  observeMutations() {
    this.observer = new MutationObserver(() => {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(this.replaceContent, 300);
    });
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // Generate a settings panel using template literals for simplicity
  getSettingsPanel() {
    const panel = document.createElement("div");
    panel.style.padding = "10px";

    panel.innerHTML = `
      <div>
        <label>Text to replace: 
          <input type="text" value="${this.settings.fromText}" placeholder="Text to replace">
        </label>
      </div>
      <div style="margin-top: 10px;">
        <label>Replacement text: 
          <input type="text" value="${this.settings.toText}" placeholder="Replacement text">
        </label>
      </div>
      <div style="margin-top: 10px;">
        <label>
          Append (edited) to replaced messages: 
          <input type="checkbox" ${this.settings.showEditedTag ? "checked" : ""}>
        </label>
      </div>
    `;
    
    // Get input elements and attach events to save settings on change
    const [fromInput, toInput, editedCheckbox] = panel.querySelectorAll("input");

    fromInput.oninput = e => {
      this.settings.fromText = e.target.value;
      BdApi.saveData("RuskiReplacer", "settings", this.settings);
    };

    toInput.oninput = e => {
      this.settings.toText = e.target.value;
      BdApi.saveData("RuskiReplacer", "settings", this.settings);
    };

    editedCheckbox.onchange = e => {
      this.settings.showEditedTag = e.target.checked;
      BdApi.saveData("RuskiReplacer", "settings", this.settings);
    };

    return panel;
  }
};
