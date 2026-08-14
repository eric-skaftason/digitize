// ----- Updates canvas ----- //

import { classify, classifyTest } from './classifier.js';
import { getRandomTestDigit } from './helper.js';

// Setup ->

const canvas = document.querySelector('#main_canvas');

// CSS Styling pixels
const rect = canvas.getBoundingClientRect();

let scaleX, scaleY;
initCanvasSize(112, 112);

const ctx = canvas.getContext('2d');

ctx.strokeStyle = "rgb(255, 255, 255)";
ctx.lineWidth = 6;

ctx.imageSmoothingEnabled = false;

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
    return getCanvasDataArrayDirect(canvas);
}

function getCanvasDataArrayDirectOld(canvasEle) {
    const context = canvasEle.getContext('2d');
    const rgba = context.getImageData(0, 0, canvasEle.width, canvasEle.height).data;
    
    // Convert from array in for [r1, g1, b1, a1, r2, g2, b2, a2, r3...] to an array with pixel luminance values

    let chrominance_arr = [];
    
    for (let i = 0; i < rgba.length / 4; i++) {
        const avergae_chrominance = (rgba[i * 4] + rgba[i * 4 + 1] + rgba[i * 4 + 2] + rgba[i * 4 + 3]) / 4;

        chrominance_arr.push(avergae_chrominance);
    }

    return chrominance_arr;
}

