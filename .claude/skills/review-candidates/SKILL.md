---
name: review-candidates
description: แสดง alpha ที่เข้าคิวรอ submit และตัว near-miss เช็ค correlation ครั้งสุดท้าย แล้วให้ผู้ใช้เลือกอนุมัติก่อน submit จริง ใช้เมื่อผู้ใช้สั่ง /review-candidates หรืออยากดู/ส่ง alpha ที่หาได้
---

# review-candidates — human-in-the-loop ก่อน submit

**นี่คือทางเดียวที่ alpha จะถูก submit จริง** sub-agent/skill/cron อื่นห้าม submit เอง

## ขั้นตอน
0. **OS MONITORING (เปิดรอบทุกครั้ง):** เรียก `get_alpha` กับทุกตัวใน `data/submitted.jsonl` → รายงาน `stage` + `os.checks` (SHARPE/SELF_CORRELATION/OTHERS ยัง PENDING หรือ PASS/FAIL แล้ว)
   - ถ้ามี os check **FAIL** → เตือนผู้ใช้เด่นๆ + อัปเดตสถานะใน `knowledge/submitted-pool.md` และ `data/submitted.jsonl` (alpha ที่ OS fail = กลไกนั้นอาจหลุดจาก pool → niche เปิดใหม่ ให้จดลง mechanism-map)
1. อ่าน `data/submit-queue.jsonl` (ตัวรอ submit — ต้องมีเฉพาะ `status:"queued"`/`"needs-corr-check"`; ตัว redundant ห้ามอยู่ในคิว) และสรุป `data/near-miss.md` (ตัวก้ำกึ่ง)
2. สำหรับแต่ละตัวในคิว — เรียก MCP `get_checks` + `get_self_correlation` + `get_prod_correlation` **ใหม่อีกครั้ง** (ค่าอาจเปลี่ยน/เพิ่งคำนวณเสร็จ) เพื่อยืนยันยังผ่าน
   - ⚠️ **ถ้า self-corr ยัง `empty`/`pending` (ยังไม่คำนวณ) = ยังเชื่อไม่ได้ ไม่ใช่ "ผ่าน"** — เคส GroeQEpO เคย empty ตอน sim แล้วมาเป็น 0.805 ตอน review. ควร**รอแล้วเรียกซ้ำ** หรือเตือนผู้ใช้ชัดว่ายังไม่ยืนยัน orthogonality โดยเฉพาะตัวที่ใช้ base ร่วมกับ submitted (ts_zscore(close,5), close/open).
   - 🔑 **ค่า corr ทางการอยู่ใน `get_alpha.is.selfCorrelation` / `is.prodCorrelation`** — endpoint `get_self_correlation` flaky (คืน empty สลับ), `get_prod_correlation` มัก 403. **client ใหม่ fall back ไป get_alpha ให้แล้ว** แต่ถ้า MCP ยังไม่ restart ให้เรียก `get_alpha` เองดู `is.selfCorrelation` เป็นค่าจริง
   - 🔑 **ถ้า self-corr ค้าง PENDING ไม่ยอม finalize: submit attempt = corr probe** (หลังผู้ใช้อนุมัติใน step 4 แล้วเท่านั้น) — การเรียก `submit_alpha` คือสิ่งเดียวที่ trigger BRAIN ให้ compute self-corr จริง; corr เกิน limit → client คืน `submitted:false + selfCorrelation + blockedBy` (อ่านค่า corr ฟรี ไม่ถูก submit)
   - ⚠️ **PROBE PROTOCOL (กัน leak — บทเรียน RRrE1VNj corr 0.84 หลุดเข้า OS รอบ 25):**
     1. probe **ทีละตัว** เรียงจาก corr-risk ต่ำสุดก่อน — probe เฉพาะตัวที่วิเคราะห์เชิงโครงสร้างแล้วเชื่อว่า corr <0.70; ตัวที่คาดว่าเกิน (base/family ซ้ำ pool) ให้ตัดทิ้งเลย ไม่ต้อง probe
     2. client (fix รอบ 27) มี **corr-guard 2 ชั้น**: pre-POST guard (corr บน record เกิน limit = ไม่ POST เลย) + ไม่ blind re-POST ตอน PENDING (รอค่า corr finalize แล้วตัดสินจากค่าจริงก่อน re-POST)
     3. ถ้าได้ `submitted:false + note "corr ยัง PENDING"` → **รอ 1-2 นาที** แล้วเรียก submit_alpha ซ้ำ (pre-guard จะอ่านค่าจาก record ให้) — ห้าม spam ติดๆ กัน
     4. **ห้ามใช้ `force:true`** เว้นแต่ผู้ใช้สั่งชัดเจน (ข้าม corr-guard ทั้งหมด)
