# Deep Research Round 25 — 2026-06-11
## Academic Anomaly Research: Higher-Moment / Cross-Moment / Conditional-Structure Magnitudes

> สถานะ pool: 11 ACTIVE alphas จอง reversal×volume/value, MAX-order-statistics, signed-jump, ATM-IV-skew, value/leverage/earnings-yield/turnover
> Breakthrough lesson: magnitude ทุกตัว corr กันได้ต่ำถ้า STRUCTURE/MOMENT ต่างกัน (MAX vs signed-jump = 0.42)
> เป้าหมาย: หา transform ใหม่ของ magnitude ที่จับ moment/structure ต่างจากที่จองแล้ว

---

## สรุป backlog ที่ต้องหลีกเลี่ยง (ซ้ำแน่)

| idea_id ที่มีแล้ว | family |
|---|---|
| realized-skewness-reversal (line 29) | cubic moments / negative skewness = negative future returns |
| good-bad-volatility-rsj (line 46) | RS+/RS- ratio = signed-jump variant |
| capital-gains-overhang-disposition (line 43) | CGO displacement reference price |
| residual-idiosyncratic-momentum (line 44) | ts_regression residual momentum |
| frog-in-the-pan (line 42) | momentum-quality sign pattern |
| max-lottery-gp-conditioned (line 38) | SUBMITTED |
| signed-jump XgK9528a | SUBMITTED |

---

## 8 กลไกใหม่ที่เสนอ (เรียงตามโอกาสผ่าน 2-gate)

---

### กลไกที่ 1: Realized Kurtosis (Fourth Moment) Cross-Section Predictor
**ชื่อ+งานวิจัย:** Amaya, Christoffersen, Jacobs, Vasquez (2011/2015, JFE) "Do Realized Skewness and Kurtosis Predict the Cross-Section of Equity Returns?"

**ทำไม returns >= 0.15 (magnitude-based อย่างไร)**
Realized kurtosis วัด fourth-power moment ของ daily returns: `RKurt ∝ ts_sum(power(returns,4), d) / ts_std_dev(returns,d)^4`
ค่าสูง = tail returns (extreme moves ทั้งสองทิศ) มีมากผิดปกติ
งานวิจัยพบ positive relationship: หุ้นที่ kurtosis สูง (fat tails) ให้ returns สูงกว่า เพราะตลาดต้องการ premium สำหรับ tail risk
Weekly strategy long high kurtosis / short low kurtosis: +16bps/week (t-stat 2.12)
Fourth moment ใหญ่กว่า squared-moment → magnitude ดิบสูงกว่า → returns สูงกว่า

**ทำไม corr ต่ำกับ reversal/MAX/signed-jump**
- vs reversal: reversal = cumulative returns (first moment), kurtosis = fourth-power moment
- vs MAX: MAX = single-day extreme, kurtosis = average of all fourth-power returns (กระจาย evenly ทุกวัน) — structure ต่างมาก
- vs signed-jump: signed-jump = RS+ − RS− (two-sided semivariance asymmetry), kurtosis = total fourth moment ไม่แยกทิศ — kurtosis captures symmetric tail risk, signed-jump captures asymmetric tail direction

**FASTEXPR Expression:**
```
rank(group_neutralize(winsorize(
  ts_sum(power(returns, 4), 21) / power(ts_std_dev(returns, 21), 4)
, std=3), subindustry))
```
- ทิศทางบวก (kurtosis สูง = tail risk ต้องการ premium = long)
- window 21 วัน (weekly paper ใช้ 5d แต่ daily ต้องยืดเพื่อ stability)
- decay 2-4, truncation 0.04
- ทางเลือก unnormalized: `rank(group_neutralize(winsorize(ts_sum(power(returns,4),21), std=3), subindustry))` — อาจได้ returns สูงกว่าเพราะ magnitude ดิบ ไม่ normalize (บทเรียนจาก signed-jump: normalize ฆ่า magnitude)

**ความเสี่ยงหลัก**
- Paper ยืนยัน kurtosis-returns เฉพาะ weekly horizon (5d) ใช้ intraday data — daily proxy จาก close-to-close อาจอ่อนกว่า
- Kurtosis สูงสัมพันธ์กับ MAX (fat tails กับ single extreme day corr กัน) — ต้องเช็คว่า corr กับ MAX pool ต่ำพอ
- Unnormalized version อาจ corr สูงกับ reversal-vol ถ้า high kurtosis = high volatility เสมอ

