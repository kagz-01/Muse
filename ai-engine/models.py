"""
Updated SQLAlchemy models to match production database schema v2.0
Includes NLP metadata support for the production-grade v2.0 engine
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Table, Numeric, ARRAY, JSON
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from uuid import uuid4

Base = declarative_base()

# --- CORE MODELS ---

class User(Base):
    __tablename__ = "users"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    google_id = Column(String(255), unique=True)
    password_hash = Column(String(255))
    username = Column(String(255), unique=True, nullable=False, index=True)
    wallet_address = Column(String(255), unique=True)
    name = Column(Text)
    bio = Column(Text)
    avatar_url = Column(Text)
    
    # Preferences & metrics
    preferences = Column(JSONB, default=lambda: {"theme": "dark", "emailNotifications": True})
    resonance_score = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    total_journal_days = Column(Integer, default=0)
    last_entry_date = Column(String(50), default="")
    streak_level = Column(String(50), default="Spark")
    freeze_count = Column(Integer, default=2)
    milestones_unlocked = Column(ARRAY(Integer), default=list)
    
    # Password reset
    reset_token_hash = Column(String(255))
    reset_token_expires_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    rooms = relationship("Room", back_populates="user", cascade="all, delete-orphan")
    items = relationship("Item", back_populates="user", cascade="all, delete-orphan")
    threads = relationship("Thread", back_populates="user", cascade="all, delete-orphan")
    journal_entries = relationship("JournalEntry", back_populates="user", cascade="all, delete-orphan")
    artifacts = relationship("Artifact", back_populates="user", cascade="all, delete-orphan")


class Room(Base):
    __tablename__ = "rooms"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    theme_color = Column(String(50), default="#ffffff")
    tags = Column(ARRAY(String), default=list)
    is_public = Column(Boolean, default=False)
    count = Column(Integer, default=0)
    semantic_tags = Column(ARRAY(String), default=list)
    custom_settings = Column(JSONB, default=dict)
    resonance_metrics = Column(JSONB, default=lambda: {"views": 0, "wovenCount": 0})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="rooms")
    items = relationship("Item", back_populates="room", cascade="all, delete-orphan")
    threads = relationship("Thread", back_populates="room", cascade="all, delete-orphan")
    artifacts = relationship("Artifact", back_populates="room", cascade="all, delete-orphan")


class Item(Base):
    __tablename__ = "items"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    room_id = Column(PG_UUID(as_uuid=True), ForeignKey("rooms.id", ondelete="CASCADE"), index=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title = Column(Text, nullable=False)
    source_url = Column(Text, default="")
    note = Column(Text)
    is_public = Column(Boolean, default=False)
    stored_content = Column(Text)
    local_media_path = Column(Text)
    data_provenance = Column(JSONB, default=lambda: {"platform": "Web", "integrityHash": ""})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    room = relationship("Room", back_populates="items")
    user = relationship("User", back_populates="items")
    annotations = relationship("ItemAnnotation", back_populates="item", cascade="all, delete-orphan")


class ItemAnnotation(Base):
    __tablename__ = "item_annotations"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    item_id = Column(PG_UUID(as_uuid=True), ForeignKey("items.id", ondelete="CASCADE"), index=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    annotation = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    item = relationship("Item", back_populates="annotations")


class Thread(Base):
    __tablename__ = "threads"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    room_id = Column(PG_UUID(as_uuid=True), ForeignKey("rooms.id", ondelete="CASCADE"), index=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    partner_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    title = Column(Text, default="Untitled Thread")
    description = Column(Text, default="")
    mood = Column(String(50), default="focus")
    format = Column(String(50))
    depth = Column(String(50))
    theme = Column(String(100))
    thesis = Column(Text)
    cover_image = Column(Text)
    is_public = Column(Boolean, default=False)
    is_favorited = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    is_vault = Column(Boolean, default=False)
    synthesis_score = Column(Integer, default=0)
    artifact_ids = Column(ARRAY(PG_UUID(as_uuid=True)), default=list)
    source_room_ids = Column(ARRAY(PG_UUID(as_uuid=True)), default=list)
    dialogue_layers = Column(JSONB, default=list)
    resonance_metrics = Column(JSONB, default=lambda: {"views": 0, "connections": 0})
    custom_styling = Column(JSONB)
    synthesis = Column(JSONB)
    ai_blueprint = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    room = relationship("Room", back_populates="threads")
    user = relationship("User", back_populates="threads")


class JournalEntry(Base):
    """
    Primary artifact for analysis.
    Now includes NLP metadata for v2.0 engine.
    """
    __tablename__ = "journal_entries"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    thread_id = Column(PG_UUID(as_uuid=True), ForeignKey("threads.id", ondelete="SET NULL"))
    raw_thought = Column(Text, nullable=False)
    mood = Column(String(50))
    tags = Column(ARRAY(String), default=list)
    linked_item_ids = Column(ARRAY(PG_UUID(as_uuid=True)), default=list)
    is_public = Column(Boolean, default=False)
    is_favorited = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    synthesized_context = Column(JSONB)
    blockchain_hash = Column(String(255))
    is_broadcasted = Column(Boolean, default=False)
    
    # NLP v2.0 Metadata (NEW)
    nlp_analysis = Column(JSONB, default=dict)  # {themes, sentiment_score, keywords, confidence, method}
    nlp_confidence = Column(Numeric(3, 2))  # 0.00-1.00
    analyzed_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="journal_entries")
    nlp_metadata = relationship("ArtifactNLPMetadata", back_populates="journal_entry", cascade="all, delete-orphan")


class Artifact(Base):
    """
    Container for any content type (links, media, text).
    Now includes NLP metadata for v2.0 engine.
    """
    __tablename__ = "artifacts"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    room_id = Column(PG_UUID(as_uuid=True), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    type = Column(String(50), nullable=False)  # link, image, text, etc.
    source_url = Column(Text)
    unstructured_data = Column(JSONB)  # Flexible storage for any data
    
    # NLP v2.0 Metadata (NEW)
    nlp_analysis = Column(JSONB, default=dict)  # {themes, sentiment_score, keywords, confidence, method}
    nlp_confidence = Column(Numeric(3, 2))  # 0.00-1.00
    analyzed_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    room = relationship("Room", back_populates="artifacts")
    user = relationship("User", back_populates="artifacts")
    nlp_metadata = relationship("ArtifactNLPMetadata", back_populates="artifact", cascade="all, delete-orphan")


class ArtifactNLPMetadata(Base):
    """
    Persistent storage of NLP analysis results.
    Enables analytics, confidence-based filtering, and cache management.
    """
    __tablename__ = "artifact_nlp_metadata"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    artifact_id = Column(PG_UUID(as_uuid=True), ForeignKey("artifacts.id", ondelete="CASCADE"), index=True)
    journal_id = Column(PG_UUID(as_uuid=True), ForeignKey("journal_entries.id", ondelete="CASCADE"), index=True)
    
    # NLP Results
    themes = Column(ARRAY(String), default=list)  # Main topics
    sentiment_score = Column(Numeric(3, 2))  # -1.00 to 1.00
    keywords = Column(ARRAY(String), default=list)  # Top 3 themes
    confidence = Column(Numeric(3, 2), nullable=False)  # 0.00-1.00
    analysis_method = Column(String(50), nullable=False)  # "local-nlp-production", "groq-enriched"
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    # Relationships
    artifact = relationship("Artifact", back_populates="nlp_metadata")
    journal_entry = relationship("JournalEntry", back_populates="nlp_metadata")


class Entanglement(Base):
    """Social connection between users (collaboration/following)."""
    __tablename__ = "entanglements"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    requester_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    addressee_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="pending")  # pending, accepted, blocked
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SparkReaction(Base):
    """Emoji reactions on items."""
    __tablename__ = "spark_reactions"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    item_id = Column(PG_UUID(as_uuid=True), ForeignKey("items.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    emoji = Column(String(10), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SparkComment(Base):
    """Comments on items."""
    __tablename__ = "spark_comments"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    item_id = Column(PG_UUID(as_uuid=True), ForeignKey("items.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class RoomCollaborator(Base):
    """Collaboration roles in rooms."""
    __tablename__ = "room_collaborators"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    room_id = Column(PG_UUID(as_uuid=True), ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), default="editor")  # owner, editor, viewer
    added_at = Column(DateTime(timezone=True), server_default=func.now())
