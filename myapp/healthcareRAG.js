// Custom RAG (Node) ~ mirrors the Python version in the doc
// - Load PDFs
// - Extract text
// - Chunk
// - Embed
// - Vector search (cosine-ish) via HNSW
//
// Note: This uses hnswlib-node instead of FAISS to keep it simple in Node.
// If you specifically want FAISS in Node, see the note after this section.

import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import { pipeline } from "@xenova/transformers";
import hnswlib from "hnswlib-node";

function chunkText(text, chunkSize = 500) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
        const chunk = text.slice(i, i + chunkSize).trim();
        if (chunk) chunks.push(chunk);
    }
    return chunks;
}

function l2Normalize(vec) {
    let sumSq = 0;
    for (const v of vec) sumSq += v * v;
    const norm = Math.sqrt(sumSq) || 1;
    return vec.map(v => v / norm);
}

async function extractPdfText(pdfPath) {
    const data = fs.readFileSync(pdfPath);
    const parsed = await pdfParse(data);
    return parsed.text || "";
}

export class HealthcareRAG {
    constructor({
                    // You can swap models, but keep it small for CPU
                    embeddingModel = "Xenova/all-MiniLM-L6-v2",
                    dim = 384, // all-MiniLM-L6-v2 is typically 384-d
                } = {}) {
        this.embeddingModel = embeddingModel;
        this.dim = dim;

        this.embedder = null;         // transformers pipeline
        this.index = null;            // hnsw index
        this.documents = [];          // chunk texts
        this._initialized = false;
    }

    async init() {
        if (this._initialized) return;
        // feature-extraction pipeline returns embeddings
        this.embedder = await pipeline("feature-extraction", this.embeddingModel);
        // Cosine similarity via HNSW: normalize vectors + use Inner Product space
        this.index = new hnswlib.HierarchicalNSW("ip", this.dim);
        this._initialized = true;
    }

    async embed(texts) {
        // Return float arrays (normalized) for each text
        const out = [];
        for (const t of texts) {
            // Some models return [1, tokens, dim]; we mean-pool across tokens
            const result = await this.embedder(t, { pooling: "mean", normalize: false });
            const vec = Array.from(result.data);
            out.push(l2Normalize(vec));
        }
        return out;
    }

    async addDocuments(filePaths, { chunkSize = 500 } = {}) {
        await this.init();

        const allChunks = [];
        for (const p of filePaths) {
            // If you pass relative paths, they resolve from where you run `node ...`
            const pdfPath = path.resolve(p);
            const text = await extractPdfText(pdfPath);
            const chunks = chunkText(text, chunkSize);
            allChunks.push(...chunks);
        }

        this.documents = allChunks;

        // Build embeddings
        const embeddings = await this.embed(allChunks);

        // Init index (max elements = number of vectors)
        this.index.initIndex(allChunks.length);
        this.index.addItems(embeddings);

        console.log(`✅ Custom (JS): Indexed ${allChunks.length} chunks`);
    }

    async retrieve(query, k = 3) {
        await this.init();
        if (!this.index || this.documents.length === 0) {
            throw new Error("Index is empty. Call addDocuments() first.");
        }

        const [qVec] = await this.embed([query]);
        const { neighbors } = this.index.searchKnn(qVec, k);
        return neighbors.map(i => this.documents[i]);
    }

    async generate(query, k = 3) {
        const ctxChunks = await this.retrieve(query, k);
        const context = ctxChunks.join("\n---\n");
        console.log("🔍 Custom context:", context.slice(0, 200) + "...");
        return `Custom RAG (JS): ${context.slice(0, 300)}...`;
    }
}

// --- quick test (mirrors your doc) ---
async function main() {
    const rag = new HealthcareRAG();
    await rag.addDocuments(["diabetes.pdf", "standards.pdf"]); // update paths if needed

    const queries = [
        "What are metformin side effects?",
        "A1C target range for type 2 diabetes?",
        "How to treat hypoglycemia?",
        "When to check blood glucose?",
        "Foot care recommendations for diabetics?"
    ];

    for (const q of queries) {
        console.log(`\n🩺 Testing: ${q}`);
        console.log(await rag.generate(q, 3));
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(err => console.error(err));
}
