// For changing site apperance based on settings

let settings;

function fetchSettings() {
    const settingsStr = localStorage.getItem("digitize_settings");
    if (settingsStr) settings = JSON.parse(settingsStr);
}

updateUI();

function updateUI() {
    fetchSettings();
    if (!settings) return console.error("settings not found.");
    
    if (settings.show_debug_options) {
        document.querySelectorAll('.menu.debug_options').forEach((menu) => {
            menu.style.display = "flex";
        });
    } else {
        document.querySelectorAll('.menu.debug_options').forEach((menu) => {
            menu.style.display = "none";
        });
    }
}

export { updateUI };
