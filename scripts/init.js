// --- Vector precomputation for template matching in OCR --- //
// run with node js

import mnist from 'mnist';
import fs from 'fs/promises'; // use promise (await) API instead of callbacks

// Create a training set of x and a test set of y
const set = mnist.set(2000, 1000);

const trainingSet = set.training;
const testSet = set.test;


// generates 10 mean vectors for nearest centroid algorithm
async function gernerateCentroids() {
    // Stores 10 vectors for each digit
    let vectors = (() => {
        let arr = [];
        for (let i = 0; i < 10; i++) {
            let sub_arr = [];
            for (let i = 0; i < 784; i++) {
                sub_arr.push(0);
            }
            arr.push(sub_arr);
        }
        return arr;
    })();
    let digitCount = (() => {
        let arr = [];
        for (let i = 0; i < 10; i++) {
            arr.push(0);
        }
        return arr;
    })();


    // compute set samples to create a vector
    for (let i = 0; i < trainingSet.length; i++) {
        const sample_data = getSampleDataByIndex(i);
        const digit = getDigitByIndex(i);

        for (let j = 0; j < 784; j++) {
            vectors[digit][j] += sample_data[j];
        }

        digitCount[digit]++;
    }

    // normalise to [0, 1]
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 784; j++) {
            vectors[i][j] /= digitCount[i];
        }
    }

    await saveJSON('centroids', vectors);

}

// generates n vectors for k-NN
async function gernerateKNN() {
    let vectors = (() => {
        let arr = [];
        for (let i = 0; i < 10; i++) {
            arr.push([]);
        }
        return arr;
    })();

    for (let i = 0; i < trainingSet.length; i++) {
        const sample_data = getSampleDataByIndex(i);
        const digit = getDigitByIndex(i);

        vectors[digit].push(sample_data);
    }

    await saveJSON('knn', vectors);
}


async function saveJSON(file_name, json) {
    // Ensure templates folder exists; create new directory if it doesn't
    // Recursive presents error if the folder is already created
    await fs.mkdir('./models', { recursive: true });

    const jsonString = JSON.stringify(json);

    // Write, overwrite, or create a template json file in the templates dir
    await fs.writeFile(`./models/${file_name}.json`, jsonString, 'utf-8');
}

function getSampleDataByIndex(index) {
    const sample_data = trainingSet[index];
    return sample_data.input;
}

function getDigitByIndex(index) {
    const sample_data = trainingSet[index];
    const digit_arr = sample_data.output;
    return digit_arr.indexOf(1);
}


async function gernerateTestSet() {
    let vectors = (() => {
        let arr = [];
        for (let i = 0; i < 10; i++) {
            arr.push([]);
        }
        return arr;
    })();

    for (let i = 0; i < testSet.length; i++) {
        const sample_data = testSet[i].input;
        const digit = testSet[i].output.indexOf(1);

        vectors[digit].push(sample_data);
    }

    await saveJSON('test', vectors);
}


async function generateModels() {
    // Generate models & save to JSON files
    await gernerateCentroids();
    await gernerateKNN();

    // Save the test set to JSON file
    await gernerateTestSet();
}

generateModels();