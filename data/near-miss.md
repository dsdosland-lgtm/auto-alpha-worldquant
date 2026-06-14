# Near-miss Notebook

บันทึก alpha ที่เกือบผ่านเกณฑ์ + setting ที่ลองไปแล้ว (กันลองซ้ำ) ตัวที่ได้แววกลับมา deep-tune ด้วย `/tune-alpha`

รูปแบบต่อรายการ:

```
## <idea_id หรือ alpha_id> — <วันที่>
- expression: `...`
- best settings: {...}
- best metrics: Sharpe x.xx | Fitness x.xx | Turnover x.xx
- check ที่ FAIL: <ชื่อ> (value vs limit)
- variants ที่ลองแล้ว:
  - {neutralization:..., decay:...} → Sharpe ...
- หมายเหตุ: ห่าง limit เท่าไร / ไอเดียต่อไป
```

---
<!-- บันทึกใหม่ต่อท้ายด้านล่าง -->

## vwap-deviation-mean-reversion — 2026-06-08
- expression: `rank((vwap - close) / vwap)`
- best settings: {region:USA, universe:TOP3000, delay:1, neutralization:SUBINDUSTRY, decay:8, truncation:0.08} (alpha_id 78d1kEZ5)
- best metrics: Sharpe 1.69 | Fitness 0.78 | Turnover 0.616
- check ที่ FAIL: LOW_FITNESS (0.78 vs 1.0) — Sharpe ผ่านสบาย แต่ returns ต่ำ (0.132) ฉุด fitness
- variants ที่ลองแล้ว:
  - {decay:2} (base) → Sharpe 1.97, Fitness 0.73, TO 1.079 (HIGH_TURNOVER fail)
  - {decay:8} → Sharpe 1.69, Fitness 0.78, TO 0.616 ✅ ดีสุด แต่ fitness ยังขาด
  - `ts_decay_linear(...,8)` decay:2 → Sharpe 1.47, Fitness 0.73, TO 0.466
  - `ts_decay_linear(...,6)` decay:6 → Sharpe 1.12, Fitness 0.56 (Sharpe หลุด limit)
  - `ts_decay_linear(...,10)` decay:4 → Sharpe 1.12, Fitness 0.59 (Sharpe หลุด limit)
  - `rank(ts_mean(...,5))` decay:4 → Sharpe 1.15, Fitness 0.54 (smooth ทำลาย signal)
- หมายเหตุ: ปัญหาแกนคือ returns ต่ำ ไม่ใช่ turnover. ลด turnover ด้วย smoothing ก็ลด Sharpe ตามไปด้วย → fitness ไม่ขยับ. ไอเดียต่อไป: คูณตัวความแรง signal (volume/volatility), ลอง universe TOP1000, หรือ truncation 0.04

## close-range-position-reversal — 2026-06-08
- expression: `rank(-ts_decay_linear((close - low) / (high - low + 0.001), 6))`
- best settings: {region:USA, universe:TOP3000, delay:1, neutralization:SUBINDUSTRY, decay:0, truncation:0.08} (alpha_id vRmlajjz)
- best metrics: **Sharpe 2.03 | Fitness 0.93 | Turnover 0.641** (ใกล้ผ่านมาก — ขาด fitness 0.07)
- check ที่ FAIL: LOW_FITNESS (0.93 vs 1.0) — Sharpe สูงมาก แต่ returns 0.135 เป็นคอขวด · มี ⚠️ UNITS warning (จาก ratio (close-low)/(high-low))
- variants ที่ลองแล้ว (วน 3 รอบ):
  - base `+group_neutralize +winsorize` window 5 → Sharpe 2.05, Fit 0.90, TO 0.654
  - +decay window 8/12 → turnover ลงแต่ returns ลดตาม Fit 0.88-0.90 (ไม่ช่วย)
  - **ตัด group_neutralize** window 5 → Fit 0.92 (returns 0.126→0.136 ↑) · window 6 → Fit 0.90
  - **ตัด winsorize ด้วย** window 6 → Fit 0.93 ✅ดีสุด (เก็บ extreme เพิ่ม returns นิด)
  - universe TOP1000 → แย่ลง (Fit 0.78, turnover ทะลุ) · neutralization INDUSTRY → Fit 0.90
- หมายเหตุ: คอขวด = returns ต่ำ (signal range-position normalized 0-1 อ่อน) ลด turnover ไม่ช่วย.

### deep-tune รอบ 2 (2026-06-08) — วน 3 รอบ 15+ variants → ชนเพดาน fitness ~0.95
- **best ใหม่:** `rank(-ts_decay_linear((close - low) / (high - low + 0.001), 4))` — window 4 (ตัด winsorize+group)
  - decay 0 (A13PQJVE): Sharpe **2.21** · Fitness **0.95** · TO 0.774 (HIGH_TURNOVER fail นิดเดียว)
  - decay 2 (npW2vx6q): Sharpe 2.01 · Fitness **0.94** · TO 0.614 ✅ turnover ผ่าน — **ตัวสมดุลสุด**
- variants เพิ่มที่ลอง (ทั้งหมดไม่ break 1.0):
  - `signed_power((close-low)/(high-low),2)` → turnover ระเบิด 1.358 (fitness 0.63)
  - window 4 + decay 4 → Fit 0.85 · centered `(2*close-high-low)/(high-low)` window 4 decay 2 → Fit 0.94
  - ผสม overnight `0.6*A + 0.4*rank(-(close/open-1))` → turnover 0.96 (fail)
  - `trade_when(range>ts_mean(range,10),...)` → Fit 0.90 · `trade_when(volume>ts_mean,...)` → Fit 0.84 (ลด turnover ได้แต่ returns ตก)
