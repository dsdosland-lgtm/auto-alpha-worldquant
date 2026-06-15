---
name: improve-system
description: ตรวจสุขภาพ + พัฒนา/แก้ไขระบบหา alpha นี้อย่างเป็นระบบ (strategy/agents/engineering/state/knowledge/ROI) — diagnose ด้วยหลักฐานจริง แยก "ระบบพัง" จาก "ตลาดตันจริง" เลือกแก้ตาม leverage ทดสอบ แล้วบันทึก changelog. ใช้เมื่อระบบติดขัด/ตันหลายรอบ/ROI ตก/อยากปรับปรุงตัวเอง หรือสั่ง /improve-system
---

# improve-system — meta-skill ปรับปรุงระบบตัวเอง 🛠️

> แก้ **"เครื่องมือ" (agents / skills / src / knowledge)** ไม่ใช่ "หา alpha" (นั่นคือ `/find-alphas`)
> หลักการ 4 ข้อ: **evidence-driven · leverage-first · safe · compounding**
> บทเรียนกำเนิด: ระบบเคยขุด USA d1 ตันแต่ไม่รู้ตัว 3 ครั้ง + sub-agent anchor/เสนอ field ปลอม + บั๊ก self-corr — ปัญหาเหล่านี้มองไม่เห็นถ้าไม่ audit เป็นระบบ

## ข้อจำกัด (ห้ามฝ่าฝืน)
1. **แยก "system bug" จาก "market reality" ก่อนแก้เสมอ** — 0-queued หลายรอบอาจ = ตลาดตันจริง (แก้ = redirect strategy) ไม่ใช่ระบบพัง. แก้ผิดชั้น = เปลือง + ไม่หาย (ดู decision tree Stage 1)
2. **ไม่แก้เกิน 3-5 อย่าง/รอบ** — leverage สูงสุดก่อน กัน churn
3. **แตะ `src/` = ต้อง** (a) `node --check` ก่อน-หลัง (b) reason ผ่าน logic รอบ edit (c) **เตือนผู้ใช้ `/mcp reconnect`** (โค้ดค้างใน memory ไม่งั้นดูเหมือนไม่มีผล)
4. **บันทึกทุกการเปลี่ยนใน `knowledge/system-changelog.md`** — กัน regression / แก้ซ้ำ / undo ของเดิม
5. **ห้าม submit / แก้ผล alpha / ลบ data ดิบ** — ปรับ "กระบวนการ" ไม่ใช่ "ผลลัพธ์". ห้ามแต่งตัวเลข metrics ให้ดูดี
6. **fix เชิงประจักษ์ต้องพิสูจน์จริง ไม่เดา** — เช่น "vector_neut หนี corr ได้ไหม" → รัน sim พิสูจน์ อย่าเขียนลง lessons จากการคาด

---

## ขั้นตอน

### 0. เตรียม (health snapshot + กันแก้ซ้ำ)
- อ่าน `knowledge/system-changelog.md` — **แก้อะไรไปแล้วบ้าง อย่าแก้ซ้ำ/อย่า undo** (ถ้าไม่มีไฟล์ = สร้างใหม่ใน Stage 5)
- รัน `node .claude/skills/improve-system/metrics.js` (v2) → ได้: **[0] DATA INTEGRITY** (parse error / dup id / cross-file sync), SIM ROI (buckets), backlog 'new', 0-queued streak, lessons lines, **Δ เทียบรอบก่อน** (regression), และ flag แยก **🚩 ACTIONABLE vs ✓ ACCEPTED**
  - metrics เขียน `.last-snapshot.json` (เทียบ delta รอบหน้า) + อ่าน `accepted-flags.json` (รายการ flag market-reality ที่รับรู้แล้ว — กัน cry-wolf). **โฟกัส ACTIONABLE เท่านั้น**; ACCEPTED = รับรู้แล้วข้ามได้
  - 🚩 **flag มิติ [0] DATA INTEGRITY = priority สูงสุดเสมอ** (data หาย/ขัดกัน = วินิจฉัยมิติอื่นเชื่อไม่ได้) — แก้ก่อน
