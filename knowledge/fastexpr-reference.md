# FASTEXPR Reference (WorldQuant BRAIN)

FASTEXPR คือภาษา expression สำหรับเขียน alpha บน BRAIN ผลลัพธ์ของ expression = "น้ำหนัก/สัญญาณ" ต่อหุ้นแต่ละตัวในแต่ละวัน ระบบจะ neutralize + scale ตาม settings ให้เอง

> ใช้ MCP tool `get_operators` เพื่อดึงรายการ operator จริงทั้งหมด (เป็น source of truth) ไฟล์นี้คือสรุปตัวที่ใช้บ่อยไว้อ้างอิงเร็ว

## หลักคิด
- output เป็น cross-sectional vector (ค่าต่อหุ้นในวันนั้น) ค่าบวก = long, ลบ = short
- alpha ที่ดี = Sharpe สูง + Fitness สูง + **turnover ไม่สูงเกิน** + **correlation ต่ำ** กับ alpha ที่มีอยู่
- มักครอบ `rank(...)` หรือ `zscore(...)` รอบนอกเพื่อทำให้ cross-sectional และทนค่า outlier

## 1. Time-series (มองย้อนหลัง d วัน ต่อหุ้น)
| Operator | ความหมาย |
|----------|---------|
| `ts_delta(x, d)` | x วันนี้ − x เมื่อ d วันก่อน |
| `ts_delay(x, d)` | ค่า x เมื่อ d วันก่อน |
| `ts_mean(x, d)` | ค่าเฉลี่ย d วัน |
| `ts_std_dev(x, d)` | ส่วนเบี่ยงเบนมาตรฐาน d วัน |
| `ts_sum(x, d)` | ผลรวม d วัน |
| `kth_element(x, d, k=N)` | **ค่าที่ N ใหญ่สุดใน d วัน** (k 1-indexed, k=1=max, k=0 ERROR). ⚠️ **ไม่มี `ts_max`/`ts_min`** ใช้ตัวนี้แทน |
| `ts_arg_max/ts_arg_min(x, d)` | index ของจุดสูง/ต่ำสุด (ไม่ใช่ค่า) |
| `ts_rank(x, d)` | อันดับของ x วันนี้เทียบกับ d วันที่ผ่านมา (0–1) |
| `ts_zscore(x, d)` | (x − mean)/std ในกรอบ d วัน |
| `ts_corr(x, y, d)` | correlation ระหว่าง x,y ใน d วัน |
| `ts_regression(y, x, d)` | regression coefficient |
| `ts_decay_linear(x, d)` | ถ่วงน้ำหนักเชิงเส้น ให้วันล่าสุดหนักสุด (ลด turnover) |

## 2. Cross-sectional (เทียบข้ามหุ้นในวันเดียว)
| Operator | ความหมาย |
|----------|---------|
| `rank(x)` | อันดับเปอร์เซ็นไทล์ 0–1 ข้ามหุ้น |
| `zscore(x)` | normalize เป็น z-score ข้ามหุ้น |
| `scale(x, scale=1)` | ปรับให้ผลรวม abs = scale |
| `normalize(x)` | หัก mean |
| `quantile(x, driver=...)` | แปลงเป็น quantile |
| `winsorize(x, std=4)` | ตัด outlier ที่เกิน N std |

## 3. Group (คิดภายในกลุ่ม sector/industry)
กลุ่มที่ใช้: `market`, `sector`, `industry`, `subindustry`
| Operator | ความหมาย |
|----------|---------|
| `group_rank(x, group)` | rank ภายในกลุ่ม |
| `group_zscore(x, group)` | z-score ภายในกลุ่ม |
| `group_neutralize(x, group)` | หัก mean ของกลุ่ม (ทำให้ group-neutral) |
| `group_mean(x, weight, group)` | ค่าเฉลี่ยถ่วงน้ำหนักในกลุ่ม |

## 4. Arithmetic / Math
`+ - * /`, `abs(x)`, `log(x)`, `sqrt(x)`, `power(x, e)`, `signed_power(x, e)`, `sign(x)`, `min(x,y)`, `max(x,y)`, `reverse(x) = -x`

## 5. Logical / Conditional
`x > y`, `x < y`, `x == y`, `&&`, `||`, `if_else(cond, a, b)`
`trade_when(trigger, alpha, exit)` — เปิดสถานะเมื่อ trigger จริง, ปิดเมื่อ exit (คุม turnover/timing)

## 6. Vector / transform
`vec_avg`, `vec_sum` (กับข้อมูล vector field), `vector_neut(x, y)` (ทำ x ตั้งฉากกับ y)

## Data fields ที่พบบ่อย (delay 1, EQUITY)
`open, high, low, close, volume, vwap, returns, cap, sharesout, adv20`
ดู field จริงตาม region/dataset ด้วย MCP `get_data_fields`

## ตัวอย่าง alpha
| Expression | แนวคิด |
|-----------|--------|
| `rank(-ts_delta(close, 5))` | short-term reversal (ตกแรง → เด้ง) |
| `ts_rank(ts_corr(close, volume, 20), 60)` | ความสัมพันธ์ราคา-วอลุ่ม |
| `group_neutralize(rank(returns), subindustry)` | momentum แบบ sector-neutral |
| `-ts_corr(rank(close), rank(volume), 10)` | price-volume divergence |
| `trade_when(volume > ts_mean(volume,20), -ts_delta(close,5), -1)` | reversal เฉพาะวัน volume สูง |
| `rank(ts_mean(returns,5) / (ts_std_dev(returns,20)+1e-6))` | risk-adjusted momentum |

