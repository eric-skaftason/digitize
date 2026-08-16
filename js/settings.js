// 

function openSettingsMenu() {
    document.querySelector('.modal_settings').style.display = "flex";
}

function closeSettingsMenu() {
    document.querySelector('.modal_settings').style.display = "none";
}

function toggle(toggleElement) {
    if (toggleElement.classList.contains('enabled')) {
        toggleElement.classList.remove('enabled')
    } else {
        toggleElement.classList.add('enabled')
    }
}

export { openSettingsMenu, closeSettingsMenu, toggle };
