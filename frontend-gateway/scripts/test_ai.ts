import "https://deno.land/std@0.216.0/dotenv/load.ts";
import { synthesizeArtifacts } from "../utils/ai.ts";

// Mock artifacts that simulate real unstructured data from CockroachDB
const mockArtifacts = [
  {
    type: "url",
    unstructured_data: {
      raw_text:
        "Stoicism teaches that we should focus only on what is within our control — our thoughts, our responses, our values. External events, whether good or bad, are indifferent. The Stoic sage remains tranquil regardless of circumstances.",
    },
  },
  {
    type: "text",
    unstructured_data: {
      raw_text:
        "Naval Ravikant on sovereignty: 'The most important form of freedom is freedom of time. You can make money and lose it, but time once gone is gone forever.' Leverage comes from code, capital, and media — not labor.",
    },
  },
  {
    type: "pdf",
    unstructured_data: {
      raw_text:
        "Brutalist design strips away ornamentation to reveal raw structure and honest materials. It is a philosophy of integrity — the building shows what it is made of, unapologetically.",
    },
  },
];

console.log("🧠 Testing Muse AI Synthesis Engine (Groq)...\n");
console.log(`Using model: llama-3.3-70b-versatile`);
console.log(`Artifacts: ${mockArtifacts.length}\n`);

try {
  const blueprint = await synthesizeArtifacts(
    mockArtifacts as Record<string, unknown>[],
  );
  console.log("✅ Synthesis Successful!\n");
  console.log("═══════════════════════════════════════");
  console.log(`🎯 Theme:    ${blueprint.theme}`);
  console.log("───────────────────────────────────────");
  console.log(`📝 Summary:\n${blueprint.summary}`);
  console.log("───────────────────────────────────────");
  console.log("💬 Socratic Questions:");
  blueprint.socratic_questions.forEach((q, i) => {
    console.log(`   ${i + 1}. ${q}`);
  });
  console.log("═══════════════════════════════════════");
} catch (err) {
  console.error("❌ Synthesis failed:", (err as Error).message);
}