- **ข้อสรุป: signal range-position มี structural fitness ceiling ~0.95** — Sharpe กับ turnover ผูกกันแน่น (ลด turnover = ลด returns เสมอ) ดันต่อ = overfit. **พักไว้** ไอเดียที่อาจ break: หา orthogonal signal มาผสมที่เพิ่ม returns โดยไม่เพิ่ม turnover, หรือเปลี่ยน region/data ใหม่

## intraday-upside-capture-ratio — 2026-06-08 (รอบ 3)
- expression: `rank(-ts_decay_linear(winsorize((high - open) / (high - low + 0.001), std=3), 5))`
- best settings: {region:USA, universe:TOP3000, delay:1, neutralization:SUBINDUSTRY, decay:4, truncation:0.08} (alpha_id pw7l3ME6)
- best metrics: **Sharpe 1.52 | Fitness 0.77 | Turnover 0.434 | Returns 0.111 | sub-universe 1.51** — ใกล้สุดของรอบนี้ ขาด fitness 0.23
- check ที่ FAIL: LOW_FITNESS (0.77 vs 1.0) · มี ⚠️ UNITS warning (ratio price fields)
- 🔑 **ค้นพบสำคัญ: เปลี่ยน denominator (open-low) → (high-low) ทำให้ ratio bounded [0,1] → returns พุ่ง 0.070→0.111, fitness 0.50→0.77** (กระโดดใหญ่)
- variants ที่ลองแล้ว (พลิกเครื่องหมายแล้ว = momentum-fade ไม่ใช่ reversal):
  - denom (open-low) decay4 → Sharpe 1.36, Fit 0.50 (base ก่อนแก้)
  - denom (high-low) decay0 → Sharpe 1.51, Fit 0.59, TO 0.711 (HIGH_TURNOVER fail)
  - **denom (high-low) decay4 → Sharpe 1.52, Fit 0.77 ✅ดีสุด**
  - denom (high-low) decay8 → Sharpe 1.32, Fit 0.72 · window8 decay4 → Sharpe 1.38, Fit 0.75
  - × winsorize(volume/adv20) interaction → Sharpe 0.95, Fit 0.38 (volume เพิ่ม noise ทำลาย)
  - group_zscore wrap decay4 → Sharpe 1.54, Fit 0.75 (ไม่แก้ UNITS, ไม่ช่วย)
- หมายเหตุ: fitness peak ที่ decay 4 (interior max) ทุก variant กระจุก 0.72-0.77 = ชนเพดานแล้ว. คอขวด returns. ไอเดีย break: หา orthogonal signal เพิ่ม returns (ไม่ใช่ volume), หรือลอง region อื่น

## volume-asymmetry-updown — 2026-06-08
- expression: `-rank(group_neutralize(winsorize(ts_sum(volume * sign(close - ts_delay(close,1)), 10) / adv20, std=3), subindustry))`
- best settings: {region:USA, universe:TOP3000, delay:1, neutralization:SUBINDUSTRY, decay:0, truncation:0.08} (alpha_id 88LQEqVz)
- best metrics: **Sharpe 1.36 | Fitness 0.62 | Turnover 0.40 | Returns 0.084 | sub-universe 1.17 | Drawdown 0.049 (ต่ำมาก)**
- check ที่ FAIL: LOW_FITNESS (0.62 vs 1.0) — Sharpe ผ่านสบาย + drawdown ต่ำเด่น แต่ returns ต่ำ
- ⚠️ **ทิศกลับ: OBV-style เป็น reversal ไม่ใช่ momentum** ต้องใส่ `-` (rank ดิบ Sharpe -1.36)
- variants ที่ลองแล้ว:
  - base decay0 → Sharpe 1.36, Fit 0.62 ✅ดีสุด
  - decay6 → Sharpe 0.93, Fit 0.48 · decay8 → Sharpe 0.85, Fit 0.43 (decay ทำ Sharpe+returns ตกแรงกว่า turnover → fit ลด)
  - ตัด group_neutralize (ใช้แค่ settings neutralize) → Sharpe 1.33, Fit 0.60 (เกือบเท่าเดิม)
- หมายเหตุ: structural fitness ceiling ~0.62. ลด turnover ด้วย decay = fit ลดทุกครั้ง (base คือ peak). คอขวด returns. drawdown ต่ำมากน่าสนใจถ้าจับคู่กับ signal อื่น

