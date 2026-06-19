import json
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

# Define the expected structured output from the LLM
class SocraticQuestion(BaseModel):
    question: str = Field(description="A deep, thought-provoking question to prompt journaling.")

class ThreadBlueprint(BaseModel):
    theme: str = Field(description="The core theme or pattern discovered.")
    summary: str = Field(description="A 2-3 sentence summary synthesizing the connected knowledge.")
    socratic_questions: List[SocraticQuestion] = Field(description="Exactly 3 socratic questions related to this theme.")
    relevant_artifact_ids: List[str] = Field(description="List of artifact IDs that contributed to this theme.")

class SynthesisResult(BaseModel):
    threads: List[ThreadBlueprint] = Field(description="A list of 1 to 3 distinct threads discovered in the raw data.")

# The Master Prompt
SYSTEM_PROMPT = """
You are the Muse Synthesis Engine. You are a world-class curator of knowledge.
Your job is to read raw, chaotic data collected from various sources (YouTube transcripts, PDFs, tweets, blogs) and identify underlying patterns.

Given the following artifacts, generate 1 to 3 distinct "Threads" of knowledge.
For each thread, provide:
1. A Theme name.
2. A brief, brilliant summary synthesizing the connected ideas.
3. Exactly three (3) Socratic questions to provoke the user to journal about this theme.
4. The exact artifact IDs that belong to this theme.

Do not invent information. Rely strictly on the provided artifact contents.
"""

def synthesize_artifacts(artifacts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Runs LangChain over the given artifacts and returns structured threads."""
    if not artifacts:
        return []

    # Initialize the LLM with structured output
    llm = ChatOpenAI(model="gpt-4o", temperature=0.4)
    structured_llm = llm.with_structured_output(SynthesisResult)

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        ("human", "Here are the artifacts:\n\n{artifacts_data}")
    ])

    chain = prompt | structured_llm

    # Format the data for the prompt
    formatted_artifacts = []
    for a in artifacts:
        # Dump unstructured data safely
        data_dump = json.dumps(a["unstructured_data"]) if isinstance(a["unstructured_data"], dict) else str(a["unstructured_data"])
        formatted_artifacts.append(f"--- ARTIFACT ID: {a['id']} (Source: {a['source_url']}) ---\nCONTENT: {data_dump}")
    
    artifacts_data_str = "\n\n".join(formatted_artifacts)

    # Invoke the chain
    result: SynthesisResult = chain.invoke({"artifacts_data": artifacts_data_str})

    # Convert Pydantic models back to simple dicts for the database
    db_threads = []
    for thread in result.threads:
        db_threads.append({
            "artifact_ids": thread.relevant_artifact_ids,
            "blueprint": {
                "theme": thread.theme,
                "summary": thread.summary,
                "socratic_questions": [q.question for q in thread.socratic_questions]
            }
        })

    return db_threads
