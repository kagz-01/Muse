import { ChatGroq } from "npm:@langchain/groq";
import { PromptTemplate } from "npm:@langchain/core/prompts";
import { StructuredOutputParser } from "npm:@langchain/core/output_parsers";
import { z } from "npm:zod";
import { generateDynamicHumor, type GreetingPeriod } from "./dynamicHumor.ts";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";

// Initialize the Groq model via LangChain
// llama-3.3-70b-versatile is Groq's flagship fast model, great for structured output
const model = new ChatGroq({
  apiKey: GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
  temperature: 0.2,
});

// Define the blueprint structure we expect from the AI
const blueprintSchema = z.object({
  theme: z.string().describe("The overarching theme connecting the artifacts"),
  summary: z.string().describe("A concise summary of the synthesized insights"),
  socratic_questions: z
    .array(z.string())
    .describe("2-3 deep, provocative questions generated from the synthesis"),
});

const parser = StructuredOutputParser.fromZodSchema(blueprintSchema);

const synthesisPrompt = new PromptTemplate({
  template:
    `You are the Muse AI Synthesis Engine. Your purpose is to analyze a collection of unstructured artifacts (notes, web clips, concepts) and extract a cohesive "Thread Blueprint."

Find the hidden connections, underlying themes, and profound questions hidden within this chaos.

Artifacts:
{artifacts_text}

{format_instructions}
`,
  inputVariables: ["artifacts_text"],
  partialVariables: { format_instructions: parser.getFormatInstructions() },
});

export async function synthesizeArtifacts(
  artifacts: Record<string, unknown>[],
) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in the environment.");
  }

  // Combine artifacts into a readable text chunk
  const artifactsText = artifacts
    .map((art, index) => {
      const data = art.unstructured_data as Record<string, unknown> | undefined;
      const content = data
        ? (data.raw_text as string | undefined) ?? JSON.stringify(data)
        : "";
      return `Artifact ${index + 1} (${art.type}):\n${content}`;
    })
    .join("\n\n");

  const promptValue = await synthesisPrompt.format({
    artifacts_text: artifactsText,
  });

  // Call Groq via LangChain
  const response = await model.invoke(promptValue);

  // Parse the structured JSON output
  try {
    const parsedBlueprint = await parser.parse(response.content.toString());
    return parsedBlueprint;
  } catch (error) {
    console.error("Failed to parse AI output:", error);
    throw new Error("The AI failed to generate a valid blueprint structure.");
  }
}

const parallelSynthesisPrompt = new PromptTemplate({
  template:
    `You are the Muse AI Synthesis Engine. You are analyzing the cognitive intersections between two users, "{user_a_name}" and "{user_b_name}".
Your purpose is to look at the knowledge fragments, journal excerpts, and curated artifacts of BOTH users and identify profound conceptual overlaps.

Where do their minds meet? What shared themes are they exploring from different angles?

User A ({user_a_name}) Data:
{user_a_data}

User B ({user_b_name}) Data:
{user_b_data}

{format_instructions}
`,
  inputVariables: ["user_a_name", "user_b_name", "user_a_data", "user_b_data"],
  partialVariables: { format_instructions: parser.getFormatInstructions() },
});

export async function synthesizeParallel(
  userAName: string,
  userAData: string,
  userBName: string,
  userBData: string,
) {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in the environment.");
  }

  const promptValue = await parallelSynthesisPrompt.format({
    user_a_name: userAName,
    user_b_name: userBName,
    user_a_data: userAData,
    user_b_data: userBData,
  });

  const response = await model.invoke(promptValue);

  try {
    const parsedBlueprint = await parser.parse(response.content.toString());
    return parsedBlueprint;
  } catch (error) {
    console.error("Failed to parse AI output:", error);
    throw new Error("The AI failed to generate a valid parallel blueprint.");
  }
}

const socraticPrompt = new PromptTemplate({
  template: `You are the Muse AI Synthesis Engine, acting as a Socratic guide. 
Your goal is to prompt deep introspection and unearth hidden themes.
The user ({user_name}) has just written a thought in their journal.
Here is what they wrote:
"{recent_text}"

Here is some related context from their digital vault:
{context_text}

Generate ONE powerful, thought-provoking Socratic question that:
1. Directly addresses the user's thought.
2. Challenges their assumptions or asks them to explore the underlying "why".
3. Keeps it concise (1-2 sentences maximum).
4. Do NOT include any intro text like "Here is a question:" or quotation marks. Just output the question itself.
`,
  inputVariables: ["user_name", "recent_text", "context_text"],
});

