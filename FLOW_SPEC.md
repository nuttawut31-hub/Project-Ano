# Flow & User Experience Specification

## 1. Posting Timeline Flow

1. User โฟกัสที่ Compose Box ด้านบนของฟีด -> ขยายความสูงอัตโนมัติ
2. User เลือก Mood Tag (Pill เล็กๆ ด้านล่าง Compose Box)
3. เมื่อกดส่ง (หรือกด Shortcut):
   - Client ทำ Fast-check
   - แสดงสถานะข้อความกำลังเข้า Gate ตรวจสอบ
   - ถ้าผ่าน -> Post เสียบเข้าหัวแถวของ Timeline ทันทีแบบ Real-time
   - ถ้าติด Crisis -> แสดง Floating Alert พร้อมปุ่ม Quick-call 1323

## 2. Mobile Responsive Spec

- Bottom Navigation Bar แบบ Minimal (Home, Mood Filters, Crisis Center)
- Floating Action Button (FAB) รูปปากกา/ไอคอนบวก ที่มุมขวาล่างสำหรับเปิด Full-screen Compose บนจอมือถือ