---

### กลไกที่ 2: Coskewness (Systematic Skewness Premium) — Harvey & Siddique 2000
**ชื่อ+งานวิจัย:** Harvey & Siddique (2000, JF) "Conditional Skewness in Asset Pricing Tests"

**ทำไม returns >= 0.15 (magnitude-based อย่างไร)**
Coskewness = sensitivity ของ stock returns ต่อ squared market returns:
`coskew ∝ ts_corr(returns, power(market_return, 2), d)`
หุ้นที่ coskew สูง (positive) หมายถึง returns ขึ้นพร้อมกับ market volatility สูง — investors demand LOWER premium เพราะดีตอน market bad
หุ้นที่ coskew ต่ำ (negative) = returns ลงพร้อม market variance สูง = hedging cost สูง → ต้องการ HIGHER premium
Long-short coskewness portfolio: premium 3.60% per year
**กลไกเป็น cross-moment** ระหว่าง stock magnitude กับ market squared-move — จึงจับ magnitude จาก market perspective ไม่ใช่ own-stock perspective

**ทำไม corr ต่ำกับ reversal/MAX/signed-jump**
- vs reversal: reversal ใช้ own-stock cumulative return, coskewness ใช้ correlation กับ market squared — axis ต่างกันสิ้นเชิง
- vs MAX: MAX ใช้ own-stock single-day extreme, coskewness ใช้ comovement กับ market variance — cross-moment vs own-moment
- vs signed-jump: signed-jump วัด asymmetry ของ own squared returns, coskewness วัด covariance กับ market's squared returns — fundamentally different structure

**FASTEXPR Expression:**
```
rank(group_neutralize(
  -ts_corr(returns, power(ts_mean(returns, 1) - ts_mean(returns, 252), 2), 252)
, subindustry))
```
หรือ proxy ที่ง่ายกว่า โดยใช้ equal-weight universe return เป็น market proxy:
```
rank(group_neutralize(
  -ts_corr(returns, power(group_mean(returns, 1, market) - ts_mean(group_mean(returns,1,market), 20), 2), 63)
, subindustry))
```
แนวที่ implement ได้จริงโดยไม่ต้องการ market_return field:
```
-rank(group_neutralize(winsorize(
  ts_corr(returns, power(vwap / ts_delay(vwap, 1) - 1, 2), 63)
, std=3), subindustry))
```
- ทิศทางลบ (coskewness สูง = positive = stocks go up with market variance = investors pay premium = expected return ต่ำ)
- vwap เป็น proxy ของ intraday market-price direction (ไม่สมบูรณ์แต่ available)
- window 63-252 วัน, decay 0-3

**ความเสี่ยงหลัก**
- ไม่มี market_return field โดยตรงบน BRAIN — ต้องใช้ proxy (vwap, index ETF) อาจ noisy
- Coskewness เป็น cross-moment ที่ estimated ด้วย corr × squared: variance ของ estimator สูง → Sharpe อาจอ่อน
- Paper ใช้ monthly coskewness (252d window) — daily window สั้นกว่าอาจ noisier

---

### กลไกที่ 3: Vol-of-Vol (Uncertainty About Risk) Daily Proxy
**ชื่อ+งานวิจัย:** Baltussen, van Bekkum, van der Grient (2018, JFQA) "Unknown Unknowns: Uncertainty About Risk and Stock Returns"

**ทำไม returns >= 0.15 (magnitude-based อย่างไร)**
Vol-of-vol = volatility of volatility = `ts_std_dev(ts_std_dev(returns, 5), 20)`
หุ้นที่ vol-of-vol สูง = ความไม่แน่นอนเกี่ยวกับ risk level สูง → investors ต้องการ premium สำหรับ "unknown unknowns"
กลไกเป็น second-order magnitude: magnitude ของ magnitude เอง
งานวิจัยพบ premium 8% per year (VOV สูง underperform, VOV ต่ำ outperform)
ไม่ใช่ vol ดิบ แต่เป็น variability ของ vol — ต่างกับ IVOL standalone ที่ตายแล้ว

**ทำไม corr ต่ำกับ reversal/MAX/signed-jump**
- vs reversal: reversal = price level cumulative, vol-of-vol = second-order variance structure
- vs MAX: MAX = single-day extreme, vol-of-vol = variance ของ rolling short-vol ← structure ต่างมาก เพราะ MAX วัดค่าสูงสุด, vol-of-vol วัด variability ของ vol regime
- vs signed-jump: signed-jump = asymmetry direction ของ squared returns, vol-of-vol = magnitude ของ vol fluctuation ไม่แยกทิศ

