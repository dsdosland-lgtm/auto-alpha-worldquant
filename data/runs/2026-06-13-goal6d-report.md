# Run Report — 2026-06-13 goal6d (/goal "หาอัลฟ่า submit ได้ 3 ตัว รันยาวจนเจอ")

queued: 0
submitted: 3

## 🏆 GOAL COMPLETE: SUBMIT 3/3 (project #27-29, pool เรา 29 / 38 ACTIVE)
| # | alpha_id | กลไก | Sharpe/fit | corr |
|---|---|---|---|---|
| 27 | `58v267EN` | UAP unexpected-payables × rev10 | 1.69/1.28 | 0.6024 |
| 28 | `npWX3Qwx` | **DSO × CLOSE-RANGE** (price-niche ที่ 2!) | 2.10/1.50 | 0.6536 |
| 29 | `O09297Wv` | asset-turnover × close-range | 1.61/1.19 | 0.6919 |

## 🔑 ค้นพบ: MULTIPLE PRICE-NICHE CLUSTERS (ขยาย interpolation breakthrough #10)
- rev10 cluster เต็มที่ 5 ตัว (#23-27). พยายามขยายด้วย fresh core × rev10 → ชน 0.73-0.91 (cluster อิ่ม)
- **close-range `-(close-low)/(high-low)` = combining-price niche ที่ 2** — intraday reversal, cross-section ต่างจาก ts_delta-rev10 → **core ที่ rev10 corr-fail หลุดได้** (DSO 0.77→0.65, asset-turnover 0.73→0.69; price ต่างลด shared-price-corr กับ rev10 cluster)
- ❌ magnitude (signed-jump/intraday-vol/MAX) combine อ่อน (Sharpe 0.77-0.95) — มีแต่ reversal-family (rev10/close-range/VWAP) ที่ combine-additive
- ❌ reuse core เดิม × price ใดก็ชน rev10-version 0.83-0.91 (fundamental 3× dominate) — ต้อง fresh core
- ❌ working-cap cores correlate กันเอง — กระจายข้าม niche (inventory→rev10, DSO→close-range)
- ❌ core คล้าย diversification/investment (capex/ERC) ชน #23 0.77-0.89

## ~30 sims รอบนี้ · UAP จาก mdl177_earningsqualityfactor (sibling ของ winner)
## เปิดต่อ: VWAP = price-niche ที่ 3? + fresh core × close-range/VWAP. ROI session goal6 รวม = 10 ตัว
