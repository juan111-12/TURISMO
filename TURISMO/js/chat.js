document.addEventListener("DOMContentLoaded", () => {
    const chatbotToggle = document.getElementById("chatbot-toggle");
    const chatbotContainer = document.getElementById("chatbot-container");
    const closeChatbot = document.getElementById("close-chatbot");
    const chatWindow = document.getElementById("chat-window");
    const userInput = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-btn");

    loadMessages();

    chatbotToggle.addEventListener("click", () => {
        chatbotContainer.classList.toggle("hidden");
    });

    closeChatbot.addEventListener("click", () => {
        chatbotContainer.classList.add("hidden");
    });

    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") sendMessage();
    });

    function cleanMessage(message) {
        return message.replace(/http[s]?:\/\/[^\s]+/g, "")
                      .replace(/www\.[^\s]+/g, "")
                      .replace(/\b(?:turismocordobacomar|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g, "")
                      .replace(/[^a-zA-Z0-9\s,áéíóúÁÉÍÓÚüÜñÑ:?]/g, "");
    }

    function getFormattedTime() {
        const fecha = new Date();
        let horas = fecha.getHours();
        const minutos = fecha.getMinutes().toString().padStart(2, "0");
        const formato = horas >= 12 ? "PM" : "AM";
        horas = horas % 12 || 12;
        return `${horas}:${minutos} ${formato}`;
    }

    function getYear() {
        return new Date().getFullYear().toString();
    }

    async function sendMessage() {
        let message = userInput.value.trim().toLowerCase();
        if (!message) return;

        message = cleanMessage(message);
        const tokens = message.split(/\s+/).slice(0, 50).join(" ");

        appendMessage("user", tokens);
        saveMessage("user", tokens);
        userInput.value = "";

        // Respuestas directas sin llamar a la IA
        if (tokens.includes("qué hora es") || tokens.includes("que hora es") || tokens.includes("dime la hora")) {
            let currentTime = getFormattedTime();
            appendMessage("bot", currentTime);
            saveMessage("bot", currentTime);
            playNotificationSound();
            speakText(currentTime);
            return;
        }

        if (tokens.includes("qué año es") || tokens.includes("que año es") || tokens.includes("en qué año estamos")) {
            let currentYear = getYear();
            appendMessage("bot", currentYear);
            saveMessage("bot", currentYear);
            playNotificationSound();
            speakText(currentYear);
            return;
        }

        const systemMessage = {
            role: "system",
            content: "Eres Jarvitur, un guía turístico de Alta Gracia, Córdoba, Argentina. Responde de forma precisa, sin información adicional, y toda la informacion es actual del año 2025. Usa el formato de 12 horas con AM/PM. No agregues contexto extra a menos que sea necesario, te presentaras una unica vez cuando el usuario te saluda una sola vez te vas a presentar luego si te vuelve a saludar solo di en que te puedo ayudar."
        };

        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer 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"
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini-search-preview",
                    messages: [systemMessage, { role: "user", content: tokens }]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message);

            let botResponse = data.choices[0].message.content;
            botResponse = cleanMessage(botResponse);

            appendMessage("bot", botResponse);
            saveMessage("bot", botResponse);
            playNotificationSound();
            speakText(botResponse);

        } catch (error) {
            console.error("Error:", error);
            const errorMessage = "Hubo un error al procesar tu solicitud.";
            appendMessage("bot", errorMessage);
            saveMessage("bot", errorMessage);
            playNotificationSound();
            speakText(errorMessage);
        }
    }

    function appendMessage(sender, text) {
        const messageBox = document.createElement("div");
        messageBox.className = "message-box";
        const title = document.createElement("span");
        title.className = "title";
        const content = document.createElement("span");
        content.className = "content";
        title.innerText = sender === "user" ? "Usuario" : "Jarvitur";
        messageBox.appendChild(title);
        messageBox.appendChild(content);
        content.innerHTML = text;
        chatWindow.appendChild(messageBox);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    function saveMessage(sender, text) {
        let messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
        messages.push({ sender, text });
        localStorage.setItem("chatMessages", JSON.stringify(messages));
    }

    function loadMessages() {
        let messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
        messages.forEach(msg => appendMessage(msg.sender, msg.text));
    }

    function playNotificationSound() {
        const audio = new Audio("./musica/notificacion.mp3");
        audio.play();
    }

    function speakText(text) {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "es-AR";
        speech.rate = 1;
        speech.pitch = 1;
        speechSynthesis.speak(speech);
    }
});
