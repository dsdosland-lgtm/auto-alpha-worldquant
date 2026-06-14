---
name: tune-alpha
description: ปรับแต่ง alpha ตัวเดียวที่เกือบผ่านเกณฑ์ให้ผ่าน โดยลองหลาย setting/expression variant แล้ว simulate ใหม่ ใช้เมื่อผู้ใช้สั่ง /tune-alpha <alpha_id หรือ expression> หรืออยากปรับตัวใน near-miss
---

# tune-alpha — deep-tune ตัวเดียว

## Input
- alpha_id เดิม **หรือ** expression + settings (จากผู้ใช้ หรือจาก `data/near-miss.md`)

## ขั้นตอน
1. ถ้าได้ alpha_id → `get_alpha` + `get_checks` ดู metrics และ check ที่ FAIL + ระบุ **คอขวดจริง**
2. spawn **alpha-tuner** ส่ง expression/settings/metrics/checks ที่ FAIL + รายการ variant ที่ลองแล้ว (จาก near-miss) → ได้ ≤6 variant
3. simulate variant (ทีละ ≤3) ด้วย MCP `simulate`
4. ประเมินผลแต่ละตัว (อิง `knowledge/submission-criteria.md`):
   - ผ่าน → เช็ค correlation → `data/submit-queue.jsonl` + **อัปเดต `data/passed-alphas.md`**
   - ดีขึ้นแต่ยังไม่ผ่าน → วน tuner อีก โดย**สลับกลยุทธ์**: รอบถัดไปถ้ารอบนี้เป็น settings sweep ให้ลอง expression micro-mutation (และกลับกัน) — วนได้ถึง ~3 รอบตราบที่ยังขยับเข้าใกล้ limit
   - ไม่ขยับเลย → อัปเดต `data/near-miss.md` (เพิ่ม variant ที่ลอง กันลองซ้ำ) + ถ้าได้บทเรียน: entry เต็มลง `knowledge/lessons-archive.md` + one-liner ในหมวดที่ถูกต้องของ `knowledge/lessons-learned.md` (ขัดเก่า=แก้เก่า)
   - ⚠️ **fitness นิ่ง ±0.02 เกิน 3 variants = structural ceiling → หยุดวน** อย่าดันต่อ (setting sweep ไม่เคย break ceiling ใน 23 รอบ)
5. รายงานผู้ใช้: variant ไหนดีสุด, ผ่านหรือยัง, ค่าที่ได้

## ข้อจำกัด
- ห้าม submit เอง (เข้าคิวเท่านั้น)
- simulate พร้อมกัน ≤3
- บันทึกทุก variant ที่ลองลง near-miss เพื่อไม่ทำซ้ำข้ามรอบ
