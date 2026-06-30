"""
Unified Intelligence Pipeline Orchestrator

Coordinates the flow:
User Input → NLP Analysis → Storage → Synthesis Context → GPT Threads
"""

import json
import logging
from typing import Any, Dict, Optional, List
from config import get_config
from nlp_engine import NLPEngineFactory, InsightResult
from database import (
    save_artifact_analysis,
    save_journal_analysis,
    insert_artifact_nlp_metadata,
)
from synthesizer import synthesize_artifacts

logger = logging.getLogger(__name__)

class ArtifactWithInsights(Dict[str, Any]):
    """Artifact enriched with pre-computed NLP insights."""
    
    def __init__(self, artifact: Dict[str, Any], insights: Optional[InsightResult] = None):
        self.artifact = artifact
        self.insights = insights
        super().__init__({
            **artifact,
            "nlp_analysis": insights.to_dict() if insights else None
        })

class IntelligencePipeline:
    """Orchestrates the full intelligence pipeline."""
    
    def __init__(self):
        self.config = get_config()
        self.nlp_engine = NLPEngineFactory.get_engine()
        self.analysis_cache: Dict[str, InsightResult] = {}
    
    async def analyze_content(self, content: str, artifact_id: Optional[str] = None) -> InsightResult:
        """
        Step 1: Analyze content for themes, sentiment, keywords.
        Returns insights immediately for frontend feedback.
        """
        if artifact_id and artifact_id in self.analysis_cache:
            logger.info(f"Using cached analysis for {artifact_id}")
            return self.analysis_cache[artifact_id]
        
        logger.info(f"Analyzing content ({len(content)} chars)")
        insights = await self.nlp_engine.analyze(content)
        
        if artifact_id:
            self.analysis_cache[artifact_id] = insights
        
        return insights
    
    async def enrich_artifact(self, artifact: Dict[str, Any]) -> ArtifactWithInsights:
        """
        Step 2: Enrich artifact with NLP insights.
        Pre-analyzes content to create context for synthesis.
        """
        content: Any = artifact.get("unstructured_data", "")
        if isinstance(content, dict):
            content = json.dumps(content)
        else:
            content = str(content)
        
        insights = await self.analyze_content(content, artifact.get("id"))
        enriched = ArtifactWithInsights(artifact, insights)

        if artifact.get("id"):
            self.store_analysis_metadata(artifact.get("id"), insights, artifact.get("user_id", "anonymous"))

        logger.info(f"Enriched artifact {artifact.get('id')} with themes: {insights.themes}")
        return enriched
    
    def store_analysis_metadata(
        self,
        artifact_id: Optional[str],
        insights: InsightResult,
        user_id: Optional[str] = None,
        journal_id: Optional[str] = None,
    ) -> bool:
        """
        Step 3: Store NLP analysis metadata in database.
        Makes insights available for future queries and analytics.
        """
        try:
            payload = insights.to_dict()
            stored = False

            if artifact_id:
                save_artifact_analysis(artifact_id, payload, insights.confidence, insights.analysis_method)
                stored = True
                if self.config.nlp.enable_nlp_metadata_table:
                    insert_artifact_nlp_metadata(artifact_id=artifact_id, journal_id=journal_id, insights=payload)

            if journal_id:
                save_journal_analysis(journal_id, payload, insights.confidence, insights.analysis_method)
                stored = True
                if self.config.nlp.enable_nlp_metadata_table:
                    insert_artifact_nlp_metadata(artifact_id=None, journal_id=journal_id, insights=payload)

            if not stored:
                logger.warning("No artifact_id or journal_id provided for NLP metadata persistence")
                return False

            logger.info(f"Stored analysis metadata for artifact={artifact_id} journal={journal_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to store analysis metadata: {e}")
            return False
    
    async def synthesize_with_insights(self, artifacts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Step 4: Synthesize artifacts using NLP context.
        GPT-4 uses pre-analyzed themes, sentiment, keywords.
        Returns Threads informed by both local analysis + user content.
        """
        logger.info(f"Synthesizing {len(artifacts)} artifacts with NLP context")
        
        # Enrich all artifacts with NLP insights
        enriched_artifacts: List[Dict[str, Any]] = []
        for artifact in artifacts:
            enriched = await self.enrich_artifact(artifact)
            enriched_artifacts.append(dict(enriched))
        
        # Pass enriched artifacts to synthesis
        threads = synthesize_artifacts(enriched_artifacts)
        
        logger.info(f"Generated {len(threads)} threads")
        return threads
    
    async def process_journal_entry(
        self,
        content: str,
        user_id: str,
        room_id: Optional[str] = None,
        journal_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Full workflow for a journal entry:
        1. Analyze content → get instant insights
        2. Store metadata
        3. Ready for synthesis context
        """
        logger.info(f"Processing journal entry for user {user_id}")
        
        # Step 1: Get instant insights
        insights = await self.analyze_content(content)
        
        # Step 2: Store journal metadata if a journal record exists
        if journal_id:
            self.store_analysis_metadata(
                artifact_id=None,
                insights=insights,
                user_id=user_id,
                journal_id=journal_id,
            )
        
        return {
            "status": "success",
            "insights": insights.to_dict(),
            "ready_for_synthesis": True,
            "message": f"Entry analyzed. Found {len(insights.themes)} theme(s) with {insights.sentiment_score:.1%} sentiment"
        }
    
    async def generate_synthesis_context(self, artifacts: List[Dict[str, Any]]) -> str:
        """
        Generate enriched context string for GPT synthesis.
        Includes NLP pre-analysis alongside raw content.
        """
        context_lines: List[str] = []
        
        for artifact in artifacts:
            artifact_id = artifact.get("id", "unknown")
            content: Any = artifact.get("unstructured_data", "")
            if isinstance(content, dict):
                content = json.dumps(content)
            else:
                content = str(content)
            
            # Get NLP insights
            insights = await self.analyze_content(content, artifact_id)
            
            # Build context block
            context = f"""
--- ARTIFACT: {artifact_id} ---
Themes: {", ".join(insights.themes)}
Sentiment: {insights.sentiment_score}
Keywords: {", ".join(insights.keywords)}
---
{content[:500]}...
"""
            context_lines.append(context)
        
        return "\n\n".join(context_lines)


# Singleton instance for use across the app
_pipeline_instance: Optional[IntelligencePipeline] = None

def get_pipeline() -> IntelligencePipeline:
    """Get or create the intelligence pipeline singleton."""
    global _pipeline_instance
    if _pipeline_instance is None:
        _pipeline_instance = IntelligencePipeline()
    return _pipeline_instance

def reset_pipeline():
    """Reset pipeline (useful for testing)."""
    global _pipeline_instance
    _pipeline_instance = None
