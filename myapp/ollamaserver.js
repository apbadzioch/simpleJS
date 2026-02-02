import ollama from 'ollama';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import * as readline from 'node:readline';


import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/hf_transformers';


const app = express();
const PORT = 3000;

// ---- RAG Setup ----
let vectorstore;

async function initRAG() {
    // load PDFs
    const pdfFiles = [
        "diabetes.pdf",
        "standards.pdf"
    ]
    const docs = [];

    for (const filePath of pdfFiles) {
        const loader = new PDFLoader(filePath);
        const loadedDocs = await loader.load();
        docs.push(...loadedDocs);
    }
}










const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const systemPrompt = `
You are a personal assistant for Andrew.
Be concise with you answers: 1-2 sentences MAX.
Don not add extra content or suggestions that do not help answer the question.`

// as of 11-18-2025 this version of gemma3:1b has been trained up till November 2, 2023
// this was found out when I asked about the 2025 world series results

// similar to "while true:" in Python
async function ask() {
    rl.question('> ', async(userInput) => {
        if (userInput.toLowerCase() === 'quit') {
            rl.close()
            return
        }

        const response = await ollama.chat({
            model: 'gemma3:1b',
            messages: [
                {
                    role: 'system', content: systemPrompt
                },
                {
                    role: 'user', content: userInput
                }
            ]
        })

        console.log(response.message.content)
        ask() // loop again
    })
}
ask()
/*
synchronous programming: task are executed sequentially, with each operation
waiting for the previous one to complete before proceeding, ensuring predictability
and simplicity in code execution, but may lead to inefficiencies when dealing with
time-consuming operations.

asynchronous programming: allows tasks to run concurrently, enabling non-blocking
execution and better resource utilization. By using callbacks, promises, and
async/await syntax, asynchronous programming enhances app responsiveness and scalability.
*/