## 52-week-high-proximity-momentum — 2026-06-08 (รอบ 4) ⭐ orthogonal
- expression: `rank(ts_zscore(mdl77_pricemomentumfactor_high52w, 20))`
- best settings: {region:USA, universe:TOP3000, delay:1, neutralization:SUBINDUSTRY, decay:0, truncation:0.08} (alpha_id vRmlWNOw)
- best metrics: **Sharpe 1.46 | Fitness 0.69 | Turnover 0.490 | Returns 0.110 | Drawdown 0.056 | sub-universe 0.94**
- check ที่ FAIL: LOW_FITNESS (0.69 vs 1.0) — Sharpe ผ่านสบาย, drawdown ต่ำ, **orthogonal กับ submitted (momentum 52w ≠ short-term reversal)** — ตัวนี้มีค่าถ้าทะลุ fitness
- 🔑 ใช้ field สำเร็จรูป `mdl77_pricemomentumfactor_high52w` (close/52w-high) + `ts_zscore(.,20)` = momentum-of-proximity. **field ดิบ rank(field) Sharpe แค่ 0.14 — ts_zscore จำเป็น** (แปลง level→momentum)
- variants ที่ลองแล้ว (วน 2 รอบ):
  - ts_zscore window 20 SUBIND → Sharpe 1.46, Fit 0.69 ✅ดีสุด
  - window 30 → Sharpe 1.29, Fit 0.64 · window 60 → Sharpe 1.20, Fit 0.70 (Sharpe หลุด) · window 120 → Sharpe 0.92, Fit 0.56
  - window 20 INDUSTRY → Sharpe 1.34, Fit 0.67 · window 40 INDUSTRY decay4 → Sharpe 0.89, Fit 0.58
  - raw field ไม่มี ts_zscore → Sharpe 0.14 (พัง)
- หมายเหตุ: **structural fitness ceiling ~0.70** (ยืด window/decay = Sharpe ตกตาม, fit ค้าง). คอขวด returns. ไอเดีย break: ผสม orthogonal signal เพิ่ม returns, หรือ region อื่น. **คู่ผสมที่น่าสน: volume-asymmetry (drawdown 0.049) — ทั้งคู่ drawdown ต่ำ + คนละ family**

## industry-relative-medium-momentum (พลิก=reversal) — 2026-06-08 (รอบ 4)
- expression: `-rank(group_zscore(ts_sum(returns, 63), subindustry))`
- best settings: {region:USA, universe:TOP3000, delay:1, neutralization:MARKET, decay:0, truncation:0.08} (alpha_id d5Q0GP6Y)
- best metrics: **Sharpe 0.90 | Fitness 0.71 | Turnover 0.159 (ต่ำมาก) | Returns 0.099 | sub-universe 0.84**
- check ที่ FAIL: LOW_SHARPE (0.90 vs 1.25) + LOW_FITNESS (0.71 vs 1.0) — ก้ำกึ่ง Sharpe ห่าง limit
- ⚠️ **ทิศกลับ: 3-month momentum เป็น reversal ในช่วงนี้** (rank ดิบ Sharpe -0.90 → พลิก +0.90). turnover ต่ำมาก (0.159) เพราะ ts_sum 63 วัน smooth
- หมายเหตุ: Sharpe 0.90 ห่าง 1.25 (72%) ยังไม่ถึง margin tune. turnover ต่ำมากเหลือที่ให้เพิ่มความแรง signal ได้ — ถ้าจะ deep-tune ลองเพิ่ม conviction (signed_power เบาๆ) หรือ shorter window (42 วัน) เพื่อดัน Sharpe โดยยอม turnover ขึ้น

## COMBO: 52w-high + intraday-upside + OBV — 2026-06-08 (รอบ 4 deep, ผสม orthogonal) ⭐
- expression: `rank(ts_zscore(mdl77_pricemomentumfactor_high52w, 20)) + rank(-ts_decay_linear(winsorize((high-open)/(high-low+0.001),std=3),5)) - rank(group_neutralize(winsorize(ts_sum(volume*sign(close-ts_delay(close,1)),10)/adv20,std=3),subindustry))`
- best settings: {region:USA, universe:TOP3000, delay:1, neutralization:SUBINDUSTRY, decay:2, truncation:0.08} (alpha_id A137W29w)
- best metrics: **Sharpe 1.50 | Fitness 0.82 | Turnover 0.417 | Returns 0.124 | Drawdown 0.056 | sub-universe 1.28**
- check ที่ FAIL: LOW_FITNESS (0.82 vs 1.0) · ⚠️ UNITS warning (จาก intraday ratio)
- 🔑 **ผสม 3 signal orthogonal (momentum 52w + intraday range-position + OBV flow) ดันเพดาน single signal 0.77→0.82** — diversification เพิ่ม Sharpe (single สูงสุด 1.52 → combo คง 1.50 พร้อม returns รวมสูงขึ้น)
- variants ที่ลองแล้ว (~12 combo sims):
  - A+B decay0 → Sharpe 1.59, fit 0.72, TO 0.641 · A+C decay0 → Sharpe 1.48, fit 0.74, TO 0.443
  - A+B+C decay0 → fit 0.76 · **decay2 → Sharpe 1.50, fit 0.82 ✅ดีสุด** · decay3 → Sharpe 1.42, fit 0.82, TO 0.352 · decay4 → fit 0.80 · decay8 → Sharpe 1.11 (หลุด)
  - weighted 1.5A → fit 0.82 · 1.5B → fit 0.82 · truncation 0.04 → fit 0.82 (ทุกแบบล็อก 0.82)
- หมายเหตุ: **combo มี fitness ceiling ใหม่ ~0.82** — เพิ่มจาก single (0.77) แต่ตันที่ชุด 3 signal นี้. การปรับ weight/decay/trunc ไม่ขยับ. ไอเดีย break 1.0: (1) เพิ่ม signal orthogonal ตัวที่ 4 ที่ returns สูง, (2) ลอง region/universe อื่น (TOP1000 momentum อาจ clean กว่า), (3) หา signal ที่ returns สูงกว่านี้แทน component ที่อ่อน
- ⚠️ **ก่อน submit ถ้าผ่าน: component B,C เป็น short-term reversal/flow อาจ self-correlate กับ submitted (price-volume divergence + overnight reversal)** — ต้องเช็ค self-corr ก่อน. A (momentum) เป็นส่วน orthogonal จริง

