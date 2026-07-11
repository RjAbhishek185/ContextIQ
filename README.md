# 🚀 ContextIQ

> An AI-powered Chrome Extension that enables users to ask questions about any webpage or PDF using Retrieval-Augmented Generation (RAG) and Large Language Models.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi)
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome)
![LangChain](https://img.shields.io/badge/LangChain-RAG-green)

---

## 📌 Overview

ContextIQ is an intelligent Chrome Extension that transforms webpages and PDF documents into an interactive AI knowledge assistant.

Instead of manually searching through lengthy content, users can simply ask questions in natural language and receive context-aware answers powered by Retrieval-Augmented Generation (RAG).

The extension extracts webpage or PDF content, creates semantic embeddings, stores them in a FAISS vector database, retrieves the most relevant information, and generates accurate responses using Groq's Llama models.

---

## ✨ Features

- 🌐 Ask questions about any webpage
- 📄 AI-powered PDF document understanding
- 🧠 Retrieval-Augmented Generation (RAG)
- ⚡ Fast semantic search using FAISS
- 🤖 Powered by Groq Llama 3.3
- 🔍 Context-aware responses
- 💬 Conversational chat interface
- 📚 Session-based memory
- 🚀 FastAPI backend
- 🧩 Chrome Extension (Manifest V3)

---

## 🏗️ Project Architecture

```
                ┌──────────────────────┐
                │  Chrome Extension    │
                └──────────┬───────────┘
                           │
                           ▼
               Extract Webpage / PDF
                           │
                           ▼
                Text Chunking (LangChain)
                           │
                           ▼
              HuggingFace Embeddings
                           │
                           ▼
                 FAISS Vector Database
                           │
                           ▼
                Relevant Context Search
                           │
                           ▼
                 Groq Llama 3.3 Model
                           │
                           ▼
                  AI Generated Response
```

---

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- JavaScript (ES6)
- Chrome Extension Manifest V3

### Backend

- Python
- FastAPI
- Uvicorn

### AI & RAG

- LangChain
- Groq API
- Llama 3.3
- HuggingFace Embeddings
- Sentence Transformers
- FAISS Vector Store

### PDF Processing

- PyMuPDF

---

## 📂 Project Structure

```
ContextIQ
│
├── backend
│   ├── main.py
│   ├── requirements.txt
│   ├── render.yaml
│   └── ...
│
├── extension
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.css
│   ├── popup.js
│   ├── content.js
│   ├── researchMode.js
│   ├── icon.jpg
│   └── pdfjs/
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone https://github.com/RjAbhishek185/ContextIQ.git
cd ContextIQ
```

---

### 2. Backend Setup

```bash
cd backend

python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file:

```env
GROQ_API_KEY=your_api_key_here
```

Run the backend:

```bash
uvicorn main:app --reload
```

Backend runs on:

```
http://127.0.0.1:8000
```

---

### 3. Load Chrome Extension

Open Chrome:

```
chrome://extensions
```

- Enable **Developer Mode**
- Click **Load unpacked**
- Select the `extension` folder

---

## 🚀 How It Works

1. User opens any webpage or PDF.
2. Chrome Extension extracts content.
3. Content is sent to the FastAPI backend.
4. LangChain splits text into chunks.
5. HuggingFace generates embeddings.
6. FAISS retrieves relevant context.
7. Groq Llama 3.3 generates an answer.
8. Response is displayed inside the extension.

---

## 📸 Screenshots

> Add screenshots here after deployment.

- Homepage
- Chat Interface
- PDF Question Answering
- Webpage Question Answering

---

## 🔮 Roadmap

- [ ] Multi-document chat
- [ ] Research Mode
- [ ] Citation support
- [ ] Streaming AI responses
- [ ] Conversation history
- [ ] Dark / Light themes
- [ ] Chrome Web Store release
- [ ] Backend deployment optimization
- [ ] Export conversations
- [ ] OCR support for scanned PDFs

---

## 🎯 Future Improvements

- GPT-4 / Claude support
- Image understanding
- Local embedding models
- Hybrid semantic search
- Cross-document reasoning
- Team workspaces
- Cloud synchronization

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Abhishek Raj**

- GitHub: https://github.com/RjAbhishek185
- LinkedIn: https://www.linkedin.com/in/abhishek-raj-1589a62a1/

---

⭐ If you found this project helpful, consider giving it a star!
