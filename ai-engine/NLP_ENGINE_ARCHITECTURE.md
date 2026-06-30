# AI Engine NLP Architecture

This document explains the `ai-engine` NLP subsystem, how analysis is performed, and how it connects to synthesis and the rest of the system.

## Overview

The NLP engine is the heart of the Muse intelligence flow.
It provides fast local analysis, optional Groq enrichment, caching, metadata persistence, and context for synthesis.

## Architecture Blueprint

```text
User Content / Artifact
     ↓
AI Engine API
     ↓
Pipeline
  ├─ analyze_content() → local NLP + optional Groq
  ├─ enrich_artifact() → attach insights to artifact
  ├─ store_analysis_metadata() → DB metadata
  └─ synthesize_with_insights() → GPT synthesis
     ↓
Threads / journal response / streak spark
```

## Key Components

### `ai-engine/nlp_engine.py`

- `InsightResult` – normalized analysis output
- `NLPEngine` – abstract base class
- `ProductionLocalNLPEngine` – local NLP analysis engine
- `GroqEnrichedEngine` – local analysis + optional Groq LLM enrichment
- `NLPEngineFactory` – config-based engine loader

### `ai-engine/pipeline.py`

- `IntelligencePipeline` – orchestrates NLP analysis, artifact enrichment, storage, and synthesis
- `get_pipeline()` – singleton pipeline access
- `process_journal_entry()` – journal analysis workflow
- `synthesize_with_insights()` – full artifact synthesis workflow

### `ai-engine/main.py`

API entrypoints that use the pipeline:
- `/api/analyze`
- `/api/synthesize`
- `/api/streak-spark`

## NLP Flow

### 1. Analyze content

`IntelligencePipeline.analyze_content(content, artifact_id)`:
- Calls `NLPEngineFactory.get_engine()`
- The engine analyzes content with local NLP
- If `artifact_id` exists, caches the result
- Returns an `InsightResult`

### 2. Enrich artifacts

`IntelligencePipeline.enrich_artifact(artifact)`:
- Extracts raw content from `artifact["unstructured_data"]`
- Runs `analyze_content()`
- Wraps artifact with `nlp_analysis`
- Stores analysis metadata in the DB when possible

### 3. Store metadata

`store_analysis_metadata()` writes insights to persisted storage:
- `save_artifact_analysis()`
- `save_journal_analysis()`
- `insert_artifact_nlp_metadata()`

This makes insights queryable for later analytics and synthesis.

## NLP Engine Strategies

### ProductionLocalNLPEngine

This is the default local NLP engine that provides:
- multi-strategy theme extraction
- sentiment scoring
- keyword generation
- caching with TTL
- fallback behavior if spaCy or TextBlob are unavailable

#### Theme extraction

1. `TF-IDF` extraction using `TfidfVectorizer`
2. `Linguistic` extraction using spaCy noun chunks and entities
3. Combined themes limited to 5 items

#### Sentiment analysis

- Preferred: `TextBlob` polarity + subjectivity
- Fallback: lexicon-based sentiment scoring
- Confidence is derived from subjectivity and term weights

#### Caching

- Uses a hashed text key
- Evicts oldest entry when cache size exceeds 1000
- TTL default: 60 minutes

### GroqEnrichedEngine

This engine is built for production-grade enrichment:
- Always starts with `ProductionLocalNLPEngine`
- If `GROQ_API_KEY` is set, it calls Groq via `langchain_groq`
- Merges local and Groq themes and sentiment
- Returns an `analysis_method` of `groq-enriched`

## Endpoint Workflows

### `/api/analyze`

1. Frontend sends user text and optional `journal_id`
2. Backend uses `pipeline.process_journal_entry(...)`
3. Pipeline analyzes text and optionally persists metadata
4. Response includes:
  - `themes`
  - `sentiment_score`
  - `keywords`
  - `confidence`
  - `method`
  - `ready_for_synthesis`

### `/api/synthesize`

1. Fetch room artifacts from DB
2. For each artifact, call `enrich_artifact()`
3. Add `nlp_analysis` to each artifact payload
4. Send enriched artifacts to `synthesize_artifacts()`
5. Save generated threads back to DB

### `/api/streak-spark`

1. Analyze streak spark content instantly
2. Use themes and sentiment to build a summary
3. Return spark quality label and insights

## Data Contract

The NLP engine standardizes outputs through `InsightResult.to_dict()`:

```json
{
  "themes": ["theme1", "theme2"],
  "sentiment_score": 0.75,
  "keywords": ["theme1", "theme2"],
  "confidence": 0.88,
  "method": "groq-enriched",
  "timestamp": "2026-06-30T10:00:00.000000"
}
```

This payload is attached to artifacts and journal entries as metadata.

## Connection to the Rest of the System

- `ai-engine/main.py` exposes the NLP flow publicly.
- `scrapers` feed content into the NLP pipeline.
- `synthesizer` consumes NLP-enriched artifacts.
- `database` persistence stores analysis metadata for later reuse.

## Benefits of this design

- **Better GPT synthesis** via pre-computed themes and sentiment.
- **Faster user feedback** with instant local NLP analysis.
- **Cost savings** by reducing raw GPT context volume.
- **Resilience** with fallback local analysis if external LLM enrichment fails.
- **Extensibility**: new engines can be added via `NLPEngineFactory`.

## Notes for deep dive

- `ProductionLocalNLPEngine` is the core analysis engine.
- `GroqEnrichedEngine` is optional and only active when `GROQ_API_KEY` is present.
- The `IntelligencePipeline` is intentionally lightweight and declarative.
- The design is optimized for mixed content: web artifacts, documents, and journal text.