## close-vs-midpoint × volume — 2026-06-09 (รอบ 10) ⭐⭐⭐ fitness 0.99 (BEST EVER)
- expression: `rank(-(close - (high + low) / 2) / (high - low + 0.001) * winsorize(volume / adv20, std=3))`
- best settings: {region:USA, universe:TOP3000, delay:1, neutralization:SUBINDUSTRY, decay:8, truncation:0.08} (alpha_id akOEGMwO — **ไม่มี group_neutralize ใน expr**)
- best metrics: **Sharpe 2.02 | Fitness 0.99 | Turnover 0.599 | Returns 0.143 | Drawdown 0.053 | sub-universe 1.26** — ขาด fitness แค่ 0.01!
- check ที่ FAIL: LOW_FITNESS (0.99 vs 1.0) · ⚠️ UNITS warning
- 🔑 **anchor ใหม่: close เทียบ midpoint (high+low)/2 ของวัน × volume** — reversal ที่ใช้ midpoint (ไม่ใช่ close/open หรือ 5d-zscore ที่อยู่ในพูล) Sharpe สูงมาก 2.0+ จากการ × volume
- variants ที่ลองแล้ว (~15 sims, plateau 0.96-0.99):
  - +group_neutralize decay6 → Sharpe 2.13 fit 0.97 · decay8 → 2.04 fit 0.98 · decay10 → 1.96 fit 0.98
  - **ตัด group_neutralize decay8 → Sharpe 2.02 fit 0.99 ✅ดีสุด** · decay9 → 1.98 fit 0.99 · decay6 → 2.10 fit 0.97
  - +52w-momentum combo → fit 0.90 (เจือจาง Sharpe ทำแย่ลง) · truncation 0.04 → 0.98 · MARKET → 0.87 · INDUSTRY → 0.94
- หมายเหตุ: **family ceiling ~0.99** (close-range/midpoint reversal) — สูงสุดที่โปรเจกต์เคยทำ. การ × volume + ตัด group + decay 8 ดันถึง 0.99 แต่ไม่ข้าม. 
- ⚠️ **เป็น reversal family → ถ้าข้าม 1.0 ได้ self-corr น่าจะสูง (เทียบ GroeQEpO overnight×volume = corr 0.80)** — ต้องเช็ค. ทางข้ามจริง: หา returns-booster ที่ไม่ใช่ reversal หรือเปลี่ยน data axis

### อัปเดตรอบ 5 (2026-06-08): combo บน TOP1000 → fitness 0.85 (ดีสุดของ session)
- **best ใหม่:** combo เดิม settings {universe:**TOP1000**, decay:2, SUBINDUSTRY, trunc:0.08} (alpha_id P01OEpRJ) → **Sharpe 1.49 | Fitness 0.85 | Turnover 0.414 | Returns 0.134** (returns ขึ้นจาก 0.124 เพราะ momentum สะอาดกว่าใน large-cap)
- variants TOP1000: decay1 → Sharpe 1.53/fit 0.77 (TO 0.547) · decay2 → fit 0.85 ✅ · decay3 → fit 0.84 · decay5 → Sharpe 1.23/fit 0.77 (หลุด) · TOP500 → Sharpe 1.12 (เล็กไป, noisy)
- ⚠️ sub-universe Sharpe ตึงขึ้นบน TOP1000 (0.79-0.88 vs limit 0.74-0.81) — ระวังถ้าดันต่อ
- **ความคืบหน้าสะสม fitness: single 0.69 → combo TOP3000 0.82 → combo TOP1000 0.85** แต่ละ lever +0.03 เริ่ม diminishing. ยังขาด 0.15 ถึง 1.0
- หมายเหตุ: รอบ 5 ลองหา signal returns-สูง (PEAD/revision/FCF/momentum-accel/volume-breakout) มาเสริม combo **แต่ตกหมด** (ดู report รอบ 5) → ไม่มี component ใหม่ที่ดีพอเติม. break 1.0 ต้องการ data/region ใหม่ หรือ signal family ที่ยังไม่ได้ลอง

