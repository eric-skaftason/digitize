import { drawImage } from "./canvas.js";

let templates;

async function loadTemplate() {
    try {
        const response = await fetch('./templates/template.json');

        if (!response.ok) {
            throw new Error(`Failed to load JSON: ${response.status}`);
        }
        
        // Parse body text into json
        templates = await response.json();

    } catch (error) {
        console.error('Error fetching JSON:', error);
    }
}

await loadTemplate();

function drawTemplate(digit) {
    drawImage(templates[7]);
}

function getTemplates() {
    return templates;
}


export { drawTemplate, getTemplates };