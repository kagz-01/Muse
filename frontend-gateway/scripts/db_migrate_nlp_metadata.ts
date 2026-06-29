import "https://deno.land/std@0.214.0/dotenv/load.ts";
import { executeDB } from "../utils/db.ts";

async function run() {
  const queries = [
    `ALTER TABLE journal_entries
      ADD COLUMN IF NOT EXISTS nlp_analysis JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS nlp_confidence NUMERIC(3,2),
      ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ`,

    `ALTER TABLE artifacts
      ADD COLUMN IF NOT EXISTS nlp_analysis JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS nlp_confidence NUMERIC(3,2),
      ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMPTZ`,

    `CREATE TABLE IF NOT EXISTS artifact_nlp_metadata (
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
    )`,

    `CREATE INDEX IF NOT EXISTS idx_artifact_nlp_artifact_id ON artifact_nlp_metadata(artifact_id)`,
    `CREATE INDEX IF NOT EXISTS idx_artifact_nlp_journal_id ON artifact_nlp_metadata(journal_id)`,
    `CREATE INDEX IF NOT EXISTS idx_artifact_nlp_confidence ON artifact_nlp_metadata(confidence DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_artifact_nlp_timestamp ON artifact_nlp_metadata(created_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_artifact_nlp_method ON artifact_nlp_metadata(analysis_method)`,
    `CREATE INDEX IF NOT EXISTS idx_artifacts_nlp_confidence ON artifacts(nlp_confidence DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_artifacts_analyzed_at ON artifacts(analyzed_at DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_journal_nlp_confidence ON journal_entries(nlp_confidence DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_journal_analyzed_at ON journal_entries(analyzed_at DESC)`,
  ];

  for (const q of queries) {
    try {
      await executeDB(q);
      console.log(`✓ ${q.slice(0, 80).replace(/\n/g, " ")}...`);
    } catch (e) {
      console.error(`✗ Error executing migration:`, (e as Error).message);
    }
  }

  console.log("NLP metadata migration complete.");
  Deno.exit(0);
}

run().catch((err) => {
  console.error("Migration failed:", err);
  Deno.exit(1);
});