## COMBO: close-range + 52w-momentum − OBV — 2026-06-08 (รอบ 6) ⭐⭐ fitness 0.96 (BEST EVER)
- expression: `2 * rank(-ts_decay_linear((close - low) / (high - low + 0.001), 4)) + rank(ts_zscore(mdl77_pricemomentumfactor_high52w, 20)) - rank(group_neutralize(winsorize(ts_sum(volume * sign(close - ts_delay(close,1)), 10) / adv20, std=3), subindustry))`
- best settings: {region:USA, universe:TOP3000, delay:1, neutralization:SUBINDUSTRY, decay:2, truncation:0.08} (alpha_id 88LenAMq ใช้ weight 2.5 / P01OvZmq ใช้ weight 3.0 — ทั้งคู่ fit 0.96)
- best metrics: **Sharpe 1.83 | Fitness 0.96 | Turnover 0.528 | Returns 0.144 | Drawdown 0.069 | sub-universe 1.40** — fitness สูงสุดที่โปรเจกต์เคยทำได้ ขาด 0.04
- check ที่ FAIL: LOW_FITNESS (0.96 vs 1.0) · ⚠️ UNITS warning (จาก close-range ratio)
- 🔑 **anchor ที่ close-range (signal แรงสุด fit 0.95 เดี่ยว) + เติม 52w-momentum (orthogonal returns) − OBV (ตัด turnover)** = ดันทะลุเพดาน close-range solo 0.95 → 0.96
- สูตรที่ค้นพบ: **เพิ่มน้ำหนัก signal ที่แรงสุด (close-range 2-3×) + ลบ signal ที่ turnover สูง (OBV) เพื่อ net ลด TO โดยรักษา returns**
- variants ที่ลองแล้ว (~15 combo sims):
  - D+A (1:1) decay0 → fit 0.91 · decay2 → fit 0.91 (Sharpe 1.77)
  - 1.5D+A decay2 → fit 0.93 · 2D+A decay2 → fit 0.94 · 2D+A decay1 → TO 0.715 (หลุด)
  - **2.5D+A−C decay2 → fit 0.96 ✅** · 3D+A−C decay2 → fit 0.96 · 2D+A−C decay2 → fit 0.95
  - 2.5D+A−1.5C → fit 0.94 · 3D+1.5A−1.5C → fit 0.95 · 2D+A decay3 → fit 0.90 (decay ทำ close-range returns ตก)
  - TOP1000 → fit 0.76 (close-range ชอบ TOP3000 ต่างจาก 52w-combo ที่ชอบ TOP1000)
- หมายเหตุ: **plateau ที่ 0.96** — ดันน้ำหนักต่อ = overfit (fitness นิ่ง 0.94-0.96). ขาด 0.04 ถึง submit. ถ้าจะ break: fix UNITS warning, หรือ orthogonal component ตัวใหม่ที่ returns สูงจริง (รอบ 5 หาไม่เจอบน USA), หรือเปลี่ยน data axis [[returns-bottleneck-usa-delay1]]
- ⚠️ component close-range/OBV เป็น reversal/flow — เช็ค self-corr กับ submitted ก่อน submit

## Fama-French HML value-conditioned reversal — 2026-06-10 (รอบ 12) ⭐ orthogonal source ใหม่
- expression: `-ts_zscore(close, 5) * winsorize(mdl177_fa_bp, std=3)`  (mdl177_fa_bp = book-to-market ของ FF HML)
- best settings: {region:USA, universe:TOP3000, delay:1, neutralization:SECTOR, decay:5, truncation:0.08} (alpha_id mLXmXAG2)
- best metrics: **Sharpe 1.43 | Fitness 0.83 | Turnover 0.496 | Returns 0.167 | Drawdown 0.116 | sub-universe 1.14** — returns เกิน benchmark 0.15! ขาด fitness 0.17
- ทางเลือก Sharpe สูงกว่า: {INDUSTRY, decay 3} (WjgbgjkO) → **Sharpe 1.63 | Fit 0.83 | TO 0.612 | Returns 0.159 | sub 1.23**
- check ที่ FAIL: LOW_FITNESS (0.83 vs 1.0) — ทุก check อื่นผ่านสบาย, **sub-universe robust มาก (1.1-1.3) = คุณภาพสูง**
- 🔑 **กลไก: ตระกูล price-volume reversal ที่ชนะ (-ts_zscore(close,5)) แต่ถ่วงด้วย HML book-to-market แทน volume** → reversal แรงขึ้นในหุ้น value (B/M สูง). **orthogonal กับ submitted #2 ที่ใช้ volume/adv20 เป็นตัวถ่วง** — น่าจะ self-corr ต่ำกว่า ×volume variant
- variants ที่ลองแล้ว (~18 sims รวม FF batch):
  - FF บริสุทธิ์: -log(cap) Sharpe -0.12 · mdl177_fa_bp (value) Sharpe **-0.51** (value ติดลบ=growth ชนะช่วงนี้) · 5yr-rel-value -0.36 · industry-rel-BP(flip) 0.43 — **fundamental ล้วนอ่อน/ลบตามเคย**
  - rank(B/M) weight, SUBIND decay4 → Sharpe 1.54 fit 0.76 · winsorize(B/M) weight ดีกว่า rank เล็กน้อย
  - SUBINDUSTRY decay 2/3/4 → fit 0.75-0.80 (locked) · window 3 → TO 0.80 (fail)
  - **INDUSTRY/SECTOR neut กู้ returns 0.138→0.167** (กว้างกว่า subind) → fit 0.80→0.83
  - × volume เพิ่ม → fit 0.66 (แย่ลง + เพิ่ม corr) · × rank(-log cap) size-tilt → sub-universe พัง 0.20 (size ทำลาย robustness)
- หมายเหตุ: **structural fitness ceiling ~0.83** — returns/Sharpe trade-off ล็อก fitness (returns 0.150→0.167 แต่ Sharpe 1.63→1.43 พอดี). ยืนยัน [[returns-bottleneck-usa-delay1]]. **เป็น near-miss เดี่ยวที่แข็งสุดตัวหนึ่ง (sub-universe 1.1-1.3) + orthogonal ของแท้** — คู่ควรเป็น component ใน combo เพื่อ break 1.0 หรือเอาไปผสมกับ midpoint-reversal (fit 0.99)

