# Deep Research Round 26 — Non-Volatility Alpha Mechanisms
**Date:** 2026-06-11  
**Context:** USA TOP3000 delay1 · Submitted pool: MAX-lottery (QPQYqvAW) + signed-jump (XgK9528a)  
**Mission:** หา return source ที่ corr ต่ำกับ volatility/jump cluster + returns ≥ 0.15 + Sharpe ≥ 1.25

---

## ภาพรวมปัญหา

Pool ปัจจุบันอิ่มตัวด้วย 3 กลุ่มหลัก:
1. **Reversal family** (4/11 ใน pool) — corr สูงทุก short-term mean-reversion signal
2. **Volatility/jump/magnitude cluster** — MAX (QPQYqvAW) + signed-jump (XgK9528a) + ทุก semivariance/skewness/kurtosis variant corr 0.84–0.94 กัน
3. **Value/fundamental** (leverage, earnings-yield, turnover, options-skew) — จองแล้ว

**กุญแจ:** ต้องการ return source ที่ใช้ data fields เดิม (FASTEXPR operators) แต่ transform/structure ต่างจาก 3 กลุ่มข้างต้น อย่างสิ้นเชิง — ไม่ใช่แค่ weight/window ใหม่

---

## 6 กลไกที่คัดสรร (เรียงตามโอกาสสูง → ต่ำ)

---

### 1. Sell-Side Asymmetric Illiquidity (Brennan-Chordia-Subrahmanyam-Tong 2012)

**งานวิจัย:** Brennan, Chordia, Subrahmanyam & Tong (2012, JFE 105(3): 523-541) "Sell-order liquidity and the cross-section of expected stock returns"

**สมมติฐาน:**  
Amihud illiquidity แยกด้านขาย (sell-day) ออกจากขาซื้อ (buy-day) ให้ premium ที่ต่างกัน — sell-side illiquidity มี premium สูงกว่า buy-side อย่างมีนัย (2.9–3.7% annual per 1-SD) เพราะนักลงทุนกังวล downside liquidity ไม่ใช่ upside liquidity ใน downside scenario แรงขายกดราคาลงในหุ้น illiquid มากกว่า

**สูตร Amihud แบบแยกด้าน:**
- Sell-Amihud = `ts_mean(abs(min(returns,0)) / (volume * close + 1), 21)` — price impact เฉพาะวันที่ราคาลง
- Buy-Amihud = `ts_mean(abs(max(returns,0)) / (volume * close + 1), 21)` — price impact เฉพาะวันขึ้น
- Spread = Sell-Amihud minus Buy-Amihud = asymmetry proxy

**ทำไม returns ≥ 0.15 คาดได้:**  
Amihud illiquidity (รวม) ที่ reject ไปแล้วให้ Sharpe 0.5–0.8 บน USA — แต่ sell-side asymmetry เป็น residual component ที่ purified จาก symmetric illiquidity level — premium ต่าง 2.9–3.7%/year จากงานวิจัย + conditioning ด้วย sign ของ return ทำให้ signal "directional" ต่างจาก |r|/V ธรรมดา

**ทำไม corr ต่ำกับ volatility/jump cluster:**  
- signed-jump (XgK9528a) = `Σ(r⁺)² − Σ(r⁻)²` — วัด asymmetry ของ SQUARED returns (magnitude²)
- sell-Amihud = `|r⁻| / V` — วัด price impact ต่อ dollar volume เฉพาะ down days
- Structure ต่าง: signed-jump จับ "magnitude ของ up vs down move สะสม" ส่วน sell-Amihud จับ "ต้นทุน per dollar volume เฉพาะวันลง" — dimension คนละมิติ (magnitude² vs cost/volume)
- **ความเสี่ยง corr:** Amihud ธรรมดา (reject ไปแล้ว) corr กับ reversal pool — sell-side version ลอง Brennan-Subrahmanyam decomposition จะต่างกว่า แต่ component down-day ยังใช้ returns อยู่ → อาจ corr กับ signed-jump 0.4–0.6

**FASTEXPR:**
```
rank(group_neutralize(
  winsorize(
    ts_mean(abs(min(returns,0)) / (volume * close / 1e6 + 0.001), 21) 
    - ts_mean(abs(max(returns,0)) / (volume * close / 1e6 + 0.001), 21),
    std=3
  ),
  subindustry
))
```
- sign: บวก (sell-Amihud สูงกว่า buy-Amihud = asymmetric illiquidity สูง = long)
- neut: SUBINDUSTRY/INDUSTRY, decay 0–4, trunc 0.04, TOP3000

