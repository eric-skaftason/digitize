import { getModels } from './helper.js';

const models = getModels();

// Use "k nearest neighbours (KNN)" algorithm
function classify(method, canvasDataArray) {
    let matchedDigit;
    switch(method) {
        case 'centroid':
            matchedDigit = getClosestCentroid(canvasDataArray);
            break; 
    }


    return matchedDigit;
}

function classifyTest(method, testsPerdigit) {
    if (testsPerdigit < 1 || testsPerdigit > models.test[0].length) return console.error("Invalid # of tests.");

    let digitCorrect = (() => {
        let arr = [];
        for (let i = 0; i < 10; i++) {
            arr.push(0);
        }
        return arr;
    })();
    let totalCorrect = 0;

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < testsPerdigit; j++) {
            // Code for each digit's test

            const testDataArray = models.test[i][j];
            const actualDigit = i;

            const predictedDigit = classify(method, testDataArray);

            if (actualDigit === predictedDigit) {
                digitCorrect[i]++;
                totalCorrect++;
            }
        }
    }

    console.log("--- Accuracy Report ---");
    for (let i = 0; i < 10; i++) {
        const accuracyPercent = ((digitCorrect[i] / testsPerdigit) * 100).toFixed(2);
        console.log(`Digit: ${i}, Correct: ${digitCorrect[i]}, Incorrect: ${testsPerdigit - digitCorrect[i]}, Accuracy: ${accuracyPercent}%`);
    }

    const totalAccuracyPercent = ((totalCorrect / (testsPerdigit * 10)) * 100).toFixed(2);
    console.log(`Total correct: ${totalCorrect}, Total incorrect: ${testsPerdigit * 10 - totalCorrect}, Total accuracy: ${totalAccuracyPercent}%`);

}


// closest centroid matching
function getClosestCentroid(canvasDataArray) {
    // use euclidean distance formula for n dimensions

    if (canvasDataArray.length !== models.centroids[0].length) return console.error("Length mismatch of canvas data array and centroid model");

    let digit;
    let minDist = null;

    for (let i = 0; i < 10; i++) {
        const templateVector = models.centroids[i];

        let sum = 0;
        for (let j = 0; j < canvasDataArray.length; j++) {
            sum += (canvasDataArray[j] - templateVector[j]) ** 2;
        }
        const dist = Math.sqrt(sum);

        if (dist < minDist || minDist === null) {
            minDist = dist
            digit = i;
        }
    }

    return digit;
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


export { classify, classifyTest };