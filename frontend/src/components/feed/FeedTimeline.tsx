"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, MessageSquareDashed } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateSessionId } from "@/utils/anonymous-identity";
import PostCard from "@/components/feed/PostCard";
import type { Post, ReactionType } from "@/types/database.types";

interface FeedTimelineProps {
  activeMood: string;
}

export default function FeedTimeline({ activeMood }: FeedTimelineProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType[]>>({});

  const supabase = createClient();
  const sessionId = typeof window !== "undefined" ? getOrCreateSessionId() : "";

  // 1. Fetch posts and user reactions when activeMood changes
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const url =
          activeMood === "ทั้งหมด"
            ? "/api/posts"
            : `/api/posts?mood=${encodeURIComponent(activeMood)}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!isMounted) return;

        if (!res.ok) {
          throw new Error(data.error || "เกิดข้อผิดพลาดในการโหลดเรื่องราว");
        }

        const fetchedPosts: Post[] = data.posts || [];
        setPosts(fetchedPosts);

        // Fetch active user's existing reactions for these posts
        if (fetchedPosts.length > 0 && sessionId) {
          const postIds = fetchedPosts.map((p) => p.id);
          const { data: reactionsData } = await supabase
            .from("reactions")
            .select("post_id, reaction_type")
            .eq("user_session_id", sessionId)
            .in("post_id", postIds);

          if (reactionsData && isMounted) {
            const map: Record<string, ReactionType[]> = {};
            reactionsData.forEach((r) => {
              if (!map[r.post_id]) map[r.post_id] = [];
              map[r.post_id].push(r.reaction_type as ReactionType);
            });
            setUserReactions(map);
          }
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        console.error("Error fetching feed posts:", err);
        setError(err instanceof Error ? err.message : "ไม่สามารถเชื่อมต่อได้");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [activeMood, sessionId, supabase]);

  // 2. Supabase Realtime Subscription for Live Timeline Updates
  useEffect(() => {
    const channel = supabase
      .channel("realtime-posts-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          const incomingPost = payload.new as Post;
          if (activeMood === "ทั้งหมด" || activeMood === incomingPost.mood_tag) {
            setPosts((prev) => {
              if (prev.some((p) => p.id === incomingPost.id)) return prev;
              return [incomingPost, ...prev];
            });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts" },
        (payload) => {
          const updatedPost = payload.new as Post;
          setPosts((prev) =>
            prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeMood, supabase]);

  // 3. Handle Reaction Toggle with Optimistic UI
  const handleToggleReaction = useCallback(
    async (postId: string, type: ReactionType) => {
      const currentPostReactions = userReactions[postId] || [];
      const hasReaction = currentPostReactions.includes(type);

      // Optimistic update for immediate visual feedback
      const updatedUserReactions = hasReaction
        ? currentPostReactions.filter((r) => r !== type)
        : [...currentPostReactions, type];

      setUserReactions((prev) => ({
        ...prev,
        [postId]: updatedUserReactions,
      }));

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          const countDiff = hasReaction ? -1 : 1;
          return {
            ...p,
            support_count: Math.max(0, p.support_count + countDiff),
          };
        })
      );

      try {
        if (hasReaction) {
          // Remove reaction
          await supabase
            .from("reactions")
            .delete()
            .eq("post_id", postId)
            .eq("user_session_id", sessionId)
            .eq("reaction_type", type);
        } else {
          // Add reaction
          await supabase.from("reactions").insert({
            post_id: postId,
            user_session_id: sessionId,
            reaction_type: type,
          });
        }
      } catch (err) {
        console.error("Failed to toggle reaction:", err);
        // Rollback on failure
        setUserReactions((prev) => ({
          ...prev,
          [postId]: currentPostReactions,
        }));
      }
    },
    [userReactions, sessionId, supabase]
  );

  // 4. Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-zinc-400">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        <span className="text-xs">กำลังโหลดเรื่องราว...</span>
      </div>
    );
  }

  // 5. Error State
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-rose-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 rounded-full border border-zinc-200 px-4 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  // 6. Empty State
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600">
          <MessageSquareDashed className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          ยังไม่มีเรื่องราวในหมวดนี้
        </h3>
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 max-w-[240px]">
          เป็นคนแรกที่มาร่วมแบ่งปันความรู้สึกในพื้นที่ปลอดภัยนี้กันนะ
        </p>
      </div>
    );
  }

  // 7. Feed Timeline List
  return (
    <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          userReactions={userReactions[post.id] || []}
          onToggleReaction={handleToggleReaction}
        />
      ))}
    </div>
  );
}