**ความเสี่ยง:**  
1. `volume * close` อาจต้องปรับหน่วย (dollar volume มักใหญ่มาก)
2. correlate กับ signed-jump ถ้า down-day returns overlap — ต้องเช็ค IS corr ก่อน
3. Base Amihud ถูก reject แล้ว (corr reversal pool สูง) — asymmetric version อาจยังติดปัญหาเดิม

---

### 2. Path-Dependent Running Maximum / Price Drawdown-to-High (George & Hwang 2004 + Choi 2014)

**งานวิจัย:**  
- George & Hwang (2004, JF 59(5): 2145-2176) "The 52-Week High and Momentum Investing" — nearness-to-high predicts returns (anchoring bias)
- Choi (2021, JRFM 14(11): 542) "Maximum Drawdown, Recovery, and Momentum" — drawdown ต่ำ + recovery จาก trough = better momentum signal กว่า raw returns

**สมมติฐาน:**  
หุ้นที่ราคาปัจจุบันอยู่ใกล้ running maximum (peak ของช่วง 252 วัน) = ถูก underpriced โดย anchoring investors ที่ลังเลขาย → momentum ต่อ ในขณะที่หุ้นที่ราคา drawdown ลึกจาก peak = oversold → mean reversion  
**กลไก path-dependent:** ต่างจาก 52w-high proximity ธรรมดา ตรงที่ใช้ running maximum แทน kth_element ที่จับ single-day peak

**ทำไม corr ต่ำกับ volatility/jump cluster:**
- MAX lottery (QPQYqvAW) = kth_element(returns,42,k=1..3) — จับ magnitude ของ extreme return day เดียว
- Running max / 52w-high = close / ts_rank(close,252) — วัด proximity ของ PRICE LEVEL (ไม่ใช่ single-day return magnitude) กับ historical peak
- Structure ต่างอย่างสิ้นเชิง: MAX ใช้ returns distribution, High52 ใช้ price level path — ยืนยันจาก near-miss ที่ทดสอบแล้ว (52w-high Sharpe 1.46 อิสระจาก MAX)

**ทำไม returns ≥ 0.15 คาดได้:**  
ในรอบ near-miss เราพบว่า ts_zscore(mdl77_pricemomentumfactor_high52w, 20) ให้ returns 0.110 (ยังไม่ถึง 0.15) — **ทางแก้:** ผสมกับ drawdown component ที่ Choi (2014) พิสูจน์ว่า `recovery = (close - running_trough) / (running_peak - running_trough)` ให้ cross-section signal ที่ stronger กว่า 52w-high เพียว

**FASTEXPR ใหม่ (Choi recovery):**
```
rank(group_neutralize(
  winsorize(
    (close - ts_rank(close,252)) / (ts_rank(close,252) - ts_rank(-close,252) + 0.001),
    std=3
  ),
  subindustry
))
```
หรือ composite:
```
rank(group_neutralize(
  ts_zscore(mdl77_pricemomentumfactor_high52w, 20) 
  + ts_zscore((close / (ts_rank(close,252) + 0.001)), 10),
  subindustry
))
```
- sign: บวก (ใกล้ high / recovery จาก trough สูง = momentum ต่อ)
- neut: SUBINDUSTRY, decay 0–4, trunc 0.04, TOP3000

**ความเสี่ยง:**  
1. ts_rank ไม่ใช่ ts_max — approximation อาจ noisy (ค่าจริงของ 252d high ≠ rank)
2. 52w-high near-miss ceiling 0.70 — ต้องการ Choi drawdown component ดัน returns ข้าม 0.15
3. Momentum family ถูก reject บน USA daily — กลไกนี้ต้องพิสูจน์ว่า anchoring premium ยังมีบน delay1 daily

---

### 3. Zero-Return Days / Lesmond Liquidity (Lesmond, Ogden & Trzcinka 1999)

**งานวิจัย:** Lesmond, Ogden & Trzcinka (1999, RFS 12(5): 1113-1141) + Fong, Holden, Tobek (2017, Review of Finance)

**สมมติฐาน:**  
หุ้นที่มี proportion of zero-return days สูงในช่วง 21/63 วัน = ต้นทุน transaction สูง = illiquid มาก → ต้องการ return premium สูงกว่า เป็น clean liquidity proxy ที่ต่างจาก Amihud (ซึ่ง reject ไปแล้ว) เพราะวัด "ความถี่ที่ตลาดไม่เคลื่อน" ไม่ใช่ "magnitude ของ price impact"