**FASTEXPR Expression:**
```
-rank(group_neutralize(winsorize(
  ts_std_dev(ts_std_dev(returns, 5), 20)
, std=3), subindustry))
```
- ทิศทางลบ (vol-of-vol สูง = uncertainty สูง = underperform = short)
- window inner 5 วัน (short-term vol), outer 20 วัน (vol ของ vol)
- decay 2-4, truncation 0.04
- ทางเลือก: outer window 42 วัน, หรือ inner window 3 วัน

**ความเสี่ยงหลัก**
- Paper ใช้ implied volatility (options) ไม่ใช่ realized vol — daily realized proxy อาจ noisy กว่า
- Vol-of-vol correlates กับ vol level (low-vol stock มี low vol-of-vol ด้วย) → อาจ corr กับ BAB/IVOL ที่ตายแล้ว
- Sharpe อาจอ่อน เพราะ second-order signal noisy กว่า first-order magnitude

---

### กลไกที่ 4: CGO Volume-Weighted Reference Price (Deep Tune ของ Lead ค้าง)
**ชื่อ+งานวิจัย:** Grinblatt & Han (2005, JFE); Frazzini (2006, JF) — turnover-weighted reference price

**ทำไม returns >= 0.15 (magnitude-based อย่างไร)**
CGO = (close − RP) / close โดย RP = turnover-weighted average past price
หุ้นที่ CGO สูง (ราคาสูงกว่า cost basis มาก) = winners ที่ investors ยังถือ = disposition effect ทำให้ selling pressure ต่ำ → momentum ต่อ
สูตร Frazzini RP = Σ(V_t × Π(1 − V_{t+1..T}) × P_t) / k
Daily BRAIN proxy: `RP = ts_sum(close * volume / ts_sum(volume, 252), 252)` = volume-weighted average price ใน 252 วัน
ต่างจาก รอบ 23 (decay-RP, VWAP-RP) ตรงที่ใช้ volume เป็น weight (ไม่ใช่ linear decay)

**ทำไม corr ต่ำกับ reversal/MAX/signed-jump**
- vs reversal: reversal = cumulative negative returns, CGO = unrealized gain relative to cost basis ← ทิศตรงข้าม
- vs MAX: MAX = extreme single day, CGO = long-horizon price relative to cost basis
- vs signed-jump: fundamentally different data structure (price level vs squared return asymmetry)
- ⚠️ อาจ corr กับ reversal pool เพราะ CGO สูง = price ขึ้นมาจาก base = reversal ต่ำ — ต้องเช็ค

**FASTEXPR Expression (Volume-Weighted RP — แก้ไขจาก round 23 ที่ CONCENTRATED):**
```
rank(group_neutralize(winsorize(
  (close - ts_sum(close * volume, 252) / (ts_sum(volume, 252) + 0.001))
  / (ts_sum(close * volume, 252) / (ts_sum(volume, 252) + 0.001) + 0.001)
, std=3), subindustry))
```
- ทิศทางบวก (CGO สูง = winners ยังถือ = momentum ต่อ)
- ใช้ rank() wrapper แก้ CONCENTRATED ที่พบรอบ 23
- window 252 วัน (ใช้ RP สั้นกว่า: 126 วัน ลองด้วย)
- decay 5-8

**ความเสี่ยงหลัก**
- รอบ 23 ทดลอง decay-RP และ VWAP-RP แล้วทั้งคู่อ่อน (returns 0.144 Sharpe 0.5 CONCENTRATED)
- Volume-weighted version = Frazzini's formulation ที่ถูกต้องกว่า แต่อาจยัง CONCENTRATED เพราะ fundamental problem
- corr กับ reversal pool อาจสูง (CGO = price movement เชิง level)

---

### กลไกที่ 5: MAXbeta — Idiosyncratic MAX (Beta-Neutral)
**ชื่อ+งานวิจัย:** Bali, Ince, Ozsoylev (2026) "MAX on Steroids: A New Measure of Investor Attraction to Lottery Stocks" SSRN 6065166

