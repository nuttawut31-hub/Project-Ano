/**
 * Dynamic Anonymous Identity Generator
 * Provides randomized, zero-PII pseudonyms and avatar badges for each post.
 * Protects user privacy while maintaining an empathetic, warm community tone.
 */

export interface AnonymousProfile {
  alias: string;
  avatar: string;
  color: string;
}

// 1. Warm & Gentle Thai Pseudonyms (Adjective + Noun combinations)
const ADJECTIVES = [
  "ใจดี",
  "ขี้เซา",
  "มองฟ้า",
  "ใจเย็น",
  "ผู้อ่อนโยน",
  "รักสงบ",
  "นักรับฟัง",
  "ช่างฝัน",
  "ผู้พักผ่อน",
  "ชงชาอุ่น",
  "ผู้หลงทาง",
  "ผู้เข้มแข็ง",
  "นักกอด",
  "รักสายลม",
  "ผู้เฝ้ามอง",
];

const NOUNS = [
  {
    name: "แมวส้ม",
    emoji: "🐱",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  },
  {
    name: "กระต่าย",
    emoji: "🐰",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300",
  },
  {
    name: "คุณหมี",
    emoji: "🐻",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
  },
  {
    name: "ก้อนเมฆ",
    emoji: "☁️",
    color: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  },
  {
    name: "ทานตะวัน",
    emoji: "🌻",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300",
  },
  {
    name: "นกฮูก",
    emoji: "🦉",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300",
  },
  {
    name: "เพนกวิน",
    emoji: "🐧",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
  },
  {
    name: "ต้นกล้า",
    emoji: "🌱",
    color:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  {
    name: "ดาวตก",
    emoji: "✨",
    color:
      "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300",
  },
  {
    name: "ใบไม้ร่วง",
    emoji: "🍂",
    color:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200",
  },
  {
    name: "แก้วกาแฟ",
    emoji: "☕",
    color:
      "bg-stone-100 text-stone-700 dark:bg-stone-900/60 dark:text-stone-300",
  },
  {
    name: "ปลาวาฬ",
    emoji: "🐳",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300",
  },
];

const STORAGE_KEY = "ano_safe_session_id";

/**
 * Generates a fresh random anonymous profile for a post.
 * Ensures zero correlation between consecutive posts from the same user.
 */
export function generateAnonymousIdentity(): AnonymousProfile {
  const randomNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const randomAdj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];

  return {
    alias: `${randomNoun.name}${randomAdj}`,
    avatar: randomNoun.emoji,
    color: randomNoun.color,
  };
}

/**
 * Gets or initializes a persistent anonymous session ID stored locally in the browser.
 * Used exclusively for deduplicating reactions and crisis context without PII.
 */
export function getOrCreateSessionId(): string {
  if (typeof window === "undefined") {
    return "server-session";
  }

  let sessionId = localStorage.getItem(STORAGE_KEY);

  if (!sessionId) {
    sessionId =
      "ano_" +
      Math.random().toString(36).substring(2, 15) +
      Date.now().toString(36);
    localStorage.setItem(STORAGE_KEY, sessionId);
  }

  return sessionId;
}

/**
 * Clear the current anonymous session ID from local storage.
 * Useful for triggering an explicit privacy reset for the user.
 */
export function clearSessionId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
