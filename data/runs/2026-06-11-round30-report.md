# Run Report — รอบ 30 (2026-06-11)

queued: 0

## สรุปผล
| | จำนวน |
|---|---|
| sims | 7 (fundamental7 ×4, fundamental2 residual ×3) |
| queued | 0 |
| near-miss | 0 |
| ตก | 7 |

## สิ่งที่ลอง (ตาม recipe รอบ 29: หาขาเดี่ยว ≥0.7 → composite → group_rank)
| signal | งานวิจัย | Sharpe | verdict |
|---|---|---|---|
| R&D intensity `fnd7_ointfund_qdrx/cap` | Chan-Lakonishok 2001 | 0.22 | ตาย |
| inventory growth (rank) | Thomas-Zhang 2002 | 0.67 | ต่ำกว่าเกณฑ์ขา 0.7 |
| inventory growth (group_rank sector) | — | **−0.63 (เครื่องหมายกลับ!)** | เปราะ ทิ้ง |
| tax-to-book | Lev-Nissim 2004 | 0.13 | ตาย |
| useful-life aggressiveness | depreciation policy | 0.11 + LOW_TURNOVER fail | ตาย |
| restructuring expense / reserve Δ | Burgstahler transitory | −0.28 / −0.05 | ตาย |

## ข้อสรุป
1. **fundamental7 = ปิดเคส** — field ส่วนใหญ่ [VECTOR] ใช้ตรงไม่ได้, MATRIX legs flat, เนื้อหาซ้ำ fundamental6
2. **footnote space: ขาแรงถูกเก็บครบใน O096kVaY แล้ว** (buyback/pension/FV-L2 คือ cream) — field ตกค้าง prior ต่ำ
3. บทเรียนใหม่: **ขาที่เครื่องหมายกลับระหว่าง rank ↔ group_rank = signal เปราะ ไม่เอาเข้า composite** (inventory)
4. รอบหน้า default = TIER-RECHECK + OS-monitor (5 ตัวใน OS ยัง PENDING) — ขุดต่อเมื่อ OS-fail / tier เปิด / field class ใหม่ที่ literature แรงจริง

## สถานะ pool หลังรอบ 30
5 submitted (ACTIVE/OS ทั้งหมด PENDING): QPQYqvAW, XgK9528a, le0AvXl7, RRrE1VNj(corr-risk), O096kVaY
