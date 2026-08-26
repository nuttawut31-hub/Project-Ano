"use client";

import {
  Shield,
  MessageCircle,
  CloudRain,
  Flame,
  HeartCrack,
  BookOpen,
  Moon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// All mood filter options including "ทั้งหมด" for showing all posts
const MOOD_FILTERS: Array<{ label: string; value: string; icon?: LucideIcon }> = [
  { label: "ทั้งหมด", value: "ทั้งหมด" },
  { label: "ระบายความในใจ", value: "ระบายความในใจ", icon: MessageCircle },
  { label: "เหนื่อยล้า", value: "เหนื่อยล้า", icon: CloudRain },
  { label: "ต้องการกำลังใจ", value: "ต้องการกำลังใจ", icon: Flame },
  { label: "เรื่องความสัมพันธ์", value: "เรื่องความสัมพันธ์", icon: HeartCrack },
  { label: "เรื่องเรียน/งาน", value: "เรื่องเรียน/งาน", icon: BookOpen },
  { label: "เหงาจัง", value: "เหงาจัง", icon: Moon },
];

interface AppHeaderProps {
  activeMood: string;
  onMoodChange: (mood: string) => void;
}

export default function AppHeader({ activeMood, onMoodChange }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80">
      {/* Title Bar */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Shield className="h-5 w-5 text-emerald-500" />
        <h1 className="text-[17px] font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Safe Space
        </h1>
        <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-600">
          anonymous · moderated
        </span>
      </div>

      {/* Mood Filter Pills — Horizontal Scroll */}
      <div className="scrollbar-hide flex gap-1.5 overflow-x-auto px-4 pb-2.5">
        {MOOD_FILTERS.map((filter) => {
          const isActive = activeMood === filter.value;
          const Icon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => onMoodChange(filter.value)}
              className={`flex items-center gap-1 shrink-0 rounded-full px-3 py-1 text-[13px] font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {Icon && <Icon className="h-3.5 w-3.5" />}
              {filter.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
