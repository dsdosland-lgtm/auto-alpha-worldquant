# Deep Research — Momentum / Quality / Accruals (4 classic anomalies + การผสม)

**วันที่:** 2026-06-10 · **วิธี:** deep-research harness (5 angles, 21 sources, 87 claims → 25 verified → 23 confirmed / 2 killed)
**papers:** Jegadeesh-Titman 1993 · Carhart 1997 · Sloan 1996 · Novy-Marx 2013

## บทสรุป
4 anomaly แปลงเป็น cross-sectional signal ได้ แต่ insight สูงสุดคือ **การผสม factor ที่ correlation ติดลบกัน**

## ข้อค้นพบที่ verify แล้ว (high confidence)
1. **Novy-Marx GP** = (REVT − COGS) / AT — LONG high, SHORT low. มี predictive power พอๆ กับ book-to-market. **= `gross_profit_to_assets_ratio` บน BRAIN เป๊ะ** [JFE 2013 verbatim]
2. **GP corr ติดลบกับ value:** characteristic rank −18%, **strategy-return −0.57/−0.58** → GP เป็น "the other side of value" (growth ที่ hedge value)
3. **50/50 GP+value → Sharpe 0.85 (2.5× ตลาด), orthogonal กับ momentum.** Combined-rank double-sort earned **7.4%/ปี vs 3.5%/ปี แบบ side-by-side** → 🔑 **double-sort ชนะ การรัน factor แยกกัน**
4. **Value+momentum corr −0.60** (cross-asset; US single-stock ~−0.54) → 50/50 ชนะตัวเดี่ยว
5. ⚠️ **1.42 Sharpe ของ value+momentum = global cross-asset (8 asset classes + inverse-vol) ไม่ transfer มา single-asset USA equity** — research เตือนเอง ตั้งความคาดหวัง Sharpe ให้สมจริง
6. **momentum caution:** canonical = 12-1 skip-month (medium-term); recent-month = reversal. **short-term reversal regime-dependent: แรงสุดเมื่อ turnover ต่ำ + PTH (price-to-52w-high) ต่ำ, พลิกเป็น momentum เมื่อทั้งคู่สูง** [Chen-Stivers-Sun 2024]
7. **momentum crashes:** negatively skewed, crash ใน panic states (หลังตลาดร่วง+vol สูง) — partly forecastable, dynamic scaling เพิ่ม Sharpe เท่าตัว [Daniel-Moskowitz 2016]
8. **QMJ (Asness-Frazzini-Pedersen):** quality = low accruals + high GP/assets, corr ติดลบกับ HML → "quality at reasonable price"
9. 2 claims ถูก kill: "value+quality double-sort เฉพาะเจาะจง" (1-2), "UMD ไม่มี positive..." (1-2)

## Implication ต่อ alpha (สำคัญ → ทดสอบจริงแล้ว)
- **GP (Novy-Marx) = ตัวถ่วงที่ผมพบว่าดีสุด (RMW/GP-reversal 0.96)** — research ยืนยันกลไก
- **"double-sort ชนะ side-by-side"** → GP-conditioned reversal (= double-sort) ชนะ additive sleeve — **ตรงกับผลทดลอง: additive combo เจือจางหมด**
- **momentum/accruals/value อ่อนเดี่ยวๆ บน USA daily** → diversification math ใช้ไม่ได้ (ผสมของอ่อนไม่เกิดของแรง)

แหล่งหลัก: Novy-Marx OSoV/QDoVI · AMP 'Value & Momentum Everywhere' (JF 2013) · Daniel-Moskowitz NBER w20439 · Chen-Stivers-Sun JEF 2024
→ ผลแปลงเป็น alpha: `2026-06-10-report-round15.md`
