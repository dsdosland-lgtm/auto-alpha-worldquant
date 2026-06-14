# Run Report — 2026-06-09 (รอบ 8)

## โจทย์
ผู้ใช้สั่ง "หาวิจัยใหม่ๆ" (อยู่ USA TOP3000 delay1) → researcher หา signal family ที่**ไม่เคยแตะ**จากงานวิจัยใหม่: options, sentiment, skewness, cross-sectional lead-lag

## สรุป
- ไอเดียใหม่ 5 ตัว จาก data category ใหม่ทั้งหมด — **ค้นพบว่า BRAIN มี dataset รวยมาก** (options/sentiment/customer/skewness verified จริง)
- ผล: **ตกหมด** (ติดข้อจำกัดเชิงปฏิบัติ ไม่ใช่ field ไม่มี)
- เข้า submit-queue: **0 ตัว** · simulate ~12 ครั้ง

## ผลรายตัว
| idea_id | best result | ปัญหา |
|---------|-------------|-------|
| options-iv-call-put-spread | Sharpe 0.83 | ❌ CONCENTRATED_WEIGHT (options ครอบคลุมไม่ครบหุ้น → น้ำหนักกระจุก) |
| put-call-open-interest-ratio | Sharpe 0.45 | ❌ CONCENTRATED_WEIGHT (เหมือนกัน) |
| news-buzz-sentiment | Sharpe -0.10 | turnover 1.30 ระเบิด, flat |
| realized-skewness | Sharpe 0.08 | flat (signal ตาย) |
| **customer-momentum (rel_ret_cust)** | **Sharpe -1.25 → พลิก +1.25** | turnover 1.10 ระเบิด — edge ผูกกับ 1-day signal, smooth แล้ว Sharpe ตก (→0.57-0.76) |

## ข้อค้นพบสำคัญ (data discovery)
**BRAIN tier เรามี dataset เยอะกว่าที่เคยรู้** (verified จริงทั้งหมด):
- **Options**: `implied_volatility_call_30/720`, `implied_volatility_put_30/720`, `implied_volatility_mean_skew_30`, `pcr_oi_all/30/60`, `pcr_vol_all`, `put_call_volatility_slope_twenty_eight_day`
- **Sentiment**: `scl12_buzz`, `scl12_sentiment`, `snt_buzz_ret`, `snt_social_volume`, `snt_social_value`, `daily_equity_mood_indicator`
- **Skewness สำเร็จรูป**: `mdl177_pricemomentumfactor_skew90drtn`
- **Supply-chain**: `rel_ret_cust` (customer return — Cohen & Frazzini เป๊ะ), `industry_relative_return_5d/4w`
- operators: `ts_regression`, `group_mean(x,weight,group)` มีจริง; **`ts_skewness` ไม่มี**

## ทำไมตก (ไม่ใช่เพราะ field ไม่มี)
1. **options data sparse บน TOP3000** → CONCENTRATED_WEIGHT fail (หุ้นมี options ไม่ครบ universe). อาจต้องใช้ universe ที่ liquid-options เช่น TOP500 หรือ filter
2. **sentiment buzz turnover สูงมาก** (เปลี่ยนรายวัน noisy)
3. **customer momentum (rel_ret_cust) มี edge จริง (Sharpe ±1.25)** แต่ edge อยู่ใน 1-day signal → turnover 1.10; smooth = Sharpe ตก = untameable standalone
4. **skewness สำเร็จรูป flat** บน daily

## ข้อเสนอ
- customer-momentum (`rel_ret_cust`) มี Sharpe magnitude 1.25 — แรงสุดในรอบ — เก็บเป็น near-miss, อาจเป็น orthogonal component ใน combo (แม้ turnover สูง)
- options signal น่าลองบน **TOP500** (liquid options) เพื่อแก้ CONCENTRATED_WEIGHT — แต่ผู้ใช้ยังไม่เปลี่ยน universe หลัก
- ยืนยันอีกชั้น: USA TOP3000 delay1 หาตัวผ่านยากมากแม้ใน data category ใหม่
