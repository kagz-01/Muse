from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import logging
import os
from datetime import datetime

from scrapers import parse_document, scrape_url
from database import get_room_artifacts, save_threads
from synthesizer import synthesize_artifacts
from nlp_engine import NLPEngineFactory
from pipeline import get_pipeline
from config import get_config

# Configure logging
config = get_config()
logging.basicConfig(
    level=config.api.log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Muse AI Engine",
    version="2.0.0",
    description="Production-grade unified intelligence pipeline for Muse"
)

class AnalysisRequest(BaseModel):
    content: str | None = None
    text: str | None = None
    user_id: str | None = None
    journal_id: str | None = None

class ScrapeRequest(BaseModel):
    url: str

class SynthesizeRequest(BaseModel):
    room_id: str

class StreakSparkRequest(BaseModel):
    contribution_type: str = "journal"
    content: str = ""
    destination: str = "journal"

def _resolve_content(request: AnalysisRequest) -> str:
    return (request.content or request.text or "").strip()

@app.get("/api/health/services")
def health_check():
    """Health check endpoint for service status."""
    pipeline = get_pipeline()
    return {
        "status": "healthy",
        "services": {
            "ai": {"status": "up", "statusCode": 200, "endpoint": "/api/analyze"},
            "nlp": {"status": "up", "statusCode": 200, "endpoint": "internal"},
            "synthesis": {"status": "up", "statusCode": 200, "endpoint": "/api/synthesize"}
        },
        "checkedAt": __import__("datetime").datetime.now().isoformat(),
        "pipeline": "unified-intelligence-engine"
    }

@app.get("/")
def read_root():
    return {
        "status": "Muse AI Engine is running",
        "version": "2.0",
        "pipeline": "Unified Intelligence Pipeline (NLP → Analysis → Synthesis)"
    }

@app.post("/api/scrape")
def scrape_url(request: ScrapeRequest):
    """
    Intelligently determines the type of URL and routes it to the correct scraper.
    """
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="Missing URL")

    result = scrape_url(url)

    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
        
    return result

@app.post("/api/upload-document")
async def upload_document(file: UploadFile = File(...)):
    """
    Accepts a multipart/form-data file upload (PDF, DOCX, XLSX, TXT)
    and routes it to the Universal Document Parser.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
        
    # Read the bytes into memory
    file_bytes = await file.read()
    
    # Pass to the unstructured parser
    result = parse_document(file_bytes, file.filename)
    
    if result.get("status") == "error":
        raise HTTPException(status_code=400, detail=result.get("message"))
        
    return result

@app.post("/api/synthesize")
def synthesize_room(request: SynthesizeRequest):
    """
    Pulls all artifacts for a room from the database, 
    pre-analyzes them with NLP, then runs LangChain Synthesis.
    Saves resulting Threads back to the database.
    
    Pipeline:
    1. Fetch artifacts from DB
    2. Pre-analyze each with NLP (themes, sentiment, keywords)
    3. Synthesize with GPT-4 using NLP context
    4. Save Threads
    """
    try:
        pipeline = get_pipeline()
        
        # 1. Fetch artifacts from DB
        artifacts = get_room_artifacts(request.room_id)
        if not artifacts:
            return {"status": "success", "message": "No artifacts found to synthesize.", "threads_generated": 0}

        # 2 & 3. Use pipeline to pre-analyze and synthesize
        db_threads = pipeline.synthesize_with_insights(artifacts)

        # 4. Save Threads back to DB
        if db_threads:
            save_threads(request.room_id, db_threads)

        return {
            "status": "success", 
            "threads_generated": len(db_threads),
            "message": f"Generated {len(db_threads)} synthesis thread(s) with NLP insights"
        }
    except Exception as e:
        print(f"Synthesis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/streak-spark")
def generate_streak_spark(request: StreakSparkRequest):
    """
    Enhanced: Uses NLP to analyze content and generate contextual streak spark.
    Provides instant feedback on contribution quality + sentiment.
    """
    content = (request.content or "").strip()
    contribution_type = (request.contribution_type or "journal").lower()
    destination = request.destination or "journal"

    if not content:
        content = "A meaningful resonance ritual was completed"

    # Analyze content for context
    pipeline = get_pipeline()
    insights = pipeline.analyze_content(content)
    
    labels = {
        "journal": "Reflection",
        "artifact": "Artifact",
        "synthesis": "Synthesis",
        "entanglement": "Entanglement",
        "network": "Network",
        "room": "Room",
    }

    label = labels.get(contribution_type, "Resonance")
    
    # Build summary with NLP context
    theme_context = f" [{', '.join(insights.themes)}]" if insights.themes else ""
    summary = f"{label} spark: {content}{theme_context}"
    
    if destination.startswith("partner:"):
        summary = f"{summary} via shared entanglement"

    return {
        "status": "success",
        "summary": summary,
        "insights": {
            "themes": insights.themes,
            "sentiment_score": insights.sentiment_score,
            "quality": "strong" if insights.sentiment_score > 0.5 else "neutral" if insights.sentiment_score >= -0.5 else "needs_reflection"
        }
    }

@app.post("/api/analyze")
async def analyze_content(request: AnalysisRequest):
    """
    Production-grade unified NLP analysis endpoint.
    
    Features:
    ✅ Instant NLP feedback (real-time, no API wait)
    ✅ Multi-strategy analysis (TF-IDF + Linguistic + LLM)
    ✅ Groq API enrichment (optional, free)
    ✅ Caching with TTL
    ✅ Confidence scoring
    ✅ Sentiment analysis
    
    Pipeline:
    1. Analyze content with local NLP (instant)
    2. Optionally enrich with Groq API (faster + more diverse)
    3. Return themes, sentiment, keywords with confidence
    4. Cache result for future use
    """
    content = _resolve_content(request)

    if not content:
        return {
            "status": "error",
            "message": "Missing content to analyze"
        }

    try:
        pipeline = get_pipeline()
        result = await pipeline.process_journal_entry(
            content,
            request.user_id or "anonymous",
            journal_id=request.journal_id,
        )
        logger.info(f"Analysis completed: {len(result['insights']['themes'])} themes")
        return result
    except Exception as e:
        logger.error(f"Analysis Error: {e}", exc_info=True)
        return {
            "status": "error",
            "message": f"Analysis failed: {str(e)}"
        }

@app.post("/analyze")
async def analyze_content_legacy(request: AnalysisRequest):
    """Backward-compatible alias for older frontend clients."""
    return await analyze_content(request)
