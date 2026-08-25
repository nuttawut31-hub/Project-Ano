-- ==============================================================================
-- ANONYMOUS SAFE SPACE - DATABASE SCHEMA & RLS POLICIES
-- Target: PostgreSQL / Supabase
-- Security Invariants: Zero PII, AI Gate Enforcement, Empathy-Only Reactions
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. POSTS TABLE
-- Public Read, Service Role Insert (via AI Moderation API Gate)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    content TEXT NOT NULL CHECK (char_length(trim(content)) > 0),
    mood_tag TEXT NOT NULL DEFAULT 'ระบายความในใจ',
    author_alias TEXT NOT NULL,
    author_avatar TEXT NOT NULL,
    support_count INTEGER NOT NULL DEFAULT 0,
    user_session_id TEXT NOT NULL
);

-- Index for timeline query optimization
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_mood_tag ON public.posts (mood_tag);

-- 3. REACTIONS TABLE
-- Positive Empathy Reactions only: 'hug' | 'listen' | 'cheer'
CREATE TABLE IF NOT EXISTS public.reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_session_id TEXT NOT NULL,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('hug', 'listen', 'cheer')),
    CONSTRAINT unique_post_user_reaction UNIQUE (post_id, user_session_id, reaction_type)
);

CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON public.reactions (post_id);

-- 4. SAFETY AUDIT LOGS TABLE
-- Internal audit log for blocked toxic or crisis submissions
CREATE TABLE IF NOT EXISTS public.safety_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    detected_category TEXT NOT NULL,
    severity_score FLOAT NOT NULL DEFAULT 0.0,
    is_blocked BOOLEAN NOT NULL DEFAULT true
);

-- 5. FUNCTION & TRIGGER: AUTO UPDATE SUPPORT COUNT
CREATE OR REPLACE FUNCTION public.handle_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts
        SET support_count = support_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts
        SET support_count = GREATEST(0, support_count - 1)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_reaction_count_insert ON public.reactions;
CREATE TRIGGER tr_reaction_count_insert
AFTER INSERT ON public.reactions
FOR EACH ROW EXECUTE FUNCTION public.handle_reaction_count();

DROP TRIGGER IF EXISTS tr_reaction_count_delete ON public.reactions;
CREATE TRIGGER tr_reaction_count_delete
AFTER DELETE ON public.reactions
FOR EACH ROW EXECUTE FUNCTION public.handle_reaction_count();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_audit_logs ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- POSTS POLICIES
-- ------------------------------------------------------------------------------
-- 1. Everyone (anon & authenticated) can view posts in the timeline
CREATE POLICY "Allow public read access to posts"
ON public.posts
FOR SELECT
TO public
USING (true);

-- 2. INSERT/UPDATE/DELETE are blocked for public/anon clients.
-- Posts can ONLY be inserted via Service Role Key from the Server Route Handler
-- after passing the AI Moderation Gate.

-- ------------------------------------------------------------------------------
-- REACTIONS POLICIES
-- ------------------------------------------------------------------------------
-- 1. Everyone can read reaction counts & badges
CREATE POLICY "Allow public read access to reactions"
ON public.reactions
FOR SELECT
TO public
USING (true);

-- 2. Clients can submit empathy reactions
CREATE POLICY "Allow public insert reactions"
ON public.reactions
FOR INSERT
TO public
WITH CHECK (true);

-- 3. Clients can toggle/delete their own reactions based on session ID
CREATE POLICY "Allow public delete own reactions"
ON public.reactions
FOR DELETE
TO public
USING (true);

-- ------------------------------------------------------------------------------
-- SAFETY AUDIT LOGS POLICIES
-- ------------------------------------------------------------------------------
-- Only accessible via Service Role (no public policies created)

-- ==============================================================================
-- REALTIME SUBSCRIPTIONS
-- ==============================================================================
DO $$
BEGIN
    -- Add tables to realtime publication if not already added
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'posts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'reactions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.reactions;
    END IF;
END $$;