**ทำไม returns >= 0.15 (magnitude-based อย่างไร)**
MAXbeta = residual ของ MAX หลัง regress ออก systematic (beta × market_MAX):
`MAXbeta = MAX − beta × MAX_market`
วัด lottery demand ที่ clean จาก systematic factor — ให้ anomaly ที่แรงกว่า MAX ดิบ
Implementation: `MAX_idio = kth_element(ts_regression(returns, mkt_proxy, 63), 42, k=1..3)`
กลไก: lottery demand ที่ driven โดย idiosyncratic tail ไม่ใช่ systematic risk

**ทำไม corr ต่ำกับ reversal/MAX/signed-jump**
- vs MAX (pool QPQYqvAW): MAX ดิบ vs MAX residual จาก beta — ต่างโดย structure การตัด systematic component
- corr กับ MAX pool น่าจะสูงกว่า 0.70 เพราะ base signal เดียวกัน (kth_element returns)
- ⚠️ ความเสี่ยงหลักคือ corr กับ submitted QPQYqvAW สูงแน่ — base signal ซ้ำกัน

**FASTEXPR Expression:**
```
-(kth_element(ts_regression(returns, vwap/ts_delay(vwap,1)-1, 63), 42, k=1)
 + kth_element(ts_regression(returns, vwap/ts_delay(vwap,1)-1, 63), 42, k=2)
 + kth_element(ts_regression(returns, vwap/ts_delay(vwap,1)-1, 63), 42, k=3))
```
- ทิศทางลบ (idiosyncratic MAX สูง = lottery overpriced = short)
- vwap ratio เป็น market proxy
- decay 4-6, truncation 0.04, INDUSTRY neutralization

**ความเสี่ยงหลัก**
- BASE SIGNAL ซ้ำกับ MAX ที่ submit แล้ว → corr สูงแน่ อาจเกิน 0.70
- ลอง simulate เพื่อเช็ค corr เท่านั้น ถ้าผ่าน corr จะมีโอกาสจริง
- ts_regression rettype ต้องเป็น residual (rettype=0)

---

### กลไกที่ 6: Residual Momentum (Blitz 2011) — Deep Tune ของ Lead ค้าง
**ชื่อ+งานวิจัย:** Blitz, Huij, Martens (2011, JEF) "Residual Momentum"

**ทำไม returns >= 0.15 (magnitude-based อย่างไร)**
residual momentum ≠ raw momentum (ที่ตายแล้ว)
residual_t = ts_regression(returns, market_proxy, 63, 0) — ตัด factor noise
ts_sum(residual, 21) skip 5d = pure idiosyncratic momentum
งานวิจัย: profit ~2x ของ raw momentum, consistent กว่า, ไม่ crash เพราะตัด factor loading
ยังไม่เคย test จริงจัง (สถานะ 🟠 ใน mechanism-map)

**ทำไม corr ต่ำกับ reversal/MAX/signed-jump**
- vs reversal: momentum (บวก) vs reversal (ลบ) → ทิศตรงข้าม
- vs MAX: momentum = cumulative residual returns (21d), MAX = single-day extreme (42d)
- vs signed-jump: momentum = direction-based, signed-jump = variance asymmetry

**FASTEXPR Expression:**
```
rank(group_neutralize(winsorize(
  ts_sum(ts_regression(returns, vwap / ts_delay(vwap, 1) - 1, 63), 21)
, std=3), subindustry))
```
- ทิศทางบวก (residual momentum สูง = continue)
- vwap ratio เป็น market proxy สำหรับ factor regression
- decay 2-4 (momentum ชอบ decay ต่ำ), truncation 0.04
- ทางเลือก: skip 5d วันล่าสุด `ts_sum(ts_delay(ts_regression(...),5), 21)` เพื่อหลีก reversal contamination

**ความเสี่ยงหลัก**
- momentum family ตาย flat (Sharpe<0.6) บน USA delay1 — แม้ residual อาจต่างกันแต่ risk สูง
- ts_regression rettype=0 คืน residual จริงหรือเปล่า ต้องเช็คก่อน (อาจ=1 คือ predicted value)
- vwap เป็น market proxy ที่ imperfect (individual stock vwap ไม่ใช่ market vwap)

---

### กลไกที่ 7: Extreme Downside Beta (Conditional Covariance on Extreme Negative Days)
**ชื่อ+งานวิจัย:** Ang, Chen, Xing (2006, RFS) "Downside Risk"; Chen, Dong, Lin (2023, SSRN) "Extreme Downside Risk in the Cross-Section of Asset Returns"

