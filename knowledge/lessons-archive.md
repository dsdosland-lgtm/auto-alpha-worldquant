# Lessons Archive — ประวัติบทเรียนเต็มรอบ 1–23 📚

> **ไฟล์นี้คือ archive — agent ไม่ต้องอ่านเป็น default** (ใหญ่เกิน Read cap จะโดน truncate)
> กฎที่ยัง active ถูก distill ไว้ที่ `knowledge/lessons-learned.md` (อ่านอันนั้นก่อนทำงาน)
> เปิดไฟล์นี้เฉพาะเมื่อต้องการ context เชิงลึกของรอบใดรอบหนึ่ง — ใช้ Grep/offset อ่านเฉพาะส่วน อย่า Read ทั้งไฟล์
>
> **กติกาเขียนบทเรียนใหม่:** เขียน entry เต็ม (รายละเอียด+เส้นทาง+วันที่) **ต่อท้ายไฟล์นี้** แล้วอัปเดต one-liner ในหมวดที่ถูกต้องของ lessons-learned.md (ฉบับ distilled)

---

## ✅ Pattern ที่ได้ผล (ใช้ซ้ำได้)
- **`ts_decay_linear(rank(...), d)` ลด turnover ได้แรงโดยกระทบ Sharpe น้อย** — ดัน overnight-intraday จาก turnover 1.08 (fail) → 0.42 ทำให้ fitness ผ่าน window 10 กำลังดีสำหรับ reversal [2026-06-08]
- **overnight/intraday reversal (`close` vs `open`)** ให้ Sharpe สูง 1.7–2.0 บน USA TOP3000 — แนวที่ควรขุดต่อ/แตกแขนง [2026-06-08]

## ❌ Pattern ที่ตก (อย่าทำซ้ำ)
- **`rank(raw)` ดิบไม่มี structure → Sharpe < 0.3**: momentum 12-1 ดิบ (0.10), low-vol `ts_std_dev` ดิบ (0.08), accrual ดิบ (0.26) ต้องมี winsorize/zscore/group ก่อน rank [2026-06-08]
- **smooth สัญญาณ reversal มากเกินไป** (`ts_mean(.,5)+`, `ts_decay_linear` window ใหญ่ + decay สูงพร้อมกัน) ทำลาย Sharpe จนหลุด limit — reversal ต้องการความเร็ว ค่อยๆ เพิ่ม smoothing ทีละขั้น [2026-06-08]

## 🔧 อาการเฉพาะ (วินิจฉัยเร็ว)
- **fitness ต่ำทั้งที่ Sharpe สูง → ดู turnover ก่อน** ถ้า turnover สูง แก้ที่ turnover fitness ขึ้นตาม แต่ถ้า turnover ปกติแล้ว fitness ยังต่ำ = **returns ต่ำ** (เช่น vwap-deviation) ต้องเพิ่มความแรง signal ไม่ใช่ลด turnover [2026-06-08]

## ⚙️ ระบบ / API
- **prod-correlation คืน 403 = tier-gate ถาวร (ยืนยันแล้ว)** — เกิดซ้ำแม้ MCP reconnect/restart แล้ว ไม่ใช่บั๊กโค้ดเก่า เป็นข้อจำกัด account tier ฝั่ง BRAIN. client degrade เป็น `{unavailable:true, status:403}` ไม่ throw. ทุกครั้งที่ submit ต้องเช็ค prod-corr ด้วยมือบนเว็บ BRAIN เอง [2026-06-08]
- **self-correlation body ว่าง** เมื่อยังไม่มี submitted alpha = ถือว่าผ่าน (ไม่มีอะไรเทียบ) [2026-06-08]

<!-- บทเรียนใหม่ต่อท้ายด้านล่าง (คงหัวข้อ ✅/❌/🔧/⚙️ ไว้) -->

## 🎯 ROOT CAUSE: "ทำไมหาไม่ค่อยเจอ" + วิธีแก้ (2026-06-09 — อ่านก่อนทุกอย่าง)
**ปัญหา:** รอบ 1-2 เจอ 2 ตัวผ่าน (fit 1.00-1.02) แต่รอบ 3-8 เจอ 0 ตัว (ตันที่ 0.96)
**สาเหตุที่แท้จริง (พิสูจน์ด้วยคณิต):** fitness ≥1.0 ต้องมี **returns ≥ turnover/sharpe²**
- 2 ตัวที่ผ่าน: returns **0.158-0.174** (สูง) → ผ่าน
- near-miss รอบ 3-8: returns แค่ **0.11-0.14** (ต่ำ) → ตันทุกตัว **คอขวดคือ returns ไม่ใช่ tuning**
**ทำไม returns ตก:** (1) 2 anomaly returns-สูงสุด (overnight reversal + price-volume divergence) ถูกเก็บไปแล้วรอบ 1-2; (2) รัด "orthogonal" แน่นเกิน → ไล่หา momentum/options/sentiment/skewness ที่ returns ต่ำบน USA แทนขุดตระกูลที่ชนะ; (3) เสีย sims tune signal returns-ต่ำที่ไปไม่ถึง 1.0 ตั้งแต่แรก

**วิธีแก้ (3 ข้อ — บังคับใช้):**
1. **FEASIBILITY SCREEN ก่อน tune ทุกครั้ง:** คำนวณ required_returns = turnover/sharpe² ถ้า returns จริง < 85% และเป็น signal returns-ต่ำเชิงโครงสร้าง = INFEASIBLE อย่า tune ต่อ (ดู submission-criteria.md)
2. **ขุดตระกูลที่ชนะต่อ (reversal close/open, price-volume divergence) หา variant returns-สูง ที่ self-corr<0.7** ไม่ใช่หนีไปหาของแปลก returns-ต่ำ
3. **เป้า returns ≥ 0.15** เป็นเกณฑ์คัด ไม่ใช่แค่ Sharpe สูง; lever ดัน fitness เรียงตาม: เพิ่ม Sharpe (คุ้มสุด ∝²) > เพิ่ม returns > ลด turnover (มักไม่ช่วย)

### ✅ พิสูจน์แล้วว่ากลยุทธ์ใหม่ได้ผล (2026-06-09) — เจอตัวผ่านทันทีหลังแก้
- **`-(close/open-1) × winsorize(volume/adv20,std=3)` group_neutralize, decay 7 → Sharpe 1.91, Fitness 1.04, returns 0.195 ✅ ผ่านทุก check** (alpha GroeQEpO เข้าคิวแล้ว)
- **กลไกที่ทำให้สำเร็จ = แก้ตรง root cause:** ขุดตระกูลที่ชนะ (overnight reversal returns-สูง) **× volume เพื่อ amplify returns** (0.174→0.195) แทนหนีไปหา signal returns-ต่ำ → returns สูงพอให้ fitness ทะลุ 1.0. **การ × volume/adv20 บน signal reversal ที่ดีอยู่แล้ว = booster returns ที่ทรงพลัง** (เหมือน price-volume divergence ที่ผ่านรอบ 1-2) [2026-06-09]
- **decay เป็น turnover knob ที่แม่นยำเมื่อ returns สูงพอ:** signal returns 0.19 ทน decay ได้ (decay 6→9: TO 0.71→0.59, fit ยัง 1.01-1.04) ต่างจาก signal returns-ต่ำที่ decay ทำ fit พัง — ย้ำว่าต้องมี returns เป็นฐานก่อน [2026-06-09]
- ⚠️ **แต่ระวัง: × volume variant ของ signal ที่ submit แล้ว → self-corr สูง** — ต้องเช็คมือก่อน submit ว่า value-add จริง [2026-06-09]
- 🚫 **ยืนยันแล้ว: GroeQEpO (overnight×volume) self-corr 0.805 > limit 0.70 → ไม่ submit** — การ amplify signal เดิมด้วย volume **ผ่าน fitness แต่ไม่ผ่าน correlation** (ซ้ำตระกูลเดิม). **บทเรียน: fitness-passer ที่มาจาก variant ของ signal ที่มีอยู่ = corr สูงเกือบแน่นอน ไม่มี value-add**. ถ้าจะหา passer ที่ submit ได้จริง ต้องเป็น signal ตระกูล/กลไกใหม่ที่ returns สูงพอ (ยากบน USA delay1) ไม่ใช่ amplify ของเดิม [2026-06-09]
- ⚙️ **self-correlation API คืนค่าจริงแล้ว (เคย empty)** — พูลมี alpha ให้เทียบแล้ว (เห็น record wpzLYJVl ฯลฯ corr 0.65-0.80). ต่อไป self-corr check ใช้งานได้จริงตอน /review-candidates ไม่ต้องพึ่งเช็คมืออย่างเดียว. **หมายเหตุ: self-corr ของ alpha ที่เพิ่ง simulate มักคืน empty (ยังคำนวณไม่เสร็จ) — ต้องรอ/เช็คซ้ำตอน review ถึงได้ค่าจริง** [2026-06-09]

### ✅ close-vs-midpoint × volume = anchor reversal ใหม่ที่ Sharpe สูงสุด (รอบ 10)
- **`-(close-(high+low)/2)/(high-low+0.001) × winsorize(volume/adv20,std=3)`** (ไม่มี group_neutralize, decay 8, SUBINDUSTRY) → **Sharpe 2.02, Fitness 0.99, drawdown 0.053** — near-miss แข็งแกร่งสุดของโปรเจกต์. midpoint reversal (close เทียบกลางวัน) × volume ให้ Sharpe 2.0+ [2026-06-09]
- ยืนยันสูตร: **ตัด group_neutralize กู้ returns ดัน fit 0.98→0.99**; **อย่าผสม momentum เข้า signal Sharpe สูง** (เจือจาง 2.0→1.65 ทำ fit แย่); MARKET/INDUSTRY neut แย่กว่า SUBINDUSTRY [2026-06-09]
- 🔧 **close-range/midpoint reversal family มี hard ceiling ~0.99** (close-range 0.95-0.96, midpoint×vol 0.99) ดันด้วย decay/trunc/neut/mix ไม่ข้าม 1.0 [2026-06-09]

### 🎯 ภาพรวม 2-GATE PROBLEM ของ USA TOP3000 delay1 (ข้อสรุปสุดท้าย หลัง 10 รอบ)
ตัวที่ submit ได้ต้องผ่าน **พร้อมกัน**: (1) fitness≥1.0 [ต้อง returns≥0.15] (2) self-corr<0.70
- **returns≥0.15 มีแค่ตระกูล reversal/price-volume** (× volume amplify) → แต่พูลหนาแน่น corr สูง (overnight×vol = 0.80)
- **กลไกใหม่ (momentum/options/sentiment/skewness/customer)** → corr ต่ำ แต่ returns ต่ำ fit ไม่ถึง
- **2 เงื่อนไขขัดกันเชิงโครงสร้างบน USA delay1** — นี่คือเหตุผลแท้จริงที่ "หาไม่ค่อยเจอ" หลังเก็บ 2 ตัวแรกไปแล้ว
- **ทางออก: เปลี่ยน region/delay** (พูลบาง → gate 2 ง่าย, arbitrage น้อย → returns สูง → gate 1 ง่าย). การวน USA TOP3000 delay1 ต่อ = ชน 2-gate นี้เรื่อยๆ [[returns-bottleneck-usa-delay1]] [2026-06-09]

### 🔒🔒 CRITICAL TIER CONSTRAINT (พิสูจน์รอบ 10 — ลบล้างข้อเสนอ "เปลี่ยน region")
- **tier เรามีแค่ region USA เท่านั้น** — EUR/CHN/GLB/ASI/JPN ตอบ "Region X is not available." ทั้งหมด (400 error). **เลิกแนะนำเปลี่ยน region ได้เลย — ทำไม่ได้** [2026-06-09]
- **axis เดียวที่เปลี่ยนได้ = delay 0 (USA) แต่เกณฑ์โหดกว่ามาก:** LOW_SHARPE limit **2.0** (vs 1.25), LOW_FITNESS limit **1.3** (vs 1.0). [2026-06-09]
- **signal ที่ชนะบน delay 1 พังหมดบน delay 0:** overnight×vol Sharpe 0.45, price-vol-div 0.74, midpoint×vol 0.91, customer-mom 1.64 — ทั้งหมด << bar 2.0. เพราะ delay 0 เป็น contemporaneous (ใช้ข้อมูลวันเดียวกัน) reversal signal ที่ predict วันถัดไปไม่ทำงาน + bar สูงลิ่ว. **delay 0 ต้องการ signal คนละแบบ (high-freq/same-day) ที่ทำ Sharpe 2.0 — ยากมาก ยังไม่เจอ** [2026-06-09]
- **สรุปขอบเขตที่ทำได้จริงทั้งหมด:** USA delay1 (2-gate cap ~1.0, พูลอิ่มตัว) | USA delay0 (bar 2.0/1.3 สุดโหด) | universe TOP3000/1000/500. **ไม่มีทางลัด — submittable alpha ใหม่บน tier นี้หายากจริงเชิงโครงสร้าง หลังเก็บ 2 ตัวแรกตอนพูลว่าง** [2026-06-09]

## รอบ 2 — 2026-06-08

### ✅ Pattern ที่ได้ผล
- **price-volume divergence ที่มี structure ผ่านเลยตัวแรก**: `rank(group_neutralize(-ts_zscore(close,5) * winsorize(volume/adv20, std=3), subindustry))` → Sharpe 1.89, Fitness 1.00 ตัวที่มี interaction (price move × volume ratio) + normalize ทุกชั้น ได้ผลดีกว่า single-field มาก
- **close-range position `(close-low)/(high-low)` reversal** ให้ Sharpe สูงมาก 2.0+ — intraday microstructure position เป็นแหล่ง alpha แรง ควรขุดต่อ

### ❌ Pattern ที่ตก
- **สมมติฐาน reversal บางตัวกลับทาง**: amihud illiquidity (Sharpe -0.82) และ high-low range/volume (-1.23) — signal ที่คิดว่า revert จริงๆ เป็น momentum/continuation ถ้าเจอ Sharpe ติดลบแรง ลองกลับเครื่องหมายก่อนทิ้ง
- **overnight-gap-fade แบบ vol-normalized อ่อน** (Sharpe 0.56) — การ normalize ด้วย ts_std_dev มากเกินทำให้ gap signal จาง

### 🔧 อาการเฉพาะ
- **group_neutralize ดึง returns ออก**: close-range ตัด group_neutralize → returns 0.126→0.136, fitness 0.90→0.93 ถ้า returns เป็นคอขวด ลองใช้แค่ settings neutralization แทน group op ใน expression
- **ลด turnover ด้วย decay window ทำ returns ลดตาม** เมื่อคอขวดคือ returns (ไม่ใช่ turnover) — fitness ไม่ขยับ (close-range, vwap) ต้องเพิ่มความแรง signal แทน

### ⚙️ ระบบ / API (สำคัญมาก)
- **แก้โค้ดใน `src/` ไม่มีผลจนกว่าจะ restart MCP server** — รอบนี้ correlation fix ที่เขียนไว้ใน wq-client.js ยังไม่ทำงาน (self-corr ยัง error, prod ยัง 403) เพราะ MCP server process รันโค้ดเก่าในหน่วยความจำ **หลังแก้ src/ ต้อง restart server (`/mcp` reconnect หรือ restart Claude Code) ก่อนทดสอบ** [2026-06-08]
- **มี check ใหม่ `UNITS`** โผล่กับ expression ที่เป็น ratio ของ field ต่าง unit เช่น (close-low)/(high-low) — เป็น ⚠️ warning ไม่ใช่ FAIL แต่ควรระวัง อาจต้องครอบ normalize

## deep-tune close-range — 2026-06-08

### 🔧 รู้จัก "structural fitness ceiling" — เมื่อไรควรหยุด tune
- **range-position reversal `(close-low)/(high-low)` ชนเพดาน fitness ~0.95** ดันไม่ถึง 1.0 แม้ลอง 15+ variants 3 รอบ: Sharpe กับ turnover ผูกกันแน่น — **ลด turnover (decay/trade_when) ทำ returns ลดตามเสมอ** fitness จึงค้าง สัญญาณว่าเจอเพดาน: fitness นิ่งที่ค่าเดิม±0.02 ไม่ว่าปรับอะไร = หยุด อย่า overfit ย้ายไปหา signal ใหม่หรือผสม orthogonal signal
- **window สั้น (4) ให้ Sharpe/returns สูงสุด** (Sharpe 2.21) แต่ turnover พุ่ง — window เป็นปุ่มหลัก trade-off Sharpe↔turnover ของ decay-linear
- **`signed_power(x, 2)` ทำ turnover ระเบิด** (0.64→1.36) เพราะขยาย signal ที่ extreme ให้สลับขั้วบ่อย — ใช้เพิ่ม conviction ไม่คุ้มถ้าคอขวดคือ turnover
- **`trade_when` ลด turnover ได้จริง** (0.77→0.59) แต่สำหรับ signal ที่ returns มาจากทุกวัน การ skip วันทำ returns ตกด้วย — ช่วยเฉพาะ signal ที่ alpha กระจุกในวัน trigger

## รอบ 3 — 2026-06-08

### ✅ Pattern ที่ได้ผล
- **denominator ของ intraday ratio ควรเป็น (high-low) ไม่ใช่ (open-low)**: เปลี่ยน `(high-open)/(open-low)` → `(high-open)/(high-low)` ทำให้ ratio bounded [0,1] เสถียรข้ามหุ้น → returns พุ่ง 0.070→0.111, **fitness 0.50→0.77, Sharpe 1.36→1.52** กระโดดใหญ่จากการแก้ตัวหารตัวเดียว — ใช้ range เต็ม (high-low) เป็นตัวหารเสมอสำหรับ position-in-range signal [2026-06-08]

### ❌ Pattern ที่ตก
- **second-order volume `ts_delta(volume/adv20, d)` → turnover ระเบิด >1.3** (volume-acceleration Sharpe 0.94 แต่ TO 1.35 fail) — volume acceleration เปลี่ยนทิศบ่อยเกิน อย่าใช้เป็น signal หลัก [2026-06-08]
- **`ts_zscore(log(high/low), d)` short-window → turnover ~1.24** (corwin-schultz spread proxy) Sharpe แค่ 0.61 ทั้ง 2 ทิศ — spread-range zscore เร็ว/noisy เกิน ตกไกล [2026-06-08]
- **คูณ volume เข้า signal microstructure ที่ดีอยู่แล้ว ทำลาย Sharpe**: intraday-upside × winsorize(volume/adv20) → Sharpe 1.52→0.95, fit 0.77→0.38 — volume interaction ช่วยเฉพาะ price-MOVE signal (ts_zscore(close)) ไม่ใช่ range-POSITION signal [2026-06-08]

### 🔧 อาการเฉพาะ (ย้ำของเดิม + ใหม่)
- **near-miss ที่ติด LOW_FITNESS โดย Sharpe ผ่านสบาย = คอขวด returns เกือบทุกครั้ง** (รอบนี้ 2/2 ตัว: intraday-upside fit 0.77, volume-asymmetry fit 0.62 ทั้งคู่ Sharpe 1.3-1.5). ลด turnover ด้วย decay → Sharpe+returns ตกตาม → fitness ไม่ขยับ/ลดลง. **base decay 0 หรือ decay น้อย มักเป็น fitness peak** อย่าเสียรอบ simulate ไล่ decay สูงเพื่อหวัง fitness — มันลง. ต้องเพิ่ม returns ด้วย signal ใหม่/orthogonal แทน [2026-06-08]
- **OBV-style `ts_sum(volume*sign(Δclose), d)` เป็น reversal ไม่ใช่ momentum** ต้องใส่ `-` (rank ดิบ Sharpe -1.36 → พลิก +1.36). drawdown ต่ำเด่น (0.049) น่าจับคู่ผสม [2026-06-08]
- **double-neutralize (group_neutralize ใน expr + neutralization setting พร้อมกัน) ผลต่าง returns น้อยมาก** กับ OBV (fit 0.62 vs 0.60 เมื่อตัด group op) — ไม่ใช่คอขวดเสมอไป ขึ้นกับ signal

## รอบ 4 — 2026-06-08 (เน้นหา signal orthogonal กับ submitted 2 ตัว)

### ✅ Pattern ที่ได้ผล
- **52-week-high momentum ใช้ field สำเร็จรูป `mdl77_pricemomentumfactor_high52w` (close/52w-high) + `ts_zscore(.,20)`** → Sharpe 1.46 (orthogonal กับ short-term reversal). **ต้องครอบ ts_zscore เพื่อแปลง level→momentum-of-proximity** — field ดิบ rank(field) Sharpe แค่ 0.14. เป็น family ใหม่ที่ work (momentum ระยะยาว) แต่ติด fitness ceiling 0.70 [2026-06-08]

