# Run Report — รอบ 27 (2026-06-11)

## เป้าหมาย
หา returns-source **niche ที่ 5** บน USA TOP3000 delay1 (4 niche เดิมจองครบ: reversal / total-MAX / total-SJ / intraday-vol)

## สิ่งที่ทำ
1. **TIER-RECHECK (pool โต 4 ACTIVE):** get_datasets + sim probe บน EUR/GLB/CHN → **ยัง "not available" ทั้งหมด** tier region ยังล็อก
2. **DATA-AXIS PROBE:** get_datasets USA d1 = 20 ตัวเดิมเป๊ะ ไม่มี dataset ใหม่
3. **เติม backlog ด้วย deep-research:** spawn alpha-researcher → 4 ไอเดียใหม่ (academic, กรอง corr-attractor) — ทั้งหมดเป็น "เปลี่ยน cross-section ของ intraday-upside-semivar (base ของ le0AvXl7)" ผ่าน conditioner ต่างกัน
4. **Simulate 3 ตัว** (idea #4 ไม่ sim — inferred redundant)

## ผล simulate
| alpha_id | idea | Sharpe | fit | returns | self-corr vs le0AvXl7 | verdict |
|---|---|---|---|---|---|---|
| kqKaj8Z6 | sector-relative (group_neutralize sector) | 1.43 | 2.47 | 0.373 | **0.9238** | redundant |
| d5QaOqzv | own-mean-demean (−ts_mean 63) | 1.61 | 3.12 | 0.470 | **0.9891** | redundant |
| gJ3aQXbe | earnings-conditioned (post-EPS 5d) | **0.70** | **0.69** | 0.120 | n/a (IS fail) | rejected (weak) |

- **ผ่านคิว: 0** | redundant: 2 | rejected: 1 (+1 inferred redundant ไม่ sim)

## บทเรียน (รอบ 27)
- 🔑 **IRON LAW ยืนยันอีกชั้น:** base `power(max(close/open-1,0),2)` เดียวกัน + conditioner ใดๆ (sector-demean / own-mean-demean / volume-spike) = **corr 0.92-0.99** ไม่หนี. own-mean-demean = cosmetic (mean intraday≈0). sector-demean เปลี่ยน cross-section ไม่พอ
- 🔑 **event-conditioning เป็น base ต่างจริง** (subset วัน post-earnings) → corr น่าจะต่ำ **แต่ signal อ่อนกว่าเกณฑ์** (Sharpe 0.70) เพราะ restriction เจือจาง magnitude. ⇒ ต้องการ base ที่ "ต่าง cross-section จริง + ยัง magnitude แรงพอ" พร้อมกัน — หายาก
- ⚙️ พบ field ใช้ได้: `days_from_last_change(actual_eps_value_quarterly)` (analyst4) จับ earnings window ได้จริง; earnings4 = implied-move/IV ไม่มี SUE
- **TIER ยังล็อก** แม้ 4 ACTIVE → niche #5 ขึ้นกับ tier เปิด หรือ OS-fail ทำ niche เก่าว่าง

## ทิศทางรอบหน้า
- ยังไม่มี submittable ใหม่ — **ไม่ดันต่อบน intraday-vol family** (ปิดเคส)
- ทางเหลือ: (a) รอ TIER เปิด/ตรวจซ้ำเป็นระยะ (b) เฝ้า OS — ถ้า RRrE1VNj ตก SELF_CORRELATION → ไม่เปิด niche (XgK9528a ยังอยู่) (c) deep-research base ที่ "cross-section ต่างจริง + magnitude แรง" — เช่น return stream อื่นนอก total/intraday/overnight, หรือ event-magnitude ที่ไม่ sparse
- **ไม่มีตัวเข้าคิว → ยังไม่ต้องรัน /review-candidates**
