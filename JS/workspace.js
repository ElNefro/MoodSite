
let userRole = localStorage.getItem("workspace_role");
let userPersonality = localStorage.getItem("workspace_personality");

if (!userRole || !userPersonality) {
    alert("Настройки не найдены. Пожалуйста, выберите роль и тип личности сначала.");
    window.location.href = "../HTML/select.html";
}


const bodyEl = document.body;
bodyEl.classList.add(userPersonality);


const personalityNames = {
    melancholic: "Меланхолик (вдумчивый, творческий)",
    sanguine: "Сангвиник (энергичный, коммуникабельный)",
    choleric: "Холерик (решительный, страстный)",
    phlegmatic: "Флегматик (спокойный, стабильный)"
};
const roleNames = {
    programmer: "Программист",
    designer: "Дизайнер"
};
document.getElementById("welcomeTitle").innerHTML =
    `💼 Рабочий стол: ${roleNames[userRole]} · ${personalityNames[userPersonality]}`;
document.getElementById("personalityDesc").innerHTML =
    `Стиль окружения, музыка и советы ИИ адаптированы под ${personalityNames[userPersonality].toLowerCase()}.`;
document.getElementById("aiModeTag").innerHTML =
    `режим: ${roleNames[userRole]}, ${userPersonality.slice(0, 4)}`;


const playlistLinks = {
    phlegmatic: "https://music.yandex.ru/iframe/playlist/vallery2008/1008",    // Флегматик
    sanguine: "https://music.yandex.ru/iframe/playlist/vallery2008/1006",      // Сангвиник
    choleric: "https://music.yandex.ru/iframe/playlist/vallery2008/1005",      // Холерик
    melancholic: "https://music.yandex.ru/iframe/playlist/vallery2008/1007"    // Меланхолик
};



function updatePlaylist() {
    const iframe = document.getElementById('yandex-music-player');
    if (iframe && playlistLinks[userPersonality]) {
        iframe.src = playlistLinks[userPersonality];
        console.log(`🎵 Плейлист загружен для: ${userPersonality}`);
    }
}


const programmerApps = [
    { name: "💻 VS Code", url: "https://vscode.dev", icon: "📝" },
    { name: "🐙 GitHub", url: "https://github.com", icon: "🐙" },
    { name: "🖥️ CodePen", url: "https://codepen.io", icon: "✒️" },
    { name: "📊 JSON Crack", url: "https://jsoncrack.com", icon: "🔍" },
    { name: "🐳 Docker", url: "https://labs.play-with-docker.com", icon: "🐳" }
];
const designerApps = [
    { name: "🎨 Figma", url: "https://figma.com", icon: "🎨" },
    { name: "🖌️ Adobe Color", url: "https://color.adobe.com", icon: "🌈" },
    { name: "📸 Behance", url: "https://behance.net", icon: "✨" },
    { name: "✏️ Coolors", url: "https://coolors.co", icon: "🎨" },
    { name: "🖼️ Freepik", url: "https://freepik.com", icon: "🖼️" }
];

const apps = userRole === "programmer" ? programmerApps : designerApps;
const hotbarDiv = document.getElementById("hotbarContainer");
apps.forEach((app) => {
    const appDiv = document.createElement("div");
    appDiv.className = "app-icon";
    appDiv.innerHTML = `<div style="font-size:1.7rem">${app.icon}</div><span>${app.name}</span>`;
    appDiv.addEventListener("click", () => window.open(app.url, "_blank"));
    hotbarDiv.appendChild(appDiv);
});



const chatMessagesDiv = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
let isLoading = false;


const API_KEY = "sk-acbaaaa3a95d46f8a789340e130c2837";
const API_URL = "https://api.deepseek.com/v1/chat/completions";

