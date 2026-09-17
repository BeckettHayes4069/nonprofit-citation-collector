import assert from "node:assert/strict";
import { collectCitations } from "./citation_service.js";

await assert.rejects(() => collectCitations({donorReceipt: "", volunteerReminder: "ok", campaignReport: "ok"}), /Too small/);
console.log("request boundary rejects an empty donor receipt");
