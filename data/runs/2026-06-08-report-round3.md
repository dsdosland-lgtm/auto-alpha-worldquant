# Run Report — 2026-06-08 (รอบ 3)

## สรุป
- ไอเดียใหม่ที่ค้น: **5 ตัว** (researcher เติม backlog — เน้น orthogonal กับ price-reversal/close-range ที่ขุดเยอะแล้ว)
- ผ่านทุก check → submit-queue: **0 ตัว**
- near-miss (มีแวว): **2 ตัว** (Sharpe ผ่าน 1.25+ ติดแค่ LOW_FITNESS)
- ก้ำกึ่ง: 1 ตัว · ตกไกล: 2 ตัว
- simulate ทั้งหมด: ~21 ครั้ง (5 base + พลิกทิศ + tuner sweeps)

## ผลรายตัว
| idea_id | best expr/setting | Sharpe | Fitness | สถานะ |
|---------|-------------------|--------|---------|-------|
| intraday-upside-capture-ratio | `rank(-ts_decay_linear(winsorize((high-open)/(high-low+0.001),std=3),5))` decay4 | **1.52** | **0.77** | near-miss (ดีสุด) |
| volume-asymmetry-updown | `-rank(group_neutralize(winsorize(ts_sum(volume*sign(close-ts_delay(close,1)),10)/adv20,std=3),subindustry))` decay0 | 1.36 | 0.62 | near-miss |
| rolling-price-volume-correlation | `rank(-ts_corr(ts_rank(volume,10),ts_rank(returns,10),10))` | 1.00 | 0.29 | ก้ำกึ่ง (returns ต่ำ) |
| volume-acceleration-demand-pressure | พลิกแล้ว Sharpe 0.94 / TO 1.35 | 0.94 | 0.15 | ตกไกล (turnover ระเบิด) |
| corwin-schultz-spread-proxy-reversal | ทั้ง 2 ทิศ TO 1.24 | ±0.61 | 0.08 | ตกไกล |

## ข้อสังเกตหลัก
1. **ทั้ง 2 near-miss ติดเพดาน fitness เพราะ returns ต่ำ ไม่ใช่ turnover** — เป็น pattern ซ้ำกับ vwap/close-range รอบก่อน. ลด turnover (decay) = Sharpe+returns ตกตาม → fitness ไม่ขึ้น
2. **การแก้ denominator (open-low)→(high-low) ให้ ratio bounded [0,1]** ดัน fitness intraday-upside จาก 0.50→0.77 (บทเรียนสำคัญ)
3. **2 ใน 5 ไอเดียต้องพลิกเครื่องหมาย** (OBV และ intraday-upside เป็น reversal/fade ตรงข้ามสมมติฐาน) — ย้ำ lesson "เจอ Sharpe ติดลบแรง ลองกลับเครื่องหมายก่อนทิ้ง"
4. **signal ที่มี ts_delta(volume) หรือ ts_zscore(log(high/low)) → turnover ระเบิด >1.2** (volume-acceleration, corwin-schultz) — second-order/fast signal บน volume noisy เกิน

## ผลต่อระบบ
- ไม่มีตัวเข้า submit-queue → `/review-candidates` ยังไม่มีของใหม่จากรอบนี้
- near-miss 2 ตัวบันทึกแล้วใน `data/near-miss.md` — intraday-upside (fit 0.77) ใกล้สุด ถ้าจะ deep-tune ต่อควรหา orthogonal signal เพิ่ม returns ไม่ใช่ลด turnover
