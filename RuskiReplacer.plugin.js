/**
 * @name The Ruski Replacer
 * @version 2.1.0
 * @description Replaces specified text in Discord messages and, optionally, sets a fixed message date. Optionally appends "(edited)".
 * @author Ruski
 * @source https://github.com/davidbrowerfsdkfopds/ruskimethod
 * @updateURL https://raw.githubusercontent.com/davidbrowerfsdkfopds/ruskimethod/main/RuskiReplacer.plugin.js
 * @downloadURL https://raw.githubusercontent.com/davidbrowerfsdkfopds/ruskimethod/main/RuskiReplacer.plugin.js
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
      showEditedTag: false,
      editDateTime: false,
      fixedDate: "2/17/2025 12:56 AM"
    };
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

  // Combined function to replace text and, optionally, date content
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
    // Update all <time> elements to the fixed date only if the option is enabled
    if (this.settings.editDateTime) {
      document.querySelectorAll("time").forEach(el => {
        el.textContent = this.settings.fixedDate;
      });
    }
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

  // Generate a settings panel with additional options for editing date and time
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
          <input type="checkbox" id="showEditedCheckbox" ${this.settings.showEditedTag ? "checked" : ""}>
        </label>
      </div>
      <div style="margin-top: 10px;">
        <label>
          Edit date and time?
          <input type="checkbox" id="editDateTimeCheckbox" ${this.settings.editDateTime ? "checked" : ""}>
        </label>
      </div>
      <div style="margin-top: 10px;">
        <label>
          Fixed date and time:
          <input type="text" id="fixedDateInput" value="${this.settings.fixedDate}" placeholder="Enter fixed date/time" ${!this.settings.editDateTime ? "disabled" : ""}>
        </label>
      </div>
    `;
    
    // Get input elements and attach events to save settings on change
    const inputs = panel.querySelectorAll("input");
    const fromInput = inputs[0];
    const toInput = inputs[1];
    const showEditedCheckbox = panel.querySelector("#showEditedCheckbox");
    const editDateTimeCheckbox = panel.querySelector("#editDateTimeCheckbox");
    const fixedDateInput = panel.querySelector("#fixedDateInput");

    fromInput.oninput = e => {
      this.settings.fromText = e.target.value;
      BdApi.saveData("RuskiReplacer", "settings", this.settings);
    };

    toInput.oninput = e => {
      this.settings.toText = e.target.value;
      BdApi.saveData("RuskiReplacer", "settings", this.settings);
    };

    showEditedCheckbox.onchange = e => {
      this.settings.showEditedTag = e.target.checked;
      BdApi.saveData("RuskiReplacer", "settings", this.settings);
    };

    editDateTimeCheckbox.onchange = e => {
      this.settings.editDateTime = e.target.checked;
      BdApi.saveData("RuskiReplacer", "settings", this.settings);
      // Enable or disable the fixed date input based on the checkbox
      fixedDateInput.disabled = !this.settings.editDateTime;
    };

    fixedDateInput.oninput = e => {
      this.settings.fixedDate = e.target.value;
      BdApi.saveData("RuskiReplacer", "settings", this.settings);
    };

    return panel;
  }
};
