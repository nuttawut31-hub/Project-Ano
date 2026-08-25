# Anti-AI Coding & UX Constraints

## 1. Forbidden UI Patterns (สิ่งที่ไม่ต้องการให้ AI ทำ)

- ❌ **ห้ามทำ** หน้าต่าง Pop-up หรือ Dialog ก้อนใหญ่กลางจอสำหรับทุกการกระทำ (ให้ใช้ Inline State, Drawer หรือ Toast แบบมินิมอล)
- ❌ **ห้ามทำ** ปุ่ม CTA ขนาดใหญ่เกินความจำเป็นที่มีแสงเรืองแสง (Glow effect)
- ❌ **ห้ามใช้** ข้อความ UI ที่เป็นทางการเกินไปหรือฟังดูเหมือนบอท (เช่น "ยินดีต้อนรับสู่แพลตฟอร์มเยียวยา") ให้ใช้คำกระชับ สั้น ตรงไปตรงมาแบบ X
- ❌ **ห้ามทำ** Pagination หน้า 1, 2, 3 ให้ใช้ Infinite Scroll หรือปุ่ม "Show more" สไตล์ Timeline

## 2. Interaction & Performance

- **Micro-Interactions:** การกด Reaction หรือสลับแท็บต้องมี Feedback ทันที (Optimistic UI) ไม่ต้องรอ API หมุนติ้ว
- **Keyboard Friendly:** รองรับ Keyboard Shortcut พื้นฐาน เช่น กด `Cmd + Enter` / `Ctrl + Enter` เพื่อส่งข้อความได้ทันที
