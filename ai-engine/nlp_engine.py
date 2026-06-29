import logging
from abc import ABC, abstractmethod
from typing import Optional, Dict, List, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
import os
import json
import hashlib
from functools import lru_cache

logger = logging.getLogger(__name__)

@dataclass
class CacheEntry:
    """Cache entry with TTL."""
    result: 'InsightResult'
    timestamp: datetime
    ttl_minutes: int = 60
    
    def is_expired(self) -> bool:
        return datetime.now() - self.timestamp > timedelta(minutes=self.ttl_minutes)

class InsightResult:
    """Unified insight structure for all analysis."""
    def __init__(self, themes: list, sentiment_score: float, keywords: list, 
                 raw_text: str = "", confidence: float = 1.0, analysis_method: str = "unknown"):
        self.themes = themes  # Main topics/themes
        self.sentiment_score = sentiment_score  # Emotional tone (-1.0 to 1.0)
        self.keywords = keywords  # Key terms
        self.raw_text = raw_text
        self.confidence = confidence  # 0.0 to 1.0 - how confident in analysis
        self.analysis_method = analysis_method  # Which engine analyzed this
        self.timestamp = datetime.now()

    def to_dict(self):
        """Convert to dictionary for API responses."""
        return {
            "themes": self.themes,
            "sentiment_score": self.sentiment_score,
            "keywords": self.keywords,
            "confidence": round(self.confidence, 2),
            "method": self.analysis_method,
            "timestamp": self.timestamp.isoformat()
        }

class NLPEngine(ABC):
    """Abstract base for NLP implementations."""
    @abstractmethod
    async def analyze(self, raw_text: str) -> InsightResult:
        pass

