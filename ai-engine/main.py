from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from scrapers import scrape_webpage, scrape_youtube_transcript, scrape_social_media, parse_document
from database import get_room_artifacts, save_threads
from synthesizer import synthesize_artifacts

app = FastAPI(title="Muse AI Engine", version="1.0.0")

class AnalysisRequest(BaseModel):
    content: str | None = None
    text: str | None = None
    user_id: str | None = None

class ScrapeRequest(BaseModel):
    url: str

class SynthesizeRequest(BaseModel):
    room_id: str

def _resolve_content(request: AnalysisRequest) -> str:
    return (request.content or request.text or "").strip()

@app.get("/")
def read_root():
    return {"status": "AI Engine is running"}

@app.post("/api/scrape")
def scrape_url(request: ScrapeRequest):
    """
    Intelligently determines the type of URL and routes it to the correct scraper.
    """
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="Missing URL")

    # Route: YouTube Video
    if "youtube.com" in url or "youtu.be" in url:
        result = scrape_youtube_transcript(url)
    
    # Route: Heavy JS Social Media Platforms
    elif any(domain in url for domain in ["twitter.com", "x.com", "reddit.com", "linkedin.com", "instagram.com"]):
        result = scrape_social_media(url)
        
    # Route: Standard Web Article (Fallback)
    else:
        result = scrape_webpage(url)

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
    Pulls all artifacts for a room from the database, runs the LangChain Synthesis Engine, 
    and saves the resulting structured Threads back to the database.
    """
    try:
        # 1. Fetch artifacts from DB
        artifacts = get_room_artifacts(request.room_id)
        if not artifacts:
            return {"status": "success", "message": "No artifacts found to synthesize.", "threads_generated": 0}

        # 2. Run LangChain Synthesis Engine
        db_threads = synthesize_artifacts(artifacts)

        # 3. Save Threads back to DB
        if db_threads:
            save_threads(request.room_id, db_threads)

        return {"status": "success", "threads_generated": len(db_threads)}
    except Exception as e:
        print(f"Synthesis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze")
def analyze_content(request: AnalysisRequest):
    content = _resolve_content(request)

    if not content:
        return {
            "status": "error",
            "message": "Missing content to analyze"
        }

    # Placeholder for actual LangChain/Vector DB logic
    return {
        "status": "success",
        "patterns_detected": ["placeholder_pattern"],
        "sentiment": "neutral",
        "keywords": content.split()[:5]
    }

@app.post("/analyze")
def analyze_content_legacy(request: AnalysisRequest):
    # Backward-compatible alias for older frontend clients.
    return analyze_content(request)
