# Dataset Coverage Map — USA TOP3000 delay1 🗺️

> **อ่านก่อนเริ่มทุกรอบ** (find-alphas step 0). กันการขุดวนแค่ 2-3 dataset เดิม
> อัปเดตทุกครั้งที่สวีป dataset ใหม่: ผล + verdict + วันที่
> เป้าหมาย: หา **returns source ใหม่ที่ไม่ใช่ short-term reversal** (คอขวดแท้คือ returns ไม่ใช่ tuning — ดู [[returns-bottleneck-usa-delay1]])

## สรุปยุทธศาสตร์ (อัปเดต 2026-06-11)
> ⚠️ **ไฟล์นี้ครอบแค่แกน data — แกน transform/mechanism อยู่ `knowledge/mechanism-map.md` (อ่านคู่กันเสมอ)**

หลัง 23 รอบ: dataset ขุดครบทั้ง 20 ตัวแล้ว แต่ **breakthrough 2 ตัวที่ submit สำเร็จ (MAX, signed-jump) มาจาก transform ใหม่บน dataset เดิม (pv1+fundamental6)** ไม่ใช่ dataset ใหม่. บทเรียน: **"dataset หมด" ≠ "ตัน" — ทางหลุดคือ mechanism ใหม่** (ดู mechanism-map). signal ที่แรงพอ: magnitude-of-extreme transforms (reversal/MAX/signed-jump) + GP-as-weight.

## ตาราง 20 datasets (USA TOP3000 delay1)

