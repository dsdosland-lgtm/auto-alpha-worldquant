# Run Report — 2026-06-08 (รอบ 6)

## โจทย์
ผู้ใช้ไม่เอาการเปลี่ยน region/delay → อยู่ USA TOP3000 delay1. ลอง lever ที่ยังไม่ได้ทำ: **anchor combo ที่ close-range (near-miss ที่ fitness สูงสุด 0.95) + เติม signal orthogonal** แทนการ anchor ที่ intraday-upside (0.77) แบบรอบก่อน

## สรุป
- ไม่ใช้ไอเดียใหม่ — ผสม near-miss ที่มีอยู่ (close-range + 52w-momentum − OBV)
- **fitness 0.96 = สูงสุดที่โปรเจกต์เคยทำได้** (เดิม 0.95) แต่ยังติด LOW_FITNESS
- เข้า submit-queue: **0 ตัว**
- simulate ~15 ครั้ง

## ผลไต่ระดับ fitness (combo close-range-anchored)
| combo | decay | Sharpe | Fitness | TO |
|-------|-------|--------|---------|-----|
| D+A (1:1) | 0/2 | 1.94/1.77 | 0.91 | 0.68/0.52 |
| 1.5D+A | 2 | 1.84 | 0.93 | 0.55 |
| 2D+A | 2 | 1.88 | 0.94 | 0.57 |
| 2D+A−C | 2 | 1.79 | 0.95 | 0.51 |
| **2.5D+A−C** | **2** | **1.83** | **0.96** | 0.53 |
| 3D+A−C | 2 | 1.86 | 0.96 | 0.54 |
| 2.5D+A−1.5C / 3D+1.5A−1.5C | 2 | 1.78/1.79 | 0.94/0.95 | 0.50/0.51 |

D = close-range `rank(-ts_decay_linear((close-low)/(high-low+0.001),4))`, A = `rank(ts_zscore(mdl77_pricemomentumfactor_high52w,20))`, C = OBV `rank(group_neutralize(winsorize(ts_sum(volume*sign(Δclose),10)/adv20,std=3),subindustry))`

## ข้อค้นพบ
1. **anchor ที่ signal แรงสุด (close-range) ดีกว่า anchor ที่ signal อ่อน** — combo รอบนี้ (0.96) >> combo รอบ 4 ที่ anchor intraday-upside (0.85)
2. **สูตร weighting ที่ work: เพิ่มน้ำหนัก signal แรงสุด (close-range 2.5-3×) + ลบ signal turnover สูง (OBV) เพื่อ net ลด TO โดยรักษา returns** — ดันทะลุเพดาน close-range solo (0.95→0.96)
3. **close-range combo ชอบ TOP3000** (TOP1000 → 0.76) ต่างจาก 52w-combo รอบ 4 (ชอบ TOP1000) — universe optimal ขึ้นกับ signal หลัก
4. **plateau ที่ 0.96** — ดันน้ำหนักต่อ fitness นิ่ง 0.94-0.96 = overfit ไม่ทำต่อ

## ผลต่อระบบ
- 0 ตัวเข้าคิว → `/review-candidates` ไม่มีของใหม่ แต่ได้ near-miss ที่ดีสุดของโปรเจกต์ (fit 0.96)
- ทางทะลุ 1.0 ที่เหลือ: fix UNITS warning, หา orthogonal component returns-สูง (รอบ 5 หาไม่เจอบน USA delay1), หรือเปลี่ยน data axis (ผู้ใช้ยังไม่เอา)
- บันทึก lesson: เทคนิค weighted combo anchor-strongest-signal
