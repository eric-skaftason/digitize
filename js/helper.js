import { drawImage } from "./canvas.js";

const model_urls = {
    centroids: './models/centroids.json',
    knn: './models/knn.json'
};

let models = {};

async function loadModel(key, url) {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to load JSON: ${response.status}`);
        }

        // Parse body text into json
        const model = await response.json();

        models[key] = model;

    } catch (error) {
        console.error(`Error loading model: ${error}`);
    }
}

async function loadModels() {
    for (const key in model_urls) {
        await loadModel(key, model_urls[key]);
    }
}


function getModels() {
    return models;
}


await loadModels();


export { getModels };