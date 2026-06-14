# Run Report — 2026-06-09 (รอบ 9) — แก้ระบบ + พิสูจน์

## โจทย์ผู้ใช้
"ปรับปรุงแก้ไขที ทำไมหาไม่ค่อยเจอ" → วินิจฉัย root cause + แก้ระบบ + พิสูจน์

## วินิจฉัย root cause (ด้วยคณิตของ fitness)
- `fitness ≥ 1.0` ⟺ `returns ≥ turnover/sharpe²`
- 2 ตัวที่ผ่าน (รอบ 1-2): returns **0.158-0.174** → ผ่าน
- near-miss รอบ 3-8: returns แค่ **0.11-0.14** → ตันทุกตัว = **คอขวด returns ไม่ใช่ tuning**
- สาเหตุ returns ตก: (1) 2 anomaly returns-สูงถูกเก็บไปแล้ว; (2) รัด orthogonal แน่นเกิน หนีไปหา momentum/options/sentiment returns-ต่ำ; (3) เสีย sims tune ทางตัน

## แก้ระบบ (knowledge files)
1. **submission-criteria.md**: เพิ่ม FITNESS FEASIBILITY PRE-SCREEN (required_returns = TO/sharpe²) + เกณฑ์ returns≥0.15 + ลำดับ lever (Sharpe>returns>turnover) + กลยุทธ์ "ขุดตระกูลที่ชนะ ไม่หนีไปของแปลก"
2. **lessons-learned.md**: เพิ่ม ROOT CAUSE block ด้านบนสุด ให้ทุก agent อ่านก่อน

## พิสูจน์ว่าแก้ถูก — เจอตัวผ่านทันที 🎉
ขุดตระกูลที่ชนะ (overnight reversal returns 0.174) × volume/adv20 (amplify returns):
| variant | Sharpe | Fitness | TO | Returns |
|---------|--------|---------|-----|---------|
| overnight×vol decay0 | 1.97 | 0.95 | 0.84 | 0.193 (TO fail) |
| decay6 | 1.97 | 1.04 | 0.708 | 0.199 (TO fail นิดเดียว) |
| **decay7** | **1.91** | **1.04** | **0.662** | **0.195** ✅ ผ่านทุก check |
| decay8 | 1.85 | 1.02 | 0.624 | 0.190 ✅ |
| decay9 | 1.80 | 1.01 | 0.592 | 0.186 ✅ |
| divergence×volatility decay4 | 1.65 | 0.92 | 0.56 | 0.175 |

→ **GroeQEpO (decay 7) เข้า submit-queue** Sharpe 1.91 / fit 1.04 / returns 0.195

## ข้อควรระวัง
- GroeQEpO = overnight reversal × volume → **มี DNA ร่วมกับ submitted ทั้ง 2 ตัว** self-corr API empty=ผ่าน แต่ **ต้องเช็คมือก่อน submit** (อาจซ้ำ)
- ของจริงที่พิสูจน์: feasibility screen + ขุดตระกูลชนะ + × volume amplify returns = สูตรหาตัวผ่าน

## ถัดไป
- รัน `/review-candidates` เช็ค corr มือ GroeQEpO ก่อนตัดสิน submit
- หา passer ที่ orthogonal กว่านี้: หา signal returns-สูงตระกูลใหม่ (ไม่ใช่ ×volume ของที่ submit) — ยากบน USA แต่ feasibility screen จะช่วยไม่ให้เสีย sims
