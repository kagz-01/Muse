import { ChatGroq } from "npm:@langchain/groq";
import { PromptTemplate } from "npm:@langchain/core/prompts";
import { StructuredOutputParser } from "npm:@langchain/core/output_parsers";
import { z } from "npm:zod";

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
  template: `You are the Muse AI Synthesis Engine. Your purpose is to analyze a collection of unstructured artifacts (notes, web clips, concepts) and extract a cohesive "Thread Blueprint."

Find the hidden connections, underlying themes, and profound questions hidden within this chaos.

Artifacts:
{artifacts_text}

{format_instructions}
`,
  inputVariables: ["artifacts_text"],
  partialVariables: { format_instructions: parser.getFormatInstructions() },
});

export async function synthesizeArtifacts(artifacts: Record<string, unknown>[]) {
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

  const promptValue = await synthesisPrompt.format({ artifacts_text: artifactsText });

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