export async function generateDynamicSocraticQuestion(
  userName: string,
  recentText: string,
  contextItems: { title: string; note?: string }[],
): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in the environment.");
  }

  const contextText = contextItems.length > 0
    ? contextItems.map((item) => `- ${item.title}: ${item.note || ""}`).join(
      "\n",
    )
    : "No relevant context found.";

  const promptValue = await socraticPrompt.format({
    user_name: userName || "Traveler",
    recent_text: recentText,
    context_text: contextText,
  });

  const response = await model.invoke(promptValue);
  let question = response.content.toString().trim();

  if (question.startsWith('"') && question.endsWith('"')) {
    question = question.slice(1, -1);
  }

  return question;
}

const extractSparkPrompt = new PromptTemplate({
  template: `You are the Muse AI Synthesis Engine. 
The user has written a private journal entry. Your task is to extract a "Public Spark" from this entry.
A Public Spark is a concise, profound, and universally relatable concept or question derived from the private thought.

CRITICAL RULES:
1. Strip ALL personally identifiable information (PII), names, places, or highly specific personal scenarios.
2. Elevate the thought into a general philosophical, creative, or intellectual statement or question.
3. Keep it under 2 sentences.
4. Output ONLY the text of the spark, nothing else.

Journal Entry:
"{journal_text}"

Public Spark:
`,
  inputVariables: ["journal_text"],
});

export async function extractPublicSpark(journalText: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured in the environment.");
  }

  const promptValue = await extractSparkPrompt.format({
    journal_text: journalText,
  });

  const response = await model.invoke(promptValue);
  let spark = response.content.toString().trim();

  if (spark.startsWith('"') && spark.endsWith('"')) {
    spark = spark.slice(1, -1);
  }

  return spark;
}

const personalityGreetingPrompt = new PromptTemplate({
  template: `You are Muse's personality engine. Generate a single, witty greeting/prompt (1-2 sentences max) that is:
- Encouraging but not saccharine (keep it real)
- Specific to the user's engagement level, time of day, and the current UI context ({ui_context})
- Relevant to journaling, wisdom synthesis, and community connection
- Uses platform terminology (synthesis, resonance, threads, wisdom, signal)
- Tone: thoughtful mentor who gets the user's journey, slightly philosophical, occasionally humorous

User context:
- Streak: {streak} days
- Resonance score: {resonanceScore} (0-1000 scale)
- Journal entries: {entries}
- Active rooms: {rooms}
- Active threads: {threads}
- Time of day: {period}

Avoid:
- Generic motivational speaker phrases
- Emojis or exclamation marks
- References to other platforms
- Anything that breaks the Muse aesthetic

Output only the prompt text. Do not add quotes, labels, or extra explanation.
`,
  inputVariables: [
    "ui_context",
    "streak",
    "resonanceScore",
    "entries",
    "rooms",
    "threads",
    "period",
  ],
});

function cleanPersonalityPrompt(raw: string) {
  let prompt = raw.trim();
  if (prompt.startsWith('"') && prompt.endsWith('"')) {
    prompt = prompt.slice(1, -1).trim();
  }

  // Hard limit: take at most 2 sentences
  const sentences = prompt.split(/(?<=[.!?])\s+/);
  if (sentences.length > 2) {
    prompt = sentences.slice(0, 2).join(" ").trim();
  }

  // Safety net: never exceed 180 characters so it never bleeds into the UI
  if (prompt.length > 180) {
    const lastSpace = prompt.lastIndexOf(" ", 177);
    prompt = prompt.slice(0, lastSpace > 80 ? lastSpace : 177).trimEnd() + "…";
  }

  return prompt;
}

export async function generatePersonalityGreeting(
  uiContext: string,
  period: GreetingPeriod,
  streak: number,
  resonanceScore: number,
  entries: number,
  rooms: number,
  threads: number,
): Promise<string> {
  const fallback = generateDynamicHumor(period, {
    currentStreak: streak,
    resonanceScore,
    journalEntryCount: entries,
    roomsJoined: rooms,
    threadsActive: threads,
  });

  if (!GROQ_API_KEY) {
    return fallback;
  }

  try {
    const promptValue = await personalityGreetingPrompt.format({
      ui_context: uiContext,
      streak: String(streak),
      resonanceScore: String(resonanceScore),
      entries: String(entries),
      rooms: String(rooms),
      threads: String(threads),
      period,
    });

    const response = await model.invoke(promptValue);
    const content = response.content.toString().trim();
    const cleaned = cleanPersonalityPrompt(content);
    return cleaned || fallback;
  } catch (error) {
    console.error("[AI Personality] generatePersonalityGreeting failed:", error);
    return fallback;
  }
}

// ─── Pervasive AI Integration ───────────────────────────────────────────────

