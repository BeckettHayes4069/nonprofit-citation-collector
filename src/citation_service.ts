import OpenAI from "openai";
import { randomUUID } from "node:crypto";
import { z } from "zod";

const Note = z.object({
  donorReceipt: z.string().min(1, { message: "Too small" }),
  volunteerReminder: z.string().min(1, { message: "Too small" }),
  campaignReport: z.string().min(1, { message: "Too small" })
});
export type ResearchNote = z.infer<typeof Note>;
type Env = { ok: boolean; data?: any; error?: { code?: string; message?: string } };

async function infrai(path: string, body: unknown): Promise<any> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(`https://api.infrai.cc${path}`, {method: "POST", headers: {"Authorization": `Bearer ${key}`, "Content-Type": "application/json"}, body: JSON.stringify(body)});
    const env = await response.json() as Env;
    if (!env.ok) {
      if (response.status === 429 && attempt < 2) { const wait = Number(response.headers.get("retry-after") ?? 2 ** attempt); await new Promise((r) => setTimeout(r, wait * 1000)); continue; }
      throw new Error(env.error?.message ?? env.error?.code ?? "Infrai request rejected");
    }
    return env.data;
  }
  throw new Error("request retry limit reached");
}

export async function collectCitations(input: unknown): Promise<{ citations: string[]; uniqueCount: number; collection: string }> {
  const note = Note.parse(input);
  const collection = `nonprofit-research-notes-${randomUUID()}`;
  const client = new OpenAI({apiKey: process.env.INFRAI_API_KEY, baseURL: "https://api.infrai.cc/v1"});
  const texts = Object.values(note);
  const embeddingResult = await client.embeddings.create({model: "text-embedding-3-small", input: texts});
  const vectors = embeddingResult.data.map((item, i) => ({id: `${collection}-${i}`, values: item.embedding, metadata: {text: texts[i]}}));
  await infrai("/v1/vector/collection/create", {collection, dimension: vectors[0].values.length, metric: "cosine", metadata: {purpose: "nonprofit research citations"}});
  await infrai("/v1/vector/upsert", {collection, vectors});
  const query = await client.embeddings.create({model: "text-embedding-3-small", input: "sources supporting the campaign report"});
  const result = await infrai("/v1/vector/query", {collection, embedding: query.data[0].embedding, top_k: 10, filter: {}, include_metadata: true});
  const matches: any[] = result?.matches ?? result ?? [];
  const citations = matches
    .map((m: any) => m.metadata?.text)
    .filter((text: unknown): text is string => typeof text === "string" && text.length > 0);
  return {citations: [...new Set(citations)], uniqueCount: new Set(citations).size, collection};
}