**ทำไม corr ต่ำกับ volatility/jump cluster:**
- Amihud (rejected) = |r| / V — corr สูงกับ reversal pool เพราะ |r| ส่วนหนึ่งมาจาก reversal dynamics
- Zero-return days = count(|r| ≈ 0) — dimension ตรงข้ามสิ้นเชิง: วัด "absence of movement" ไม่ใช่ magnitude ของ movement → corr กับ volatility cluster ต่ำมาก (volatility cluster วัด magnitude สูงสุด; zero-return วัด frequency ของ zero movement)
- ไม่มี returns ใน formula เลย → structural independence จาก signed-jump

**FASTEXPR:**
```
rank(group_neutralize(
  winsorize(
    ts_sum(abs(returns) < 0.0001 ? 1 : 0, 21),
    std=3
  ),
  subindustry
))
```
หมายเหตุ: ternary operator อาจไม่มีใน BRAIN — ทางเลือก approximation:
```
rank(group_neutralize(
  winsorize(
    -ts_sum(abs(returns), 21) / (ts_std_dev(abs(returns), 21) + 0.0001),
    std=3
  ),
  subindustry
))
```
(zscore ของ |r| ติดลบ → หุ้นที่ |r| ต่ำผิดปกติ = zero-return proxy)

หรือง่ายกว่า (มี correlation กับ zero-days สูง):
```
rank(group_neutralize(
  winsorize(
    -ts_mean(abs(returns), 21),
    std=3
  ),
  subindustry
))
```
- sign: บวก (zero-return สูง = illiquid = long สำหรับ liquidity premium) **แต่ต้องเช็ค:** ถ้าเป็น TOP3000 หุ้น liquid อยู่แล้ว อาจต้อง flip เป็น reversal signal แทน
- neut: SUBINDUSTRY, decay 2–6, trunc 0.04

**ความเสี่ยง:**  
1. BRAIN อาจไม่มี ternary operator — ต้องใช้ approximation
2. TOP3000 = large-cap liquid มากอยู่แล้ว zero-return days อาจ too sparse → signal weak
3. ts_mean(abs(returns),21) = poor approximation ของ zero-count จริง (overlap กับ vol ธรรมดา)
4. อาจ corr กับ IVOL standalone (rejected) — ต้องเช็ค

---

### 4. Asymmetric Beta / Downside Correlation (Ang, Chen & Xing 2006 + Liu 2023)

**งานวิจัย:**  
- Ang, Chen & Xing (2006, JF 61(3): 1191-1239) "Downside Risk" — downside beta premium 6%/year
- Liu (2023, Journal of Financial Intermediation) "A novel downside beta and expected stock returns"

**สมมติฐาน:**  
หุ้นที่มี downside beta สูง (beta เฉพาะวันที่ market ลง > mean) = ให้ premium เพิ่มเพราะนักลงทุนเกลียด downside co-movement โดยเฉพาะ กลไก: "crash risk" ที่เกิดพร้อมกับ market crash → ต้องการ compensation สูงกว่า beta ธรรมดา

**ทำไม corr ต่ำกับ volatility/jump cluster:**
- coskewness (อยู่ใน backlog new) = `ts_corr(returns, power(market_return, 2), d)` — cross-moment กับ market variance
- downside beta ≠ coskewness: downside beta วัด correlation ของ returns กับ market เฉพาะในช่วง market ต่ำกว่า mean (conditional correlation ไม่ใช่ unconditional)
- ต่างจาก IVOL (rejected) เพราะ IVOL = total idiosyncratic variance, downside beta = conditional co-movement กับ market
- ต่างจาก signed-jump เพราะ signed-jump ใช้ firm's own returns asymmetry (ไม่มี market)

**FASTEXPR:**
```
-rank(group_neutralize(
  winsorize(
    ts_corr(
      returns,
      min(vwap/ts_delay(vwap,1)-1, 0),
      63
    ),
    std=3
  ),
  subindustry
))
```
(vwap/ts_delay(vwap,1)-1 เป็น market proxy; min(...,0) ตัดเฉพาะ down-market days)

ทางเลือก: downside beta โดยตรง:
```
-rank(group_neutralize(
  winsorize(
    ts_covariance(returns, min(vwap/ts_delay(vwap,1)-1, 0), 63) /
    (ts_covariance(min(vwap/ts_delay(vwap,1)-1, 0), min(vwap/ts_delay(vwap,1)-1, 0), 63) + 0.0001),
    std=3
  ),
  subindustry
))
```
- sign: ลบ (downside beta สูง = more negative return in market crash = ต้องการ premium = long)
- neut: SUBINDUSTRY, decay 0–4, trunc 0.04, window 63 (longer ≈ stable beta)

