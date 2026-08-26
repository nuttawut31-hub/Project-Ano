"use client";

import {
  Heart,
  Headphones,
  Sparkles,
  MessageCircle,
  CloudRain,
  Flame,
  HeartCrack,
  BookOpen,
  Moon,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Post, ReactionType } from "@/types/database.types";

// Helper mapping for Mood Tag icons
const MOOD_ICON_MAP: Record<string, LucideIcon> = {
  "ระบายความในใจ": MessageCircle,
  "เหนื่อยล้า": CloudRain,
  "ต้องการกำลังใจ": Flame,
  "เรื่องความสัมพันธ์": HeartCrack,
  "เรื่องเรียน/งาน": BookOpen,
  "เหงาจัง": Moon,
};

// Helper for formatting relative time (e.g., '2m', '1h', '3d')
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "เมื่อสักครู่";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  return date.toLocaleDateString("th-TH", {
    month: "short",
    day: "numeric",
  });
}

interface PostCardProps {
  post: Post;
  userReactions?: ReactionType[];
  onToggleReaction?: (postId: string, type: ReactionType) => void;
}

export default function PostCard({
  post,
  userReactions = [],
  onToggleReaction,
}: PostCardProps) {
  const MoodIcon = MOOD_ICON_MAP[post.mood_tag] || MessageCircle;

  const hasHug = userReactions.includes("hug");
  const hasListen = userReactions.includes("listen");
  const hasCheer = userReactions.includes("cheer");

  return (
    <article className="border-b border-zinc-200 p-4 transition-colors hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:bg-zinc-900/30">
      {/* Header: Avatar, Alias, Dot, Time, Mood Tag */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Avatar Icon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            <span className="text-base font-medium select-none">
              {post.author_avatar || <User className="h-4 w-4" />}
            </span>
          </div>

          {/* Alias & Timestamp */}
          <div className="flex items-center gap-1.5 min-w-0 text-[14px]">
            <span className="font-semibold text-zinc-900 truncate dark:text-zinc-100">
              {post.author_alias}
            </span>
            <span className="text-zinc-400 dark:text-zinc-600">·</span>
            <time
              dateTime={post.created_at}
              className="shrink-0 text-xs text-zinc-400 dark:text-zinc-500"
            >
              {formatRelativeTime(post.created_at)}
            </time>
          </div>
        </div>

        {/* Mood Tag Pill with Icon */}
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-400">
          <MoodIcon className="h-3 w-3" />
          <span>{post.mood_tag}</span>
        </div>
      </div>

      {/* Content Body */}
      <p className="mt-2.5 text-[15px] leading-relaxed text-zinc-800 whitespace-pre-wrap break-words dark:text-zinc-200">
        {post.content}
      </p>

      {/* Empathy Action Bar (Positive Only, No Dislike) */}
      <div className="mt-3.5 flex items-center gap-2">
        {/* 1. กอดนะ (Hug) */}
        <button
          onClick={() => onToggleReaction?.(post.id, "hug")}
          className={`group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            hasHug
              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          }`}
          title="กอดนะ"
        >
          <Heart
            className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${
              hasHug ? "fill-current text-rose-500" : ""
            }`}
          />
          <span>กอดนะ</span>
        </button>

        {/* 2. รับฟังอยู่ (Listen) */}
        <button
          onClick={() => onToggleReaction?.(post.id, "listen")}
          className={`group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            hasListen
              ? "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          }`}
          title="รับฟังอยู่"
        >
          <Headphones
            className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${
              hasListen ? "text-sky-500" : ""
            }`}
          />
          <span>รับฟังอยู่</span>
        </button>

        {/* 3. เป็นกำลังใจให้ (Cheer) */}
        <button
          onClick={() => onToggleReaction?.(post.id, "cheer")}
          className={`group flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            hasCheer
              ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
              : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          }`}
          title="เป็นกำลังใจให้"
        >
          <Sparkles
            className={`h-3.5 w-3.5 transition-transform group-hover:scale-110 ${
              hasCheer ? "fill-current text-amber-500" : ""
            }`}
          />
          <span>เป็นกำลังใจให้</span>
        </button>

        {/* Support Count Summary */}
        {post.support_count > 0 && (
          <span className="ml-auto text-[11px] tabular-nums text-zinc-400 dark:text-zinc-600">
            {post.support_count} กำลังใจ
          </span>
        )}
      </div>
    </article>
  );
}
