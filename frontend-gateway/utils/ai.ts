import { ChatOpenAI } from "npm:@langchain/openai";
import { PromptTemplate } from "npm:@langchain/core/prompts";
import { StructuredOutputParser } from "npm:@langchain/core/output_parsers";
import { z } from "npm:zod";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";

// Initialize the model
const model = new ChatOpenAI({
  openAIApiKey: OPENAI_API_KEY,
  modelName: "gpt-4o-mini",
  temperature: 0.2,
});

// Define the blueprint structure we expect from the AI
const blueprintSchema = z.object({
  theme: z.string().describe("The overarching theme connecting the artifacts"),
  summary: z.string().describe("A concise summary of the synthesized insights"),
  socratic_questions: z.array(z.string()).describe("2-3 deep, provocative questions generated from the synthesis"),
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

export async function synthesizeArtifacts(artifacts: any[]) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured in the environment.");
  }

  // Combine artifacts into a readable text chunk
  const artifactsText = artifacts.map((art, index) => {
    let content = "";
    if (art.unstructured_data) {
      // Just extract raw text if available, or dump the whole JSON
      content = art.unstructured_data.raw_text || JSON.stringify(art.unstructured_data);
    }
    return `Artifact ${index + 1} (${art.type}):\n${content}`;
  }).join("\n\n");

  const promptValue = await synthesisPrompt.format({ artifacts_text: artifactsText });
  
  // Call OpenAI
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