**ความเสี่ยง:**  
1. vwap ไม่ใช่ market index จริง — cross-sectional correlation จะไม่ clean (vwap เปลี่ยนทุกหุ้น)
2. ts_covariance(min(x,0),min(x,0)) = variance ของ truncated market → ตัวส่วนเล็กมาก unstable
3. อาจ overlap กับ beta/BAB anomaly (IVOL rejected) — downside beta อาจ corr กับ IVOL สูง
4. งานวิจัย Kyle lambda พบว่า cross-section ของ price impact ลดความสำคัญลงหลังปี 2010 บน USA

---

### 5. Corwin-Schultz Bid-Ask Spread Asymmetry (Corwin & Schultz 2012)

**งานวิจัย:** Corwin & Schultz (2012, JF 67(2): 719-759) "A Simple Way to Estimate Bid-Ask Spreads from Daily High and Low Prices"

**สมมติฐาน:**  
High-low range ข้ามวัน (2-day window) capture bid-ask spread ที่ฝัง อยู่ในราคา — cross-sectional spread กว้างเกินปกติ = ต้นทุน transaction สูงชั่วคราว → mean-reversion ของ spread + expected return premium ฝั่งผู้ถือ

**สูตร Corwin-Schultz:**  
β = [log(High_t/Low_t)]² + [log(High_{t-1}/Low_{t-1})]² (sum of squared log-ranges)  
γ = [log(max(High_t,High_{t-1})/min(Low_t,Low_{t-1}))]² (2-day range)  
α = (√(2β)−√β) / (3−2√2) − √(γ/(3−2√2))  
Spread = 2(e^α − 1)/(1 + e^α)

Approximation บน BRAIN:
```
rank(group_neutralize(
  winsorize(
    ts_std_dev(log(high / low), 5) - ts_mean(log(high / low), 21),
    std=3
  ),
  subindustry
))
```
หรือ range spread ข้ามวัน:
```
rank(group_neutralize(
  winsorize(
    ts_zscore(
      log(high / low) + log(ts_delay(high,1) / ts_delay(low,1)),
      21
    ),
    std=3
  ),
  subindustry
))
```
- sign: บวก (spread สูงผิดปกติ = illiquidity premium = long)
- neut: SUBINDUSTRY, decay 0–4, trunc 0.04

**ทำไม corr ต่ำกับ volatility/jump cluster:**
- intraday semivariance (rejected) = (max(close/open-1,0))² — semivariance ของ open-to-close
- Corwin-Schultz = log(H/L) ข้ามสองวัน — วัด spread ที่ฝังใน range โดย exploit ว่า 2-day range > sum of 1-day ranges ถ้า bid-ask spread มีอยู่
- Structure ต่าง: semivariance ใช้ directional intraday return, C-S ใช้ cross-day range comparison (ไม่มี direction)

**ความเสี่ยง:**  
1. log(H/L) สัมพันธ์กับ realized vol (Parkinson measure) → อาจ corr กับ intraday vol cluster (corr 0.94 ที่พบ)
2. ถ้า corr สูงกับ volatility pool = fail gate 2 ทันที
3. BRAIN ไม่มี max(H_t,H_{t-1}) operator โดยตรง — ต้องใช้ (high + ts_delay(high,1) + abs(high - ts_delay(high,1)))/2 แทน

---

### 6. Analyst Dispersion / Disagreement Signal (Diether, Malloy & Scherbina 2002 + 2025 update)

**งานวิจัย:**  
- Diether, Malloy & Scherbina (2002, JF 57(5): 2113-2141) — high forecast dispersion → lower future returns (overpricing from short-sale constraints)
- Investor disagreement and state-dependent mispricing (2025, Journal of Banking & Finance) — dispersion anomaly conditional on investor sentiment

**สมมติฐาน:**  
หุ้นที่ความเห็นนักวิเคราะห์แตกต่างกันมาก (high std of EPS estimates) = นักลงทุน pessimistic ถูกขาย short ไม่ได้ → ราคาสะท้อนแค่ optimist → overpriced → ผลตอบแทนต่ำในอนาคต

**ทำไม corr ต่ำกับ volatility/jump cluster:**
- ใช้ fundamental data (analyst estimates) ไม่ใช่ price/volume — dimension ต่างอย่างสิ้นเชิง
- Volatility/jump cluster ใช้ returns distribution เท่านั้น
- **แต่ความเสี่ยง:** fundamental standalone ทุกตัวที่ลองมาตกหมดบน USA daily — ถ้าจะใช้ต้องเป็น weight บน price signal ไม่ใช่ standalone

