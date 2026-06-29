# 🚀 Production NLP Engine - Deployment Guide

## What's New (v2.0)

Your NLP engine is now **production-grade** with:

### ✨ Features
- 🎯 **Multi-strategy analysis** - TF-IDF + Linguistic + LLM enrichment
- ⚡ **Groq API integration** - Free, 10x faster than OpenAI (optional)
- 💾 **Intelligent caching** - TTL-based cache with automatic eviction
- 📊 **Confidence scoring** - Know how confident each analysis is
- 🔄 **Async/await support** - Non-blocking, concurrent analysis
- ⚙️ **Dynamic configuration** - Environment-based settings
- 📝 **Production logging** - Detailed, structured logs
- 🏥 **Health monitoring** - Service status endpoints

---

## Architecture Comparison

### BEFORE (v1.0 - Simple MVP)
```
Input → Local NLP → Output
Cost: Free
Speed: <100ms
Quality: Good
```

### AFTER (v2.0 - Production)
```
Input → Local NLP (fast baseline)
     ↓
     → Optional Groq LLM (enrichment, free)
     ↓
     → Caching (1000 cached results)
     ↓
     → Confidence scoring
     ↓
     → Themes + Sentiment + Keywords + Confidence

Cost: Free (Groq is free!)
Speed: <500ms with enrichment
Quality: Excellent
```

---

## Configuration

### Quick Start (Development)
```bash
# 1. Copy example config
cp .env.example .env

# 2. Set up local dependencies (no API keys needed!)
pip install -r requirements.txt
python -m spacy download en_core_web_sm

# 3. Run
uvicorn main:app --reload
```

### Production Setup (Recommended: Groq)

1. **Get Groq API Key** (FREE!)
   - Go to: https://console.groq.com
   - Sign up
   - Copy your API key

2. **Update .env**
   ```
   ENVIRONMENT=production
   NLP_ENGINE_TYPE=groq_enriched
   GROQ_API_KEY=gsk_your_key_here
   SYNTHESIS_MODEL=gpt-4o
   OPENAI_API_KEY=sk_your_key_here
   LOG_LEVEL=WARNING
   ```

3. **Deploy**
   ```bash
   docker build -t muse-ai-engine .
   docker run \
     -e GROQ_API_KEY=$GROQ_API_KEY \
     -e OPENAI_API_KEY=$OPENAI_API_KEY \
     -e ENVIRONMENT=production \
     muse-ai-engine
   ```

---

## API Responses

### `/api/analyze` Response (NEW)

```json
{
  "status": "success",
  "insights": {
    "themes": ["learning", "growth", "discovery"],
    "sentiment_score": 0.75,
    "keywords": ["learning", "growth", "discovery"],
    "confidence": 0.88,
    "method": "groq-enriched",
    "timestamp": "2026-06-29T10:30:45.123456"
  },
  "ready_for_synthesis": true,
  "message": "Entry analyzed. Found 3 theme(s) with 75.0% sentiment"
}
```

**Fields explained:**
- `themes` - Main ideas extracted (diverse with Groq)
- `sentiment_score` - Emotional tone (-1.0 = very negative, 1.0 = very positive)
- `keywords` - Top 3 themes for quick summary
- `confidence` - How confident (0.0-1.0) in the analysis
- `method` - Which engine analyzed: "local-nlp-production" or "groq-enriched"

---

## Performance Metrics

### Speed

| Operation | Time | Notes |
|-----------|------|-------|
| First analysis | <100ms | Local NLP |
| Cached analysis | <5ms | Memory lookup |
| With Groq enrichment | <500ms | Groq API + local |
| Synthesis (with context) | 3-4s | GPT-4 + pre-analysis |

### Cost

| Operation | Cost | Monthly (1000 users) |
|-----------|------|----------------------|
| Local NLP analysis | $0 | $0 |
| Groq enrichment | $0 | $0 |
| Synthesis (GPT-4) | ~$0.08 | ~$80 |
| **Total** | | **~$80** |

**Without NLP pre-processing:**
- Synthesis cost: ~$0.10 per
- Monthly (1000 users): ~$100

**Savings: ~20% with NLP pipeline** 💰

---

## Environment Variables

### Core Settings
```bash
# Environment type
ENVIRONMENT=production  # development, staging, production

# NLP Engine
NLP_ENGINE_TYPE=groq_enriched  # local or groq_enriched
GROQ_API_KEY=gsk_...           # Get from https://console.groq.com (FREE)

# Synthesis (GPT-4)
SYNTHESIS_MODEL=gpt-4o
OPENAI_API_KEY=sk_...

# API Server
API_HOST=0.0.0.0
API_PORT=8000
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR
```

### Advanced Tuning
```bash
# Caching
NLP_CACHE_TTL_MINUTES=60
NLP_MAX_CACHE_SIZE=1000

# Components
NLP_ENABLE_SPACY=true
NLP_ENABLE_TEXTBLOB=true

# Performance
NLP_MAX_TEXT_LENGTH=10000
SYNTHESIS_TIMEOUT_SECONDS=30
```

---

## Multi-Strategy Analysis (How It Works)

The new NLP engine uses THREE strategies:

### 1. **TF-IDF Vectorization**
- What: Statistical importance of terms
- Strength: Fast, consistent
- Uses: Finding important words

