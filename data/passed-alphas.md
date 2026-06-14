# ✅ Alpha ที่ผ่านเกณฑ์ — Dashboard

> อัปเดตอัตโนมัติโดย `find-alphas` / `tune-alpha` ทุกครั้งที่มีตัวผ่านทุก is.check
> สถานะ: 🟡 queued (รออนุมัติ `/review-candidates`) · 🟢 submitted · ⚪ archived
>
> ⚠️ **แก้ไข 2026-06-10:** ตรวจ API จริง (`get_alpha`) พบว่า **ไม่มีตัวไหน submit สำเร็จเลย** — vRmLQWYA, XgKn5LV8 จริงๆ `status:UNSUBMITTED, dateSubmitted:null, os:null` (submit_status 201 เดิม = เข้าใจผิด). pool ที่ submit จริงดูที่ `knowledge/submitted-pool.md` (9 ACTIVE alphas คนละชุด)

| # | alpha_id | Sharpe | Fitness | Turnover | สถานะ | วันที่ | idea |
|---|----------|--------|---------|----------|-------|-------|------|
| 1 | `vRmLQWYA` | 1.59 | 1.02 | 0.42 | 🟡 passer (ไม่ได้ submit จริง — UNSUBMITTED) | 2026-06-08 | overnight-intraday-reversal |
| 2 | `XgKn5LV8` | 1.89 | 1.00 | 0.57 | 🟡 passer (ไม่ได้ submit จริง — UNSUBMITTED) | 2026-06-08 | volume-price-divergence-signal |
| 3 | `GroeQEpO` | 1.91 | 1.04 | 0.66 | ⚪ archived (self-corr 0.80>0.70) | 2026-06-09 | overnight-reversal-volume-scaled |
| 4 | `QPQYqvAW` | 1.42 | **1.05** | 0.48 | 🟢🟢 **SUBMITTED จริง! (ACTIVE/OS, dateSubmitted ✅, self-corr 0.695, prod-corr 0)** | 2026-06-10 | **MAX-lottery × GP** ⭐ FIRST REAL SUBMIT |
| 5 | `JjdPY5om` | 1.36 | 1.03 | 0.44 | ⚪ redundant (ซ้ำกับ #4 ที่ submit แล้ว) | 2026-06-10 | MAX-lottery × GP (decay 6 variant) |
| 6 | `vRmOzNPz` | 1.46 | 1.03 | 0.48 | ⚪ redundant (ซ้ำกับ #4) — เก็บเป็น backup ถ้า #4 OS fail | 2026-06-10 | MAX-lottery × GP (SUBINDUSTRY, robust กว่า) |
| 7 | `XgK9528a` | **1.56** | **2.29** | 0.16 | 🟢🟢 **SUBMITTED จริง! (ACTIVE/OS, grade EXCELLENT, self-corr 0.419, prod-corr 0)** | 2026-06-11 | **signed-jump-variation / good-bad volatility** ⭐ SECOND REAL SUBMIT |
| 8 | `O096kVaY` | 1.60 | **1.08** | **0.011** | 🟢🟢 **SUBMITTED จริง! (ACTIVE/OS, dateSubmitted 2026-06-11T09:21, self-corr 0.4282, attempts 1)** | 2026-06-11 | **footnote capital-allocation composite (buyback−pension+FV-L2)** ⭐ AXIS ใหม่ รอบ 29 — FIFTH SUBMIT |
| 9 | `P01xQodW` | 1.47 | 1.00 | 0.074 | 🟢🟢 **SUBMITTED จริง! (ACTIVE/OS, dateSubmitted 2026-06-11T15:28, self-corr 0.6153, attempts 1)** | 2026-06-12 | **analyst-expectations composite (2×recency-SUE + recency-guidance + breadth + coverage)** ⭐ niche #6 รอบ 33 — SIXTH SUBMIT |
| 10 | `RRr9Yv9z` | **1.56** | **1.23** | 0.079 | 🟢🟢 **SUBMITTED จริง! (ACTIVE/OS, dateSubmitted 2026-06-11T18:39, self-corr 0.6256, attempts 1)** | 2026-06-12 | **short-positioning + labor composite (DTC + Δm-SIP + hiring, 1:1:1)** ⭐ niche #7 รอบ 36 — SEVENTH SUBMIT |
| 11 | `kqKv0bZg` | **1.58** | 1.02 | 0.052 | 🟢🟢 **SUBMITTED จริง! (ACTIVE/OS, dateSubmitted 2026-06-11T19:02, self-corr 0.3466 ต่ำสุด!, attempts 1)** | 2026-06-12 | **demand-visibility composite (2×backlog + DR-level + 0.5×ΔDR)** ⭐ niche #8 รอบ 38 — EIGHTH SUBMIT |
| 12 | `j2go6pmO` | 1.40 | **1.19** | 0.031 | 🟢🟢 **SUBMITTED จริง! (ACTIVE/OS, dateSubmitted 2026-06-11T19:42, self-corr 0.6842, attempts 1)** | 2026-06-12 | **organization-capital composite (lease + ΔSG&A + 0.75×advertising)** ⭐ niche #9 รอบ 39 — NINTH SUBMIT |
| 13 | `vRmZZalG` | **1.59** | **1.21** | 0.027 | 🟢🟢 **SUBMITTED จริง! (ACTIVE/OS, dateSubmitted 2026-06-11T21:35, self-corr 0.4971, attempts 1)** | 2026-06-12 | **sales-dynamics composite (sales-growth-vol-long + ΔATO)** ⭐ niche #10 รอบ 40 — TENTH SUBMIT 🏁 GOAL COMPLETE |
| 14 | `YPAzrowM` | 1.51 | 1.02 | **0.026** | 🟢🟢 **SUBMITTED จริง! (ACTIVE/OS, dateSubmitted 2026-06-12T09:20, self-corr 0.5005, attempts 1)** | 2026-06-12 | **NOA balance-sheet bloat (Hirshleifer 2004)** ⭐ niche #11 รอบ 44 — ELEVENTH SUBMIT |
| 15 | `d5Qz7erx` | **1.59** | **1.24** | 0.038 | 🟢🟢 **SUBMITTED จริง! (ACTIVE/OS, dateSubmitted 2026-06-12T11:12, self-corr 0.672, attempts 1)** | 2026-06-12 | **cost-structure + earnings-quality composite (OL + GP-surprise-q + ΔR&D + 0.75×torpedo)** ⭐ niche #12 รอบ 45-46 — TWELFTH SUBMIT |
| 16 | `RRrzOrEb` | **1.78** | **1.38** | 0.025 | 🟢🟢 **SUBMITTED จริง! (ACTIVE/OS, dateSubmitted 2026-06-12T15:21, self-corr 0.6033, attempts 1)** | 2026-06-13 | **geographic-revenue-exposure composite (APAC + 0.5×EMEA + 0.75×short-conc-flip)** ⭐ niche #13 รอบ 53 — THIRTEENTH SUBMIT ("ตันผิดครั้งที่ 7") |
| 17 | `d5QokeAK` | 1.53 | 1.13 | 0.035 | 🟢🟢 **SUBMITTED จริง! (ACTIVE/OS, dateSubmitted 2026-06-12T16:27, self-corr 0.6786, attempts 1)** | 2026-06-13 | **globalization momentum (Δ-APAC-exposure 126d)** ⭐ niche #14 goal-mode รอบ 56 — FOURTEENTH SUBMIT |
| 18 | `j2gxLjRj` | 1.51 | 1.01 | 0.013 | 🟢🟢 **SUBMITTED (goal5 #1, attempts 1, corr 0.5565)** | 2026-06-13 | **LatAm-exposure + AOCI** ⭐ niche #15 — FIFTEENTH |
| 19 | `XgKekxb1` | 1.39 | 1.15 | 0.138 | 🟢🟢 **SUBMITTED (goal5 #2, attempts 1, corr 0.2548)** | 2026-06-13 | **options PCR+VRP+DSO @TOP500** ⭐ niche #16 — UNIVERSE AXIS เปิด — SIXTEENTH |
| 20 | `wpePLZbY` | 1.48 | 1.16 | 0.049 | 🟢🟢 **SUBMITTED (goal5 #3, attempts 1, corr 0.3331)** | 2026-06-13 | **Δ-EMEA 126 @TOP500** ⭐ niche #17 — SEVENTEENTH |
| 21 | `akOwONm5` | 1.32 | 1.07 | 0.051 | 🟢🟢 **SUBMITTED (goal5 #4, attempts 1, corr 0.4069)** | 2026-06-13 | **cost-structure @TOP500** ⭐ niche #18 — EIGHTEENTH |
| 22 | `rKWVPLkd` | 1.31 | 1.01 | 0.030 | 🟢🟢 **SUBMITTED (goal5 #5, attempts 1, corr 0.3968)** | 2026-06-13 | **sales-dynamics 2:1 @TOP500** ⭐ niche #19 — NINETEENTH 🏆 GOAL5 COMPLETE |
| 23 | `88LXkq9a` | 1.34 | 1.32 | 0.144 | 🟢🟢 **SUBMITTED (goal6 #1, attempts 1, corr 0.6926)** | 2026-06-13 | **dividend-growth / payout** {INDUSTRY} ⭐ niche #20 — TWENTIETH |
| 24 | `e7rExEQz` | 1.68 | 1.05 | 0.070 | 🟢🟢 **SUBMITTED (goal6 #2, attempts 1, corr 0.541)** | 2026-06-13 | **EPS-forecast standard-skewness × dividend** ⭐ niche #21 — TWENTY-FIRST |
| 25 | `zqWekpZO` | **2.03** | **3.56** | 0.068 | 🟢🟢 **SUBMITTED (goal6 #3, attempts 1, corr 0.54) — SPECTACULAR returns 0.384** | 2026-06-13 | **sales-forecast Bowley-skewness** ⭐ niche #22 — TWENTY-SECOND |
| 26 | `6XE2X1AY` | **2.12** | **2.30** | 0.142 | 🟢🟢 **SUBMITTED (goal6 #4, attempts 1, corr 0.6908)** | 2026-06-13 | **diversification × 10d-reversal** ⭐ niche #23 CROSS-DATA-TYPE INTERPOLATION — TWENTY-THIRD |
| 27 | `vRmowJYa` | 1.63 | 1.24 | 0.181 | 🟢🟢 **SUBMITTED (goal6 #5, attempts 1, corr 0.6097)** | 2026-06-13 | **EBIT-forecast-Bowley × 10d-reversal** ⭐ niche #24 — TWENTY-FOURTH 🏆 GOAL6 5/5 |
| 28 | `88L29o0v` | 1.66 | 1.33 | 0.087 | 🟢🟢 **SUBMITTED (goal6 #6, attempts 1, corr 0.6443)** | 2026-06-13 | **OCF-growth × 10d-reversal** ⭐ niche #25 — TWENTY-FIFTH |
| 29 | `58v2oXbN` | **2.31** | **1.97** | 0.088 | 🟢🟢 **SUBMITTED (goal6 #7, attempts 1, corr 0.6926)** | 2026-06-13 | **inventory-growth × 10d-reversal** ⭐ niche #26 — TWENTY-SIXTH |
| 30 | `58v267EN` | 1.69 | 1.28 | 0.080 | 🟢🟢 **SUBMITTED (goal6d #1, attempts 1, corr 0.6024)** | 2026-06-13 | **UAP unexpected-payables × rev10** ⭐ niche #27 — TWENTY-SEVENTH |
| 31 | `npWX3Qwx` | **2.10** | **1.50** | 0.177 | 🟢🟢 **SUBMITTED (goal6d #2, attempts 1, corr 0.6536)** | 2026-06-13 | **DSO × close-range** ⭐ niche #28 — TWENTY-EIGHTH (close-range = price-niche ที่ 2) |
| 32 | `O09297Wv` | 1.61 | 1.19 | 0.198 | 🟢🟢 **SUBMITTED (goal6d #3, attempts 1, corr 0.6919)** | 2026-06-13 | **asset-turnover × close-range** ⭐ niche #29 — TWENTY-NINTH 🏆 goal(3) COMPLETE |
| 33 | `gJ308ElJ` | **1.64** | **1.49** | 0.127 | 🟢🟢 **SUBMITTED (goal6f, attempts 1, corr 0.5902)** | 2026-06-13 | **GARP relative-growth × close-range** ⭐ niche #30 — THIRTIETH (growth area สด) |
| 34 | `gJ30ZeR0` | **2.03** | **1.58** | 0.150 | 🟢🟢 **SUBMITTED (goal6g, attempts 1, corr 0.6425)** | 2026-06-13 | **capacq capital-acquisition × close-range** ⭐ niche #31 — THIRTY-FIRST |
| 35 | `3qA21AVP` | **1.50** | **1.32** | 0.022 | 🟢🟢 **SUBMITTED (goal6g, attempts 1, corr 0.6714)** | 2026-06-13 | **EPS-growth-RATE Bowley standalone** ⭐ niche #32 — THIRTY-SECOND |
| 36 | `RRrvKXlb` | **1.66** | **1.20** | 0.146 | 🟢🟢 **SUBMITTED (goal6h, attempts 1, corr 0.6104)** | 2026-06-13 | **BVPS-forecast-Bowley × close-range** ⭐ niche #33 — THIRTY-THIRD |
| 37 | `O09222WJ` | **1.64** | 1.00 | 0.230 | 🟢🟢 **SUBMITTED (goal6h, attempts 1, corr 0.6814)** | 2026-06-13 | **FCFPS-forecast-Bowley × VWAP** ⭐ niche #34 — THIRTY-FOURTH (เปิด VWAP cluster) |
| 38 | `N1OG0P5p` | **2.71** | **1.79** | 0.346 | 🟢🟢 **SUBMITTED (/auto-alpha #1, attempts 1, corr 0.647)** | 2026-06-14 | **abnormal-capex × VWAP interpolation** ⭐ niche #35 — THIRTY-FIFTH (bench ปลดผ่าน interpolation) |
| 39 | `58v1R81X` | **2.01** | **1.32** | 0.342 | 🟢🟢 **SUBMITTED (/auto-alpha10 #1, attempts 1, corr 0.6731)** | 2026-06-14 | **analyst-dispersion × VWAP interpolation** ⭐ niche #36 |
| 40 | `Jjdkm6M2` | **2.02** | **1.90** | 0.120 | 🟢🟢 **SUBMITTED (/auto-alpha10 #2, attempts 1, corr 0.6891)** | 2026-06-14 | **intangible-capital-stock × VWAP** (Peters-Taylor) ⭐ niche #37 |
| 41 | `qMXpmXjj` | **2.59** | **1.37** | 0.436 | 🟢🟢 **SUBMITTED (/auto-alpha10 #3, attempts 1, corr 0.6568)** | 2026-06-14 | **altman-health-momentum × close-range** ⭐ niche #38 |
| 42 | `zqWEWEvO` | **2.21** | **1.18** | 0.403 | 🟢🟢 **SUBMITTED (/auto-alpha10 #4, attempts 1, corr 0.6558)** | 2026-06-14 | **employee-productivity-delta × close-range** ⭐ niche #39 |
| 43 | `MPxnpYEn` | **2.36** | **1.30** | 0.356 | 🟢🟢 **SUBMITTED (/auto-alpha10 #5, attempts 1, corr 0.6928)** | 2026-06-14 | **ΔDPO supplier-financing × close-range** ⭐ niche #40 |
| 44 | `RRrolqWz` | **1.76** | **1.42** | 0.120 | 🟢🟢 **SUBMITTED (/auto-alpha10 #6, attempts 1, corr 0.6062)** | 2026-06-14 | **ts_rank(op-margin) × rev10** ⭐ niche #41 — 🆕 ts_rank axis |
| 45 | `qMXp367E` | **2.26** | **1.26** | 0.202 | 🟢🟢 **SUBMITTED (/auto-alpha10 #7, attempts 1, corr 0.6302)** | 2026-06-14 | **ts_rank(-goodwill) × close-range** ⭐ niche #42 |
| 46 | `QPQAoGJK` | **1.94** | **1.82** | 0.140 | 🟢🟢 **SUBMITTED (/auto-alpha10 #8, attempts 1, corr 0.6774)** | 2026-06-14 | **ts_rank(earnings-yield) × rev10** ⭐ niche #43 |
| 47 | `vRmbQegd` | **1.68** | **1.08** | 0.211 | 🟢🟢 **SUBMITTED (/auto-alpha10 #9, attempts 1, corr 0.6823)** | 2026-06-14 | **ts_rank(op-margin,756) × VWAP** ⭐ niche #44 |
| 48 | `78drpgr1` | **1.70** | **1.25** | 0.115 | 🟢🟢 **SUBMITTED (/auto-alpha10 #10, attempts 1, corr 0.6884)** | 2026-06-14 | **ts_rank(NOA) × rev10** ⭐ niche #45 — 🏁 GOAL 10/10 |
| 49 | `qMXJzKrO` | **1.88** | **1.22** | 0.208 | 🟢🟢 **SUBMITTED (/auto-alpha5 #1, attempts 1, corr 0.6874)** | 2026-06-14 | **ts_rank(sales-growth) × close-range** ⭐ niche #46 — growth dim |
| 50 | `2rKovRLb` | **2.05** | **1.08** | 0.254 | 🟢🟢 **SUBMITTED (/auto-alpha5 #2, attempts 1, corr 0.5898)** | 2026-06-14 | **ts_rank(debt-maturity ST-share) × VWAP** ⭐ niche #47 — structural dim (margin 0.11) |
| 51 | `Wjg2gbEo` | **2.02** | **1.16** | 0.196 | 🟢🟢 **SUBMITTED (/auto-alpha5 #3, attempts 1, corr 0.6255)** | 2026-06-14 | **ts_rank(accrual-quality) × VWAP** ⭐ niche #48 — earnings-predictability |
| 52 | `6XELer9J` | **2.03** | **1.27** | 0.203 | 🟢🟢 **SUBMITTED (/auto-alpha5 #4, attempts 1, corr 0.6774)** | 2026-06-14 | **ts_rank(share-dilution) × close-range** ⭐ niche #49 — equity-issuance |
| 53 | `2rKolYox` | **1.91** | **1.11** | 0.211 | 🟢🟢 **SUBMITTED (/auto-alpha5 #5, attempts 1, corr 0.521)** | 2026-06-14 | **ts_rank(deferred-rev) × close-range** ⭐ niche #50 — 🏁 5/5 demand dim (margin 0.18) |

---

## รายละเอียด

### 1. `vRmLQWYA` — overnight-intraday-reversal 🟡 queued
- **expression:** `ts_decay_linear(rank(-(close / open - 1)), 10)`
- **settings:** USA / TOP3000 / delay 1 · SUBINDUSTRY · decay 2 · trunc 0.08
- **metrics:** Sharpe 1.59 · Fitness 1.02 · Turnover 0.42 · Returns 0.174 · Drawdown 0.096
- **ไอเดีย:** หุ้นที่ร่วงระหว่างวัน (close < open) มักเด้งกลับวันถัดไป
- **corr:** self ผ่าน (registry ว่าง) · prod รอเช็คมือ (API 403)
- **เส้นทาง:** base Sharpe 1.77 แต่ turnover 1.08 (fail) → ครอบ `ts_decay_linear(.,10)` ลด turnover เหลือ 0.42 → fitness ผ่าน

### 2. `XgKn5LV8` — volume-price-divergence-signal 🟡 queued
- **expression:** `rank(group_neutralize(-ts_zscore(close, 5) * winsorize(volume / adv20, std=3), subindustry))`
- **settings:** USA / TOP3000 / delay 1 · SUBINDUSTRY · decay 4 · trunc 0.08
- **metrics:** Sharpe 1.89 · Fitness 1.00 · Turnover 0.57 · Returns 0.158 · Drawdown 0.067
- **ไอเดีย:** ราคาขึ้นพร้อม volume ต่ำ = conviction ต่ำ = revert (price-volume divergence)
- **corr:** self ผ่าน (registry ว่าง) · prod รอเช็คมือ (API 403)
- **เส้นทาง:** ผ่านตั้งแต่ตัวแรก — โครงสร้าง 3 ชั้น (ts_zscore price × winsorized volume ratio + group_neutralize) ทำให้ Sharpe สูงและ turnover คุมได้ทันที

### 3. `GroeQEpO` — overnight-reversal-volume-scaled 🟡 queued ⚠️ corr risk
- **expression:** `rank(group_neutralize(-(close / open - 1) * winsorize(volume / adv20, std=3), subindustry))`
- **settings:** USA / TOP3000 / delay 1 · SUBINDUSTRY · decay 7 · trunc 0.08
- **metrics:** Sharpe 1.91 · Fitness 1.04 · Turnover 0.662 · Returns **0.195** · Drawdown 0.066
- **ไอเดีย:** overnight reversal (close/open) ถ่วงน้ำหนักด้วย volume/adv20 — ราคาร่วงระหว่างวันพร้อม volume สูง = แรงขาย uninformed เด้งแรงกว่า
- **เส้นทาง (พิสูจน์ feasibility fix):** ขุดตระกูลที่ชนะ (overnight reversal returns 0.174) × volume → returns พุ่ง **0.195** (สูงสุด) → screen feasibility: ต้องการ TO<0.70 → decay 7 → fit 1.04 ผ่าน. base decay0 TO 0.84 (fail), decay6 fit1.04 TO0.708 (fail นิดเดียว), **decay7 fit1.04 TO0.662 ✅**, decay9 fit1.01
- **⚠️ corr:** self API empty=ผ่าน **แต่มี DNA ร่วมกับ submitted #1 (overnight) + #2 (volume) — ต้องเช็คมือ self/prod corr <0.7 จริงก่อน submit** ถ้าสูง = ซ้ำ ไม่มี value-add
- **❌ ผล /review-candidates 2026-06-09: self-corr 0.805 > 0.70 (ชน wpzLYJVl ฯลฯ) → ผู้ใช้ตัดสินไม่ submit → archived** ยืนยันว่า variant ×volume ของ signal เดิม = corr สูง ไม่ submit ได้

### 4. `QPQYqvAW` — MAX-lottery × GP-profitability ⭐⭐⭐ 🟡 queued (FIRST fitness>1.0 ที่ไม่ใช่ overnight/volume reversal)
- **expression:** `-(kth_element(returns, 42, k=1) + kth_element(returns, 42, k=2) + kth_element(returns, 42, k=3)) * winsorize(gross_profit_to_assets_ratio, std=3)`
- **settings:** USA / TOP3000 / delay 1 · **INDUSTRY · decay 5 · trunc 0.04**
- **metrics:** Sharpe 1.42 · **Fitness 1.05** · Turnover 0.481 · **Returns 0.262** · sub-universe 0.95 · drawdown 0.211 · ผ่านทุก is.check (เหลือ SELF_CORRELATION pending)
- **ไอเดีย (Bali-Cakici-Whitelaw 2011 MAX anomaly):** short หุ้นที่มี **วันบวกสุดขั้ว (top-3 max daily returns ใน 42 วัน)** — lottery-demand ทำให้ overpriced → underperform. ถ่วงด้วย gross-profitability (quality) → mispricing สะอาดขึ้น
- **🔑 เส้นทาง breakthrough:** single-max (k=1) Sharpe 1.71 returns 0.195 แต่ TO 0.84 (fail) → top-2 (k1+k2) TO 0.53 fit 0.89 → **top-3 (k1+k2+k3) ทำ max นิ่ง → TO 0.44-0.48 โดยคง returns 0.26 → fit ทะลุ 1.0** · × GP weight ดัน returns 0.19→0.26 · decay 5-6 sweet spot · trunc 0.04 ลด concentration ดัน Sharpe
- **⚠️ corr:** self-corr ตอน sim = empty (เชื่อไม่ได้). **MAX = single-extreme-day ≠ cumulative reversal ในพูล (ts_mean/ts_sum/ts_zscore returns) → กลไกต่าง corr น่าจะต่ำกว่า GP-reversal (0.90)** แต่ **ต้อง re-check จริงที่ /review-candidates ก่อน submit** (returns ก็มาจาก returns เหมือนกัน เสี่ยงอยู่). prod-corr 403 เช็คมือ
- **ทำไมสำคัญ:** alpha แรกใน 19 รอบที่ทะลุ fitness ceiling 0.96 — เพราะ **MAX เป็น returns source ใหม่ (returns 0.26 สูงสุดของโปรเจกต์)** ไม่ใช่ tune reversal เดิม

### 7. `XgK9528a` — signed-jump-variation / good-minus-bad volatility ⭐⭐⭐ 🟢 SUBMITTED (ตัวที่ 2 ของโปรเจกต์)
- **expression:** `-(ts_sum(power(max(returns,0),2),21) - ts_sum(power(min(returns,0),2),21))` (ไม่มี GP weight)
- **settings:** USA / TOP3000 / delay 1 · **SUBINDUSTRY · decay 4 · trunc 0.04**
- **metrics:** Sharpe **1.56** · Fitness **2.29** · Turnover 0.163 · **Returns 0.352 (สูงสุดของโปรเจกต์)** · sub-universe 1.23 · drawdown 0.280 · grade **EXCELLENT**
- **self-corr 0.4188 · prod-corr 0** — ผ่านทุก check, submit สำเร็จยืนยันด้วย get_alpha (ACTIVE/OS, dateSubmitted 2026-06-10T15:31)
- **ไอเดีย (Bollerslev–Li–Zhao 2020 JFQA "Good Volatility, Bad Volatility"):** แยก realized variance เป็น RS⁺ (Σ positive-day returns²) กับ RS⁻ (Σ negative-day returns²) ใน 21 วัน → **short หุ้นที่ upside-variation ครอบงำ (RS⁺>RS⁻)** เพราะนักลงทุน overpay ต่อ upside potential → underperform; long หุ้นที่ downside-variation ครอบงำ
- **🔑 เส้นทาง:** RSJ แบบ ratio (normalize ด้วย RV) = flat (normalize ฆ่า magnitude) → **ใช้ signed jump เป็น magnitude ดิบ (RS⁺−RS⁻) × GP** ได้ fit 1.95 returns 0.311 แต่ Sharpe 1.24 ตกนิดเดียว → **ลด window 42→21 ดัน Sharpe 1.49** → SUBINDUSTRY 1.56 → **ตัด GP ออก signal ยังผ่าน (1.50→1.56) + orthogonal กว่า**
- **ทำไมสำคัญ:** กลไกใหม่จาก deep research (academic anomaly ที่ registry ไม่เคยแตะ) — **self-corr 0.42 พิสูจน์ว่า orthogonal จริงกับทั้ง MAX และพูล reversal** → ตัวที่ 2 ที่ submit ได้ ลบล้างความเชื่อ "tier ตันหลัง MAX"

### 8. `O096kVaY` — footnote capital-allocation composite ⭐⭐⭐ 🟡 queued (AXIS ใหม่ทั้งแกน — รอบ 29)
- **expression:** `group_rank(authorized_stock_buyback_amount/cap, sector) - group_rank((fnd2_dbplanfvalpnas - fnd2_dbplanbnfol)/assets, sector) + group_rank(assets_fair_value_lvl2/assets, sector)`
- **settings:** USA / TOP3000 / delay 1 · SUBINDUSTRY · decay 10 · trunc 0.04
- **metrics:** Sharpe **1.60** · Fitness **1.08** · Turnover **0.0114** (ต่ำสุดของโปรเจกต์) · Returns 0.057 · sub-universe 1.35 · drawdown 0.033
- **corr:** **self-corr 0.4282** (max vs d57x6Gev value composite — ผ่าน limit 0.7 สบาย) · prod-corr 403 เช็คมือตอน review
- **ไอเดีย:** capital-allocation quality จาก footnote data (fundamental2 — dataset ที่ไม่เคยขุดเลย): long buyback authorization สูง (Ikenberry) − short pension overfunded (Franzoni-Marin sign กลับใน 2019-2023) + long fair-value L2 assets
- **🔑 เส้นทาง breakthrough (หนี 4-dim subspace):** ขาเดี่ยวอ่อนหมด (buyback 0.72 / pension-flip 0.78 / FV-L2-flip 1.03) → composite rank 2 ขา = 1.07 → **group_rank(sector) ดัน Sharpe 1.42-1.46** → เพิ่มขา L2 ใน group form = **1.60/1.08 ผ่าน**. กุญแจ: **low-turnover route** — turnover 0.011 < fitness floor 0.125 → ต้องการ returns แค่ ~0.05 ไม่ใช่ 0.15 (สูตร fitness = sharpe×√(returns/max(TO,0.125)))
- **ทำไมสำคัญ:** alpha แรกที่ **ไม่ใช้ price/returns stream เลย** — fundamental cross-section ล้วน = หนีคอขวด linear-algebra ของ 4 niche ที่จองครบ (พิสูจน์ด้วย self-corr 0.43 ต่ำสุดเทียบเท่า XgK9528a)

### 9. `P01xQodW` — analyst-expectations composite (analyst4) 🟡 queued — รอบ 33
- **expression:** `2*group_rank(recency-SUE, sector) + group_rank(recency-guidance-gap, sector) + group_rank(revision-breadth, sector) + group_rank(coverage-change, sector)` (เต็มดู submit-queue.jsonl)
- **settings:** USA / TOP3000 / delay 1 - SUBINDUSTRY - decay 10 - trunc 0.04
- **metrics:** Sharpe 1.47 - Fitness **1.00 (ติดขอบพอดี — เปราะ)** - Turnover 0.074 - Returns 0.058 - sub-universe 0.69/0.64 - ผ่านทุก is.check
- **corr:** **self-corr 0.6153 (max vs le0AvXl7 intraday-vol)** — ผ่าน 0.70 แต่ margin แคบ ต้อง re-check ตอน /review-candidates - prod-corr 403 เช็คมือ
- **ไอเดีย (4 ขา expectation-revision ล้วน ไม่มี price):** (D′×2) SUE = (actual−median)/std ถ่วง recency 63 วันหลังประกาศ (PEAD, Bernard-Thomas) + (E′) company guidance เทียบ consensus ถ่วง recency (management guidance gap) + (B) revision breadth (up−down)/numest + (F) analyst coverage change 63 วัน (Jegadeesh-Kim initiation)
- **🔑 เส้นทาง:** ขาเดี่ยว D 1.20 / E 0.84 / B 0.74 / F 0.85 → composite ดิบ 1.16-1.27 fitness 0.74-0.79 → **เทคนิคใหม่: recency-weighting ด้วย `max(1 - days_from_last_change(field)/63, 0)` ดัน D 1.20→1.33, E 0.84→1.01** → 2D′+E′+B+F = 1.47/1.00 ผ่าน. weight อื่น (2B, 3D′, ตัด B, decay 5, INDUSTRY, TOP1000) แพ้หมด = peak จริง
- **ทำไมสำคัญ:** niche #6 candidate — analyst-expectations axis (dataset analyst4 ที่ไม่เคยขุดตรง) ผ่าน low-TO route เหมือน O096kVaY และยืนยันว่า "fundamental-event recency-weighting" ใช้ได้ (ต่างจาก event-conditioning บน magnitude ที่ตาย รอบ 27)

### 10. `RRr9Yv9z` — short-positioning + labor composite 🟡 queued — รอบ 36
- **expression:** `group_rank(mdl177_devnorthamericashortsentimentfactor_days_to_cover, sector) - group_rank(mdl77_monchgsip, sector) + group_rank(employee/ts_delay(employee,252) - 1, sector)`
- **settings:** USA / TOP3000 / delay 1 - SUBINDUSTRY - decay 10 - trunc 0.04
- **metrics:** Sharpe **1.56** - Fitness **1.23** - Turnover 0.079 - Returns 0.077 - sub-universe 1.05/0.68 - ผ่านทุก is.check
- **corr:** **self-corr 0.6256** (max vs P01xQodW) - prod-corr 403 เช็คมือตอน review
- **ไอเดีย (3 ขา 1:1:1 — positioning + labor, ทุกขาทิศกลับ literature ใน sample 2019-23):** long days-to-cover สูง (short-squeeze/illiquidity premium) − Δmonthly short interest (shorting flow เพิ่ม = ลบ) + hiring rate (labor growth — flip จาก Belo-Lin-Bazdresch 2014)
- **🔑 เส้นทาง:** (รอบ 35) ค้น field class ใหม่ "short interest" ผ่าน get_data_fields search ข้าม dataset → 2-leg ceiling 1.24/0.94 ขาด 0.01 → (รอบ 36) hiring rate = ขาที่ 3 ข้าม dataset → 2DTC version ผ่าน IS แต่ corr 0.7021 (เกิน 0.0021!) → **corr-bridge diagnosis ด้วย weight perturbation พบ DTC คือ bridge ไป P01xQodW** → ลดเหลือ 1:1:1 = corr 0.6256 PASS + Sharpe ขึ้น 1.40→1.56
- **ทำไมสำคัญ:** niche #7 candidate (positioning/labor — ไม่มี price, ไม่ซ้ำ 6 niche เดิม) + ได้เทคนิค corr-bridge diagnosis ที่ใช้ซ้ำได้ทุกครั้งที่ corr เกินนิดเดียว

### 11. `kqKv0bZg` — demand-visibility composite 🟢 SUBMITTED (ตัวที่ 8) — รอบ 38
- **expression:** `2*group_rank(vec_avg(fnd6_obs)/(sales+1), sector) + group_rank((fnd6_drc+fnd6_drlt)/(assets+1), sector) + 0.5*group_rank(ts_delta(fnd6_drc+fnd6_drlt,63)/(sales+1), sector)`
- **settings:** USA / TOP3000 / d1 - SUBINDUSTRY - decay 10 - trunc 0.04
- **metrics:** Sharpe 1.58 - Fitness 1.02 - TO 0.052 - Returns 0.052 - sub-universe 0.75/0.68
- **corr:** **self-corr 0.3466 (ต่ำสุดของโปรเจกต์!)** - submit attempts 1, dateSubmitted 2026-06-11T19:02:24-04:00
- **ไอเดีย:** long "contracted future demand" — order backlog (flip RSV) + deferred revenue level/growth (Prakash-Sinha) = รายได้ที่ล็อกไว้แล้วที่ตลาด underprice
- **เส้นทาง:** backlog leg bank จากรอบ 37 (in-class ceiling 1.08) → รอบ 38 จับคู่ deferred revenue (level 1.33 + growth 1.37/sub-อ่อน) → weight sweep 5 ตัว: 1:1:1 fitness ผ่าน sub ตก / 2:1:1 sub ตก / **2:1:0.5 = 1.58/1.02/sub 0.75 ผ่านครบ**
- **ทำไมสำคัญ:** niche #8 — theme demand-visibility ไม่มีใน pool เลย (corr 0.35) + พิสูจน์ยุทธศาสตร์ "bank ขาไว้รอคู่"

### 12. `j2go6pmO` — organization-capital composite 🟢 SUBMITTED (ตัวที่ 9) — รอบ 39
- **expression:** `group_rank(lease_minimum_payments_due_total/(assets+1), sector) + group_rank(ts_delta(vec_avg(fnd6_xsgas)/(sales+1),63), sector) + 0.75*group_rank(mdl77_2adverint, sector)`
- **settings:** USA / TOP3000 / d1 - SUBINDUSTRY - decay 10 - trunc 0.04
- **metrics:** Sharpe 1.40 - Fitness 1.19 - TO 0.031 - Returns 0.090 - sub-universe 0.98
- **corr:** self-corr 0.6842 (P01xQodW) / 0.6464 (O096kVaY) - attempts 1, dateSubmitted 2026-06-11T19:42
- **ไอเดีย:** long intangible/organization-capital investment — lease intensity (asset-light expansion) + ΔSG&A ratio (flip = org-capital investment, Eisfeldt-Papanikolaou) + advertising intensity (CLS 2001)
- **เส้นทาง:** ขา lease 1.30 / ΔSGA-flip 1.04 / adv 0.73 → 1:1:1 corr 0.7075 (P01) → ตัด ΔSGA corr ขึ้น (พิสูจน์ไม่ใช่ bridge) → 0.5adv corr ย้ายไป O096 0.7131 (whack-a-mole) → **0.75adv = จุดกึ่งกลาง 0.6842 PASS** + 1.40/1.19
- **ทำไมสำคัญ:** niche #9 + ยกระดับ corr-bridge diagnosis เป็น "interpolation ระหว่าง attractor" (ปลายสองข้างชนคนละตัว → จุดกึ่งกลางหลบทั้งคู่)

### 13. `vRmZZalG` — sales-dynamics composite 🟢 SUBMITTED (ตัวที่ 10 — GOAL COMPLETE!) — รอบ 40
- **expression:** `group_rank(ts_std_dev(ts_delta(sales,63)/(sales+1),504), sector) + group_rank(ts_delta(sales/(assets+1),252), sector)`
- **settings:** USA / TOP3000 / d1 - SUBINDUSTRY - decay 10 - trunc 0.04
- **metrics:** Sharpe 1.59 - Fitness 1.21 - TO 0.027 - Returns 0.072 - sub-universe 0.77/0.69
- **corr:** self-corr 0.4971 (kqKv0bZg) - attempts 1, dateSubmitted 2026-06-11T21:35
- **ไอเดีย:** long sales-growth-volatility สูง (กลับทิศ Dichev-Tang = growth-optionality premium ใน sample 2019-23, flip ตัวที่ 7) + ΔAsset-Turnover (Soliman 2008 DuPont)
- **ทำไมสำคัญ:** niche #10 — sales-dynamics ไม่แตะ price เลย + ขา sales-vol เป็น flip ที่ sub-universe ผ่านในตัว (0.76) ซึ่งหายากมาก

### 14. `YPAzrowM` — NOA balance-sheet bloat 🟢 SUBMITTED (ตัวที่ 11) — รอบ 44 (dateSubmitted 2026-06-12T09:20:37, attempts 1)
- **expression:** `group_rank(-(fnd6_teq + fnd6_newa1v1300_dltt + debt_st - fnd6_mfmq_cheq) / ts_delay(assets, 252), sector)`
- **settings:** USA / TOP3000 / d1 · **INDUSTRY** · decay 10 · trunc 0.04
- **metrics:** Sharpe 1.51 · Fitness 1.02 · TO 0.026 · Returns 0.057 · sub-universe 0.68 (limit 0.65) · DD 0.027
- **corr:** **self-corr 0.5005** (max vs kqKv0bZg 0.50, vRmZZalG 0.48 — ไม่ชน leverage/footnote ตามที่กลัว) · prod-corr 403 เช็คมือตอน review
- **ไอเดีย:** short หุ้น Net Operating Assets สูง (NOA = equity + debt − cash, scaled ด้วย lagged assets) — balance-sheet bloat ที่ investor limited-attention over-extrapolate ความสามารถทำกำไร (Hirshleifer-Hou-Teoh-Zhang 2004 JAE: แรงกว่า accruals 60%)
- **เส้นทาง:** idea r43-noa จาก researcher รอบ 43 → translator ยืนยัน field (fnd6_teq/dltt/debt_st/cheq ครบ) → sim เดี่ยว SUBINDUSTRY = 1.54/1.04 แต่ sub-universe 0.64/0.67 (near-miss) → **เช็ค self-corr ฟรีก่อน tune (เทคนิครอบ 43) = 0.5284 สะอาด → คุ้ม tune** → sweep รอบเดียว: INDUSTRY neut = sub 0.68 ผ่านครบ (ΔNOA form อ่อนกว่า level 1.22/0.76, group=industry fit 0.95 ไม่ถึง)
- **ทำไมสำคัญ:** niche #11 candidate (balance-sheet-bloat — ไม่มีใน pool 19 ตัว, fundamental ขาเดี่ยว standalone ที่ผ่านครบโดยไม่ต้อง composite = หายากมาก, ตัวแรกตั้งแต่ gJPqnv6J leverage) + ทันก่อน IQC freeze ปลายมิ.ย.

### 15. `d5Qz7erx` — cost-structure + earnings-quality composite 🟢 SUBMITTED (ตัวที่ 12) — รอบ 45-46 (dateSubmitted 2026-06-12T11:12:04, attempts 1)
- **expression:** `group_rank((cogs + sga_expense)/(assets+1), sector) + group_rank(ts_delta((sales - cogs)/(assets+1), 63), sector) + group_rank(ts_delta(fnd7_ointfund_qdrx/assets,252), sector) + 0.75*group_rank(snt1_d1_earningstorpedo, sector)`
- **settings:** USA / TOP3000 / d1 · SUBINDUSTRY · decay 10 · trunc 0.04
- **metrics:** Sharpe 1.59 · Fitness 1.24 · TO 0.038 · Returns 0.077 · sub-universe 0.87 (limit 0.69) · DD 0.101
- **corr:** **self-corr 0.672** (max vs vRmZZalG; j2go6pmO 0.664 หลังลด torpedo) · prod-corr 403 เช็คตอน review
- **ไอเดีย (4 ขา 4 กลไก):** long operating-cost intensity (Novy-Marx 2011 operating leverage — cost rigidity premium) + GP surprise รายไตรมาส (Chiu-Haight — quarterly Δ(GP/assets,63)) + ΔR&D intensity (Eberhart 2004) + 0.75× earnings-torpedo (sentiment1 analyst risk signal)
- **🔑 เส้นทาง:** ขาเดี่ยว OL 1.16 (corr 0.35!) / GPq 1.09 → 2-leg 1.42/0.90 → 3-leg +ΔRD 1.38/0.94 ติด ceiling (recency/weight/decay ไม่ช่วย) → ขา 4 torpedo = 1.58/1.26 แต่ corr 0.709 (เกิน 0.009) → **weight-perturbation diagnosis (ครั้งที่ 2 ของโปรเจกต์): ลด OL → corr ขึ้น 0.7166 (OL=diluter), ลด torpedo → corr ลง 0.672 (torpedo=bridge ไป j2go6pmO)** → 0.75×torpedo ผ่าน + Sharpe ขึ้น 1.59
- **ทำไมสำคัญ:** niche #12 candidate + พิสูจน์ (1) GPq quarterly ไม่โดน GPA-absorption (จำกัด scope กฎเดิม) (2) sentiment1 ใช้ได้ 1 ขาแบบ down-weighted (3) perturbation diagnosis ใช้ซ้ำได้จริง

### 16. `RRrzOrEb` — geographic-revenue-exposure composite 🟢 SUBMITTED (ตัวที่ 13) — รอบ 53 (dateSubmitted 2026-06-12T15:21:36, attempts 1)
- **expression:** `group_rank(asia_pacific_sales_exposure, sector) + 0.5*group_rank(emea_sales_exposure, sector) + 0.75*group_rank(mdl177_5shortsentimentfactor_conc_ratio, sector)`
- **settings:** USA / TOP3000 / d1 · SUBINDUSTRY · decay 10 · trunc 0.04
- **metrics:** Sharpe **1.78** · Fitness **1.38** · TO 0.025 · Returns 0.075 · **sub-universe 1.06** (limit 0.77) · DD 0.038
- **corr:** **self-corr 0.6033** (max vs j2go6pmO — margin 0.10 กว้างสุดในรอบหลัง) · prod-corr 403 เช็คตอน review
- **ไอเดีย:** long หุ้นที่รายได้ผูกกับ Asia-Pacific (+EMEA รอง) = geographic revenue mix premium ช่วง 2019-23 + ขา short-interest concentration (flip) เป็นตัวเสริม — **มิติ "ภูมิศาสตร์รายได้" ไม่มีใน pool 21 ตัวเลย**
- **🔑 เส้นทาง (จาก "ตันสนิท" → passer ใน 10 sims):** ผู้ใช้สั่งลุยต่อ → deep-research + probe field ที่เคยเห็นรอบ 47 แต่ข้ามเพราะ "hypothesis อ่อน" → APAC solo ผ่าน IS ครบแต่ corr 0.7128 (j2go6pmO — multinational-intangible factor) → **EMEA เป็น diluter จริง (0.6709) แต่ sub ตก** → UTB ระเบิด corr 0.8844 (UTB ก็ multinational!) → **conc-flip = ตัวปิดเกม: dilute corr ต่อ (0.6033) + เสริม Sharpe (1.78) + sub พุ่ง (1.06)**
- **ทำไมสำคัญ:** (1) พิสูจน์ว่า "field เห็นแล้วข้ามเพราะ hypothesis อ่อน" = จุดบอดชนิดใหม่ — probe 1 sim ถูกกว่าทุกการคาดเดา (2) เข้าใจ j2go6pmO attractor ลึกขึ้น = "multinational-intangible factor" (APAC/lease/adv/UTB คือบริษัทกลุ่มเดียวกัน) (3) ขา 0.6-0.7 ที่ "ไม่ถึงเกณฑ์" (EMEA, conc-flip) มีบทบาทเป็น corr-diluter + sub-booster ได้

### 17. `d5QokeAK` — globalization momentum (Δ-APAC exposure 126d) 🟢 SUBMITTED (ตัวที่ 14) — goal-mode รอบ 56 (dateSubmitted 2026-06-12T16:27:20, attempts 1)
- **expression:** `group_rank(ts_delta(asia_pacific_sales_exposure, 126), sector)`
- **settings:** USA / TOP3000 / d1 · SUBINDUSTRY · decay 10 · trunc 0.04
- **metrics:** Sharpe 1.53 · Fitness 1.13 · TO 0.035 · Returns 0.069 · sub-universe 0.90 (limit 0.66) · DD 0.061
- **corr:** **self-corr 0.6786** (max vs j2go6pmO — ⚠️ margin แคบ 0.021) · vs RRrzOrEb (level-form) แค่ **0.6032** · prod-corr 403
- **ไอเดีย:** long บริษัทที่ "กำลังขยาย" เข้า Asia-Pacific (สัดส่วนรายได้ APAC เพิ่มใน 6 เดือน) = globalization/expansion drift — delta ≠ level (RRrzOrEb = ใครอยู่เอเชียมาก, ตัวนี้ = ใครกำลังเข้าเอเชีย)
- **เส้นทาง (goal-mode, 7 sims):** Δ-APAC 252d = 1.33/0.97 near-miss → window 126d = ผ่านครบ + sub พุ่ง 0.90 · Δ-EMEA dilute ใช้ไม่ได้บน delta (corr พุ่ง 0.7375 — ตรงข้าม level!) · LatAm/auth_rank legs อ่อน
- **⚠️ จุดต้องดูตอน review:** corr margin 0.021 — ถ้า finalize ขยับเกิน corr-guard จะกันเอง
