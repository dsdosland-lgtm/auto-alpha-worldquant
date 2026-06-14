# Run Report — 2026-06-08 (รอบ 4)

## โจทย์รอบนี้
หาไอเดีย **orthogonal** กับ 2 alpha ที่เพิ่ง submit (price-volume divergence + overnight reversal) เพื่อเลี่ยง self-correlation — researcher หาจาก signal family ที่ต่างออกไป (momentum หลายระดับ, fundamental, volatility, seasonality)

## สรุป
- ไอเดียใหม่: **5 ตัว** (52w-high, industry-momentum, ROE, vol-term-structure, turn-of-month)
- เข้า submit-queue: **0 ตัว**
- near-miss: **2 ตัว** · ตกไกล: 2 ตัว · ทำไม่ได้ (infeasible): 1 ตัว
- simulate ~12 ครั้ง

## ผลรายตัว
| idea_id | best expr | Sharpe | Fitness | สถานะ |
|---------|-----------|--------|---------|-------|
| 52-week-high-proximity-momentum | `rank(ts_zscore(mdl77_pricemomentumfactor_high52w, 20))` | **1.46** ✅ | 0.69 | near-miss ⭐ orthogonal |
| industry-relative-medium-momentum (พลิก) | `-rank(group_zscore(ts_sum(returns,63), subindustry))` MARKET | 0.90 | 0.71 | near-miss (ก้ำกึ่ง) |
| profitability-roe-cross-sectional | `rank(group_zscore(winsorize(return_equity,std=3), subindustry))` | 0.40 | 0.19 | ตกไกล |
| volatility-term-structure-slope | ±0.44 ทั้ง 2 ทิศ | ±0.44 | -0.09 | ตกไกล |
| turn-of-month-seasonality | — | — | — | ❌ infeasible |

## ข้อสังเกตหลัก
1. **`ts_max` ไม่มีจริงบน BRAIN** — ต้องใช้ `ts_rank(close,d)` หรือ field สำเร็จรูปแทน (translator จับได้ก่อน simulate)
2. **BRAIN ไม่มี calendar/date operator เลย** — seasonality (turn-of-month, day-of-month) implement ไม่ได้ ตัดทิ้งทั้ง family
3. **medium-term momentum (63 วัน) เป็น reversal ในช่วงนี้** — rank ดิบ Sharpe -0.90 พลิกเป็น +0.90 (ย้ำ lesson กลับเครื่องหมาย)
4. **52w-high ต้องใช้ ts_zscore แปลง level→momentum** — field ดิบ rank() Sharpe 0.14, ครอบ ts_zscore(.,20) → Sharpe 1.46
5. **fitness ceiling ครั้งที่ 5** — 52w-high ติด ~0.70, ยืด window/decay = Sharpe ตกตาม returns เป็นคอขวดทุกครั้ง
6. **fundamental เดี่ยวๆ (ROE) + vol-ratio อ่อนบน USA TOP3000 daily** — Sharpe < 0.45 ทั้งคู่ (signal เปลี่ยนช้า/ไม่มี edge รายวัน)

## ผลต่อระบบ
- 0 ตัวเข้าคิว → `/review-candidates` ไม่มีของใหม่
- near-miss 2 ตัวบันทึกใน near-miss.md — **52w-high (Sharpe 1.46, orthogonal, drawdown 0.056) เป็นตัวมีค่าสุด** ถ้าจะดันต่อควรผสม orthogonal signal เพิ่ม returns (เช่นจับคู่ volume-asymmetry ที่ drawdown ต่ำ)
- ค้นพบเชิงระบบ: BRAIN ไม่มี calendar operator + ไม่มี ts_max → จำกัด idea family ที่ทำได้

## ภาคต่อ: ทดลองผสม alpha (combo orthogonal) — ~12 sims
รวม rank ของ 3 signal คนละ family: A=52w-momentum + B=intraday-range + C=OBV-flow

| combo | Sharpe | Fitness | TO | หมายเหตุ |
|-------|--------|---------|-----|---------|
| A+B decay0 | 1.59 | 0.72 | 0.641 | Sharpe สูงสุด |
| A+C decay0 | 1.48 | 0.74 | 0.443 | TO ต่ำ |
| A+B+C decay0 | 1.57 | 0.76 | 0.552 | |
| **A+B+C decay2** | **1.50** | **0.82** | 0.417 | ✅ดีสุด (A137W29w) |
| A+B+C decay3 | 1.42 | 0.82 | 0.352 | |
| weighted/trunc variants | 1.42-1.46 | 0.82 | — | ล็อก 0.82 ทุกตัว |

**ผล: ผสม orthogonal ดันเพดาน single signal 0.77 → 0.82 ได้จริง** (Sharpe คง 1.50, dd ต่ำ 0.054) แต่ชุด 3 signal นี้ตันที่ fitness 0.82 ปรับ weight/decay/trunc ไม่ขยับ → ยังไม่ถึง 1.0 ไม่เข้าคิว. break 1.0 ต้องเพิ่ม signal ตัวที่ 4 ที่ returns สูง หรือเปลี่ยน region/universe (บันทึก lesson เทคนิค combo แล้ว)
