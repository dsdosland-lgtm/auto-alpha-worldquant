# Run Report — 2026-06-08 (รอบ 7)

## โจทย์
ลอง lever สุดท้ายในกรอบ USA TOP3000 delay1: **fix UNITS warning** ของ close-range ใน combo 0.96 เผื่อปลดล็อก 0.04 สุดท้าย

## ผล (3 sims)
| variant | Fitness | UNITS | หมายเหตุ |
|---------|---------|-------|---------|
| centered `(2*close-high-low)/(high-low)` + winsorize | 0.94 | ⚠️ ยังอยู่ | normalize ไม่ลบ UNITS |
| winsorize ratio | 0.93 | ⚠️ ยังอยู่ | winsorize ตัด returns → fit ลด |
| base + truncation 0.06 | 0.96 | ⚠️ ยังอยู่ | = truncation 0.08 |

## ข้อสรุป
- **UNITS warning fix ไม่ได้ + ไม่กระทบ fitness** — มันติดอยู่เสมอ winsorize กลับทำ fit ลด
- **ยืนยัน 0.96 = hard ceiling ของ USA TOP3000 delay1** — ลอง ~7 รอบ ~20 signal families + combo/weighting/decay/universe/truncation/UNITS ครบทุก lever ไม่มีอะไรทะลุ 1.0
- รากปัญหา: returns ต่ำเชิงโครงสร้างของ USA delay1 (ดู memory + lessons)
- **เข้า submit-queue: 0 ตัว**

## ทางต่อ (ต้องเปลี่ยน data axis)
การวน /find-alphas บน USA TOP3000 delay1 ต่อไปจะไม่ให้ตัวผ่าน — ต้องเปลี่ยน region/delay/dataset เท่านั้น (รอผู้ใช้ตัดสินใจ)

## สินทรัพย์สะสม (พร้อมใช้ทันทีถ้าเปลี่ยน data ได้)
- best near-miss: close-range+momentum−OBV combo (fit 0.96, Sharpe 1.83)
- submitted แล้ว 2 ตัว (price-volume divergence, overnight reversal)
