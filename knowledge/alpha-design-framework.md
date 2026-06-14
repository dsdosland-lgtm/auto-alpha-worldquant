# Alpha Design Framework — โครง 5 stage ครบวงจร 🏗️

> **find-alphas ยึดโครงนี้ทุกรอบ** (แทนการทำ ad hoc). ดัดแปลงจาก institutional workflow
> `factor diagnostic → correlation control → portfolio construction → robustness testing`
> **เพิ่ม stage 0 (return-source) ขึ้นหน้า + เลื่อน corr เป็น screen + ทำเป็น loop** ให้เข้าบริบท USA delay1
>
> หลักการเดียว: **แต่ละ stage เป็น GATE** — ไม่ผ่านให้หยุด/ถอย ไม่ใช่ดันต่อ. เป้าคือ "ไม่เสีย sim กับตัวที่ตายตั้งแต่ต้นน้ำ"

---

## Stage 0 — RETURN-SOURCE SELECTION (คอขวดแท้ของเรา — ทำก่อนเสมอ)
> เหตุผล: บน USA delay1 returns source มีจำกัด. diagnose factor ที่ returns ต่ำตั้งแต่แรก = เสียเวลา

- [ ] อ่าน `knowledge/dataset-map.md` (แกน data) **คู่กับ `knowledge/mechanism-map.md` (แกน transform)** → ถาม: **"dataset × mechanism ไหนยังว่าง?"** — dataset ขุดครบแล้ว (20 ตัว) แต่ breakthrough 2 ตัวล่าสุด (MAX, signed-jump) มาจาก **transform ใหม่บน data เดิม (pv1)** ไม่ใช่ dataset ใหม่
- [ ] ถาม: signal นี้คาดว่ามี **raw returns ≥ 0.15** ไหม? — บน USA d1 returns≥0.15 มาจาก **MAGNITUDE-of-extreme-moves เท่านั้น** (cumulative/single-day/intraday/distribution-asymmetry); sign/count/timing = flat. fundamental เดี่ยวๆ = returns ต่ำ (ใช้เป็น weight เท่านั้น)
- [ ] **GATE 0:** ถ้า signal เป็น fundamental/slow เดี่ยวๆ (momentum/value/accruals/CMA) → returns ต่ำแน่ → **ใช้เป็น conditioning weight บน magnitude signal ไม่ใช่ standalone** หรือข้าม. ถ้า signal ไม่ใช่ magnitude-based และไม่มีหลักฐานใหม่ → ข้าม

## Stage 1 — FACTOR DIAGNOSTIC (เข้าใจก่อน optimize)
> วินิจฉัย property ของ signal จาก 1 sim baseline (decay ต่ำ, SUBINDUSTRY) ก่อนทุ่ม tune

- [ ] sim baseline → ดู **Sharpe, returns, turnover, sub-universe Sharpe, drawdown**
- [ ] **เช็คทิศ:** Sharpe ติดลบแรง → ลองพลิก `-` ก่อนทิ้ง (หลาย anomaly กลับทิศบน USA: momentum=reversal, accruals=flip)
- [ ] **FEASIBILITY SCREEN** (สำคัญสุด): คำนวณ `required_returns = turnover / sharpe²`
  - returns จริง ≥ required → เดินหน้า
  - returns จริง < 85% required **และ** เป็น signal returns-ต่ำเชิงโครงสร้าง → **INFEASIBLE หยุด** อย่า tune
- [ ] **GATE 1:** Sharpe < 0.8 (ตกไกล) → ทิ้ง · Sharpe 0.8-1.25 + returns ต่ำ → near-miss · feasible → ไป Stage 2

## Stage 2 — CORRELATION SCREEN (เลื่อนขึ้นมา — binding constraint ของเรา)
> เลื่อนจากปลายทางมาเป็น screen เพราะ corr คือ gate ที่ฆ่าตัวที่ Sharpe ดีบ่อยสุด

- [ ] **เช็คเชิงโครงสร้างก่อน sim corr:** signal นี้ซ้ำกลไกใน `knowledge/submitted-pool.md` ไหม? (pool จริง = 11 ACTIVE alphas รวม MAX `QPQYqvAW` + signed-jump `XgK9528a` ของเราเอง, refresh ด้วย `list_alphas status=ACTIVE`)
  - **กลไกที่จองแล้ว (corr สูงแน่):** reversal ทุกแบบ × ทุก weight, **MAX order-statistics (kth_element returns), signed-jump (RS⁺−RS⁻)**, options IV call-put skew, leverage, earnings/operating yield, turnover anomaly — ดูตารางสถานะใน `mechanism-map.md`
  - ถ้า signal เป็น reversal-based (ts_zscore close, close/open, close-range, midpoint) + weight ใดๆ → **ซ้ำพูลแน่ → ข้าม** (corr ถูกกำหนดโดย base ไม่ใช่ weight — GP-reversal 0.90)
  - orthogonality จริง = **transform ที่จับ moment/structure ต่างจากที่จองแล้ว** (พิสูจน์: signed-jump corr กับ MAX แค่ 0.42 ทั้งที่เป็น magnitude เหมือนกัน) — ไม่ใช่เปลี่ยน weight/window ของ family เดิม
