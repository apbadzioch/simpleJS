// First thought on how to create chatbot
/*
function getBotResponse(message) {
    message = message.toLowerCase();

    if (message.includes("hello") || message.includes("hi")) {
        return "Hi, how can I help you today?";
    } else if (message.includes("project")) {
        return "You can learn more about my projects under the Projects tab.";
    } else if (message.includes("resume")) {
        return "My resume is available in the Resume section.";
    } else if (message.includes("contact")) {
        return "You can contact me via the Contact section.";
    } else if (message.includes("certifications")) {
        return "You can find links to my certifications in the Certifications section."
    }

    return "I'm still learning. Try asking about my projects, resume, or contact information.";
}
*/

let hasWelcomed = false;

function toggleAgent() {
    const agentBox = document.getElementById("agent-box");
    agentBox.classList.toggle("active");

    const chatLog = document.getElementById("chat-log");

    if (agentBox.classList.contains("active") && !hasWelcomed) {
        hasWelcomed = true;
        setTimeout(() => {
            chatLog.innerHTML += `<div class="bot-message"><strong>BadBot:</strong> Hi there! How may I assist you today?</div>`;
            chatLog.scrollTop = chatLog.scrollHeight;
        }, 500); // 0.5 second delay)
    }
}


function handleKey(event) {
    if (event.key === "Enter") sendMessage();
}


async function sendMessage() {
    const input = document.getElementById("chat-input");
    const chatLog = document.getElementById("chat-log");
    const typingIndicator = document.getElementById("typing-indicator");

    const userMsg = input.value.trim();
    if (!userMsg) return;

    // Show user message
    chatLog.innerHTML += `<div><strong>You:</strong> ${userMsg}</div>`;
    input.value = "";

    // Show typing indicator
    typingIndicator.style.display = "block";

    // Simulate delay before bot repsonds
    setTimeout(() => {
        const botResponse = getBotResponse(userMsg);

        typingIndicator.style.display = "none";
        chatLog.innerHTML += `<div class="bot-message"><strong>BadBot:</strong> ${botResponse}</div>`;
        chatLog.scrollTop = chatLog.scrollHeight;
    }, 1000); // 1 second delay
}

// Second thought on chatbot. Idea from rule_based_chatbot.py from NLP_SP24 class.

function chooseRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
};

function getBotResponse(message) {
    const lowerMsg = message.toLowerCase();

// object with keys (greeting, project, ...) and values (array of strings) similar to dictionary in Python
    const keywords = {
        greeting: ["hello", "hi", "hey", "greetings", "how are you"],
        project: ["projects", "project", "work", "portfolio", "github", "class projects", "school projects"],
        resume: ["resume", "cv", "experience", "education", "skill", "skills", "qualifications"],
        contact: ["contact", "email", "reach me", "phone", "linkedin", "github"],
        certifications: ["certifications", "certification", "certs", "cert", "aws", "linux"],
        description: ["you", "yourself", "bot", "badz", "badzbot"],
    };

    const responses = {
        greeting: ["Hi there! How can I assist you today?",
            "Hello! What can I do for you today?",
            "Hello! How may I help you?"
        ],
        project: ["Some projects are still in production, but can be found through GitHub.",
            "Please click on a project for more information.",
            "Some projects are still in production, but more information can be found through "
        ],
        resume: ["For an updated resume, please contact via email.",
            "Please contact via email for an updated resume.",
            "Please email for an updated resume, thank you."
        ],
        contact: ["My email link is available below.",
            "You can contact me via the email link below.",
            "My email and LinkedIn are both available below."
        ],
        certifications: ["I currently have two certifications.",
            "My certifications are available in the Certifications section.",
            "I have certifications from AWS Academy and Linux Essentials."
        ],
        description: ["I am a rule based chatbot.",
            "I am here to help navigate the website.",
            "I can only answer a few basic questions."
        ],
    };

    for (const intent in keywords) {
        if (keywords[intent].some(keyword => lowerMsg.includes(keyword))) {
            return chooseRandom(responses[intent]);
        }
    }
    return "Sorry, I do not understand. I am still learning. Try asking another question.";

}
