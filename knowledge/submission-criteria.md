# เกณฑ์ Submit Alpha (WorldQuant BRAIN)

> **สำคัญ:** ค่า threshold จริงให้ดึงจาก `is.checks[].limit` ของ API ตอนรันจริงเสมอ (ผ่าน MCP `get_checks`) — ตัวเลขด้านล่างเป็นค่าอ้างอิงทั่วไป อาจต่างตาม region/universe/หน้าต่าง IS และ BRAIN เปลี่ยนได้

## เกณฑ์หลัก (in-sample) — ✅ ยืนยันจาก API จริงแล้ว (USA TOP3000 delay1)
ชื่อ check จริงใน `is.checks[].name` + limit ที่ API คืน:
| check name | limit จริง | หมายเหตุ |
|-----------|-----------|---------|
| `LOW_SHARPE` | ≥ **1.25** | risk-adjusted return |
| `LOW_FITNESS` | ≥ **1.0** | `sqrt(abs(returns)/max(turnover,0.125))*sharpe` |
| `LOW_TURNOVER` | > **0.01** | turnover ต่ำสุด 1% |
| `HIGH_TURNOVER` | < **0.70** | turnover สูงสุด 70% |
| `CONCENTRATED_WEIGHT` | ไม่กระจุกหุ้นเดียว | |
| `LOW_SUB_UNIVERSE_SHARPE` | ≥ **0.75** | ต้องดีในกลุ่มย่อยด้วย |
| `SELF_CORRELATION` | < ~0.7 | เริ่มมาเป็น PENDING (คำนวณภายหลัง) |
| `MATCHES_COMPETITION` | — | ตรงเงื่อนไขการแข่ง |

> limit จริงอาจต่างตาม region/universe — ยังคงดึงจาก `is.checks[].limit` ทุกครั้ง
> **ตัวอย่าง near-miss จริง:** `rank(-ts_delta(close,5))` → Sharpe 1.74 (PASS) แต่ Fitness 0.82 (FAIL) เพราะ turnover สูง 0.62 → แก้ด้วยเพิ่ม decay/ts_decay_linear

## เกณฑ์ correlation (เช็คก่อน submit เสมอ)
| เกณฑ์ | ค่าอ้างอิง | endpoint |
|------|-----------|----------|
| **Self-correlation** | < ~0.7 | `get_self_correlation` (เทียบ alpha เราเอง) |
| **Prod/PnL-pool correlation** | < ~0.7 | `get_prod_correlation` |

alpha ที่ sharpe ดีแต่ correlate สูงกับของที่มีอยู่ = **ไม่มีคุณค่าเพิ่ม** มักถูกปฏิเสธ/ไม่ได้คะแนน

## การตีความผลในระบบนี้
- **PASS ทุก check + corr ผ่าน** → `submit-queue.jsonl` (รอ `/review-candidates` ให้คนอนุมัติ)
- **เกือบผ่าน** = มี check FAIL 1–2 ตัวที่ค่าอยู่ใกล้ limit (เช่น sharpe 1.1 จาก 1.25, turnover เกินนิดเดียว) → ส่ง `alpha-tuner`
- **ก้ำกึ่ง** = พอมีแวว (sharpe > ~0.8) แต่ยังห่าง → `near-miss.md`
- **ตกไกล** = sharpe ต่ำ/ติดลบ → ทิ้ง (log สั้นๆ)

## นิยาม "margin ใกล้ผ่าน" (ใช้ตัดสินใน skill)
- sharpe อยู่ในช่วง 85–100% ของ limit
- หรือ turnover เกิน/ขาด limit ไม่เกิน 1.5x
- หรือ FAIL เพียง check เดียว

## ⭐ FITNESS FEASIBILITY PRE-SCREEN (สำคัญสุด — ใช้ก่อน tune ทุกครั้ง)
> เพิ่ม 2026-06-09 หลังพบว่า near-miss รอบ 3-8 ตกเพราะ **returns ต่ำ** ไม่ใช่เพราะ tune ไม่พอ

**สูตรหลัก:** `fitness = sqrt(returns / max(turnover, 0.125)) × sharpe`
→ จะผ่าน LOW_FITNESS (≥1.0) ต้องมี **`returns ≥ turnover / sharpe²`**

**วิธีใช้ — คำนวณ required_returns = turnover / sharpe² แล้วเทียบกับ returns จริง:**
- **returns จริง ≥ required → ผ่าน/เกือบผ่าน** เดินหน้า tune ได้
- **returns จริง 90–100% ของ required → ใกล้มาก** ดันได้ด้วย: เพิ่ม Sharpe (มีผลกำลังสอง คุ้มสุด), หรือลด turnover **เฉพาะถ้า returns ไม่ตกตาม**
- **returns จริง < 85% ของ required + เป็น signal returns-ต่ำเชิงโครงสร้าง → INFEASIBLE อย่าเสีย sims tune** (ตระกูล reversal/momentum/microstructure บน USA delay1 มัก cap fitness ~0.7-0.96) → ข้ามไปหา signal returns สูงกว่า หรือผสม orthogonal ที่เพิ่ม returns

**เกณฑ์คัดไอเดีย/near-miss ที่ "มีหวังจริง" (returns benchmark จากตัวที่ submit สำเร็จจริง):**
- ตัวที่ submit สำเร็จมี **returns 0.262 (MAX×GP) และ 0.352 (signed-jump)** — สูงกว่า reversal เดิม (0.15-0.18) มาก
- ➜ **ตั้งเป้า signal ที่ returns ≥ 0.15 ขั้นต่ำ** — ถ้า returns ค้างที่ 0.11–0.14 แม้ tune แล้ว = ตระกูลนั้นเพดานต่ำ ย้ายตระกูล
- ลำดับความสำคัญของ lever ดัน fitness: **(1) เพิ่ม Sharpe** (fitness ∝ Sharpe, required_returns ∝ 1/Sharpe²) > (2) เพิ่ม returns ของ signal > (3) ลด turnover (มักทำ returns ตกตาม = ไม่ช่วย)

## กลยุทธ์หา alpha (อัปเดต 2026-06-11 — mechanism-first, แทนกลยุทธ์เดิม 2026-06-09 ที่ล้าสมัย)
> ⚠️ กลยุทธ์เดิม "ขุดตระกูลที่ชนะต่อ" ถูกพิสูจน์ว่าผิดแล้ว — pool อิ่มตัวด้วย reversal ทุก variant ของตระกูลที่ชนะ corr 0.80-0.90 ส่งไม่ได้ (เคส GroeQEpO, GP-reversal). ดูประวัติใน lessons-archive.md
1. **MECHANISM-FIRST: เปิดรอบด้วย `knowledge/mechanism-map.md`** หา transform/moment ที่ยังว่าง — ไม่ใช่ tune/combine/หา variant ของ family ที่จองแล้ว (1 niche ≈ 1 submittable)
2. **Deep research งานวิจัย academic ที่ registry ยังไม่เคยลอง = แหล่ง niche ที่พิสูจน์แล้ว** (MAX + signed-jump มาจากวิธีนี้ทั้งคู่) — แปลงเป็น magnitude-based expression แล้ว sim ตัวแทน family ละ 1-2 ตัวพอ
3. **screen returns ก่อน tune** ตาม feasibility ข้างบน — เลิกเสีย sims กับ decay sweep บน signal returns-ต่ำ
4. **corr screen เชิงโครงสร้างก่อน sim:** base ซ้ำ pool = ข้ามทันที (corr ตาม base ไม่ใช่ weight) · ตัด weight ร่วม (GP) ออกถ้า signal ยังผ่าน = orthogonal กว่า