### ❌ Pattern ที่ตก
- **medium-term momentum (ts_sum(returns, 63)) เป็น REVERSAL ไม่ใช่ momentum บน USA TOP3000 ช่วงนี้** — rank ดิบ Sharpe -0.90 ต้องพลิก `-` → +0.90 (fit 0.71, turnover ต่ำ 0.159) แต่ Sharpe ยังห่าง 1.25. อย่าคาดเดาทิศ momentum/reversal ตาม horizon ลอง simulate ก่อน [2026-06-08]
- **fundamental ROE เดี่ยวๆ (`return_equity` group_zscore) อ่อนบน daily** Sharpe 0.40, turnover 0.033 (ต่ำสุดๆ) — accounting signal เปลี่ยนรายไตรมาส ไม่มี edge รายวันพอ ต้องผสมกับ price signal หรือใช้เป็น filter ไม่ใช่ standalone [2026-06-08]
- **volatility term-structure ratio (ts_std_dev 5/60) อ่อนทั้ง 2 ทิศ** Sharpe ±0.44 — vol-regime signal ไม่มี directional edge บน equity daily [2026-06-08]

### 🔧 fitness ceiling ครั้งที่ 5 (pattern แข็งมาก)
- **52w-high ติด fitness ceiling ~0.70** เหมือน vwap(0.78)/close-range(0.95)/intraday-upside(0.77)/volume-asymmetry(0.62) — **ทุก near-miss ที่ Sharpe ผ่านแต่ fitness ไม่ถึง = คอขวด returns เสมอ** ยืด window/เพิ่ม decay ลด turnover ได้แต่ Sharpe+returns ตกตาม fitness ค้าง. **สรุปเชิงระบบ: การ tune setting/decay แทบไม่เคย break fitness ceiling — ต้องเพิ่ม returns ด้วย signal ใหม่/orthogonal เท่านั้น** ครั้งหน้าเจอ near-miss แบบนี้ อย่าเสียรอบ simulate ไล่ decay เกิน 2-3 variant ให้ข้ามไปลองผสม signal เลย [2026-06-08]

### ⚙️ ระบบ / API (ข้อจำกัดแพลตฟอร์มที่ค้นพบ)
- **`ts_max` ไม่มีจริงใน operator list** (มีแต่ `ts_arg_max` คืน index, `kth_element`) — สำหรับ "ค่าสูงสุด N วัน" ใช้ `ts_rank(x, d)` (percentile) หรือ field สำเร็จรูปแทน [2026-06-08]
- **BRAIN ไม่มี calendar/date operator หรือ field เลย** (ไม่มี day_of_month, days_to_month_end, calendar mask) — **seasonality ทุกแบบ (turn-of-month, day-of-week, holiday) implement ไม่ได้** อย่าเสนอไอเดีย seasonality อีกจนกว่าแพลตฟอร์มจะเพิ่ม [2026-06-08]
- **มี model field สำเร็จรูปเยอะ** (mdl77_*, mdl177_* เช่น pricemomentumfactor_high52w, indroe) — ค้น get_data_fields ก่อนสร้างเองจาก primitive ประหยัดขั้นตอน แต่ระวัง model field อาจ correlate กับ prod pool สูง (ต้องเช็ค prod-corr มือ)

### ✅ การผสม signal orthogonal ทะลุ fitness ceiling ของ single signal ได้จริง (เทคนิคใหม่ที่ work)
- **รวม rank ของหลาย signal ที่ orthogonal กัน → fitness สูงกว่าทุก component เดี่ยว** — combo `rank(A) + rank(B) - rank(C)` (52w-momentum + intraday-range + OBV-flow) ดัน fitness จาก single ceiling 0.77 → **0.82** โดย Sharpe คง 1.50 (diversification เพิ่ม risk-adjusted return, returns รวมสูงขึ้น, drawdown ต่ำลง 0.054) [2026-06-08]
- **วิธีผสมที่ใช้ได้: แต่ละ component ครอบ `rank()` (ได้ 0..1 สม่ำเสมอ น้ำหนักสมดุล) แล้วบวก/ลบตามทิศ** (signal ที่ต้อง short ใส่ `-rank(...)`). decay setting คุม turnover ของทั้ง combo. **combo ทน decay ได้ดีกว่า single signal** (single decay สูง=Sharpe พัง, combo decay 2-3 ยังคง Sharpe 1.42-1.50 + fit สูงสุด) เพราะ returns มาจากหลายแหล่ง robust กว่า [2026-06-08]
- 🔧 **แต่ combo ก็มี fitness ceiling ของตัวเอง (~0.82 สำหรับชุด 3 signal นี้)** — ปรับ weight (1.5×)/decay/truncation ไม่ขยับเลย (ล็อก 0.82 ทุก variant ~12 sims). การ break 1.0 ต้องเพิ่ม signal orthogonal ตัวที่ 4 ที่ returns สูง หรือเปลี่ยน region/universe ไม่ใช่ tune ชุดเดิม [2026-06-08]
- ⚠️ **ระวัง: component ที่เป็น short-term reversal/flow ใน combo อาจ self-correlate กับ alpha ที่ submit ไปแล้ว** — combo ที่จะ submit ต้องเช็ค self-corr; ส่วนที่ให้ orthogonality จริงคือ component ที่คนละ family (เช่น momentum 52w) ไม่ใช่ตัวที่ซ้ำแนว submitted [2026-06-08]

## รอบ 5 — 2026-06-08 (แก้คอขวด returns + universe lever)

### ✅ Pattern ที่ได้ผล
- **universe TOP1000 ดัน fitness ของ combo +0.03 (0.82→0.85)** — momentum/microstructure สะอาดกว่าใน large-cap, returns ขึ้น (0.124→0.134) โดย Sharpe คง 1.49. ลอง TOP1000 กับ alpha ที่ returns เป็นคอขวดเสมอ. **แต่ TOP500 เล็กไป Sharpe หลุด (1.12) + sub-universe Sharpe เริ่มตึงบน TOP1000** [2026-06-08]

### ❌ Pattern ที่ตก (signal "returns สูง" ตามทฤษฎี แต่ตกบน USA daily)
- **PEAD / earnings-surprise (standardized_unexpected_earnings) อ่อนมากบน daily** Sharpe -0.12, returns ≈0, turnover 0.024 (แทบไม่ขยับเพราะ quarterly) — event edge เจือจางบน delay1 universe ใหญ่ [2026-06-08]
- **analyst estimate revision (mdl177_earningmomentumfactor_rev6) Sharpe -0.58** · **FCF growth surprise (mdl77_2gdna_pctchgfcf) Sharpe -0.26 flat** — fundamental/event factor ทุกตัวอ่อนบน USA daily [2026-06-08]
- **price-momentum-acceleration (ts_delta ของ ts_sum returns) Sharpe -0.57** · **volume-breakout (ts_rank(close,20)×volume) Sharpe -1.16** (พลิก +1.16 แต่ TO 0.67 ตึง + เป็น reversal ซ้ำแนว submitted) [2026-06-08]

### 🔧 ข้อสรุปเชิงโครงสร้าง (สำคัญที่สุดของ session — กำหนดทิศรอบหน้า)
- **คอขวด returns ต่ำเป็นปัญหาเชิงโครงสร้างของ USA TOP3000/TOP1000 delay1 ไม่ใช่ของ signal ตัวใดตัวหนึ่ง** — ลองมา 5 รอบ ~20 signal families: price/microstructure ให้ Sharpe สูง (1.3-1.5)/returns ต่ำ (~0.11) เสมอ; fundamental/event ให้ Sharpe < 0.6/returns ≈0. **ไม่มี family ใดให้ returns สูงพอดัน fitness ถึง 1.0**. fitness ceiling ที่เจอทุกตัว (0.62-0.95) ล้วนมาจากคอขวดนี้ [2026-06-08]
- **ทางแก้คอขวด returns ที่ควรลองรอบหน้า (ยังไม่เคยลอง): เปลี่ยน region (EUR/ASI/CHN — USA arbitrage หนักสุด returns เลยต่ำ), หรือ delay 0, หรือ dataset ใหม่ (news/sentiment/options)** — การหา signal ใหม่บน USA TOP3000 delay1 เดิมๆ ไม่น่าทะลุเพดานได้ ควรเปลี่ยนแกน data/universe แทน [2026-06-08]
- **combo + TOP1000 ดีสุดที่ทำได้ = fitness 0.85** ความคืบหน้า fitness: single 0.69 → combo 0.82 → +TOP1000 0.85 (diminishing +0.03 ต่อ lever) [2026-06-08]

## รอบ 6 — 2026-06-08 (combo anchor ที่ signal แรงสุด → fitness 0.96 BEST EVER)

### ✅ เทคนิค combo ที่ดันถึง fitness 0.96 (สูงสุดของโปรเจกต์)
- **anchor combo ที่ signal ที่ fitness เดี่ยวสูงสุด (close-range 0.95) แล้วเติม orthogonal ดีกว่า anchor ที่ signal อ่อน** — รอบ 4 anchor intraday-upside (0.77) ได้ combo 0.85; รอบ 6 anchor close-range (0.95) ได้ combo **0.96**. บทเรียน: **เลือก base combo จาก near-miss ที่ fitness สูงสุด ไม่ใช่ตัวที่ orthogonal สุด** [2026-06-08]
- **สูตร weighting ที่ break เพดาน: เพิ่มน้ำหนัก signal แรงสุด 2.5-3× + บวก orthogonal returns (momentum) + ลบ signal ที่ turnover สูง (OBV)** เพื่อ net ลด turnover โดยรักษา returns. `2.5*close_range + momentum - OBV` decay2 → Sharpe 1.83, fit 0.96, TO 0.53. การลบ OBV (signal turnover สูง) ตัด TO จาก 0.57→0.53 โดย returns คง 0.144 [2026-06-08]
- **universe optimal ขึ้นกับ signal หลักของ combo** — close-range combo ชอบ TOP3000 (TOP1000→0.76 พัง), แต่ 52w-momentum combo (รอบ4) ชอบ TOP1000. อย่า assume TOP1000 ดีเสมอ ต้องลองตาม anchor [2026-06-08]

### 🔧 plateau 0.96 — เพดานใหม่ (ใกล้ผ่านสุด)
- **close-range-anchored combo ตันที่ fitness 0.96** ดันน้ำหนัก/decay ต่อ = นิ่ง 0.94-0.96 (overfit). ขาดแค่ 0.04 ถึง limit 1.0 — ใกล้สุดที่เคยทำได้. ทางทะลุที่เหลือ: (1) fix UNITS warning ของ close-range, (2) orthogonal component returns-สูงตัวใหม่ (ยังหาไม่เจอบน USA delay1 — รอบ 5), (3) เปลี่ยน data axis ([[returns-bottleneck-usa-delay1]]). **อย่าดันน้ำหนัก combo เกิน 3 variant เพื่อไล่ fitness — overfit** [2026-06-08]

## รอบ 7 — 2026-06-08 (ยืนยันเพดาน 0.96 — within-USA-delay1 หมดทางแล้ว)

### ⚙️ UNITS warning ของ close-range fix ไม่ได้ + ไม่กระทบ fitness
- **UNITS warning ติดอยู่กับ combo เสมอแม้ normalize/centered `(2*close-high-low)/(high-low)` หรือ winsorize** — ไม่ได้มาจาก scale ของ ratio (ลองทุกแบบ warning ยังอยู่). **winsorize ratio ทำ fitness ลด** (0.96→0.93-0.94 เพราะตัด extreme ที่ให้ returns), truncation 0.06 = 0.08 (fit 0.96 เท่ากัน). **สรุป: UNITS เป็น warning ที่ไม่กระทบ fitness และ fix ไม่ได้ในกรอบนี้ — เลิกเสียเวลากับมัน** [2026-06-08]

### 🔧 สรุปขั้นสุด: USA TOP3000 delay1 หมดทาง ที่ fitness 0.96
- **เพดาน 0.96 คือ hard ceiling ของ data ชุดนี้** — ลอง ~7 รอบ, ~20 signal families, combo หลายแบบ, weighting/decay/universe/truncation/UNITS-fix ครบ ไม่มีอะไรทะลุ 1.0. รากปัญหาคือ [[returns-bottleneck-usa-delay1]] (returns ต่ำเชิงโครงสร้าง). **การวน /find-alphas ซ้ำบน USA TOP3000 delay1 ต่อไปจะไม่ให้ตัวผ่าน — เปลือง sims**. ต้องเปลี่ยน data axis (region EUR/ASI/CHN, delay 0, หรือ dataset ใหม่) เท่านั้น ครั้งหน้าถ้าผู้ใช้ยังยืน USA delay1 ให้แจ้งตรงๆ ว่าเพดานคือ 0.96 และเสนอ submit near-miss ที่ดีสุดถ้าเกณฑ์ผ่อนได้ หรือรอ data ใหม่ [2026-06-08]

## รอบ 8 — 2026-06-09 (สำรวจ dataset ใหม่: options/sentiment/customer/skewness)

### ⚙️ DATA DISCOVERY — BRAIN tier เรามี dataset เยอะกว่าที่เคยรู้ (verified จริง, จดไว้ใช้ภายหลัง)
- **Options**: `implied_volatility_call_30/720`, `implied_volatility_put_30/720`, `implied_volatility_mean_skew_30`, `pcr_oi_all/30/60`, `pcr_vol_all`, `put_call_volatility_slope_twenty_eight_day`
- **Sentiment/news**: `scl12_buzz`, `scl12_sentiment`, `snt_buzz_ret`, `snt_social_volume`, `snt_social_value`, `daily_equity_mood_indicator`
- **Skewness สำเร็จรูป**: `mdl177_pricemomentumfactor_skew90drtn` (90d realized skew)
- **Supply-chain/lead-lag**: `rel_ret_cust` (customer return — Cohen & Frazzini เป๊ะ), `industry_relative_return_5d/4w`
- operators: `ts_regression(y,x,d)` มีจริง, `group_mean(x,weight,group)` (ต้องมี weight param), **`ts_skewness` ไม่มี** (สร้างเองจาก power/ts_mean/ts_std_dev)

### ❌ แต่ data ใหม่ทุกตัวตกด้วยข้อจำกัดเชิงปฏิบัติ (ไม่ใช่ field ไม่มี)
- **Options (IV spread, PCR) → CONCENTRATED_WEIGHT FAIL** — options data ครอบคลุมหุ้นไม่ครบ TOP3000 น้ำหนักกระจุกที่ subset ที่มี options. **ต้องรันบน universe liquid-options (TOP500) ถึงจะไม่ fail** — อย่ารัน options signal บน TOP3000 [2026-06-09]
- **Sentiment buzz (scl12_buzz/sentiment) turnover 1.30 ระเบิด + flat** — sentiment เปลี่ยนรายวัน noisy เกินสำหรับ daily alpha [2026-06-09]
- **realized skewness (mdl177 สำเร็จรูป) flat (Sharpe 0.08)** — distributional signal ไม่มี edge บน USA daily [2026-06-09]

### 🔧 customer-momentum (rel_ret_cust) — มี edge จริงแต่ turnover-locked
- **`rel_ret_cust` (lagged 1-day) → Sharpe -1.25 (พลิก +1.25) แรงสุดในบรรดา signal ใหม่** แต่ **turnover 1.10 ระเบิด** เพราะเป็น 1-day signal. smooth (ts_sum 21d / decay 10) → Sharpe ตกเหลือ 0.57-0.76 ทันที = edge ผูกกับความเร็ว untameable standalone. เก็บเป็น near-miss — อาจใช้เป็น orthogonal component ใน combo (reversal, คนละ family) แต่จะดัน turnover combo ขึ้น [2026-06-09]
- **บทเรียนรวบยอด: แม้ data category ใหม่ (options/sentiment/customer) ก็ไม่ให้ตัวผ่านบน USA TOP3000 delay1** — ตอกย้ำ [[returns-bottleneck-usa-delay1]]. options ต้อง TOP500, ส่วน sentiment/customer turnover-locked. ทางเดียวที่ยังไม่ลองจริงคือเปลี่ยน region/delay [2026-06-09]

## รอบ 12 — 2026-06-10 (Fama-French 1993: HML value + SMB size)

### ❌ FF factors บริสุทธิ์อ่อน/ติดลบบน USA daily (ยืนยันซ้ำ pattern fundamental)
- **HML value (`mdl177_fa_bp` book-to-market) Sharpe -0.51** = value ติดลบ → **growth ชนะ value** ในช่วง sample (สอดคล้องตลาดจริงหลัง 2010). **SMB size (`-log(cap)`) Sharpe -0.12** flat. value-timing 5yr -0.36. ทุกตัว turnover 0.02-0.04 ช้าเกินมี edge รายวัน [2026-06-10]
- field สำเร็จรูป FF บน BRAIN: **HML** `mdl177_fa_bp`, `mdl177_2_deepvaluefactor_bp`, `mdl177_2_industryrrelativevaluefactor_curindbp_` (industry-rel แล้ว), `mdl177_2_5yearrelativevaluefactor_rel5ybp` (value-timing) · **SMB** `cap` (mkt cap ล้าน), `mdl177_2_liquidityriskfactor_nlmktcap` (log size)

### ✅ เทคนิคใหม่: ใช้ FF factor เป็น "conditioning weight" บน reversal ดีกว่าใช้เป็น signal เดี่ยว
- **`-ts_zscore(close,5) * winsorize(mdl177_fa_bp, std=3)`** (SECTOR/INDUSTRY, decay 3-5) → **Sharpe 1.43-1.66, Fitness 0.83, sub-universe 1.1-1.3** — ถ่วง price-volume reversal ด้วย book-to-market แทน volume → reversal แรงขึ้นในหุ้น value. **sub-universe robust สูงสุดในบรรดา near-miss เดี่ยว + orthogonal กับ submitted (B/M ≠ volume)** [2026-06-10]
- **INDUSTRY/SECTOR neutralization กู้ returns ได้เทียบกับ SUBINDUSTRY** (0.138→0.167) สำหรับ signal ที่ subindustry บีบ returns เกิน — ลองเมื่อ returns เป็นคอขวดและ sub-universe ยังแข็ง [2026-06-10]

### 🔧 เพดานใหม่ + การ amplify reversal ด้วย characteristic
- **value-reversal family ติด fitness ceiling ~0.83** — returns/Sharpe trade-off ล็อก (neut กว้าง→returns 0.167 แต่ Sharpe 1.43; neut แคบ→returns 0.15 Sharpe 1.63; product คงที่). decay/window/weight ดันไม่ข้าม [2026-06-10]
- **size-conditioning (× rank(-log cap)) บน reversal: returns พุ่ง (overnight×size returns 0.20) แต่ทำลาย sub-universe Sharpe** (กระจุกใน small-cap → 0.20-0.46 fail LOW_SUB_UNIVERSE_SHARPE). **value-conditioning (× B/M) ดีกว่า size-conditioning** เพราะรักษา robustness [2026-06-10]
- **บทเรียนรวบยอด: characteristic-conditioned reversal (× B/M หรือ × volume) = booster ที่ได้ Sharpe สูง แต่ fitness ยังชน returns ceiling 0.83-0.99 เหมือนทุก reversal family บน USA delay1**. FF คุณค่าจริงคือ orthogonality (B/M เป็นแกนถ่วงใหม่) ไม่ใช่ standalone return [[returns-bottleneck-usa-delay1]] [2026-06-10]

## รอบ 13 — 2026-06-10 (Fama-French 2015 Five-Factor: RMW profitability + CMA investment)

### ✅✅✅ ค้นพบใหญ่สุด: RMW profitability = ตัวถ่วง reversal ที่ดีสุดเท่าที่เคยเจอ (BEST SINGLE SIGNAL, fit 0.96)
- **`-ts_zscore(close,5) * winsorize(gross_profit_to_assets_ratio, std=3)`** {INDUSTRY, decay 4, TOP3000} → **Sharpe 1.69, Fitness 0.96, Returns 0.179, sub-universe 1.41, ไม่มี UNITS warning** (alpha 3qAX7j3P) — **single signal ที่ดีสุดในประวัติโปรเจกต์** (เทียบเท่า combo 0.96 รอบ 6 แต่เป็น signal เดี่ยว + robust กว่า) [2026-06-10]
- **ลำดับคุณภาพตัวถ่วง reversal (พิสูจน์แล้ว): RMW profitability (0.96) > HML value (0.83) > volume (submitted, แต่ corr สูง)** — **ตรงกับ thesis FF 2015 เป๊ะ ว่า RMW เหนือ HML**. gross-profit-to-assets (Novy-Marx) คือ proxy RMW ที่ใช้งานได้จริง [2026-06-10]
- **กลไก: หุ้น high-profitability ที่ราคาร่วงระยะสั้น = mispricing ชัดเจน → reversal แรง + returns สูง (0.18)** profitability เป็น "quality filter" ที่ทำให้ reversal สะอาดขึ้น (Sharpe 1.7, sub-universe 1.4) [2026-06-10]