- อ่าน `data/runs/` report ล่าสุด 2-3 ตัว + `knowledge/lessons-learned.md` §0 (สถานะ)
- 🔑 **PROACTIVE HYGIENE CHECKLIST (ทำเสมอ แม้ ACTIONABLE=0)** — hygiene เสื่อมตาม pool โตทุก 1-2 รอบ; ไม่มี flag ≠ ไม่มีอะไรทำ:
  1. **Pool count staleness**: submitted.jsonl มี N ตัว → accepted-flags.json reasons กล่าวถึง pool ≈ N ไหม? (off >10 → refresh reason)
  2. **Dead-dim freshness**: 3 submit ล่าสุดปิด dim อะไร? dim นั้น + family variants อยู่ใน SKILL.md `⛔ dim จองอิ่มแล้ว` แล้วไหม? (pattern: family ปิดครบแต่ไม่ encode → session ใหม่ลองซ้ำ)
  3. **Open-dim accuracy**: SKILL.md `✅ dim ที่ยังหลุด` — ทุกตัวยังไม่ submit/ไม่ FAIL จริงๆ ไหม? (grep submitted-pool + mechanism-map)
  4. **Count sync**: lessons §0 / submitted-pool header — ตัวเลข submitted ตรงกับ submitted.jsonl ไหม?

### 1. DIAGNOSE — audit 6 มิติ (หลักฐาน ไม่ใช่ความรู้สึก)
ไล่ทุกมิติ เขียน **"อาการ → หลักฐาน → สมมติฐานราก"**:

| # | มิติ | คำถามวินิจฉัย | หลักฐานดูจาก |
|---|------|---------------|--------------|
| A | **STRATEGY / search-space** | ขุด space ที่ตันอยู่ไหม? มี stopping rule? axis ถูกหรือยัง? | runs streak, lessons §0/§1 decision rule, mechanism-map §ปิดเคส |
| B | **AGENT quality** | researcher/translator/tuner anchor/hallucinate/เสนอซ้ำไหม? | tried-registry: สัดส่วน redundant + rejected จาก family เดิม; field ที่ sim แล้วไม่มีจริง; backlog ideas ที่ซ้ำ niche |
| C | **ENGINEERING** | MCP client bug? retry/hang/schema/corr อ่านได้ไหม? | `src/wq-client.js` + `src/server.js`; อาการ error/timeout ใน runs; `node --check` |
| D | **STATE integrity** | backlog/registry/pool/lessons desync? source-of-truth ชัดไหม? | metrics flag (backlog 'new' ที่ registry มีแล้ว); verdict enum ไม่เป็นมาตรฐาน |
| E | **KNOWLEDGE hygiene** | lessons >200 บรรทัด? dead-list ครบ? maps อัปเดต? archive แยกจริง? | metrics line count; mechanism/dataset-map vs สิ่งที่ลองล่าสุด |
| F | **ROI / cost** | sims-per-submit สูงไป? เสีย token กับ confirmation ซ้ำ? | metrics sims-per-submit; 0-queued streak × จำนวน sim/รอบ |

**🔑 DECISION TREE — แยก bug จาก reality (ทำก่อนเลือกแก้):**
- 0-queued หลายรอบ **+ agents เสนอมิติใหม่จริง + sims ผ่าน IS แต่ตก corr** → **MARKET REALITY** (subspace เต็ม) → แก้ = strategy redirect (tier-recheck / OS-monitor / axis ใหม่) **ห้ามไปแก้ agents** (ไม่ใช่ความผิดมัน)
- 0-queued **+ agents เสนอ variant ซ้ำ / ของในตารางตายแล้ว / field ปลอม** → **AGENT BUG** → แก้ agent prompt (anti-anchor / honesty / field-verify)
- sim error / hang / corr อ่านไม่ได้ / schema เพี้ยน → **ENGINEERING BUG** → แก้ `src/`
- เกือบ sim ซ้ำ / status ค้าง "new" / ตัวเลขขัดกันระหว่างไฟล์ → **STATE BUG** → แก้ reconcile + source-of-truth
- lessons บวม / map ไม่ตรง / dead-list ไม่ครบ → **HYGIENE** → จัดระเบียบ knowledge

**🚩 FLAG TRIAGE (ทำกับ ACTIONABLE flags ทุกตัว):** เดิน decision tree → ได้ 1 ใน 3 ผลลัพธ์:
1. **เป็น bug จริง** → แก้ (Stage 3) → flag จะหายรอบหน้า (metrics ยืนยัน)
2. **เป็น market-reality ที่รับได้** (เช่น BACKLOG_EMPTY/ROI_REJECTED/STREAK_ZERO ตอน USA d1 ตัน) → **เพิ่ม key ลง `accepted-flags.json`** (`{key, reason, date, review}`) เพื่อกัน cry-wolf — แต่ **accept ได้เฉพาะหลัง decision tree ยืนยันว่าไม่ใช่ bug** (อย่า accept เพื่อให้ flag หายเฉยๆ = เท่ากับแต่ง metrics) + ใส่เงื่อนไข `review` ว่าจะกลับมาทบทวนเมื่อไร
3. **ยังไม่ชัด** → diagnose ต่อด้วยหลักฐาน อย่าเดา

