# Run Report — 2026-06-09 (รอบ 10)

## โจทย์
ใช้ความเข้าใจใหม่ (2 ด่าน: fitness≥1.0 ผ่าน returns≥0.15 + self-corr<0.70) หา reversal/price-volume returns-สูงที่ใช้ **price anchor ใหม่** (decorrelate จากพูล close/open + 5d-zscore)

## สรุป
- ทดสอบ price anchor ใหม่ × volume: vwap, **close-vs-midpoint**, 5d-return
- ได้ near-miss ที่ดีสุดของโปรเจกต์: **fitness 0.99** (Sharpe 2.02) แต่ไม่ข้าม 1.0
- เข้า submit-queue: **0 ตัว** · simulate ~15 ครั้ง

## ผล
| signal × volume | Sharpe | Fitness | TO | หมายเหตุ |
|-----------------|--------|---------|-----|---------|
| vwap-deviation | 1.74 | 0.53 | 0.89 | turnover ระเบิด |
| **close-vs-midpoint (no group, decay8)** | **2.02** | **0.99** | 0.599 | ⭐ ดีสุด ขาด 0.01 |
| 5d-return reversal | 1.15 | 0.68 | 0.35 | Sharpe อ่อน |

## ข้อค้นพบ
1. **close-vs-midpoint `(close-(high+low)/2)/(high-low)` × volume = Sharpe 2.0+** — anchor reversal ใหม่ที่แรงมาก (midpoint แทน close/open)
2. **ตัด group_neutralize ดัน fit 0.98→0.99** (กู้ returns ตาม lesson) — best config: no-group + decay 8 SUBINDUSTRY
3. **family ceiling ~0.99** — close-range/midpoint reversal ตันที่นี่ (เดิม close-range 0.95-0.96) decay/neutralization/truncation/momentum-mix ไม่ข้าม 1.0
4. **ผสม 52w-momentum เจือจาง Sharpe 2.0→1.65 ทำ fit แย่ลง** — อย่าเจือจาง signal ที่ Sharpe สูงอยู่แล้ว

## ความคืบหน้า fitness ตลอด session (กลยุทธ์ใหม่ได้ผลชัด)
- รอบ 3-8 (ก่อนแก้ระบบ): ตัน 0.85-0.96
- รอบ 9 (feasibility + volume amplify): GroeQEpO fit 1.04 ✅ ผ่าน fitness! แต่ self-corr 0.80 (ซ้ำ)
- รอบ 10 (anchor ใหม่): fit 0.99 Sharpe 2.02 — แข็งแกร่งสุด แต่ family ceiling

## ข้อสรุปเชิงโครงสร้าง (ครบถ้วน)
ต้องผ่าน 2 ด่านพร้อมกันบน USA delay1:
- **fitness ≥1.0** = ต้อง returns ≥0.15 → มีแค่ตระกูล reversal/price-volume (× volume amplify)
- **self-corr <0.70** = ต้องกลไกใหม่ ไม่ซ้ำพูล
- **2 เงื่อนไขขัดกัน**: signal returns-สูง = reversal (พูลหนาแน่น corr สูง); signal กลไกใหม่ = returns ต่ำ (fit ไม่ถึง)
- midpoint × volume (fit 0.99) เกือบ break ด่าน 1 แต่ยังเป็น reversal (ด่าน 2 เสี่ยง)

## ถัดไป
- midpoint × volume เป็น near-miss คุณภาพสูงสุด เก็บไว้
- ทางออกจริงของ 2-gate problem: **เปลี่ยน region/delay** (พูลบางลง → ด่าน 2 ง่ายขึ้น + อาจ returns สูงขึ้น) — USA TOP3000 delay1 พิสูจน์แล้วว่าตีบตันทั้ง fitness ceiling + corr saturation
