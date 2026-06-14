# Run Report — 2026-06-13 goal6 ("หาอัลฟ่าที่ submit ได้ 5 ตัว" — อัตโนมัติเต็มรูปแบบ)

queued: 0
submitted: 3

## ผลลัพธ์: SUBMIT 3/5 (โปรเจกต์ #20-#22, pool เรา 22 ตัว) — เจอ 2 niche ใหม่ + recipe ใหม่
| # | alpha_id | กลไก (มิติใหม่) | universe | Sharpe/fit | returns | self-corr |
|---|---|---|---|---|---|---|
| 20 | `88LXkq9a` | dividend-growth / payout (Michaely-Thaler-Womack) | TOP3000 INDUSTRY | 1.34/1.32 | 0.140 | 0.6926 |
| 21 | `e7rExEQz` | EPS forecast standard-skewness × dividend | TOP3000 SUBIND | 1.68/1.05 | 0.048 | 0.541 |
| 22 | `zqWekpZO` | **sales forecast Bowley-skewness — SPECTACULAR** | TOP3000 SUBIND | 2.03/**3.56** | 0.384 | 0.54 |

## 🔑 BREAKTHROUGH ที่ 9: ANALYST FORECAST-DISTRIBUTION SHAPE (anl4)
- **มิติใหม่ทั้งแผง:** การกระจายตัวของ analyst estimates (รูปร่าง distribution) ไม่อยู่ใน pool เลย — orthogonal กับ attractor (corr เดี่ยวของ skewness = 0.34!)
- **RECIPE: Bowley-skewness `(high+low−2*median)/(high−low)` ของ analyst estimates** → sales = SPECTACULAR (fit 3.56, returns 0.384). EPS-Bowley/quarterly/EBIT/Δ ทั้งหมด redundant (corr 0.78-0.93 vs sales) = **forecast-SHAPE เป็น 1 niche** แต่ standard-skewness ≠ Bowley (0.54) → ได้ 2 ตัว
- **orthogonal-anchor recipe:** `2.5×(anchor corr ต่ำ เช่น skewness 0.34) + dividend booster` → กด composite corr 0.71→0.54 (booster อื่น OCF/share-issuance load attractor → composite พุ่ง 0.71-0.81)
- dividend-growth (payout) เป็นมิติใหม่ที่ 3 — INDUSTRY neut แก้ sub (0.52→0.70), TOP500/1000 collapse, recency-weight/yield ตาย

## ทำไมไม่ครบ 5 (หลักฐานว่า orthogonal space หมดจริง — ~103 sims, researcher 3 รอบ)
- **j2go6pmO + d5Qz7erx attractor กินทุก fundamental signal:** diversification (Lang-Stulz 1.44) corr 0.78, EBIT-Bowley 0.78, OCF-growth 0.76, DSO-level 0.70, share-issuance 0.81, labor-prod/interest-cov/asset-growth/gross-margin = sub-collapse
- **forecast-shape vein = 2 ตัวจริง** (sales-Bowley + standard-skew); EPS/EBIT/quarterly/Δ Bowley = redundant 0.78-0.95
- **interpolation/dilution trick ใช้ไม่ได้** เมื่อไม่มี orthogonal-anchor headroom (EBIT-Bowley 0.78 ทั้ง heavy-EBIT→zqW, heavy-div→88LX; diversification+EBIT co-load j2go6pmO→0.80). e7rExEQz รอดเพราะ skewness anchor 0.34 จริง
- universe-axis แห้ง (dividend/skew@TOP500/1000 collapse, sales-Bowley@TOP500=CONCENTRATED 0.5)
- analyst revision/dispersion/LTG อ่อน (0.79-0.99); OTM-options-skew/IV-level/VRP-gap dead; Tobin's Q/acquisitions/wage-rigidity/timing/diversification-Δ flat-or-locked

## Next
- **#4-5 ต้องรอ axis เปิด:** OS-fail (ทั้ง 22 PENDING — ปลด niche conditional npWqOj3a/omYGW56l/YPAEbvGW) / BRAIN เปิด tier ใหม่ (EUR ยังปิด) / dataset ใหม่ / freeze reset
- recipe Bowley-forecast-skew = เครื่องมือใหม่ใช้ซ้ำได้เมื่อ region/tier เปิด
- IQC freeze ปลายมิ.ย. — 22 alphas เข้า OS แล้ว