class ProductionLocalNLPEngine(NLPEngine):
    """
    Production-grade local NLP with:
    - Multiple vectorization strategies (TF-IDF + Count)
    - Dynamic theme generation
    - Semantic keyword extraction
    - Confidence scoring
    - Caching with TTL
    - Error recovery
    """
    
    def __init__(self):
        self.nlp = None
        self.count_vectorizer = None
        self.tfidf_vectorizer = None
        self.cache: Dict[str, CacheEntry] = {}
        self.max_cache_size = 1000
        logger.info("ProductionLocalNLPEngine initialized")

    def _initialize(self):
        """Lazy-load NLP models only when needed."""
        if self.nlp is None:
            try:
                import spacy
                self.nlp = spacy.load("en_core_web_sm")
                logger.info("Loaded spaCy model en_core_web_sm")
            except OSError:
                logger.warning("spaCy model not found. Using sklearn-only analysis.")
                self.nlp = None
        
        if self.count_vectorizer is None:
            self.count_vectorizer = CountVectorizer(
                stop_words='english',
                max_features=10,
                ngram_range=(1, 2),
                min_df=1,
                lowercase=True
            )
        
        if self.tfidf_vectorizer is None:
            self.tfidf_vectorizer = TfidfVectorizer(
                stop_words='english',
                max_features=10,
                ngram_range=(1, 2),
                min_df=1,
                lowercase=True
            )

    def _get_cache_key(self, text: str) -> str:
        """Generate cache key from text hash."""
        return hashlib.md5(text.encode()).hexdigest()

    def _get_cached(self, cache_key: str) -> Optional[InsightResult]:
        """Get cached result if exists and not expired."""
        if cache_key in self.cache:
            entry = self.cache[cache_key]
            if not entry.is_expired():
                logger.debug(f"Cache hit for {cache_key}")
                return entry.result
            else:
                del self.cache[cache_key]
        return None

    def _set_cached(self, cache_key: str, result: InsightResult):
        """Cache result with TTL."""
        if len(self.cache) >= self.max_cache_size:
            # Remove oldest entry
            oldest_key = min(self.cache.keys(), 
                           key=lambda k: self.cache[k].timestamp)
            del self.cache[oldest_key]
        
        self.cache[cache_key] = CacheEntry(result)
        logger.debug(f"Cached analysis for {cache_key}")

    def _extract_themes_tfidf(self, text: str) -> Tuple[List[str], float]:
        """Extract themes using TF-IDF (better for importance)."""
        try:
            X = self.tfidf_vectorizer.fit_transform([text])
            terms = self.tfidf_vectorizer.get_feature_names_out()
            scores = X.toarray()[0]
            
            if len(scores) == 0:
                return ["reflection"], 0.3
            
            top_indices = scores.argsort()[-5:][::-1]
            themes = [terms[i] for i in top_indices if scores[i] > 0.01]
            confidence = float(max(scores)) if len(scores) > 0 else 0.5
            
            return themes or ["reflection"], confidence
        except Exception as e:
            logger.warning(f"TF-IDF extraction failed: {e}")
            return ["reflection"], 0.3

    def _extract_themes_linguistic(self, text: str) -> List[str]:
        """Extract themes using linguistic analysis (spaCy)."""
        if not self.nlp:
            return []
        
        try:
            doc = self.nlp(text)
            
            # Extract noun phrases and entities as themes
            themes = set()
            
            # Named entities
            for ent in doc.ents:
                themes.add(ent.text.lower())
            
            # Noun chunks (multi-word concepts)
            for chunk in doc.noun_chunks:
                if len(chunk.text.split()) > 1:  # Multi-word phrases
                    themes.add(chunk.text.lower())
            
            return list(themes)[:5]
        except Exception as e:
            logger.warning(f"Linguistic extraction failed: {e}")
            return []

    def _calculate_sentiment_textblob(self, text: str) -> Tuple[float, float]:
        """Calculate sentiment using TextBlob."""
        try:
            from textblob import TextBlob
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity  # -1.0 to 1.0
            subjectivity = blob.sentiment.subjectivity  # 0.0 to 1.0
            
            # Use subjectivity as confidence
            return round(polarity, 2), round(0.5 + (subjectivity * 0.5), 2)
        except Exception as e:
            logger.warning(f"TextBlob sentiment failed: {e}")
            return 0.0, 0.3

    def _calculate_sentiment_lexicon(self, text: str) -> Tuple[float, float]:
        """Fallback sentiment using simple lexicon."""
        positive_words = {
            'good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'happy',
            'excited', 'proud', 'grateful', 'inspired', 'passionate', 'brilliant'
        }
        negative_words = {
            'bad', 'terrible', 'awful', 'hate', 'sad', 'angry', 'frustrated',
            'disappointed', 'confused', 'worried', 'scared', 'depressed'
        }
        
        words = text.lower().split()
        pos_count = sum(1 for w in words if w in positive_words)
        neg_count = sum(1 for w in words if w in negative_words)
        total = max(1, pos_count + neg_count)
        
        if total == 0:
            return 0.0, 0.1
        
        sentiment = (pos_count - neg_count) / total
        confidence = min(0.7, total / len(words))
        
        return round(sentiment, 2), round(confidence, 2)

    async def analyze(self, raw_text: str) -> InsightResult:
        """Analyze text with production features."""
        if not raw_text or not raw_text.strip():
            return InsightResult(
                themes=["empty"],
                sentiment_score=0.0,
                keywords=[],
                confidence=0.0,
                analysis_method="local-nlp"
            )

        self._initialize()
        
        # Check cache
        cache_key = self._get_cache_key(raw_text)
        cached = self._get_cached(cache_key)
        if cached:
            return cached

        try:
            # Multi-strategy theme extraction
            tfidf_themes, tfidf_conf = self._extract_themes_tfidf(raw_text)
            linguistic_themes = self._extract_linguistic(raw_text)
            
            # Combine strategies
            all_themes = set(tfidf_themes) | set(linguistic_themes)
            final_themes = list(all_themes)[:5] if all_themes else ["reflection"]
            
            # Multi-strategy sentiment
            try:
                sentiment, sentiment_conf = self._calculate_sentiment_textblob(raw_text)
            except:
                sentiment, sentiment_conf = self._calculate_sentiment_lexicon(raw_text)
            
            # Keywords are top themes
            keywords = final_themes[:3]
            
            # Overall confidence
            confidence = (tfidf_conf + sentiment_conf) / 2
            
            result = InsightResult(
                themes=final_themes,
                sentiment_score=sentiment,
                keywords=keywords,
                raw_text=raw_text,
                confidence=round(confidence, 2),
                analysis_method="local-nlp-production"
            )
            
            # Cache result
            self._set_cached(cache_key, result)
            
            logger.info(f"Analyzed: {len(final_themes)} themes, sentiment {sentiment}, confidence {confidence}")
            return result
            
        except Exception as e:
            logger.error(f"Local NLP analysis failed: {e}")
            return InsightResult(
                themes=["unclassified"],
                sentiment_score=0.0,
                keywords=[],
                raw_text=raw_text,
                confidence=0.0,
                analysis_method="local-nlp-fallback"
            )

