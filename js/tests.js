import { getTestSet, classify } from "./classifier.js";

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

// Test without replacement to make sure tests for a particular image aren't repeated
function test_kNN(k, tests) {
    if (tests < 0) return console.log("Cannot execute a negative number of tests.");
    if (tests > totalSamples) return console.log("Too few test images to execute test.");

    // Array to pull digits from
    let sampleFromArray = structuredClone(testSet);
    
    let results = Array.from({ length: 10 }, () => ({ correct: 0, tests: 0 }));

    for (let i = 0; i < tests; i++) {
        const digit = Math.floor(Math.random() * 10);

        // Samples from the chosen digit
        const digitSamples = sampleFromArray[digit];
        if (digitSamples.length === 0) {
            i--;
            continue;
        }
        const index = Math.floor(Math.random() * digitSamples.length);

        const selectedSample = digitSamples[index];

        // Remove sample from sample set
        digitSamples.splice(index, 1);

        // Run test
        const predictedDigit = classify.kNN(selectedSample, k);

        const isCorrect = predictedDigit === digit;

        results[digit].tests++;
        if (isCorrect) results[digit].correct++;
    }

    return results;
}

function generateResultsStr(testName, paramInfo, results) {
    let str = "--- Test suite --- \n";
    str += testName + '\n';
    if (paramInfo) str += paramInfo + "\n\n";

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

function kNN20() {
    const results = test_kNN(25, 20);

    const resultsStr = generateResultsStr("kNN20", "k = 25", results);

    console.log(resultsStr);
}

const tests = {
    kNN: test_kNN,
    kNN20: kNN20
};

export { tests };