### 2. PRIORITIZE — leverage matrix
ให้คะแนนแต่ละ issue: **impact (1-3) × fixability-now (1-3) ÷ risk (1-3)** → เลือก top 3-5.
- ถ้าจะแก้ `src/` หลายจุด หรือเปลี่ยน orchestration ใหญ่ → **สรุป plan สั้นๆ ให้ผู้ใช้เห็นก่อนลงมือ**
- งานที่เป็น "external/รอเวลา" (tier locked, OS pending) = ไม่ใช่ fix แต่บันทึกเป็น "blocked — รอเงื่อนไข X"

### 3. FIX — เรียงตาม layer (risk ต่ำ→สูง)
1. **knowledge/** (lessons, maps, changelog) — risk ต่ำสุด: แก้ได้เลย, 2-layer protocol
2. **.claude/agents/*.md** (prompt) — risk ต่ำ: เพิ่มกฎ/anti-pattern, ทดสอบด้วย dry-run mental
3. **.claude/skills/*/SKILL.md** (orchestration) — risk กลาง: เพิ่ม guard/step
4. **src/*.js** (client/server) — risk สูงสุด: edit เล็กที่สุดที่แก้ราก, `node --check`, อ่าน logic รอบ edit
- ถ้าเป็น **strategy fix** → เขียน DECISION RULE / redirect ลง `lessons-learned.md` §0/§1 (ให้ /find-alphas เห็น)

### 4. VERIFY — พิสูจน์ดีขึ้น + ไม่พัง
- **src/:** `node --check src/<file>.js` (syntax) + เดิน logic ผ่านเคสที่เคยพลาด; ถ้าแตะ corr/sim flow → propose 1 sim ทดสอบหลัง restart
- **agent/skill:** dry-run mental — ป้อน scenario ที่เคยพลาด (เช่น "researcher เสนอ variant ของ le0AvXl7") แล้วเช็คว่า prompt ใหม่บล็อกได้จริง
- **knowledge:** เช็ค line count (metrics), ลิงก์ `[[ ]]` ไม่หัก, ไม่ขัดกฎเดิม
- **empirical fix:** รัน sim/script พิสูจน์ (อย่าเดา) — เช่น vector_neut, polling
- รัน `metrics.js` อีกครั้ง → **ส่วน Δ จะโชว์ flag ที่หายไป (✅ แก้แล้ว) + metric ที่ขยับเอง** (regression detection อัตโนมัติ). เป้าหมาย: ACTIONABLE flags ลด, ไม่มี flag ใหม่โผล่จาก fix (เช่น แก้ A แล้วทำ B พัง — รอบนี้เคยเจอ: เพิ่ม row แก้ xfile แต่สร้าง dup → metrics จับได้ทันที)

### 5. RECORD — ทำให้ improvement compound
- **append `knowledge/system-changelog.md`** (สร้างถ้ายังไม่มี) ต่อแถวตาราง: `วันที่ | มิติ(A-F) | อาการ | fix | ไฟล์ที่แตะ | ต้อง restart? | ผลที่คาด/วัดได้`
- ถ้าเป็นบทเรียนเชิงกลไกถาวร → lessons-learned §4 (ระบบ ⚙️) แบบ one-liner + entry เต็มใน archive
- **บอกผู้ใช้:** แก้กี่อย่าง / ต้อง `/mcp reconnect` ไหม / อะไร blocked รอเงื่อนไขภายนอก / metrics ก่อน-หลัง

---

## Common fixes catalog

### Early-era (รอบ 27-45 — pool <50)
| อาการ | ราก | fix |
|-------|-----|-----|
| researcher เสนอ 4 ไอเดีย variant ของ niche ล่าสุดหมด | anchoring | เพิ่ม ANTI-ANCHOR + honesty mandate (เสนอ 0 ได้) ใน agent |
| sim ตกเพราะ field ไม่มีจริง (อ้าง community notes) | hallucination | บังคับ fallback field มาตรฐาน + flag UNVERIFIED |
| ต้อง retry get_self_correlation เองทุกครั้ง | client return ทันทีตอน body ว่าง | poll-until-deadline แทน return |
| เกือบ sim ซ้ำ (#39 backlog ค้าง "new" ทั้งที่ sim แล้ว) | state desync | registry = source-of-truth; reconcile guard ใน find-alphas Stage 0 |
| ขุด USA d1 ตันแต่ไม่หยุด | ไม่มี stopping rule | DECISION RULE (4-dim subspace) + redirect axis ใน lessons |
| corr หนีไม่ได้ด้วย conditioner/vector_neut | predictive power อยู่ใน 4-dim subspace (linear algebra) | ปิดเคส construction-escape; เหลือแค่ axis ใหม่ |
| verdict ใน registry เป็น free-text ปนกัน | enum ไม่ถูกบังคับ | normalize เป็น passed/near-miss/rejected/redundant |

### Current-era (รอบ 57-70 — pool 60+, /auto-alpha dominant)
| อาการ | ราก | fix |
|-------|-----|-----|
| session ใหม่ลอง income-vs-CFO / earnings-vol / gross-margin ซ้ำ (ชน 0.74-0.91) | family ปิดครบแต่ไม่ encode ลง SKILL.md dead-dim | encode dim + family variants ทุกครั้งหลัง run (proactive hygiene #2) |
| accepted-flags อ้าง pool เก่า → วินิจฉัยหลงทาง | pool โตแต่ reason ไม่ refresh | refresh reason ทุก key ที่กล่าวถึง pool count เมื่อ pool โต >10 (proactive hygiene #1) |
| SKILL.md dim ที่ยังหลุด ยังมี lease-type / dim ที่ FAIL หรือ submit แล้ว | open-dim list ไม่ sync หลัง run | ลบ dim ที่ปิด (submit/FAIL) จาก open list ทุกรอบ (proactive hygiene #3) |
| ts_av_diff(<fund>) ชน ts_rank(<fund>) เดียวกัน corr 0.83 | ข้ามโดยเชื่อว่า construction ต่าง = orthogonal เสมอ | เพิ่มกฎใน SKILL.md: ts_av_diff orthogonal เฉพาะกับ fundamental คนละตัว |
| ROI_REDUNDANT cry-wolf ทุกรอบแม้ CORR-FIRST ถูก | flag เป็น structural saturation ไม่ใช่ agent bug | accept + note review condition (>25% หรือ pool +20) |
| 0-queued streak นับสูงจาก /auto-alpha reports ที่ไม่มี queued: line | /auto-alpha Step 8 ไม่บังคับ queued: 0 | เพิ่ม `queued: 0` บรรทัดใน report template ของ /auto-alpha |

## Anti-patterns (อย่าทำ)
- ❌ แก้ agent ทั้งที่รากคือ market reality → เปลือง + ไม่หาย (เช็ค decision tree ก่อน)
- ❌ churn: แก้เยอะ ไม่ test, ไม่ verify
- ❌ แก้ `src/` แล้วไม่เตือน restart → ดูเหมือนไม่มีผล สับสน
- ❌ เพิ่มกฎลง lessons จนเกิน 200 บรรทัด (ย้าย archive)
- ❌ แก้โดยไม่บันทึก changelog → รอบหน้าแก้ซ้ำ/undo
- ❌ "ปรับ metrics ให้ดูดี" แทนแก้รากจริง
- ❌ **accept flag เพื่อให้มันหาย** ทั้งที่ยังไม่ผ่าน decision tree (= แต่ง metrics รูปแบบหนึ่ง) — accept ได้เฉพาะ market-reality ที่พิสูจน์แล้ว + ต้องมี `review` condition
- ❌ แก้ flag หนึ่งแล้วสร้าง flag ใหม่โดยไม่ verify (เช่น เพิ่ม row แก้ cross-file แต่ทำ dup) — รัน metrics หลังแก้เสมอ
- ❌ **"ACTIONABLE=0 = ไม่มีอะไรทำแล้ว"** — ยังต้องผ่าน PROACTIVE HYGIENE checklist (Stage 0) เสมอ; SKILL.md dead-dim / accepted-flags / lessons counts ล้าตามเวลา แม้ไม่มี flag

> เป้าหมายสุดท้าย: ทุกครั้งที่รัน skill นี้ ระบบต้อง **ฉลาดขึ้น/แกร่งขึ้นอย่างวัดได้** (flag ลด, ROI ขึ้น, หรือ knowledge คมขึ้น) — ไม่ใช่แค่ "แก้ไปงั้นๆ"
