import * as fs from "fs";
import * as path from "path";
import { CveRecord } from "./utils";
import OpenAI from "openai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { components } from "@qdrant/js-client-rest/dist/types/openapi/generated_schema";
import { randomUUID } from "crypto";


const openai = new OpenAI({
  apiKey: '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', // Assicurati di impostare questa variabile d'ambiente
});
const client = new QdrantClient({ url: 'http://localhost', port: 6333 });

type CveRecordEmbedding = CveRecord & {
  embedding: {
    content: string
    embedding: number[]
  }
}


const readCveRecordFilesFromFolder = async () => {
  const cartellaInput = path.resolve(__dirname, 'data', 'cve');
  const cveRecords: CveRecord[] = []

  async function readFolder(percorso: string) {
    try {
      const entries = await fs.readdirSync(percorso, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = path.join(percorso, entry.name);
        if (entry.isDirectory()) {
          await readFolder(entryPath);
        } else if (entry.isFile() && path.extname(entry.name) === '.json') {
          const content = await fs.readFileSync(entryPath);
          cveRecords.push(JSON.parse(content.toString()))
        }
      }
    } catch (err) {
      console.error('Errore durante la lettura dei file:', err);
    }
  }

  await readFolder(cartellaInput)

  return cveRecords
}

const createCveRecordEmbeddings = async (dataset: CveRecord[]) => {
  try {
    const cveEmbeddingDataset: CveRecordEmbedding[] = JSON.parse((fs.readFileSync(path.join(__dirname, 'data', 'cve-embedings.json'))).toString())
    return cveEmbeddingDataset
  } catch (e) {
    const cveEmbeddingDataset: CveRecordEmbedding[] = [];
    for (const [i, item] of dataset.entries()) {
      if (item.cveMetadata.state !== 'PUBLISHED' || !item.containers.cna || !item.containers.cna.descriptions || item.containers.cna.descriptions.length === 0)
        continue;
      try {
        const description = `Vulnerabilità ID: ${item.cveMetadata.cveId} -${item.containers.cna.descriptions.reduce((res, el) => el.lang === 'en' ? `${res} ${el.value}` : res, '')}`
        const embeddingResponse = await openai.embeddings.create({
          input: description,
          model: 'text-embedding-ada-002'
        })
        if (embeddingResponse.data.length > 0) {
          cveEmbeddingDataset.push({
            ...item,
            embedding: {
              content: description,
              embedding: embeddingResponse.data[0].embedding
            }
          })
        }
        console.log('Embedding process', `${i}/${dataset.length}`)
      } catch (e) {
        console.error(e)
      }
    }
    await fs.writeFileSync(path.join(__dirname, 'data', 'cve-embedings.json'), JSON.stringify(cveEmbeddingDataset))
    return cveEmbeddingDataset;
  }
}


async function main() {
  const dataset: CveRecord[] = await readCveRecordFilesFromFolder()

  console.log('Total Cve Records: ', dataset.length)

  const cveEmbeddingDataset = await createCveRecordEmbeddings(dataset.slice(0, 100))

  const batchSize = 100;
  for (let i = 0; i < cveEmbeddingDataset.length; i += batchSize) {
    const batch = cveEmbeddingDataset.slice(i, i + batchSize);

    const points: components['schemas']['PointStruct'][] = []
    for (const cveRecordEmbedding of batch) {
      const { embedding, ...cveRecord } = cveRecordEmbedding
      const point: components['schemas']['PointStruct'] = {
        id: randomUUID(),
        vector: embedding.embedding,
        payload: {
          page_content: embedding.content,
          metadata: {
            cveRecord,
            cveId: cveRecord.cveMetadata.cveId,
            source: cveRecord.cveMetadata.cveId,
            when: (+new Date()) / 1000
          }
        }
      }
      points.push(point)
    }

    await client.upsert('declarative', {
      points: points
    })
  }
}

main();
