# Run Report — 2026-06-14 /goal /auto-alpha 10 — 🏁 10/10 COMPLETE

queued: 0
submitted: 10

## ผล: submit 10/10 (project #36-45) — ทุกตัว attempts 1, corr 0.606-0.693, IS แข็ง
| # | alpha_id | กลไก | Sharpe/fit | corr | vein |
|---|----------|------|-----------|------|------|
| 36 | `58v1R81X` | analyst-dispersion × VWAP | 2.01/1.32 | 0.673 | interpolation-opinion |
| 37 | `Jjdkm6M2` | intangible-capital-stock (Peters-Taylor) × VWAP | 2.02/1.90 | 0.689 | strong fresh core |
| 38 | `qMXpmXjj` | altman-health-Δ × close-range | 2.59/1.37 | 0.657 | Δ-trajectory |
| 39 | `zqWEWEvO` | employee-productivity-Δ × close-range | 2.21/1.18 | 0.656 | Δ-trajectory |
| 40 | `MPxnpYEn` | ΔDPO × close-range | 2.36/1.30 | 0.693 | Δ-trajectory |
| 41 | `RRrolqWz` | **ts_rank(op-margin,252) × rev10** | 1.76/1.42 | 0.606 | **ts_rank** |
| 42 | `qMXp367E` | **ts_rank(-goodwill,504) × close-range** | 2.26/1.26 | 0.630 | **ts_rank** |
| 43 | `QPQAoGJK` | **ts_rank(earnings-yield) × rev10** | 1.94/1.82 | 0.677 | **ts_rank** |
| 44 | `vRmbQegd` | **ts_rank(op-margin,756) × VWAP** | 1.68/1.08 | 0.682 | **ts_rank** |
| 45 | `78drpgr1` | **ts_rank(NOA) × rev10** | 1.70/1.25 | 0.688 | **ts_rank** |

## 🔑🔑🔑 BREAKTHROUGH #11: ts_rank CONSTRUCTION AXIS (ปลด '5/10 ตัน' → 10/10)
- **`group_rank(ts_rank(<ratio>, window), sector) + rank(<price>)`** — ts_rank (temporal-percentile, เทียบประวัติตัวเอง) **⊥ group_rank pool ทั้งแผง (corr 0.4-0.6)** เพราะ pool เป็น group_rank (cross-sectional) ทั้งหมด = signal คนละแกน
- 1 fundamental ให้หลาย alpha ผ่าน **window (252/504/756) + price-niche + sign** variant; strong ts_rank dim = profitability/investment/earnings-yield/NOA
- ⚠️ ts_rank ก็มี dim-cluster (ROA/GP/earnings-level redundant op-margin 0.88-0.92)

## ⛔ META-LESSON: สรุป 'ตัน 5/10' ผิด (ครั้งที่ 11) — ลืม construction-axis
**ก่อนสรุปตัน เช็ค 4 axis:** (1) fundamental-dim (2) price-niche (3) **construction (group_rank ↔ ts_rank ↔ ts_zscore ↔ ts_av_diff)** (4) cross-section (region/delay/universe). หยุดที่ axis เดียว = สรุปตันผิด

## บทเรียนรอบนี้ครบ
- **Δ-trajectory vein (#38-40):** Δ(ratio)YoY ของ fundamental ที่ LEVEL ตาย/จอง → หนี level-attractor
- **interpolation (#36-37):** opinion-core (dispersion) + strong fresh core (intangible Peters-Taylor) × price
- **ts_rank (#41-45):** construction-axis ใหม่
- **closed จริง (พิสูจน์):** tier USA-only (ASI/JPN/KOR/EUR/CHN/GLB ปิด) · delay0 (field จำกัด+ชน) · TOP500-native (อ่อน) · vector_neut (residual load broad factor) · options/seasonality (อ่อน)

## งานรอบนี้: ~150 sims · pool 54 ACTIVE (45 ของเรา) · integrity 45==45
