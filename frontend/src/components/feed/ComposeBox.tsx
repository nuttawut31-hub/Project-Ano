"use client";

import { useState, useRef, useCallback } from "react";
import {
  Send,
  Loader2,
  MessageCircle,
  CloudRain,
  Flame,
  HeartCrack,
  BookOpen,
  Moon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  generateAnonymousIdentity,
  getOrCreateSessionId,
} from "@/utils/anonymous-identity";
import type { Post } from "@/types/database.types";

// Mood tag options with Lucide Icons for the compose selector
const MOOD_OPTIONS: Array<{ label: string; value: string; icon: LucideIcon }> = [
  { label: "ระบายความในใจ", value: "ระบายความในใจ", icon: MessageCircle },
  { label: "เหนื่อยล้า", value: "เหนื่อยล้า", icon: CloudRain },
  { label: "ต้องการกำลังใจ", value: "ต้องการกำลังใจ", icon: Flame },
  { label: "เรื่องความสัมพันธ์", value: "เรื่องความสัมพันธ์", icon: HeartCrack },
  { label: "เรื่องเรียน/งาน", value: "เรื่องเรียน/งาน", icon: BookOpen },
  { label: "เหงาจัง", value: "เหงาจัง", icon: Moon },
];

const MAX_CONTENT_LENGTH = 1000;

interface ComposeBoxProps {
  onPostCreated: (post: Post) => void;
  onCrisis: (helpline: string, reason: string) => void;
  onToxicRejected: (suggestion: string) => void;
}

export default function ComposeBox({
  onPostCreated,
  onCrisis,
  onToxicRejected,
}: ComposeBoxProps) {
  const [content, setContent] = useState("");
  const [selectedMood, setSelectedMood] = useState(MOOD_OPTIONS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height based on content
  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= MAX_CONTENT_LENGTH) {
        setContent(value);
      }

      // Reset height then set to scrollHeight for auto-expand
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      }
    },
    [],
  );

  // Submit post through AI Moderation Gate
  const handleSubmit = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Generate fresh anonymous identity per post (Zero PII)
      const identity = generateAnonymousIdentity();
      const sessionId = getOrCreateSessionId();

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmed,
          moodTag: selectedMood,
          userSessionId: sessionId,
          authorAlias: identity.alias,
          authorAvatar: identity.avatar,
        }),
      });

      const data = await res.json();

      // Handle AI Gate responses
      if (data.status === "crisis") {
        onCrisis(data.helpline || "1323", data.reason || "");
        return;
      }

      if (data.status === "toxic_rejected") {
        onToxicRejected(
          data.suggestion ||
            "ลองปรับถ้อยคำให้อ่อนโยนลง เพื่อให้พื้นที่นี้ปลอดภัยสำหรับทุกคนนะ",
        );
        return;
      }

      // Success — clear form and notify parent
      if (data.post) {
        onPostCreated(data.post);
        setContent("");
        setSelectedMood(MOOD_OPTIONS[0].value);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    } catch (error) {
      console.error("Failed to submit post:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    content,
    selectedMood,
    isSubmitting,
    onPostCreated,
    onCrisis,
    onToxicRejected,
  ]);

  // Keyboard shortcut: Ctrl/Cmd + Enter to submit
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const charCount = content.length;
  const isNearLimit = charCount > MAX_CONTENT_LENGTH * 0.9;
  const canSubmit = content.trim().length > 0 && !isSubmitting;

  return (
    <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        placeholder="วันนี้รู้สึกยังไง ระบายได้เลยนะ..."
        rows={2}
        disabled={isSubmitting}
        className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:opacity-50 dark:text-zinc-100 dark:placeholder:text-zinc-600"
      />

      {/* Bottom Controls: Mood Selector + Char Count + Submit */}
      <div className="mt-2 flex items-center justify-between gap-2">
        {/* Mood Tag Selector Pills */}
        <div className="scrollbar-hide flex gap-1 overflow-x-auto">
          {MOOD_OPTIONS.map((mood) => {
            const Icon = mood.icon;
            return (
              <button
                key={mood.value}
                onClick={() => setSelectedMood(mood.value)}
                disabled={isSubmitting}
                className={`flex items-center gap-1 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap transition-colors ${
                  selectedMood === mood.value
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="h-3 w-3" />
                <span>{mood.label}</span>
              </button>
            );
          })}
        </div>

        {/* Character Count + Submit */}
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`text-[11px] tabular-nums ${
              isNearLimit
                ? "text-amber-500"
                : "text-zinc-400 dark:text-zinc-600"
            }`}
          >
            {charCount}/{MAX_CONTENT_LENGTH}
          </span>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white transition-opacity hover:bg-emerald-600 disabled:opacity-30"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <p className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-600">
        Ctrl + Enter เพื่อส่ง
      </p>
    </div>
  );
}