const profileSchema = z.object({
  auraColor: z.string().describe("A hex color code representing their cognitive state (e.g. #34d399)"),
  intelligenceProfile: z.string().describe("A 1-3 word archetype (e.g. 'Systems Architect', 'Socratic Observer')"),
  bio: z.string().describe("A poetic 1-sentence bio reflecting their recent thoughts"),
});

const profileParser = StructuredOutputParser.fromZodSchema(profileSchema);

const profilePrompt = new PromptTemplate({
  template: `You are the Muse AI Profiler. Analyze the following user's public artifacts to generate a "Cognitive Profile".
Focus on the semantic meaning of what they write about.

User Artifacts:
{user_data}

{format_instructions}
`,
  inputVariables: ["user_data"],
  partialVariables: { format_instructions: profileParser.getFormatInstructions() },
});

export async function generateCognitiveProfile(userData: string) {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured in the environment.");
  
  if (!userData.trim()) {
    return {
      auraColor: "#9ca3af",
      intelligenceProfile: "Wanderer",
      bio: "Exploring the void, waiting to leave a mark."
    };
  }

  const promptValue = await profilePrompt.format({ user_data: userData });
  const response = await model.invoke(promptValue);

  try {
    return await profileParser.parse(response.content.toString());
  } catch (error) {
    console.error("Failed to parse profile output:", error);
    return {
      auraColor: "#fbbf24",
      intelligenceProfile: "Enigmatic Thinker",
      bio: "Their thoughts form a complex, unreadable web."
    };
  }
}

const matchReasonPrompt = new PromptTemplate({
  template: `You are the Muse AI Synthesis Engine. Two users share the following conceptual keywords in their digital gardens:
{shared_keywords}

Generate exactly ONE compelling sentence explaining *why* their minds resonate based on these shared concepts.
Do not use their names. Speak directly to the current user (e.g., "You both share a deep curiosity for...").

Reason:
`,
  inputVariables: ["shared_keywords"],
});

export async function generateMatchReason(sharedKeywords: string[]): Promise<string> {
  if (!GROQ_API_KEY) return "You share overlapping interests in the digital ether.";
  if (sharedKeywords.length === 0) return "Your connection is mysterious, born from unexplored potential.";

  const promptValue = await matchReasonPrompt.format({
    shared_keywords: sharedKeywords.join(", "),
  });

  const response = await model.invoke(promptValue);
  let reason = response.content.toString().trim();
  if (reason.startsWith('"') && reason.endsWith('"')) reason = reason.slice(1, -1);
  return reason;
}

const emojiPrompt = new PromptTemplate({
  template: `You are the Muse AI Contextual Engine. The user is writing a journal entry and needs exactly 3 emojis that perfectly match the semantic vibe or meaning of their current sentence.

Sentence:
"{sentence}"

Output EXACTLY 3 emojis, separated by spaces. Do not output any words or explanation.
Example Output: 🚀 🌌 ✨
`,
  inputVariables: ["sentence"],
});

export async function suggestEmojis(sentence: string): Promise<string[]> {
  if (!GROQ_API_KEY) return ["✨", "🧠", "🌱"];
  if (!sentence.trim()) return ["✍️", "💭", "📓"];

  const promptValue = await emojiPrompt.format({ sentence });
  const response = await model.invoke(promptValue);
  
  const rawEmojis = response.content.toString().trim();
  // Filter out any alphanumeric text, just keep emojis
  const emojis = rawEmojis.replace(/[a-zA-Z0-9\s]/g, "").split("").filter(Boolean);
  
  return emojis.slice(0, 3).length === 3 ? emojis.slice(0, 3) : ["✨", "🧠", "🌱"];
}

// ─── AI Observer: Auto-annotate artifacts ───────────────────────────────────

const artifactAnnotationPrompt = new PromptTemplate({
  template: `You are the Muse AI, a silent intellectual observer. A user has just added an artifact to their digital garden.

Artifact Title: "{title}"
User's Note: "{note}"

Generate ONE brief, thought-provoking insight or question about this artifact (1-2 sentences max).
Act like a curious, philosophical co-thinker — not a summarizer.
Do NOT say "This is about..." or start with "I". Just output the observation directly.
`,
  inputVariables: ["title", "note"],
});

export async function generateArtifactAnnotation(
  title: string,
  note: string,
): Promise<string> {
  if (!GROQ_API_KEY) return "The Muse observes in silence.";

  try {
    const promptValue = await artifactAnnotationPrompt.format({ title, note: note || "No note provided." });
    const response = await model.invoke(promptValue);
    let annotation = response.content.toString().trim();
    if (annotation.startsWith('"') && annotation.endsWith('"')) {
      annotation = annotation.slice(1, -1);
    }
    return annotation;
  } catch (err) {
    console.error("[AI Observer] Failed to generate annotation:", err);
    return "Every artifact holds an unasked question.";
  }
}