| dataset | ชื่อ | สถานะ | ผล/verdict |
|---------|------|-------|-----------|
| **pv1** | Price Volume | 🟢 ขุดหนัก | **returns source หลัก** — reversal/price-volume/range/midpoint Sharpe 1.6-2.1. submitted 2 ตัวจากนี่ |
| **fundamental6** | Company Fundamentals | 🟢 ขุดหนัก | **gross_profit_to_assets = ตัวถ่วงดีสุด (GP-reversal 0.96)**; book-to-market/ROE/accruals/FCF เดี่ยวๆ อ่อน. **🆕 รอบ 44: NOA balance-sheet bloat (equity+debt−cash, Hirshleifer) = `YPAzrowM` SUBMITTED ตัวที่ 11 (1.51/1.02 corr 0.50) — standalone leg ที่ผ่านครบ!** · **🆕 รอบ 46: OL (cogs+sga)/assets + GP-surprise-q = core ของ `d5Qz7erx` SUBMITTED ตัวที่ 12 (1.59/1.24 corr 0.672)** · ปิด: CbOP 0.42, CCC sub-ติดลบ, excess-cash, pct-accruals 0.57, CFO-vol flat, abnormal-capex = CONDITIONAL (corr 0.72 vs j2go6pmO) |
| **model77 / model177** | Analysts' Factor Model | 🟢 **รอบ 53: ได้ candidate #13!** (~~ปิดเคสรอบ 48~~ — ผิด: ข้าม geographic fields เพราะ "hypothesis อ่อน") | 52w-mom (0.69), FF-mom ตาย, RMW/CMA, deepvalue, ACI/util/conc/capexdep (legs), **EPS-trend-slope 0.81 (additive โดนดูด)**, trough-margin 0.26 flat, total-coverage 0.00 flat. ที่เหลือใน library = Δ-margin (GP-surprise family booked) / payout (value) / cv-stability (vol-closed) / analyst scores (booked) — **ไม่มี field class เปิดเหลือ** |
| option6/8/9 | Options Analytics/Vol | 🟡 รอบ 19+32 | standalone อ่อนหมดนอก skew (PCR-vol 0.66, VRP 0.84-flip, ที่เหลือ <0.45). **รอบ 32: `group_rank(x,sector)` แก้ CONCENTRATED ที่ฆ่ารอบ 19 → composite PCR+VRP = 1.18/0.86 near-miss (ceiling — ขาไม่พอ)**; option6 probe แล้ว: earnings-move ±0.32, clean-VRP 0.40 flat. ⚠️ VRP แรงเพราะ parkinson-RV side = corr-risk intraday-vol niche. ATM skew (pool 2.22) ยัง replicate ไม่ได้ |
| **sentiment1** | Research Sentiment (= analyst rec/target/dispersion!) | 🟠 **ขุดรอบ 41 — field class ใหม่ work** | ⚠️ **verdict เดิม "buzz flat" ผิด — sentiment1 ไม่ใช่ social buzz แต่เป็น analyst recommendation/price-target/dispersion/torpedo (19 fields).** ขาแข็ง low-TO route: **dispersion 1.27/sub0.71, torpedo 1.15/sub0.69, netrec 1.00/sub0.63** (group_rank sector decay10). composite `YPAEbvGW` ผ่าน IS 1.28/1.09 แต่ corr 0.84 vs j2go6pmO (dispersion↔org-capital). อ่อน: nettarget 0.60, cored1 0.79, dynamicfocus 0.66, stockrank 0.54, earningsrev 1.00/sub0.37. **CONDITIONAL niche #11 ถ้า j2go6pmO OS-fail** |
| socialmedia8/12 | Sentiment/Social (buzz) | 🟠 **รอบ 49 — ได้ขา leg-grade** | fast buzz ตายจริง (รอบ 8) แต่ **slow-window contrarian: `-ts_mean(scl12_sentiment,63)` group_rank = 0.92 sub-ratio 0.51 TO 0.04 corr-เดี่ยว 0.47** — ⚠️ load ทิศ j2go6pmO ~0.47: คู่กับ netrec ผ่าน IS (1.42/1.08) แต่ corr 0.8149 = CONDITIONAL #3. รอ partner ≥1.0 นอก opinion-class |
| pv13 | Relationship Data | 🟡 รอบ 8 | rel_ret_cust (customer momentum) Sharpe 1.25 แต่ turnover-locked 1.10 |
| **analyst4** | Analyst Estimates | 🟢 **ขุดรอบ 33 — SUBMITTED!** | **`P01xQodW` composite 4 ขา (2×recency-SUE + recency-guidance + breadth + coverage, group_rank sector) Sharpe 1.47 fit 1.00 TO 0.074 self-corr 0.615 = SUBMITTED 2026-06-12 (ACTIVE/OS).** ขาเดี่ยว: SUE 1.20 (recency→1.33), guidance-gap 0.84 (recency→1.01), breadth 0.74, coverage-change 0.85 = ผ่านเกณฑ์ขา ≥0.7 ถึง 4 ขา. ที่ flat: dispersion DMS ±0.23, revision-momentum 0.49, sales-surprise 0.53. **เทคนิคใหม่: recency-weight `max(1-days_from_last_change(f)/63,0)`** (รอบ 5 เดิมใช้แค่ mdl177 proxy = ไม่นับเป็นการขุดจริง) |
| earnings4 | Earnings Announcement (ORATS earnings-vol) | 🟡 **probe เต็มรอบ 34 — ปิดเคส** | dataset จริง = ORATS earnings-vol surface (ไม่ใช่แค่ announcement_effect รอบ 16). probe 4 มุม: implied-vs-historical move gap 0.08, **earnings IV add-on (30div−30dexerniv) 0.77 TOP3000 แต่ sub-univ fail + TOP500 collapse 0.35** (เป็นขา options composite ไม่ได้), forecast-straddle mispricing 0.11. vol-surface→stock-return edge ไม่มีเกินที่จองแล้ว |
| **news12** | US News Data | 🟢 **probe ตรงรอบ 49 — ปิดเคส** | จริงๆ เป็น **event-session microstructure** (VWAP/volume/ATR/advantageous-flag รอบข่าว — ไม่ใช่ sentiment คนละชนิดกับ news18!) แต่ probe 2 มุม (news-reaction persistence −0.07, news-attention 0.31) = flat. proxy-verdict เดิมผิดเรื่องชนิดข้อมูล แต่ verdict สุดท้ายเหมือนเดิม |
| **news18** | Ravenpack News | 🟡 รอบ 16 | ❌ **สวีป 8 มุมแล้วแบนหมด** — sentiment level (turnover 0.83-0.99), smoothed (flat-neg), earnings-sentiment (0.09), shock (turnover 1.13), impact (flat). **news sentiment ไม่ใช่ returns source บน USA daily** |
| beta (pv/model) | Beta vs SPY | 🟡 รอบ 16 | ❌ **BAB low-beta → CONCENTRATED_WEIGHT fail + flat** ทั้ง 90d/360d |
| **model16** | Fundamental Scores | 🟡 รอบ 17 | ❌ **fscore_surface (composite Value/Growth/Profit/Mom/Quality) Sharpe −0.19 flat** — composite score ตายตาม fundamental เดี่ยว |
| **model51** | Systematic Risk Metrics | 🟡 รอบ 17 | ❌ **idio-vol (unsystematic_risk 1−R² vs SPY) standalone flat (0.14) + CONCENTRATED_WEIGHT fail**. เป็น reversal-weight → returns 0.173 แต่ concentrated + reversal-core (corr เสี่ยง). beta/correlation/systematic_risk fields ก็คาดว่า flat ตาม BAB. fields: `unsystematic_risk_last_{30,60,90,360}_days`, `systematic_risk_last_N`, `beta_last_N_days_spy`, `correlation_last_N_days_spy` |
| **model53** | Creditworthiness Risk | 🟡 รอบ 16 | ❌ **distress anomaly (PD 1m/1y) flat** (−0.14 ถึง 0.18) — credit slow ไม่มี edge daily |
| fundamental7 | Comprehensive Fundamentals | 🟡 **probe รอบ 30-31 — ปิดเคส (แก้รอบ 44: มีขา 1 ตัว)** | MATRIX legs flat: R&D level 0.22, inventory ±0.65 (sign ไม่เสถียร), tax-to-book 0.13. VECTOR ใช้ได้ผ่าน `vec_avg` แต่ anomaly ที่ปลดล็อก flat. **🆕 รอบ 44: ΔR&D intensity (ts_delta 252) = 0.76 sub-ratio 0.47 corr 0.60 — ขาแรกของ dataset ที่ ≥0.7** (level ตาย แต่ delta work) → **จองแล้วใน d5Qz7erx (ตัวที่ 12, รอบ 46)** |
| **fundamental2** | Report Footnotes | 🟢 **ขุดรอบ 29 — ได้ submittable!** | **`O096kVaY` composite (buyback−pension+FV-L2, group_rank sector) Sharpe 1.60 fit 1.08 self-corr 0.43 = queued.** footnote fields coverage ดีกว่าคาด (CONCENTRATED PASS ทุกตัว). ขาเดี่ยว: buyback-level 0.72, pension-funding ±0.78 (sign กลับ), FV-L2 ±1.03 (sign กลับ), SBC 0.25, M&A −0.13, deferred-tax 0.37, doubtful 0.05, buyback-ts_delta 0.01 = standalone อ่อนหมด **ต้อง composite + group_rank** |
| news18→ดูคู่กับ pv1 | | | idea: news×reversal (event-conditioned reversal) |
| univ1 | Universe Dataset | ⚪ metadata | ไม่ใช่ signal source |

