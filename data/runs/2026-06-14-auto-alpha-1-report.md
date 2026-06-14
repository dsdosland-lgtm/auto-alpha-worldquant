# Run Report — 2026-06-14 /auto-alpha 1 (skill เปิดตัวครั้งแรก)

queued: 0
submitted: 1

## 🏆 GOAL COMPLETE: submit 1 (project #35) — attempts 1, corr margin หนา
| # | alpha_id | กลไก | Sharpe/fit | corr | sub |
|---|----------|------|-----------|------|-----|
| 35 | `N1OG0P5p` | abnormal-capex (Titman-Wei-Xie) × VWAP 1:1 interpolation | 2.71/1.79 | **0.647** | 1.67 |

expr: `1*group_rank(-(capex/(assets+1)) / (0.333*(ts_delay(capex/(assets+1),252)+ts_delay(capex/(assets+1),504)+ts_delay(capex/(assets+1),756))+0.001), sector) + rank((vwap-close)/(vwap+0.001))` {INDUSTRY decay4 trunc0.08, USA TOP3000 d1}

## 🔑 บทเรียนหลัก: bench ที่รอ OS-fail ปลดได้ทันทีผ่าน interpolation
- **abnormal-capex อยู่บน CONDITIONAL bench** (รอ j2go6pmO OS-fail ตั้งแต่รอบ 46) เพราะ locked j2go6pmO 0.72 — **แต่ interpolation × VWAP ปลดมันได้เลยไม่ต้องรอ!** (corr 0.72→0.647). **กฎใหม่: attractor-locked bench core = candidate interpolation ทันที ไม่ต้องรอ attractor หลุด pool**
- 🔑 **binding constraint จริง = #23 `6XE2X1AY` (diversification) ไม่ใช่ j2go6pmO** — investment & diversification = dimension เดียวกัน (corr surface ชี้ตัวที่ชนจริงตอน sweep)
- **price-weight sweep กด corr investment-attractor:** 3:1=0.745 / 2:1=0.734 / 1.5:1=0.712 / 1.25:1=0.689 / **1:1=0.647**. ⚠️ ตรงข้าม BVPS/fcfps (ต้อง fundamental-heavy 2-3:1) — **investment-core ต้อง price-heavy (1:1)** เพราะ fundamental เองคือตัวที่ชน attractor (ยิ่ง fundamental มาก ยิ่งชน). Sharpe ก็ขึ้นตาม price (2.15→2.71) เพราะ VWAP-reversal แบก

## ❌ veins ที่ลองแล้วอ่อน/ตาย (ก่อนเจอ winner)
- **forecast-Bowley quantity ที่เหลือ = อ่อน:** totassets-Bowley × VWAP fit 0.75, capex-Bowley × VWAP fit 0.75 (Sharpe 1.57-1.58 แต่ price ขี่ — forecast-dispersion ของ balance-sheet/investment quantity พวกนี้ไม่มี real signal เหมือน BVPS/fcfps). ffo/dps = ไม่มี field
- **model-factor direct group_rank ตายหมด:** hgm-growth-composite 0.99 (sub 0.20 fail) / growdura 0.18 / qma-6m-alpha -0.11. ready-core ที่ work ต้องเป็นตัวที่ booked แล้ว (UAP/GARP/capacq) — ตัวอื่นในไลบรารีอ่อน

## sims รอบนี้: 13 (1 submitted / 4 weak-forecast-Bowley / 3 dead-model-factor / 5 interpolation-sweep)
## pool รวม: 35 ของเรา / 44 ACTIVE — VWAP cluster ตอนนี้ 2 ตัว (fcfps#34, abnormal-capex#35)
## เปิดต่อ: bench/attractor-locked cores อื่นๆ × VWAP/price-niche (npWqOj3a ปลดแล้ว — เหลือ omYGW56l sentiment, abnormal-capex variants) · VWAP cluster ยังโล่ง · forecast-Bowley sga/tbvps/ptp (ยังไม่ลอง แต่ระวังอ่อนเหมือน totassets/capex)
