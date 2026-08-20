import { draw28, getCentredResizedPixelArray } from "./canvas.js";
import { getTestSet, classify } from "./classifier.js";
import { getRandomTestDigit } from "./helper.js";

const testSet = getTestSet();
const samplesPerDigit = (() => {
    let arr = [];
    for (const digitSet of testSet) {
        arr.push(digitSet.length);
    }
    return arr;
})();
const totalSamples = (() => {
    let count = 0;
    for (const digit of samplesPerDigit) {
        count += digit;
    }
    return count;
})();


function getResultsSummary(results) {
    let resultsSummary = {
        correct: 0,
        tests: 0
    };

    for (let i = 0; i < 10; i++) {
        resultsSummary.correct += results[i].correct;
        resultsSummary.tests += results[i].tests;
    }

    return resultsSummary;
}

function getRandomTestDigitNonReplace(sampleFromArray, draw = false) {
    const digit = Math.floor(Math.random() * 10);

    // All samples from the chosen digit
    const digitSamples = sampleFromArray[digit];
    
    if (digitSamples.length === 0) {
        return getRandomTestDigitNonReplace(sampleFromArray);
    }

    const index = Math.floor(Math.random() * digitSamples.length);
    let selectedSample = digitSamples[index];

    if (draw) {
        draw28(selectedSample);
        selectedSample = getCentredResizedPixelArray();
    }

    digitSamples.splice(index, 1);

    return {
        digit: digit,
        selectedSample: selectedSample
    };
}

// Test without replacement to make sure tests for a particular image aren't repeated
function kNN(tests, k, options = {}) {
    if (tests > totalSamples) return console.log(`Too few test images to execute test; max: ${totalSamples}`);

    // Array to pull digits from
    let sampleFromArray = structuredClone(testSet);
    
    let results = Array.from({ length: 10 }, () => ({ correct: 0, tests: 0 }));

    for (let i = 0; i < tests; i++) {

        let {digit, selectedSample} = getRandomTestDigitNonReplace(sampleFromArray, options.draw);

        // Run test
        const predictedDigit = classify.kNN(selectedSample, k);

        results[digit].tests++;
        if (predictedDigit === digit) results[digit].correct++;
    }

    return results;
}

function centroid(tests, options = {}) {
    if (tests > totalSamples) return console.log(`Too few test images to execute test; max: ${totalSamples}`);

    // Array to pull digits from
    let sampleFromArray = structuredClone(testSet);
    
    let results = Array.from({ length: 10 }, () => ({ correct: 0, tests: 0 }));

    for (let i = 0; i < tests; i++) {

        const {digit, selectedSample} = getRandomTestDigitNonReplace(sampleFromArray, options.draw);

        // Run test
        const predictedDigit = classify.closestCentroid(selectedSample);

        results[digit].tests++;
        if (predictedDigit === digit) results[digit].correct++;
    }

    return results;
}



// Print results

function generateResultsStr(testName, paramInfo, results) {
    let str = "--- Test suite --- \n";
    str += testName + '\n';
    if (paramInfo) str += paramInfo + "\n";

    str += '\n';

    let totalCorrect = 0;
    let totalTests = 0;
    for (let i = 0; i < 10; i++) {
        totalCorrect += results[i].correct;
        totalTests += results[i].tests;

        const accuracyPercent = results[i].tests !== 0 ? (results[i].correct / results[i].tests * 100).toFixed(2) : null;
        
        const accuracyPercentStr = accuracyPercent ? `${accuracyPercent}%` : "NA";

        str += `Digit: ${i}, Correct: ${results[i].correct}, Tests: ${results[i].tests}, Accuracy: ${accuracyPercentStr}\n`;
    }

    const totalAccuracyPercent = (totalCorrect / totalTests * 100).toFixed(2);
    str += `\nOverall performance -> Total correct: ${totalCorrect}, Total tests: ${totalTests}, Overall accuracy: ${totalAccuracyPercent}%`;

    return str;
}

// Test weapper functions to export
function kNN20() {
    const results = kNN(20, 7);
    const resultsStr = generateResultsStr("kNN20", "k = 7", results);
    console.log(resultsStr);
}

function kNN500() {
    const results = kNN(500, 7);
    const resultsStr = generateResultsStr("kNN500", "k = 7", results);
    console.log(resultsStr);
}

function centroid500() {
    const results = centroid(500, 7);
    const resultsStr = generateResultsStr("centroid500", null, results);
    console.log(resultsStr);
}

function kNN500_draw() {
    const results = kNN(500, 7, {draw: true});
    const resultsStr = generateResultsStr("kNN500_draw", "k = 7", results);
    console.log(resultsStr);
}

function kNN_testK(tests, k_min, k_max, k_interval) {
    let accuracies = [];

    for (let k = k_min; k <= k_max; k += k_interval) {
        const results = kNN(tests, k);
        const resultsStr = generateResultsStr("kNN", `k = ${k}`, results);
        console.log(resultsStr);

        const resultsSummary = getResultsSummary(results);
        accuracies.push({
            k: k,
            correct: resultsSummary.correct,
            tests: resultsSummary.tests
        });
    }

    console.log("\n\n --- Overall Accuracy Summary --- \n");

    for (let i = 0; i < accuracies.length; i++) {
        const {k, correct, tests} = accuracies[i];
        console.log(`k: ${k}, Correct: ${correct}, Tests: ${tests}`);
    }
}

function knn500_testK() {
    kNN_testK(500, 1, 13, 2);
}

const tests = {
    kNN20: kNN20,
    kNN500: kNN500,
    centroid500: centroid500,
    kNN500_draw: kNN500_draw,
    knn500_testK: knn500_testK
};

export { tests };