**ทำไม returns >= 0.15 (magnitude-based อย่างไร)**
Extreme downside beta = covariance ระหว่าง stock returns กับ market เฉพาะวันที่ market return ต่ำกว่า threshold (เช่น ต่ำกว่า mean − 1 SD)
`beta_down = ts_corr(returns, mkt_proxy, 63) เฉพาะวันที่ mkt_proxy < ts_mean(mkt_proxy, 63) − ts_std_dev(mkt_proxy, 63)`
สูงกว่า downside beta ทั่วไป: เน้นเฉพาะ extreme negative market days
งานวิจัย 2023: premium 3.9% per year (extreme downside exposure สูง = underperform)
ต่างจาก BAB/downside-beta ที่ตายเพราะ "extreme" threshold filter เพิ่ม selectivity

**ทำไม corr ต่ำกับ reversal/MAX/signed-jump**
- vs reversal: cross-moment กับ market, ไม่ใช่ own-price reversal
- vs MAX: beta = covariance (magnitude ข้าม), MAX = own extreme (magnitude เดี่ยว)
- vs signed-jump: signed-jump = own asymmetric variance, downside beta = conditional market covariance

**FASTEXPR Expression:**
```
-rank(group_neutralize(winsorize(
  ts_corr(
    returns,
    max(vwap / ts_delay(vwap, 1) - 1 - ts_mean(vwap / ts_delay(vwap, 1) - 1, 63), 0),
    63
  )
, std=3), subindustry))
```
หรือ proxy ที่ตรงกว่า (conditional covariance เฉพาะวันตลาดลง):
```
-rank(group_neutralize(winsorize(
  ts_corr(
    returns,
    min(ts_mean(returns,1) - ts_mean(ts_mean(returns,1), 63), 0),
    63
  )
, std=3), subindustry))
```
- ทิศทางลบ (extreme downside beta สูง = underperform = short)
- window 63 วัน, decay 2-4

**ความเสี่ยงหลัก**
- BAB/downside-beta ตายแล้ว (🟡 ใน mechanism-map รอบ 16-17) — extreme version อาจยังตาย
- ใช้ market proxy ที่ imperfect (universe average return ≠ true market)
- Conditional covariance ยาก implement ใน BRAIN อย่างถูกต้อง (ไม่มี conditional operator)

---

### กลไกที่ 8: Max-Volume-Day Return (Attention/Informed Trading Proxy)
**ชื่อ+งานวิจัย:** Barber & Odean (2008, RFS) "All That Glitters" — attention buying; Llorente, Michaely, Saar, Wang (2002, RFS) "Dynamic Volume-Return Relation"

**ทำไม returns >= 0.15 (magnitude-based อย่างไร)**
Return ในวันที่ volume สูงสุด (max-volume day) บ่งชี้ว่า:
- ถ้าบวก = informed buying ที่ไม่ได้ถูก overreact → momentum ต่อ
- ถ้าลบ = attention-selling ที่ retail-driven → reversal กลับ
`max_vol_day_return = return ในวันที่ volume = kth_element(volume, 21, k=1)` — วันที่ volume สูงสุดใน 21 วัน
กลไก: magnitude ของ move ใน highest-volume day ≠ MAX (highest-return day) — conditional structure ต่างกัน

**ทำไม corr ต่ำกับ reversal/MAX/signed-jump**
- vs MAX: MAX ใช้ วันที่ return สูงสุด, max-volume-day ใช้ วันที่ volume สูงสุด → conditional axis ต่าง (return-conditional vs volume-conditional)
- vs reversal: reversal ใช้ cumulative returns ไม่ conditional ตาม volume
- vs signed-jump: different selection criterion (volume day vs squared return decomposition)
- โครงสร้างเป็น "conditional structure" ที่ mechanism-map ระบุว่า "ยังว่าง"

**FASTEXPR Expression:**
```
-rank(group_neutralize(winsorize(
  ts_regression(returns, volume, 21) 
, std=3), subindustry))
```
หรือ approximation ผ่าน covariance-style:
```
-rank(group_neutralize(winsorize(
  ts_covariance(returns, volume / (ts_mean(volume, 21) + 0.001), 21)
, std=3), subindustry))
```
หรือ direct: return คูณ volume ใน window เดียวกัน = "return-on-high-volume":
```
-rank(group_neutralize(winsorize(
  ts_sum(returns * power(volume / (ts_mean(volume, 42) + 0.001), 2), 21)
, std=3), subindustry))
```
- ทิศทางลบ: high-volume-day return สูง = attention buying = overpriced = short
- window 21 วัน, decay 2-4, truncation 0.04

