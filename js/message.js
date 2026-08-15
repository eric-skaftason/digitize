const canvas = document.querySelector('#main_canvas');
const messageElements = document.querySelectorAll('.message .message_line'); // select all message_line elements within message div
const messageContainer = document.querySelector('.message');

const closeBtn = document.querySelector('.message #close_message');

// Must be initialised
messageContainer.style.display = 'none';


function printMessage(messageLinesArr, duration = 2500, fade = 500) {
    if (messageLinesArr.length !== 2) return console.error("Message length must be 2");

    // Print message
    for (let i = 0; i < messageElements.length; i++) {
        messageElements[i].innerText = messageLinesArr[i];
    }

    if (messageContainer.style.display !== 'none') return console.warn("Message already displayed. Updated message instead of creating new one.");


    messageContainer.style.display = 'flex';



    
    // Duration and fade will be left out for now
    return;
    setTimeout(() => {
        messageContainer.style.animation = `fadeToHidden ${fade}ms ease forwards`;
    }, duration);

    const onAnimation = () => {
        messageContainer.style.display = 'none';
        messageContainer.style.animation = 'none'; // reset the animation
        messageContainer.removeEventListener('animationend', onAnimation);
    }

    messageContainer.addEventListener('animationend', onAnimation);
}

function hideMessage() {
    messageContainer.style.display = 'none';
    messageContainer.style.animation = 'none'; // reset the animations
}


closeBtn.addEventListener('click', hideMessage);

// Remove message when the user starts to draw again
canvas.addEventListener('mousedown', hideMessage);


export { printMessage, hideMessage };
