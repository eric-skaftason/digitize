import { 
    predictCentroid, predictKNN,
    drawRandomTestDigit, clear,
    testCentroid500, testKNN500, testKNN100_draw,
    debugRedraw, debug28
} from "./canvas.js";

import {
    getSetting, saveSettings, openSettingsMenu, closeSettingsMenu, saveAndClose, discardAndClose, toggle
} from "./settings.js"

// Predict
document.querySelector('#predict')?.addEventListener('click', predictKNN);
document.querySelector('#predict_centroid')?.addEventListener('click', predictCentroid);
document.querySelector('#predict_knn')?.addEventListener('click', predictKNN);

// Draw
document.querySelector('#redraw')?.addEventListener('click', debugRedraw);
document.querySelector('#draw_rand')?.addEventListener('click', drawRandomTestDigit);
document.querySelector('#clear')?.addEventListener('click', clear);

// Benchmarking tests
document.querySelector('#test_centroid500')?.addEventListener('click', testCentroid500);
document.querySelector('#test_knn500')?.addEventListener('click', testKNN500);
document.querySelector('#test_knn100_draw')?.addEventListener('click', testKNN100_draw);

// I/O
const canvas = document.querySelector('#main_canvas');
const ctx = canvas.getContext('2d');

let rect = canvas.getBoundingClientRect();

let scaleX, scaleY;
initCanvasSize(112, 112);

ctx.strokeStyle = "rgb(255, 255, 255)";
ctx.lineWidth = 6;
ctx.imageSmoothingEnabled = false;

function initCanvasSize(width, height) {
    // Internal # of pixels
    canvas.width = width;
    canvas.height = height;

    scaleX = canvas.width / rect.width;
    scaleY = canvas.height / rect.height;
}

let isMouseDown = false;

function getMouseXY(event) {
    rect = canvas.getBoundingClientRect();
    
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    return {
        x: mouseX,
        y: mouseY
    };
}

document.addEventListener('mousedown', (event) => {
    if (event.target !== canvas) return;
        
    isMouseDown = true;
    
    const mouse = getMouseXY(event);

    ctx.moveTo(mouse.x, mouse.y);
});

document.addEventListener('mouseup', (event) => {
    isMouseDown = false;

    ctx.beginPath();
});

canvas.addEventListener('mousemove', (event) => {
    if (!isMouseDown) return;

    const mouse = getMouseXY(event);

    // Draw from old starting point to current position
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();

    // Reset starting point
    ctx.moveTo(mouse.x, mouse.y);
});


// Settings menu
document.querySelector('#settings')?.addEventListener('click', openSettingsMenu);
document.querySelector('#close_settings_menu_top_right')?.addEventListener('click', discardAndClose);

document.querySelectorAll('.toggle').forEach((toggleElement) => {
    toggleElement.addEventListener('click', (event) => {toggle(toggleElement)});
});

// Menu footer
document.querySelector("#close_settings_menu").addEventListener("click", discardAndClose);
document.querySelector("#save_settings").addEventListener("click", saveSettings);
document.querySelector("#save_settings_close_menu").addEventListener("click", saveAndClose);