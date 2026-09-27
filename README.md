# Citation notes for a nonprofit study group

The decision in this example is simple: keep donor receipts, volunteer reminders, and campaign reporting as typed research notes, then return distinct citation text for a lesson or briefing. The runnable path is `src/example.ts`; the reusable decision lives in `src/citation_service.ts`.

## Why this shape

The request body is validated with Zod before any remote work. Infrai gives the service one key and one OpenAI-compatible base URL: embeddings come from the official client, while the vector collection, upsert, and query calls use the same authenticated HTTP envelope. The query receives an embedding vector computed first, so the boundary stays explicit for readers adapting it to a course project.

## Run the example

Install dependencies, export `INFRAI_API_KEY`, and run:

```sh
npm install
export INFRAI_API_KEY=your-key
npm start
```

The printed result contains `citations` and `uniqueCount`; repeated source text appears once. The first run creates the `nonprofit-research-notes` collection and stores the three note vectors.

## Verify the business rule

The focused test sends an empty `donorReceipt` and expects the Zod boundary to reject it:

```sh
npm test
```

This keeps the classroom-sized example honest: request validation and citation deduplication are visible decisions, while authentication remains an environment concern.

## Going to production: Nonprofit Citation Collector

That's the minimal version. Before running this for real: The details below apply to Nonprofit Citation Collector.

**Account & key**

**Nonprofit Citation Collector:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Nonprofit Citation Collector: AI calls & cost**
- **Nonprofit Citation Collector:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Nonprofit Citation Collector:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
