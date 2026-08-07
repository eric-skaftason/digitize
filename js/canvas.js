// ----- Updates canvas ----- //

import { classify, classifyTest } from './classifier.js';
import { getRandomTestDigit } from './helper.js';

// Setup ->

const canvas = document.querySelector('.canvas');

// CSS Styling pixels
const rect = canvas.getBoundingClientRect();

let scaleX, scaleY;
initCanvasSize(28, 28);

const ctx = canvas.getContext('2d');

ctx.strokeStyle = "rgb(255, 255, 255)";
ctx.lineWidth = 0.5;


// App data ->

let isMouseDown = false;

const bounds = {
    x_min: null,
    x_max: null,
    y_min: null,
    y_max: null
};

function initCanvasSize(width, height) {
    // Internal # of pixels
    canvas.width = width;
    canvas.height = height;

    scaleX = canvas.width / rect.width;
    scaleY = canvas.height / rect.height;
}

function getMouseXY(event) {
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    return {
        x: mouseX,
        y: mouseY
    };
}

function updateBounds(x, y) {
    if (x < bounds.x_min || bounds.x_min === null) {
        bounds.x_min = x;
    }
    if (x < bounds.x_max || bounds.x_max === null) {
        bounds.x_max = x;
    }
    if (y < bounds.y_min || bounds.y_min === null) {
        bounds.y_min = y;
    }
    if (y < bounds.y_max || bounds.y_max === null) {
        bounds.y_max = y;
    }
}

// Classification & Computation

// get painted canvas data as an array 
function getCanvasDataArray() {
    const rgba = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    
    // Convert from array in for [r1, g1, b1, a1, r2, g2, b2, a2, r3...] to an array with pixel luminance values

    let chrominance_arr = [];
    
    for (let i = 0; i < rgba.length / 4; i++) {
        const avergae_chrominance = (rgba[i * 4] + rgba[i * 4 + 1] + rgba[i * 4 + 2] + rgba[i * 4 + 3]) / 4;

        chrominance_arr.push(avergae_chrominance);
    }

    return chrominance_arr;
}

function getCanvasPixelMatrix() {
    const chrominance_arr = getCanvasDataArray();

    let matrix = [];

    for (let i = 0; i < canvas.height; i++) {
        let row = [];
        for (let j = 0; j < canvas.width; j++) {
            row.push(chrominance_arr[i * canvas.width + j]);
        }
        matrix.push(row);
    }
}


// I/O
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

    updateBounds(mouse.x, mouse.y);

    // Draw from old starting point to current position
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();

    // Reset starting point
    ctx.moveTo(mouse.x, mouse.y)
    
});


// Canvas menu buttons
const clearBtn = document.querySelector('#clear');
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.querySelector('#predict').addEventListener('click', () => {
    const predictedDigit = classify('centroid', getCanvasDataArray());
    console.log(predictedDigit)
});

document.querySelector('#predict_rand').addEventListener('click', () => {
    const {data, digit} = getRandomTestDigit();

    drawImage(data);

    const predictedDigit = classify('centroid', data);

    const status = digit === predictedDigit ? "Yes" : "No";
    console.log(`Predicted: ${predictedDigit}, Actual: ${digit}, Prediction correct: ${status}`);
});

document.querySelector('#predict_test').addEventListener('click', () => {
    classifyTest('centroid', 20);
});


// Must have 28x28 canvas
function drawImage(pixel_array) {
    for (let i = 0; i < pixel_array.length; i++) {
        const x = i % canvas.width;
        const y = Math.floor(i / canvas.width);

        const luminance = pixel_array[i] * 255;

        ctx.fillStyle = `rgb(${luminance}, ${luminance}, ${luminance})`;
        ctx.fillRect(x, y, 1, 1);
    }
}

export { drawImage, getCanvasPixelMatrix, getCanvasDataArray };