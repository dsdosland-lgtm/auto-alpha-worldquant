# Run Report — 2026-06-09 (รอบ 11) — ทดสอบเปลี่ยน data axis

## โจทย์
ผู้ใช้อนุมัติเปลี่ยน data axis → ทดสอบ best near-miss (midpoint×volume) บน region/delay ใหม่

## ผลลัพธ์: เจอข้อจำกัด tier (สำคัญที่สุด)
- 🔒 **region USA เท่านั้นที่ใช้ได้** — EUR, CHN, GLB, ASI, JPN ตอบ "not available" (400) ทุกตัว
- **delay 0 (USA) ใช้ได้ แต่เกณฑ์โหดกว่ามาก:** LOW_SHARPE limit **2.0** (vs 1.25), LOW_FITNESS limit **1.3** (vs 1.0)
- **signal ที่ชนะบน delay 1 พังหมดบน delay 0:**
  | signal | delay0 Sharpe | (bar 2.0) |
  |--------|---------------|-----------|
  | midpoint×volume | 0.91 | ❌ |
  | overnight×volume | 0.45 | ❌ |
  | price-volume divergence | 0.74 | ❌ |
  | customer-momentum | 1.64 | ❌ (ดีสุดแต่ยังไม่ถึง) |

## ข้อสรุปขอบเขตที่ทำได้ทั้งหมด (mapped ครบ)
| axis | สถานะ |
|------|-------|
| region EUR/CHN/GLB/ASI/JPN | ❌ not available (tier locked) |
| USA delay 1 | ✅ ใช้ได้ — 2-gate cap ~1.0, พูลอิ่มตัว corr สูง |
| USA delay 0 | ✅ ใช้ได้ — bar 2.0/1.3 สุดโหด, signal delay-1 ไม่ translate |
| universe TOP3000/1000/500 | ✅ (ไม่แก้ปัญหาหลัก) |

## บทสรุปตรงไปตรงมา
**submittable alpha ใหม่หายากเชิงโครงสร้างบน tier นี้** — ไม่ใช่ระบบบกพร่อง แต่เป็นข้อจำกัดจริง:
1. USA delay1 = 2-gate ขัดกัน (returns-สูง=reversal พูลเต็ม corr สูง / กลไกใหม่=returns ต่ำ)
2. USA delay0 = bar สูงลิ่ว signal เราไม่ถึง
3. region อื่น = ล็อก
4. 2 ตัวที่ submit สำเร็จ = ตอนพูลยังว่าง (โอกาสทองที่ผ่านไปแล้ว)

## ทางเลือกที่เหลือจริง
1. **ยอมรับสถานะ** (2 submitted) รอ tier upgrade / dataset ใหม่เปิด
2. **grind USA delay1** หา mechanism ใหม่ returns≥0.15 ที่ corr<0.70 (ยากแต่ feasibility screen ช่วยไม่ให้เปลือง)
3. **ลุย delay 0** หา signal high-freq/same-day ที่ทำ Sharpe 2.0+ (ยากมาก เป็น research ใหม่ทั้งหมด)
