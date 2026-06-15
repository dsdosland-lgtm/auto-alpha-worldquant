# /auto-alpha 4 — Report (2026-06-15)

submitted: 4
queued: 0

**Pool: 57 → 61 ของเรา (70 ACTIVE รวม 9 baseline). attempts=1 ทุกตัว, OS ทั้งหมด PENDING ไม่มี FAIL.**

## ตัวที่ submit (4/4)

| # | alpha_id | กลไก | dim | Sharpe | fit | sub | self-corr (binding) |
|---|----------|------|-----|--------|-----|-----|---------------------|
| 58 | `O093YWl1` | Book-Tax-Difference `(pretax*0.21−income_tax)/assets` ts_rank × close-range | **TAX** (fresh vein) | 2.62 | 1.61 | 1.63 | **0.5576** (margin 0.14, #38) |
| 59 | `1YgMbrzJ` | REM-overproduction `(cogs+Δinv)/sales` ts_rank × rev60 | earnings-quality | 1.88 | 1.46 | 0.84 | 0.6282 (#57 rev60) |
| 60 | `LLRQjVO6` | Asset-age `(ppegt−ppent)/ppegt` ts_rank × VWAP | STRUCTURAL | 1.79 | 1.08 | 1.18 | 0.6747 (margin 0.025, #36) |
| 61 | `akOpv98R` | Sloan total-accruals `(income−cashflow_op)/assets` ts_rank × VWAP | earnings-quality | 1.89 | 1.02 | 1.04 | 0.6686 (#53) |

ทุกตัว {USA TOP3000 delay1 · INDUSTRY · decay4 · trunc0.08}.

## กลไก/บทเรียนหลัก
- 🔑🔑 **TAX DIMENSION = vein ใหม่ทั้งแผง** (absent จาก pool 100%). **form สำคัญ:** ETR (income_tax/pretax) **sub-fail large-cap (0.49)** แต่ **BTD/assets (book-tax gap ÷ assets) spectacular 2.62**. tax-loss-carryforward dead (0.74).
- 🔑 **asset-age = accumulated-depreciation ratio works (depreciation channel); PP&E-tangibility LEVEL (ppent/assets) ตาย 0.54.**
- 🔑 **Sloan (NI−CFO)/assets + VWAP ปลด** — net-income numerator + price-niche ≠ registry-เก่า Sloan(op_income−CFO) fit 0.91 ≠ accrual-variance #48 (construction/niche differentiate).
- **REM 2nd rev60 member:** ชน #57 ผ่าน price-leg → fund-heavy 2:1 dilute (1.5:1=0.682 → 2:1=0.628; 2.5:1 sub-fail). VWAP ซ้อน 2 ตัว (#60+#61) ได้เพราะ fund dim ต่าง.

## ปิดเคส (อย่าลองซ้ำ)
- ⛔ **rev90 = TOO SLOW dead** (Sharpe 1.15 returns collapse) — rev60 = slow-reversal limit.
- ⛔ **net-payout-yield (Boudoukh) NOT orthogonal** — /cap raw ชน price-cluster #23 (0.821), /assets ts_rank ชน #55 CFO/assets (0.776 — cash-out correlates cash-flow family).
- ⛔ **special-items intensity × rev10 ชน #45 NOA (0.786)** — rev10 cluster saturated ~10 (dim อาจ fresh บน niche อื่น).
- ⛔ debt-to-PPE collateral-leverage (fit 0.63), CFO/total-debt rev60 (ชน #57 0.70).

## efficiency
- 16 sims → 4 submits (25% hit). researcher (web-literature, 12 cores) เป็นแหล่ง fresh dim (tax/REM/Sloan/special-items/net-payout).
- corr-first screen + free get_self_correlation บน variant ที่ผ่าน IS = ประหยัด sims (เลือก fund-weight/niche ที่ margin หนาก่อน submit).

## เปิดต่อ
- tax sub-dim อื่น (deferred-tax, cash-ETR ผ่าน txpd) · accounting-quality fresh dim × niche ที่ไม่ใช่ rev10 · researcher batch ใหม่ (governance/supply-chain ยังไม่ได้ probe).