## แผนรอบถัดไป (อัปเดต 2026-06-12 รอบ 34)
**สถานะ: ทุก axis ปิดตามหลักฐาน** — tier (EUR/GLB/CHN = 400 ยืนยัน sim จริง) · dataset ใหม่ไม่มี (20 ตัวเดิม) · OS ทั้ง 6 PENDING. **default = OS-monitor; ขุดเมื่อ OS-fail / tier เปิด / field class ใหม่**

### 🔍 VERDICT-PROVENANCE AUDIT (meta-lesson รอบ 33: verdict จาก proxy/field เดียว ≠ probe จริง — analyst4 เคยถูกตีตราผิดแล้วให้ niche #6)
สถานะการ probe จริงของ dataset ที่เหลือ (เรียงตาม prior ถ้าต้องกลับมาขุด):
- ✅ probe จริงแล้ว: pv1, fundamental6, fundamental2 (รอบ 29-30), fundamental7 (30-31), **analyst4 (33 — ได้ P01xQodW)**, **earnings4 (34 — ปิด)**, option6/8/9 (19+32), news18 (8 มุม รอบ 16), model16/51/53 (1-3 field แต่เป็น field หลักของ dataset), pv13 (สแกนรอบ 34 = GROUP fields ล้วน)
- ⚠️ verdict จาก proxy/บางส่วน (ถ้าหา field class ใหม่ให้เริ่มที่นี่): **news12** (0 direct sims — สรุปจาก news18 คนละ vendor; prior ต่ำเพราะ news category ปิดด้วยหลักฐานจริง), **sentiment1/socialmedia8/12** (รอบ 8 ลอง buzz/sentiment level เป็นหลัก — ยังไม่เคยลองด้วย low-TO route + group_rank + recency-weight toolkit ใหม่), **model77/177** (factor library ใหญ่ ลองไป ~6 field)

