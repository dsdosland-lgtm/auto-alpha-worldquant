# Tuning Playbook — แก้ alpha เกือบผ่าน

แนวทางปรับ alpha ที่ FAIL ทีละอาการ เรียงจาก "ถูก/เร็ว" → "ต้องแก้ expression"

> **อ่าน `knowledge/lessons-learned.md` ก่อนเสมอ** — มีบทเรียนจริงว่าอะไร work/ตก เช่น "ts_decay_linear ลด turnover ดี", "อย่า smooth reversal มากเกิน", "fitness ต่ำ+turnover ปกติ = returns ต่ำ"

## หลักการ: settings sweep ก่อน แก้ expression ทีหลัง
expression เดียวกัน ลองหลาย setting คือวิธีเปลี่ยน near-miss → pass ที่ถูกที่สุด — **แต่ถ้า sweep แล้วยังไม่ผ่าน ให้ลอง micro-mutation ของ expression (ดูล่างสุด) อย่าเพิ่งยอมแพ้**

## ตารางอาการ → วิธีแก้

### Turnover สูงเกิน (เกิน ~70%)
1. เพิ่ม `decay` (เช่น 0 → 4 → 8 → 16) — ถ่วงให้สัญญาณนิ่งขึ้น
2. ครอบ `ts_decay_linear(expr, d)` ที่ตัว expression
3. ใช้ `trade_when(...)` เปิดสถานะเฉพาะเงื่อนไข ลดการสลับ
4. ลด lookback ที่สั้นเกินไป (ts_delta(x,1) → ts_delta(x,5))

### Sharpe ต่ำ
1. ลองเปลี่ยน `neutralization`: NONE → MARKET → SECTOR → INDUSTRY → SUBINDUSTRY
2. ครอบ `winsorize(expr, std=4)` ตัด outlier
3. ครอบ `rank()` หรือ `zscore()` ถ้ายังไม่ได้ทำให้ cross-sectional
4. เปลี่ยน `universe` (TOP3000 → TOP1000/TOP500) — สัญญาณอาจชัดในหุ้นใหญ่
5. ลอง group-neutral: `group_neutralize(expr, subindustry)`

### Fitness ต่ำ (แต่ sharpe พอใช้)
- มักเพราะ turnover สูง → แก้ turnover ตามด้านบน fitness จะขึ้นตาม

### Weight concentration ไม่ผ่าน (กระจุกหุ้นน้อยตัว)
1. ครอบ `rank()` เพื่อกระจายน้ำหนัก
2. ลด `truncation` (0.08 → 0.05 → 0.02) จำกัดน้ำหนักสูงสุดต่อหุ้น
3. `scale(expr)` ปรับสเกลรวม

### Sub-universe Sharpe ไม่ผ่าน (ดีแค่หุ้นใหญ่)
1. ทดสอบ universe เล็กลงเพื่อยืนยันความทนทาน
2. group-neutralize เพื่อไม่ให้ขึ้นกับ sector เดียว

### Correlation สูง (self / prod เกิน ~0.7)
1. เปลี่ยน data field หลักที่ใช้ (close → vwap, returns → ts_delta(...))
2. เปลี่ยน region/universe
3. ผสม signal ใหม่ที่ไม่เกี่ยวกัน: `rank(A) + rank(B)`
4. `vector_neut(expr, ตัวที่ correlate)` ทำให้ตั้งฉาก

## ลำดับ variant ที่ tuner ควรลอง

### รอบ 1 — settings sweep (ถูกสุด) — เสนอ ~6 variant
จัดชุดให้ตรงอาการ FAIL (เปลี่ยนทีละ 1–2 ตัวแปรเพื่อรู้ว่าอะไรช่วย):
1. **decay grid** ถ้า turnover สูง: ลอง 3 ค่าคร่อมจุดที่น่าจะพอดี (เช่น 4, 8, 12)
2. **neutralization** ต่างเดิม 1–2 แบบ (เช่น INDUSTRY, MARKET) ถ้า Sharpe/sub-universe เป็นปัญหา
3. **truncation** ลด (0.08 → 0.05 → 0.03) ถ้า weight concentration หรืออยากกระจาย
4. **universe** เล็กลง 1 ระดับ (TOP3000 → TOP1000) ถ้า sub-universe Sharpe อ่อน

### รอบ 2 — micro-mutation ของ expression (ถ้า sweep ไม่พอ) — เสนอ ~6 variant
ขยับ expression "นิดหน่อย" โดยคงแกนไอเดียเดิม — เผื่อโครงสร้างทำให้ผ่าน:
| มิวเทชัน | จาก → เป็น | ช่วยเรื่อง |
|----------|-----------|----------|
| ครอบ smoothing | `expr` → `ts_decay_linear(expr, d)` | turnover (✅ พิสูจน์แล้ว) |
| ทน outlier | `rank(x)` → `rank(winsorize(x, std=3))` | Sharpe, weight |
| เทียบในกลุ่ม | `rank(x)` → `group_rank(x, subindustry)` | sub-universe, Sharpe |
| ปรับ lookback | `ts_xxx(x, n)` → ลอง n คร่อม (เช่น 5→10→20) | turnover/Sharpe trade-off |
| scale ด้วย risk | `x` → `x / (ts_std_dev(returns, 20) + 1e-6)` | Sharpe (risk-adjust) |
| เพิ่มความแรง signal | คูณ driver เช่น `x * rank(volume)` | **returns ต่ำ** (เช่น vwap) |
| reverse/normalize | ครอบ `zscore` แทน `rank`, หรือสลับเครื่องหมาย | distribution/Sharpe |

> เลือกมิวเทชันให้ตรงคอขวด (ดู lessons): turnover→smoothing, returns ต่ำ→เพิ่มความแรง, Sharpe→group/winsorize

### รวมรอบ
- ≤6 variant/รอบ (เคารพ concurrency ~3), วนได้ถึง ~3 รอบต่อ near-miss 1 ตัว
- **บันทึกทุก variant ที่ลอง (setting + expression + ผล) ลง `near-miss.md`** เพื่อไม่ลองซ้ำข้ามรอบ/ข้ามวัน
