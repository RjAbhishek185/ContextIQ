document.addEventListener("DOMContentLoaded", () => {
/* pdfjsLib.GlobalWorkerOptions.workerSrc =
    chrome.runtime.getURL("pdfjs/pdf.worker.js"); */
    updateWebsiteName();

    document.getElementById("askBtn").addEventListener("click", askQuestion);

    document.getElementById("userQuery").addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            askQuestion();
        }
    });

    // Copy button
    document.getElementById("copyBtn").addEventListener("click", () => {

        const text = document.getElementById("responseBox").innerText;

        if (!text.trim()) return;

        navigator.clipboard.writeText(text);

        const btn = document.getElementById("copyBtn");

        btn.innerText = "Copied ✓";

        setTimeout(() => {
            btn.innerText = "Copy";
        }, 2000);

    });

});


// ----------------------
// Website Name
// ----------------------

function updateWebsiteName() {

    chrome.tabs.query(
        {
            active: true,
            currentWindow: true
        },
        (tabs) => {

            if (!tabs.length) return;

            const websites = {

                "en.wikipedia.org": "Wikipedia",

                "github.com": "GitHub",

                "leetcode.com": "LeetCode",

                "chatgpt.com": "ChatGPT",

                "stackoverflow.com": "Stack Overflow",

                "www.geeksforgeeks.org": "GeeksforGeeks"

            };

            try {

                const hostname = new URL(tabs[0].url).hostname;

                document.getElementById("websiteName").textContent =
                    websites[hostname] || hostname;

            } catch {

                document.getElementById("websiteName").textContent =
                    "Unknown Website";

            }

        }
    );

}


// ----------------------
// Ask Question
// ----------------------
console.log("Ask Question started");
async function askQuestion() {

    const queryInput = document.getElementById("userQuery");

    const query = queryInput.value.trim();

    const askBtn = document.getElementById("askBtn");

    const responseBox = document.getElementById("responseBox");

    if (!query) return;

addUserMessage(query);


    askBtn.disabled = true;

    askBtn.innerHTML = `<span class="loading"></span>Generating...`;
const chat = document.getElementById("chatContainer");

if (chat.querySelector(".empty-state")) {
    chat.innerHTML = "";
}

const typing = document.createElement("div");

typing.id = "typingIndicator";

typing.className = "ai-message chat-animation";

typing.innerHTML = `
<div>

    <div class="message-label">
        🤖 ContextIQ
    </div>

    <div class="ai-bubble">
        Thinking...
    </div>

</div>
`;

chat.appendChild(typing);

chat.scrollTop = chat.scrollHeight;
   


    chrome.tabs.query(
    {
        active: true,
        currentWindow: true
    },
    function (tabs) {

        const currentTab = tabs[0];

        const isPDF =
            currentTab.url.toLowerCase().includes(".pdf");

        console.log("PDF Detected:", isPDF);

        // For now both use the same extractor
        const extractor = isPDF
    ? () => ""
    : getPageContent;
console.log("Executing content script");
chrome.scripting.executeScript(
    {
        target: {
            tabId: currentTab.id
        },
        function: extractor
    },
                async (injectionResults) => {
                  console.log(injectionResults);

                    try {

                        if (!injectionResults || !injectionResults[0]) {

                            throw new Error(
                                "Unable to extract webpage."
                            );

                        }

                        let pageContent;

if (isPDF) {

    console.log("Reading PDF...");

    pageContent = await getPDFContent(currentTab.url);

} else {

    pageContent = injectionResults[0].result;

}

                        const response = await fetch(
                            "http://127.0.0.1:8000/chat",
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body: JSON.stringify({

    text: isPDF
        ? ""
        : pageContent.substring(0, 30000),

    pdf_url: isPDF
        ? currentTab.url
        : null,

    query: query,

    session_id:
        tabs[0].id.toString()

})
                            }
                        );

                        if (!response.ok) {

                            throw new Error(
                                `Server returned ${response.status}`
                            );

                        }

                        const data = await response.json();

const typingIndicator = document.getElementById("typingIndicator");

if (typingIndicator) {
    typingIndicator.remove();
}

streamText(
    data.answer,
    responseBox
);

// Show retrieved sources
if (data.sources && data.sources.length > 0) {

    renderSources(data.sources);

}

// Update footer


                    }

                    catch (error) {

    const typingIndicator = document.getElementById("typingIndicator");

    if (typingIndicator) {
        typingIndicator.remove();
    }

    const chat = document.getElementById("chatContainer");

    const errorMessage = document.createElement("div");

    errorMessage.className = "ai-message chat-animation";

    errorMessage.innerHTML = `
        <div>

            <div class="message-label">
                🤖 ContextIQ
            </div>

            <div class="ai-bubble error-message">
                ⚠️ ${error.message}
            </div>

        </div>
    `;

    chat.appendChild(errorMessage);

    chat.scrollTop = chat.scrollHeight;
}

                    finally {

    askBtn.disabled = false;

    askBtn.innerHTML = "✨ Ask AI";

    queryInput.value = "";

    queryInput.focus();
    document.getElementById("chatContainer").scrollTop =
    document.getElementById("chatContainer").scrollHeight;

}

                }

            );

        }

    );

}