## DELAY 0 (สำรวจรอบ 18) — ติดกำแพง dual-bar
- **bar โหด: Sharpe ≥2.0, fitness ≥1.3** (vs 1.25/1.0 บน d1)
- **fundamental6 fields ใช้ไม่ได้บน d0** (gross_profit_to_assets = UNKNOWN). fundamental เป็น delay-1-only
- **reversal ตาย** (-ts_zscore(close,5) = 0.77) · **lead-lag pv13 (rel_ret_cust/comp/part/all) มีบน d0 แต่อ่อน** (customer 1.00 smoothed/1.64 raw turnover-locked, อื่นๆ flat) + **returns จิ๋ว 0.01-0.03**
- 🔑 ตัวฆ่า: d0 ต้องการ **Sharpe 2.0 + returns ~0.2 พร้อมกัน** — ไม่มี signal ไหนทำได้. **ปิด d0**

## บทเรียน meta
- **อย่าเปิดรอบด้วยการ tune/combine ของเดิม** — เปิดด้วย dataset-map + **mechanism-map** หา dataset × mechanism ที่ยังว่าง
- options ต้อง TOP500 เสมอ (coverage)
- fundamental เดี่ยวๆ อ่อนหมด — ใช้เป็น weight บน magnitude signal เท่านั้น (และใช้ได้แค่ delay 1)
- ~~"ทางออกเหลือแค่ tier upgrade"~~ → **พิสูจน์แล้วว่าผิด (รอบ 20+23): mechanism ใหม่บน data เดิมให้ submittable ได้อีก** — delay0 ยังปิดจริง (dual-bar) แต่ delay1 ไม่ตันถ้าหา transform ใหม่

## 🆕 goal6 (2026-06-13) — analyst4 = FORECAST-DISTRIBUTION มิติใหม่ (ตัวที่ 21-22) + payout (fundamental6 dividend ตัวที่ 20)
- **analyst4 forecast-distribution SHAPE = niche ใหม่:** Bowley-skew `(high+low−2median)/(high−low)` ของ sales estimates = `zqWekpZO` SPECTACULAR fit 3.56! + standard-skewness `skewness_leading_12m_eps_estimates` = `e7rExEQz` anchor (corr เดี่ยว 0.34). **forecast-shape = 1 niche** (ทุก item/horizon redundant 0.78-0.95) แต่ Bowley≠standard-skew (0.54)=2 ตัว. revision/dispersion/LTG/range-width/forecast-vs-actual = อ่อนหมด
- **fundamental6 dividend-growth = `88LXkq9a` payout niche** (INDUSTRY neut). pv13 diversification (key_sector_total Lang-Stulz) แรง 1.44 แต่ j2go6pmO-locked 0.78
