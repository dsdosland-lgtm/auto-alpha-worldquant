# Run Report — FF 2015 Five-Factor → Alpha (รอบ 13)

**วันที่:** 2026-06-10 · **ขอบเขต:** USA / TOP3000 / delay 1 · **research:** `2026-06-10-deep-research-ff2015.md`
**โจทย์:** แปลง 5 factors (เน้น 2 ตัวใหม่ RMW profitability, CMA investment) เป็น alpha

## ผลทดลอง (~14 simulations)

### A. factor บริสุทธิ์ใหม่ — อ่อนตามที่ research ทำนาย
| factor | field | Sharpe | หมายเหตุ |
|--------|-------|--------|---------|
| RMW profitability | `gross_profit_to_assets_ratio` | 0 | raw → **CONCENTRATED_WEIGHT FAIL** (coverage ไม่ครบ TOP3000) |
| CMA investment (flip) | `mdl177_v1_400_pctchgqtrast` | −0.25 | asset growth อ่อน — ตรง research ที่ว่า CMA insignificant |

### B. RMW เป็น conditioning weight บน reversal — ⭐ ทะลุ 0.96
| weight | neut/decay | Sharpe | Fitness | Returns | sub-univ |
|--------|-----------|--------|---------|---------|----------|
| HML value (รอบ 12) | SECTOR/5 | 1.43 | 0.83 | 0.167 | 1.14 |
| **RMW profitability** ⭐ | **INDUSTRY/4** | **1.69** | **0.96** | **0.179** | **1.41** |
| RMW profitability | INDUSTRY/3 | 1.77 | 0.96 | 0.184 | 1.48 |

→ **ยืนยัน thesis ของ FF 2015 เชิงประจักษ์: RMW (profitability) เหนือกว่า HML (value)** — value-weighted reversal ได้ fit 0.83, profitability-weighted ได้ **0.96** (+0.13)

## ตัวเด่นสุด (BEST SINGLE SIGNAL EVER — fitness 0.96)
```
-ts_zscore(close, 5) * winsorize(gross_profit_to_assets_ratio, std=3)
settings: USA TOP3000 delay1 · INDUSTRY · decay 4 · trunc 0.08   (alpha 3qAX7j3P / RRrb8Pze)
→ Sharpe 1.69 · Fitness 0.96 · Turnover 0.557 · Returns 0.179 · Drawdown 0.085 · sub-universe 1.41
```
- ทุก check ผ่านยกเว้น LOW_FITNESS (0.96 vs 1.0) · **ไม่มี UNITS warning** · sub-universe robust สูงสุดของโปรเจกต์
- กลไก: หุ้น high-profitability ที่ราคาร่วงระยะสั้น = mispricing ชัด → reversal แรง + returns สูง

## levers ที่ลองดัน 1.0 — ชนเพดาน 0.96 ทุกทาง
- decay 3/4/5/6 → 0.92-0.96 (peak decay 4) · trunc 0.04 → 0.96 (เท่าเดิม)
- SUBINDUSTRY 0.94 · SECTOR 0.91 · **INDUSTRY 0.96 ดีสุด**
- **TOP1000 → 0.84-0.85** (Sharpe ตก, drawdown ขึ้น — universe เล็กลด breadth) · TOP3000 ดีสุด
- +CMA composite weight → 0.91 (CMA เจือจาง) · +52w-momentum combo → 0.91 (momentum เจือจาง Sharpe)

## สรุป
- **ผ่าน submit: 0 ตัว** — ชน hard ceiling 0.96 ของ USA delay1 ([[returns-bottleneck-usa-delay1]]) เพดานเดิมที่ documented
- **near-miss ระดับสูงสุด: 1 ตัว** (RMW profitability-reversal, fit 0.96) → บันทึก near-miss.md
- ค้นพบหลัก: **RMW profitability = ตัวถ่วง reversal ที่ดีสุดเท่าที่เคยเจอ** (เหนือ value/volume), sub-universe 1.41, single signal (ไม่ใช่ combo) → คุณภาพสูงสุด
- CMA อ่อนบน USA daily (ตรง research)
- **submit-queue ยังว่าง**

## ข้อเสนอ
1. RMW-reversal (fit 0.96) ขาด 0.04 — ใกล้สุดในบรรดา single signal. ทางข้าม 1.0 เหลือแค่เปลี่ยน data axis (delay 0 / dataset ใหม่) ตามข้อสรุป 10 รอบก่อน
2. ถ้าผู้ใช้รับความเสี่ยง self-corr ได้ → เช็ค self-corr ของ RMW-reversal กับ submitted #2 (อาจ orthogonal พอเพราะตัวถ่วงต่างกัน profitability≠volume) แล้วพิจารณา submit ทั้งที่ fit 0.96 (ต่ำกว่า 1.0 เล็กน้อย)
3. value timely-price (AQR HML-DEV) เป็น lever ที่ยังไม่ลอง ถ้าจะกลับไปดัน HML
