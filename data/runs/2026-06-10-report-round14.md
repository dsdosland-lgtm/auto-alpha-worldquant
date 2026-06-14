# Run Report — รอบ 14 (2026-06-10): สังเคราะห์ best-base × RMW-weight

**ขอบเขต:** USA / TOP3000 / delay 1 · **Thesis:** เอา RMW profitability (ตัวถ่วงที่ดีสุด รอบ 13) ไปใส่ reversal base ที่ Sharpe สูงกว่า ts_zscore (midpoint/close-range ที่เคยได้ 0.99 ด้วย volume) แทน volume → หวังทะลุเพดาน 0.96 + เลี่ยง DNA volume ของ submitted #2

## ผลทดลอง (9 simulations)
| base × RMW | neut/decay | Sharpe | Fitness | TO | Returns | sub-univ |
|-----------|-----------|--------|---------|-----|---------|----------|
| close-range × RMW | INDUSTRY/4 | **2.07** | 0.93 | 0.80❌ | 0.163 | 1.53 |
| close-range × RMW | SUBIND/6 | 2.03 | **0.94** | 0.663 | 0.142 | 1.46 |
| close-range × RMW | INDUSTRY/8 | 1.81 | 0.92 | 0.583 | 0.150 | 1.24 |
| midpoint × RMW | SUBIND/8 | 1.91 | 0.93 | 0.580 | 0.139 | 1.26 |
| midpoint × RMW | INDUSTRY/6 | 1.90 | 0.92 | 0.670 | 0.156 | 1.34 |
| **ts_zscore × RMW (รอบ 13)** | **INDUSTRY/4** | 1.69 | **0.96** | 0.557 | 0.179 | 1.41 |

## ข้อสรุป
- **ไม่ทะลุ 0.96** — base ที่ Sharpe สูงกว่า (close-range 2.07, midpoint 1.91) กลับได้ fitness **ต่ำกว่า** (0.92-0.94) เพราะ **turnover สูงกว่าตาม → กิน fitness**
- 🔑 **fitness ถูก dominate ด้วย returns/turnover ratio ไม่ใช่ Sharpe ล้วน** — `ts_zscore(close,5) × RMW` (Sharpe 1.69 แต่ TO/returns สมดุล) ยังเป็น sweet spot ที่ดีสุด (0.96)
- ยืนยัน **hard ceiling 0.96 ของ USA TOP3000 delay1 เป็นครั้งที่ 14** — คราวนี้ด้วยการสังเคราะห์ best-base × best-weight ที่มีเหตุผลดีสุดเท่าที่ทำได้
- UNITS warning โผล่กับ close-range/midpoint (ratio fields) — ts_zscore base สะอาดกว่า

## สรุปรวม
- **ผ่าน submit: 0** · **submit-queue ว่าง**
- near-miss ดีสุดยังเป็น **RMW-reversal (ts_zscore base) fit 0.96** จากรอบ 13
- **ทางข้าม 1.0 จริงเหลือแค่เปลี่ยน data axis** (delay 0 / dataset ใหม่) — ยืนยันซ้ำหนักแน่นหลัง 14 รอบ
