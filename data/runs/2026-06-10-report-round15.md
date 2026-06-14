# Run Report — รอบ 15 (2026-06-10): Momentum/Quality/Accruals + การผสมกลยุทธ์

**ขอบเขต:** USA / TOP3000 / delay 1 · **research:** `2026-06-10-deep-research-momentum-quality.md`
**โจทย์:** ผสม 4 anomaly (JT/Carhart momentum, Sloan accruals, Novy-Marx GP) ให้ทะลุ GP-reversal 0.96

## ผลทดลอง (8 simulations) — ทุกการผสมเจือจาง GP-reversal (0.96)
| signal | Sharpe | Fitness | หมายเหตุ |
|--------|--------|---------|---------|
| **GP-reversal เดี่ยว (รอบ 13)** ⭐ | 1.69 | **0.96** | ยังดีสุด |
| momentum 12-1 standalone (FF mom) | −0.11 | — | **ตายบน USA daily** |
| accruals (Sloan) standalone | −0.77 | — | sign กลับ, อ่อน |
| GP-reversal + momentum sleeve (additive) | 0.54 | 0.25 | momentum noise ทำลาย signal |
| GP+value combined weight | 1.65 | 0.92 | value เจือจาง GP |
| momentum-conditioned reversal | 1.18 | 0.59 | momentum weight = noise |
| GP-reversal × low-PTH (Chen-Stivers-Sun) | 1.41 | 0.75 | conditioning over-concentrate |
| GP-reversal × low-PTH decay 6 | 1.29 | 0.66 | แย่ลงอีก |

## ข้อสรุป
- **ผสมกลยุทธ์ไม่ทะลุ 0.96** — สาเหตุเชิงโครงสร้าง: momentum/accruals/value **อ่อนเดี่ยวๆ บน USA daily** (Sharpe ~0 ถึงลบ) → diversification math (ผสม factor corr ติดลบ) **ใช้ไม่ได้เพราะผสมของอ่อนไม่เกิดของแรง**
- 🔑 **research ยืนยัน "double-sort ชนะ side-by-side"** — และ **GP-conditioned reversal (0.96) คือ double-sort ที่ดีสุด** ส่วน additive sleeve (side-by-side) เจือจางทุกครั้ง. การ × momentum/value/PTH เพิ่ม = over-condition ลด Sharpe
- ยืนยัน **hard ceiling 0.96 ครั้งที่ 15** — คราวนี้ครอบคลุมการผสม 4 classic anomaly ครบ
- **momentum บน USA delay1 ตายจริง** (FF 12-1 Sharpe −0.11) — ปิดประเด็น momentum family ทุกแบบ (เคยลอง 52w, medium-term, breakout, acceleration — ตกหมด)

## สรุปรวม
- **ผ่าน submit: 0** · **submit-queue ว่าง**
- ไม่มี near-miss ใหม่ที่ดีกว่า GP-reversal 0.96 (รอบ 13)
- **ข้อพิสูจน์เพิ่ม: บน USA delay1 มี signal ที่ "แรงพอผสม" แค่ 2 ตระกูล (reversal + GP-as-weight)** — ตัวอื่นอ่อนเกินจะ contribute. นี่คือเหตุผลแท้ที่การผสมไม่ช่วย
- ทางข้าม 1.0 ยังเหลือแค่เปลี่ยน data axis
