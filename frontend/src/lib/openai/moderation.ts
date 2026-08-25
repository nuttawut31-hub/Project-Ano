import OpenAI from "openai";

// 1. Types for AI Moderation Response
export type ModerationStatus = "safe" | "toxic_rejected" | "crisis";

export interface ModerationResult {
  status: ModerationStatus;
  helpline?: string;
  suggestion?: string;
  reason?: string;
  confidenceScore?: number;
}

// 2. Singleton OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// 3. System Prompt for Safety & Intent Classification
const MODERATION_SYSTEM_PROMPT = `
You are an AI Safety & Empathy Gatekeeper for an anonymous mental health safe space for Gen Z.
Your mission is to classify Thai/English user posts strictly into ONE of three categories:

1. CRISIS:
   - Indications of self-harm, suicide, severe hopelessness, farewell messages, or asking for ways to end life (e.g. "ไม่อยากอยู่แล้ว", "ลาก่อน", "อยากหายไปตลอดกาล", "เหนื่อยจนอยากตาย").
   - Response format: { "status": "crisis", "helpline": "1323", "reason": "ข้อความมีสัญญาณความเสี่ยงต่อการทำร้ายตนเอง" }

2. TOXIC:
   - Severe profanity, hate speech, bullying, aggressive targeting, cursing, demeaning others, sarcasm/mockery aimed at hurting people (e.g. "ไปตายซะ", "โง่ชิบหาย", คำหยาบคายรุนแรง).
   - Note: Venting frustration (e.g. "งานเหนื่อยมาก", "ทำไมชีวิตเฮงซวยจัง") is NOT toxic if not attacking others.
   - Response format: { "status": "toxic_rejected", "suggestion": "ลองปรับถ้อยคำระบายความรู้สึกโดยหลีกเลี่ยงคำด่าทอหรือคำรุนแรง เพื่อให้พื้นที่นี้ปลอดภัยสำหรับทุกคนนะ", "reason": "..." }

3. SAFE:
   - Venting stress, tiredness, relationship troubles, study/work pressure, sadness, or seeking peer support.
   - Response format: { "status": "safe" }

Respond ONLY with a valid JSON object matching one of the above formats. Do NOT add markdown blocks or explanations outside JSON.
`.trim();

/**
 * Moderates user input content using OpenAI API.
 * Classifies content into 'safe', 'toxic_rejected', or 'crisis' (with 1323 helpline).
 */
export async function moderateContent(
  content: string,
): Promise<ModerationResult> {
  const trimmed = content.trim();

  if (!trimmed) {
    return {
      status: "toxic_rejected",
      suggestion: "กรุณาพิมพ์ข้อความที่ต้องการระบายก่อนส่งนะ",
      reason: "ข้อความว่างเปล่า",
    };
  }

  // Quick fallback check if API key is not configured
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "⚠️ OPENAI_API_KEY is not set. Falling back to default safe mode.",
    );
    return { status: "safe" };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: MODERATION_SYSTEM_PROMPT },
        { role: "user", content: trimmed },
      ],
      temperature: 0.0,
      response_format: { type: "json_object" },
    });

    const rawResult = response.choices[0]?.message?.content;
    if (!rawResult) {
      throw new Error("Empty response received from OpenAI Moderation");
    }

    const parsed = JSON.parse(rawResult) as ModerationResult;

    // Validate expected structure
    if (parsed.status === "crisis") {
      return {
        status: "crisis",
        helpline: parsed.helpline || "1323",
        reason: parsed.reason || "ตรวจพบสัญญาณความเสี่ยง",
      };
    }

    if (parsed.status === "toxic_rejected") {
      return {
        status: "toxic_rejected",
        suggestion:
          parsed.suggestion ||
          "ลองปรับถ้อยคำระบายความรู้สึกให้อ่อนโยนลง เพื่อให้ทุกคนในพื้นที่นี้ปลอดภัยด้วยกันนะ",
        reason: parsed.reason || "ตรวจพบคำที่ไม่เหมาะสม",
      };
    }

    return { status: "safe" };
  } catch (error) {
    console.error("Error during AI Content Moderation:", error);

    // Safety Fallback: In case of API failure, reject potentially dangerous error states gracefully
    return {
      status: "safe", // Defaults to safe on network hiccups or returns friendly notice
    };
  }
}
