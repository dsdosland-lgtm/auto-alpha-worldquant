# /auto-alpha 5 — Report (2026-06-15)

submitted: 5
queued: 0

**Pool: 61 → 66 ของเรา (75 ACTIVE รวม 9 baseline). attempts=1 ทุกตัว. OS ทั้งหมด PENDING ไม่มี FAIL.**

## ตัวที่ submit (5/5)

| # | alpha_id | กลไก | dim | Sharpe/fit | self-corr (binding) |
|---|----------|------|-----|-----------|---------------------|
| 62 | `e7rjgA8J` | cost-of-debt `interest_expense/(ST+LT debt)` ts_rank × close-range | STRUCTURAL credit-pricing | 2.27/1.34 | 0.613 (#38) |
| 63 | `mLXv2qj9` | abnormal-depreciation `D&A/PPE` ts_rank × VWAP (1:1) | STRUCTURAL accounting-policy | 2.16/1.10 | 0.6616 (#47) |
| 64 | `j2g7dQW9` | SGA-cost-stickiness `(ΔSGA%/ΔSales%)` ts_rank × rev60 (3:1) | cost-behavior asymmetry | 1.71/1.26 | 0.6653 (d57x6Gev) |
| 65 | `KPL1YP2g` | special-items `spi/assets` ts_rank × close-range | EARNINGS-QUALITY transitory | 1.84/1.00 | 0.674 (#39) |
| 66 | `6XEkqw1O` | foreign-income-share `pifo/pretax` ts_rank × VWAP (3:1) | FOREIGN-OPERATIONS | 2.28/1.76 | 0.6792 (#36) |

ทุกตัว {USA TOP3000 delay1 · INDUSTRY · decay4 · trunc0.08}.

## กลไก/บทเรียนหลัก
- 🔑🔑 **NICHE-RESCUE pattern (พิสูจน์ซ้ำหลายตัว):** fresh dim ที่ corr-fail / fit-fail บน niche หนึ่ง → หลุดบน niche อื่น
  - special-items: rev10 **0.786** (ชน #45 NOA, rev10 saturated ~10) → close-range **0.674**
  - cost-of-debt: rev60 fit **0.87** (returns ต่ำ) → close-range fit **1.34**
  - foreign-income: rev60 **0.728** / VWAP-2:1 **0.714** (multinational tilt #36/j2go6pmO) → fund-heavy 3:1 **0.679**
- 🔑 **abnormal-depreciation (D&A/PPE flow) ≠ asset-age #60 (accum-deprec stock)** — mutual แค่ 0.59; depreciation มี 2 facet orthogonal (flow rate vs stock age). price-heavy 1:1 fix sub
- 🔑 **SGA-cost-stickiness = (ΔSGA%/ΔSales%) ratio-of-changes 2nd-order** (Anderson-Banker) — construction เดียวกับ DOL #56 แต่คนละ numerator → fresh
- 🔑 **rev60 อิ่มขึ้น (3 members #57/#59/#64)** — member ใหม่ที่ 2:1 ชน price-leg ~0.72, ต้อง **fund-heavy 3:1 dilute**
- 🔑 **same-niche stacking ของเราเองได้** ถ้า dim ต่าง: close-range(#62,#65) / VWAP(#63,#66) — มี submitted แล้ว mutual ไม่ทะลุ (re-probe ตอน submit ยืนยัน)

## ปิดเคส (อย่าลองซ้ำ)
- ⛔ cash-ETR (txpd/pretax) sub-fail 0.49 + corr 0.753 · deferred-tax-balance dead 0.79 · REM-discretionary-SGA dead 0.77
- ⛔ inventory-finished-goods ratio — fitness stuck 0.82-0.90 ทุก weight/construction (ts_rank/ts_zscore/1:1/2:1)
- ⛔ CCC-cycle-VOLATILITY (2nd-order working-cap) corr 0.724 = operating-volatility dim ชน #48 accrual-variance / #35 abnormal-capex
- ⛔ pension funded-status ts_rank fit 0.72 (overlaps O096kVaY) · acquired-intangibles other-assets dead 0.49

## efficiency
- 19 sims → 5 submits (26% hit). researcher 2 batch (22 cores) = engine ของ fresh dim
- corr-first + free get_self_correlation บน near-miss = เลือก niche/weight ที่ margin หนาก่อน submit (cost-of-debt/foreign-income ใช้ corr-read ตัดสินใจย้าย niche)

## เปิดต่อ
- accounting-quality/structural ยังลึก: lease-duration (mrc fields), conservatism C-score, supply-chain, governance — researcher backlog ยังเหลือ
- fresh dim × niche อื่นที่ corr-fail บน niche แรก (NICHE-RESCUE) · OS-monitor (66 ตัว PENDING)
