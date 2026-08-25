# Design System & UI Philosophy (X-Inspired Safe Space)

## 1. Visual Philosophy & Anti-AI Rules

- **No Generic AI Slop:** ห้ามใช้ Gradient พื้นหลังฟุ้งๆ, ห้ามใช้ Box-shadow ลอยหนาเตอะ, ห้ามใช้ Card มนเกินไป (Max `rounded-xl` หรือ `rounded-2xl`)
- **X-Style Border-First Layout:** เน้นแบ่งสัดส่วนหน้าจอด้วยเส้น Border คมๆ บางๆ (`border-zinc-200` ใน Light mode / `border-zinc-800` ใน Dark mode) แทนการใช้ Drop Shadow
- **Information Density:** พื้นที่แสดงผลกระชับ อ่านง่าย ตัวหนังสือคมชัด ชิดขอบพอดี ไม่เว้น Padding/Margin กว้างเทอะทะแบบหน้า Landing Page

## 2. Layout Structure (Inspired by X)

- **Center Feed Constraint:** ฟีดหลักอยู่ตรงกลาง ความกว้างคงที่ (Max Width `max-w-[600px]`) ขนาบข้างด้วย Sidebar/Navigation ที่เรียบง่าย
- **Timeline-Style Post Item:**
  - ด้านบน: Avatar สุ่ม (ทรงกลม) + นามสมมติ (Bold) + จุดคั่น `·` + เวลาแบบ Relative (เช่น `2m`, `1h`) + Mood Tag เล็กๆ
  - ตรงกลาง: Typography ขนาดอ่านง่าย (`text-[15px]` หรือ `text-base` line-height สบายตา)
  - ด้านล่าง: แถบ Action Bar ชิดซ้าย พร้อมตัวเลขนับ (Reaction Empathy, Repost/Share, Bookmark) ไอคอนเรียบหรูสไตล์ Lucide/X
- **Inline Compose Box:** ช่องพิมพ์ระบายความในใจอยู่ด้านบนสุดของ Feed (เหมือน "What is happening?!") ไม่ต้องกดเปิด Modal ซับซ้อน ยกเว้นเปิดบน Mobile

## 3. Color Palette & Typography

- **Background:** High-contrast Clean Dark (`#000000` / `#09090b`) หรือ Pure Clean White (`#ffffff`)
- **Accent & Empathy Tone:** ใช้สีเรียบหรู คุมโทนสุขุม เช่น Sage Green (`#10b981`), Dusty Blue (`#0ea5e9`), Muted Lavender ไม่ฉูดฉาด
- **Typography:** ฟอนต์สไตล์ Inter / Geist Sans คม ชัด ไม่ใช้ฟอนต์แฟนซี
