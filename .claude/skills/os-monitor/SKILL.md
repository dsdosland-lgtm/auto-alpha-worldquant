---
name: os-monitor
description: เช็คสถานะ out-of-sample (os.checks) ของ alpha ที่ submit แล้วทั้งหมด แจ้งเตือนเมื่อมี FAIL และอัปเดต pool/mechanism-map ใช้เมื่อผู้ใช้สั่ง /os-monitor หรืออยากรู้ผล OS ของ alpha ที่ส่งไปแล้ว
---

# os-monitor — ติดตามผล OS ของ alpha ที่ submit แล้ว (read-only)

**ห้ามเรียก `submit_alpha` จาก skill นี้เด็ดขาด** — monitoring + bookkeeping เท่านั้น
(review-candidates step 0 = งานเดียวกัน; ใช้ skill นี้เมื่ออยากเช็คอย่างเดียวไม่ต้องเปิดคิว submit)

## ขั้นตอน
1. `login` (ครั้งเดียว) → อ่าน `data/submitted.jsonl` (เฉพาะตัวที่ verified `dateSubmitted` แล้ว)
2. เรียก `get_alpha` **ทีละตัว เว้นช่วง ~2 วินาที** (อย่า burst — กัน 429; client มี exponential backoff แล้วแต่ถ้าเจอ 429 ติดกัน = หยุดรอ 2-3 นาทีก่อนทำต่อ ไม่ใช่ retry ถี่)
3. รายงานตาราง: alpha_id | กลไก | grade | stage | os.checks แต่ละตัว (SHARPE / SELF_CORRELATION / IS_SHARPE / OTHERS) | is.selfCorrelation
4. ตีความ + อัปเดตไฟล์:
   - **ทุก os.check ยัง PENDING = ปกติ** (OS ประเมินบนข้อมูลจริงหลัง submit — ใช้เวลาหลายสัปดาห์ ไม่ใช่บั๊ก)
   - **os check FAIL** → เตือนผู้ใช้เด่นๆ + อัปเดต 3 ไฟล์: (1) `data/submitted.jsonl` เพิ่ม field `os_status` (2) `knowledge/submitted-pool.md` mark ตัวที่ตก (3) `knowledge/mechanism-map.md` — **alpha ตก OS = niche นั้นอาจเปิดใหม่** (เปลี่ยน 🟢 → 🟠 พร้อมหมายเหตุ)
   - **จับตาพิเศษ `RRrE1VNj`** (self-corr 0.8404 — คาดว่า OS SELF_CORRELATION จะ FAIL เพราะซ้ำ total-SJ; ถ้า FAIL จริงไม่ใช่เรื่องเซอร์ไพรส์ และ**ไม่ทำให้ niche เปิดใหม่** เพราะ XgK9528a ตัวจริงยังอยู่)
   - status เปลี่ยนจาก ACTIVE (เช่น INACTIVE/DECOMMISSIONED) → บันทึก + แจ้งทันที
   - 🎯 **CONDITIONAL BENCH (เช็คก่อนแนะนำ /find-alphas):** ถ้าตัวที่ FAIL มี candidate รออยู่แล้วใน `data/near-miss.md` §CONDITIONAL — **ไม่ต้องขุดใหม่** ให้แนะนำ submit จาก bench แทน (เร็วกว่า + ทัน freeze). สถานะปัจจุบัน (รอบ 49): **`j2go6pmO` FAIL → ปลด 3 ตัว เรียงตาม IS: (1) `npWqOj3a` abnormal-capex 1.56/1.24 (2) `omYGW56l` contrarian-social+netrec 1.42/1.08 (3) `YPAEbvGW` sentiment-composite 1.28/1.09** — ⚠️ ทั้ง 3 ชนกันเองด้วย (opinion/investment overlap) เลือก submit ตัวเดียวก่อนแล้วเช็ค corr ตัวถัดไปใหม่; ถ้า j2go6pmO หลุดจาก pool ทั้งตัว (ไม่ใช่แค่ FAIL บาง check) ให้พิจารณา `j2gGnbMo` (1.68/1.43) แทน npWqOj3a. การ submit จริงยังต้องผ่าน /review-candidates เสมอ
5. สรุปท้าย: กี่ตัว healthy (ACTIVE, ไม่มี FAIL) / pending / fail — ถ้ามี FAIL: เช็ค bench ก่อน (ข้อ 4) แล้วค่อยแนะนำ /review-candidates (มีของ) หรือ /find-alphas (bench ว่าง)