### ❌ RMW/CMA บริสุทธิ์อ่อน + CMA เจือจาง (ตรง research)
- **`gross_profit_to_assets_ratio` ดิบ → CONCENTRATED_WEIGHT FAIL** (coverage ไม่ครบ TOP3000) — ต้องใช้เป็น weight บน signal อื่น ไม่ใช่ standalone [2026-06-10]
- **CMA (asset growth `mdl177_v1_400_pctchgqtrast`, flip) Sharpe −0.25** อ่อน — ตรง deep-research ที่ว่า CMA insignificant out-of-sample (German market, FF 2017 Europe). **เพิ่ม CMA เข้า composite weight ทำ fit ลด 0.96→0.91** (เจือจาง). อย่าใช้ CMA บน USA daily [2026-06-10]
- **เพิ่ม 52w-momentum combo → fit ลด 0.96→0.91** ด้วย — signal profitability-reversal แรงอยู่แล้ว การผสมอะไรก็เจือจาง Sharpe. **บทเรียน: signal เดี่ยวที่ Sharpe สูงมาก (1.7) + fit ใกล้เพดาน อย่าผสม — combo ดีเมื่อ component อ่อนต้องการ diversification เท่านั้น** [2026-06-10]

### 🔧 ยืนยันเพดาน 0.96 ครบทุก lever (ปิดประเด็น)
- profitability-reversal ชน 0.96: decay 3/4/5/6 (peak 4), trunc 0.04/0.08, SUBIND/INDUSTRY/SECTOR (INDUSTRY ดีสุด), **TOP1000 แย่ลง 0.84-0.85** (universe เล็ก = breadth ลด, Sharpe ตก, drawdown ขึ้น — ต่างจาก quality-combo รอบ 5 ที่ชอบ TOP1000; reversal-based ชอบ TOP3000), composite/combo เจือจาง. **0.96 = hard ceiling จริงของ USA delay1** ทางข้ามเหลือแค่ data axis [[returns-bottleneck-usa-delay1]] [2026-06-10]
- ⚙️ field ใหม่ที่ใช้ได้: **RMW** `gross_profit_to_assets_ratio` (เป็น weight), `fnd6_newa1v1300_gp`, `fnd6_ops` · **CMA** `mdl177_v1_400_pctchgqtrast` (asset growth สำเร็จรูป, แต่อ่อน) · `assets`/`total_assets_amount` (สร้าง asset growth เอง)

## รอบ 14 — 2026-06-10 (สังเคราะห์ best-base × RMW-weight — ยืนยันเพดาน 0.96 ครั้งที่ 14)
### 🔧 base ที่ Sharpe สูงกว่า ไม่ได้ fitness สูงกว่าเสมอ — fitness ถูก dominate ด้วย returns/turnover ratio
- เอา RMW-weight (ดีสุด) ไปใส่ reversal base ที่ Sharpe สูงกว่า ts_zscore: **close-range × RMW → Sharpe 2.07** (สูงสุด!), **midpoint × RMW → Sharpe 1.91** — แต่ทั้งคู่ได้ **fitness 0.92-0.94 ต่ำกว่า** ts_zscore×RMW (0.96) เพราะ **turnover สูงกว่าตาม Sharpe → กิน fitness** [2026-06-10]
- 🔑 **บทเรียนรวบยอด: อย่าไล่ Sharpe สูงสุดอย่างเดียว — fitness = sqrt(returns/turnover)×Sharpe, ถ้า base turnover สูง การได้ Sharpe +0.4 ไม่ชดเชย returns/turnover ที่แย่ลง**. `ts_zscore(close,5)` เป็น reversal base ที่ balance returns/turnover ดีสุด (sweet spot) แม้ Sharpe ไม่สูงสุด. close-range/midpoint Sharpe 2.0+ แต่ turnover 0.66-0.80 [2026-06-10]
- **ยืนยัน 0.96 hard ceiling ครั้งที่ 14** ด้วยการสังเคราะห์ best-base × best-weight (เหตุผลดีสุดเท่าที่ทำได้) — ยังไม่ข้าม. **ปิดประเด็น within-USA-delay1 อย่างเด็ดขาด: ทางข้าม 1.0 เหลือแค่เปลี่ยน data axis เท่านั้น** [[returns-bottleneck-usa-delay1]] [2026-06-10]

## รอบ 15 — 2026-06-10 (4 classic anomalies: JT/Carhart momentum, Sloan accruals, Novy-Marx GP + การผสม)
### ❌ momentum ตายสนิทบน USA daily delay1 (ปิดประเด็นทุกแบบ)
- **FF momentum 12-1 (`mdl177_pricemomentumfactor_ff10mrtn`) Sharpe −0.11** flat — ตอกย้ำว่า momentum family ตายบน USA delay1 (เคยลอง 52w-high 1.46/fit0.69, medium-term=reversal, breakout, acceleration — ตกหมด). **เลิกลอง momentum standalone บน USA delay1** [2026-06-10]
- **Sloan accruals (`mdl177_v1_400_ttmaccu`, short high-accrual) Sharpe −0.77** — sign กลับช่วงนี้ (high-accrual กลับ outperform), อ่อนแบบ fundamental ตามเคย [2026-06-10]

### 🔧 "การผสมกลยุทธ์" ไม่ช่วยบน USA delay1 — เพราะไม่มีของแรงพอจะผสม (สรุปเชิงโครงสร้าง)
- ลองผสม GP-reversal (0.96) กับทุกอย่าง → **เจือจางหมด**: +momentum sleeve (additive) **0.54** (crash), GP+value weight 0.92, momentum-weight 0.59, ×low-PTH (Chen-Stivers-Sun conditional reversal) 0.75/0.66 [2026-06-10]
- 🔑 **deep-research ยืนยัน "combined double-sort ชนะ side-by-side" (Novy-Marx 7.4% vs 3.5%/ปี)** — และ **GP-conditioned reversal (0.96) = double-sort ที่ดีสุดอยู่แล้ว**; additive sleeve = side-by-side (เจือจาง). การ × factor เพิ่ม = over-condition ลด Sharpe [2026-06-10]
- 🔑🔑 **เหตุผลแท้ที่การผสมไม่ทะลุ: บน USA delay1 มี signal ที่ "แรงพอจะ contribute" แค่ 2 ตระกูล = short-term reversal + GP(gross profitability)-as-weight. momentum/value/accruals/CMA อ่อนเดี่ยวๆ (Sharpe ~0 ถึงลบ) → diversification math ของ factor-combination (corr ติดลบ) ใช้ไม่ได้ เพราะผสมของอ่อนไม่เกิดของแรง.** value+momentum 1.42 Sharpe ในงานวิจัย = global cross-asset (8 asset class) ไม่ transfer มา single-asset USA equity (research เตือนเอง) [2026-06-10]
- **ยืนยัน 0.96 hard ceiling ครั้งที่ 15** — ครอบคลุมการผสม 4 classic anomaly ครบ. GP-reversal 0.96 (รอบ 13) ยังเป็น best ที่สุด [[returns-bottleneck-usa-delay1]] [2026-06-10]

## ⚙️ SYSTEM UPGRADE — 2026-06-10 (ปรับระบบให้มีประสิทธิภาพขึ้น)
หลังพบว่า root cause ของ "หาไม่เจอ" = ขุดวนแค่ 2-3 dataset เดิม (pv1/fundamental6) ไม่เคย enumerate data axis ครบ:
- **สร้าง `knowledge/dataset-map.md`** — แคตตาล็อก 20 datasets + สถานะขุด. **find-alphas step 0 ต้องอ่านก่อนเสมอ + เลือก dataset 🔴 ที่ยังไม่ขุด** อย่าเปิดรอบด้วย tune/combine ของเดิม. dataset ที่ยังไม่ขุด+มีศักยภาพ: **news18 (Ravenpack), news12, earnings4, model16/51/53** — เป็น returns source ที่อาจไม่ใช่ reversal (ทางหลุด 0.96 โดยไม่ต้องรอ delay 0)
- **สร้าง `data/tried-registry.jsonl`** — log ทุก sim (expr+settings→result) กันซ้ำ + meta-analysis. seed จากรอบ 12-15 แล้ว. เช็คก่อน sim ใหม่ทุกครั้ง
- **SKILL step 0 เพิ่ม DATA-AXIS PROBE** (`get_datasets`/`get_operators` ครั้งแรก/session) — get_datasets ไม่เคยถูกเรียกเลย 15 รอบ! (เพิ่งเรียกครั้งแรก เจอ 20 datasets)
- **review-candidates ย้ำ: self-corr `empty`/`pending` ≠ ผ่าน** ต้อง re-check (เคส GroeQEpO empty→0.805)
- **แก้ `src/wq-client.js`: เพิ่ม `_authedRetry`** (retry transient 5xx/429/network) ใช้กับ getAlpha + simulate poll — กัน 504/timeout ที่เจอบ่อย. ⚠️ **ต้อง restart MCP server ก่อนมีผล** (โค้ดเก่ารันใน memory). node --check ผ่านแล้ว. **restart แล้ว 2026-06-10 (retry live)** [2026-06-10]
- **สร้าง `knowledge/alpha-design-framework.md`** — โครง 5 stage + GATE (return-source → diagnostic+feasibility → corr-screen → construction → robustness) ที่ find-alphas ต้องยึดทุกรอบ. **จุดที่เราติด = Stage 0 (return-source) ขุดวน 2 dataset; gate ที่ฆ่าบ่อย = Stage 2 (corr ซ้ำ submitted)**. แต่ละ stage เป็น GATE หยุด/ถอยถ้าไม่ผ่าน อย่าดันต่อ [2026-06-10]

### 🔴🔴 ค้นพบครั้งใหญ่จาก list_alphas (2026-06-10) — เข้าใจ 2-gate problem ที่แท้จริง
- **ระบบไม่เคย submit สำเร็จเลย** — vRmLQWYA/XgKn5LV8 ที่ submitted.jsonl อ้าง จริงๆ `status:UNSUBMITTED, os:null` (ตรวจด้วย get_alpha). **submit_status 201 ที่บันทึก = เข้าใจผิด**. แก้แล้ว: submitted.jsonl เคลียร์, passed-alphas.md แก้สถานะ [2026-06-10]
- **เจอ pool จริง = 9 ACTIVE alphas (author TS87756) ที่ self-corr เช็คเทียบ** — บันทึกใน `knowledge/submitted-pool.md`. กลไกที่จองแล้ว: **reversal×(volume/illiquidity/value) [4 ตัว], options IV skew [Sharpe 2.22], leverage, earnings yield, turnover** [2026-06-10]
- 🎯 **เข้าใจ 2-gate problem ที่แท้จริงแล้ว: พูลของบัญชีนี้อิ่มตัวด้วย reversal+value+IV-skew อยู่ก่อนแล้ว** → ทุก signal reversal-based ของเรา (GP-reversal 0.96, midpoint×vol, overnight×vol, close-range, HML-reversal) **ซ้ำกลไกในพูล = self-corr สูง ส่งไม่ได้แม้ fitness ผ่าน**. นี่ไม่ใช่แค่ "returns ต่ำ" แต่เป็น **"พูลตัวเองชนตัวเอง"** [[returns-bottleneck-usa-delay1]] [2026-06-10]
- ✅ **กลไกที่พูลยังว่าง (โอกาส corr ต่ำ): news/sentiment event-driven (news18/news12), earnings drift (earnings4), credit/distress (model53), fundamental scores (model16)** — ตรงกับ dataset-map Stage 0 priorities. **รอบหน้าต้องออกจากตระกูล reversal เด็ดขาด** [2026-06-10]
- ⚙️ **ก่อน /review-candidates หรือเริ่มรอบ: refresh `submitted-pool.md` ด้วย `list_alphas status=ACTIVE`** (ไม่ใช่ status default ที่คืน UNSUBMITTED ทั้งหมด) [2026-06-10]

## รอบ 16 — 2026-06-10 (สวีป dataset ใหม่ตาม Google Doc + Stage 0 — ปิดเคสครบ)
### ❌ กลไก non-reversal ใหม่แบนหมด (news/BAB/distress/earnings) — 12 sims
- **news sentiment (Tetlock, news18 Ravenpack) แบนทุกมุม:** level (turnover 0.83-0.99 ระเบิด), smoothed ts_mean (flat-neg −0.47), earnings-eval sentiment (0.09), ×relevance (−0.45), shock ts_delta (turnover 1.13), impact-projection (flat). **news sentiment ไม่ใช่ returns source บน USA daily cross-section** (ตรงรอบ 8 scl12) [2026-06-10]
- **BAB low-beta (Frazzini-Pedersen, beta_last_90/360_spy) → CONCENTRATED_WEIGHT fail + flat** ทั้ง winsorize แล้ว/ไม่. beta มี NaN เยอะ (ต้องมี history) กระจุก [2026-06-10]
- **distress anomaly (model53 PD 1m/1y, CHS 2008) flat** (−0.14 ถึง 0.18) · **earnings announcement_effect (earnings4) → CONCENTRATED_WEIGHT fail** (options-based coverage) [2026-06-10]
- field: news18 sentiment = `mean_*_sentiment_score` (MATRIX daily), `mean_event_novelty/relevance/impact` · beta = `beta_last_{30,60,90,360}_days_spy` · model53 = `annualized_pd_{1month,1year,...}` · earnings4 = `announcement_effect_N`, `abs_avg_pct_move_announcements_12`

### 🔒🔒🔒 ข้อสรุปขั้นสุดท้าย (16 รอบ ~65 sims ครบทุก dataset หลัก)
- **USA TOP3000 delay1 มี tradeable returns source เดียว = short-term reversal** (pv1, Sharpe 1.5-2.1) ซึ่ง **พูลบัญชีอิ่มตัว → self-corr สูง**. กลไก non-reversal ทุกตัวที่ลองมา (momentum/value/profitability-เดี่ยว/accruals/CMA/size/news/sentiment/BAB/distress/earnings/options/customer/skewness) = **flat (Sharpe<0.5)** [2026-06-10]
- **2-gate เป็น hard structural constraint ที่พิสูจน์ครบแล้ว** — ไม่มีกลไกผ่านทั้ง returns≥0.15 และ self-corr<0.7 พร้อมกัน. **การ sim เพิ่มบน USA TOP3000 delay1 = เปลือง quota** (ระบบ Stage 0/feasibility มีไว้กันตรงนี้). best ที่ทำได้ = GP-reversal fit 0.96 (reversal-based, corr เสี่ยง) [2026-06-10]
- **ทางออกจริงเหลือ 3: (1) delay 0 [bar 2.0/1.3, ต้อง high-freq signal] (2) tier upgrade [region/universe ใหม่] (3) ยอมรับ near-miss 0.96 + เช็ค self-corr มือ.** ไม่มีทางลัดด้วยการหา signal เพิ่มบน axis เดิม [2026-06-10]

## รอบ 17 — 2026-06-10 (ปิด dataset 🔴 สุดท้าย: model51 idio-vol + model16 fscore — flat ครบ)
### ❌ model51 Systematic Risk Metrics + model16 Fundamental Scores = flat (ปิด 2 dataset สุดท้าย)
- **idiosyncratic vol anomaly (`unsystematic_risk_last_90_days` = 1−R² vs SPY, Ang-Hodrick-Xing-Zhang 2006) standalone → Sharpe 0.14 flat + CONCENTRATED_WEIGHT fail + drawdown 0.70**. นี่คือ IVOL "ตัวจริง" (แยก market risk ด้วย R² regression) ที่ lessons เก่าไม่เคยลอง (เคยลองแค่ total vol ดิบ 0.08) — **ยืนยัน: แม้ IVOL ที่ purify แล้วก็ flat บน USA daily** เหมือน risk-metric เดี่ยวทุกตัว [2026-06-10]
- **fscore_surface (model16 composite Value/Growth/Profit/Mom/Quality) Sharpe −0.19 flat** — composite fundamental score ก็ตายตาม fundamental เดี่ยว. **ปิด model16 + model51** [2026-06-10]
- field model51: `unsystematic_risk_last_{30,60,90,360}_days`, `systematic_risk_last_N`, `beta_last_N_days_spy`, `correlation_last_N_days_spy` (ทั้งหมด MATRIX coverage เต็ม แต่ standalone คาดว่า flat ตาม BAB/vol)

### 🔧 idio-vol เป็น reversal-weight = returns สูง แต่ตกซ้ำรอย GP/volume
- **`-ts_zscore(close,5) * winsorize(unsystematic_risk_last_90_days,std=3)` → returns 0.173 (สูง≥0.15!), Sharpe 1.22, sub-univ 0.71** แต่ **CONCENTRATED_WEIGHT fail** (rank-weight ก็ยัง fail: akOxzLmO) + fitness 0.65. = reversal conditioned by idio-vol (Avramov-Chordia-Goyal: reversal กระจุกใน high-IVOL) — **returns สูงเพราะ reversal-core อีกแล้ว → corr เสี่ยงซ้ำ pool (1YmxEbYQ reversal×illiquidity)**. ยืนยันกฎ: **อะไรก็ตามที่ returns≥0.15 บน USA delay1 = reversal-core = ติด gate-2** [2026-06-10]

### 🔒🔒🔒🔒 ปิดเคสขั้นสุด (17 รอบ ~70 sims — ขุดครบทุก dataset ใน get_datasets แล้ว)
- **get_datasets (20 datasets) ขุดครบทุกตัวที่เป็น signal source แล้ว** — pv1🟢 fundamental6🟢 model77/177🟢 + option/sentiment/pv13/analyst4/earnings4/news12/news18/beta/model53/model16/model51 🟡 (สวีปแล้วแบน). เหลือ fundamental7/fundamental2 (niche, คาด flat ตาม fundamental) + univ1 (metadata ไม่ใช่ signal)
- **ข้อสรุปไม่เปลี่ยน + แข็งขึ้น: USA TOP3000 delay1 มี returns source เดียว = short-term reversal (pv1) ที่พูลอิ่มตัว.** ทุก non-reversal dataset ที่เหลือ = flat. **best = GP-reversal fit 0.96 (3qAX7j3P, ผ่านทุก check ยกเว้น LOW_FITNESS 0.96; self-corr ยังไม่วัดจริง — ต้องรอ compute ที่ /review-candidates)**
- **การ sim เพิ่มบน USA TOP3000 delay1 = เปลือง quota แน่นอนแล้ว** (ขุดครบทุก dataset). ทางออกเหลือ: **(1) delay 0 [bar 2.0/1.3] (2) tier upgrade (3) ยอมรับ GP-reversal 0.96 + วัด self-corr จริงที่ /review-candidates → ถ้า corr<0.7 อาจ submit ได้แม้ fit 0.96 (ขึ้นกับ BRAIN จะรับ near-fitness ไหม) หรือดัน fit ข้าม 1.0 ด้วย data axis ใหม่** [2026-06-10]

### 🔴🔴🔴 ชี้ขาด: GP-reversal (3qAX7j3P) self-corr วัดจริงแล้ว = 0.90 → ตก 2-gate พร้อมกัน (ปิดประเด็นถาวร)
- **/review-candidates 2026-06-10: self-corr ของ GP-reversal (best signal ทั้งโปรเจกต์) compute เสร็จ = max 0.9033** (limit 0.70). correlate 0.90 กับ wpzLYJVl + **0.84 กับ wpzeKYbx (1 ใน 9 ACTIVE pool, long-term reversal−value)** [2026-06-10]
- **GP-reversal ตก 2 gate พร้อมกัน: LOW_FITNESS 0.96 + SELF_CORRELATION 0.90** — **นี่คือหลักฐานเชิงประจักษ์ที่ปิด 2-gate hypothesis เด็ดขาด**: แม้ตัวถ่วงเป็น profitability (orthogonal ในเชิง factor) แต่ **base = ts_zscore(close,5) reversal ครอง 90% ของ variance → corr สูงทันที**. ยืนยันกฎ: **บน USA delay1 ตัวถ่วง factor ไม่ช่วยลด self-corr ของ reversal — corr ถูกกำหนดโดย base reversal ไม่ใช่ weight** [2026-06-10]
- 🔑 **บทเรียนสุดท้ายของ family reversal-conditioned: GP-reversal / HML-reversal / IVOL-reversal / midpoint×vol / close-range — ทุกตัวมี base reversal ร่วม → self-corr 0.8-0.9 กับพูล. การเปลี่ยน "ตัวถ่วง" (volume→GP→B/M→idio-vol) เปลี่ยนแค่ Sharpe/fitness ไม่เปลี่ยน corr. ส่งไม่ได้ทั้ง family.** ต้องเปลี่ยน BASE (ไม่ใช่ reversal) หรือเปลี่ยน data axis เท่านั้น [2026-06-10]
- ⚙️ self-corr comparison pool ใหญ่กว่า 9 ACTIVE — รวม simulated reversal เก่า (wpzLYJVl, 2rZOMb08 fit 1.25, vRzl1bWQ ฯลฯ) ที่ author เคยรัน. prod-corr ยัง 403 (tier-gate ถาวร) [2026-06-10]

