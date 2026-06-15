# /auto-alpha8 Run Report — 2026-06-15

submitted: 1
queued: 0

## สรุป

| # | alpha_id | dim | Sharpe | Fitness | Sub | Corr | Binding | Expression |
|---|----------|-----|--------|---------|-----|------|---------|------------|
| 71 | `XgKdrnr8` | TAX-ETR-VOLATILITY | 1.87 | 1.13 | 1.04 | 0.6548 | qMXJzKrO #46 | `2*group_rank(-ts_rank(ts_std_dev(income_tax/(abs(pretax_income)+1), 756), 252), sector) + rank(-(close-low)/(high-low+0.001))` |

- **Settings:** USA / TOP3000 / delay1 / INDUSTRY / decay4 / trunc0.08
- **dateSubmitted:** 2026-06-15T11:04:18-04:00
- **attempts:** 1
- **Corr margin:** 0.0452 (limit 0.70, max 0.6548 vs qMXJzKrO #46 sales-growth)
- **⚠️ UNITS warning** (ratio of fundamentals — does NOT block IS/submit)

## กลไก

**TAX-ETR-VOLATILITY (Tucker-Zarowin 2006 applied to tax channel):**
- ETR = `income_tax / (abs(pretax_income) + 1)` = effective tax rate, robust to sign of pretax_income
- ts_std_dev(ETR, 756d) = 3-year ETR volatility = how stable is the tax rate?
- ts_rank(-ETR_vol, 252d) = LONG companies where ETR volatility is currently LOW vs own 252d history
- Interpretation: STABLE tax rate over 3yr → quality tax management → alpha (contrarian: avoid companies with erratic tax expense)
- Price leg: close-range reversal `-(close-low)/(high-low)` at 2:1 weight

**ทำไมหลุด pool:**
- ETR-vol 2nd-order (std_dev of ratio → ts_rank) ≠ BTD #58 (book-tax GAP level/flow)
- ETR-vol ≠ ETR-level (dead: ts_rank(ETR,252) Sharpe 1.07 sub-fail large-cap = Vk8AV68M)
- ETR-vol ≠ earnings-smoothing #67 (NI-vol/CFO-vol ratio — different financial channel)
- Binding: #46 sales-growth (qMXJzKrO) at 0.6548 — both use close-range + INDUSTRY, overlap at top level only

## sims ที่ล้มเหลว (7 sims pre-submit)

| sim_id | expr ย่อ | ผล | หมายเหตุ |
|--------|---------|-----|---------|
| RRrGRXMb | ATO ts_zscore × rev60 | REDUNDANT 0.7898 | binding QPQxwbb5 #57 (inv-turnover rev60) — efficiency cluster |
| 0m81mRdr | ATO ts_zscore × close-range | REDUNDANT 0.7793 | binding qMXJzKrO #46 (sales-growth close-range) |
| xAnJOnRw | PP&E turnover ts_zscore × rev60 | REDUNDANT 0.7393 | binding QPQxwbb5 #57 — fixed-capital = same efficiency cluster |
| qMXQ9Ojj | PP&E turnover ts_zscore × VWAP | REDUNDANT 0.8303 | binding vRmbQegd #44 (op-margin VWAP) — profitability dim |
| Vk8AV68M | ETR simple ts_rank × rev60 | IS FAIL S 1.07 fit 0.70 | ETR level weak signal large-cap (sub-fail pattern) |
| LLR0jVqM | Pension PBO growth × close-range | IS FAIL S 1.19 fit 0.67 | UNITS; sparse pension data TOP3000 |
| rKWZ30Wd | PP&E Intensity ts_rank × VWAP | REDUNDANT 0.7863 | binding N1OG0P5p #35 + O09297Wv #29 — investment-cluster |

**ปิดเคส (อย่าลองซ้ำ):**
- ⛔ ATO ts_zscore — ทุก niche ปิด (rev60/close-range/VWAP ทดสอบครบ)
- ⛔ PP&E turnover ts_zscore — ทุก niche ปิด (rev60/VWAP ทดสอบครบ; close-range ชน #57 analogous)
- ⛔ PP&E intensity ts_rank — ทุก niche ปิด (VWAP ทดสอบ; investment-cluster binding)
- ⛔ ETR simple level ts_rank — weak (IS FAIL สม่ำเสมอ)
- ⛔ Pension PBO data — sparse TOP3000

## Pool หลัง submit

- ACTIVE alphas: **80** (9 ตัวเดิม + 71 ของเรา)
- OS ยัง PENDING ไม่มี FAIL
- สถานะทั้งหมด: 71 ตัว submitted จาก /auto-alpha series

## dim เปิดต่อ (สำหรับ /auto-alpha9)

Accounting-quality / TAX channel ยังลึก (ETR-volatility ปิด แต่ channel อื่นใน tax vein ยังเปิด):
1. **tax-loss-carryforward recency** (ถ้า field มี) — ต่างจาก BTD/ETR-vol
2. **governance-quality** (board independence / ISS score / institutional ownership)
3. **analyst forecast error / revision momentum** — fresh construction axis
4. **researcher batch** หา fresh dim จาก accounting/governance literature (เพราะ efficiency cluster ปิดสมบูรณ์แล้ว)
5. **NICHE-RESCUE บน dim ที่ corr-fail รอบก่อน** — ตรวจ mechanism-map ว่า dim ไหน 0.70-0.75 บน niche หนึ่ง ยังไม่ลอง niche อื่น
