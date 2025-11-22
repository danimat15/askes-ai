// askes-ai/lib/rag/ingest_data.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import * as fs from 'fs/promises';
import * as path from 'path';
import pdf = require('pdf-parse');
import crypto from 'crypto'; // Import crypto for UUID

// Load environment variables
import 'dotenv/config';

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set in the .env file.');
}
if (!process.env.PINECONE_API_KEY) {
  throw new Error('PINECONE_API_KEY is not set in the .env file.');
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'askes-ai-rag-index';
const BASE_KNOWLEDGE_PATH = path.join(process.cwd(), 'base_knowledge');
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-001' });

// Initialize Pinecone
const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

async function getEmbeddings(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

async function loadPdfDocument(pdfPath: string): Promise<string> {
  const dataBuffer = await fs.readFile(pdfPath);
  // Use dynamic import to handle CJS/ESM interop issues with pdf-parse
  const pdf = (await import('pdf-parse')).default;
  const data = await pdf(dataBuffer);
  return data.text;
}

async function getDocuments(directoryPath: string): Promise<{ text: string; metadata: { source: string } }[]> {
  const documents: { text: string; metadata: { source: string } }[] = [];
  const files = await fs.readdir(directoryPath);

  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stat = await fs.stat(filePath);

    if (stat.isDirectory()) {
      documents.push(...await getDocuments(filePath));
    } else if (file.endsWith('.pdf')) {
      console.log(`Loading PDF: ${filePath}`);
      const text = await loadPdfDocument(filePath);
      documents.push({ text, metadata: { source: path.basename(filePath) } }); // Use basename for source
    }
  }
  return documents;
}

async function ingestData() {
  try {
    console.log('Starting data ingestion process...');

    console.log(`Loading documents from: ${BASE_KNOWLEDGE_PATH}`);
    const rawDocuments = await getDocuments(BASE_KNOWLEDGE_PATH);
    console.log(`Loaded ${rawDocuments.length} raw documents.`);

    console.log('Splitting documents into chunks...');
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: CHUNK_SIZE,
      chunkOverlap: CHUNK_OVERLAP,
    });

    const chunks = await textSplitter.splitDocuments(
      rawDocuments.map(doc => ({ pageContent: doc.text, metadata: doc.metadata }))
    );
    console.log(`Created ${chunks.length} chunks.`);

    const indexList = await pinecone.listIndexes();
    const indexNames = indexList.indexes?.map(index => index.name) || [];

    if (!indexNames.includes(PINECONE_INDEX_NAME)) {
      console.log(`Creating Pinecone index: ${PINECONE_INDEX_NAME}`);
      await pinecone.createIndex({
        name: PINECONE_INDEX_NAME,
        dimension: 768, // Gemini embedding-001 dimension
        metric: 'cosine',
        spec: { serverless: { cloud: 'aws', region: 'us-east-1' } }, // Assuming AWS us-east-1, can be configured
      });
      console.log(`Index ${PINECONE_INDEX_NAME} created.`);
    } else {
      console.log(`Pinecone index ${PINECONE_INDEX_NAME} already exists.`);
    }

    const index = pinecone.Index(PINECONE_INDEX_NAME);

    console.log('Generating embeddings and uploading to Pinecone...');
    const batchSize = 100;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const vectors = await Promise.all(
        batch.map(async (chunk) => {
          const embedding = await getEmbeddings(chunk.pageContent);
          return {
            id: `${chunk.metadata.source}_${crypto.randomUUID()}`, // Unique ID for the vector
            values: embedding,
            metadata: {
              ...chunk.metadata,
              text: chunk.pageContent,
            },
          };
        })
      );

      await index.upsert(vectors);
      console.log(`Uploaded batch ${i / batchSize + 1}/${Math.ceil(chunks.length / batchSize)}`);
    }

    console.log('Data ingestion complete!');
  } catch (error) {
    console.error('Error during data ingestion:', error);
  }
}

ingestData();
