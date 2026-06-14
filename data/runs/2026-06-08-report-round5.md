# Run Report — 2026-06-08 (รอบ 5)

## โจทย์รอบนี้ (2 ทิศทาง)
1. ทดสอบ lever **universe เล็กลง** กับ combo ที่ดีสุด (fitness 0.82) เพื่อดันทะลุ 1.0
2. หา signal **returns สูง** (event-driven/trend) มาเป็น component ที่ 4 — แก้คอขวด returns ต่ำที่เจอซ้ำทุกรอบ

## สรุป
- combo TOP1000: **fitness 0.85** (ดีสุดของ session) แต่ยังไม่ถึง 1.0
- ไอเดียใหม่ returns-สูง: **5 ตัว ตกหมด**
- เข้า submit-queue: **0 ตัว**

## ผล lever 1: combo บน universe เล็กลง
| universe | decay | Sharpe | Fitness | TO |
|----------|-------|--------|---------|-----|
| TOP3000 | 2 | 1.50 | 0.82 | 0.417 |
| **TOP1000** | **2** | **1.49** | **0.85** | 0.414 |
| TOP1000 | 3 | 1.40 | 0.84 | 0.350 |
| TOP1000 | 1 | 1.53 | 0.77 | 0.547 |
| TOP500 | 2 | 1.12 (หลุด) | 0.56 | — |

→ **TOP1000 ช่วยจริง** (returns 0.124→0.134, momentum สะอาดกว่าใน large-cap) ดัน fitness +0.03 แต่ sub-universe Sharpe เริ่มตึง

## ผล lever 2: signal returns-สูง (ทั้ง 5 ตก)
| idea_id | Sharpe | Returns | สถานะ |
|---------|--------|---------|-------|
| earnings-surprise-drift-pead (SUE) | -0.12 | -0.005 | ตก (flat, TO 0.024 แทบไม่ขยับ) |
| earnings-estimate-revision-momentum | -0.58 | -0.041 | ตก |
| cash-flow-yield-surprise (FCF growth) | -0.26 | -0.006 | ตก (flat) |
| price-momentum-acceleration | -0.57 | -0.050 | ตก |
| high-volume-breakout-continuation | -1.16 | -0.088 | ตก (พลิก +1.16 แต่ TO 0.67 ตึง + ซ้ำ reversal) |

→ **fundamental/event field verify เจอจริงทุกตัว** (standardized_unexpected_earnings, mdl177_earningmomentumfactor_rev6, mdl77_2gdna_pctchgfcf, free_cash_flow_reported_value) **แต่ signal อ่อน/flat บน USA daily** — PEAD/revision ไม่มี directional drift ใน backtest, turnover ต่ำมาก (quarterly update)

## ข้อสรุปเชิงระบบ (สำคัญ)
1. **คอขวด returns เป็นปัญหาเชิงโครงสร้างของ USA TOP3000/TOP1000 delay1** — price/microstructure signal = Sharpe สูง (1.3-1.5) / returns ต่ำ (~0.11); fundamental/event signal = อ่อน (Sharpe < 0.6 / returns ≈ 0). ไม่มี signal family ใดให้ returns สูงในชุดที่ลองมา 5 รอบ
2. **PEAD/analyst-revision/FCF ไม่ work บน daily ที่นี่** แม้ทฤษฎีบอก returns สูง — อาจเพราะ delay1 + quarterly update + universe ใหญ่ทำให้ event edge เจือจาง
3. **combo + TOP1000 = ทางที่ดีที่สุดที่หาได้** (fitness 0.85) แต่ diminishing returns

## ผลต่อระบบ + ข้อเสนอ
- 0 ตัวเข้าคิว → `/review-candidates` ไม่มีของใหม่
- ทางที่ยังไม่ได้ลองเพื่อแก้คอขวด returns: (1) **region อื่น** (EUR/ASI/CHN อาจมี return edge ต่างจาก USA ที่ arbitrage หนัก), (2) **delay 0** (ใช้ข้อมูลวันเดียวกัน returns อาจสูงขึ้น), (3) dataset ใหม่ (news/sentiment/options) ที่ยังไม่ได้สำรวจ
- มี near-miss คุณภาพดีสะสม: combo TOP1000 (fit 0.85), 52w-high, intraday-upside, OBV — พร้อม deep-tune ถ้าเจอ data ใหม่
