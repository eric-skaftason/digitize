import { updateUI } from "./uiSettingsManager.js";
import { objIsEqual } from "./utils.js";

// Initialise default settings
let settings = {
    granular_model_selection: false,
    debug_options: false,
    test_suite: false
};
if (!localStorage.getItem("digitize_settings")) {
    localStorage.setItem("digitize_settings", JSON.stringify(settings));
} else {
    loadSettings();
}

let unsavedChanges = false;


// Button actions

function openSettingsMenu() {
    document.querySelector('.modal_settings').style.display = "flex";

    // Load setting toggle states
    document.querySelectorAll('.option .toggle').forEach((toggleElement) => {
        const id = toggleElement.id;
        toggleAnimate(toggleElement, settings[id]);
    });
}

function closeSettingsMenu() {
    document.querySelector('.modal_settings').style.display = "none";
    updateUI();
}

function toggle(toggleElement) {
    if (toggleElement.classList.contains('enabled')) toggleAnimate(toggleElement, false);
    else toggleAnimate(toggleElement, true);
}
// To visually set toggle and setting data
function toggleAnimate(toggleElement, isEnabled) {
    if (isEnabled) {
        toggleElement.classList.add('enabled');
        setSetting(toggleElement.id, true);
    } else {
        toggleElement.classList.remove('enabled');
        setSetting(toggleElement.id, false);
    }
}


// Helper functions
function setSetting(toggleElementId, value) {
    settings[toggleElementId] = value;

    updateUnsavedSettingsHighlighting();
}

function saveSettings() {
    localStorage.setItem("digitize_settings", JSON.stringify(settings));
    updateUnsavedSettingsHighlighting();
}

function loadSettings() {
    settings = JSON.parse(localStorage.getItem("digitize_settings"));
}

function discardChanges() {
    loadSettings();
}

function discardAndClose() {
    if (unsavedChanges) {
        if (!confirm("Unsaved changes will be lost; proceed?")) return;   
    }

    discardChanges();
    closeSettingsMenu();
}

function saveAndClose() {
    saveSettings();
    closeSettingsMenu();
}

function getSetting(key) {
    return settings[key];
}


// Update unsaved settings highlighting
function updateUnsavedSettingsHighlighting() {
    if (!objIsEqual(settings, JSON.parse(localStorage.getItem("digitize_settings")))) {
        document.querySelector("#save_settings").classList.add("unsaved_exists");
        document.querySelector("#menu_footer_note").innerText = "Unsaved Changes!";

        unsavedChanges = true;
    } else {
        document.querySelector("#save_settings").classList.remove("unsaved_exists");
        document.querySelector("#menu_footer_note").innerText = "";

        unsavedChanges = false;
    }
}

export { getSetting, saveSettings, openSettingsMenu, closeSettingsMenu, saveAndClose, discardAndClose, toggle };
