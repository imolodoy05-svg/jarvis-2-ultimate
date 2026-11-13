
const API_URL = "/api/ask";

const moduleNames = {
  general: "Главный ИИ",
  code: "Code Master",
  cyber: "Cyber Security",
  clash: "Clash Royale Master",
  chess: "Chess Master",
  pubg: "PUBG Intelligence",
  study: "Study Master",
  sport: "Sport Intelligence",
  web: "Web Intelligence",
  life: "Life Assistant",
  media: "Media Studio",
  documents: "Document Master",
  language: "Language Master",
  ios: "iPhone Control",
  memory: "Smart Memory",
  projects: "Project Builder",
  agents: "Multi-Agent",
  research: "Research Lab",
  security: "Security Guard",
  evolution: "Self Evolution"
};

let activeMode = "general";
let chatHistory = [];

const messages = document.getElementById("chatMessages");
const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const sendButton = document.getElementById("sendButton");
const activeModeLabel = document.getElementById("activeMode");
const clearButton = document.getElementById("clearChat");

function addMessage(text, sender = "assistant") {
  const message = document.createElement("div");
  message.className = `message ${sender}`;

  const name = document.createElement("span");
  name.className = "message-name";
  name.textContent = sender === "user" ? "ВЫ" : "JARVIS";

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  message.append(name, paragraph);
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;

  return message;
}

function selectModule(mode) {
  if (!moduleNames[mode]) return;

  activeMode = mode;

  document.querySelectorAll(".module").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.mode === mode
    );
  });

  activeModeLabel.textContent =
    `Активен: ${moduleNames[mode]}`;

  addMessage(
    `Режим ${moduleNames[mode]} выбран. Чем могу помочь?`
  );
}

document.querySelectorAll(".module").forEach(button => {
  button.addEventListener("click", () => {
    selectModule(button.dataset.mode);
  });
});

async function sendMessage(text) {
  const question = text.trim();
  if (!question) return;

  addMessage(question, "user");
  chatHistory.push({
    role: "user",
    content: question
  });

  input.value = "";
  sendButton.disabled = true;

  const loading = addMessage("Обрабатываю запрос...");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: question,
        mode: activeMode,
        history: chatHistory.slice(-12)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Ошибка сервера"
      );
    }

    const answer =
      data.answer ||
      data.output ||
      "Сервер вернул пустой ответ.";

    loading.remove();
    addMessage(answer);

    chatHistory.push({
      role: "assistant",
      content: answer
    });

    chatHistory = chatHistory.slice(-12);

  } catch (error) {
    loading.remove();

    addMessage(
      "Пока не удалось подключиться к серверу. " +
      "Проверь подключение и настройки сервера. " +
      "Подробности: " + error.message
    );
  } finally {
    sendButton.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  sendMessage(input.value);
});

clearButton.addEventListener("click", () => {
  messages.replaceChildren();
  chatHistory = [];

  addMessage(
    "История текущего диалога очищена. Готов к новым задачам."
  );
});

input.addEventListener("keydown", event => {
  if (
    event.key === "Enter" &&
    !event.shiftKey &&
    window.innerWidth > 600
  ) {
    event.preventDefault();
    form.requestSubmit();
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .catch(error => {
        console.warn("Service Worker:", error);
      });
  });
}

console.log("JARVIS 2.0: интерфейс загружен.");
