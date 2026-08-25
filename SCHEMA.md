# Database Schema & RLS Policies (Supabase)

## Tables

- `posts`: id (uuid, PK), created_at (timestamptz), content (text), mood_tag (text), author_alias (text), author_avatar (text), support_count (int), user_session_id (text)
- `reactions`: id (uuid, PK), created_at (timestamptz), post_id (uuid, FK -> posts.id), user_session_id (text), reaction_type (text: 'hug' | 'listen' | 'cheer')
- `safety_audit_logs`: id (uuid, PK), created_at (timestamptz), detected_category (text), severity_score (float), is_blocked (boolean)

## RLS Rules

- `posts`: Read = Public (anon/auth), Insert = Service Role only, Update/Delete = Disabled
- `reactions`: Unique constraint on `(post_id, user_session_id, reaction_type)`
