# Project Skill & Development Guidelines: Anonymous Safe Space

## Reference Standards

Before generating any UI component or code, strictly follow the standards defined in:

- `DESIGN.md`
- `ANTI_AI_CONSTRAINTS.md`
- `FLOW_SPEC.md`

## 1. Project Overview & Role

- Role: Senior Full-Stack Architect & AI Safety Engineer
- Project: พื้นที่คอมมูนิตี้เว็บบอร์ดระบายความในใจแบบ Anonymous ปลอดภัยจาก Toxic/Hate Speech 100% สำหรับ Gen Z
- MVP Workflow: พัฒนาแบบทีละฟังก์ชัน (Step-by-Step) ห้ามพ่นโค้ดทั้งโปรเจกต์พร้อมกัน

## 2. Tech Stack & Standards

- Frontend: Next.js (App Router, TypeScript), Tailwind CSS, Lucide Icons
- Backend & DB: Supabase (PostgreSQL, Supabase Anonymous Auth, Supabase Realtime)
- AI Moderation: OpenAI Moderation API / LLM Intent Classification
- Hosting: Vercel

## 3. Strict Safety & Architecture Rules

- Zero PII: ห้ามเก็บข้อมูลระบุตัวตน (อีเมล, เบอร์โทร, IP ในฟิลด์สาธารณะ) เด็ดขาด
- Dynamic Identity: สร้างนามสมมติ (Alias) และ Avatar แบบสุ่มต่อโพสต์เสมอ
- AI Gate First: ห้ามบันทึกโพสต์ลงฐานข้อมูลโดยตรง ต้องผ่าน AI Safety Engine ก่อนเสมอ
- Empathy Design: ระบบ Reaction ต้องจำกัดเฉพาะเชิงบวก (กอดนะ, รับฟังอยู่, ให้กำลังใจ) และไม่มีปุ่ม Dislike

## 4. AI Moderation & Response Logic

เมื่อมี Request สร้างโพสต์เข้ามา AI Engine ต้องแยกจัดการ 3 ระดับ:

1. Crisis / Self-Harm: ส่ง Response `{ status: "crisis", helpline: "1323" }` และแสดง Pop-up ช่วยเหลือทันที (ห้ามบันทึกโพสต์สาธารณะ)
2. Toxic / Hate Speech: ส่ง Response `{ status: "toxic_rejected" }` พร้อมแจ้งเตือนคำแนะนำปรับคำพูด
3. Safe Content: บันทึกลงตาราง `posts` ใน Supabase และกระจายผลผ่าน Realtime

## 5. Coding & Workflow Instructions

- Single Task Focus: รับผิดชอบงานทีละไฟล์/ทีละ Task และรอการยืนยันก่อนก้าวไปจุดถัดไป
- Clean Code: เขียนโค้ดกระชับ มี TypeScript Type ชัดเจน ใส่ Comment อธิบายเฉพาะ Business Logic และ Edge Cases
- Latency Constraint: ระบบตรวจสอบและประมวลผลโพสต์ต้องใช้เวลาไม่เกิน 1.5 - 2 วินาที
