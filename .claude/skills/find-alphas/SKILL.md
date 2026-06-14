---
name: find-alphas
description: รัน pipeline หา alpha ครบวงจรบน WorldQuant BRAIN — ค้นไอเดีย → แปลงเป็น FASTEXPR → simulate → ประเมิน → tune ตัวเกือบผ่าน → เข้าคิวรออนุมัติ submit. ใช้เมื่อผู้ใช้อยากหา/ขุด alpha ใหม่ หรือสั่ง /find-alphas
---

# find-alphas — orchestrator หลัก

ทำงานตาม pipeline 4 ขั้นของผู้ใช้ โดยจัดการ sub-agent + MCP server เอง

> **ยึดโครง `knowledge/alpha-design-framework.md` (5 stage + GATE) ทุกรอบ** — Stage 0 (return-source) → 1 (diagnostic+feasibility) → 2 (corr screen) → 3 (construction) → 4 (robustness). แต่ละ stage เป็น GATE: ไม่ผ่านให้หยุด/ถอย ไม่ดันต่อ. ขั้นตอนล่างคือการ execute โครงนี้

## ข้อจำกัดสำคัญ (ห้ามฝ่าฝืน)
- **ห้าม submit เอง** — alpha ที่ผ่านให้เขียนลง `data/submit-queue.jsonl` เท่านั้น การ submit จริงทำผ่าน `/review-candidates` ที่คนกดอนุมัติ
- simulate พร้อมกัน **ไม่เกิน 3 ตัว** (เคารพ rate limit)
- ค่า threshold ใช้จาก `is.checks[].limit` ที่ API คืนจริง อย่า hardcode

## พารามิเตอร์ (จาก args ผู้ใช้ ถ้ามี)
- จำนวนไอเดียต่อรอบ (default 5)
- region/universe/delay (default USA / TOP3000 / 1)
- หมวด alpha ที่สนใจ (เช่น reversal, momentum) — ถ้าไม่ระบุให้ researcher เลือก

## ขั้นตอน