## Fama-French RMW profitability-conditioned reversal — 2026-06-10 (รอบ 13) ⭐⭐⭐ fitness 0.96 (BEST SINGLE SIGNAL EVER)
- expression: `-ts_zscore(close, 5) * winsorize(gross_profit_to_assets_ratio, std=3)`  (gross_profit_to_assets = Novy-Marx RMW proxy)
- best settings: {region:USA, universe:TOP3000, delay:1, neutralization:INDUSTRY, decay:4, truncation:0.08} (alpha_id 3qAX7j3P / RRrb8Pze)
- best metrics: **Sharpe 1.69 | Fitness 0.96 | Turnover 0.557 | Returns 0.179 | Drawdown 0.085 | sub-universe 1.41** — ขาด fitness แค่ 0.04!
- ทางเลือก Sharpe สูงกว่า: {INDUSTRY, decay 3} (kqKo0bYz) → **Sharpe 1.77 | Fit 0.96 | TO 0.626 | Returns 0.184 | sub 1.48**
- check ที่ FAIL: LOW_FITNESS (0.96 vs 1.0) เท่านั้น — **ทุก check อื่นผ่านสบาย, sub-universe 1.41-1.48 robust สูงสุดของโปรเจกต์, ไม่มี UNITS warning (ต่างจาก close-range combo)**
- 🔑 **ค้นพบใหญ่: RMW (profitability, gross-profit-to-assets) เป็นตัวถ่วง reversal ที่ดีกว่า HML value มาก** — value-weighted ได้ fit 0.83, **profitability-weighted ได้ 0.96**. ตรงกับ thesis ของ FF 2015 เป๊ะ (RMW+CMA เหนือกว่า/ทำให้ HML redundant). กลไก: หุ้น high-profitability ที่ราคาร่วงระยะสั้น = mispricing ชัด → reversal แรง + returns สูง
- variants ที่ลองแล้ว (~9 sims):
  - RMW/CMA บริสุทธิ์: gross_profit_to_assets raw → CONCENTRATED_WEIGHT FAIL (coverage ไม่ครบ); CMA asset-growth(flip) Sharpe -0.25 (fundamental อ่อนตามเคย)
  - INDUSTRY: decay 4 → **fit 0.96 ✅** · decay 3 → fit 0.96 (Sharpe 1.77 TO 0.63) · decay 5 → fit 0.95 · decay 6 → fit 0.92 · trunc 0.04 → fit 0.96 (เท่าเดิม)
  - SECTOR decay 5 → fit 0.91 · SUBINDUSTRY decay 4 → fit 0.94 (INDUSTRY ดีสุด)
  - +CMA composite weight (RMW+conservative) → fit 0.91 (CMA เจือจาง) · +52w-momentum combo → fit 0.91 (momentum เจือจาง Sharpe)
- หมายเหตุ: **ชน hard ceiling 0.96 ของ USA TOP3000 delay1** ([[returns-bottleneck-usa-delay1]]) — เพดานเดียวกับ close-range combo รอบ 6 แต่ตัวนี้เป็น **single signal** (ไม่ใช่ combo 3 ชั้น) + sub-universe robust กว่า + ไม่มี UNITS warning = **คุณภาพสูงสุด**. การเพิ่ม factor/combo เจือจางหมด. ทางข้าม 1.0 เหลือแค่เปลี่ยน data axis
- ⚠️ **base reversal -ts_zscore(close,5) ใช้ร่วมกับ submitted #2 (price-volume divergence)** — แต่ตัวถ่วงต่างกันสิ้นเชิง (profitability ≠ volume) + neut ต่าง (INDUSTRY≠SUBIND). **ถ้าจะ submit ต้องเช็ค self-corr <0.7 ก่อน** — อาจ orthogonal พอเพราะ returns มาจาก cross-section คนละกลุ่ม. self-corr ตอน simulate = empty (เชื่อไม่ได้ ตาม GroeQEpO precedent), prod-corr 403. **ผู้ใช้เลือกเก็บเป็น near-miss รอ data ใหม่ (2026-06-10)**

### รอบ 14 (2026-06-10): สังเคราะห์ best-base × RMW-weight — ไม่ทะลุ 0.96 (ยืนยันเพดานครั้งที่ 14)
- ลองเอา RMW-weight (ตัวถ่วงที่ดีสุด) ไปใส่ reversal base ที่ Sharpe สูงกว่า ts_zscore แทน volume:
  - **close-range × RMW** `-((close-low)/(high-low+0.001)) * winsorize(gpa,std=3)` SUBIND decay 6 (akObVwVR) → **Sharpe 2.03, Fit 0.94, TO 0.663, Returns 0.142, sub-universe 1.46** · INDUSTRY decay 4 → Sharpe 2.07 แต่ TO 0.80 (fail) · INDUSTRY decay 8 → fit 0.92
  - **midpoint × RMW** `-(close-(high+low)/2)/(high-low+0.001) * winsorize(gpa,std=3)` SUBIND decay 8 → Sharpe 1.91 fit 0.93 · INDUSTRY decay 6 → Sharpe 1.90 fit 0.92
- 🔑 **บทเรียน: base ที่ Sharpe สูงกว่า (close-range 2.07, midpoint 1.91) มี turnover สูงกว่าตาม → fitness ติด 0.92-0.94 ต่ำกว่า ts_zscore base (0.96)**. fitness ถูก dominate ด้วย returns/turnover ratio ไม่ใช่ Sharpe ล้วน. **ts_zscore(close,5) × RMW (0.96) ยังเป็น sweet spot ที่ balance returns/turnover ดีสุด** — สูง Sharpe ไม่พอถ้า turnover ตามขึ้น. UNITS warning โผล่กับ close-range/midpoint (ratio) ต่างจาก ts_zscore base ที่ไม่มี warning

