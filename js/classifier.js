import { drawTemplate, getTemplates } from './helper.js';
import { drawImage, getCanvasPixelMatrix } from "./canvas.js";

const templates = getTemplates();

// Use "k nearest neighbours (KNN)" algorithm
function classify() {
    const canvas_matrix = getCanvasPixelMatrix();

    // k in pixels
    const k = 10;
}



