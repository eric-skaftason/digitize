// ----- Updates canvas ----- //

// Setup ->

const canvas = document.querySelector('.canvas');
// Internal # of pixels
canvas.width = 300;
canvas.height = 300;

// CSS Styling pixels
const rect = canvas.getBoundingClientRect();

const scaleX = canvas.width / rect.width;
const scaleY = canvas.height / rect.height;

const ctx = canvas.getContext('2d');

ctx.strokeStyle = "#f8fafc";
ctx.lineWidth = 4;


// App data ->

let isMouseDown = false;

const bounds = {
    x_min: null,
    x_max: null,
    y_min: null,
    y_max: null
};


function getMouseXY(event) {
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    return {
        x: mouseX,
        y: mouseY
    };
}

function updateBounds(x, y) {
    if (x < bounds.x_min || bounds.x_min === null) {
        bounds.x_min = x;
    }
    if (x < bounds.x_max || bounds.x_max === null) {
        bounds.x_max = x;
    }
    if (y < bounds.y_min || bounds.y_min === null) {
        bounds.y_min = y;
    }
    if (y < bounds.y_max || bounds.y_max === null) {
        bounds.y_max = y;
    }
}

document.addEventListener('mousedown', (event) => {
    if (event.target !== canvas) return;
        
    isMouseDown = true;
    
    const mouse = getMouseXY(event);

    ctx.moveTo(mouse.x, mouse.y);
});

document.addEventListener('mouseup', (event) => {
    isMouseDown = false;

    ctx.beginPath();
});



canvas.addEventListener('mousemove', (event) => {
    if (!isMouseDown) return;

    const mouse = getMouseXY(event);

    updateBounds(mouse.x, mouse.y);

    // Draw from old starting point to current position
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();

    // Reset starting point
    ctx.moveTo(mouse.x, mouse.y)
    
});


// Canvas menu buttons
const clearBtn = document.querySelector('#clear');
clearBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});
