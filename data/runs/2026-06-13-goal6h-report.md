# Run Report — 2026-06-13 goal6h (/goal "หาอัลฟ่า submit ได้ 2 ตัว")

queued: 0
submitted: 2

## 🏆 GOAL COMPLETE: submit 2 (project #33-34)
| # | alpha_id | กลไก | Sharpe/fit | corr |
|---|---|---|---|---|
| 33 | `RRrvKXlb` | BVPS-forecast-Bowley × close-range | 1.66/1.20 | 0.6104 |
| 34 | `O09222WJ` | FCFPS-forecast-Bowley × VWAP (เปิด VWAP cluster) | 1.64/1.00 | 0.6814 |

## 🔑 บทเรียน: forecast-Bowley vein ขยายข้าม QUANTITY
- forecast-distribution Bowley `(high+low−2median)/(high−low)` ใช้ได้กับหลาย quantity ไม่ใช่แค่ sales/EPS:
  - STRONG standalone: sales(#22)/EPS/EBIT(#24)/epsr-growth-rate(#32)
  - MODERATE (ต้อง interpolate × price): BVPS(#33)/fcfps(#34)/netdebt(0.89)
  - DEAD: CFI(0.01)/cfps(0.96 standalone weak)
- **balance-sheet/cash-flow forecast quantity ⊥ earnings-forecast พอ** (BVPS 0.61, epsr 0.67 vs sales#22)
- **quantity ใกล้กันต้องกระจาย price-niche:** fcfps×close-range ชน BVPS#33 0.705 → ย้าย VWAP 0.681 หลุด; netdebt-vs-BVPS 0.75 (financing≈book)
- **3 price-niche (rev10/close-range/VWAP) × หลาย forecast-quantity = พื้นที่ใหญ่** (VWAP cluster เพิ่งเปิด #34)

## session goal6 รวม: submit 15 ตัว (#20-34), pool 34 ของเรา / 43 ACTIVE
## เปิดต่อ: forecast-Bowley quantities อื่น (sga/totassets/tbvps/ptp) × price-niche · VWAP cluster · OS-fail · tier
