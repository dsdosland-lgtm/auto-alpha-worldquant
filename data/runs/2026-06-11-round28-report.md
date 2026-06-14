# Run Report — รอบ 28 (2026-06-11)

## เป้าหมาย
niche ที่ 5 — รอบนี้เลิกแตะ intraday-semivar family (ปิดรอบ 27) หันไปทดสอบ backlog family อื่นที่ยัง "new" + ไม่เคย sim จริง

## สิ่งที่ทำ
1. เช็ค tried-registry → พบ #39 MIN-extreme-loss (`E5K6EYrP`) **เคย sim แล้ว FLAT 0.02** (backlog mark new ค้าง — แก้แล้ว)
2. **Simulate abs(returns) order-statistic (#40 extreme-vol two-sided tail)** 2 variant (no-weight + ×GP) — never simmed, ต่อยอด MAX family ที่ submit สำเร็จ
3. ปิดเคส backlog "new" ที่เหลือด้วยหลักฐานเดิม (range/frog-in-pan/CGO/residual-momentum)

## ผล simulate
| alpha_id | expr | Sharpe | fit | returns | verdict |
|---|---|---|---|---|---|
| N1OPV138 | `-(kth_element(abs(returns),42,k=1..3))` | 0.44 | 0.26 | 0.107 | rejected (flat) |
| gJ3W1KLe | abs-MAX ×GP | 0.44 | 0.26 | 0.107 | rejected (เท่ากันเป๊ะ) |

- **ผ่านคิว: 0** | rejected: 2 sim + 4 inferred-closed

## บทเรียน (รอบ 28)
- 🔑 **ปิดเคส order-statistic family เด็ดขาด:** MAX upside (QPQYqvAW booked) ทำงาน · MIN downside bottom-3 = 0.02 · abs two-sided top-3 = 0.44 → **lottery/extreme-tail anomaly เป็น upside-specific เท่านั้น** การรวม downside เจือจาง signal. ×GP weight ไม่ช่วยเมื่อ base อ่อน
- ⚙️ `kth_element(abs(returns),...)` **ไม่ hang** (ต่างจาก `close/open-1` derived) — abs ของ base field OK
- **backlog "new" บน USA d1 = หมดเกลี้ยง** หลัง clean รอบนี้ (39/40 sim-closed, 41/42/43/44 inferred-closed ด้วยหลักฐานเดิม)

## สถานะรวม (3 รอบติด 0 queued)
**USA TOP3000 delay1 = exhausted จริง.** ทุก magnitude transform บน pv1 (total/intraday/order-stat ทุกฝั่ง) + conditioner + cross-moment + higher-order + path + liquidity + dataset อื่น = booked / corr-attractor / flat. tier region ยังล็อก. delay0 ปิด.

## ทิศทางรอบหน้า (อย่าเสีย sim ซ้ำ)
1. **TIER-RECHECK เป็นระยะ** — re-probe EUR/GLB/CHN ทุกครั้งที่ submit สะสมเพิ่ม/ผ่านช่วงเวลา; เปิดเมื่อไร = พื้นที่ orthogonal ใหม่ทั้งแผง = frontier จริงเดียวที่เหลือ
2. **OS-monitor** — ถ้า alpha ตัวใดตก OS (เฝ้า RRrE1VNj corr 0.84) → niche เก่าว่าง
3. **deep-research axis ที่ต่างจริง** — return stream นอก total/intraday/overnight, หรือ event-magnitude ที่ไม่ sparse (ยังไม่พบ candidate ที่ผ่านเกณฑ์)
4. 4 ตัวที่ submit แล้ว = portfolio orthogonal ที่ดีสำหรับ IQC2026S2 อยู่แล้ว