- [ ] orthogonality ที่แท้จริงมาจาก **base/mechanism คนละตระกูล** ไม่ใช่แค่เปลี่ยนตัวถ่วง · **เคล็ดลด corr: ลองตัด weight ร่วม (เช่น GP) ออก — ถ้า signal ยังผ่าน = orthogonal ขึ้น**
- [ ] **GATE 2:** ถ้าเป็น variant ของ submitted ชัดเจน → returns ต้องมาจาก cross-section คนละกลุ่มจริง ไม่งั้นข้าม (ผ่าน fitness แต่ตก corr = ไม่มี value-add)

## Stage 3 — PORTFOLIO CONSTRUCTION (เราแข็งอยู่แล้ว — tune ตรงจุด)
> แปลง signal → weights ผ่าน BRAIN settings. **lever เรียงตามคุ้มค่า:**

- [ ] **เพิ่ม Sharpe** (fitness ∝ Sharpe, required_returns ∝ 1/Sharpe²) — คุ้มสุด
- [ ] **neutralization:** SUBINDUSTRY (Sharpe สูง) ↔ INDUSTRY/SECTOR (กู้ returns) — ลองตาม signal
- [ ] **decay:** turnover knob — แต่ทำ returns/Sharpe ตกตามถ้า returns เป็นคอขวด (อย่าไล่ decay เกิน 2-3 variant)
- [ ] **double-sort ชนะ side-by-side** (Novy-Marx): conditioning weight (× quality) ดีกว่า additive sleeve (+rank)
- [ ] อย่า × weight ที่อ่อน/flat (momentum) = เพิ่ม noise; อย่า size-condition (พัง sub-universe)
- [ ] **GATE 3:** fitness นิ่ง ±0.02 ใน 3 variant = ชนเพดานโครงสร้าง → **หยุด** (overfit) ถอยไป Stage 0 หา returns source ใหม่

## Stage 4 — ROBUSTNESS TESTING
> ก่อนเข้าคิว ตรวจว่าไม่ใช่ fluke

- [ ] **sub-universe Sharpe** ผ่าน limit (ตัวคุณภาพสูงได้ 1.1-1.5) — ตัวนี้สำคัญสุด
- [ ] **parameter sensitivity:** fitness ทนต่อ decay±2 / universe / truncation ไหม (ตัวดีไม่ควรพังง่าย)
- [ ] **drawdown** สมเหตุผล (< 0.10 ดี)
- [ ] UNITS warning = OK (ไม่กระทบ fitness) แต่ ts_zscore base สะอาดกว่า ratio base
- [ ] **GATE 4:** ผ่านทุก is.check + robust → เข้า submit-queue (self_corr:"pending" → re-check ตอน review)

---

## LOOP — feedback ทุกรอบ (ทำให้ระบบฉลาดขึ้น)
- log ทุก sim → `data/tried-registry.jsonl` (กันซ้ำ)
- เจอ pattern → `knowledge/lessons-learned.md` · เจอ dataset ใหม่ → `dataset-map.md`
- near-miss → `data/near-miss.md` · ผ่าน → `submit-queue.jsonl` + `passed-alphas.md`

## สรุปจุดที่เราติดจริง (mapping — อัปเดต 2026-06-11)
- **เราแข็ง:** Stage 3 (construction) + Stage 4 (robustness) — ทำดีมาแล้ว
- **เราติด (แก้แล้ว):** Stage 0 — เคยขุดวนแกน data อย่างเดียว → สรุป "ตัน" ผิด 3 ครั้ง. **ทางที่พิสูจน์แล้ว: deep research งานวิจัย academic ที่ยังไม่ลอง → transform/mechanism ใหม่** (ได้ MAX + signed-jump submit สำเร็จทั้งคู่)
- **gate ที่ฆ่าเราบ่อย:** Stage 2 (corr) — Sharpe ดีแต่ base ซ้ำ submitted. screen ด้วย mechanism-map ก่อน sim