## รอบ 18 — 2026-06-10 (สำรวจ delay 0 จริงจัง — ติดกำแพง returns/Sharpe คู่)
### 🔒🔒 delay 0 ติดกำแพงหนักกว่า delay 1 — ต้องการ Sharpe 2.0 + returns ~0.2 พร้อมกัน (เป็นไปไม่ได้กับ signal ที่มี)
- **delay-0 limits ยืนยัน: LOW_SHARPE 2.0, LOW_FITNESS 1.3, HIGH_TURNOVER 0.7** (Sharpe/fit โหดกว่า d1 มาก) [2026-06-10]
- **fundamental6 fields ไม่มีบน delay 0** — `gross_profit_to_assets_ratio` = UNKNOWN variable → GP-reversal (best signal) ใช้ไม่ได้บน d0. fundamental เป็น delay-1-only [2026-06-10]
- **pure reversal `-ts_zscore(close,5)` บน d0 = Sharpe 0.77** (vs 1.7 บน d1) + turnover 0.75 fail — reversal ตายบน d0 ยืนยัน (contemporaneous, ใช้ today's close = noise) [2026-06-10]
- **lead-lag (pv13 rel_ret_*) มีบน d0 แต่อ่อน:** customer `-ts_mean(rel_ret_cust,3)` smoothed → Sharpe 1.00 (sub-univ 0.03 fail!), competitor −0.26, overlap 0.27, partner ไม่ลอง. raw customer เคย 1.64 (รอบ 8) แต่ turnover 1.10 fail = **speed-locked: smooth→Sharpe ตก, raw→turnover ระเบิด** [2026-06-10]
- 🔑🔑 **ตัวฆ่าแท้ของ d0 = returns จิ๋ว (0.009-0.033) + bar Sharpe/fit สูง.** fitness d0 ต้องการ returns ≥ turnover×(1.3/Sharpe)² → ที่ Sharpe 2.0/TO 0.5 = **returns ≥ 0.21**. มีแต่ reversal-amplify ที่ให้ returns ~0.18 (บน d1) แต่ reversal ตายบน d0. **ไม่มี signal ไหนให้ Sharpe 2.0 + returns 0.2 พร้อมกันบน d0** [2026-06-10]

### 🔒🔒🔒🔒🔒 ข้อสรุปขั้นสุดท้ายของทั้ง tier (18 รอบ ~75 sims — ปิดทุก axis ที่ทำได้)
- **USA delay 1: 2-gate (fit 1.0 + corr 0.7) — reversal corr-saturated (GP-reversal corr 0.90), non-reversal flat. ครบทุก dataset.**
- **USA delay 0: dual-bar (Sharpe 2.0 + returns 0.2) — reversal ตาย, lead-lag returns จิ๋ว. เป็นไปไม่ได้กับ signal ที่มี.**
- **ทั้ง 2 delay บน tier USA = ปิดเคสครบแล้ว** ทางออกเหลือทางเดียวจริง: **tier upgrade (ขอ region/universe ใหม่จาก BRAIN)**. การ sim เพิ่มบน USA delay0/delay1 = เปลือง quota 100% — ทั้งคู่พิสูจน์ว่าตันเชิงโครงสร้างแล้ว [[returns-bottleneck-usa-delay1]] [2026-06-10]

## รอบ 19 — 2026-06-10 (ขุด options/IV บน TOP500/TOP200 จริงจัง — "หาตัวใหม่" ตามผู้ใช้สั่ง)
### ❌ options/IV ทุกกลไก (นอก ATM call-put skew ที่ pool จองแล้ว) = อ่อน + coverage ไม่พอ
- **PCR (put-call ratio) ทุกแบบอ่อน:** pcr_oi (positioning) Sharpe 0.43, pcr_vol (flow) **rank uniform = Sharpe 0.57-0.66** (CONCENTRATED ผ่าน). ⚠️ **group_zscore(pcr_vol) ให้ Sharpe -1.27 แต่เป็น CONCENTRATION ARTIFACT** (ไม่กี่ชื่อครองน้ำหนัก) — ใช้ rank แล้ว signal จริงแค่ 0.6. call_breakeven premium flat 0.33 [2026-06-10]
- **IV mechanisms (นอก skew) อ่อนหมด:** VRP (IV_mean_30 − parkinson_vol_60) Sharpe 0.84(flip), IV term-structure slope (30−180) 0.21 flat, OTM smile-skew (mean_skew_30, 90-110% strike) 0.43 — **ทั้งหมด CONCENTRATED_WEIGHT fail** (limit TOP500 = 0.1 เข้มกว่า, IV-minus-IV diff สร้าง coverage gap) [2026-06-10]
- 🔑 **pool IV-skew (3q6aREkQ Sharpe 2.22) เป็นกรณีพิเศษ** = ATM `implied_volatility_call_30 - put_30` + `group_zscore + ts_mean(.,5)` + sector. ATM call-put coverage ดีกว่า skew/VRP/term fields. **กลไก IV อื่นไม่ replicate ความแรงนี้** [2026-06-10]
- ⚙️ **rank (uniform weight) แก้ CONCENTRATED_WEIGHT ได้** เมื่อ field มี coverage gap (ต่างจาก group_zscore/winsorize ที่ขยาย outlier) — แต่เผย Sharpe จริงที่อ่อน. field: option8 IV (`implied_volatility_{call,put,mean}_{10..1080}`, `implied_volatility_mean_skew_N`, `parkinson_volatility_{60,90}`), option9 (`pcr_oi_N`, `pcr_vol_N`, `call_breakeven_N`, `forward_price_N`) [2026-06-10]

### 🔒×6 ปิด options/IV axis — ครบทุก dataset×delay×universe ที่เข้าถึงได้ (19 รอบ ~84 sims)
- **ทุก signal source ที่ tier นี้เข้าถึง = ขุดครบ.** options/IV (TOP500/TOP200) เป็น axis ใหม่ล่าสุด → อ่อนหมดนอก skew-ที่จองแล้ว. **ยืนยันครั้งสุดท้าย: ไม่มี submittable returns source ใหม่บน tier USA (ทุก delay/universe/dataset).** ทางออกเดียว = tier upgrade [[returns-bottleneck-usa-delay1]] [2026-06-10]
- ⚠️ **หมายเหตุ (แก้โดยรอบ 20): ข้อสรุปนี้ผิด! ยังมี MAX-lottery anomaly ที่ผ่านได้** — ดูรอบ 20 ด้านล่าง. "ตัน" เพราะขุดแต่ reversal/fundamental ไม่ใช่เพราะ tier ตันจริง

## 🎉🎉🎉 รอบ 20 — 2026-06-10 BREAKTHROUGH: MAX lottery anomaly = alpha แรกที่ผ่าน 2-gate ครบ! (พลิกข้อสรุป "tier ตัน")
### ✅✅✅ ค้นพบใหญ่สุดของโปรเจกต์: MAX-lottery × GP ผ่านทั้ง fitness>1.0 + self-corr<0.70
- **`-(kth_element(returns,42,k=1)+kth_element(returns,42,k=2)+kth_element(returns,42,k=3)) * winsorize(gross_profit_to_assets_ratio,std=3)`** {INDUSTRY, decay 5, trunc 0.04, TOP3000} = **QPQYqvAW: Sharpe 1.42, Fitness 1.05, TO 0.481, Returns 0.262, sub 0.95, ผ่านทุก check + self-corr 0.6952<0.70** ✅ — **alpha แรกใน 20 รอบที่ทะลุ fitness ceiling 0.96 + ผ่าน corr พร้อมกัน!** [2026-06-10]
- 🔑🔑🔑 **ทำไมพลิกเกมได้: MAX (Bali-Cakici-Whitelaw 2011) เป็น returns source ใหม่ที่ "ไม่ใช่ cumulative reversal"** — short หุ้นที่มี top-3 วันบวกสุดขั้วใน 42 วัน (lottery demand → overpriced). **returns 0.262 = สูงสุดของโปรเจกต์** (เทียบ reversal 0.18). corr กับพูล reversal แค่ **0.695** (vs GP-reversal 0.90) เพราะ **single-extreme-day ≠ ts_mean/ts_sum/ts_zscore ของ returns** → กลไกต่างจริง [2026-06-10]
- 🔑 **เทคนิค breakthrough ที่ทำให้ทะลุ 0.96 ได้ (จดไว้ใช้ซ้ำ):**
  1. **`kth_element(returns, d, k=N)` = ตัวที่ N ใหญ่สุดใน d วัน** (k เป็น 1-indexed, k=0 error). single-max (k=1) returns สูงแต่ TO 0.84 (fail HIGH_TURNOVER)
  2. **top-3 sum (k=1+k=2+k=3) = ตัวฆ่า turnover** — max นิ่งขึ้นมาก TO 0.84→0.44 โดยคง returns 0.26 → **นี่คือสิ่งที่ทำให้ fit ข้าม 1.0** (top-2 ได้แค่ 0.85-0.98, top-3 = 1.03-1.05)
  3. **× winsorize(GP) ดัน returns 0.19→0.26** (quality-conditioned แบบ GP-reversal)
  4. **trunc 0.04 + decay 5-6 = sweet spot** (trunc 0.04 ลด concentration ดัน Sharpe; decay 3 → TO ระเบิด, decay 7 → Sharpe ตก)
- ⚙️ **kth_element window 42/63/126 + GP/GP² ให้ผลเหมือนกันเป๊ะ** (top-3 max มัก dominate วันเดียวกันข้าม window). **neutralization เปลี่ยนผลจริง:** SUBINDUSTRY (vRmOzNPz) Sharpe 1.46/fit 1.03/drawdown 0.168 (robust กว่า INDUSTRY 0.211) [2026-06-10]
- ⚠️ margin corr บาง (0.6952, ห่าง limit แค่ 0.005) — ต้อง re-verify ที่ /review-candidates + เช็ค prod-corr มือ (403). variant สำรอง: vRmOzNPz (SUBIND robust กว่า), JjdPY5om (decay6 fit 1.03)

### 🎯 บทเรียนเชิงระบบ (แก้ความเชื่อเดิม "tier ตัน")
- **"tier USA ตัน" = ผิด! ตันเพราะขุดแต่ reversal-family (corr-saturated) + fundamental-flat.** MAX เป็นกลไก behavioral ตัวที่ 3 ที่ "แรงพอ contribute" — **ยังมี returns source ใหม่ถ้าหากลไกที่ orthogonal จริง** [2026-06-10]
- **กฎใหม่: หา signal ที่ (1) returns≥0.15 (2) กลไกไม่ใช่ cumulative-reversal.** **kth_element เปิดประตู family ใหม่ (order-statistics ของ returns)** — ลอง kth_element ของ |returns| (ความผันผวนสุดขั้ว), MIN (k จากท้าย = วันลบสุดขั้ว), range, volume ต่อได้ [2026-06-10]

### ✅✅✅ SUBMIT สำเร็จจริงครั้งแรกของโปรเจกต์! (QPQYqvAW) + วิธี submit ที่ถูกต้อง
- **QPQYqvAW submit สำเร็จยืนยันด้วย get_alpha: status ACTIVE, stage OS, dateSubmitted 2026-06-10T08:51:56, selfCorrelation 0.6952, prodCorrelation 0** — **alpha ตัวแรกที่ submit จริงได้** (แก้ความเชื่อ "ระบบไม่เคย submit สำเร็จ") [2026-06-10]
- ⚙️🔑 **วิธี submit ที่ถูกต้อง (สำคัญมาก — แก้ที่เคยเข้าใจผิด 201=submitted):**
  1. `submit_alpha` ครั้งแรก → status **201 = ack เฉยๆ** ตอนนั้น get_alpha ยัง `status:UNSUBMITTED, dateSubmitted:null, SELF_CORRELATION:PENDING` (BRAIN ยัง finalize self-corr ไม่เสร็จ)
  2. **รอ + เรียก `submit_alpha` ซ้ำ** → status **200 = submit จริงสำเร็จ** (หลัง self-corr finalize ฝั่ง BRAIN)
  3. **ต้องยืนยันด้วย `get_alpha` เสมอ:** ดู `status:ACTIVE` + `stage:OS` + `dateSubmitted` ไม่ null. อย่าเชื่อ 200/201 อย่างเดียว
- ⚙️ **prodCorrelation มาใน get_alpha ตอน submit (=0)** แม้ get_prod_correlation endpoint คืน 403 — ค่าจริงอยู่ใน get_alpha.is.prodCorrelation/selfCorrelation หลัง submit
- ⚙️ **selfCorrelation endpoint flaky** (คืน 0.6952 มี records ครั้งหนึ่ง แล้ว empty ครั้งต่อไป) — ค่าทางการสุดท้ายอยู่ใน `get_alpha.is.selfCorrelation` [2026-06-10]

### 🔧 รอบ 21: return-extreme × GP family = ONE alpha (กัน sim เปลือง — สำคัญ)
- **ทุก variant ของ return-order-statistic × GP บรรจบเป็น signal เดียวกัน (QPQYqvAW):** top-3 MAX, top-3 MIN (kth_element(-returns)), top-2/3/5 asymmetry (max−min), GP/GP² — **ให้ metrics เหมือนกันเป๊ะ (Sharpe 1.42 fit 1.05 returns 0.262)** เพราะองค์ประกอบหลัก = "high-GP stocks ที่มี move สุดขั้วช่วงหลัง" dominate ทิศ/ค่า k ไม่สำคัญ. **corr ระหว่างกัน ~1.0** [2026-06-10]
- **เฉพาะ k=1-only หรือ vol-normalized ที่ต่างจริง แต่อ่อนกว่า** (k=1 asym fit 0.86, vol-norm fit 0.48). volume-spike/extreme-range/abs-vol order-statistic = flat (0.4-0.7)
- 🔑 **บทเรียน: MAX family ให้ submittable ได้แค่ 1 ตัว (QPQYqvAW submit แล้ว) — อย่า sim variant เพิ่ม.** close-range/midpoint × GP cap fit 0.92 (returns 0.15 ต่ำ) + UNITS + reversal-corr-risk. **second submittable ต้องเป็น mechanism class ใหม่จริงๆ ที่ returns≥0.15 + ไม่ใช่ return-extreme/reversal** — ซึ่งบน USA tier นี้ยังไม่เจอ (เหมือน 2-gate เดิม แต่ตอนนี้ pool มี MAX เพิ่ม) [2026-06-10]

### 🔒🔒🔒 รอบ 22: ยืนยัน "returns≥0.15 ต้องเป็น MAGNITUDE-of-extreme เท่านั้น" (ปิดการหาตัวที่ 2)
- **ขุด mechanism non-magnitude ครบ → flat/อ่อนหมด:** win-rate/sign-consistency `ts_mean(sign(returns),20)` 0.57, jump-frequency `ts_sum(returns>kσ,42)` 0.54-0.60, **recency `ts_arg_max(returns,42)` = -0.03 FLAT**, downside-semivol `ts_std_dev(min(returns,0),20)` 0.23, volume-spike order-stat 0.73, extreme-range 0.53, abs-vol 0.44 [2026-06-10]
- 🔑🔑🔑 **กฎโครงสร้างสุดท้าย (USA TOP3000 delay1): returns≥0.15 มาจาก MAGNITUDE ของ recent extreme moves เท่านั้น** (cumulative=reversal, single-day=MAX, intraday=close-range). **timing/count/sign/frequency/semivol = flat ทั้งหมด.** และ magnitude-signals ทุกตัว corr กันสูง → pool (reversal×4 + MAX) saturate niche นี้แล้ว [2026-06-10]
- **สรุป: tier USA ให้ submittable orthogonal ~1-2 ตัวต่อ niche; reversal-niche + MAX-niche เต็มแล้ว.** ตัวที่ 3+ ต้อง **tier/region upgrade** (pool ใหม่ + arbitrage น้อย) ไม่ใช่หา signal เพิ่มบน axis เดิม [[returns-bottleneck-usa-delay1]] [2026-06-10]
- ⚠️ **อัปเดตโดยรอบ 23: ข้อสรุปนี้ผิดอีกครั้ง! ยังมี niche ที่ 3 = signed-jump-variation** — ดูรอบ 23. "magnitude-of-extreme corr กันสูง" ก็เป็นความเชื่อผิด: asymmetry ของ semivariance (RS⁺−RS⁻) corr แค่ 0.42 กับ MAX

## 🎉🎉🎉 รอบ 23 — 2026-06-11 BREAKTHROUGH #2: Signed Jump Variation = alpha ตัวที่ 2 ที่ submit สำเร็จ (deep research งานวิจัยใหม่)
### ✅✅✅ ค้นพบใหญ่: Good-minus-Bad Volatility (Bollerslev-Li-Zhao 2020 JFQA) ผ่าน 2-gate + SUBMITTED
- **`-(ts_sum(power(max(returns,0),2),21) - ts_sum(power(min(returns,0),2),21))`** {SUBINDUSTRY, decay 4, trunc 0.04, TOP3000, **ไม่มี GP weight**} = **XgK9528a: Sharpe 1.56, Fitness 2.29, Returns 0.352 (สูงสุดประวัติศาสตร์), Turnover 0.163, sub 1.23, drawdown 0.280, grade EXCELLENT** → **self-corr 0.4188 (!) ผ่านทุก check → SUBMITTED จริง (ACTIVE/OS, dateSubmitted 2026-06-10T15:31)** [2026-06-11]
- 🔑🔑🔑 **กลไก: แยก realized variance เป็น RS⁺ (Σ positive-day returns²) กับ RS⁻ (Σ negative-day returns²) → short หุ้นที่ upside-variation ครอบงำ.** ต่างจาก MAX (top-3 single day) เพราะใช้**ทั้ง distribution ของ squared returns + ลบ downside variation** → **self-corr กับ MAX แค่ 0.42** (vs GP-reversal 0.90). asymmetry ของ semivariance ≠ single extreme day = orthogonal จริง
- 🔑 **เทคนิค breakthrough (จดไว้ใช้ซ้ำ):**
  1. **RSJ แบบ ratio (normalize ด้วย RV) = flat (Sharpe -0.84)** — การ normalize ฆ่า magnitude → ต้องใช้ signed jump เป็น **magnitude ดิบ** (RS⁺−RS⁻ ไม่หาร)
  2. **window 42→21 = ตัวดัน Sharpe** (1.24→1.49) — semivariance asymmetry สดกว่าใน window สั้น
  3. **SUBINDUSTRY > INDUSTRY** (Sharpe 1.49→1.56, dd 0.333→0.280)
  4. **ตัด GP ออก signal ยังผ่าน + แข็งขึ้น** (1.50→1.56) — กลไก signed-jump เป็น driver จริง GP ไม่จำเป็น → **no-GP = orthogonal กว่า MAX×GP** (ตัด weight ที่ใช้ร่วม) → นี่คือเหตุผลที่ self-corr ต่ำ 0.42
  5. **turnover ต่ำมาก 0.16** (signal นิ่ง 21-day sum) → fitness พุ่ง 2.29 (ห่างเพดานเยอะ มี room)
- ⚠️ UNITS warning (power ของ CSPrice) ติดเหมือน close-range แต่ไม่กระทบ — grade EXCELLENT

### 🎯 บทเรียนเชิงระบบ (แก้ความเชื่อ "magnitude corr กันสูง" + "tier ตัน")
- 🔑 **"returns≥0.15 = magnitude-of-extreme เท่านั้น และ magnitude ทุกตัว corr กันสูง" = ผิด.** signed-jump (RS⁺−RS⁻) ก็เป็น magnitude (squared returns) แต่ **asymmetry/distribution structure ทำให้ corr กับ MAX แค่ 0.42**. กุญแจไม่ใช่ "หนีจาก magnitude" แต่ **"หา transform ใหม่ของ magnitude ที่จับ moment ต่างกัน"** (single-day → MAX; full-distribution-asymmetry → signed-jump)
- 🔑 **deep research literature ที่ "ยังไม่เคยลอง" = แหล่ง niche ใหม่จริง.** รอบนี้ได้ตัวที่ 2 จากการ research 5 anomalies ใหม่ (RSJ/good-bad-vol = ผ่าน; prospect-theory/frog-in-pan/CGO/residual-momentum = flat แต่ CGO returns 0.144 น่าตามต่อ). **อย่าด่วนสรุป "ตัน" — ยังมี behavioral/distributional anomaly อีกที่ยังไม่ขุด**
- 🔑 **niche ที่ submit แล้ว 3 อัน: reversal-family (pool), MAX-lottery (QPQYqvAW), signed-jump (XgK9528a).** ตัวต่อไปลอง: **CGO/disposition (returns 0.144 แต่ติด CONCENTRATED — แก้ reference price), residual momentum (ts_regression ยังไม่ทดลองจริง), vol-of-vol, coskewness/downside-beta**
- ⚙️ **submit_alpha เจอ error 400 "HTTP sent to HTTPS port" ครั้งแรก = transient** — retry ครั้งที่ 2 สำเร็จทันที (submitted:true attempts:1). อย่าตกใจ retry ได้

## ⚙️ SYSTEM UPGRADE รอบ 24 — 2026-06-11 (ปรับโครงระบบหลังบทเรียน 23 รอบ)
สาเหตุ: (1) lessons-learned.md โต 354 บรรทัด ~80KB เกิน Read cap — agent อ่านแล้วโดน truncate ทิ้งบทเรียนรอบ 20-23 ที่อยู่ท้ายไฟล์พอดี (2) สรุป "ตัน" ผิด 3 ครั้งเพราะไม่มี map ของแกน transform (3) บั๊ก src 3 จุดที่เกิดเหตุจริง
สิ่งที่ทำ:
- **แยก lessons:** ไฟล์นี้ (lessons-archive.md) = ประวัติเต็ม verbatim; lessons-learned.md = distilled playbook ≤200 บรรทัด เรียงสำคัญก่อน (top-loaded). protocol ใหม่: entry เต็มลง archive + one-liner ในหมวดที่ถูกต้องของไฟล์หลัก
- **สร้าง knowledge/mechanism-map.md** — แคตตาล็อกแกน transform (🟢จองแล้ว/🟡flat/🟠lead/🔴ยังไม่ลอง) + heuristic generate mechanism ใหม่. wire เข้า find-alphas step 0 + alpha-researcher
- **Doc refresh:** framework Stage 0/2 (dataset×mechanism, pool 11 ACTIVE), submission-criteria (กลยุทธ์ mechanism-first แทน "ขุดตระกูลที่ชนะต่อ" ที่ล้าสมัย), dataset-map (ลบ "ทางออกเหลือแค่ tier upgrade"), tuner (feasibility gate + กฎหยุด ±0.02×3), review-candidates (step 0 OS monitoring + submit-attempt-as-corr-probe), alpha-batch.js (returns ใน schema + bucket infeasible)
- **src fixes (ต้อง restart MCP ก่อนมีผล):** (a) simulate timeout คืน {pending, location} แทน throw + เพิ่ม tool check_simulation(location) ตามผล sim ที่ timeout — กันเสีย quota (b) submitAlpha retry transient 400 "plain HTTP→HTTPS port" (match body เท่านั้น กัน retry validation 400 จริง) (c) _correlation body ว่าง → max:null + unreliable:true ห้ามตีความว่าผ่าน (root cause false-pass GroeQEpO)
- **queue hygiene:** status enum queued|needs-corr-check เท่านั้น, key มาตรฐาน expression, ตัว redundant → tried-registry

---

## รอบ 27 (2026-06-11) — conditioner-on-intraday-vol ปิดเคส + tier ยังล็อก @4 ACTIVE

**บริบท:** หลังรอบ 25-26 สรุปว่า USA d1 มี ~3-4 orthogonal niche จองครบ. รอบนี้ทดสอบว่า "เปลี่ยน conditioner บน intraday-upside-semivar base (le0AvXl7)" จะเปิด niche #5 ได้ไหม + TIER-RECHECK

**TIER-RECHECK:** get_datasets EUR/GLB/CHN = empty; sim probe `-ts_zscore(close,5)` บน EUR TOP1000 → 400 "Region EUR is not available", GLB เช่นกัน. **แม้มี 4 ACTIVE submitted, tier region ยังไม่เปิด.** datasets USA d1 = 20 ตัวเดิม ไม่มีใหม่

**alpha-researcher คืน 4 ไอเดีย** (earnings-conditioned / idiosyncratic-market-adjusted / sector-relative / volume-spike-conditioned) — ทั้งหมดเป็น variant ของ intraday-upside-semivar + conditioner ต่างกัน

**ผล sim (settings family le0AvXl7: INDUSTRY decay5 TOP3000 trunc0.04):**
- `kqKaj8Z6` sector-relative `-ts_sum(power(max(group_neutralize(close/open-1,sector),0),2),21)`: IS ผ่านครบ (Sharpe 1.43, fit 2.47, returns 0.373) แต่ **self-corr 0.9238 vs le0AvXl7** = redundant
- `d5QaOqzv` own-mean-demean `-ts_sum(power(max((close/open-1)-ts_mean(close/open-1,63),0),2),21)`: IS แรง (Sharpe 1.61, fit 3.12, returns 0.470, sub 1.28) แต่ **self-corr 0.9891** = แทบเหมือน le0AvXl7 เป๊ะ (mean intraday≈0 → demean = cosmetic)
- `gJ3aQXbe` earnings-conditioned `-ts_sum(power(max(close/open-1,0),2)*if_else(days_from_last_change(actual_eps_value_quarterly)<=5,1,0),63)`: **Sharpe 0.70/fit 0.69 FAIL** — base ต่างจริง (post-EPS 5d subset) แต่ event-restriction เจือจาง magnitude ต่ำกว่าเกณฑ์. CONCENTRATED ผ่าน, sub-univ 0.36
- idea #4 volume-spike: ไม่ sim — inferred corr>0.85 (base+volume-dummy, high-vol≈high-magnitude days)

**บทเรียน:**
1. ยืนยัน iron law "corr = BASE ไม่ใช่ conditioner" ในระดับเข้มข้น: sector-demean/own-mean-demean/volume-dummy ทุกแบบบน intraday-semivar base = corr 0.92-0.99. การ neutralize/demean return ก่อน square ≠ เปลี่ยน cross-section พอ
2. event-conditioning (earnings window) = วิธีเดียวที่ได้ base cross-section ต่างจริง (corr น่าจะต่ำ) แต่ **trade-off: restriction → signal อ่อน** (Sharpe 0.70). ต้องการ base ที่ต่าง cross-section + magnitude แรงพร้อมกัน
3. field ใหม่ที่ใช้ได้: `days_from_last_change(actual_eps_value_quarterly)` (analyst4 MATRIX) จับ earnings event window ได้; earnings4 dataset = implied-move/IV ไม่มี SUE field; analyst4 มี actual+estimate EPS สร้าง surprise ได้
4. ผ่านคิว 0 ตัว — ไม่ดันต่อ intraday-vol family (ปิดเคสถาวร). niche #5 ขึ้นกับ tier เปิด/OS-fail

---

## รอบ 28 (2026-06-11) — ปิดเคส order-statistic downside/abs + backlog USA d1 หมดเกลี้ยง

**บริบท:** หลังรอบ 27 ปิด intraday-semivar conditioner. รอบนี้ทดสอบ backlog family อื่นที่ยัง "new" + ไม่เคย sim จริง

**พบ bookkeeping ค้าง:** #39 MIN-extreme-loss-day (`E5K6EYrP` `-(kth_element(returns,42,k=40..42))*GP`) เคย sim แล้ว FLAT 0.02 แต่ backlog ยัง mark new

**sim รอบนี้ (#40 extreme-vol two-sided, INDUSTRY decay5 TOP3000 trunc0.04):**
- `N1OPV138` `-(kth_element(abs(returns),42,k=1..3))`: Sharpe 0.44, fit 0.26, returns 0.107 → FLAT
- `gJ3W1KLe` abs-MAX ×GP: ผลเท่ากันเป๊ะ (0.44/0.26) — GP weight ไม่ช่วยเมื่อ base อ่อน
- ⚙️ kth_element(abs(returns)) ไม่ hang (hang เฉพาะ derived ratio เช่น close/open-1)

**ปิดเคสด้วยหลักฐานเดิม (ไม่ sim):** #41 extreme-range (Parkinson cluster corr0.94 ปิดรอบ25 + derived-hang risk), #42 frog-in-pan (flat -0.46 รอบ23), #43 CGO (ปิดทุก RP variant รอบ23/25), #44 residual-momentum (momentum flat ทุกแบบ + ขัดกฎ magnitude)

**บทเรียน:**
1. **order-statistic/lottery anomaly = upside-specific เท่านั้น:** MAX upside booked (QPQYqvAW), MIN downside 0.02, abs two-sided 0.44. การรวม downside tail เจือจาง upside signal
2. **backlog "new" บน USA d1 หมดเกลี้ยง** — ทุก lead ปิดหมด (sim หรือ inferred)
3. **3 รอบติด (26-28) = 0 queued** → USA d1 exhausted จริงเชิงประจักษ์. รอบหน้าไม่ควรเสีย sim กับ pv1-magnitude variant; เหลือแค่ tier-recheck / OS-monitor / deep-research axis ใหม่จริง

---

## รอบ 29 (2026-06-11) — BREAKTHROUGH ที่ 4: footnote capital-allocation composite (`O096kVaY` queued) — "exhausted" ผิดครั้งที่ 4

**บริบทเปิดรอบ:** ตาม DECISION RULE รอบ 28 — backlog new หมด, default = TIER-RECHECK + OS-monitor + axis ใหม่จริงเท่านั้น

**สิ่งที่เช็คก่อน sim:**
- TIER-RECHECK: EUR/GLB get_datasets = ว่างเปล่า (tier ยังปิดแม้ 4 ACTIVE) · USA d1 datasets = 20 ตัวเดิม ไม่มีใหม่
- OS-monitor: ทั้ง 4 ตัว (QPQYqvAW, XgK9528a, le0AvXl7, RRrE1VNj) os.checks = PENDING หมด — ไม่มี niche ว่าง
- เหลือทางเดียว: dataset 🔴 ที่ไม่เคยขุด = fundamental2 (Report Footnotes), fundamental7

**จุดพลิก — 2 insight ที่ทำให้แกนนี้เปิด:**
1. **Pool มีหลักฐานอยู่แล้วว่า footnote-class ผ่านได้:** xAzwE0wp (`-ts_rank(fn_liab_fair_val_l1_a,126)` Sharpe 1.38 ACTIVE) ใช้ field ตระกูล fair-value จาก footnote data + pool fundamentals อื่น (gJPqnv6J leverage 1.57, lez6Eql8 earnings-yield 1.78) ล้วน turnover ต่ำมาก
2. **สูตร fitness มี turnover floor 0.125:** fitness = sharpe×√(returns/max(TO,0.125)) — ยืนยัน empirical จาก composite (1.07×√(0.075/0.125)=0.829 ตรงกับ 0.83 ที่ API คืน) ⇒ signal TO 0.01 ต้องการ returns แค่ 0.125/sharpe² ≈ 0.05-0.06 ไม่ใช่ 0.15 ⇒ กฎ "returns≥0.15 = magnitude เท่านั้น" scope เฉพาะ TO≥0.125

**เส้นทาง 20 sims (ทั้งหมดบน fundamental2, INDUSTRY/SUBINDUSTRY decay10 trunc0.04):**
- ขาเดี่ยว: buyback-level (`rank(authorized_stock_buyback_amount/cap)`) 0.72 sub-univ 0.94 · pension funding (Franzoni-Marin) −0.78 → flip = +0.78 (short overfunded — ทิศกลับจากงานวิจัยใน 2019-2023 ยุคดอกเบี้ย) · FV-L2 assets −1.03 → flip = +1.03 · SBC 0.25 · M&A −0.13 · deferred-tax 0.37 · doubtful 0.05 · buyback ts_delta 0.01 · buyback ts_rank 0.65
- composite rank 2 ขา (buyback−pension): **1.07/0.83** — composite-when-weak ทำงานจริงบนแกน fundamental
- **group_rank(x, industry) แทน rank(): 1.42/0.84** (Sharpe PASS!) · sector ดีกว่านิด 1.46/0.87 · fitness ติดเพดาน 0.84-0.87 เพราะ returns 0.044
- ที่ไม่ work: group_zscore (1.05), power-3 (1.13), blend rank+group (1.07), TOP1000 (1.41), decay20 (1.41), trunc0.08 (เหมือนเดิมเป๊ะ — weight ไม่ชน cap), GP-weight (⚙️ ANOMALY: metrics เหมือนตัวไม่คูณเป๊ะทุกหลัก — ต้อง investigate)
- **ตัวผ่าน: เพิ่มขา 3 (FV-L2) ใน group form** → `O096kVaY` **Sharpe 1.60 / fit 1.08 / TO 0.0114 / returns 0.057 / sub-univ 1.35 / self-corr 0.4282** (max vs d57x6Gev value composite) — ผ่านทุก check + corr gate → queued

**บทเรียนแกน:**
1. 4-dim subspace (รอบ 28) ครอบเฉพาะ price/returns-stream — fundamental cross-section หนีได้ (self-corr 0.43)
2. recipe fundamental: ขาเดี่ยว ≥0.7 (ลอง flip sign เสมอ — 2/3 ขา sign กลับจากงานวิจัย) → composite 2-3 ขา → group_rank(sector)
3. ขาอ่อน (<0.5) ทำ composite แย่ลง — อย่าใส่เพิ่มมั่ว (SBC ทำ 1.07→0.94, L2 ใน rank form ทำ 1.07→1.01 แต่ใน group form ทำ 1.46→1.60: form matters!)
4. "ตัน" ครั้งที่ 4 ที่ผิด — คราวนี้เพราะ enumerate แค่ 2 แกน (data×mechanism) ลืมแกนที่ 3: **เกณฑ์/route เข้า fitness** (low-TO)

**ค้างไว้:** fundamental7 ยังไม่ probe เลย · fundamental2 เหลืออีกหลายร้อย field (ดูแค่ ~80) · GP-weight-on-group_rank anomaly ⚙️

---

## รอบ 30 (2026-06-11) — fundamental7 ปิดเคส + ยืนยัน "footnote cream เก็บหมดแล้ว" (queued 0 — หยุดตามวินัย)

**แผน:** ใช้ recipe รอบ 29 (ขาเดี่ยว ≥0.7 → composite → group_rank sector) กับ fundamental7 (🔴 ไม่เคย probe) + field ตกค้าง fundamental2

**ผล 7 sims — ไม่มีขาถึงเกณฑ์ 0.7 เลย:**
- fundamental7: R&D intensity (Chan 2001) 0.22 · inventory growth (Thomas-Zhang) rank=+0.67 แต่ group_rank(sector)=−0.63 (เครื่องหมายกลับ = เปราะ) · tax-to-book (Lev-Nissim) 0.13. โครงสร้าง dataset: ส่วนใหญ่ [VECTOR] (ใช้ใน expression ตรงไม่ได้) MATRIX มีน้อย (fnd7_ointfund_*)
- fundamental2 residual: useful-life aggressiveness 0.11 (+LOW_TURNOVER fail 0.006 — static เกิน) · restructuring expense −0.28 / reserve-change −0.05 (Burgstahler transitory ไม่ work บน daily)

**บทเรียน:**
1. **sign-stability test ฟรี:** ขาที่เครื่องหมายกลับระหว่าง rank ↔ group_rank = signal เปราะ (กระจุกใน sector bias) — คัดทิ้งก่อนเข้า composite
2. anomaly literature แรง (R&D, inventory, restructuring) ≠ work บน BRAIN TOP3000 daily — ขา footnote ที่ work จริงรอบ 29 (buyback/pension/FV-L2) คือของหายาก ไม่ใช่ norm
3. การหยุดที่ 7 sims เมื่อไม่มีขา ≥0.7 = วินัยที่ถูก (ไม่เผา sim fishing) — round นี้ negative result มีค่า: ปิด fundamental7 ถาวร

**สถานะหลังรอบ:** USA d1 กลับสู่ default TIER-RECHECK + OS-monitor (5 ตัวใน OS PENDING หมด) — trigger ขุดใหม่: OS-fail / tier เปิด / field class ใหม่

---

## รอบ 31 (2026-06-11) — เช็คครบทุก trigger ที่เหลือ = ปิดหมด (queued 0, ใช้แค่ 2 sims)

**3 ช่องที่ยังไม่เคยเช็ค → เช็คแล้วทั้งหมด:**
1. **TIER-RECHECK หลัง submit ตัวที่ 5 (O096kVaY):** EUR + CHN ยังว่างเปล่า — จำนวน submit ไม่ trigger tier เปิด (เช็ค 2 ครั้งในวันเดียว)
2. **Low-TO resurrection scan:** สแกน registry (Sharpe≥1.15, TO<0.125, fitness 0.5-1.0) หาตัวเก่าที่กู้ได้ด้วย low-TO route + group_rank lift → เจอแต่ variant ตระกูล O096kVaY (จองแล้ว) = ไม่มีของเก่าให้กู้ (signal เก่าส่วนใหญ่ TO สูงหรือ Sharpe flat)
3. **vec-operator unlock:** `vec_avg`/`vec_sum` มีจริงใน operator list → VECTOR fields ใช้ได้เชิงกลไก (แก้ข้อสรุปรอบ 30) — ทดสอบกับ anomaly ใหญ่สุดที่ยังไม่แตะ: **net external financing (Bradshaw-Richardson-Sloan 2006)** `-(equity_issued + debt_issued − debt_repaid)/assets` = 0.20 + CONCENTRATED FAIL, pure equity issuance = −0.11 + CONCENTRATED FAIL. ทั้งคู่ flat บน TOP3000 daily

**สถานะสุดท้ายของ search space (ครบถ้วน ณ รอบ 31):** price/returns 4-dim จองเต็ม (5 submitted) · footnote cream เก็บแล้ว (O096kVaY) · fundamental2 residual + fundamental7 (MATRIX+VECTOR) = flat · tier ปิดทุก region · **เหลือรอจริงๆ: OS results + tier เปิด** — /find-alphas รอบถัดไปควรมี trigger ใหม่เท่านั้น (OS-fail/tier/dataset ใหม่) มิฉะนั้นใช้ /os-monitor

---

## รอบ 32 (2026-06-11) — options space เปิดใหม่ด้วย group_rank แต่ติดเพดานขา (queued 0, near-miss 1.18/0.86)

**ไอเดียรอบ:** recipe รอบ 29 (composite-of-weak-legs + group_rank) ยังไม่เคยใช้กับ options ที่ถูกทิ้งรอบ 19 — ขาเฉียดเกณฑ์มีอยู่: PCR-vol 0.66 (CONC PASS), VRP flip 0.84 (CONC FAIL)

**ผล 6 sims:**
- composite PCR-vol + VRP: rank form 1.03 + CONCENTRATED FAIL → **group_rank form 1.18/0.86 + CONCENTRATED PASS** = ค้นพบว่า `group_rank` แก้ coverage-concentration ของ options ได้ (สิ่งที่ฆ่า signal ทั้งรอบ 19)
- tune: decay20 → TO 0.113 (<floor) แต่ Sharpe 1.07; ts_mean smooth → 0.96. **fitness ceiling 0.86 (นิ่ง 3 variants) → หยุดตามกฎ**
- หาขาที่ 3 จาก option6 (ไม่เคยแตะ): expected-earnings-move `opt6_absavgernmv` = ±0.32 + CONC FAIL · clean VRP `opt6_30div − opt6_20dorhv` = 0.40
- 🔬 **diagnostic มีค่า: clean-VRP (vendor-consistent, ตัด parkinson) เหลือ 0.40 ⇒ ความแรงของ VRP option8 (0.84) มาจากฝั่ง parkinson realized-vol ไม่ใช่ฝั่ง IV** ⇒ composite นี้ต่อให้ทะลุ IS ก็เสี่ยง corr กับ intraday-vol niche (Parkinson อยู่ใน le0AvXl7 cluster corr 0.94)

**สรุป:** options-positioning composite = near-miss ที่มีทางกลับ (จดเงื่อนไขใน near-miss.md: ขาใหม่ ≥0.7 / OS-fail ปลด intraday-vol / tier เปิด) — ไม่ใช่ dead-end แบบ fundamental7 แต่ขาไม่พอ ณ ตอนนี้

---

## รอบ 33 (2026-06-11) — ปิดเงื่อนไข "ขา options ใหม่" (queued 0, 3 sims)

ทดสอบ 3 anomaly สุดท้ายของ option6 ที่เพิ่งพบ field: O/S ratio Johnson-So (−0.40), put-call volume imbalance Pan-Poteshman (−0.01), vol-forecast-spread (−0.07) — flat หมด. **options space ครบทุก field family แล้ว (รอบ 19+32+33 รวม ~15 signals)**: ขา ≥0.7 มีแค่ VRP เดียว (corr-risk). composite 1.18/0.86 ค้าง near-miss — เงื่อนไขกลับมา: OS-fail ปลด intraday-vol / tier เปิดเท่านั้น. **Search space ที่เข้าถึงได้ ณ วันนี้ = สแกนครบทุกแกน — รอบถัดไปต้องมี trigger ภายนอก (OS results / tier) เท่านั้น**

---

## รอบ 33 (2026-06-12) — analyst4 unlock: analyst-expectations composite `P01xQodW` PASS (breakthrough ที่ 5)

**บริบทเปิดรอบ:** backlog ไม่มีไอเดีย new, default = TIER-RECHECK + OS-monitor. ผล: OS ทั้ง 5 ตัว PENDING หมด, EUR ยัง 400 not available (ยืนยันด้วย sim จริง), get_datasets USA = 20 ตัวเดิม. เงื่อนไขขุดต่อข้อเดียวที่เหลือ = "field class ใหม่ + literature แรง" → พบว่า **dataset-map ตีตรา analyst4 ว่า "🟡 รอบ 5 อ่อน" จาก mdl177 rev6 ซึ่งเป็น proxy field ของ model77 — ตัว dataset analyst4 จริงไม่เคยถูก probe เลย**

**เส้นทาง (21 sims):**
1. Probe ขาเดี่ยว 7 ตัว: SUE (actual−median)/std = **1.20** ✅ · guidance-gap/close = **0.84** ✅ · revision-breadth (pu−down)/numest ผ่าน vec_avg = **0.74** ✅ · coverage-change Δnumest 63d = **0.85** ✅ · dispersion DMS2002 = −0.23 ❌ (ทั้งสองทิศ) · revision-momentum Δmean/close = 0.49 ❌ · sales-surprise = 0.53 ❌ (อ่อนกว่า EPS มาก — ผิดคาด Jegadeesh-Livnat)
2. Composite ดิบ D+E / D+E+B / 2D+E+B = 1.16-1.27, fitness 0.74-0.79 — ติด fitness เพราะ Sharpe ไม่พอ (low-TO route ต้องการ ~1.55 ที่ returns 0.05)
3. **กุญแจ: recency-weighting `× max(1-days_from_last_change(actual_eps)/63,0)`** — SUE 1.20→1.33, guidance 0.84→1.01 (PEAD 60d window ตาม Bernard-Thomas 1989). ต่างจาก event-conditioning รอบ 27 (if_else restrict วันบน price-magnitude = เจือจาง) เพราะอันนี้ weight fundamental signal ตาม freshness ของตัวมันเอง
4. **2D′+E′+B+F = `P01xQodW` Sharpe 1.47 fit 1.00 TO 0.074 sub-univ 0.69/0.64 PASS ครบ** · self-corr **0.6153** (max vs le0AvXl7) ผ่าน 0.70 · prod-corr 403
5. Weight sweep ยืนยัน peak: 2B (0.99), 3D′ (0.97), ตัด B (0.95 + sub-univ fail), decay5 (sub-univ fail), INDUSTRY (1.02), TOP1000 (0.75 — signal อยู่ mid-cap) — แพ้หมด

**บทเรียน:**
- "ตัน" ผิดครั้งที่ 5 — คราวนี้สาเหตุคือ **verdict บน map มาจาก proxy field ไม่ใช่การ probe dataset จริง** → ก่อนเชื่อ 🟡 ให้เช็คว่า verdict มาจาก field จริงของ dataset นั้นกี่ตัว
- recency-weight ใช้ได้กับ fundamental event signal (ดัน Sharpe +0.13-0.17) — เพิ่มเข้า toolkit §2
- leg-weight sweep รอบ peak จำเป็น (2× ขาแรงสุดดีกว่า 1×/3×) แต่ setting sweep (decay/neut/universe) ยังไม่เคย break ceiling — สอดคล้องกฎเดิม
- ความเปราะ: fitness 1.00 ติดขอบพอดี + self-corr 0.615 ใกล้ 0.70 → ตอน /review-candidates ต้อง re-check corr (อาจขยับหลัง finalize)

---

## รอบ 34 (2026-06-12) — TIER ปิดครบยืนยัน + earnings4 probe เต็ม = ปิดเคส (0 queued)

**Stage 0:** pool refresh = 15 ACTIVE (P01xQodW เข้าแล้ว). TIER-RECHECK ครบชุด: EUR (รอบ 33) + **GLB + CHN (รอบนี้) = 400 not available ทั้งหมด** — tier ยังปิดสนิทแม้มี 6 ACTIVE. เพื่อนร่วมทีม submit 3 ตัว (reversal×volume / intraday×vol + op_income / profitability composite) — จดใน submitted-pool §👥 แล้ว ไม่โผล่ self-corr ของเรา

**earnings4 probe เต็ม (ตาม meta-lesson "proxy-verdict" รอบ 33):** dataset จริงคือ ORATS earnings-vol (ไม่ใช่แค่ announcement_effect ที่ลองรอบ 16) — 4 sims:
- implied-vs-historical earnings-move gap = 0.08 flat
- **earnings IV add-on (ern4_30div − ern4_30dexerniv ผ่าน vec_avg) = 0.77 บน TOP3000** แต่ sub-universe 0.23/0.33 fail + **TOP500 collapse เหลือ 0.35** → ใช้เป็น "ขาใหม่ ≥0.7" ของ options composite (ที่รอ revival) ไม่ได้เพราะ composite ต้องอยู่ TOP500
- ORATS forecast-vs-market straddle mispricing = 0.11 flat

**สรุป:** vol-surface → stock-return edge ไม่มีจริงนอกเหนือจากที่จองแล้ว (ตรง pattern option6 รอบ 32). earnings4 = ปิดเคส. รอบนี้ 0 queued — โหมดถูกต้องคือรอ OS finalize / tier เปิด / field class ใหม่

---

## รอบ 35 (2026-06-12) — ค้นพบ field class ใหม่: short interest (mdl77/177) → near-miss 1.24/0.94 (ขาด 0.01)

**ที่มา:** provenance shortlist (improve-system รอบ 4) + ค้น field space ทั้งระบบด้วย search "short interest / insider / institutional" → พบ short-interest class เต็มชุดใน mdl77/mdl177 ที่ไม่เคยอยู่ใน map/registry เลย (13 sims รอบนี้)

**ผล:** DTC (days-to-cover) แรงจริงแต่**ทิศกลับ literature** — short-high-DTC (BJZ) = −1.05 ⇒ long-high-DTC = +1.05 (sample 2019-23 มี squeeze era + illiquidity premium ผ่าน volume denominator). composite peak `2×DTC − Δmonthly-SIP` = **1.24/0.94 ขาด LOW_SHARPE 0.01** (sub-univ 1.11). ขาอื่นตาย: SIP level 0.2, 12m-chg 0.14, concentration ±0.63, utilization ±0.69, daily-short-flow ±0.68+CONCENTRATED. micro-mutation (เฉลี่ย DTC 2 นิยาม) ไม่ช่วย

**บทเรียน:**
1. **ค้น field space ด้วย search ข้าม dataset (`get_data_fields search=...` ไม่ระบุ dataset) = วิธีหา field class ใหม่ที่เร็วที่สุด** — เสริม provenance audit
2. anomaly ทิศกลับ literature ใน sample 2019-23 เป็นไปได้ (DTC, pension รอบ 29 ก็กลับ) — flip sign เป็น routine ไม่ใช่ข้อยกเว้น
3. class เดียวมีขาจริง ≤2 (DTC + Δshorting) — เหมือน options (PCR+VRP) = "2-leg ceiling" ของ positioning data ที่ field มาจาก factor vendor เดียว

---

## รอบ 36 (2026-06-12) — `RRr9Yv9z` short-positioning + labor composite PASS ครบ 2 gate (queued)

**เส้นทาง (7 sims):** ค้น field class ต่อ: ownership = ไม่มี 13F บน tier, dividend = ตระกูล analyst4 (corr-risk niche #6), mgmt-signaling = flat -0.05. **hiring rate (`employee/ts_delay(employee,252)-1`) = -0.93 ทิศ Belo-Lin-Bazdresch → flip +0.93** (กลับ literature ตัวที่ 3 ของ sample 2019-23 ต่อจาก DTC/pension)

**กุญแจ: ขาที่ 3 ข้าม dataset + corr-bridge diagnosis**
1. hiring เป็นขาที่ 3 ให้ short-interest composite ที่ค้าง 1.24 → `2DTC-monchg+hiring` = 1.40/1.12 IS ผ่านครบ **แต่ self-corr 0.7021 vs P01xQodW (เกิน 0.0021!)**
2. **Diagnose bridge ด้วย weight perturbation:** ลด hiring → corr ขึ้น (0.7036), เพิ่ม DTC → corr ขึ้นอีก (0.7183) ⇒ **DTC คือ bridge ไป analyst-expectations** (positioning ↔ attention) ไม่ใช่ hiring และไม่ใช่ turnover-niche ที่กลัวไว้ (1YmxEbYQ แค่ 0.43-0.49)
3. ลด DTC เหลือ **1:1:1 → corr 0.6256 PASS + Sharpe ขึ้น 1.40→1.56, fitness 1.23** (equal-weight diversification ชนะ concentrated weight เมื่อขาทั้งสามแรงใกล้กัน)

**บทเรียน:**
- **corr-bridge diagnosis ด้วย weight perturbation** = เทคนิคใหม่: ขยับ weight ทีละขา ดู corr เคลื่อนทางไหน → รู้ว่าขาไหนชน pool โดยไม่ต้องเดา
- corr เกิน limit นิดเดียว (≤0.02) ≠ ตาย — แก้ด้วย re-weight ได้ ถ้าขาที่เป็น bridge ไม่ใช่ขาเดียวที่แบก Sharpe
- หลัง pool มี 6 ตัว ตัวที่ใหม่ corr-bind กับ **ตัวที่เรา submit เอง** ไม่ใช่ pool เดิม — ยิ่ง submit เยอะ Stage 2 ยิ่งต้องเช็คกับของตัวเอง

---

## รอบ 37 (2026-06-12) — backlog leg ใหม่ 1.07 (bank รอคู่), goodwill/tax ปิด (0 queued)

**ค้น field class ต่อ:** goodwill (รวย field แต่ intensity flat ±0.32), order backlog (`fnd6_obs` VECTOR), income tax (field ครบ current/deferred แต่ deferred เคย flat รอบ 29 + tax-surprise corr-risk vs ขา SUE = ข้าม)

**Order backlog (7 sims):** ทิศ RSV (short backlog สูง) = −1.07 → **flip: long backlog/sales = +1.07 sub-univ 1.31 TO 0.016** (กลับทิศ literature ตัวที่ 4: DTC, pension, hiring, backlog — sample 2019-23 = "real-demand visibility premium"). growth leg 0.81 แต่ถูก level subsume (in-class composite 1.08 = level เดี่ยว). cross-class กับ util-flip = 0.71 (util drawdown ฉุด). **standalone ต้องการ Sharpe 1.51 ที่ returns 0.055 (TO ต่ำมาก) — เกินเอื้อมเดี่ยวๆ → bank เป็นขารอคู่ out-of-class ≥0.7 ที่ยังไม่ถูกจอง**

**บทเรียน:** (1) in-class 2-leg ceiling เกิดซ้ำเป็นระบบ (options/short-int/backlog) — level กับ growth ของ field เดียวกัน collapse เสมอ; คู่ต้องข้าม class จริง (2) ขา bank ไว้ใช้ภายหลังได้เพราะ niche ยังไม่จอง — backlog จะเป็น "hiring ตัวถัดไป" เมื่อเจอ core ใหม่

---

## รอบ 38 (2026-06-12, goal-mode autonomous) — `kqKv0bZg` demand-visibility composite SUBMITTED (ตัวที่ 8)

ผู้ใช้ตั้ง goal "submit ครบ 10 ตัว, อนุมัติ recommended อัตโนมัติ" → submit RRr9Yv9z (ตัวที่ 7 จากคิว) แล้วขุดต่อ:
**Deferred revenue (fnd6_drc/drlt) = คู่ที่ backlog รอ** — ธีมเดียวกัน (contracted demand) คนละ field: DR-level 1.33 (ผ่าน LOW_SHARPE เดี่ยว!), DR-growth 1.37 (sub 0.18 อ่อน). weight sweep 5 ตัว: ปัญหา fitness↔sub-universe trade-off (DRgrowth เพิ่ม fitness แต่ฆ่า sub) → **2×backlog + DRlevel + 0.5×DRgrowth = 1.58/1.02/sub 0.75 ผ่านครบ + self-corr 0.3466 ต่ำสุดของโปรเจกต์** → submit attempts 1

**บทเรียน:** (1) ยุทธศาสตร์ "bank ขาไว้รอคู่" พิสูจน์แล้ว — backlog จาก in-class ceiling รอบ 37 กลายเป็น core ของตัวที่ 8 ภายใน 1 รอบ (2) fractional weight (0.5×) แก้ trade-off fitness/sub-universe ได้เมื่อขาแรงแต่ sub อ่อน (3) theme ใหม่ทั้งแผง (ไม่มี facet ใดใน pool) → corr 0.35 = headroom เยอะสำหรับ variant ในอนาคตถ้า OS-fail

---

## รอบ 39 (2026-06-12, goal-mode) — `j2go6pmO` organization-capital composite SUBMITTED (ตัวที่ 9)

**ขา (9 sims):** lease intensity 1.30 (เกือบผ่านเดี่ยว!) + ΔSG&A-ratio flip +1.04 (ตัวที่ 5 ที่กลับทิศ — SG&A โต = org-capital investment ไม่ใช่ inefficiency) + advertising intensity 0.73. **corr whack-a-mole ครั้งแรก:** 1:1:1 ชน P01 (0.7075) → ตัด ΔSGA ชนหนักขึ้น (bridge จริง = lease/adv) → 0.5adv ชน O096 แทน (0.7131) → **0.75adv = interpolation หลบทั้งสอง attractor (P01 0.684, O096 0.646) + IS 1.40/1.19** → submit attempts 1

**บทเรียนใหม่:** (1) **corr-attractor interpolation** — เมื่อปลาย weight สองข้างชน attractor คนละตัวที่ ~0.71 จุดกึ่งกลางมักหลบทั้งคู่ได้ (corr เป็น continuous function ของ weight) (2) pool 8 ตัวแล้ว fundamental slow composite ทุกตัวจะลอยอยู่ใกล้ P01/O096 attractors (0.58-0.65 เป็น baseline) — margin เหลือน้อยลงเรื่อยๆ ตัวถัดไปควรเปลี่ยนภูมิภาค corr (price-based / event-based)

---

## รอบ 40 (2026-06-12, goal-mode) — `vRmZZalG` sales-dynamics SUBMITTED (ตัวที่ 10) 🏁 GOAL COMPLETE

**hunt ยาวสุดของโปรเจกต์ (~35 sims):** ทางตันก่อนเจอ: residual momentum flat −0.14 (ปิดถาวร), R&D intensity 0.12, net-share-issuance 0.05, goodwill ±0.32, ACI/div theme (Sharpe ทะลุ 1.88/1.46 แต่ sub 0.29/0.81 = small-cap structural — ลอง 8 mix/2 universe ไม่หลุด), DuPont composite 0.85, options+conc/util TOP500 0.72, sub-ratio composite 0.94

**ทางออก: Dichev-Tang stability premium → flip!** `-group_rank(ts_std_dev(ts_delta(sales,63)/(sales+1),504), sector)` = −1.37 ⇒ **long sales-growth-VOLATILITY = +1.37 และ sub ฝั่ง flip +0.76 ผ่าน limit ในตัว (หายากมาก)**. + ΔATO (Soliman) = `vRmZZalG` 1.59/1.21 corr 0.4971 → submit attempts 1

**บทเรียนสะสม goal-mode (4 submits ใน 1 วัน):** ดู lessons §0 — interpolation, sub-ratio rule, flip-default, GPA-additive-absorption, small-cap-structural-ทิ้งเร็ว

## รอบ 41 (2026-06-12) — sentiment1 analyst-sentiment composite: field class ใหม่ work จริง แต่ niche #11 ถูกบล็อกด้วย j2go6pmO ของเราเอง

**บริบท:** เปิดรอบหลัง goal-10-complete เพื่อหา bonus ก่อน leaderboard freeze ปลาย มิ.ย. ทำตาม VERDICT-PROVENANCE AUDIT (dataset-map): `sentiment1` เคยถูกตีตรา "buzz flat" จากรอบ 8 ที่จริงเหมารวมกับ scl12 (social) — ยังไม่เคย probe ด้วย toolkit ใหม่ (low-TO + group_rank + recency-weight)

**ค้นพบ:** `get_data_fields sentiment1` เผยว่ามันคือ **analyst research sentiment 19 fields** = recommendation %, price-target revision %, earnings dispersion, earnings-torpedo, focus-ranks ฯลฯ — **ไม่ใช่ social buzz เลย**. = field class ใหม่ที่ pool ไม่มี

**ขาเดี่ยว (group_rank sector, SUBINDUSTRY decay10 trunc0.04, TOP3000 d1):**
- dispersion `snt1_d1_dtstsespe` = Sharpe **1.27** sub 0.71 (flip Diether — disagreement สูง→return สูง 2019-23, เป็น flip ที่ N ของ sample นี้)
- earnings-torpedo `snt1_d1_earningstorpedo` = **1.15** sub 0.69 (FY1 expected vs trailing-4Q actual gap)
- recommendation-net `snt1_d1_netrecpercent` = **1.00** sub 0.63 (Womack rec-drift)
- อ่อน: nettarget 0.60/sub0.24, cored1_score 0.79/sub0.15, dynamicfocusrank 0.66, stockrank 0.54, earningsrevision 1.00/sub0.37 (ทับ P01xQodW), longtermepsgrowthest-flip 0.89

**Composite:** `2*group_rank(dtstsespe,sector)+group_rank(earningstorpedo,sector)+group_rank(netrecpercent,sector)`
- SUBINDUSTRY (xAn2Mpkl): Sharpe 1.28 fit 1.03 sub 0.85 → **ผ่าน IS ครบ** แต่ self-corr **0.8385 vs j2go6pmO**
- INDUSTRY (YPAEbvGW): Sharpe 1.28 fit **1.09** sub 0.89 returns 0.090 drawdown 0.081 → **ผ่าน IS ครบ ดีกว่า** แต่ self-corr **0.8367 vs j2go6pmO** (neut เปลี่ยน corr แทบไม่ขยับ = bridge เป็นเนื้อ signal ไม่ใช่ structure)
- corr ตัวอื่นผ่านหมด: P01xQodW 0.634, gJPqnv6J 0.671, O096kVaY 0.659, RRr9Yv9z 0.626

**Diagnosis (corr-bridge):** dispersion เป็นทั้ง **Sharpe-carrier และ corr-bridge** พร้อมกัน — analyst-disagreement สูง = หุ้น hard-to-value/intangible/growth ซึ่งเป็น tilt เดียวกับ org-capital (j2go6pmO = lease+ΔSGA+advertising intangibles). ลด dispersion เหลือ 1× → Sharpe 1.19 (fail); ตัดทิ้ง → ขา analyst-output อย่างเดียว 0.92-0.99 (fail). ไม่มีขา ≥1.1 อื่นที่ไม่ใช่ dispersion → composite ที่ผ่าน IS บังคับต้องมี dispersion → ติด corr 0.84 เสมอ. gap 0.14 กว้างเกิน weight-perturbation (รอบ 36 แก้ได้ ≤0.02)

**บทเรียน:**
1. **mis-verdict ครั้งที่ 6** (ต่อจาก analyst4 รอบ 33) — dataset ที่ verdict มาจากการเหมารวม/proxy = ยังไม่ probe จริง. `get_data_fields` ดู field จริงก่อนเชื่อ verdict เดิมเสมอ
2. **corr-bridge ที่เป็น Sharpe-carrier พร้อมกัน = แก้ไม่ได้ด้วย reweight/neut** (ต่างจากรอบ 36 ที่ DTC bridge ไม่ใช่ Sharpe-carrier → ลดได้). ถ้าขาแบก Sharpe = ขา bridge → จบ ต้องหาขาแบกใหม่ หรือรอ niche เป้าหมาย OS-fail
3. **CONDITIONAL candidate เป็น asset ที่ valid** — YPAEbvGW เก็บพร้อม submit ทันทีถ้า j2go6pmO OS-fail. /os-monitor จับตา j2go6pmO เป็นพิเศษ

**Verdict:** 0 queued, 1 conditional near-miss. sentiment1 → 🟠 (3 ขาเข้า LEG-BANK). default รอบถัดไป = /os-monitor

---

## รอบ 44 (2026-06-12) — NOA balance-sheet bloat QUEUED = "ตัน" ผิดครั้งที่ 6 + ΔR&D leg ใหม่ + corr-lesson analyst-output

**บริบท:** เปิดรอบหลังรอบ 43 สรุป "ทุก axis ปิด" (default = /os-monitor) แต่ผู้ใช้สั่ง /find-alphas + backlog มี 5 idea ใหม่จาก researcher รอบ 43 (CbOP, NOA, ΔR&D, BAC, ΔGP-composite) — ทั้งหมดสาย fundamental low-TO route. IQC freeze ปลายมิ.ย. = แรงจูงใจ submit เพิ่ม

**Screen ก่อน sim (ประหยัด 2 sim):**
- BAC (betting-against-correlation) → reject: cross-moment family ปิดรอบ 25-26 (coskewness 0.17, downside-beta 0.33) + BAB ตายรอบ 16 + vwap = market proxy ที่ noisy
- ΔGP-composite → reject: core 0.81 รู้แล้ว (akOexNe2) + กฎ "additive GPA-derived โดนดูดเงียบ (4 เคส)" = composite additive เป็นไปไม่ได้

**ผล sim หลัก (11 sims):**
1. **CbOP full-accrual (Ball 2016)** `bl9zXjNm` = flat 0.42 sub 0.01 — accrual adjustment ไม่เพิ่ม edge เหนือ profitability เดิม. ปิดเคส
2. **NOA level (Hirshleifer 2004)** `QPQzJJGW` {SUBINDUSTRY} = 1.54/1.04 ผ่านหมดยกเว้น sub-univ 0.64/0.67 → **เช็ค self-corr ฟรีก่อน tune (เทคนิครอบ 43): 0.5284 สะอาด → คุ้ม tune** → sweep 3 ตัว: **INDUSTRY = `YPAzrowM` 1.51/1.02 sub 0.68 PASS ครบ, self-corr 0.5005 (max vs kqKv0bZg — ไม่ชน leverage gJPqnv6J ตามที่กลัว!) → QUEUED**. ΔNOA form = 1.22/0.76 (อ่อนกว่า level — ตรงข้าม literature), group=industry = fit 0.95 ตก
3. **ΔR&D intensity (Eberhart 2004)** `JjdzwvjO` = 0.76 sub-ratio 0.47 ✅ corr 0.6003 (vs vRmZZalG, ไม่ชน j2go6pmO) — **ขาแรกของ fundamental7 ที่ ≥0.7** (level ตาย 0.22 รอบ 30 แต่ delta work) → เข้า LEG-BANK

**Bonus composite (ตาม LEG-BANK strategy) — ได้ corr-lesson ใหม่:**
- torpedo+netrec+ΔRD (1:1:1 และ 2:1:1, INDUSTRY) = 1.23-1.24/1.00 — ขาด Sharpe 0.01-0.02 (ΔRD ดัน dispersion-free ceiling 1.14→1.24 จริง)
- +earnings-IV-add-on เป็นขา 4 = `gJ3GEjEv` **ผ่าน IS ครบ 1.30/1.08 sub 0.78** (ขา sub-fail เดี่ยวได้บ้านใน composite) — **แต่ self-corr 0.776 ชน 3 attractor พร้อมกัน** (RRr9Yv9z 0.776 / j2go6pmO 0.7758 / P01xQodW 0.734) ทั้งที่ขาเดี่ยวทุกตัว corr 0.60-0.67
- 🔑 **บทเรียน: ขา analyst-output 2 ตัว (torpedo+netrec) ใน composite เดียว = re-couple analyst attractor cluster** — corr ของ composite ไม่ใช่ max ของขาเดี่ยว แต่เป็นผลรวมทิศที่ขนานกับ attractor. ใช้ขา sentiment1 ได้ทีละ 1 ขา + core คนละ class
- ตัด netrec (torpedo+ΔRD+eIV) = sim hang ที่ progress 0.1 (ทิ้งตาม watchdog — ไม่มี kth_element ก็ hang ได้)

**แก้ state เก่า:** ตาราง mechanism-map แถว vol-of-vol/coskewness ค้างเป็น 🔴 ทั้งที่ §รอบ 25-26 บอกทดสอบแล้ว (1.03/0.17) → แก้เป็น 🟡 + แก้บรรทัด freeze-note ใน lessons §0 ที่อ้างผิดว่า "ยังไม่ปิด"

**Meta:** "exhausted" ผิดครั้งที่ 6 — fundamental6 ที่ "ขุดหนัก" 40+ รอบยังมี NOA เพราะมิติ balance-sheet-bloat ไม่เคยถูก probe. แหล่ง = idea backlog ที่ researcher ดึงจาก literature คลาสสิก (Hirshleifer 2004 อยู่ในตำรามา 20 ปี). เพิ่มข้อ (4) ใน checklist ก่อนสรุปตัน: anomaly literature แรงที่ registry ยังไม่มี = ลองได้เสมอแม้ dataset เก่า

---

## รอบ 45 (2026-06-12) — cost-structure composite QUEUED (literature-mining ให้ผล 2 รอบติด) + ขาใหม่ 2 ตัว + จำกัด scope กฎ GPA-absorption

**บริบท:** backlog ว่างหลังรอบ 44 → spawn researcher (ทิศ: anomaly คลาสสิกบน dataset เก่า — ทิศที่เพิ่งพิสูจน์ด้วย NOA). ได้ 5 ไอเดีย: CCC (Wang 2019), operating leverage (Novy-Marx 2011), GP-surprise quarterly (Chiu-Haight), excess-cash (Palazzo 2012), pension-discount-rate (Picconi 2006). TIER-RECHECK: EUR ว่าง (ยังปิด), USA 429 (ใช้ผลรอบ 43 — 20 dataset เดิม)

**ผล probe ขาเดี่ยว (sims 1-6):**
- **OL (cogs+sga_expense)/assets = 1.16/0.66 TO 0.020, self-corr 0.3495 (สะอาดผิดปกติ — max vs vRmZZalG)** ← core ใหม่
- **GPq ts_delta(GP/assets,63) = 1.09/0.57 sub-ratio 0.45, corr 0.4988** ← ขาคุณภาพ
- CCC = 0.94 แต่ sub −0.12 (ขาใช้ไม่ได้) · excess-cash net-form = −0.59 (flip = leverage จองแล้ว — ปิด) · pension-DR = ไม่มี field (translator ค้น 4 รอบ) · ΔR&D จาก LEG-BANK ถูกหยิบมาใช้

**Composite path (sims 7-14):**
- OL+GPq = 1.42/0.90 — **GPq additive ไม่โดน GPA-absorption!** (metrics ต่างจาก OL เดี่ยวชัด) → จำกัด scope กฎ 4 เคส: ครอบเฉพาะ GPA level/annual-Δ
- 3-leg (+ΔR&D) = 1.38/0.94 → ติด fitness ceiling 0.94 (4 variant: recency-GPq 0.88 แย่ลง [GP drift ยาวกว่า 63d ต่าง SUE], 2×GPq 0.89, 2×OL 0.89, decay5 0.94, INDUSTRY 0.79)
- ขา 4: **+torpedo (1:1:1:1) = 1.58/1.26 sub 0.88 ผ่าน IS ครบ แต่ corr 0.7090 เกิน 0.009** (j2go6pmO) / +earnings-IV = 1.41/1.03 sub fail
- **weight-perturbation diagnosis (เทคนิครอบ 36 — ใช้ครั้งที่ 2 สำเร็จ):** 0.75×OL → corr **ขึ้น** 0.7166 (OL = diluter!) · 0.75×torpedo → corr **ลง 0.672** + Sharpe ขึ้น 1.59 (torpedo = bridge ไป j2go6pmO — ซ้ำ pattern dispersion รอบ 41: sentiment1 fields ชน org-capital attractor)
- **`d5Qz7erx` = OL + GPq + ΔRD + 0.75×torpedo {SUBINDUSTRY decay10 trunc0.04}: Sharpe 1.59 fit 1.24 TO 0.038 sub 0.87 self-corr 0.672 → QUEUED (niche #12 candidate)**

**บทเรียน:**
1. **sentiment1 leg ใน composite ข้าม class: ใช้ได้ 1 ขา + down-weight** — full-weight เกิน, 0.75 ผ่าน (และ Sharpe ขึ้นด้วย)
2. **diluter leg มีจริง** — ลดขาที่ corr ต่ำสุด (OL 0.35) ทำ composite corr แย่ลง: corr ของ composite = ส่วนผสมทิศ ไม่ใช่ max ของขา
3. recency-weight เฉพาะ event ที่ drift สั้น (SUE/guidance) — GP-surprise ไม่ใช่
4. ⚙️ researcher agent เขียน backlog เองไม่ได้ (ไม่มี shell/append tool) — สร้างไฟล์แยกแล้ว orchestrator merge เอง; พิจารณาเพิ่ม Bash ใน agent def หรือให้ Write ลงไฟล์ side-car เป็น protocol ถาวร

**สถานะ sims รอบนี้: 14 (รวม 2 perturbation probe) — ROI: 1 queued + ขา bank ใหม่ 2 (OL, GPq) + กฎ refined 2 ข้อ**

---

## รอบ 46 (2026-06-12) — abnormal-capex CONDITIONAL (j2go6pmO กลายเป็น investment-intensity attractor) + ปิด accrual/vol-of-fundamental family

**บริบท:** backlog ว่าง → researcher รอบ 46 (literature-mining ต่อ + เปิดทาง model77/177 scan): abnormal-capex (Titman-Wei-Xie 2004), percent-accruals (Hafzalla 2011), CFO-volatility (Huang 2009), earnings-smoothness (Francis 2004), accruals+OL composite. DATA-AXIS: USA get_datasets = 20 ตัวเดิม (retry หลัง 429 รอบ 45)

**ผล (8 sims):**
1. **abnormal-capex `group_rank(-(capex/assets)/3yr-avg, sector)` = สัตว์ร้าย IS: SUBIND 1.56/1.24 sub 0.81, INDUSTRY 1.68/1.43 sub 0.96** — แต่ corr ติด j2go6pmO ทุก form: SUBIND-sector **0.7199** (ต่ำสุด), industry-group 0.7308, INDUSTRY-neut 0.743, +eIV dilution 0.7157 (sub fail 0.68/0.76), +pct-accruals = Sharpe พัง 1.03, sales-normalized = IS อ่อน 1.23/0.92. **ยืนยันกฎ "corr ถูกกำหนดโดย BASE": abnormal-capex = investment-intensity tilt เดียวกับ lease/ΔSGA/advertising ใน j2go6pmO โดยเนื้อแท้**
2. percent-accruals (|NI| denominator) = 0.57 — ดีกว่า Sloan-form (−0.77) แต่ไม่ถึงเกณฑ์ขา 0.7
3. CFO-vol = −0.07 flat สองทิศ · earnings-smoothness ตัดโดย triangulation (CFO-vol flat + accrual 0.57 + GP-vol ±0.81 absorbed) → **vol-of-fundamental family: เหลือ sales-vol ตัวเดียวที่มี edge และจองแล้ว (vRmZZalG)**
4. composite #5 screen-reject (OL อยู่ใน d5Qz7erx queued — กฎใหม่: ขาใน queued composite ห้ามใช้ซ้ำจนกว่ารู้ผล)

**Insight ใหญ่: j2go6pmO (org-capital) = corr-attractor ฝั่ง fundamental ตัวแรก** — บล็อกแล้ว 2 candidate แรง: YPAEbvGW sentiment-composite (0.84, รอบ 41) + abnormal-capex (0.72, รอบนี้). เทียบ: ฝั่ง price มี XgK9528a (signed-jump) เป็น attractor แบบเดียวกัน. **OS-watch priority ใหม่: j2go6pmO fail = ปลด 2 ตัวพร้อมกัน (เลือก npWqOj3a ก่อน — Sharpe 1.56 > YPAEbvGW 1.28; ถ้า j2go6pmO หลุดจาก pool ทั้งตัว ใช้ j2gGnbMo 1.68 แทน)**

**Nuance ที่มีค่า:** ΔR&D (delta ของ investment) corr 0.60 สะอาด แต่ abnormal-capex (intensity เทียบ 3yr-avg ≈ quasi-level) corr 0.72 — **delta-transform หนี attractor ได้ดีกว่า ratio-vs-own-history** (ครึ่ง delta ครึ่ง level)

**สรุป sims: 8 — queued 0 รอบนี้ (คิวยังมี d5Qz7erx จากรอบ 45 รอ review) + CONDITIONAL bench โต: j2go6pmO-gated 2 ตัว, OS-fail อื่นๆ มี kqKv0bZg corr-headroom สูงสุด**

---

## รอบ 47 (2026-06-12) — exploratory 0-queued: diminishing returns ของ fundamental mining + absorption เคสที่ 6 + UTB leg

**บริบท:** หลัง submit ตัวที่ 12 (`d5Qz7erx`) — backlog ว่าง → ทำคู่ขนาน: researcher (ΔPM DuPont, ΔPM+netrec, GM-stability, cash-ETR, customer-concentration) + orchestrator scan field model77 เอง (ครั้งแรกที่ใช้ get_data_fields ตรงโดยไม่ผ่าน translator)

**ผล field scan model77:** field class ใหม่จริงมีน้อย — 5y-EPS-trend-slope/r² (probe แล้ว), regional-sales-exposure (hypothesis อ่อน ไม่ probe), cash-burn/credit-premium (ญาติ FCF/distress ที่ตาย). ส่วนใหญ่เป็น momentum/value/analyst score ที่ตาย/จองแล้ว

**ผล sims (11):**
- **5y-EPS-trend-slope = 0.81, returns 0.094, sub-ratio 0.84** — น่าใช้มาก แต่ **additive ใน composite โดนดูดเงียบ 2 ครั้ง (เคส 6a: +ΔPM+netrec = metrics เท่า ΔPM+netrec เป๊ะ, 6b: +ΔPM = เท่า ΔPM เป๊ะ)** + r²-multiplicative ก็โดนดูด (metrics เท่า slope เดี่ยว) — สรุป: **absorption ครอบ "slow annual field" ไม่ใช่แค่ GPA-derived**
- **ΔPM (Soliman margin-side): 1.09 แต่ sub-ratio 0.19 + corr baseline 0.6525 (P01xQodW) / 0.6519 (d5Qz7erx)** — margin-change กับ GP-surprise เป็นญาติกัน; pool ที่หนาขึ้นทำ corr baseline ขยับเร็วมาก (d5Qz7erx เพิ่ง submit 1 ชม.ก่อน)
- **UTB (unrecognized tax benefits / assets) = 0.79 sub-ratio 0.59 TO 0.011 → LEG-BANK** (footnote tax-aggressiveness — Hanlon; ไม่ทับ O096kVaY) แต่เป็นขาที่ลาก Sharpe composite ลง (1.16→1.06) — เก็บไว้รอ core ที่เหมาะ
- GAAP ETR (Dyreng) 0.55 — cash-taxes-paid field ไม่มีบน BRAIN ทำ cash ETR แท้ไม่ได้
- ΔPM+netrec ceiling 1.16/0.89 ทุก mix (3-leg ทุกตัวแย่ลง) — ไม่คุ้ม tune เพราะ corr base 0.65
- customer concentration (Patatoukas): ไม่มี HHI field — proxy -rel_num_cust flip +0.75 sub ติดลบ ปิดเคส
- GM-stability screen-reject (vol-of-fundamental ปิดรอบ 46)

**Meta-signal สำคัญ:** นี่คือรอบ 0-queued แรกหลัง 3 รอบทอง (NOA, cost-structure composite ×2 submit) — **fundamental easy-wins กำลังหมด**: (1) pool 12 ตัวอัด corr baseline ใหม่เป็น 0.6+ (2) standalone-passer ไม่เจอ (3) composite ceiling ~1.16 จากขา 0.7-1.1 ที่เหลือ. **ทิศที่ EV สูงสุด = รอ OS** (j2go6pmO ตัดสิน bench 2 ตัว) — อย่า fishing fundamental ต่อจน OS ออก

**ระบบ:** orchestrator scan field เอง (get_data_fields ตรง) เร็วกว่า spawn translator มากสำหรับงาน scan — เก็บ pattern นี้ไว้ (translator ยังจำเป็นสำหรับ verify field แปลกๆ + build expression ซับซ้อน)

---

## รอบ 48 (2026-06-12) — ปิดเคส model77/177 scan (3 sims, มีวินัยตามสัญญาณรอบ 47)

scan ครบทั้ง library (A-F รอบ 47 + keyword slices margin/interest/payout/stability รอบนี้): trough-margin (order-stat บน fundamental, management quality) = 0.26 flat · total debt-service coverage = 0.00 แบนสนิท (financial-health dimension ตายสอดคล้อง distress model53/credit ที่ตายรอบ 16) · ที่เหลือ = family ตาย/จอง (Δ-GPM=GP-surprise · payout/pdy=deepvalue · cv4q-stability=vol-of-fundamental closed · se5yepsg=analyst-LTG) — **provenance-audit item สุดท้าย (model77/177 "ลองไป ~6 field") เคลียร์แล้ว**

OS j2go6pmO ยัง PENDING. สถานะ: ทุก axis ปิดด้วยหลักฐาน — checklist ก่อนสรุปตัน (4 ข้อ) ครบเป็นครั้งแรก. default = /os-monitor; trigger ขุดใหม่: OS-fail / tier เปิด / field-class ใหม่

---

## รอบ 49 (2026-06-12) — ปิด proxy-verdict สุดท้าย (news12/scl12 direct) + ขา contrarian-social + j2go6pmO block ตัวที่ 3

**TIER:** sim จริง EUR ที่ pool 12 = 400 ยังปิด. **news12:** probe ตรงครั้งแรก — ชนิดข้อมูลจริงคือ event-session microstructure (VWAP/volume/flag รอบข่าว) ไม่ใช่ sentiment แบบ news18 (proxy-verdict เดิมผิดเรื่องชนิด!) แต่ news-reaction persistence −0.07 / news-attention 0.31 = flat ปิดเคสด้วยหลักฐานตรง

**socialmedia12:** slow-window contrarian `-ts_mean(scl12_sentiment,63)` group_rank = **0.92 sub-ratio 0.51 TO 0.04 corr-เดี่ยว ~0.47** — แก้ verdict รอบ 8 บางส่วน (fast buzz ตายจริง; slow contrarian มี edge) = ผลของ toolkit ใหม่ (low-TO + group_rank + flip-default)

**Composite "pro-vs-crowd" (contrarian-social + netrec): ผ่าน IS ครบ 1.42/1.08 sub 0.90 — แต่ corr 0.8149 vs j2go6pmO** → CONDITIONAL #3. กลไกที่เข้าใจเพิ่ม: **ขา opinion ทุกชนิด load ทิศ org-capital** — opinion 2 ขา (social 0.47 + analyst-netrec 0.63) บวกกัน = เสริมทิศ attractor (0.81) ไม่ใช่เฉลี่ย; ทั้งคู่เป็น Sharpe-carrier = ลด weight ไม่ได้ (กฎ interpolation-fail รอบ 42). UTB ลาก Sharpe เป็นครั้งที่ 3 = ตีตรา sub-helper ถาวร

**สถานะ: ทุก dataset/axis ปิดด้วย direct evidence 100% เป็นครั้งแรกของโปรเจกต์** — เหลือ event-driven เท่านั้น: j2go6pmO OS (ตัดสิน bench 3: npWqOj3a 1.56 → omYGW56l 1.42 → YPAEbvGW 1.28), tier, freeze. ขาในมือรอ core: contrarian-social 0.92 (นอก opinion-class เท่านั้น), UTB 0.79 (sub-helper), eIV 0.77

---

## รอบ 50 (2026-06-13) — operator-axis scan (meta-axis สุดท้าย) + ปิด lead-lag ถาวรด้วย hump

เช้าวันใหม่: OS ยัง PENDING ทั้งหมด, EUR ยังปิด → ไล่ meta-axis ที่ไม่เคย scan เป็นระบบ: **operator library ทั้งหมด (get_operators)**. ผล: primitive ที่ไม่เคยใช้ = hump / ts_product / quantile-gaussian / scale(long-short) / bucket / ts_quantile / last_diff_value — ตัวเดียวที่ map กับ lead ที่ค้างอยู่คือ **hump() × lead-lag speed-locked** (รอบ 8/18: raw Sharpe 1.25-1.64 TO 1.1; decay/ts_mean ฆ่า Sharpe)

**ผล hump:** ทุกค่า (0.002 / 0.01 / 0.05 — ช่วง 25 เท่า) ให้ metrics เหมือนกันเป๊ะ: TO 0.0077 (fail LOW_TURNOVER!), Sharpe 0.06 — (1) ⚙️ **quirk: hump param ไม่ตอบสนอง** (อาจ parse ฝั่ง client/BRAIN — ใครจะใช้ hump ต้อง verify param ก่อน) (2) **ยืนยันวิธีที่ 3: speed-lock = structural** — edge ของ lead-lag อยู่ใน fast component, กลไก slow ทุกชนิด (decay, ts_mean, hump) ฆ่า signal. ปิด family ถาวร

ops ที่เหลือไม่ map กับ mechanism เปิดใดๆ (ts_product=compound momentum ตาย, quantile=alt weighting แต่ family CONCENTRATED ปิดหมด) → **operator axis ปิด — ตอนนี้ปิดครบทุก axis รวม meta: data ✓ mechanism ✓ route ✓ tier ✓ delay ✓ operator ✓** (รอบ 47-50 รวม 23 sims / 0 queued — สอดคล้องภาพ)

---

## รอบ 53 (2026-06-13) — "ตันผิดครั้งที่ 7": geographic-revenue-exposure QUEUED (Sharpe 1.78/1.38 corr 0.60)

**บริบท:** หลังรอบ 50-52 สรุป "ปิดทุก axis รวม meta" ผู้ใช้ถาม "หาไม่ได้แล้วหรอ" → สั่ง "ทำเลย" กับไพ่ใบสุดท้าย (deep-research + probe field ที่ไม่เคย sim). ใช้ 10 sims

**เส้นทาง:** researcher 4 ไอเดีย (network position / debt-maturity / geographic / inventory-composition) + orchestrator probe คู่ขนาน:
- PageRank centrality 0.94 (มี signal! แต่ corr 0.71 positioning/analyst cluster — central=large visible firms) · debt-maturity flat 0.14
- **APAC sales exposure solo: ผ่าน IS ครบ 1.56/1.13 แต่ corr 0.7128 vs j2go6pmO** → EMEA dilute → APAC+0.5EMEA = 1.71/1.24 corr 0.6709 ✅ แต่ sub 0.69/0.74 (limit ขยับตาม Sharpe) → +UTB = corr ระเบิด 0.8844 (UTB ก็ multinational!) → **+0.75 conc-flip = ปิดเกม: `RRrzOrEb` 1.78/1.38 sub 1.06 corr 0.6033 (margin 0.10)** — TOP1000 collapse (signal อยู่ mid-cap), spread-form อ่อน (common foreign factor คือ alpha)

**บทเรียนเชิงระบบ (ราก "ตันผิดครั้งที่ 7"):** จุดบอดชนิดใหม่ = **field ที่ไม่จอง+ไม่เคย sim ถูกข้ามด้วยเหตุผล "hypothesis อ่อน"** — asia_pacific_sales_exposure ปรากฏใน scan รอบ 47 และถูกข้าม 2 รอบ. ต่างจาก 6 ครั้งก่อน (proxy-verdict / route ใหม่ / mechanism ใหม่) ครั้งนี้คือ**ความขี้เกียจ probe ของที่เห็นอยู่แล้ว**. กฎใหม่: unbooked field class = probe เสมอ (1 sim ถูกกว่าทุก prior)

**บทเรียนเชิงตลาด:** (1) **j2go6pmO attractor = "multinational-intangible factor"** — APAC/UTB/lease/adv/opinion-class load ร่วมกันหมด (2) **ขาอ่อน 0.6-0.7 ใช้เป็น corr-diluter + sub-booster ได้** — conc-flip (0.63 standalone!) ทำครบ 3 อย่าง: corr 0.67→0.60, Sharpe 1.71→1.78, sub 0.69→1.06 — "เกณฑ์ขา ≥0.7" ใช้กับ Sharpe-carrier ไม่ใช่ diluter

**มุมที่ยังเปิดต่อ:** exposure fields อื่น (americas/country-level — ค้น "exposure" เพิ่ม), hub/auth rank (คาด cluster เดิม)

---

## รอบ 54 (2026-06-13) — ปิด macro-sensitivity beta class (probe ตามกฎใหม่จากรอบ 53)

ต่อยอด exposure scan: เจอ class ใหม่ mdl177 sensitivityfactor (เบต้าต่อ macro: inflation/USD/oil/housing/IP/VIX/yield-spread) — ไม่เคย sim. probe 3: **inflation-beta 1.33 corr 0.6335 สะอาด (ไม่ load j2go6pmO) แต่ sub 0.05**, USD 0.87, oil 0.56. composite กู้ sub (+contrarian-social, +USD-beta): Sharpe/fit ผ่าน (1.53/1.14) แต่ sub ดีสุด 0.35/0.65 — **ACI-pattern ที่สอง: return-beta fields กระจุก large-cap เชิงโครงสร้าง** → ปิด class ตามกฎ "sub-broken ทิ้งเร็ว" โดยไม่ probe ที่เหลือ (hs/ip/vix/yieldsprd — คาดอาการเดียวกัน). regional exposure ที่เหลือ (NA/LatAm) ข้ามตามกฎ 1-niche (complement ของ APAC/EMEA ที่จองใน RRrzOrEb). inflation-beta บันทึกใน mechanism-map เผื่อเจอ sub-carrier หนักในอนาคต — 8 sims / 0 queued (แต่เป็นการปิด class ด้วย evidence ไม่ใช่ fishing)

---

## goal-mode รอบ 56 (2026-06-13) — `d5QokeAK` globalization momentum SUBMITTED (ตัวที่ 14) ใน 7 sims

ผู้ใช้ตั้ง goal "หาอัลฟ่าที่ submit ได้" → เปิดด้วย 3 probes มุมที่ใกล้ชัยชนะล่าสุด: Δ-APAC 252d (1.33/0.97 near-miss, corr 0.6885), LatAm exposure (1.30 sub-ratio 0.28 ตก), auth_rank (0.91 ~ pagerank cluster) → tune: **window 126d = ผ่านครบ (1.53/1.13 sub 0.90) + corr ดีขึ้น 0.6786** → submit สำเร็จ attempts 1 (corr finalize ไม่ขยับ)

**บทเรียน:** (1) **delta หนี level ครั้งที่ 2** — Δ-APAC vs RRrzOrEb level แค่ 0.6032 (pattern: ΔR&D หนี capex-attractor มาก่อน) = delta-transform เป็นทางหนี attractor ที่ replicable (2) **dilution geometry ของ delta ≠ level:** Δ-EMEA บน delta เป็น concentrator (corr พุ่ง 0.7375) ทั้งที่ EMEA level เป็น diluter (0.71→0.67) — อย่า copy สูตร dilution ข้าม transform (3) window สั้นกว่า (126 vs 252) ทั้ง Sharpe และ sub ดีขึ้นมากสำหรับ expansion drift

จองเพิ่ม: Δ-geographic-exposure ทุก window. pool = 23 ACTIVE (9 เดิม + 14 เรา). ⚠️ corr margin 0.021 แคบสุดใน 14 ตัว — จับตา OS

---

## goal5 (2026-06-13) — เป้า "5 submittable" สำเร็จ: submit #15-#19 + ค้นพบ UNIVERSE AXIS (breakthrough ที่ 8)

**เส้นทาง (~75 sims):** Phase 1 delta-sweep (Δ-EMEA solo 2.10 มอนสเตอร์แต่ collapse กับ Δ-APAC 0.83 ยืนยันการจอง family; Δ-UTB/lease/OL ตาย) → Phase 2 scanner-agent inventory fnd2/fnd6 12 classes (debt-wall 1.32 RRr9-locked, AOCI 0.99 sub 0.83 ✓, legal 1.21 j2go-locked 0.8183, FG-inventory 1.17, unremitted = j2go 0.8547, อื่นๆ ตาย) → **#15 j2gxLjRj = LatAm(1.30 corr สะอาด 0.51) + AOCI carrier = 1.51/1.01 corr 0.5565** → Phase 3-4 กำแพง 2 attractors ฆ่าทุก composite (j2go กิน 8 ตัววันนี้: legal/unremitted/social-คู่ทุกคู่/UTB; d5Qz กิน DSO-63/FG) → **เปลี่ยนเกม: DSO 1.48 ใส่ options-composite @TOP500 = #16 XgKekxb1 1.39/1.15 corr 0.2548 → ค้นพบ UNIVERSE AXIS: cross-universe corr หดแรง (TOP500 vs pool TOP3000)** → ไล่ TOP500 ของ signal ที่ sub-universe แข็ง: **#17 wpePLZbY Δ-EMEA@500 1.48/1.16 corr 0.3331 (จาก 0.83 บน 3000!)** · **#18 akOwONm5 cost-structure@500 1.32/1.07 corr 0.4069 (expr เดียวกับ d5Qz7erx เป๊ะ!)** · **#19 rKWVPLkd sales-dyn 2:1@500 1.31/1.01 corr 0.3968**

**กฎใหม่ที่ได้:**
1. **UNIVERSE AXIS = orthogonality เต็มแผง:** expr เดิมบน TOP500 corr กับ parent TOP3000 แค่ ~0.4; กับ pool อื่น 0.2-0.35 — TOP500-viable เฉพาะ signal ที่ sub-universe-Sharpe แข็งจริง (options-native, Δ-EMEA 1.10, cost-structure 1.02, sales-vol 1.56) ส่วน mid-cap signals ตายหมด (footnote 0.37, NOA 0.68, capex 0.58, social 0.71, P01 0.60)
2. **sub-universe ≠ TOP500-native** (positioning sub 1.05 แต่ @500 = 1.11/0.84) — ต้อง sim จริงเสมอ
3. j2go6pmO วันนี้ฆ่าเพิ่ม: legal-settlement (0.8183 — บ.ใหญ่โดนฟ้อง), unremitted-foreign (0.8547), ทุก composite ที่มี contrarian-social (3 คู่ 0.776-0.815) → **contrarian-social = practically unusable บน TOP3000**
4. Δ-UTB 0.8603 = counter-example แรกของ delta-escape (delta ของ field ที่ load attractor หนัก ไม่หนี)
5. **DSO (Δ receivable/sales 63d) = ขาทอง 1.48 corr 0.63** — ปลด options ceiling 1.18→1.39; FG-inventory 1.17 / legal 1.21 / wall 1.32 / AOCI 0.99 เข้าคลัง (ครึ่ง locked)

## รอบ goal6 (2026-06-13) — ANALYST FORECAST-DISTRIBUTION + DIVIDEND = BREAKTHROUGH ที่ 9 (SUBMIT 3/5, pool→22)
เป้าหมาย: หา 5 submittable. ผลลัพธ์ **3 ตัว** (orthogonal space หมดจริงหลัง ~103 sims + researcher 3 รอบ).

**3 ตัวที่ submit (โปรเจกต์ #20-22):**
- **#20 `88LXkq9a` dividend-growth/payout:** `group_rank(dividend/(ts_delay(dividend,252)+0.001)-1, sector)` {INDUSTRY decay10 trunc0.04} → 1.34/1.32 TO 0.144 returns 0.140 **self-corr 0.6926** (vs d5Qz7erx, tight-pass). Michaely-Thaler-Womack dividend signaling. **INDUSTRY neut แก้ sub-universe (SUBIND 0.52→IND 0.70).** TOP500/1000 collapse (signal อยู่ broad universe), recency-weight ฆ่า (0.74 — dividend ต้องการ level ไม่ใช่ event), dividend-YIELD ตาย (-0.10 = value-like). attempts 1.
- **#21 `e7rExEQz` EPS-forecast-skewness × dividend:** `2.5*group_rank(skewness_leading_12m_eps_estimates,sector) + group_rank(dividend-growth,sector)` {SUBIND decay10} → 1.68/1.05 **self-corr 0.541**. `skewness_leading_12m_eps_estimates` (anl4) = orthogonal anchor (standalone corr **0.34**!) แต่ fit 0.73 (returns-capped 0.035). booster ต้อง dividend เท่านั้น (OCF-growth→0.76, share-issuance→0.81 = composite พุ่ง 0.71 attractor; dividend ใน skewness-heavy 2.5:1 = 0.54). attempts 1.
- **#22 `zqWekpZO` sales-forecast Bowley-skewness — SPECTACULAR:** `group_rank((anl4_fs_detail_estimates_basic_af_v4_nd_sales_high + ..._sales_low − 2*..._sales_median)/(..._sales_high − ..._sales_low + 0.001), sector)` {SUBIND decay10} → **2.03/3.56 returns 0.384** self-corr 0.54. attempts 1.

**🔑 RECIPE: Bowley-skewness `(high+low−2*median)/(high−low)` ของ analyst estimates = forecast-distribution SHAPE.** sales=spectacular. **forecast-shape = 1 niche:** EPS-Bowley corr 0.93 vs sales, quarterly-sales-Bowley 0.90, EBIT-Bowley 0.78, Δ-sales-Bowley 0.80 — ทุก item/horizon/delta redundant. แต่ standard-skewness ≠ Bowley (0.54) → ได้ 2 ตัว. EBITDA/FCF/div/cfps/grossincome Bowley = อ่อน (analyst coverage บาง). mean-median Pearson skew ตาย (0.33).

**ทำไมจบที่ 3 — j2go6pmO/d5Qz7erx attractor relentless:**
- diversification (Lang-Stulz, `-pv13_revere_key_sector_total`) 1.44/1.61 แต่ corr **0.78 vs j2go6pmO** (diversified multinational = j2go6pmO factor). Δ-diversification ก็ 0.81 (delta ไม่หนีเมื่อ field load attractor หนัก — เหมือน Δ-UTB)
- EBIT-Bowley 1.31/1.13 corr 0.78 vs zqWekpZO. DSO-level 1.40 corr 0.70. OCF-growth 1.00 corr 0.76. share-issuance 0.87 corr 0.81. labor-prod/interest-cov/asset-growth/gross-margin = sub-collapse
- **interpolation/dilution ใช้ไม่ได้เมื่อ legs co-load attractor หรือไม่มี orthogonal headroom:** diversification+EBIT-Bowley→0.80 (co-load j2go), 2×EBIT-Bowley+div→0.78 ทั้ง zqW+88LX (EBIT-Bowley 0.78 ไม่มี headroom ต่างจาก skewness 0.34). e7rExEQz รอดเพราะ skewness anchor orthogonal จริง
- universe-axis: dividend/skew@TOP500/1000 collapse, sales-Bowley@TOP500/1000 CONCENTRATED 0.5; analyst revision 0.81-0.99/dispersion dead/LTG flat; OTM-options-skew 0.30/IV-level dead/VRP-gap dead/IV-momentum 0.87; Tobin's Q/acquisitions/wage-rigidity/announcement-timing/customer-intangibles/DIO/grossincome flat

**meta-lesson:** orthogonal niche บนบัญชี 22-ACTIVE มาจาก (1) มิติข้อมูลใหม่ที่ pool ว่าง (analyst-forecast-distribution, payout) (2) signal ที่ standalone corr <0.4 (anchor) แล้ว boost ด้วย dividend. signal fundamental quality/cost/profitability/investment/structure ทุกตัว → attractor. #4-5 ต้องรอ axis เปิด (OS-fail/tier/dataset).

## รอบ goal6 ต่อ (2026-06-13) — BREAKTHROUGH #10: CROSS-DATA-TYPE INTERPOLATION → ครบ 5/5 (#23-24)
หลังสรุปผิดว่า "จบที่ 3 ตัน" ผู้ใช้ re-invoke /find-alphas. tier-recheck ยืนยัน EUR/CHN/GLB ปิด (sim "Region not available"), USA 20 dataset เดิม, operator เดิม = ไม่มี axis ใหม่. แต่เจอเทคนิคปลดล็อก attractor-locked signal:

**🔑 CROSS-DATA-TYPE INTERPOLATION:** fundamental ที่แรงแต่ corr-locked กับ attractor + price signal (⊥ fundamental สิ้นเชิง) → composite หลุดทั้งคู่
- **#23 `6XE2X1AY`** `3*group_rank(-pv13_revere_key_sector_total,sector) + rank(-ts_delta(close,10))` {SUBIND decay5} = 2.12/2.30 corr 0.6908. diversification (Lang-Stulz business-diversification discount, standalone j2go6pmO 0.78) เจือด้วย 10d-reversal → j2go ลง 0.69
- **#24 `vRmowJYa`** `3*group_rank(EBIT-forecast-Bowley,sector) + rank(-ts_delta(close,10))` {SUBIND decay5} = 1.63/1.24 corr 0.6097 (สะอาดสุด). EBIT-Bowley (forecast-shape, standalone 0.78 vs zqWekpZO) + 10d-reversal → max 0.61 (reversal ดึงออกจาก forecast-shape axis)

**กฎเทคนิค:** (1) **fundamental-heavy 3:1** (price เป็นตัวเจือ ไม่ใช่ตัวหลัก) (2) **10d-reversal ไม่ใช่ 5d** — 5d ชน dense short-reversal cluster (e72Vl8LO TO 0.36) ที่ 0.73; 10d (TO 0.14) ให้ margin (3) **price ต้อง combine-additive แรง = reversal (Sharpe composite 2+); signed-jump อ่อน (EBIT+SJ 0.85, DSO+SJ sub 0.44)** (4) **weight sweep:** น้อยไป (2:1) = price-pool fail; มากไป (4:1) = attractor fail; sweet spot 3:1 (5) **2 fundamental co-load attractor ไม่หนี** (diversification+EBIT-Bowley = 0.80 เพราะทั้งคู่แตะ j2go) — ต้อง fundamental × PRICE (คนละ data-type) เท่านั้น

**meta-lesson (สรุปตันผิดครั้งที่ 10):** "attractor-locked = ตาย" ผิด — signal corr 0.78 กับ pool ยัง submittable ได้ถ้าเจือด้วย signal ต่าง data-type ที่อยู่คนละ corr-subspace. **เปิดพื้นที่ใหม่มหาศาล:** ทุก attractor-locked fundamental (DSO 0.70, OCF-growth 0.76, share-issuance 0.81, term-sector, ขา composite ที่จองแล้ว) × price-niche ที่ยังไม่จับคู่ (MAX/intraday-vol/short-reversal/different-window) = candidate pool ใหญ่. ROI สูง รอบหน้าเริ่มจากนี่ก่อน OS-fail

## รอบ goal6d (2026-06-13) — MULTIPLE PRICE-NICHE CLUSTERS → submit 3 (#27-29), goal6 รวม 10 ตัว
/goal "หา 3 submittable". rev10 cluster เต็มที่ 5 (เพิ่ม #27 `58v267EN` UAP-unexpected-payables `mdl177_earningsqualityfactor_uap` × rev10 INDUSTRY corr 0.60 — earnings-quality/supply-chain, sibling ของ factor family). พยายามขยาย rev10 ต่อ → fresh core ชน 0.73-0.91 (asset-turnover 0.73/capex 0.85/leverage 0.84/NOA 0.85/ERC 0.89/DSO-vs-inventory 0.77/UTB 0.83).

**🔑 ค้นพบ price-niche ที่ 2 = close-range `-(close-low)/(high-low)`** (intraday reversal, cross-section ต่างจาก ts_delta-rev10):
- #28 `npWX3Qwx` DSO(receivable/sales-days) × close-range INDUSTRY 2:1 = 2.10/1.50 corr **0.6536** (DSO×rev10 ชน inventory#26 0.77; close-range ต่าง → 0.65 หลุด)
- #29 `O09297Wv` asset-turnover(sales/assets) × close-range INDUSTRY 2:1 = 1.61/1.19 corr **0.6919** (asset-turnover×rev10 ชน #23 0.73; ×close-range 3:1=0.71 j2go; 2:1 เจือ→0.69)
- กลไก: price ต่าง (close-range vs ts_delta-rev10) ลด shared-price-corr กับ rev10 cluster → core ที่ rev10 reject หลุดได้

**กฎ interpolation ที่คมขึ้น (goal6d):**
1. **reversal-family เท่านั้น combine-additive** (rev10/close-range/VWAP ให้ Sharpe 2+); magnitude (signed-jump/intraday-vol/MAX) อ่อน (composite Sharpe 0.77-0.95)
2. **MULTIPLE price-niche clusters** — แต่ละ reversal-cross-section = cluster ~5 ตัว. rev10(5) + close-range(2) + VWAP(?) 
3. **reuse core เดิม × price ใดก็ชน rev10-version 0.83-0.91** (fundamental 3× dominate) — ต้อง fresh core เสมอ
4. **core ที่ rev10 corr-fail (0.73-0.78) มีโอกาสหลุดบน close-range** (price ต่าง) — ลอง price-niche สลับก่อนทิ้ง core
5. **2:1 weight เจือ fundamental-attractor ดีกว่า 3:1** (asset-turnover j2go 0.71→0.69); 3:1 ถ้าชน price-pool
6. working-cap cores (inventory/receivables/payables) correlate กันเอง — กระจาย 1 ตัว/price-niche
7. ❌ capex/ERC ชน diversification#23 (investment/structure load); booked-pure core (leverage/NOA) ชน pure-alpha 0.84

meta: "interpolation vein ปิดที่ 4" (goal6c) ผิด — close-range เปิด cluster ที่ 2. ก่อนสรุปตัน interpolation ให้ลอง price-niche reversal อื่น (close-range/VWAP/window) เสมอ