function getCanvasDataArrayDirect(canvasEle) {
    const context = canvasEle.getContext('2d');
    const rgba = context.getImageData(0, 0, canvasEle.width, canvasEle.height).data;
    
    // Convert from array in for [r1, g1, b1, a1, r2, g2, b2, a2, r3...] to an array with pixel luminance values

    let chrominance_arr = [];
    
    for (let i = 0; i < rgba.length / 4; i++) {

        // don't include alpha in avg chrominance value bc. black can have an a-value of 255 -> (0, 0, 0, 255)
        const average_chrominance = (rgba[i * 4] + rgba[i * 4 + 1] + rgba[i * 4 + 2]) / 3;
        const average_chrominance_clamped = average_chrominance / 255;

        chrominance_arr.push(average_chrominance_clamped);
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

function getXYByIndex(index, width) {
    const x = index % width;
    const y = Math.floor(index / width);

    return {x: x, y: y};
}

function getBoundingBox(pixelArray) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = 0;
    let maxY = 0;
    
    for (let i = 0; i < pixelArray.length; i++) {
        const {x, y} = getXYByIndex(i, canvas.width);

        if (pixelArray[i] === 0) continue;

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }

    return {
        minX: minX,
        minY: minY,
        maxX: maxX,
        maxY: maxY,
        box_width: maxX - minX + 1,
        box_height: maxY - minY + 1
    };
}

function getCentredResizedPixelArray(sideLen = 28, innerSquareSideLen = 20) {
    // centred bounding box helps to prevent incorrect prediction if the pixels are slightly shifted
    // Uses centre of mass to centre to canvas

    // Important info:
    // MNIST dataset scales digits to fit in a 20x20 box, centred in the 28x28 image
    
    const pixelArray = getCanvasDataArray();

    // Compute bounding box
    const {minX, minY, maxX, maxY, box_width, box_height} = getBoundingBox(pixelArray);
    const scaleFactor = innerSquareSideLen / Math.max(box_width, box_height);

    const scaledWidth = box_width * scaleFactor;
    const scaledHeight = box_height * scaleFactor;

    // Compute centre of mass
    let sumLuminance = 0;
    for (let i = 0; i < pixelArray.length; i++) {
        const luminance = pixelArray[i];
        sumLuminance += luminance;
    }

    if (sumLuminance === 0) {
        return new Array(sideLen * sideLen).fill(0);
    }

    let sumX = 0, sumY = 0;
    for (let i = 0; i < pixelArray.length; i++) {
        const luminance = pixelArray[i];
        const {x, y} = getXYByIndex(i, canvas.width);

        sumX += luminance * x;
        sumY += luminance * y;
    }
    // relative to scaled bounding box
    const centre = {
        x: ((sumX / sumLuminance) - minX) * scaleFactor,
        y: ((sumY / sumLuminance) - minY) * scaleFactor
    };

    // relative to scaled canvas
    const startingPos = {
        x: sideLen / 2 - centre.x,
        y: sideLen / 2 - centre.y
    };

    // Generate pixel array
    const resizedPixelArray = Array(sideLen * sideLen).fill(0);

    // Create temporary off-screen canvas to use for scaling
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = sideLen;
    tempCanvas.height = sideLen;
    const tempCtx = tempCanvas.getContext('2d');

    // Use image smooting to mimic MNIST smoothing
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';

    // Draw image from main canvas, scaled
    tempCtx.drawImage(
        canvas, // source
        minX, minY, // sample starting point from source
        box_width, box_height, // size of area to crop from source
        startingPos.x, startingPos.y, // starting point for drawing on the canvas
        scaledWidth, scaledHeight
    );


    return getCanvasDataArrayDirect(tempCanvas);
}

function getResizedPixelArray(pixelArray, sideLen) {
    const resizedPixelArray = Array(sideLen * sideLen).fill(0);

    // Create temporary off-screen canvas to use for scaling
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;

    drawImageDirect(tempCanvas, pixelArray);

    return getCanvasDataArrayDirect(tempCanvas);
}

function draw28(pixelArray) {
    if (canvas.width === 28) {
        drawImage(pixelArray);
        return;
    }

    const resizedPixelArray = Array(784).fill(0);

    // Create temporary off-screen canvas to use for scaling
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;

    drawImageDirect(tempCanvas, pixelArray);

    ctx.drawImage(tempCanvas, 0, 0, 28, 28, 0, 0, canvas.width, canvas.width);
}


function displayDebug28(pixelArray28) {
    const og_width = canvas.width;
    const og_height = canvas.height;

    canvas.width = 28;
    canvas.height = 28;

    drawImage(pixelArray28);

    setTimeout(() => {
        canvas.width = og_width;
        canvas.height = og_height;
    }, 2000);
}


// takes data from canvas, redraws onto canvas
function debugRedraw() {
    const canvasDataArray = getCanvasDataArray();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImage(canvasDataArray);
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

document.querySelector('#predict_centroid').addEventListener('click', () => {
    const predictedDigit = classify('centroid', getCentredResizedPixelArray());
    console.log(predictedDigit);
});

document.querySelector('#predict_knn').addEventListener('click', () => {
    const predictedDigit = classify('knn', getCentredResizedPixelArray());
    console.log(predictedDigit);
});

document.querySelector('#redraw').addEventListener('click', () => {
    debugRedraw();
});
document.querySelector('#debug28').addEventListener('click', () => {
    const processedPixels = getCentredResizedPixelArray();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw28(processedPixels);
});


document.querySelector('#rand_centroid').addEventListener('click', () => {
    const {data, digit} = getRandomTestDigit();

    draw28(data);

    const predictedDigit = classify('centroid', data);

    const status = digit === predictedDigit ? "Yes" : "No";
    console.log(`Predicted: ${predictedDigit}, Actual: ${digit}, Prediction correct: ${status}`);
});

document.querySelector('#rand_knn').addEventListener('click', () => {
    const {data, digit} = getRandomTestDigit();

    draw28(data);

    const predictedDigit = classify('knn', data);

    const status = digit === predictedDigit ? "Yes" : "No";
    console.log(`Predicted: ${predictedDigit}, Actual: ${digit}, Prediction correct: ${status}`);
});

document.querySelector('#draw_rand').addEventListener('click', () => {
    const {data, digit} = getRandomTestDigit();

    draw28(data);
});

document.querySelector('#test_centroid500').addEventListener('click', () => {
    classifyTest('centroid', 20);
});

document.querySelector('#test_knn500').addEventListener('click', () => {
    for (let i = 1; i <= 15; i += 1) {
        classifyTest('knn', 20, i);
    }
});


document.querySelector('#test_knn100_draw').addEventListener('click', () => {
    let correct = 0;
    for (let i = 1; i <= 100; i += 1) {
        const {data, digit} = getRandomTestDigit();

        draw28(data);

        const predictedDigit = classify('knn', getCentredResizedPixelArray());

        const status = digit === predictedDigit ? "Yes" : "No";
        if (digit === predictedDigit) correct++;
        console.log(`Predicted: ${predictedDigit}, Actual: ${digit}, Prediction correct: ${status}`);
    }

    console.log("Accuracy: ", (correct).toFixed(2), '%');
});

// Must have 28x28 canvas
function drawImage(pixel_array) {
    drawImageDirect(canvas, pixel_array);
}

function drawImageDirect(canvas, pixel_array) {
    const context = canvas.getContext('2d');
    for (let i = 0; i < pixel_array.length; i++) {
        const x = i % canvas.width;
        const y = Math.floor(i / canvas.width);

        const luminance = pixel_array[i] * 255;

        context.fillStyle = `rgb(${luminance}, ${luminance}, ${luminance})`;
        context.fillRect(x, y, 1, 1);
    }
}

export { drawImage, getCanvasPixelMatrix, getCanvasDataArray };
