# Run Report — Fama-French (1993) Deep Research → Alpha

**วันที่:** 2026-06-10
**โจทย์:** Deep research งานวิจัย Fama & French (1993) 'Common Risk Factors in the Returns on Stocks and Bonds' (JFE 33) แล้วแปลง 3 ปัจจัยเป็น alpha
**ขอบเขต:** USA / TOP3000 / delay 1 (เดียวที่ tier ทำได้)

---

## 1. สรุปงานวิจัย (สำหรับ translate เป็น signal)
Fama-French 1993 เสนอ **5 risk factors** (3 หุ้น + 2 พันธบัตร) — ใช้ได้เฉพาะ 3 ตัวหุ้นใน cross-section equity:
1. **Market (RM−RF)** — excess market return / beta. ไม่ใช่ cross-sectional alpha ในตัว (มันคือตลาด) → ใช้เป็นแนวคิด neutralization
2. **SMB (Small Minus Big)** — size premium: หุ้นเล็กชนะหุ้นใหญ่. proxy = market cap (`cap`). signal = `-log(cap)` (เล็ก=long)
3. **HML (High Minus Low)** — value premium: book-to-market สูง (value) ชนะต่ำ (growth). proxy = `mdl177_fa_bp` (BVPS/price)
- (TERM, DEF เป็น bond factor — ไม่ applicable)
- วิธีสร้างพอร์ตจริงของ FF = 2×3 double-sort บน size × B/M → แรงบันดาลใจ interaction size×value

## 2. ผลการทดลอง (18 simulations)

### A. FF factors บริสุทธิ์ — อ่อน/ติดลบ (ตรงกับ lessons เรื่อง fundamental บน USA daily)
| factor | expression | Sharpe | หมายเหตุ |
|--------|-----------|--------|---------|
| SMB size | `-log(cap)` | **-0.12** | size premium ตาย/flat ช่วงนี้ |
| HML value | `mdl177_fa_bp` | **-0.51** | value ติดลบ = **growth ชนะ value** (สอดคล้องตลาดจริงหลัง 2010) |
| value-timing 5yr | `rel5ybp` | -0.36 | |
| industry-rel B/M (flip) | `-curindbp` | 0.43 | turnover 0.02 ช้าเกิน |

→ ยืนยัน: FF เป็น slow fundamental factor, returns/Sharpe ไม่พอบน daily แต่ **orthogonal ของแท้** (gate 2 ผ่านง่าย)

### B. FF × ตระกูลที่ชนะ (interaction) — ดึง returns ขึ้นได้
| idea | Sharpe | Fitness | TO | Returns | sub-univ | ปัญหา |
|------|--------|---------|-----|---------|----------|------|
| SMB size × overnight reversal | 1.28 | 0.63 | 0.82 | 0.201 | 0.46 | TO เกิน + self-corr เสี่ยง |
| **HML value × price-vol reversal** ⭐ | **1.43–1.66** | **0.83** | 0.50–0.61 | **0.15–0.167** | **1.1–1.3** | ติดแค่ fitness |
| value × size double-tilt | 1.14 | 0.56 | 0.46 | 0.109 | 0.20 | size ทำ sub-universe พัง |

## 3. ตัวเด่น (near-miss) — FF HML value-conditioned reversal ⭐
```
-ts_zscore(close, 5) * winsorize(mdl177_fa_bp, std=3)
settings: USA TOP3000 delay1 · SECTOR · decay 5 · trunc 0.08   (alpha mLXmXAG2)
→ Sharpe 1.43 · Fitness 0.83 · TO 0.496 · Returns 0.167 · sub-universe 1.14
```
- **กลไก:** ตระกูล price-volume reversal (-ts_zscore(close,5)) ถ่วงด้วย **HML book-to-market แทน volume** → reversal แรงขึ้นในหุ้น value
- **จุดแข็ง:** sub-universe Sharpe 1.1-1.3 (robust สูง), returns เกิน 0.15, **orthogonal กับ submitted (ใช้ B/M ไม่ใช่ volume)**
- **เพดาน:** fitness 0.83 — returns/Sharpe trade-off ล็อก (เปลี่ยน neut/decay ดัน returns 0.15→0.167 แต่ Sharpe ตกพอดี)

## 4. สรุป
- **ผ่านเกณฑ์ submit: 0 ตัว** — ตรงตามข้อจำกัดเชิงโครงสร้าง 2-gate ของ USA delay1 ([[returns-bottleneck-usa-delay1]])
- **near-miss แข็ง: 1 ตัว** (FF HML value-reversal, fitness 0.83, orthogonal) → บันทึกใน near-miss.md
- **ตกไกล: FF factors บริสุทธิ์ทั้ง 4** (fundamental อ่อนบน daily ตามที่ documented)
- ค้นพบใหม่: **HML (book-to-market) ใช้เป็น conditioning weight บน reversal ได้ดีกว่าใช้เป็น signal เดี่ยว** — ให้ Sharpe 1.6 + sub-universe robust สูงสุดในบรรดา near-miss เดี่ยว
- **submit-queue ว่าง** — ไม่มีตัวใหม่เข้าคิว

## 5. ข้อเสนอ
1. เก็บ FF-value-reversal เป็น orthogonal component → ผสมกับ midpoint-reversal (fit 0.99) ในรอบ combo เพื่อลอง break 1.0
2. FF ยืนยันอีกครั้งว่า fundamental บริสุทธิ์ไม่ผ่านบน USA delay1 — คุณค่าของมันคือ orthogonality ไม่ใช่ standalone return
