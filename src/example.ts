import { collectCitations } from "./citation_service.js";

const sample = {
  donorReceipt: "Receipt 2025-04: monthly donor gift acknowledged; source: finance ledger.",
  volunteerReminder: "Volunteer orientation reminder: bring safeguarding form; source: training calendar.",
  campaignReport: "Spring campaign report: 142 households reached; source: outreach survey."
};

const result = await collectCitations(sample);
console.log(JSON.stringify({input: sample, result}, null, 2));
