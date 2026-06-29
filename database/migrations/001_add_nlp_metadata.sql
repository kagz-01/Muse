-- Migration: Add NLP Metadata Support to Schema
-- Date: 2026-06-29
-- Purpose: Enable production-grade NLP v2.0 engine to persist and query results
-- Breaking: No (all columns nullable, all changes additive)

BEGIN;

-- Step 1: Add NLP metadata columns to journal_entries
ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS nlp_analysis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS nlp_confidence NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ;

-- Step 2: Add NLP metadata columns to artifacts
ALTER TABLE artifacts
ADD COLUMN IF NOT EXISTS nlp_analysis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS nlp_confidence NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ;

-- Step 3: Create NLP metadata table for analytics
CREATE TABLE IF NOT EXISTS artifact_nlp_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artifact_id UUID REFERENCES artifacts(id) ON DELETE CASCADE,
    journal_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    themes TEXT[] DEFAULT ARRAY[]::TEXT[],
    sentiment_score NUMERIC(3,2),
    keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
    confidence NUMERIC(3,2) NOT NULL,
    analysis_method TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK (artifact_id IS NOT NULL OR journal_id IS NOT NULL)
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_artifact_nlp_artifact_id ON artifact_nlp_metadata(artifact_id);
CREATE INDEX IF NOT EXISTS idx_artifact_nlp_journal_id ON artifact_nlp_metadata(journal_id);
CREATE INDEX IF NOT EXISTS idx_artifact_nlp_confidence ON artifact_nlp_metadata(confidence DESC);
CREATE INDEX IF NOT EXISTS idx_artifact_nlp_timestamp ON artifact_nlp_metadata(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artifact_nlp_method ON artifact_nlp_metadata(analysis_method);

-- Indexes for fast filtering in main tables
CREATE INDEX IF NOT EXISTS idx_artifacts_nlp_confidence ON artifacts(nlp_confidence DESC);
CREATE INDEX IF NOT EXISTS idx_artifacts_analyzed_at ON artifacts(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_journal_nlp_confidence ON journal_entries(nlp_confidence DESC);
CREATE INDEX IF NOT EXISTS idx_journal_analyzed_at ON journal_entries(analyzed_at DESC);

COMMIT;

-- Verification queries (run after migration)
-- SELECT COUNT(*) FROM artifact_nlp_metadata;
-- SELECT * FROM information_schema.columns WHERE table_name = 'artifacts' AND column_name LIKE 'nlp%';
-- SELECT * FROM information_schema.columns WHERE table_name = 'journal_entries' AND column_name LIKE 'nlp%';