class GroqEnrichedEngine(NLPEngine):
    """Uses Groq API for fast, production-grade LLM-backed analysis."""
    
    def __init__(self):
        self.local_engine = ProductionLocalNLPEngine()
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")
        self.cache: Dict[str, CacheEntry] = {}
        
        if not self.groq_api_key:
            logger.warning("GROQ_API_KEY not set, will use local NLP only")
        else:
            logger.info("GroqEnrichedEngine initialized with Groq API")

    async def analyze(self, raw_text: str) -> InsightResult:
        """
        Get local analysis, enrich with Groq if available.
        Falls back to local if Groq is unavailable.
        """
        # Always start with fast local analysis
        local_result = await self.local_engine.analyze(raw_text)
        
        if not self.groq_api_key:
            return local_result
        
        # Try to enrich with Groq for better diversity
        try:
            from langchain_groq import ChatGroq
            from langchain_core.prompts import ChatPromptTemplate
            
            groq_llm = ChatGroq(
                model="mixtral-8x7b-32768",
                temperature=0.3,
                api_key=self.groq_api_key
            )
            
            prompt = ChatPromptTemplate.from_template(
                """Analyze this text and extract 2-3 main themes and overall sentiment.
                Be concise and diverse in theme selection.
                
                Text: {text}
                
                Respond in JSON format:
                {{"themes": ["theme1", "theme2"], "sentiment": -1.0 to 1.0}}"""
            )
            
            chain = prompt | groq_llm
            response = await chain.ainvoke({"text": raw_text[:500]})  # Limit to 500 chars for speed
            
            parsed = json.loads(response.content)
            groq_themes = parsed.get("themes", local_result.themes)
            groq_sentiment = parsed.get("sentiment", local_result.sentiment_score)
            
            # Merge local + Groq for diversity
            combined_themes = list(set(local_result.themes + groq_themes))[:5]
            combined_sentiment = (local_result.sentiment_score + groq_sentiment) / 2
            
            return InsightResult(
                themes=combined_themes,
                sentiment_score=round(combined_sentiment, 2),
                keywords=combined_themes[:3],
                raw_text=raw_text,
                confidence=0.95,  # High confidence with LLM enrichment
                analysis_method="groq-enriched"
            )
            
        except Exception as e:
            logger.warning(f"Groq enrichment failed, using local only: {e}")
            return local_result

class NLPEngineFactory:
    """Factory to get appropriate NLP engine based on configuration."""
    _instance: Optional[NLPEngine] = None

    @classmethod
    def get_engine(cls) -> NLPEngine:
        """Get singleton NLP engine instance."""
        if cls._instance is None:
            engine_type = os.getenv("NLP_ENGINE_TYPE", "groq_enriched").lower()
            
            if engine_type == "groq_enriched":
                cls._instance = GroqEnrichedEngine()
            else:
                cls._instance = ProductionLocalNLPEngine()
            
            logger.info(f"Initialized NLP Engine: {type(cls._instance).__name__}")
        return cls._instance

    @classmethod
    def reset(cls):
        """Reset singleton for testing."""
        cls._instance = None