## กฎคุณภาพ: อย่าจบที่ `rank(raw)` เดี่ยว ⚠️
บทเรียนจากการรันจริง (2026-06-08): expression แบบ `rank(raw_signal)` ดิบๆ มัก **Sharpe < 0.3 ตกไกล** เพราะไม่มี structure กัน noise/outlier และเทียบผิดกลุ่ม ตัวอย่างที่ตก:
- `rank(ts_sum(returns,252) - ts_sum(returns,21))` → Sharpe 0.10 (momentum ดิบ)
- `rank(-ts_std_dev(returns,20))` → Sharpe 0.08 (low-vol ดิบ)
- `rank(-winsorize((income-cashflow_op)/total_assets_amount, std=3))` → Sharpe 0.26 (accrual)

**ต้องมีอย่างน้อย 1 ชั้นจัดการสัญญาณก่อน rank/zscore รอบนอก:**
- **ทน outlier:** `winsorize(x, std=3)` หรือ `zscore(x)` ก่อน rank — จำเป็นมากกับ fundamental
- **เทียบในกลุ่ม:** ใช้ `group_rank(x, subindustry)` / `group_neutralize(x, sector)` แทน rank ทั้งตลาด เมื่อสัญญาณมี sector/size bias (value, vol, momentum)
- **นิ่งตามเวลา:** `ts_rank(x, d)` / `ts_zscore(x, d)` แทน snapshot วันเดียวเมื่อ raw แกว่งแรง
- **scale ด้วย risk:** momentum/return หาร `ts_std_dev(returns, d)` ก่อน rank (ดูตัวอย่าง risk-adjusted momentum)

แนวตามชนิดสัญญาณ:
- **fundamental/slow** (accrual, value): winsorize/zscore + decay ≥4 + neutralization INDUSTRY/SUBINDUSTRY เกือบเสมอ
- **momentum:** เลี่ยง rank ตรง → `group_rank` ใน subindustry หรือ scale ด้วย volatility
- **vol/low-risk:** อย่า rank std ดิบ → ลองทำ beta/idio-vol แบบ neutralize หรือเทียบในกลุ่ม

## Fitness (เป้าหมายที่ optimize)
```
fitness = sqrt(abs(returns) / max(turnover, 0.125)) * sharpe
```
→ อยากได้ returns สูง, sharpe สูง, **turnover ต่ำ** จะดัน fitness ขึ้น

## ⭐ Order-statistics family (kth_element) — returns source ที่ไม่ใช่ reversal (2026-06-10)
**ตัวที่ทำให้ break ได้ alpha submit จริงตัวแรก (QPQYqvAW, fit 1.05, corr 0.695):**
```
-(kth_element(returns,42,k=1) + kth_element(returns,42,k=2) + kth_element(returns,42,k=3))
  * winsorize(gross_profit_to_assets_ratio, std=3)
{INDUSTRY, decay 5, trunc 0.04, TOP3000 delay1}
```
- **กลไก = MAX lottery anomaly (Bali-Cakici-Whitelaw 2011):** short หุ้นที่มี "วันบวกสุดขั้ว" (top-N max daily returns) — lottery demand → overpriced → underperform
- **ทำไมสำคัญ: เป็น returns source ที่ "ไม่ใช่ cumulative reversal"** → corr กับพูล reversal ต่ำ (0.695 vs GP-reversal 0.90) แม้ใช้ field `returns` เหมือนกัน เพราะ single-extreme-day ≠ ts_mean/ts_sum/ts_zscore
- 🔑 **เทคนิคคุม turnover ของ order-statistic:** single-max (k=1) turnover ระเบิด (0.84, max-day rolls บ่อย) → **sum top-3 (k=1+k=2+k=3) ทำให้ max นิ่ง turnover 0.84→0.44** = กุญแจให้ fit ข้าม 1.0 (top-2 ได้ 0.85-0.98, top-3 = 1.03-1.05)
- 🔑 **× winsorize(gross_profit_to_assets) = quality-conditioned booster** ดัน returns 0.19→0.26 (เหมือน GP-reversal); decay 5-6 + trunc 0.04 = sweet spot
- **family ใหม่ที่ยังขุดต่อได้:** `kth_element` ของ `abs(returns)` (extreme vol), `-returns` หรือ k จากท้าย (MIN = วันลบสุดขั้ว), `range/high-low`, `volume` — order-statistics เป็นมิติ behavioral ที่พูลยังว่าง

## ⚠️ FASTEXPR gotchas (เจอจริง — กัน sim เสีย)
- **`kth_element(x, d, k=N)`**: k ต้องเป็น **named arg + positive integer** (`k=1`). `k=0` → ERROR "must be positive integer". k=1 = ตัวใหญ่สุด
- **`ts_max`/`ts_min` ไม่มีจริง** — ใช้ `kth_element(x,d,k=1)` (สูงสุด) หรือ `ts_rank` (percentile)
- **`hump(x, hump=0.01)`**: ต้อง named arg (`hump=`), 1 input. **ค่า hump บน rank signal (0-1) ที่ 0.01-0.03 แรงเกิน** → freeze trading (turnover → 0.01). ใช้ระวัง
- **`group_zscore`/`winsorize` บน field ที่ coverage ไม่เต็ม (options/IV) → ขยาย outlier = CONCENTRATED_WEIGHT fail + Sharpe ปลอม.** ใช้ `rank()` (uniform weight) แทนเพื่อ fix concentration (แต่จะเผย Sharpe จริงที่อ่อนลง)
- **kth_element window 42/63/126 มัก dominate วันเดียวกัน** → ผลเหมือนกันเป๊ะ ไม่ต้อง sweep window
