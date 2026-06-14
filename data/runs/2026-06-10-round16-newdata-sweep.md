# Run Report — รอบ 16 (2026-06-10): สวีป dataset ใหม่ (Google Doc reading list + Stage 0)

**ที่มา:** Google Doc reading list (Finding Alphas, 101 Alphas, FF, momentum, **news sentiment/Tetlock**, **BAB**, TSMOM, attention) + ระบบใหม่ (dataset-map Stage 0: ขุด dataset ที่พูล self-corr ว่าง)
**ขอบเขต:** USA TOP3000 delay1 · ทดสอบกลไก **non-reversal** ที่พูลว่าง

## ผลทดลอง (12 simulations — ครบ 4 batch)
| กลไก | dataset | expression แกน | Sharpe | ปัญหา |
|------|---------|---------------|--------|------|
| news sentiment level | news18 | mean_event/composite_sentiment | −0.36 / −0.02 | turnover 0.83-0.99 ระเบิด |
| news sentiment smoothed | news18 | ts_mean(sentiment,5) | −0.47 | flat-neg |
| earnings sentiment | news18 | ts_mean(earnings_eval_sentiment,5) | 0.09 | flat |
| sentiment × relevance | news18 | sentiment×entity_relevance | −0.45 | flat-neg |
| sentiment shock | news18 | ts_delta(sentiment,3) | −0.24 | turnover 1.13 |
| news impact projection | news18 | ts_mean(news_impact,5) | −0.10 | flat |
| **BAB low-beta** | beta | −beta_last_90/360_spy | −0.16 / −0.18 | CONCENTRATED_WEIGHT fail |
| **distress anomaly** | model53 | ±PD_1m / PD_1y | −0.14 / 0.18 | flat |
| **earnings announcement effect** | earnings4 | announcement_effect_2 | 0.45 | CONCENTRATED_WEIGHT fail, sub −0.28 |

## ข้อสรุป
- **กลไก non-reversal ใหม่ทั้งหมด (news/sentiment/BAB/distress/earnings) = แบน** (Sharpe −0.5 ถึง +0.45 ไม่มีตัวใกล้ 1.25)
- **news sentiment (Tetlock) ไม่ทำงานบน USA daily cross-section** — level noisy (turnover ระเบิด), smoothed flat. ตรงกับรอบ 8 (scl12 sentiment flat)
- **BAB / distress / earnings = fundamental slow** → flat ตามทุก fundamental ที่ลองมา 16 รอบ
- **พูล self-corr "ว่าง" ในกลไกเหล่านี้ เพราะมัน*ไม่เวิร์ค*บน axis นี้ ไม่ใช่เพราะไม่มีใครลอง**

## 🔚 ข้อสรุปขั้นสุด (หลัง 16 รอบ, ~65 sims, ครบทุก dataset หลัก)
**USA TOP3000 delay1 มี tradeable returns source เดียว = short-term reversal (Sharpe 1.5-2.1)** ซึ่ง **พูลบัญชีอิ่มตัวแล้ว → self-corr สูง**. กลไก non-reversal ทุกตัว (momentum, value, profitability-เดี่ยว, accruals, CMA, size, **news, sentiment, BAB, distress, earnings, options, customer, skewness**) = flat (Sharpe < 0.5).

**2-gate เป็น hard structural constraint ของ axis นี้:**
- gate 1 (returns≥0.15) ผ่านได้แค่ reversal
- gate 2 (self-corr<0.7) reversal ตกเพราะพูลซ้ำ
- ไม่มีกลไกใดผ่านทั้งสอง

**ทางออกที่เหลือ (ไม่ใช่การ sim เพิ่มบน axis นี้):**
1. **delay 0** (bar Sharpe 2.0/fit 1.3 — ต้อง signal คนละแบบ high-freq)
2. **tier upgrade** (region อื่น / universe เล็กสำหรับ options)
3. ยอมรับ GP-reversal (fit 0.96) เป็น best แล้วเช็ค self-corr มือว่าผ่านไหม

## state สำหรับ resume
- tried-registry.jsonl: 27 entries (ครบ session นี้)
- dataset-map.md: อัปเดต news18/model53/earnings4/beta = explored-flat
- เหลือ 🔴 ยังไม่ขุดจริง: model16 (fundamental scores), model51 (risk metrics) — คาดว่า flat ตาม pattern
- best near-miss คงเดิม: GP-reversal fit 0.96 (3qAX7j3P)
