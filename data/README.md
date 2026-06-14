# data/ — สถานะข้ามรอบ

| ไฟล์ | เนื้อหา | เขียนโดย |
|------|--------|---------|
| `idea-backlog.jsonl` | ไอเดีย alpha ที่ค้นมา (1 JSON/บรรทัด) | alpha-researcher |
| `submit-queue.jsonl` | alpha ผ่านเกณฑ์ รออนุมัติ submit | find-alphas / tune-alpha |
| `passed-alphas.md` | 📊 dashboard อ่านง่ายของ alpha ที่ผ่าน (ตาราง + รายละเอียด) | find-alphas / tune-alpha |
| `near-miss.md` | ตัวเกือบผ่าน + variant ที่ลองแล้ว | find-alphas / tune-alpha |
| `submitted.jsonl` | alpha ที่ submit แล้ว (registry สำหรับ self-corr) | review-candidates |
| `runs/` | รายงานสรุปแต่ละรอบ | find-alphas |

> 🧠 ระบบเรียนรู้ต่อเนื่องผ่าน `knowledge/lessons-learned.md` — ทุก agent อ่านก่อนทำงาน, find-alphas เขียนบทเรียนกลับหลังจบรอบ

ไฟล์ `.jsonl` เริ่มต้นว่างได้ (สร้างเมื่อเขียนครั้งแรก) — ระบบ append ทีละบรรทัด
