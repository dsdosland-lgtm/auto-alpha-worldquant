# Run Report — 2026-06-12 รอบ 46 (/find-alphas)

queued: 0

## สรุป
- **ไอเดียที่ประมวล: 5** (researcher: abnormal-capex / percent-accruals / CFO-vol / earnings-smoothness / accruals+OL composite)
- **ผ่านเข้าคิว: 0** — แต่ได้ **CONDITIONAL ตัวใหญ่: abnormal-capex (Titman-Wei-Xie)** IS ผ่านแรงทุก check (SUBIND 1.56/1.24 · INDUSTRY **1.68/1.43** sub 0.96) แต่ corr ติด j2go6pmO **0.715-0.743 ทุก form** — เก็บเข้า near-miss bench: `npWqOj3a` (corr ต่ำสุด 0.7199) / `j2gGnbMo` (IS แรงสุด)
- **ตก: 4** (percent-accruals 0.57 · CFO-vol −0.07 · sales-normalized capex 1.23 · capex+accruals 1.03)
- **redundant (corr): 4** (abn-capex 3 form + eIV dilution)
- **screen-reject ไม่เสีย sim: 2** (earnings-smoothness — triangulation · composite #5 — OL ติดคิว d5Qz7erx)
- **sims ใช้ไป: 8**

## Insight สำคัญ
1. **j2go6pmO = corr-attractor ฝั่ง fundamental ตัวแรก** — บล็อก 2 candidate แรงแล้ว (sentiment 0.84 รอบ 41 + abnormal-capex 0.72 รอบนี้) = **OS-watch priority #1: ถ้า fail ปลดล็อก 2 ตัวพร้อมกัน (submit npWqOj3a ก่อน — Sharpe สูงกว่า)**
2. **delta vs level ต่อ attractor:** ΔR&D (delta) corr 0.60 หนีได้ แต่ abnormal-capex (ratio-vs-3yr-avg ≈ quasi-level) corr 0.72 ไม่หนี — transform แบบ delta แท้หนี investment-attractor ได้ดีกว่า
3. **vol-of-fundamental family ปิดสนิท** — เหลือ sales-vol ที่จองแล้วตัวเดียว
4. **กฎใหม่:** ขาใน composite ที่ queued (OL/GPq/ΔRD/torpedo) ห้ามใช้ใน candidate ใหม่จนกว่ารู้ผล submit

## Next
- ✅ **`d5Qz7erx` SUBMITTED แล้ว (ตัวที่ 12, /review-candidates 2026-06-12T11:12, attempts 1, corr finalize 0.672)** — คิวว่าง
- OS-watch: j2go6pmO (ปลด 2 ตัว), RRrE1VNj (corr-leak), P01xQodW (fit ติดขอบ)
- backlog ว่าง — ทิศที่ยังเปิด: model77/177 field-class scan (provenance audit: เคยลองแค่ ~6 field จาก library ใหญ่)
