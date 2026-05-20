from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Muse AI Engine", version="1.0.0")

class AnalysisRequest(BaseModel):
    content: str | None = None
    text: str | None = None
    user_id: str | None = None


def _resolve_content(request: AnalysisRequest) -> str:
    return (request.content or request.text or "").strip()

@app.get("/")
def read_root():
    return {"status": "AI Engine is running"}

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
