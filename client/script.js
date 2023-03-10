import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");
const hero = document.querySelector('.hero')


let loadInterval;

function loader(element) {
    element.textContent = "";

    loadInterval = setInterval(() => {
        element.textContent += ".";

        if (element.textContent === "....") {
            element.textContent = "";
        }
    }, 300);
}

function typetext(element, text) {
    let index = 0;

    let interval = setInterval(() => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
        } else {
            clearInterval(interval);
        }
    }, 20);
}

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return `
      <div class="wrapper ${isAi && "ai"}">
        <div class="chat">
          <div class="profile">
            <img
              src="${isAi ? bot : user}"
              alt="${isAi ? "bot" : "user"}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `;
}

const handleSubmit = async(e) => {
    e.preventDefault();
    hero.classList.add('deactivate')
    const data = new FormData(form);

    //users chat stripe
    chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

    // clear the textarea
    form.reset();

    //bots chat stripe
    const uniqeId = generateUniqueId();
    chatContainer.innerHTML += chatStripe(true, " ", uniqeId);

    chatContainer.scrollTop = chatContainer.scrollHeight;

    const messageDiv = document.getElementById(uniqeId);

    loader(messageDiv);

    // fetch the data from the server

    const response = await fetch("https://chat-gpt-clone-nhin.onrender.com/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt: data.get("prompt"),
        }),
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = "";

    if (response.ok) {
        const data = await response.json();
        const parseData = data.bot.trim();

        typetext(messageDiv, parseData);
    } else {
        const err = await response.text();

        messageDiv.innerHTML = "Something Went Wrong.";
    }
};

form.addEventListener("submit", handleSubmit);

form.addEventListener("keyup", (e) => {

    if (e.keyCode == 13) {
        handleSubmit(e);
    }
});