## options positioning composite (รอบ 32, 2026-06-11) — peak 1.18/0.86 ceiling
- **best:** `mLXKYgb5` = `group_rank(ts_mean(pcr_vol_10,5), sector) + group_rank(implied_volatility_mean_30 - parkinson_volatility_60, sector)` {TOP500 SUBINDUSTRY decay10 trunc0.04} → Sharpe 1.18, fit 0.86, TO 0.163, returns 0.088, sub-univ 0.76, **CONCENTRATED PASS**
- 🔑 ค้นพบเชิงเทคนิค: **group_rank แก้ CONCENTRATED ที่ฆ่า options ทั้งรอบ 19** — options space กลับมาเล่นได้
- ติด: fitness ceiling 0.86 (3 variants: decay10/decay20/ts_mean — Sharpe peak 1.18 ไม่ถึง 1.25). ขาที่มี = PCR-vol 0.66 + VRP 0.84 เท่านั้น (ขาอื่น <0.5 หมด: clean-VRP 0.40, earnings-move ±0.32, PCR-oi/smile/breakeven/slope ตายรอบ 19)
- ⚠️ corr-risk: ขา VRP แรงเพราะฝั่ง parkinson RV (พิสูจน์จาก clean-VRP ที่ตัด RV แล้วเหลือ 0.40) → ต่อให้ผ่าน IS ก็เสี่ยงชน intraday-vol niche (le0AvXl7 cluster corr 0.94 กับ Parkinson)
- จะกลับมาเมื่อ: มีขา options ใหม่ ≥0.7 (เช่น tier เปิด option fields เพิ่ม) หรือ OS-fail ปลด intraday-vol niche → VRP leg หมด corr-risk
- **อัปเดตรอบ 33:** ค้นหาขาที่ 3 ครบทุก field family ของ option6 แล้ว — O/S ratio (Johnson-So) −0.40, put-call volume imbalance −0.01, vol-forecast-spread −0.07 = **ไม่มีขาใหม่ ≥0.7 ใน options space ทั้งหมด**. composite ค้างที่ 1.18/0.86 — เหลือเงื่อนไขเดียว: OS-fail ปลด intraday-vol (→ ใช้ขา VRP เต็มได้ไม่ติด corr) หรือ tier เปิด

## รอบ 35 (2026-06-12) — short-interest positioning composite `qMXObw9j` ⭐ ขาด LOW_SHARPE 0.01
- **expression:** `2*group_rank(mdl177_devnorthamericashortsentimentfactor_days_to_cover, sector) - group_rank(mdl77_monchgsip, sector)`
- **settings:** USA / TOP3000 / d1 · SUBINDUSTRY · decay 10 · trunc 0.04
- **metrics:** Sharpe **1.24 (limit 1.25 — ขาด 0.01)** · fitness 0.94 · TO 0.060 · returns 0.072 · **sub-universe 1.11/0.54 แข็งมาก**
- **check FAIL:** LOW_SHARPE 1.24<1.25 · LOW_FITNESS 0.94<1.0
- **ขา:** DTC-long 1.05 (returns 0.066, sub-univ 1.01) + Δmonthly-SIP-short 0.89 — ⚠️ ทิศ DTC กลับ literature (long high-DTC ชนะ ใน sample 2019-23 = squeeze/illiquidity premium)
- **ลองแล้วทั้งหมด (8 variant):** 3×DTC (1.18), INDUSTRY (1.13), +conc (1.19), +util (1.03), DTC+si_ratio_alt avg (1.18, sub-univ 1.36), ขาเดี่ยวอื่น: SIP 0.2, 12m-chg 0.14, util ±0.69, daily-flow ±0.68+CONC
- **ทางกลับมา:** (1) หาขาที่ 3 ที่ Sharpe ≥0.7 จริงในตระกูล positioning (ownership/13F?) (2) OS-fail ของ 9q6bwk7r (turnover-niche) อาจปลด corr-risk แล้วลองรวมกับ liquidity legs (3) ⚠️ ก่อน submit ต้องเช็ค corr vs 9q6bwk7r/1YmxEbYQ (volume denominator)

