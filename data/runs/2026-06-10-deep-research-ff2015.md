# Deep Research — Fama & French (2015) Five-Factor Model

**วันที่:** 2026-06-10 · **วิธี:** deep-research harness (5 angles, 19 sources fetched, 71 claims → 25 verified adversarially → 22 confirmed / 3 killed)

## บทสรุป
FF (2015) ต่อยอด 3-factor (market, SMB size, HML value) ด้วย **2 factor ใหม่**:
- **RMW (Robust Minus Weak)** — profitability factor
- **CMA (Conservative Minus Aggressive)** — investment factor

สมการ: `Rit−RFt = ai + bi(RMt−RFt) + si·SMBt + hi·HMLt + ri·RMWt + ci·CMAt + eit`

## ข้อค้นพบที่ verify แล้ว (high confidence)
1. **โมเดล 5 ปัจจัยอธิบาย average returns ดีกว่า 3 ปัจจัย** (1993) — unanimous 3-0 [JFE primary]
2. **HML กลายเป็น redundant ใน US data (1963-2013) เมื่อเพิ่ม RMW+CMA** — intercept ของ HML regression ≈ 0, ถูกดูดซับโดย factor อื่น (โดยเฉพาะ corr ~0.7 กับ CMA). ⚠️ scope เฉพาะ US — FF 2017 พบ HML ยังมีพลังใน Europe/Japan
3. **Operating Profitability (RMW input)** = (revenue − COGS − SG&A − interest) / book equity — fiscal year t−1 [JFE verbatim]
4. **Investment (CMA input)** = asset growth = (assets_{t−1} − assets_{t−2}) / assets_{t−2} [JFE + Ken French]
5. **valuation theory:** ถือ B/M + profitability คงที่ → investment สูง = expected return ต่ำ; ควบคุมตัวอื่น → profitable สูง + B/M สูง = return สูง (cross-section: profitability t=2.55, asset growth t=−3.87). **กำหนด sign: long high-profitability / low-investment / high-B/M**
6. **2×3 sorts:** NYSE median size × 30th/70th percentile ของ B/M, OP, Inv → 6 portfolios ต่อ characteristic
7. **AQR caveat (Asness-Frazzini 'Devil in HML's Details'):** HML redundancy ส่วนหนึ่งเป็น artifact จาก **stale price** ใน B/M construction. ใช้ **timely (current) price กับ market cap แต่ lag book equity** → value signal ดีขึ้น (HML-DEV) คืน intercept significant. ⚠️ AQR มี marketing incentive, HML-DEV โหลด momentum แฝง
8. **CMA contested out-of-sample:** German market (2002-2019) พบ CMA "clearly insignificant"

## 3 claims ที่ถูก refute (โปร่งใส)
- AQR "ยืนยัน" FF redundancy → ผิด (AQR **โต้แย้ง** ผ่าน HML-DEV)
- profitability = earnings/book → ผิด (FF ใช้ **operating** profitability ไม่ใช่ earnings)
- restatement HML-redundancy จาก blog → vote ไม่ผ่าน

## Implication ต่อการสร้าง alpha (สำคัญ → นำไปทดลองจริง)
- **RMW (profitability) คือ factor ใหม่ที่แข็งสุดของ 2015** → ใช้เป็น conditioning signal ได้ดี
- **CMA อ่อน** (redundant abroad, insignificant) → คาดว่าอ่อนบน USA daily เช่นกัน (ยืนยันด้วยการทดลอง: Sharpe −0.25)
- value timely-price (AQR) เป็น lever สำรองถ้าจะดัน HML

แหล่งหลัก: JFE 116(1) primary PDF · Ken French Data Library · AQR Devil-in-HML · Hanauer et al. SBR 2020 · Springer

---
ผลการแปลงเป็น alpha จริง → ดู `2026-06-10-report-ff2015-alpha.md`
