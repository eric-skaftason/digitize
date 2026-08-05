// --- Vector precomputation for template matching in OCR --- //
// run with node js

import mnist from 'mnist';
import fs from 'fs/promises'; // use promise (await) API instead of callbacks

// Create a training set of 1000 and a test set of 100
const set = mnist.set(1000, 100);

const trainingSet = set.training;
const testSet = set.test;


async function generateTemplates() {
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
        const sample_data = trainingSet[i];

        // stores values quantised to 0 or 1 for each pixel in a 28*28 grid
        const sample_arr = sample_data.input;

        // The pos in the array that is 1 is the digit
        const digit_arr = sample_data.output;
        const digit = digit_arr.indexOf(1);

        for (let j = 0; j < 784; j++) {
            vectors[digit][j] += sample_arr[j];
        }

        digitCount[digit]++;
    }

    // normalise to [0, 1]
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 784; j++) {
            vectors[i][j] /= digitCount[i];
        }
    }


    // Ensure templates folder exists; create new directory if it doesn't
    // Recursive presents error if the folder is already created
    await fs.mkdir('./templates', { recursive: true });

    const jsonStringVectors = JSON.stringify(vectors);

    // Write, overwrite, or create a template json file in the templates dir
    await fs.writeFile('./templates/template.json', jsonStringVectors, 'utf-8');

}

generateTemplates();
