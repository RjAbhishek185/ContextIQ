from importlib import resources
import socket
import fitz
import requests
# Force IPv4 to bypass macOS broken IPv6 resolution (fixes 75-second delay)
orig_getaddrinfo = socket.getaddrinfo
def getaddrinfo_ipv4(*args, **kwargs):
    responses = orig_getaddrinfo(*args, **kwargs)
    return [r for r in responses if r[0] == socket.AF_INET]
socket.getaddrinfo = getaddrinfo_ipv4


from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.responses import JSONResponse

from langchain_core.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun

from langchain_core.messages import SystemMessage, HumanMessage
from langchain_community.vectorstores import FAISS
from langchain_core.output_parsers import StrOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document
from langchain_groq import ChatGroq
import os
from typing import Dict
from collections import deque

from dotenv import load_dotenv

load_dotenv()

emb_model = HuggingFaceEmbeddings(model_name="BAAI/bge-small-en") # Embedding Model
groq_model = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama-3.3-70b-versatile",
    temperature=0
)

@tool
def web_search(query:str):
    """Search the web for information when the provided document context does not contain the answer or is insufficient."""
    search = DuckDuckGoSearchRun()
    return search.run(query)

tools = [web_search]
groq_model_with_tools = groq_model.bind_tools(tools)

session_db: Dict[str, deque] = {}

# Cache vectorstores for each browser tab
vectorstore_cache: Dict[str, FAISS] = {}

MAX_HISTORY = 10
MAX_CHARS = 30000

parser = StrOutputParser()

app = FastAPI()

def extract_pdf_text(pdf_url: str):

    response = requests.get(pdf_url, timeout=30)

    response.raise_for_status()

    pdf = fitz.open(
        stream=response.content,
        filetype="pdf"
    )

    text = ""

    for page in pdf:

        text += page.get_text()

    pdf.close()

    return text
class RAGrequest(BaseModel):
    text: str
    query: str
    session_id: str
    pdf_url: str | None = None

@app.post("/chat")
def get_answer(payload: RAGrequest):
    try:

        if payload.session_id not in session_db:
            session_db[payload.session_id] = deque(maxlen=MAX_HISTORY)

        history = session_db[payload.session_id]

        history_str = ""
        for user_msg, ai_msg in history:
            history_str += f"User: {user_msg}\nAI: {ai_msg}\n"

        # Limit very large webpages
        page_text = payload.text[:MAX_CHARS]

        # Build vectorstore only once per browser tab
        if payload.session_id not in vectorstore_cache:

            splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=100
            )

            chunks = splitter.split_text(page_text)

            docs = [
                Document(page_content=chunk)
                for chunk in chunks
            ]

            vectorstore_cache[payload.session_id] = FAISS.from_documents(
                documents=docs,
                embedding=emb_model
            )

        vectorstore = vectorstore_cache[payload.session_id]

        retriever = vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={
                "k": 5,
                "fetch_k": 20
            }
        )

        relevant_docs = retriever.invoke(payload.query)

        context = "\n\n".join(
            [doc.page_content for doc in relevant_docs]
        )

        # Prepare retrieved sources
        sources = []
        for i, doc in enumerate(relevant_docs, start=1):
            sources.append({
                "id": i,
                "content": doc.page_content[:250]
            })

        messages = [
            SystemMessage(content="""
You are a helpful assistant.

RULES:
1. Answer ONLY from the provided document context and conversation history.
2. If the document context is completely unrelated or does not contain the answer, call the web_search tool.
3. Do NOT start answers with phrases like "Based on the context..." or "According to the document...". Answer directly.
"""),
            HumanMessage(content=f"""
Conversation History:
{history_str}

Document Context:
{context}

User's question:
{payload.query}
""")
        ]

        response = groq_model_with_tools.invoke(messages)

        if response.tool_calls:

            tool_call = response.tool_calls[0]
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]

            if tool_name == "web_search":

                search_query = tool_args.get("query", payload.query)

                print(f"Web Search Tool Called: {search_query}")

                search_result = web_search.invoke(
                    {"query": search_query}
                )

                agent_prompt = f"""
You are a helpful assistant.

Conversation History:
{history_str}

Web Search Results:
{search_result}

User's question:
{payload.query}

Answer directly without saying 'Based on the search results'.
"""

                final_response = groq_model.invoke(agent_prompt)

                answer = final_response.content

            else:
                answer = response.content

        else:
            answer = response.content

        history.append((payload.query, answer))

        return JSONResponse(
            content={
                "answer": answer,
                "sources": sources
            }
        )

    except Exception as e:

        print("ERROR:", e)

        return JSONResponse(
            status_code=500,
            content={
                "answer": str(e)
            }
        )