### 0. เตรียม
- ตรวจ login: เรียก MCP `login` (ครั้งเดียว)
- **อ่าน `knowledge/lessons-learned.md`** (distilled playbook — กฎ active; ประวัติเต็มอยู่ lessons-archive.md เปิดเฉพาะเมื่อต้องการ)
- **อ่าน `knowledge/dataset-map.md` (แกน data) คู่กับ `knowledge/mechanism-map.md` (แกน transform)** — ถาม "dataset × mechanism ไหนยังว่าง?" เลือก 🟠 lead-ค้าง / 🔴 ยังไม่ลอง ก่อนเสมอ. **อย่าเปิดรอบด้วยการ tune/combine ของเดิม** (breakthrough ทั้ง 2 มาจาก transform ใหม่ ไม่ใช่ dataset ใหม่/tuning)
- **DATA-AXIS PROBE (ครั้งแรกของ session):** เรียก MCP `get_datasets` (+ `get_operators` ถ้าจะใช้ op ใหม่) เทียบกับ dataset-map — ถ้ามี dataset/operator ใหม่ที่ map ยังไม่มี ให้เพิ่ม. เช็ค delay 0 / universe อื่นด้วยถ้า args ขอ
- **TIER-RECHECK (1 ครั้ง/รอบใหญ่ — สำคัญขึ้นหลัง pool โต):** ลอง `get_datasets` หรือ sim เล็ก 1 ตัวบน region อื่น (EUR/GLB/CHN) — BRAIN อาจเปิด tier เพิ่มเมื่อ submit สะสม (ตอนนี้ 4+ ACTIVE). ถ้าเปิดเมื่อไร = พื้นที่ orthogonal ใหม่ทั้งแผง (กลไกที่จองบน USA ยังว่างบน region ใหม่)
- **อ่าน `knowledge/submitted-pool.md` + refresh ด้วย `list_alphas status=ACTIVE`** — นี่คือ pool จริงที่ self-corr เช็คเทียบ (Stage 2). **สถานะหลังรอบ 26: USA d1 มี ~4 orthogonal niche และจองครบแล้ว (reversal / total-MAX / total-signed-jump / intraday-vol) + IV-skew/value/leverage/turnover.** กลไก "strong" ใหม่บน pv1 มักเป็น corr-attractor ของ jump cluster (0.84-0.94) ส่วนกลไก orthogonal จริง (liquidity/path/cross-moment/news/earnings/credit) = flat — **เปิดรอบใหม่ให้เช็ค mechanism-map §"ปิดเคส" ก่อนเสมอ กันลองซ้ำ** ทางที่ยังเปิด: (1) **🆕 CROSS-DATA-TYPE INTERPOLATION (breakthrough #10) — ลองก่อนสรุปตันเสมอ:** signal fundamental ที่แรงแต่ "attractor-locked" (corr 0.7-0.8 — เคยทิ้ง) เจือด้วย price `3*group_rank(fundamental,sector) + rank(-ts_delta(close,10))` weight-sweep 2-3:1 → หลุดทั้ง 2 attractor (ดู lessons §2 + mechanism-map; goal6 ได้ 4 ตัวจากนี่) (2) axis ใหม่ (region/universe/delay/dataset ที่เพิ่งเปิด) (3) OS-fail ทำ niche เก่าว่าง
> ⛔ **ANTI-PREMATURE-EXHAUSTION (กฎเหล็ก — สรุป "ตัน" ผิดมาแล้ว 11 ครั้ง):** ก่อนรายงาน "ไม่มี alpha เหลือ/ตัน" ต้องผ่าน checklist **4 AXIS**: (a) **fundamental-dim** — interpolation กับ attractor-locked + mechanism-map dim ว่างไหม (b) **price-niche** — rev10/close-range/VWAP cluster ไหนยังไม่อิ่ม (c) 🆕🔑 **CONSTRUCTION-axis (ลืมบ่อยสุด — /auto-alpha10 พลาดตรงนี้):** ลอง `ts_rank(<fund>,252/504/756)`/`ts_zscore`/`ts_av_diff` แทน `group_rank` — **ts_rank ⊥ group_rank pool ทั้งแผง 0.4-0.6 (breakthrough #11 ปลด 5/10→10/10)** (d) **cross-section** — tier/region/delay/universe (sim จริง) — **ครบ 4 axis ค่อยสรุปตัน**
- อ่าน `data/idea-backlog.jsonl` ดูไอเดียที่ยัง `status:"new"` และ `data/tried-registry.jsonl` (กัน sim ซ้ำ)
  - ⚠️ **RECONCILE ก่อนใช้ (กัน state desync):** `tried-registry.jsonl` = source of truth ว่า "เคย sim แล้ว". ก่อนหยิบ idea `status:"new"` ไป sim ให้ grep registry ด้วย expr/แนวคิดนั้นก่อน — ถ้าเจอ = อัปเดต backlog เป็น verdict จริงทันที (เคยพบ #39 MIN sim แล้วแต่ backlog ยัง "new" → เกือบ sim ซ้ำ). **เมื่อ sim เสร็จต้องอัปเดต backlog status ใน Stage 4 เสมอ ไม่ทิ้งค้าง "new"**
  - ⛔ **เช็ค DECISION RULE ใน lessons §1 ก่อน sim:** ถ้า idea ใช้ base ร่วมกับ 4 niche (เปลี่ยน weight/conditioner/demean/residual) หรือเป็น moment/transform ของ total/intraday returns → corr>0.85 แน่ (4-dim subspace รอบ 28) = ข้าม อย่าเสีย sim

### 1. ค้นไอเดีย (ถ้า backlog ไม่พอ)
- ถ้าไอเดีย new < จำนวนที่ต้องการ → spawn **alpha-researcher** เติม backlog
- ⚙️ **SIDE-CAR PROTOCOL (researcher ไม่มี shell — ห้ามสั่ง append ไฟล์ใหญ่):** ให้ researcher **Write ไฟล์ใหม่ `data/r<รอบ>-new-ideas.jsonl`** ไฟล์เดียว แล้ว orchestrator `cat >> idea-backlog.jsonl` เอง (เคยเสีย ~30 tool calls รอบ 45 เพราะ agent วนหาวิธี append)
- 📋 **prompt ของ researcher ต้องแนบ 3 อย่างเสมอ (กันเสนอของชน):** (1) niche ที่จองทั้งหมด **รวมขาทุกตัวใน composite ที่ submit แล้ว** (2) **ขาที่อยู่ใน submit-queue = ห้ามเสนอทับ** (ใช้ซ้ำ = candidate ชนกันเอง) (3) **family ที่เพิ่งปิดในวันเดียวกัน/รอบล่าสุด** จาก lessons §0 บรรทัดบนสุด (researcher มักพลาดของที่ปิดใหม่กว่า map — เคส GM-stability รอบ 47)
- ถ้าพอแล้ว ข้ามไป

### 2. แปลง → FASTEXPR
- สำหรับแต่ละไอเดีย spawn **alpha-translator** → ได้ expression + settings
- ข้ามตัว `verified:false`

### 3. simulate (ทีละ ≤3)
- **เช็ค `data/tried-registry.jsonl` ก่อน** — ถ้า (expression+settings) เคย sim แล้ว ข้าม (กันเปลือง sim)
- เรียก MCP `simulate` ต่อ expression → ได้ alpha_id + metrics + checks
- อ่านผลจาก `get_checks`
- **append `data/tried-registry.jsonl` ทุกตัวที่ sim** (ผ่าน/ตก/near-miss ก็ log) — ไว้ meta-analysis + กันซ้ำ
- ⚙️ ถ้า simulate/getAlpha คืน timeout/504/5xx = transient (server) **ลองซ้ำ 1-2 ครั้ง** ไม่ใช่บั๊ก expression (client มี retry แล้วหลัง restart MCP)
- ⚙️ **SIM WATCHDOG:** ถ้า `check_simulation` คืน progress ค่าเดิม >5 นาที (~3 polls) = sim hang ถาวร — **ทิ้งเลย อย่ารอ** (เกิดได้ทั้งกับ `kth_element` บน derived expression และ composite ธรรมดา — เคสรอบ 44 ไม่มี kth_element ก็ hang) ถ้าราก kth_element ใช้ power-norm แทน (`ts_sum(power(max(x,0),2or4),d)`)

### 4. ประเมิน + แตกทาง (อิง knowledge/submission-criteria.md)
สำหรับแต่ละ alpha:
- **PASS ทุก check** → เรียก `get_self_correlation` + `get_prod_correlation`; ถ้า corr ผ่าน (หรือ `unavailable`/`empty` = ผ่านโดยมี note ให้เช็คมือ) → append `data/submit-queue.jsonl` + **อัปเดต `data/passed-alphas.md`** (เพิ่มแถวตาราง + บล็อกรายละเอียด); mark ไอเดีย `status:"queued"`
  - ⚠️ **self-corr `empty` ตอนเพิ่ง sim = เชื่อไม่ได้** (ยังคำนวณไม่เสร็จ — เคส GroeQEpO empty→0.805 ทีหลัง). บันทึก `self_corr:"pending"` ในคิว แล้ว **บังคับ re-check ตอน /review-candidates**. ถ้า alpha ใช้ base ร่วมกับ submitted (เช่น ts_zscore(close,5)) ให้ flag เสี่ยง corr สูงไว้ก่อน
- **เกือบผ่าน** (ตาม margin ใน criteria) → spawn **alpha-tuner** → simulate ซ้ำ: **รอบ 1** settings sweep (~6 variant), **รอบ 2** expression micro-mutation (ถ้าดีขึ้นแต่ยังไม่ผ่าน), วนได้ถึง ~3 รอบถ้ายังขยับเข้าใกล้; ผ่านเมื่อไรเข้าคิว+อัปเดต passed-alphas ทันที, ไม่ขยับลง near-miss
- **ก้ำกึ่งมีแวว** → append `data/near-miss.md` (expression, metrics, check FAIL, setting ที่ลอง)
- **ตกไกล** → log สั้นๆ ใน run report, mark ไอเดีย `status:"rejected"`

### 5. สรุป + เรียนรู้ (สำคัญ — ทำให้ระบบฉลาดขึ้นทุกรอบ)
- เขียน `data/runs/<วันที่>-report.md`: กี่ไอเดีย, ผ่านกี่ตัว, near-miss กี่ตัว, ตกกี่ตัว — **ต้องมีบรรทัด machine-readable `queued: N` ใกล้หัวไฟล์** (metrics.js ใช้นับ 0-queued streak; เขียนแต่ตารางอย่างเดียว parser อ่านไม่ได้)
- **เขียนบทเรียนใหม่ (protocol 2 ชั้น):** (1) entry เต็ม (รายละเอียด+เส้นทาง+วันที่) ต่อท้าย `knowledge/lessons-archive.md` (2) อัปเดต **one-liner ในหมวดที่ถูกต้อง** ของ `knowledge/lessons-learned.md` (§0 สถานะ / §1 กฎโครงสร้าง / §2 toolkit ✅ / §3 ตายแล้ว ❌ / §4 ระบบ ⚙️) — **ใหม่ขัดเก่า = แก้ของเก่า, ห้าม append ท้ายไฟล์ตามเวลา, ไฟล์หลักห้ามเกิน ~200 บรรทัด**
- **ลอง mechanism ใหม่รอบนี้ → อัปเดตสถานะใน `knowledge/mechanism-map.md` ทันที** (เหมือน dataset-map)
- ถ้าเจอ **บั๊ก/ข้อติดขัดในระบบ** (MCP error, client พัง, schema ไม่ตรง) → แก้ที่ `src/`/knowledge/agent ได้เลย แล้วบันทึกใน lessons (⚙️)
- บอกผู้ใช้ว่ามี N ตัวเข้าคิว (ดู `data/passed-alphas.md`) → แนะนำรัน `/review-candidates` เพื่ออนุมัติ submit

## รูปแบบบรรทัด submit-queue.jsonl
```json
{"alpha_id":"...","expression":"...","settings":{...},"sharpe":1.31,"fitness":1.05,"turnover":0.22,"self_corr":0.4,"prod_corr":0.5,"status":"queued","queued_at":"<date>","idea_id":"..."}
```
> **status enum: `queued` | `needs-corr-check` เท่านั้น** — ตัว redundant/corr-fail **ห้ามอยู่ในคิว** ให้บันทึกลง tried-registry (`verdict:"redundant"`) แล้วลบออกจากคิว · ใช้ key `expression` เสมอ (ไม่ใช่ `expr`)

## รูปแบบบรรทัด tried-registry.jsonl (log ทุก sim — กันซ้ำ + meta-analysis)
```json
{"alpha_id":"...","expr":"...","settings":{"neut":"INDUSTRY","decay":4,"universe":"TOP3000","trunc":0.08},"sharpe":1.69,"fitness":0.96,"turnover":0.56,"returns":0.179,"sub_sharpe":1.41,"verdict":"near-miss","dataset":"fundamental6","date":"<date>"}
```
> **verdict enum (บังคับ 5 ค่าเท่านั้น — ห้าม free-text เช่น "FAIL-corr-0.94"):** `submitted` | `passed` | `near-miss` | `rejected` | `redundant`. รายละเอียด (corr/เหตุผล) ใส่ใน `note` ไม่ใช่ใน verdict. (`improve-system/metrics.js` ใช้ enum นี้คิด ROI — free-text ทำสถิติเพี้ยน). ก่อน sim ใหม่ grep registry ว่าเคยลอง (expr+settings) ไหม

> ถ้าต้องการ sweep ไอเดียจำนวนมากแบบขนาน ใช้ Workflow `workflows/alpha-batch.js` แทนการ simulate ทีละตัว (เหมาะกับการสวีป dataset ใหม่)
