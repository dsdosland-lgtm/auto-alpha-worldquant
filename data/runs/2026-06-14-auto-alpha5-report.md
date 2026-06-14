# Run Report — 2026-06-14 /auto-alpha 5 — 🏁 5/5 COMPLETE

queued: 0
submitted: 5

## ผล: submit 5/5 (project #46-50) — ทุกตัว attempts 1, corr 0.52-0.69, ทั้งหมด ts_rank vein
| # | alpha_id | กลไก (มิติใหม่) | Sharpe/fit | corr |
|---|----------|------|-----------|------|
| 46 | `qMXJzKrO` | ts_rank(sales-growth) × close-range — growth | 1.88/1.22 | 0.6874 |
| 47 | `2rKovRLb` | ts_rank(debt-maturity ST-share) × VWAP — structural | 2.05/1.08 | **0.5898** |
| 48 | `Wjg2gbEo` | ts_rank(accrual-quality variance) × VWAP — earnings-predictability | 2.02/1.16 | 0.6255 |
| 49 | `6XELer9J` | ts_rank(share-dilution) × close-range — equity-issuance | 2.03/1.27 | 0.6774 |
| 50 | `2rKolYox` | ts_rank(deferred-rev) × close-range — demand | 1.91/1.11 | **0.521** |

## 🔑 บทเรียนรอบนี้ (ยืนยัน skill เวอร์ชันใหม่ทำงาน)
1. **ts_rank vein ยังลึก** — หลัง auto-alpha10 ใช้ 5 ตัว (profitability/investment/NOA) ยังเหลือ fresh dim อีกเพียบ
2. 🔑 **fresh STRUCTURAL/quality/equity-issuance/demand dim = หลุดสะอาด 0.52-0.69** (debt-maturity 0.59, deferred-rev 0.52); **investment/profitability dim ชน 0.74-0.88** (rd-cap/capacity-util/cash-to-debt) เพราะ load booked factor
3. 🔑🔑 **CONSTRUCTION-axis differentiate จริง:** group_rank vs ts_rank ของ fundamental เดียวกัน = orthogonal ได้ (deferred-rev: kqKv0bZg group_rank vs #50 ts_rank = **0.52**!). **แต่ window ต่างใน construction เดียวกันไม่หลุด** (debt-maturity ts_rank 504 ชน 252 = 0.83) → **1 fundamental × 1 construction = 1 alpha**
4. **researcher web-literature = engine หลัก** — 2 batch (20 cores) → debt-maturity/accrual/share-dilution + deferred-rev (ผมเอง). fresh dim ต้องการ literature-mining
5. **skill เวอร์ชันใหม่ทำงานตามออกแบบ:** เริ่ม ts_rank/Δ-trajectory ทันที (vein 2-3 first-class), researcher background-batch, ไม่เสีย sim กับ DON'T-BOTHER list

## ❌ ที่ลองแล้วชน/อ่อน
- investment-dim ts_rank: rd-cap (0.74 ชน #35), asset-growth (0.70 ชน GARP/DPO), capacity-util (0.76 ชน #41), cash-to-debt (0.88 redundant NOA#45), goodwill-level (ตาย)
- weak cores: rd-productivity/advertising/BTD/pension/sales-predict-CV/cash-holdings/tax-burden (fit 0.5-0.98)
- net-WC composite ชน inventory#26 0.72

## ~50 sims · pool 50 ของเรา / 59 ACTIVE · integrity 50==50
