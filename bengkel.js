const text = "Welcome To RASGARAGE";
const typingText = document.getElementById("typing-text");

let index = 0;

function typing() {
    if (index < text.length) {
        typingText.textContent += text[index];
        index++;
        setTimeout(typing, 100);
    }
}

typing()