function addMessage(text, isUser) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${isUser ? "user-msg" : "ai-msg"}`;
    msgDiv.innerText = text;
    chatMessagesDiv.appendChild(msgDiv);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}

function addTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.className = "message ai-msg typing-indicator";
    typingDiv.id = "typingIndicator";
    typingDiv.innerHTML = "🤔 DeepSeek печатает<span>.</span><span>.</span><span>.</span>";
    chatMessagesDiv.appendChild(typingDiv);
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById("typingIndicator");
    if (indicator) {
        indicator.remove();
    }
}


function getSystemPrompt(role, personality) {
    const personalityTraits = {
        melancholic: "Ты вдумчивый, аналитичный, любишь детали и структуру. Отвечай спокойно, обстоятельно, с примерами.",
        sanguine: "Ты энергичный, дружелюбный, любишь общение. Отвечай позитивно, с энтузиазмом, используй эмодзи.",
        choleric: "Ты решительный, страстный, прямолинейный. Отвечай четко, по делу, без лишних слов.",
        phlegmatic: "Ты спокойный, стабильный, рассудительный. Отвечай размеренно, логично, без спешки."
    };

    const rolePrompts = {
        programmer: "Ты — AI-ассистент программиста. Помогаешь с кодом, архитектурой, отладкой, технологиями. Давай практические советы и примеры кода.",
        designer: "Ты — AI-ассистент дизайнера. Помогаешь с UI/UX, цветами, композицией, инструментами дизайна. Давай творческие советы и референсы."
    };

    return `${rolePrompts[role]} Твой тип личности: ${personality} (${personalityTraits[personality]}). Отвечай на русском языке, будь полезным и дружелюбным.`;
}


async function sendToAI(userMessage) {
    if (isLoading) return;
    isLoading = true;

    addTypingIndicator();

    try {
        const systemPrompt = getSystemPrompt(userRole, userPersonality);


        const conversationHistory = [];
        const messages = document.querySelectorAll('.message');


        const lastMessages = Array.from(messages).slice(-10);
        for (const msg of lastMessages) {
            const isUserMsg = msg.classList.contains('user-msg');
            const text = msg.innerText;
            if (text && !text.includes('DeepSeek печатает')) {
                conversationHistory.push({
                    role: isUserMsg ? "user" : "assistant",
                    content: text
                });
            }
        }


        const fullMessages = [
            {
                role: "system",
                content: systemPrompt
            },
            ...conversationHistory,
            {
                role: "user",
                content: userMessage
            }
        ];

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: fullMessages,
                temperature: 0.7,
                max_tokens: 1000,
                stream: false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("DeepSeek API Error:", errorData);
            throw new Error(errorData.error?.message || `Ошибка ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        removeTypingIndicator();
        addMessage(aiResponse, false);

    } catch (error) {
        console.error("Ошибка при обращении к DeepSeek API:", error);
        removeTypingIndicator();

        let errorMessage = "❌ Ошибка подключения к DeepSeek: ";

        if (error.message.includes("API key") || error.message.includes("authentication")) {
            errorMessage += "неверный API ключ. ";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
            errorMessage += "проверьте интернет-соединение. ";
        } else if (error.message.includes("CORS")) {
            errorMessage += "проблема CORS. ";
        } else {
            errorMessage += error.message + ". ";
        }

        errorMessage += "\n💡 Использую локальный режим ответов...";
        addMessage(errorMessage, false);


        setTimeout(() => {
            const localResponse = getLocalAIResponse(userMessage, userRole, userPersonality);
            addMessage(localResponse, false);
        }, 500);
    } finally {
        isLoading = false;
    }
}


function getLocalAIResponse(userMessage, role, personality) {
    const msg = userMessage.toLowerCase();
    const personalityName = personalityNames[personality];

    if (role === "programmer") {
        if (msg.includes("код") || msg.includes("ошибк") || msg.includes("debug"))
            return `[Программист • ${personalityName}] 🔧 Попробуй написать юнит-тесты. Для твоего типа личности (${personalityName}) советую работать с четкой документацией. Нужна помощь с конкретным кодом?`;
        if (msg.includes("проект") || msg.includes("задача"))
            return `📋 Как ${personalityName}, ты можешь структурировать задачи через Kanban или Trello. Хочешь шаблон для организации работы?`;
        if (msg.includes("javascript") || msg.includes("js"))
            return `💻 JavaScript - отличный выбор! Для ${personalityName} рекомендую изучать через практические проекты. Что именно интересует?`;
        if (msg.includes("python"))
            return `🐍 Python идеально подходит для ${personalityName}. Начни с простых скриптов, постепенно усложняя логику.`;
        return `👋 Привет, коллега-программист! Твой тип ${personalityName} отлично подходит для глубокого анализа кода. Что нужно пофиксить или создать?`;
    } else {
        if (msg.includes("макет") || msg.includes("ui") || msg.includes("ux"))
            return `🎨 Дизайнер с типом ${personalityName} — отличное чутье на композицию! Посоветую изучить референсы на Behance или Dribbble. Работаешь над веб-дизайном или мобильным приложением?`;
        if (msg.includes("цвет") || msg.includes("палитр"))
            return `🎨 Для ${personalityName} подойдут мягкие градиенты или контрастные сочетания. Попробуй coolors.co для генерации палитр! Хочешь подобрать цвета для конкретного проекта?`;
        if (msg.includes("figma"))
            return `✨ Figma - отличный инструмент! Для ${personalityName} советую изучить компоненты и автолейауты. Нужна помощь с конкретной функцией?`;
        if (msg.includes("логотип") || msg.includes("лого"))
            return `🎯 Создание логотипа для ${personalityName} - это поиск баланса между простотой и выразительностью. Расскажи о бренде, помогу с идеями!`;
        return `🎨 Творческий подход + ${personalityName} даёт уникальный стиль! Какая задача по дизайну тебя волнует? Могу помочь с идеями, инструментами или референсами.`;
    }
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text || isLoading) return;

    addMessage(text, true);
    chatInput.value = "";


    await sendToAI(text);
}

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});


const styleEl = document.createElement('style');
styleEl.textContent = `
    .typing-indicator span {
        animation: blink 1.4s infinite;
        animation-fill-mode: both;
    }
    .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
    }
    .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
    }
    @keyframes blink {
        0%, 80%, 100% { opacity: 0; }
        40% { opacity: 1; }
    }
`;
document.head.appendChild(styleEl);


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePlaylist);
} else {
    updatePlaylist();
}


window.addEventListener("beforeunload", () => {
    if (audioCtx) audioCtx.close();
});
