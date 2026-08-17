import { updateUI } from "./uiSettingsManager.js";


// Initialise default settings
let settings = {
    show_debug_options: false
};
const storedSettingsStr = localStorage.getItem("digitize_settings");
if (!storedSettingsStr) {
    localStorage.setItem("digitize_settings", JSON.stringify(settings));
} else {
    loadSettings();
}


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
// To visually set toggle
function toggleAnimate(toggleElement, isEnabled) {
    if (isEnabled) {
        toggleElement.classList.add('enabled');
        setToggle(toggleElement.id, true);
    } else {
        toggleElement.classList.remove('enabled');
        setToggle(toggleElement.id, false);
    }
}


// Helper functions
function setToggle(toggleElementId, boolValue) {
    settings[toggleElementId] = boolValue;
    saveSettings();
}

function saveSettings() {
    localStorage.setItem("digitize_settings", JSON.stringify(settings));
}

function loadSettings() {
    settings = JSON.parse(storedSettingsStr);
}

function discardChanges() {
    loadSettings();
}

function getSetting(key) {
    return settings[key];
}


export { getSetting, openSettingsMenu, closeSettingsMenu, toggle };