**FASTEXPR (ถ้ามี est_eps หรือ fam field):**
```
-rank(group_neutralize(
  winsorize(
    ts_std_dev(mdl177_earnest_epsa, 8) / (abs(ts_mean(mdl177_earnest_epsa, 8)) + 0.001),
    std=3
  ),
  subindustry
))
```
หรือใช้เป็น conditioning weight บน magnitude signal:
```
-(kth_element(returns, 42, k=1) + kth_element(returns, 42, k=2) + kth_element(returns, 42, k=3)) 
* winsorize(ts_std_dev(mdl177_earnest_epsa, 8) / (abs(ts_mean(mdl177_earnest_epsa, 8)) + 0.001), std=3)
```
- sign: ลบ (dispersion สูง = overpriced = short)
- neut: SUBINDUSTRY, decay 4–8, trunc 0.04

**ความเสี่ยง:**  
1. Fundamental standalone ตายบน USA daily delay1 — ต้องใช้เป็น weight
2. ถ้าใช้เป็น weight บน MAX = corr กับ QPQYqvAW สูงแน่ (base signal เหมือนกัน)
3. mdl177_earnest_epsa = model field ที่ต้อง verify ใน get_data_fields ก่อน

---

## สรุปการจัดลำดับโอกาส

| ลำดับ | กลไก | เหตุผลที่น่าลอง | ความเสี่ยงหลัก |
|-------|------|----------------|----------------|
| 1 | Sell-side asymmetric illiquidity | Structure ต่างจาก signed-jump ชัด (cost/vol vs magnitude²) | อาจ corr กับ reversal pool |
| 2 | Path-dependent drawdown recovery | ยืนยันแล้วว่า 52w-high orthogonal กับ MAX; Choi ดัน returns | Momentum flat บน USA daily — ต้องพิสูจน์ใหม่ |
| 3 | Zero-return Lesmond | Dimension ต่างจาก vol cluster (zero count vs magnitude) | TOP3000 อาจ sparse; overlap IVOL |
| 4 | Downside beta asymmetric | ต่างจาก IVOL/coskewness conceptually | vwap ≠ market; ตัวส่วน unstable |
| 5 | Corwin-Schultz spread | Fundamental spread premium documented | log(H/L) อาจ corr สูงกับ Parkinson vol |
| 6 | Analyst dispersion | Orthogonal dimension (fundamental) | Fundamental standalone ตายบน USA daily |

---

## คำแนะนำการ Simulate

**ลำดับที่แนะนำ:**

1. **Sell-side asymmetric illiquidity** — sim ก่อน ถ้า corr กับ XgK9528a < 0.5 น่าสนใจมาก
2. **Corwin-Schultz** — sim ระวัง corr กับ intraday vol cluster; ถ้า > 0.7 ทิ้งทันที  
3. **Downside beta** — sim ด้วย vwap เป็น market proxy; ถ้า Sharpe < 1.0 ปิดทันที
4. **Zero-return proxy** — ลองทั้ง ts_mean(abs(returns),21) และ approximation อื่น
5. **Drawdown recovery** — ต้อง combine Choi formulation กับ 52w-high จึงจะดัน returns ข้าม 0.15

**Pre-sim check สำคัญ:**  
ก่อน sim ทุกตัว — ตรวจ feasibility formula: `required_returns = turnover × sharpe² / (fitness_limit=1.0)` — ถ้า signal structure ทำให้ returns < 0.15 แม้ Sharpe > 1.25 = INFEASIBLE อย่า waste sim

---

## Sources

- [Brennan, Chordia, Subrahmanyam & Tong (2012) — Sell-order liquidity JFE](https://www.sciencedirect.com/science/article/abs/pii/S0304405X12000669)
- [George & Hwang (2004) — 52-Week High JF](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1540-6261.2004.00695.x)
- [Choi (2021) — Maximum Drawdown, Recovery, and Momentum JRFM](https://www.mdpi.com/1911-8074/14/11/542)
- [Lesmond, Ogden & Trzcinka (1999) — Zero Return Days RFS](https://www.nber.org/system/files/working_papers/w11413/w11413.pdf)
- [Ang, Chen & Xing (2006) — Downside Risk JF](https://www.nber.org/system/files/working_papers/w11824/w11824.pdf)
- [Corwin & Schultz (2012) — Bid-Ask Spread Estimator JF](https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1540-6261.2012.01729.x)
- [Diether, Malloy & Scherbina (2002) — Analyst Forecast Dispersion JF](https://onlinelibrary.wiley.com/doi/abs/10.1111/1540-6261.00501)
- [Investor disagreement state-dependent mispricing (2025) JBF](https://www.sciencedirect.com/science/article/abs/pii/S0378426625001979)
