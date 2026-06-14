---
name: auto-alpha
description: หา alpha ที่ submit ได้แบบ autonomous goal-mode — วนหา→sim→เช็ค self-corr→submit เอง (corr<0.70)→อัปเดต state จนครบ N ตัว รันยาวจนเจอ. ใช้ /auto-alpha <N> (หรือ /goal /auto-alpha <N> เพื่อ hard-block ไม่ให้หยุดก่อนครบ). default N=3
---

# auto-alpha — autonomous goal-mode alpha hunter 🎯🤖

> **ความต่างจาก `/find-alphas`:** find-alphas = หา→เข้าคิว `submit-queue.jsonl` ให้คนกดอนุมัติผ่าน `/review-candidates`.
> **auto-alpha = goal-mode superset ที่ submit เองได้** เมื่อ corr<0.70 จริง (การเรียก skill นี้ = ผู้ใช้อนุมัติ submit ล่วงหน้า).
> นี่คือ exception ที่ผู้ใช้ยืนยันชัด (2026-06) ของกฎ "ห้าม submit เอง" — **เฉพาะ skill นี้เท่านั้น**; find-alphas ยัง queue-only.
> corr-guard 2 ชั้นใน client (pre-POST + ไม่ blind re-POST) = safety net ไม่ใช่ของแทนการคิด.

## เป้าหมาย + Input
- อ่านจำนวน **N จาก args** (default **3**). optional: vein hint (เช่น "forecast-Bowley", "interpolation").
- **นับว่า "เจอ 1 ตัว" ก็ต่อเมื่อ `submit_alpha` คืน `submitted:true` + `dateSubmitted` ไม่ null + get_alpha ยืนยัน status ACTIVE/stage OS** — status 201/200 เฉยๆ ไม่นับ.
- เป้าหมาย: submit ให้ครบ N ตัว orthogonal (แต่ละตัว self-corr < 0.70 vs pool จริง).

## ข้อจำกัด (ต่างจาก find-alphas — อ่านก่อนเริ่ม)
- ✅ **auto-submit ได้** เมื่อผ่านเงื่อนไขครบ (ดู SUBMIT-GUARD). ไม่ต้องถามผู้ใช้ทีละตัว — การเรียก /auto-alpha = อนุมัติแล้ว.
- simulate พร้อมกัน **≤3** (rate limit). ค่า threshold ใช้จาก `is.checks[].limit` ที่ API คืนจริง **อย่า hardcode**.
- submit **เฉพาะตัวที่ self-corr max < 0.70 จริง** (ไม่ใช่ `empty`/`pending` — ค่าทางการอยู่ `get_alpha.is.selfCorrelation` เป็น fallback ถ้า endpoint flaky).
- **ห้าม `force:true`** บน submit_alpha เด็ดขาด (ข้าม corr-guard ทั้งหมด) — เว้นผู้ใช้สั่งชัดในข้อความนั้น.
- ทุกอย่างอื่นยึดกฎ `knowledge/lessons-learned.md` + `knowledge/alpha-design-framework.md` (5 stage + GATE) เหมือน find-alphas.

## ขั้นตอน (loop จนครบ N)

### 0. PREP (ครั้งเดียวต่อการเรียก)
- เรียก MCP `login`.
- อ่าน `knowledge/lessons-learned.md` (โดยเฉพาะ §0 สถานะ + §1 DECISION RULE + §2 toolkit ✅ + §3 dead ❌).
- อ่าน `knowledge/mechanism-map.md` (§"ปิดเคส" กันลองซ้ำ + interpolation-cluster status + price-niche ที่ saturate).
- อ่าน `knowledge/submitted-pool.md` + refresh ด้วย `list_alphas status=ACTIVE` — **นี่คือ pool จริงที่ self-corr เช็คเทียบ** (`list_alphas` default คืน UNSUBMITTED ต้องใส่ `status=ACTIVE`).
- peek `data/tried-registry.jsonl` (กัน sim ซ้ำ — grep expr/แนวคิดก่อน sim ใหม่).

### 1. PICK VEIN (เรียงตาม ROI จริง /auto-alpha 11 ตัว #35-45 — ลองบนสุดก่อน, สลับเมื่อ saturate)
> 🔑 **หลักการบน pool หนา: 1 fundamental → หลาย alpha** ผ่าน 4 ตัวคูณ — **price-niche × weight/sign × CONSTRUCTION (group_rank↔ts_rank) × window**. ความหลากหลายมาจาก transform/construction ไม่ใช่หา fundamental ใหม่อย่างเดียว

