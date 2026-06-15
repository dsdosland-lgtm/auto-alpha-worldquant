# /auto-alpha 1 — 2026-06-15

submitted: 1
queued: 0

## ผลสรุป
หา + **submit สำเร็จ 1 ตัว** (N=1 GOAL COMPLETE) — project #57, pool → 57 ของเรา (66 ACTIVE รวม team 9)

| alpha_id | กลไก | Sharpe | fit | TO | self-corr | สถานะ |
|---|---|---|---|---|---|---|
| `QPQxwbb5` | ts_zscore(inventory-turnover cogs/inventory) × **rev60** | 1.62 | 1.24 | 0.078 | **0.5981** (margin 0.10) | ✅ ACTIVE/OS, dateSubmitted 2026-06-15T01:18:05, attempts 1 |

expression: `2*group_rank(ts_zscore(cogs/(inventory+1), 252), sector) + rank(-ts_delta(close,60))` {USA TOP3000 d1 INDUSTRY decay2 trunc0.08}

## 🔑 BREAKTHROUGH #12 — rev60 = price-niche ที่ 4
**rev10 price-niche cluster อิ่มเต็ม (~10 สมาชิก)** — fresh fundamental × rev10 ทุกตัวชน 0.73-0.88:
- inventory-turnover → #41 op-margin 0.73-0.76 (ทุก construction: ts_rank 0.728, ts_zscore 0.758)
- quick-ratio liquidity → #45 NOA 0.836
- GP/SGA efficiency → #41 op-margin 0.88 (profitability-flavored = dim booked)

**ทางหลุด = price-niche horizon ใหม่:** `rank(-ts_delta(close,60))` (3-month reversal) — TO ต่ำ 0.078 + cross-section ต่าง rev10 → corr ร่วง 0.73→0.60. (rev20 อ่อน S 1.0-1.1; close-range/VWAP fitness-fail เพราะ TO สูงสำหรับ core กลางๆ)

**ts_zscore construction lever:** boost Sharpe inventory 1.45 (ts_rank) → 1.91 (ts_zscore) — construction axis ที่ ⊥ group_rank/ts_rank pool

## เส้นทาง (~22 sims)
1. fresh dims 3 ตัว (cash/GP-SGA/inventory ts_rank × price) → ทั้งหมด near-miss fitness (returns bottleneck)
2. cash-holdings → sub-universe 0.63 FAIL (อ่อน large-cap); GP/SGA tune decay2 → fit 1.02 ผ่าน IS **แต่ corr 0.88 vs #41 (profitability dim booked)** — pivot
3. inventory-turnover × rev10 decay2 → fit 0.95 / corr 0.728 (เฉียดทั้งคู่) — fund-heavy ลด returns→fit ตก; niche-switch close-range/VWAP fitness-fail
4. leverage ts_rank → S 1.00 FAIL; quick-ratio liquidity × rev10 → corr 0.836 vs #45 NOA
5. 🔑 **ts_zscore boost + rev60 niche:** inventory ts_zscore × rev60 → 1.62/1.24 **corr 0.598** ✅ submit; close-range version 0.7176 (close-range cluster อิ่ม)

## dim/niche ปิดเพิ่มรอบนี้
- GP/SGA = profitability-booked (#41) · cash-holdings = sub-fail · leverage ts_rank = S<1.25 · liquidity = NOA-load (#45)
- rev10 cluster = อิ่มเต็ม (~10); rev20 = อ่อน; close-range/VWAP = fitness-fail สำหรับ mid-core

## เปิดต่อ (vein ใหม่)
- **rev60-niche ว่าง** → pair กับ fresh core อื่นได้ (combine-additive reversal)
- horizon อื่น: rev90/rev120
- **ts_zscore × fresh fundamental** = construction lever ใหม่ (boost Sharpe)
