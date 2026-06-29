import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from nlp_engine import NLPEngineFactory

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

Given the following artifacts (with pre-analyzed themes, sentiment, and keywords from local NLP), 
generate 1 to 3 distinct "Threads" of knowledge.

Use the pre-analyzed themes as starting points and enrich them with deeper connections from the artifact content.
The pre-analysis serves as a quick map of what the user cared about; your job is to synthesize these into coherent patterns.

For each thread, provide:
1. A Theme name (use or refine the pre-analyzed themes).
2. A brief, brilliant summary synthesizing the connected ideas.
3. Exactly three (3) Socratic questions to provoke the user to journal about this theme.
4. The exact artifact IDs that belong to this theme.

Do not invent information. Rely strictly on the provided artifact contents and pre-analysis.
Weight your themes towards high sentiment artifacts - these show what truly resonated with the user.
"""

def synthesize_artifacts(artifacts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Runs LangChain over the given artifacts and returns structured threads.
    
    Supports two input types:
    1. Enriched artifacts (with nlp_analysis already included)
    2. Raw artifacts (will be pre-analyzed if available)
    """
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

    # Format the data for the prompt with pre-analyzed NLP insights
    formatted_artifacts = []
    
    for a in artifacts:
        artifact_id = a.get('id', 'unknown')
        source_url = a.get('source_url', 'internal')
        
        # Get content - handle both raw and enriched artifacts
        content = a.get("unstructured_data", "")
        if isinstance(content, dict):
            content = json.dumps(content)
        else:
            content = str(content)
        
        # Check if artifact is already enriched with NLP analysis
        nlp_analysis = a.get("nlp_analysis")
        if nlp_analysis:
            # Use existing analysis
            nlp_context = f"\n[PRE-ANALYSIS] Themes: {', '.join(nlp_analysis.get('themes', []))} | Sentiment: {nlp_analysis.get('sentiment_score', 0)} | Keywords: {', '.join(nlp_analysis.get('keywords', []))}"
        else:
            # Pre-analyze if not already done (for backward compatibility)
            try:
                from nlp_engine import NLPEngineFactory
                nlp_engine = NLPEngineFactory.get_engine()
                nlp_result = nlp_engine.analyze(content)
                nlp_context = f"\n[PRE-ANALYSIS] Themes: {', '.join(nlp_result.themes)} | Sentiment: {nlp_result.sentiment_score} | Keywords: {', '.join(nlp_result.keywords)}"
            except Exception as e:
                print(f"Warning: Could not analyze artifact {artifact_id}: {e}")
                nlp_context = "\n[PRE-ANALYSIS] Analysis unavailable"
        
        formatted_artifacts.append(f"--- ARTIFACT ID: {artifact_id} (Source: {source_url}) ---\nCONTENT: {content}{nlp_context}")
    
    artifacts_data_str = "\n\n".join(formatted_artifacts)

    # Invoke the chain with enriched context
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