**1. 🥇 INTERPOLATION — strong attractor-locked core × price-niche** (#35, breakthrough #10):
- แหล่ง core แข็ง: `data/near-miss.md §CONDITIONAL` bench (`npWqOj3a` abnormal-capex ฯลฯ) → **interpolate × price ได้เลย ไม่ต้องรอ OS-fail** (#35: locked 0.72→0.647) · attractor list ใน lessons §0/mechanism-map
- recipe: `<w>*group_rank(<core>, sector) + rank(<price>)`, `<price>` 3 niche (ว่างสุดก่อน): `rank((vwap-close)/vwap)` VWAP · `rank(-(close-low)/(high-low))` close-range · `rank(-ts_delta(close,10))` rev10 (10 ไม่ใช่ 5 กัน e72Vl8LO)

**2. 🥈 ts_rank CONSTRUCTION-AXIS** (#41-50, breakthrough #11 — ให้ **10 ตัว!**): `2*group_rank(ts_rank(<ratio>, 252), sector) + rank(<price>)`. **ts_rank (temporal-percentile "เทียบประวัติตัวเอง") ⊥ group_rank pool 0.4-0.6** (pool เป็น group_rank ล้วน).
   - 🔑 **DIFFERENTIATION มาจาก CONSTRUCTION ไม่ใช่ window — `1 fundamental × 1 construction = 1 alpha`** (auto-alpha5: window 504 ชน 252-version 0.83; **แต่ group_rank vs ts_rank ของ fund เดียวกัน orthogonal ได้** = deferred-rev kqKv0bZg-grouprank vs ts_rank#50 = 0.52). **อย่าเสีย sim กับ window-variant ของ fund ที่ submit แล้ว**
   - 🔑 **dim ที่หลุดสะอาด = fresh STRUCTURAL/quality/equity-issuance/demand/growth** (debt-maturity-ST-share 0.59 · accrual-variance 0.63 · share-dilution 0.68 · deferred-rev 0.52 · sales-growth 0.69). ⛔ **investment/profitability/NOA = จอง #41-45 อิ่มแล้ว → ชน 0.74-0.92** (rd-cap/capacity-util/asset-growth/cash-to-debt ชน). อ่อน=turnover/leverage/cash/R&D/value/tax-burden

**3. 🥉 Δ-TRAJECTORY** (#38-40 — ให้ 3 ตัว): `group_rank(ts_delta(<ratio>, 252)/(ts_delay(<ratio>,252)+1), sector) + rank(<price>)` **price-heavy 0.75-1:1**. fundamental ที่ **LEVEL จอง/ตาย → YoY-delta หนี level-attractor หลุด** (labor-prod LEVEL sub0.05 ตาย แต่ Δ หลุด 0.66). ⛔ **close-range Δ-improvement cluster อิ่มที่ ~3** (altman-health/emp-prod/ΔDPO ครอบ "improving-company × reversal" → Δ-margin/gross/cash/goodwill ใหม่ชน 0.77-0.91)

**4. forecast-Bowley + model-factor (ส่วนใหญ่จอง/อ่อน — gauge standalone ก่อน, อ่อน=pivot):** forecast-Bowley `(high+low−2median)/(high−low)` (anl4 advanced_af_nd): STRONG=sales/EPS/EBIT/epsr + BVPS/fcfps = **booked หมด**; quantity เหลือ (totassets/capex/sga) อ่อน fit 0.75 (price ขี่) · model77/177 ใช้แค่ booked (UAP/GARP/capacq); ตัวอื่น direct rank อ่อน (hgm 0.99/growdura 0.18)

**5. axis ใหม่:** OS-fail reopened niche (ดู near-miss §CONDITIONAL bench). ⛔ tier/delay0/TOP500 = ปิด (DON'T-BOTHER ข้างล่าง)

⚙️🔑 **WEIGHT-SWEEP DIRECTION (2 กฎ — ดู corr-records หา binding-constraint ก่อนเสมอ):**
- **(corr-dodge)** core orthogonal-moderate (BVPS/forecast-shape) → **fund-heavy 2-3:1**; core ที่ **load attractor เอง** (investment/diversification) → **price-heavy ลง 1:1** (fund ยิ่งมากยิ่งชน attractor; price เจือ lock). run #1: 3:1=0.745→1:1=0.647
- **(sub-rescue — auto-alpha10)** core ที่ **sub-universe อ่อน standalone** (delta-core/small-cap ICA/ratio กระจุก large-cap: ACI sub0.06, altman 0.04, employee-Δ) → **price-heavy 0.75-1:1 ให้ price leg กู้ sub** (ACI 0.06→1.07, altman→1.33). เกณฑ์: standalone sub < 0.43×Sharpe = ต้อง price-heavy
- **(niche-switch — auto-alpha5)** corr เฉียด 0.70-0.74 → **ดูว่า binding-constraint เป็นใคร:** ถ้าเป็น **PRICE-cluster member** (alpha ที่ใช้ price-niche เดียวกัน = rev10/close-range) → **ย้าย price-niche แล้วหลุด** (sales-growth rev10 0.74→close-range 0.69 · accrual rev10 0.74→VWAP 0.63 · share-dilution rev10 0.70→close-range 0.68). ถ้าเป็น **same-DIMENSION fundamental** (cash-to-debt ชน NOA 0.88, rd-cap ชน abnormal-capex 0.74) → **dim จองแล้ว, pivot dim ใหม่** (ย้าย niche ไม่ช่วย)
- INDUSTRY neut ช่วย sub · reversal รวม-additive (Sharpe 2+); magnitude (signed-jump/MAX) รวมอ่อน เลี่ยง

> **ทุก niche ต้อง ⊥ ของจองทั้งหมด** (รวมทุกขา composite). 🔑 **track "DIMENSION ที่จอง" ไม่ใช่แค่ niche:**
> - ⛔ **dim จองอิ่มแล้ว (strong core ใหม่ที่ load = ชน 0.7-0.92 ทุก niche/construction):** investment · Δ-improvement · profitability · earnings-yield · NOA · opinion · intangible · working-cap(DSO/inventory/ATO) · forecast-shape · value
> - ✅ **dim ที่ยังหลุด (auto-alpha5 พิสูจน์ 0.52-0.69):** STRUCTURAL(debt-maturity/lease-type) · earnings-QUALITY(accrual-variance) · equity-issuance(share-dilution) · DEMAND(deferred-rev ผ่าน ts_rank) · growth(sales-growth). **heuristic: fresh = non-investment-non-profitability**
> - 🔑 **CONSTRUCTION differentiate:** group_rank vs ts_rank ของ fund เดียวกัน orthogonal ได้ (deferred-rev kqKv0bZg vs #50 = 0.52) แต่ window ต่างใน construction เดียวกัน ไม่หลุด (debt-maturity 504 ชน 252 = 0.83)

⛔ **DON'T-BOTHER (พิสูจน์ปิดแล้ว /auto-alpha10 ~40 sims — อย่าเสีย sim ซ้ำ):**
- **tier** EUR/CHN/GLB/ASI/JPN/KOR = "not available" (บัญชี USA-only)
- **delay 0** = bar สูง (Sharpe≥2/fit≥1.3) + field จำกัด (fnd6-quarterly dltt/cheq, fnd7, sentiment1 ไม่มี) + core แข็งที่เหลือ (abnormal-capex) ชน investment-cluster delay1 0.75-0.85
- **TOP500-native** = fundamental ไม่มี power large-cap (single+3-leg composite 0.56-0.68); goal5 ใช้ geographic/options เฉพาะ large-cap ที่จองแล้ว
- **vector_neut** = residual ยัง load broad factor (Δgoodwill⊥capex ยัง 0.78-0.85 ชน j2go6pmO/diversification หลายตัว)
- **options(opt6)/seasonality(Heston-Sadka)/overnight-gap/intraday-momentum** = อ่อน <1.3 Sharpe
- **weak core (Sharpe<1.3 standalone) × price** = price ขี่ → กลายเป็น price-cluster alpha → ชน (pension/innovative/net-debt/labor-level)

### 2. GENERATE candidates
- เลือก core เองจาก vein 1-3 (bench/attractor + ts_rank + Δ-trajectory) ก่อน — เร็วสุด.
- **known cores หมด → spawn `alpha-researcher` `run_in_background:true`** (web-literature mining) แล้ว **ทดสอบ vein อื่น/construction-axis ระหว่างรอ (อย่า idle)**. ~2 wins ต่อ 10-12 cores; **รันหลาย batch ได้** (auto-alpha10: 3 batch → intangible Peters-Taylor / altman-health / employee-Δ / ΔDPO).
  - prompt researcher แนบ: (1) **dimension ที่จองทั้งหมด** (รวมทุกขา composite) (2) family/dim ปิดล่าสุดจาก lessons §0 + DON'T-BOTHER (3) **เน้นขอ: fundamental ในมิติ STRUCTURAL / earnings-quality / equity-issuance / demand / governance / supply-chain — ที่ NOT investment/profitability/growth** (auto-alpha5: 4 wins จากแนวนี้ = debt-maturity/accrual-quality/share-dilution/deferred-rev; ⛔ investment/profitability dim จองอิ่มแล้ว ชน) (4) INTERPOLATION-CORE rule (attractor-locked 0.7-0.8 ใช้ได้)
  - SIDE-CAR: researcher **Write ไฟล์เดียว `data/<batch>-cores.jsonl`** (`{core,field,expr,dim,verified}` บรรทัดละ core) — orchestrator อ่านเอง + เลือก verified:true ที่ field พร้อม sim ก่อน
- spawn **alpha-translator** เฉพาะ expression ซับซ้อน/field แปลก; fundamental ratio ปกติ construct เองเร็วกว่า (lessons §4 รอบ 49)

### 3. SIM (ทีละ ≤3)
- **เช็ค `data/tried-registry.jsonl` ก่อน** — เคย sim (expr+settings) แล้วข้าม.
- เรียก `simulate` → `get_checks` อ่านผล.
- **append `data/tried-registry.jsonl` ทุกตัวที่ sim** (verdict enum: `submitted`|`passed`|`near-miss`|`rejected`|`redundant` — รายละเอียดใส่ `note`).
- ⚙️ **ยืนยัน field มีจริงด้วย `simulate` เลย (ถูกสุด)** — `get_data_fields search=` จับ "description" ไม่ใช่ field-id substring (enumerate triple ไม่ได้); field ที่ไม่มี = simulate error ทันที (run #1: ffo/dps error เร็ว ไม่เสียเวลา).
- ⚙️ **gauge core strength ก่อน sweep ×price:** ถ้าเพิ่ม weight fundamental แล้ว Sharpe **ตก** (price leg แบก Sharpe คนเดียว) = core อ่อน → **pivot อย่า sweep ต่อ** (run #1: totassets/capex fit ตัน 0.75 = เสีย 4 sims; ทดสอบ standalone/low-weight 1 ตัวก่อนคุ้มกว่า).
- **SIM WATCHDOG:** `check_simulation` progress ค่าเดิม >5 นาที (~3 polls) = hang ถาวร → **ทิ้งเลย** (kth_element บน derived expr มัก hang → ใช้ power-norm `ts_sum(power(max(x,0),2or4),d)` แทน).
- transient (504/5xx/timeout/400 proxy) → retry 1-2 ครั้ง; sim ที่ timeout ฝั่ง client **ยังรันต่อฝั่ง BRAIN** → ตามด้วย check_simulation/list_alphas อย่า sim ซ้ำ.

### 4. EVALUATE
- **PASS IS ครบ** (fitness≥1.0, Sharpe≥1.25, sub-universe≈0.43×Sharpe, LOW_TURNOVER, CONCENTRATED_WEIGHT) → เรียก `get_self_correlation` (+ `get_alpha.is.selfCorrelation` fallback ถ้า endpoint คืน empty).
  - ⚙️🔑 **get_self_correlation = อ่านฟรี (read-only) → เรียกบน variant ที่ผ่าน IS ได้ทุกตัว** เพื่อ map corr-vs-weight curve + ดู binding-constraint (corr records บอกว่าชน alpha ตัวไหน) **แล้วค่อยเลือก 1 ตัวไป submit** (ต่างจาก submit_alpha ที่ probe ทีละตัว). run #1 เช็ค corr 6 variant ฟรีก่อน submit ตัวเดียว.
  - max corr **< 0.70 จริง** → **เลือก variant ที่ margin หนาสุด** (sweep weight/niche เก็บตัวต่ำสุด) — self-corr ขยับได้ตอน recompute (leak RRrE1VNj 0.84). run #1 เลือก 1:1 (0.647) แทน 1.25:1 (0.689). 📏 **margin reality บน pool อิ่ม:** มัก 0.01-0.07; **ยอม thin (0.01-0.02) ได้ถ้า (ก) เป็น dimension/construction ใหม่จริง ไม่ใช่ near-miss ของ attractor ที่รู้ (ข) เป็นตัวดีสุดที่ sweep แล้ว** (auto-alpha10 #44/#45 submit ที่ 0.018/0.011 = ผ่านสะอาด). ⛔ ตัวที่ใกล้ attractor เดิม + margin บาง = เสี่ยง leak ตัดทิ้ง.
  - corr **0.70-0.80** (attractor-locked) → **อย่าเพิ่งทิ้ง** — เพิ่ม price-weight (ถ้า fundamental คือตัวชน) / สลับ price-niche / interpolation (vein ที่ให้ 5 ตัวใน goal6 + #35).
- **เกือบผ่าน IS** → tune: รอบ 1 settings sweep (decay/neut/trunc/universe), รอบ 2 expression micro-mutation, ≤3 รอบ.
- **ตกไกล / ชน 4-dim subspace** (base ร่วม niche เดิม / moment ของ total-intraday returns) → log `rejected`/`redundant` อย่าเสีย sim เพิ่ม.

### 5. SUBMIT (auto)
- **probe ทีละตัว เรียง corr-risk ต่ำสุดก่อน** — submit เฉพาะตัวที่วิเคราะห์เชิงโครงสร้างแล้วเชื่อว่า <0.70; ตัวที่คาดว่าเกิน (base/family ซ้ำ pool) ตัดทิ้ง ไม่ probe.
- เรียก `submit_alpha` → **ยืนยัน `submitted:true` + `dateSubmitted` ไม่ null + get_alpha status ACTIVE/stage OS**.
  - `submitted:false + corr PENDING` → รอ 1-2 นาที เรียก `submit_alpha` ซ้ำ (pre-guard อ่านค่าจาก record) — **ห้าม spam ติดๆ กัน, ห้าม blind re-POST**.
  - `submitted:false + reason SELF_CORRELATION FAIL` (corr เกิน limit) = safe probe, **log `redundant` แล้วข้าม** (ได้อ่านค่า corr ฟรี ไม่ถูก submit) — อย่า log ว่า submitted.
- **ห้าม `force:true`**.

### 6. UPDATE STATE (ทุก submit สำเร็จ — ครบ 7 จุด, เคย desync มาแล้วเพราะอัปเดตไม่ครบ)
- a. append `data/submitted.jsonl` (+ alpha_id, expression, dateSubmitted, attempts, corr).
- b. `data/tried-registry.jsonl` — verdict ของ alpha_id นั้น → `submitted`.
- c. `knowledge/submitted-pool.md` — +แถว ACTIVE + niche ที่จองเพิ่ม + อัปเดต header count/วันที่.
- d. `data/passed-alphas.md` — +แถว 🟢 SUBMITTED.
- e. `knowledge/lessons-learned.md` §0 — อัปเดตสถานะ/บรรทัด family ปิดล่าสุด (+breakthrough ถ้ามี).
- f. `knowledge/mechanism-map.md` — niche/price-niche/cluster ที่จองเพิ่ม.
- g. memory (`~/.claude/.../memory/`) — เฉพาะถ้าเป็น breakthrough เชิงกลไกใหม่.
- ⚠️ append JSONL: ไฟล์ต้องจบด้วย newline ก่อน (กัน 2 JSON ติดบรรทัดเดียว). ไฟล์ไทย/quote ผสม → Write temp แล้ว `cat temp >> target`; in-place JSONL ใช้ `node -e`.
- นับ **+1 เข้า N**.

### 7. LOOP
- ยังไม่ครบ N → **กลับ step 1** (สลับ vein/quantity/price-niche ถ้าตัวล่าสุดชน — cluster saturate ~4-5/price-niche).
- **รันยาว อย่าหยุดก่อนครบ N.** จะสรุป "หมด/ตัน" ได้ **เฉพาะหลังผ่าน ANTI-PREMATURE-EXHAUSTION checklist 4 AXIS** (สรุปตันผิดมาแล้ว **11 ครั้ง** — ครั้งล่าสุด /auto-alpha10 ลืม construction-axis เสีย ~40 sims ก่อน ts_rank ปลด 5/10→10/10):
  - (a) **fundamental-dim:** interpolation กับ attractor-locked core / `mechanism-map` มี dim/quantity ว่างไหม
  - (b) **price-niche:** rev10/close-range/VWAP cluster ไหนยังไม่อิ่ม (~4-5/cluster)
  - (c) 🆕🔑 **CONSTRUCTION-axis (ลืมบ่อยสุด):** ลอง `ts_rank(<fund>, 252/504/756)` (temporal-percentile "เทียบประวัติตัวเอง") / `ts_zscore` / `ts_av_diff` แทน `group_rank` แล้วหรือยัง — **ts_rank ⊥ group_rank pool ทั้งแผง (corr 0.4-0.6) เพราะ pool เป็น group_rank ล้วน** (breakthrough #11). 1 fundamental → หลาย alpha ผ่าน window×niche×sign
  - (d) **cross-section:** tier-recheck region/delay/universe (sim จริง). หมายเหตุ: tier USA-only (ASI/JPN/KOR/EUR/CHN/GLB ปิด), delay0 field จำกัด — ดู lessons §0
  - ครบ 4 axis + ยังไม่ได้ → รายงานตรงๆ ว่าได้ M<N (อย่าแต่งว่าครบ).

### 8. FINAL (เมื่อครบ N หรือยืนยันตันจริง)
- เขียน `data/runs/<วันที่>-report.md` — **ต้องมีบรรทัด machine-readable `submitted: N`** ใกล้หัวไฟล์ + ตารางตัวที่ submit (alpha_id/กลไก/Sharpe/fitness/corr).
- entry เต็ม (เส้นทาง+บทเรียน) ต่อท้าย `knowledge/lessons-archive.md`; one-liner ลง `lessons-learned.md` หมวดที่ถูก (§0/§1/§2/§3/§4).
- **INTEGRITY CHECK:** รัน `node .claude/skills/improve-system/metrics.js` → ยืนยัน [0] DATA INTEGRITY: `submitted.jsonl == registry-bucket` (ไม่ desync), ไม่มี dup id.
- สรุปผลให้ผู้ใช้: submit กี่ตัว / กลไก / pool รวมเท่าไร / vein ที่เปิดต่อ.

## SUBMIT-GUARD (สรุปกฎความปลอดภัย)
1. corr **< 0.70 จริง** (ไม่ใช่ empty/pending) — ค่าทางการ `get_alpha.is.selfCorrelation` เป็น fallback. **เลือก variant ที่ margin หนา (≥~0.03 ใต้ limit) ไม่ submit ตัวเฉียด** (กัน leak ตอน recompute)
2. corr-read ฟรี → map ทุก variant ก่อน; **submit จริง probe ทีละตัว** lowest-corr-risk-first; ตัวที่คาดว่าเกิน → ตัดทิ้งไม่ probe
3. ยืนยันสำเร็จด้วย **`submitted:true` + `dateSubmitted`** เท่านั้น (201 ≠ สำเร็จ — WQ submit async)
4. **ห้าม `force:true`** · ห้าม blind re-POST ตอน PENDING (รอ 1-2 นาที อ่านค่า finalize ก่อน)
5. attempts ควร = 1 (ถ้าวิเคราะห์ corr ดีก่อน probe)

## ความสัมพันธ์กับ skill อื่น
- **`/auto-alpha`** = autonomous superset ของ `/find-alphas` (auto-submit แทนเข้าคิว).
- **`/find-alphas`** = ยัง queue-only (หาแล้วให้คนรีวิว) — ใช้เมื่ออยากคุม submit เอง.
- **`/review-candidates`** = manual human-gate (ยังใช้ได้ปกติ + OS monitoring step 0).
- **`/os-monitor`** = ติดตามผล OS (read-only).
- **`/improve-system`** = ปรับเครื่องมือ/ระบบ.

## รันยาว (run-long)
- skill นี้ **self-loop ในตัว** — สั่งให้ผมวนหา step 1→7 จนครบ N โดยไม่หยุดกลางทาง (ไม่ตั้ง Stop hook เอง).
- ถ้าต้องการ **hard-block** (ระบบบังคับไม่ให้ผมจบ turn จนครบ N จริงๆ) → เรียกคู่ `/goal /auto-alpha <N>`.

## Permissions (รันแบบไม่มีคนเฝ้า)
- ถ้าจะรันยาวไม่มีคนเฝ้า ต้องเพิ่ม allow-list ใน `.claude/settings.local.json` `permissions.allow`:
  `mcp__worldquant__simulate`, `mcp__worldquant__check_simulation`, `mcp__worldquant__get_self_correlation`, `mcp__worldquant__get_prod_correlation`, `mcp__worldquant__submit_alpha`
- ⚠️ **ผู้ใช้ต้องเพิ่มเอง** (classifier บล็อกไม่ให้ผมขยาย permission ตัวเอง) — หรือกด "allow always" ตอน prompt ครั้งแรก. ถ้าไม่เพิ่ม skill ยังทำงานได้แต่จะถามอนุญาตเป็นระยะ (ลูปอาจสะดุด).