3. แสดงตารางสรุปให้ผู้ใช้: alpha_id, expression, sharpe, fitness, turnover, self_corr, prod_corr, ผ่านครบไหม
4. **ถามผู้ใช้ว่าจะอนุมัติ submit ตัวไหน** (ใช้ AskUserQuestion ถ้าหลายตัว) — ไม่อนุมัติ = ไม่ submit
5. เฉพาะตัวที่อนุมัติ → เรียก MCP `submit_alpha`
6. **ยืนยัน submit สำเร็จจริง (สำคัญสุด — อย่าเชื่อ status code):**
   - 🔴 **`submit_alpha` คืน 201/200 ≠ submit สำเร็จ** — WQ submit เป็น async, 201 = แค่ ack. ต้อง **เรียก `get_alpha` ตรวจ `status:ACTIVE` + `stage:OS` + `dateSubmitted` ไม่ null** ถึงจะนับว่าสำเร็จ
   - client ใหม่ทำให้แล้ว: `submit_alpha` คืน `submitted:true/false` + `dateSubmitted` + corr จริง (poll + verify; **re-POST เฉพาะเมื่อ corr finalize แล้วยืนยันว่า ≤ limit — ไม่ blind re-POST**). **ดู `submitted:true` ไม่ใช่แค่ status 200**
   - ถ้า `submitted:false` (self-corr ยัง PENDING) = รอสักครู่เรียก `submit_alpha` ซ้ำ; ถ้า `reason:SELF_CORRELATION FAIL` = corr เกิน limit ส่งไม่ได้ (อย่า log ว่า submitted)
7. **เฉพาะเมื่อ `submitted:true` + `dateSubmitted` set** → อัปเดต state ให้ครบทั้ง 7 จุด (เคย desync มาแล้ว 2 ครั้ง — XgK9528a, O096kVaY — เพราะอัปเดตไม่ครบ; metrics.js ใช้ xfile-sync จับ):
   - a. ย้าย entry จาก `data/submit-queue.jsonl` → `data/submitted.jsonl` (ลบออกจากคิว, เพิ่ม dateSubmitted + attempts)
   - b. `knowledge/submitted-pool.md` — เพิ่มแถว ACTIVE ใหม่ + niche ที่จองเพิ่ม + อัปเดต header count/วันที่
   - c. `data/tried-registry.jsonl` — verdict ของ alpha_id นั้น `passed` → `submitted`
   - d. `data/idea-backlog.jsonl` — status ของ idea_id นั้น → `submitted`
   - e. `data/passed-alphas.md` — แถวตาราง → 🟢 SUBMITTED
   - f. `knowledge/lessons-learned.md` §0 + `knowledge/mechanism-map.md` + `knowledge/dataset-map.md` — สถานะ queued → SUBMITTED
   - g. แจ้งผลผู้ใช้. **อย่าย้าย/แก้ state ถ้ายังไม่ verified**

## กฎ
- ถ้าตัวไหน correlation เกิน limit ตอนเช็คซ้ำ → เตือนผู้ใช้ ไม่ควร submit
- ไม่อนุมัติแบบเหมา — ให้ผู้ใช้เห็นค่าจริงก่อนตัดสินทีละตัว
- submitted.jsonl คือ registry ที่ระบบใช้รู้ตอนเช็ค self-correlation รอบหน้า — **ใส่เฉพาะตัวที่ get_alpha ยืนยัน dateSubmitted แล้ว** (เคยมีปัญหา log false-submitted ทั้งโปรเจกต์เพราะเชื่อ status 201)
- ⚠️ **src/ แก้แล้วต้อง restart MCP server ก่อนมีผล** — ถ้า submit_alpha ยังคืนแค่ `{success,status}` แบบเก่า แปลว่ายังไม่ restart ให้ verify ด้วย get_alpha เองทุกครั้ง