// ----------------------
// Extract Page
// ----------------------

function getPageContent() {

    return document.body.innerText;

}



// ----------------------
// Streaming Animation
// ----------------------

function streamText(text, container) {

    const chat = document.getElementById("chatContainer");

    // Remove empty state on first message
    if (chat.querySelector(".empty-state")) {
        chat.innerHTML = "";
    }

    // ---------- AI Message ----------

    const aiMessage = document.createElement("div");
    aiMessage.className = "ai-message chat-animation";

    aiMessage.innerHTML = `
        <div>

            <div class="message-label">
                🤖 ContextIQ
            </div>

            <div class="ai-bubble">

                <div class="response-text"></div>

            </div>

        </div>
    `;

    chat.appendChild(aiMessage);

    // Scroll immediately to the new message
    aiMessage.scrollIntoView({
        behavior: "smooth",
        block: "end"
    });

    const textHolder = aiMessage.querySelector(".response-text");

    const words = text.split(/(\s+)/);

    let index = 0;

    function nextWord() {

        if (index >= words.length) {

            // Final scroll when response finishes
            aiMessage.scrollIntoView({
                behavior: "smooth",
                block: "end"
            });

            return;
        }

        const word = words[index];

        if (word.trim() === "") {

            textHolder.appendChild(
                document.createTextNode(word)
            );

        } else {

            const span = document.createElement("span");

            span.className = "word";

            span.textContent = word;

            textHolder.appendChild(span);

        }

        // Keep the latest text visible while streaming
        aiMessage.scrollIntoView({
            behavior: "smooth",
            block: "end"
        });

        index++;

        setTimeout(nextWord, 30);

    }

    nextWord();

}

function addUserMessage(text) {

    const chat = document.getElementById("chatContainer");

    const message = document.createElement("div");

    message.className = "user-message chat-animation";

    message.innerHTML = `
    <div>

        <div class="message-label">
            👤 You
        </div>

        <div class="user-bubble">
            ${text}
        </div>

    </div>
    `;

    chat.appendChild(message);

    chat.scrollTop = chat.scrollHeight;

}

function renderSources(sources) {

    const chat = document.getElementById("chatContainer");

    const wrapper = document.createElement("div");

    wrapper.className = "sources";

    wrapper.innerHTML = "<h3>📚 Retrieved Context</h3>";

    sources.forEach((source) => {

        const details = document.createElement("details");

        details.className = "source-card";

        details.innerHTML = `
            <summary>Source ${source.id}</summary>
            <p>${source.content}</p>
        `;

        wrapper.appendChild(details);

    });

    chat.appendChild(wrapper);

    chat.scrollTop = chat.scrollHeight;

}