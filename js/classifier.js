import { getModels } from './helper.js';
import { drawImage, getCanvasPixelMatrix, getCanvasDataArray } from "./canvas.js";

const models = getModels();

// Use "k nearest neighbours (KNN)" algorithm
function classify(method) {
    let matchedDigit;
    switch(method) {
        case 'centroid':
            matchedDigit = getClosestCentroid();
            
    }
}

// returns array of len 10 with # of neighbours of digit n
// function getKnn(k, x, y) {
//     let digits = (() => {
//         let digits = [];
//         for (let i = 0; i < 10; i++) {
//             digits.push(0);
//         }
//         return digits;
//     })();

//     let farthestDist = 0;

//     for (let i = 0; i < templates.length; i++) {
//         const template = templates[i];

        
//     }
// }


// closest centroid matching
function getClosestCentroid() {

}

function getXYByIndex(index, width) {
    const x = index % width;
    const y = Math.floor(index / width);

    return {x: x, y: y};
}

function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    return Math.sqrt(dx ** 2, dy ** 2);
}
