// ----- Updates canvas ----- //

import { classify, classifyTest } from './classifier.js';
import { getRandomTestDigit } from './helper.js';
import { printMessage, hideMessage, printPrediction } from "./message.js";

const canvas = document.querySelector('#main_canvas');
const rect = canvas.getBoundingClientRect();
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Classification & Computation

// get painted canvas data as an array 
function getCanvasDataArray() {
    return getCanvasDataArrayDirect(canvas);
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

// unused
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

// draws 28x28 image to full size canvas
function draw28(pixelArray28) {
    if (canvas.width === 28) {
        drawImage(pixelArray28);
        return;
    }

    const resizedPixelArray = Array(784).fill(0);

    // Create temporary off-screen canvas to use for scaling
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 28;
    tempCanvas.height = 28;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;

    drawImageDirect(tempCanvas, pixelArray28);

    ctx.drawImage(tempCanvas, 0, 0, 28, 28, 0, 0, canvas.width, canvas.width);
}
function debug28() {
    const processedPixels = getCentredResizedPixelArray();
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    draw28(processedPixels);
}

// Deprecated
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


// --- Export functions --- //

// Prediction
function predictCentroid() {
    const predictedDigit = classify('centroid', getCentredResizedPixelArray());
    printPrediction("centroid", predictedDigit);
}

function predictKNN() {
    const predictedDigit = classify('knn', getCentredResizedPixelArray());
    printPrediction("k-NN", predictedDigit);
}

// Draw
function drawRandomTestDigit() {
    const {data, digit} = getRandomTestDigit();
    draw28(data);
}

// Benchmarking Tests
function testCentroid500() {
    classifyTest('centroid', 20);
}

function testKNN500() {
    for (let i = 1; i <= 15; i += 1) {
        classifyTest('knn', 20, i);
    }
}

function testKNN100_draw() {
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
}

export {
    predictCentroid, predictKNN,
    drawRandomTestDigit,
    testCentroid500, testKNN500, testKNN100_draw,
    debugRedraw, debug28
};


// Canvas menu buttons
const clearBtn = document.querySelector('#clear');
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hideMessage();
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

export { getCanvasDataArray };
