# Run Report — รอบ 33 (2026-06-11)

queued: 0

## สรุปผล
| | จำนวน |
|---|---|
| sims | 3 |
| queued | 0 |
| ตก | 3 |

## สิ่งที่ทำ: ไล่ปิดเงื่อนไขกลับเข้า options composite ("ขาใหม่ ≥0.7")
ทดสอบ 3 anomaly สุดท้ายที่เหลือใน option6 (field volume/forecast ที่เพิ่งพบ):
- **O/S ratio** (Johnson-So 2012): −0.40 — flat
- **put-call volume imbalance** (Pan-Poteshman): −0.01 — flat สนิท
- **vol forecast spread** (vendor forecast − current IV): −0.07 — flat

## ข้อสรุป
- **options space ทดสอบครบทุก field family แล้ว (option6/8/9 รวม ~15 signals ข้ามรอบ 19/32/33)** — ขา ≥0.7 มีแค่ VRP (0.84, corr-risk intraday-vol) เดียว
- composite 1.18/0.86 ค้างใน near-miss โดยเงื่อนไขกลับมาเหลือ: **OS-fail ปลด intraday-vol niche / tier เปิด** เท่านั้น
- ณ จุดนี้ search space ที่เข้าถึงได้ = สแกนหมดทุกแกนจริง (price/footnote/fundamental7/options/news/model/tier) — /find-alphas รอบถัดไปไม่มี edge ถ้าไม่มี trigger ภายนอก
