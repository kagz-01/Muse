# Muse Database Architecture

This document describes the core user flow and how the main database tables connect in the Muse system.

## Overview

Muse is built on a relational schema with JSONB support for unstructured content and metadata.
The primary flow centers around `users`, `rooms`, and `content artifacts` like `items`, `threads`, `journal_entries`, and `artifacts`.

## Core Entities

- `users`: account records and profile state.
- `rooms`: workspaces owned by a user, where content is organized.
- `items`: captured artifacts, bookmarks, or imported content tied to a room.
- `threads`: structured conversations or thinking sessions inside a room.
- `journal_entries`: raw journal thoughts optionally linked to threads.
- `artifacts`: scraped or AI-generated content attached to a room.
- `artifact_nlp_metadata`: analytic metadata for artifacts and journal entries.

## Main Table Relationships

```text
users
  ├─< owns >───────────────────────── rooms
  │                                     ├─< contains >─ items
  │                                     │               ├─< annotated by >─ item_annotations
  │                                     │               ├─< reactions/comments >─ spark_reactions / spark_comments
  │                                     │               └─< belongs to >─ users
  │                                     ├─< contains >─ threads
  │                                     │               ├─< partner >─ users (partner_id)
  │                                     │               └─< links >─ journal_entries
  │                                     └─< contains >─ artifacts
  │                                                     └─< analytic metadata >─ artifact_nlp_metadata
  ├─< owns >───────────────────────── streak_events
  │                                     └─< creates >─ streak_sparks
  ├─< connects >───────────────────── entanglements
  └─< collaborates >───────────────── room_collaborators
```

## User Journey

### 1. Account and ownership

- A user signs up and is stored in `users`.
- The user creates a `room` and becomes the room owner (`rooms.user_id`).
- Additional collaborators can be added in `room_collaborators`.

### 2. Capturing content

- Within a `room`, the user can create an `item`: saved captures, link previews, or imported content.
- `item_annotations` store per-item notes or highlights.
- `spark_reactions` and `spark_comments` let other users react/comment on items.

### 3. Building threads and journal entries

- Users organize thinking using `threads` inside a room.
- A thread can optionally reference a partner user via `partner_id`.
- Journal entries are stored in `journal_entries` and may be linked to a `thread`.
- Entries can also reference items through `linked_item_ids`.

### 4. AI / artifact ingestion

- External content or scraped documents are stored in `artifacts`.
- Each artifact belongs to a `room` and carries `unstructured_data`.
- `artifact_nlp_metadata` stores themes, sentiment, keywords, and confidence for both artifacts and journal entries.

### 5. Streaks and connection graph

- Progress is tracked in `streak_events` and summarized in `streak_sparks`.
- Social link state is managed by `entanglements` and `streak_entanglements`.
- Users can upload content, keep streaks, and grow engagement inside rooms.

## Detail: Relationship Notes

- `rooms.user_id` links each room to its owner in `users`.
- `items.room_id` and `threads.room_id` connect content back to a room.
- `journal_entries.user_id` ensures each entry is owned by a user.
- `journal_entries.thread_id` connects journal entries to structured threads.
- `artifacts.room_id` ties scraped or generated content to a room.
- `artifact_nlp_metadata` optionally attaches NLP analysis to either an `artifact` or a `journal_entry`.
- `room_collaborators` enables shared room access without changing `rooms.user_id`.

## Table Purpose Summary

- `users`: authentication, profile, streak summary, and identity.
- `rooms`: workspaces for collaborative and personal knowledge.
- `items`: captured resources with provenance metadata.
- `threads`: higher-level conversations and synthesis objects.
- `journal_entries`: raw thoughts, narratives, and AI context.
- `artifacts`: ingestable unstructured content from scraping and AI.
- `artifact_nlp_metadata`: structured semantic metadata for insights.
- `streak_events` / `streak_sparks`: activity-driven gamification.
- `entanglements` / `streak_entanglements`: social connections and shared streaks.
- `spark_reactions` / `spark_comments`: engagement signals on item content.
- `room_collaborators`: shared room membership and roles.

## Architecture Blueprint

Muse is a hybrid system that separates:

- Identity and social graph (`users`, `entanglements`, `streak_entanglements`)
- Workspace and collaboration (`rooms`, `room_collaborators`)
- Content capture and experience (`items`, `threads`, `journal_entries`, `artifacts`)
- NLP intelligence and analytics (`artifact_nlp_metadata`, `artifacts.nlp_analysis`, `journal_entries.nlp_analysis`)
- Engagement and feedback (`spark_reactions`, `spark_comments`, `streak_events`, `streak_sparks`)

This design keeps the schema modular while enabling cross-table workflows for user attention, AI synthesis, and collaborative meaning-making.
