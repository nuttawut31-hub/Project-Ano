"use client";

import { useState, useCallback } from "react";
import { AlertCircle, PhoneCall, X, ShieldAlert, CheckCircle2 } from "lucide-react";
import AppHeader from "@/components/layout/AppHeader";
import ComposeBox from "@/components/feed/ComposeBox";
import FeedTimeline from "@/components/feed/FeedTimeline";

interface CrisisState {
  isOpen: boolean;
  helpline: string;
  reason: string;
}

interface ToxicNoticeState {
  isOpen: boolean;
  suggestion: string;
}

export default function Home() {
  const [activeMood, setActiveMood] = useState<string>("ทั้งหมด");
  const [successNotice, setSuccessNotice] = useState<boolean>(false);
  const [crisisAlert, setCrisisAlert] = useState<CrisisState>({
    isOpen: false,
    helpline: "1323",
    reason: "",
  });
  const [toxicNotice, setToxicNotice] = useState<ToxicNoticeState>({
    isOpen: false,
    suggestion: "",
  });

  // Handle post created successfully
  const handlePostCreated = useCallback(() => {
    setSuccessNotice(true);
    setToxicNotice({ isOpen: false, suggestion: "" });
    setCrisisAlert((prev) => ({ ...prev, isOpen: false }));

    // Auto-dismiss success notification
    setTimeout(() => {
      setSuccessNotice(false);
    }, 3000);
  }, []);

  // Handle crisis trigger from AI Gate
  const handleCrisis = useCallback((helpline: string, reason: string) => {
    setCrisisAlert({
      isOpen: true,
      helpline: helpline || "1323",
      reason: reason || "ตรวจพบสัญญาณความเสี่ยงต่อสภาวะอารมณ์รุนแรง",
    });
    setToxicNotice({ isOpen: false, suggestion: "" });
  }, []);

  // Handle toxic rejection trigger from AI Gate
  const handleToxicRejected = useCallback((suggestion: string) => {
    setToxicNotice({
      isOpen: true,
      suggestion,
    });
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Center Feed Constraint: Max Width 600px with X-Style Border-First Layout */}
      <div className="mx-auto min-h-screen max-w-[600px] border-x border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
        {/* Sticky Header with Mood Filter Pills */}
        <AppHeader activeMood={activeMood} onMoodChange={setActiveMood} />

        {/* Inline Feedback Banners (Minimal, Non-intrusive) */}
        {/* 1. Toxic Rejection Toast */}
        {toxicNotice.isOpen && (
          <div className="flex items-start gap-2.5 border-b border-amber-200 bg-amber-50/90 p-3 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1 text-xs leading-relaxed">
              <span className="font-semibold">ข้อความไม่ผ่านการตรวจสอบ: </span>
              {toxicNotice.suggestion}
            </div>
            <button
              onClick={() => setToxicNotice({ isOpen: false, suggestion: "" })}
              className="text-amber-700 hover:opacity-75 dark:text-amber-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 2. Success Toast */}
        {successNotice && (
          <div className="flex items-center gap-2 border-b border-emerald-200 bg-emerald-50/90 px-4 py-2.5 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>แบ่งปันเรื่องราวของคุณลงในพื้นที่ปลอดภัยแล้ว</span>
          </div>
        )}

        {/* 3. Crisis Floating Emergency Alert Box */}
        {crisisAlert.isOpen && (
          <div className="border-b border-rose-200 bg-rose-50/95 p-4 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-100">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                <h2 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                  เราเป็นห่วงคุณนะ อยู่ตรงนี้เสมอนะครับ
                </h2>
              </div>
              <button
                onClick={() => setCrisisAlert((prev) => ({ ...prev, isOpen: false }))}
                className="text-rose-500 hover:text-rose-800 dark:hover:text-rose-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-rose-800 dark:text-rose-300">
              {crisisAlert.reason || "หากคุณกำลังเผชิญช่วงเวลาที่ยากลำบาก อย่าแบกไว้คนเดียวนะ ยังมีคนที่พร้อมรับฟังและช่วยเหลือคุณตลอด 24 ชั่วโมง"}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <a
                href={`tel:${crisisAlert.helpline}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>โทรสายด่วนสุขภาพจิต {crisisAlert.helpline} (ฟรี 24 ชม.)</span>
              </a>
            </div>
          </div>
        )}

        {/* Inline Compose Box */}
        <ComposeBox
          onPostCreated={handlePostCreated}
          onCrisis={handleCrisis}
          onToxicRejected={handleToxicRejected}
        />

        {/* Live Realtime Feed Timeline */}
        <FeedTimeline activeMood={activeMood} />
      </div>
    </main>
  );
}
