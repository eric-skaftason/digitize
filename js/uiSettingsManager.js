// For changing site apperance based on settings

let settings;
updateUI();

function fetchSettings() {
    const settingsStr = localStorage.getItem("digitize_settings");
    if (settingsStr) settings = JSON.parse(settingsStr);
}

function toggleMenu(className, isEnabled) {
    if (isEnabled) {
        document.querySelectorAll(`.menu.${className}`).forEach((menu) => {
            menu.style.display = "flex";
        });
    } else {
        document.querySelectorAll(`.menu.${className}`).forEach((menu) => {
            menu.style.display = "none";
        });
    }
}

function updateUI() {
    fetchSettings();
    if (!settings) return console.error("settings not found.");
    
    toggleMenu("granular_model_selection", settings.granular_model_selection);
    toggleMenu("debug_options", settings.debug_options);
    toggleMenu("test_suite", settings.test_suite);
}

export { updateUI };