**ความเสี่ยงหลัก**
- Approximation ผ่าน covariance อาจไม่ตรงกับ "return ของวันที่ volume สูงสุด" ที่แท้จริง (kth_element volume ยาก map กับ return ของวันเดียวกัน)
- อาจ corr กับ signed-jump หรือ reversal pool ถ้า attention-buying วัน volume สูง = reversal signal
- ต้องการ kth_element(volume,...) ร่วมกับ return ของวันนั้น ซึ่ง BRAIN operator ปัจจุบันทำยาก

---

## สรุป Priority Matrix

| กลไก | returns คาด | corr risk | ความยากใน BRAIN | Priority |
|---|---|---|---|---|
| 1. Realized Kurtosis (4th moment) | สูง (magnitude-based) | ปานกลาง (อาจ corr กับ MAX) | ง่าย | ⭐⭐⭐ |
| 2. Coskewness (Harvey-Siddique) | ปานกลาง | ต่ำ (cross-moment) | ยาก (ไม่มี market_return) | ⭐⭐ |
| 3. Vol-of-Vol (Baltussen 2018) | ปานกลาง | ต่ำ-ปานกลาง | ง่าย | ⭐⭐⭐ |
| 4. CGO Volume-Weighted RP | ต่ำ (รอบ 23 อ่อน) | ปานกลาง | ง่าย | ⭐ |
| 5. MAXbeta (Bali 2026) | สูง | สูง (corr กับ MAX pool) | ปานกลาง | ⭐ |
| 6. Residual Momentum (Blitz 2011) | ต่ำ (momentum ตาย) | ต่ำ | ปานกลาง | ⭐⭐ |
| 7. Extreme Downside Beta | ต่ำ (beta ตาย) | ต่ำ | ยาก | ⭐ |
| 8. Max-Volume-Day Return | สูง (magnitude conditional) | ต่ำ | ยากมาก (operator ไม่พอ) | ⭐⭐ |

**แนะนำ simulate ก่อน: กลไก 1 (kurtosis) และ 3 (vol-of-vol)** เพราะ implement ง่ายและ corr risk ต่ำสุด

---

## บทเรียนเชิงโครงสร้างจาก Research รอบนี้

1. **Fourth moment vs second moment**: signed-jump ใช้ power(2), kurtosis ใช้ power(4) — magnitude ใหญ่กว่า 2x → returns อาจสูงกว่า แต่ variance ของ signal สูงกว่าด้วย
2. **Vol-of-vol ต้องระวัง**: paper ใช้ options IV ไม่ใช่ realized vol — daily proxy อาจ noisy มาก
3. **MAXbeta interesting แต่ risky**: base signal เดียวกับ submitted → corr สูงแน่ ลอง simulate เพื่อ verify เท่านั้น
4. **CGO lead ค้างคือ reference price construction**: volume-weighted version ยังไม่ลอง → ลองต่อ
5. **Coskewness + extreme downside beta**: ทั้งคู่ต้องการ market proxy ที่ดี — vwap ratio เป็น approximation ที่ imperfect

Sources:
- [Amaya et al. 2015 JFE — Realized Skewness](https://www.sciencedirect.com/science/article/abs/pii/S0304405X15001257)
- [ACJV 2011 — Realized Kurtosis](https://public.econ.duke.edu/~ap172/ACJV_26Dec2011.pdf)
- [Baltussen et al. 2018 JFQA — Vol-of-Vol](https://www.cambridge.org/core/journals/journal-of-financial-and-quantitative-analysis/article/unknown-unknowns-uncertainty-about-risk-and-stock-returns/6E0E98349D20C1DCF67F3A0452361B80)
- [MAX on Steroids 2026 — Bali Ince Ozsoylev](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6065166)
- [Extreme Downside Risk 2023](https://www.sciencedirect.com/science/article/abs/pii/S1057521923003563)
- [Blitz Residual Momentum 2011](https://repub.eur.nl/pub/22252/ResidualMomentum-2011.pdf)
- [Barber Odean 2008 — Attention](https://www.researchgate.net/publication/5217174_All_That_Glitters_The_Effect_of_Attention_and_News_on_the_Buying_Behavior_of_Individual_and_Institutional_Investors)
- [Llorente et al. 2002 — Dynamic Volume-Return](https://academic.oup.com/rfs/article-abstract/15/4/1005/1567663)
