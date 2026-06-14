# Run Report — รอบ 43 (2026-06-12)

queued: 0
near-miss: 0
rejected: 1 (mechanism)
redundant: 6 (variants)

## เป้าหมาย
หาทรานส์ฟอร์มใหม่บน USA d1 ก่อน leaderboard freeze ปลายมิ.ย. — เลือก mechanism 🔴 ตัวสุดท้ายที่เข้ากฎ magnitude: **max-volume-day return** (Gervais-Kaniel-Mingelgrin high-volume premium / attention)

## SESSION CHECKS (ครั้งแรกของ session)
- **TIER-RECHECK:** EUR/CHN/GLB get_datasets = no output; sim จริง EUR = 400 "Region not available" → tier ยัง locked USA แม้ 10 ACTIVE
- **DATA-AXIS PROBE:** get_datasets USA d1 = 20 datasets เดิมครบ ไม่มี dataset ใหม่
- **operators:** ไม่มี op ใหม่
- → แกน data ปิดทุกด้าน เหลือทาง transform ใหม่อย่างเดียว

## ผล: ปิดเคส max-volume-day return (🔴→🟡)
เริ่มจากเจอ registry near-miss เดิม `78dLxGN8` (power2, Sharpe 1.23) — วัด corr จริง = **0.7422 vs XgK9528a** (ไม่ใช่ 0.84 ที่ infer). เป็น double near-miss → ลอง escape ผ่าน selection structure (เหมือน MAX หนี SJ):

| variant | expr (power-8 เว้นระบุ) | Sharpe | corr vs SJ | CONC | สรุป |
|---|---|---|---|---|---|
| power2 unbounded (เดิม) | `vol/MA, p2` | 1.23 | 0.742 | pass | redundant |
| power4 unbounded | `vol/MA, p4` | 1.07 | — | ❌0.21 | rejected |
| **power8 unbounded** | `vol/MA, p8` | 1.16 | **0.407** ✅ | ❌0.41 | หนี SJ ได้! แต่ CONC+Sharpe fail |
| ts_rank p8 | `ts_rank(vol,42), p8` | 1.29 | 0.882 | pass | redundant |
| ts_rank p12 | `ts_rank(vol,42), p12` | **1.31** | 0.887 | pass | redundant |
| ts_rank p8 ×GP | + GP weight | 1.29 | — | pass | =p8 (GP ดูดซับ) |
| cap C=3 p8 | `min(vol/MA,3), p8` | 1.21 | 0.873 | pass | redundant |
| cap C=5 p8 | `min(vol/MA,5), p8` | 1.16 | 0.846 | pass | redundant |
| cap C=8 p8 | `min(vol/MA,8), p8` | 0.88 | — | pass | rejected |
| winsor(signal)×GP p6 | winsorize std=2 | 0.88 | — | ❌0.11 | rejected (cap ฆ่า signal) |

**ข้อสรุป:** corr-to-SJ กับ (Sharpe≥1.25 + CONC-pass) เป็นปฏิภาคกันทุก lever (power/ts_rank/cap). orthogonality (corr 0.407) มาจาก single-day concentration เอง = สองด้านเหรียญเดียวกับ CONCENTRATED fail. ฟอร์มที่ tradeable ทุกตัว re-couple signed-jump (XgK9528a) ที่ 0.85-0.89 → ยืนยัน 4-dim subspace (returns×volume ⊂ มิติ signed-jump)

## sims รอบนี้: 11 (9 ใหม่ + 2 ref เดิม) · self-corr checks: 5
ไม่มีตัวเข้าคิว — ปิด 🔴 magnitude mechanism ตัวสุดท้ายด้วยหลักฐาน corr surface ครบ

## บทเรียน/toolkit
- `ts_rank(volume,42)` weight (bounded) แก้ CONCENTRATED ของ power สูงได้ — แต่ bounded = re-couple attractor
- winsorize(signal,std=2) ฆ่า Sharpe เมื่อ tail = ตัว signal เอง (high-volume-day extreme returns)
- **get_self_correlation เรียกบน alpha ที่ IS-fail ได้** → diagnose corr ฟรี ก่อนเสีย sim tune

## แนะนำรอบถัดไป
**default = /os-monitor** — ทุก axis (tier/dataset/mechanism magnitude) ปิดด้วยหลักฐานจริงแล้ว. ขุดต่อเมื่อ: OS-fail (เปิด niche เก่า) / tier เปิด / field class ใหม่. CONDITIONAL: j2go6pmO OS-fail → submit sentiment1 `YPAEbvGW` ทันที