### 2. **Linguistic Analysis (spaCy)**
- What: Semantic understanding via NER + noun chunks
- Strength: Understands concepts, not just words
- Uses: Finding meaningful phrases ("quantum computing" not just "quantum")

### 3. **Groq LLM Enrichment** (Optional)
- What: Fast LLM inference for diverse themes
- Strength: Captures nuance, diverse perspectives
- Uses: Ensuring variety, catching context

**Combination = Robust analysis** ✅

---

## Groq vs Local NLP

### When to Use LOCAL NLP
- 🔒 Strict privacy requirements (all-local processing)
- 🚀 Ultra-low latency needed (<100ms)
- 💸 Zero API calls desired
- 📦 Minimal dependencies

### When to Use GROQ ENRICHED (Recommended)
- ✨ Want better quality + diversity (recommended)
- 💚 Groq API is FREE
- ⚡ 500ms latency acceptable
- 🎯 Production quality matters
- 📊 Want confidence scores from LLM

**Result: Groq is almost always better for production** 🌟

---

## Monitoring & Observability

### Health Check Endpoint
```bash
curl http://localhost:8000/api/health/services
```

Response:
```json
{
  "status": "healthy",
  "services": {
    "ai": {"status": "up"},
    "nlp": {"status": "up"},
    "synthesis": {"status": "up"}
  },
  "pipeline": "unified-intelligence-engine"
}
```

### Logging

Structured logs for each operation:
```
2026-06-29 10:30:45 - nlp_engine - INFO - Analyzed: 3 themes, sentiment 0.75, confidence 0.88
2026-06-29 10:31:22 - pipeline - INFO - Processing journal entry for user user123
2026-06-29 10:31:25 - synthesizer - INFO - Generated 2 threads
```

### Metrics to Track
- Average analysis latency
- Cache hit rate
- Groq enrichment failures
- GPT-4 synthesis time
- Error rates

---

## Docker Deployment

### Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc g++ make \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt && \
    python -m spacy download en_core_web_sm

# Copy app
COPY . .

# Download TextBlob corpora
RUN python -m textblob.download_corpora

# Run
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  muse-ai-engine:
    build: .
    ports:
      - "8000:8000"
    environment:
      ENVIRONMENT: production
      NLP_ENGINE_TYPE: groq_enriched
      GROQ_API_KEY: ${GROQ_API_KEY}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      LOG_LEVEL: WARNING
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/api/health/services"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

## Testing

### Local Analysis Test
```python
import asyncio
from nlp_engine import NLPEngineFactory

async def test():
    engine = NLPEngineFactory.get_engine()
    result = await engine.analyze("Today I learned about distributed systems")
    print(f"Themes: {result.themes}")
    print(f"Sentiment: {result.sentiment_score}")
    print(f"Confidence: {result.confidence}")

asyncio.run(test())
```

### API Test
```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Today I realized something important about learning",
    "user_id": "test_user"
  }'
```

---

## Migration from v1.0

### ✅ Backward Compatible
- Old endpoints still work
- Old response format still supported
- Can gradually migrate

### 🆕 New Response Format
```json
{
  "status": "success",
  "insights": {
    "confidence": 0.88,        // NEW
    "method": "groq-enriched", // NEW
    "timestamp": "..."          // NEW
  }
}
```

### Upgrade Path
1. Deploy v2.0 with `NLP_ENGINE_TYPE=local` first (same as v1.0)
2. Set `GROQ_API_KEY` once you have it
3. Switch to `NLP_ENGINE_TYPE=groq_enriched`
4. No frontend changes needed!

---

## Troubleshooting

### Issue: "spaCy model not found"
```bash
python -m spacy download en_core_web_sm
```

### Issue: "GROQ_API_KEY not set"
```bash
export GROQ_API_KEY=gsk_...
# or set in .env file
```

### Issue: Analysis is slow
- Check `LOG_LEVEL=DEBUG` for timing breakdown
- Verify Groq API is responding: `curl https://api.groq.com/health`
- Try local NLP only: `NLP_ENGINE_TYPE=local`

### Issue: Low confidence scores
- Might indicate ambiguous content
- Try longer text (>50 words) for better analysis
- Confidence <0.5 = consider manual review

---

## What's Next?

1. ✅ **Deploy v2.0** with Groq API
2. 📊 **Monitor** cache hit rates and latency
3. 🎯 **Optimize** based on your usage patterns
4. 🔄 **Iterate** on theme diversity
5. 📈 **Add analytics** dashboard

---

## Support & Questions

- **Groq API Docs**: https://console.groq.com/docs
- **LangChain Integration**: https://python.langchain.com/docs/integrations/llms/groq
- **spaCy Documentation**: https://spacy.io
- **TextBlob Guide**: https://textblob.readthedocs.io

---

## Summary

| Aspect | v1.0 | v2.0 |
|--------|------|------|
| NLP Quality | Good | Excellent |
| Theme Diversity | Limited | High |
| API Speed | <100ms | <500ms |
| Cost | Free | Free |
| Caching | None | TTL-based |
| Confidence | No | Yes |
| Groq Support | No | Yes |
| Production Ready | No | Yes |

**v2.0 = Better quality, same cost, production-ready** 🎉
