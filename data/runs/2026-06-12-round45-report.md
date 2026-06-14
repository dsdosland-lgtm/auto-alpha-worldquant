# Run Report — 2026-06-12 รอบ 45 (/find-alphas)

queued: 1

## สรุป
- **ไอเดียที่ประมวล: 5** (researcher ใหม่ — literature-mining anomaly คลาสสิก ทิศที่พิสูจน์จากรอบ 44)
- **ผ่านเข้าคิว: 1** — 🎉 `d5Qz7erx` **cost-structure + earnings-quality composite** (OL Novy-Marx + GP-surprise-q Chiu-Haight + ΔR&D + 0.75×torpedo) Sharpe 1.59 / fit 1.24 / TO 0.038 / sub 0.87 / **self-corr 0.672** = niche #12 candidate
- **near-miss: 4** (OL เดี่ยว 1.16 corr 0.35 · GPq เดี่ยว 1.09 · 2-leg 1.42/0.90 · 3-leg 1.38/0.94 ceiling)
- **redundant: 2** (4-leg full-weight 0.709 เกิน 0.009 · 0.75×OL probe 0.7166)
- **ตก: 6** (CCC sub-ติดลบ · excess-cash −0.59 · OL+ΔRD · 2×OL · INDUSTRY · recency/2×GPq variants)
- **screen/implement-reject: 1** (pension-DR — ไม่มี field บน BRAIN)
- **sims ใช้ไป: 14**

## เทคนิค/กฎใหม่
1. **perturbation diagnosis สำเร็จครั้งที่ 2** — corr เกิน 0.009: ลด OL → corr ขึ้น (diluter!), ลด torpedo → ผ่าน 0.672 (+Sharpe ขึ้น). ยืนยัน: corr ของ composite = ส่วนผสมทิศ ไม่ใช่ max ของขาเดี่ยว
2. **จำกัด scope GPA-absorption:** quarterly Δ(GP/assets,63) additive ไม่โดนดูด (กฎ 4 เคสครอบเฉพาะ level/annual-Δ)
3. **recency-weight ใช้ได้เฉพาะ event drift สั้น** — GP-surprise แย่ลง (1.38→1.33)
4. **LEG-BANK เพิ่ม: OL 1.16 (corr 0.35) + GPq 1.09** — ถูกใช้ใน d5Qz7erx แล้ว (ถ้า submit = จอง)
5. ⚙️ researcher agent append backlog เองไม่ได้ (ไม่มี shell) — เขียนไฟล์ side-car แล้ว orchestrator merge (ทำงานได้ แต่ควร formalize)

## Session checks
- TIER-RECHECK: EUR get_datasets ว่าง = ยังปิด · USA get_datasets 429 (ผลรอบ 43 ยังใช้ได้: 20 ตัวเดิม) · OS ทั้ง 11 ตัว PENDING (เช็คตอน /review-candidates เช้านี้)

## Next
- **รัน `/review-candidates`** อนุมัติ submit `d5Qz7erx` ก่อน IQC freeze — corr 0.672 มี margin 0.028 (แคบกว่า YPAzrowM — ถ้า finalize ขยับเกิน 0.70 client guard จะกันเอง)
- backlog เหลือ 0 — ทิศรอบหน้า: literature-mining ต่อ (ให้ผล 2 รอบติด: NOA รอบ 44, OL+GPq รอบ 45) หรือรอ OS result
