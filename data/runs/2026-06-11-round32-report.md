# Run Report — รอบ 32 (2026-06-11)

queued: 0

## สรุปผล
| | จำนวน |
|---|---|
| sims | 6 |
| queued | 0 |
| **near-miss** | **1 (options composite 1.18/0.86 — ดีสุดของ options ที่เคยมี)** |
| ตก | 5 |

## สิ่งที่ทำ: เอา recipe รอบ 29 (composite + group_rank) กลับไปใช้กับ options space ที่ถูกทิ้งรอบ 19
- **ค้นพบเชิงเทคนิคสำคัญ: `group_rank(x, sector)` แก้ CONCENTRATED_WEIGHT ที่ฆ่า options signal ทั้งรอบ 19** — options space กลับมาเล่นได้จริง (rank form FAIL → group form PASS)
- composite PCR-vol (0.66) + VRP (0.84): rank form 1.03+CONC FAIL → **group form 1.18/0.86 CONC PASS** = near-miss ดีสุดของ options
- ติดเพดาน: fitness 0.86 นิ่ง 3 variants (decay10/20, ts_mean) → หยุดตามกฎ. คณิต: ต้อง Sharpe≥1.25 ที่ TO<0.125 — ขา 2 ตัวที่มีไปได้แค่ 1.18
- probe option6 (dataset options เดียวที่ไม่เคยแตะ): expected-earnings-move ±0.32, clean-VRP 0.40 = ไม่มีขาที่ 3
- ⚠️ ขา VRP แรงเพราะ parkinson-RV side (clean-VRP ตัด RV เหลือ 0.40 พิสูจน์) = corr-risk กับ intraday-vol niche แม้ผ่าน IS

## เงื่อนไขกลับมาเล่น (จดใน near-miss.md)
ขา options ใหม่ ≥0.7 / OS-fail ปลด intraday-vol niche / tier เปิด