## YPAEbvGW — analyst-sentiment composite (sentiment1) — 2026-06-12 (รอบ 41) ⭐ CONDITIONAL niche #11
- expression: `2*group_rank(snt1_d1_dtstsespe,sector) + group_rank(snt1_d1_earningstorpedo,sector) + group_rank(snt1_d1_netrecpercent,sector)`
- best settings: {region:USA, universe:TOP3000, delay:1, neutralization:**INDUSTRY**, decay:10, truncation:0.04} (alpha_id YPAEbvGW)
- best metrics: **Sharpe 1.28 | Fitness 1.09 | Turnover 0.013 | Returns 0.090 | Drawdown 0.081 | sub-universe 0.89** — **ผ่าน IS ครบทุก check!**
- check ที่ FAIL: **เฉพาะ self-corr 0.8367 vs `j2go6pmO`** (org-capital niche #9 ของเราเอง) — corr ตัวอื่นผ่านหมด (P01xQodW 0.634, gJPqnv6J 0.671, O096kVaY 0.659, RRr9Yv9z 0.626)
- 🔑 **กลไก: analyst-sentiment composite = field class ใหม่ที่ work จริง** (dispersion + earnings-torpedo + recommendation จาก sentiment1) — pool ไม่มี sentiment niche. **ขัดแย้ง verdict เดิม "news/sentiment dead"** ที่เหมาเอา sentiment1 รวมกับ social buzz (รอบ 8)
- ⚠️ **ตัวบล็อก = dispersion leg (dtstsespe) collinear กับ org-capital (j2go6pmO)** — ทั้งคู่เลือกหุ้น hard-to-value/intangible เดียวกัน. dispersion เป็นทั้งตัวแบก Sharpe (1.27 เดี่ยว) และ corr-bridge → ตัด/ลดน้ำหนัก = Sharpe ร่วงต่ำ 1.25, คง 2× = corr 0.84
- variants ที่ลองแล้ว (17 sims):
  - ขาเดี่ยว: dispersion 1.27/sub0.71, torpedo 1.15/sub0.69, netrec 1.00/sub0.63 (3 ขาแข็ง); nettarget 0.60, cored1 0.79, dynamicfocus 0.66, stockrank 0.54, earningsrevision 1.00/sub0.37, LTG-flip 0.89 (อ่อน)
  - 2B+C+A SUBINDUSTRY (xAn2Mpkl) → 1.28/1.03 corr **0.8385** · INDUSTRY (YPAEbvGW) → 1.28/1.09 corr **0.8367** (neut เปลี่ยนไม่ช่วย = bridge เป็นเนื้อ signal) · SECTOR → 1.19 (fail IS)
  - 1:1:1 → 1.24 (fail) · 1× dispersion variants → 1.19 · dispersion-free (torpedo+netrec+target) → 0.92-0.99 (อ่อนเกิน)
- 🎯 **CONDITIONAL TRIGGER: ถ้า `j2go6pmO` OS-FAIL** (OS PENDING อยู่) → niche reopen → YPAEbvGW submit ได้ทันที (Sharpe 1.28 fit 1.09 พร้อม). ติดตามผ่าน /os-monitor
- หมายเหตุ: gap corr 0.14 กว้างเกิน weight-perturbation (รอบ 36 แก้ได้แค่ ≤0.02). ทางแก้อื่น = vector_neut(composite, j2go6pmO) แต่ lessons เตือน residual อ่อน — ยังไม่ลอง (EV ต่ำ เก็บไว้ถ้าต้องการดันจริง)

## รอบ 46 (2026-06-12) — abnormal-capex (Titman-Wei-Xie 2004) 🎯 CONDITIONAL บน j2go6pmO OS-fail
- **ตัวแทน family (corr ต่ำสุด):** `npWqOj3a` — `group_rank(-(capex/(assets+1)) / (0.333*(ts_delay(capex/(assets+1),252)+ts_delay(capex/(assets+1),504)+ts_delay(capex/(assets+1),756))+0.001), sector)` {SUBINDUSTRY decay10 trunc0.04} = Sharpe 1.56 / fit 1.24 / TO 0.022 / sub 0.81 / **self-corr 0.7199 vs j2go6pmO**
- **ตัวแรงสุด (backup ถ้า j2go6pmO หลุด pool):** `j2gGnbMo` {INDUSTRY} = **1.68 / 1.43 / sub 0.96** / corr 0.743
- **corr surface ที่ map แล้ว:** sector-SUBIND 0.7199 · industry-group 0.7308 · INDUSTRY-neut 0.743 · +eIV dilution 0.7157 (sub fail) · +accruals = Sharpe พัง · sales-normalized = IS อ่อน
- **ข้อสรุป:** bridge ไป j2go6pmO เป็น structural (investment-intensity dimension เดียวกับ lease/ΔSGA/adv) — dilution/granularity/neut ขยับได้แค่ ±0.03. **j2go6pmO ตอนนี้ block 2 candidate แรง: YPAEbvGW (sentiment 0.84) + abnormal-capex (0.72)** → ถ้า j2go6pmO OS-fail ให้ submit npWqOj3a ทันที (หรือ j2gGnbMo ถ้า j2go6pmO หลุดจาก pool ทั้งตัว)

## รอบ 49 (2026-06-12) — contrarian-social + netrec 🎯 CONDITIONAL ตัวที่ 3 บน j2go6pmO
- `omYGW56l` — `group_rank(-ts_mean(scl12_sentiment,63), sector) + group_rank(snt1_d1_netrecpercent, sector)` {SUBINDUSTRY decay10 trunc0.04} = **Sharpe 1.42 / fit 1.08 / TO 0.032 / sub 0.90** / self-corr **0.8149 vs j2go6pmO**
- story: long หุ้นที่ analyst แนะนำซื้อแต่ social sentiment แย่ (pro-vs-crowd spread) — IS สวยมากแต่ขา opinion ทั้งคู่ load ทิศ org-capital เสริมกัน
- **j2go6pmO block list ตอนนี้ (เรียงตาม IS):** (1) abnormal-capex `npWqOj3a` 1.56/1.24 corr 0.72 — submit ก่อนถ้า fail · (2) contrarian-social+netrec `omYGW56l` 1.42/1.08 corr 0.81 · (3) sentiment-composite `YPAEbvGW` 1.28/1.09 corr 0.84
- ⚠️ ขา contrarian-social (0.92 corr-เดี่ยว 0.47) ยังว่าง — ใช้ได้ถ้าเจอ partner ≥1.0 ที่ไม่ load j2go6pmO/ไม่ใช่ sentiment1
