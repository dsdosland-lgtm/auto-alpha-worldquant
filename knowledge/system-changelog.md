# System Changelog — บันทึกการแก้/ปรับ "ระบบ" (ไม่ใช่ alpha) 🛠️

> ดูแลโดย skill `/improve-system`. ทุกการเปลี่ยน agents / skills / src / knowledge-structure ลงที่นี่
> วัตถุประสงค์: **กัน regression / แก้ซ้ำ / undo ของเดิม** + ให้การปรับปรุง compound
> มิติ: A=strategy · B=agent · C=engineering · D=state · E=knowledge-hygiene · F=ROI
> (บทเรียนเรื่อง "หา alpha" อยู่ lessons-learned.md — ที่นี่เฉพาะเรื่อง "เครื่องมือ")

| วันที่ | มิติ | อาการ | fix | ไฟล์ที่แตะ | restart? | ผลที่คาด/วัดได้ |
|--------|------|-------|-----|-----------|----------|------------------|
| 2026-06-11 | C | ต้อง retry `get_self_correlation` เองทุกครั้ง — body ว่าง (ยังคำนวณ corr ไม่เสร็จ) แล้ว client `return` ทันที | เปลี่ยนเป็น **poll-until-deadline** (sleep+continue) ตอน body ว่าง | `src/wq-client.js` `_correlation()` | ✅ ต้อง /mcp reconnect | self-corr คืนค่าจริงในครั้งเดียว session หน้า |
| 2026-06-11 | B | alpha-researcher รอบ 27 เสนอ 4 ไอเดีย = variant ของ niche ล่าสุด (intraday-vol) หมด → corr 0.92-0.99 เสีย sim | เพิ่ม **ANTI-ANCHOR + honesty mandate (เสนอ 0 ได้) + AXIS-REDIRECT + 4-dim subspace warning** | `.claude/agents/alpha-researcher.md` | ไม่ต้อง | researcher ไม่ผลิต variant ซ้ำ; เสนอมิติใหม่จริงหรือบอกตรงว่าตัน |
| 2026-06-11 | B | researcher อ้าง field `fam_earn_surp_pct` จาก community notes ที่ไม่มีจริง → เสีย cycle | บังคับ **flag UNVERIFIED + ต้องมี fallback field มาตรฐาน** | `.claude/agents/alpha-researcher.md` | ไม่ต้อง | ลด sim ที่ตายเพราะ field ผิด |
| 2026-06-11 | D | เกือบ sim ซ้ำ — #39 MIN sim แล้ว (E5K6EYrP) แต่ backlog ยัง `status:"new"` | เพิ่ม **RECONCILE guard** (registry=source-of-truth, grep ก่อน sim, บังคับอัปเดต backlog หลัง sim) | `.claude/skills/find-alphas/SKILL.md` Stage 0 | ไม่ต้อง | ไม่ sim ซ้ำ; backlog ไม่ค้าง "new" |
| 2026-06-11 | A | ขุด USA d1 ตันแต่ไม่มี stopping rule → 0-queued หลายรอบ + เสี่ยงขุดซ้ำ | เพิ่ม **DECISION RULE (4-dim subspace)** + redirect axis ใน lessons §0/§1 + guard ใน find-alphas Stage 0 | `lessons-learned.md`, `find-alphas/SKILL.md` | ไม่ต้อง | เลิก sim variant pv1-magnitude; default = tier-recheck/OS-monitor |
| 2026-06-11 | A | corr bottleneck ไม่รู้ว่าหนีได้ไหม (สันนิษฐานเฉยๆ) | **ทดลอง vector_neut จริง 2 ตัว** (residual Sharpe 0.37/−0.68) → พิสูจน์ orthogonality-by-construction ตัน (4-dim subspace) | `lessons-learned.md` §0/§2, `mechanism-map.md`, registry | ไม่ต้อง | ปิดเคส construction-escape ด้วยหลักฐาน |
| 2026-06-11 | E/F | สร้าง skill `/improve-system` + `metrics.js` (health snapshot) + changelog นี้ | meta-skill diagnose 6 มิติ + decision tree bug/reality | `.claude/skills/improve-system/*`, ไฟล์นี้ | ไม่ต้อง | audit ระบบเป็นระบบ; metrics วัด ROI/flag ได้ |
| 2026-06-11 (improve-system รอบ 1) | D | `verdict` ใน tried-registry เป็น free-text ปน 9 entries ("FAIL-corr-0.94"/"SUBMITTED-..."/"flat") → metrics ROI เพี้ยน + meta-analysis พลาด | (1) normalize 9 entries → enum 5 ค่า (corr detail อยู่ใน note อยู่แล้ว, มี `.bak`) (2) harden `metrics.js` `bucketOf()` กัน drift + นับ non-canonical (3) บังคับ enum ที่ write-time | `data/tried-registry.jsonl`(+.bak), `metrics.js`, `find-alphas/SKILL.md` | ไม่ต้อง | rejected rate แม่นขึ้น 59→61% (จริง); verdict drift ในอนาคต bucket อัตโนมัติ + flag |
| 2026-06-11 (improve-system รอบ 2 — ปรับ skill เอง) | E/F | metrics v1 มีจุดบกพร่อง: (1) cry-wolf — market-reality flag เด้งทุกรอบ flag จริงจม (2) readJsonl กลืน parse-error เงียบ (3) ไม่มี regression/trend (4) ไม่เห็น cross-file/dup | rewrite `metrics.js` v2: **[0] DATA INTEGRITY** (parse-err/dup-id/xfile), **keyed flags + ACTIONABLE vs ACCEPTED** (`accepted-flags.json` กัน cry-wolf), **snapshot delta** (`.last-snapshot.json` regression detect), streak parser skip-not-break | `metrics.js`, `accepted-flags.json`(ใหม่), `improve-system/SKILL.md` | ไม่ต้อง | flag จริงไม่จม; data หาย/ขัดมองเห็น; เทียบรอบได้ |
| 2026-06-11 (improve-system รอบ 2) | D | v2 เผย integrity issue ที่ซ่อนอยู่: XgK9528a ไม่มี submitted row ใน registry (xfile 4≠3) + 1YgNQZKW log ซ้ำ verdict ขัดกัน (passed vs redundant) | ลบ row stale (1YgNQZKW passed), แก้ XgK9528a verdict passed→submitted, accept STREAK_ZERO (market-reality) | `data/tried-registry.jsonl`, `accepted-flags.json` | ไม่ต้อง | ACTIONABLE flags 3→0; submitted 4=4; dup หาย |
| 2026-06-11 (improve-system รอบ 3 — หลังรอบ 29 submit O096kVaY) | D | DATA_PARSE: append JSONL ลงไฟล์ที่ไม่จบด้วย newline → 2 JSON ติดบรรทัดเดียว (xAnvrEzn+88LGdrGX) = 2 rows หายเงียบจาก metrics | split บรรทัด (มี .bak2) + กฎ "append ต้องแน่ใจ newline-terminated" ลง lessons §4 | `data/tried-registry.jsonl`(+.bak2), `lessons-learned.md` §4 | ไม่ต้อง | parse error 1→0; rows 113→115 |
| 2026-06-11 (improve-system รอบ 3) | D | DATA_XFILE: O096kVaY submit แล้วแต่ registry verdict ยัง `passed` (5≠4) — รากเดียวกับเคส XgK9528a รอบก่อน (ขั้น "อัปเดต registry หลัง submit" ไม่อยู่ใน review-candidates step 7) | แก้ verdict passed→submitted | `data/tried-registry.jsonl` | ไม่ต้อง | xfile 5=5 ✅ (ถ้าเกิดครั้งที่ 3 → แก้ที่ review-candidates SKILL step 7 ถาวร) |
| 2026-06-11 (improve-system รอบ 3) | C | ⚙️ anomaly รอบ 29: GP-weight บน group_rank composite คืน metrics "เหมือนเป๊ะ" — สงสัย client/cache | **พิสูจน์ด้วย get_alpha(0m8Gkxbq): BRAIN เก็บ expression ถูก + ค่าจริง 4 หลักต่างกัน (0.0436≠0.044)** = ไม่ใช่ bug; เป็น (1) client แสดงผลปัด 3 ตำแหน่ง (2) weight homogeneous ใน group ถูก neutralization ดูดซับ → ปิดเคสใน lessons §4 | `lessons-learned.md` §4 | ไม่ต้อง | ไม่เสีย sim ซ้ำกับ weighted-group_rank; ไม่ไล่ผี client |
| 2026-06-11 (improve-system รอบ 3) | E/F | streak parser อ่าน report รอบ 29 ไม่ได้ (เขียน queue เป็นตาราง) → streak ค้าง 5 ทั้งที่จบแล้ว + accepted-flags อ้างเหตุผล "subspace เต็ม" ที่รอบ 29 แก้ความเข้าใจแล้ว (stale = วินิจฉัยรอบหน้าหลงทาง) | เพิ่มบรรทัด `queued: 1` ใน round29 report + บังคับ machine-readable `queued: N` ใน find-alphas step 5 + refresh reason/review ของ accepted-flags 3 ตัว | `data/runs/2026-06-11-round29-report.md`, `find-alphas/SKILL.md`, `accepted-flags.json` | ไม่ต้อง | 0Q-streak 5→0 (จริง); STREAK_ZERO เลิก fire เอง; review conditions ชี้ fundamental7 |

## ปัญหาที่ BLOCKED (รอเงื่อนไขภายนอก — ยังแก้ด้วยโค้ดไม่ได้)
- **monoculture (พึ่ง USA d1 pv1):** ทางออก = tier เปิด (region ใหม่) — ต้องสะสม submit/quality score บนแพลตฟอร์ม. action: TIER-RECHECK เป็นระยะ
- **ไม่มี OOS feedback loop:** os.checks PENDING เป็นสัปดาห์ — รอผลจริงก่อนเอามาปรับ strategy. action: /os-monitor ตามรอบ

## งานปรับปรุงที่ค้าง (backlog ของระบบเอง — ทำเมื่อมีโอกาส)
- [x] D/E: normalize `verdict` ใน tried-registry → enum 5 ค่า ✅ ทำแล้ว 2026-06-11 (improve-system รอบ 1) — enum: `submitted|passed|near-miss|rejected|redundant`, metrics bucket อัตโนมัติ, find-alphas บังคับที่ write-time
- [ ] F: ให้ metrics.js คำนวณ token/sim cost ต่อรอบ ถ้ามี log
- [x] E: metrics.js นับ `_note` row เป็น "1 รออนุมัติ" — ✅ แก้แล้ว 2026-06-12 (improve-system รอบ 5)
- [ ] C: พิจารณา auto-retry `get_self_correlation` ใน server layer ด้วย (ตอนนี้แก้ที่ client แล้ว)

## improve-system รอบ 4 (2026-06-12 — หลังรอบ 33 submit P01xQodW + รอบ 34 ปิด axis)

| วันที่ | มิติ | อาการ | fix | ไฟล์ที่แตะ | restart? | ผลที่คาด/วัดได้ |
|--------|------|-------|-----|-----------|----------|------------------|
| 2026-06-12 | D | post-submit state update 7 จุดอาศัย "จำได้เอง" — เคย desync 2 ครั้ง (XgK9528a, O096kVaY) changelog รอบ 3 สั่งว่าครั้งที่ 3 ให้แก้ถาวร | เขียน checklist a-g ลง review-candidates step 7 (queue→submitted, pool, registry verdict, backlog status, passed-alphas, lessons/maps) | `.claude/skills/review-candidates/SKILL.md` | ไม่ต้อง | xfile-sync ไม่หลุดอีกแม้เปลี่ยน session |
| 2026-06-12 | E | lessons §0 stale: "Submitted จริง 4 ตัว" ทั้งที่จริง 6 (รายละเอียดกระจาย 3 bullet) | consolidate เป็น list 6 ตัวแบบย่อ ชี้ submitted-pool/passed-alphas | `knowledge/lessons-learned.md` §0 | ไม่ต้อง | บรรทัดลด 92→90 ทั้งที่เพิ่มกฎใหม่ |
| 2026-06-12 | E | submitted-pool header stale ("9 ACTIVE, 2026-06-10" จริง 15) + warning เก่า "ไม่เคย submit สำเร็จ" ขัดความจริงปัจจุบัน (อาจทำ session ใหม่สับสน) | refresh header 15 ACTIVE + ลด warning เป็น "หมายเหตุประวัติ — แก้แล้วรอบ 27" | `knowledge/submitted-pool.md` | ไม่ต้อง | session ใหม่อ่านแล้วไม่เข้าใจผิด |
| 2026-06-12 | A/E | "proxy-verdict audit" (ที่ให้ niche #6) เป็น ad-hoc — ไม่มี shortlist ว่า dataset ไหน probe จริง/ผ่าน proxy | เพิ่ม §VERDICT-PROVENANCE AUDIT ใน dataset-map (✅ probe จริง 13 dataset / ⚠️ proxy: news12, sentiment1/socialmedia, model77-177) + refresh แผนรอบถัดไป | `knowledge/dataset-map.md` | ไม่ต้อง | รอบขุดหน้าเริ่มจาก shortlist ไม่ต้อง audit ใหม่ |
| 2026-06-12 | D/E | accepted-flags review condition stale (อ้าง fundamental7 ที่ปิดรอบ 30) — pattern เดียวกับที่เคยทำวินิจฉัยหลงทาง | refresh reason+review ทั้ง 3 key อิงสถานะรอบ 34 (ทุก axis ปิด, default OS-monitor) | `.claude/skills/improve-system/accepted-flags.json` | ไม่ต้อง | flag triage รอบหน้าอ้างเงื่อนไขจริง |
| 2026-06-12 | C(เครื่องมือ) | bash heredoc หลายไฟล์+เนื้อหาไทย/quote พัง 1 ครั้ง (เสีย cycle), python3 = MS-Store stub, PS-ผ่าน-bash โดน $-strip | one-liner ลง lessons §4: Write→cat append, node -e สำหรับ in-place JSONL | `knowledge/lessons-learned.md` §4 | ไม่ต้อง | ไม่เสีย cycle ซ้ำกับ tooling เดิม |

**VERIFY:** metrics ก่อน=หลัง: ACTIONABLE 0→0, ไม่มี flag ใหม่, integrity 6=6 คงเดิม, lessons 92→90 ✅

## improve-system รอบ 5 (2026-06-12 — หลัง goal-mode submit ครบ 10)

| วันที่ | มิติ | อาการ | fix | ไฟล์ที่แตะ | restart? | ผลที่คาด/วัดได้ |
|--------|------|-------|-----|-----------|----------|------------------|
| 2026-06-12 | E/F | metrics นับ `_note` row เป็น "1 รออนุมัติ" ทั้งที่คิวว่าง (backlog item รอบ 4) — เสี่ยง session ใหม่เปิด review โดยไม่มีของ | filter `r._note` ออกจาก queue count | `metrics.js` | ไม่ (script local) | [3] โชว์ 0 ถูกต้อง ✅ |
| 2026-06-12 | E/F | "[4] 37 รอบ parse ได้ 1" สื่อว่า parser พัง — จริงๆ คือ scan-until-nonzero by design แต่ข้อความหลอก (เพิ่งเด่นชัดเพราะ goal-mode 5 รอบ/วัน) | เขียนข้อความใหม่ให้ตรง logic + นับ skipped แยก | `metrics.js` | ไม่ | [4] อ่านเข้าใจถูก ไม่มี false alarm |
| 2026-06-12 | A/E | ขา ≥0.6 ที่ unbooked ~9 ตัวกระจายใน registry notes — รอบหน้าต้อง grep หาเอง | เพิ่ม **§🏦 LEG-BANK** ใน mechanism-map (ตาราง Sharpe/sub-ratio/returns/ข้อควรระวัง + วิธีใช้) | `knowledge/mechanism-map.md` | ไม่ | เจอ core ใหม่ → composite ได้ใน 1-2 sims |
| 2026-06-12 | E | submitted-pool main table มีแค่ 7/10 (ตัว 8-10 อยู่ section แยก — เสี่ยง session ใหม่ scan corr ไม่ครบ) | เพิ่มแถว kqKv0bZg/j2go6pmO/vRmZZalG เข้า main table | `knowledge/submitted-pool.md` | ไม่ | Stage 2 corr screen เห็นครบ 10 ใน table เดียว |
| 2026-06-12 | C(เครื่องมือ)/E | quirks จาก goal-mode ยังไม่อยู่ใน lessons: ts_regression positional พัง, get_data_fields ≥3 พร้อมกัน = 429, GPA-additive-absorption (4 เคส) | one-liners ลง lessons §4 | `knowledge/lessons-learned.md` §4 | ไม่ | ไม่เสีย cycle ซ้ำ |

**VERIFY:** metrics หลังแก้: ACTIONABLE 0→0, integrity 10=10, queue 1→0 (จริง), [4] ข้อความตรง — ไม่มี flag ใหม่จาก fix

## improve-system รอบ 6 (2026-06-12 — หลัง os-monitor + IQC rules research)

| วันที่ | มิติ | อาการ | fix | ไฟล์ที่แตะ | restart? | ผลที่คาด/วัดได้ |
|--------|------|-------|-----|-----------|----------|------------------|
| 2026-06-12 | A | IQC Stage 2 leaderboard freeze ปลาย มิ.ย. 2026 ยังไม่อยู่ใน lessons §0 → session ใหม่จะ default "OS-monitor อย่างเดียว" โดยไม่รู้ว่ายังมีเวลา submit เพิ่ม | เพิ่ม ⏰ IQC freeze note ใน lessons §0: deadline ~2-3wk จาก 2026-06-12, คะแนนวัด IS metrics, mechanism ที่ยังเปิด (CGO/options/vol-of-vol), OS-fail ก่อน freeze → /find-alphas ด่วน | `knowledge/lessons-learned.md` §0 | ไม่ต้อง | session หน้าทราบ deadline + ตัดสินใจได้ถูกว่าควร monitor หรือ find-alphas |
| 2026-06-12 | E | "Submitted จริง 6 ตัว" (lessons §0) stale — จริงคือ 10, รายการนับแค่ถึง #6 | อัปเดตเป็น "10 ตัว" + เพิ่ม #7-10 ในรายการ | `knowledge/lessons-learned.md` §0 | ไม่ต้อง | session ใหม่เห็น pool ครบ 10 ไม่นับซ้ำ |
| 2026-06-12 | E | "residual momentum (ts_regression ยังไม่ test)" อยู่ใน leads ค้าง ขัดกับ goal-mode section ที่ระบุว่าทดสอบแล้ว −0.14 ถาวร (รอบ 37) | ลบออกจาก leads ค้าง + เพิ่ม note ปิด | `knowledge/lessons-learned.md` §0 | ไม่ต้อง | ไม่เสีย sim กับ residual-momentum ซ้ำ |
| 2026-06-12 | E | mechanism-map residual-momentum ยังเป็น 🟠 (ค้าง) ทั้งที่ทดสอบ −0.14 ถาวรใน goal-mode | เปลี่ยนเป็น 🟡 + บันทึกหลักฐาน | `knowledge/mechanism-map.md` | ไม่ต้อง | map ตรงกับ lessons; scan ครั้งหน้าไม่ต้อง re-test |

**VERIFY:** ACTIONABLE 0→0, lessons 97→98, ไม่มี flag ใหม่จาก fix ✅

## improve-system รอบ 7 (2026-06-13 — หลังรอบ 44-49: submit 3 ตัว + ปิดทุก axis ด้วย direct evidence)

| วันที่ | มิติ | อาการ | fix | ไฟล์ที่แตะ | restart? | ผลที่คาด/วัดได้ |
|--------|------|-------|-----|-----------|----------|------------------|
| 2026-06-13 | E | **LEG-BANK stale หนัก** — torpedo ขึ้นว่า "ว่าง" ทั้งที่จองใน d5Qz7erx, ΔR&D/OL/GPq ขึ้น "queued" ทั้งที่ submit แล้ว, ไม่มีขาใหม่รอบ 47-49 (UTB/contrarian-social/EPS-trend) — เสี่ยง composite รอบหน้าชนกันเอง | refresh ทั้งตาราง: mark ❌ จองแล้ว 4 ขา, เพิ่ม contrarian-social 0.92 (+opinion-class warning), UTB 0.79 (sub-helper 3 หลักฐาน), EPS-trend 0.81 (absorption), netrec เพิ่ม caveat j2go6pmO | `knowledge/mechanism-map.md` §LEG-BANK | ไม่ต้อง | รอบขุดหน้าหยิบขาไม่ชนของจอง |
| 2026-06-13 | A/F | os-monitor ไม่รู้จัก CONDITIONAL bench — ถ้า OS-fail ใน session อื่นจะแนะนำ /find-alphas ทั้งที่มีของพร้อม 3 ตัวเรียงแล้ว (ทุกอย่างเป็น event-driven แล้ว นี่คือ path สำคัญสุด) | เพิ่มข้อ 4 hook: j2go6pmO FAIL → bench npWqOj3a→omYGW56l→YPAEbvGW (+คำเตือนชนกันเอง, เคส pool-removal ใช้ j2gGnbMo) + แก้สรุปข้อ 5 ให้เช็ค bench ก่อน | `.claude/skills/os-monitor/SKILL.md` | ไม่ต้อง | OS-fail → submit จาก bench ใน 1 ขั้น ไม่เสียรอบขุด |
| 2026-06-13 | B | researcher ไม่มี shell → รอบ 45 เผา ~30 tool calls หาวิธี append + รอบ 47 เสนอ family ที่เพิ่งปิด (GM-stability) และ composite ใช้ขา queued (OL) | formalize SIDE-CAR PROTOCOL (Write ไฟล์ r<รอบ>-new-ideas.jsonl เท่านั้น) + บังคับ prompt แนบ 3 อย่าง (จองรวมขา composite / ขาใน queue / closures ล่าสุดจาก lessons §0) ใน find-alphas step 1 | `.claude/skills/find-alphas/SKILL.md` | ไม่ต้อง | researcher ไม่วน workaround; ไม่เสนอของชนที่เพิ่งปิด |
| 2026-06-13 | D/E | accepted-flags reasons stale (อ้างรอบ 33-34 / "ตัวที่ 6") — pattern ที่เคยทำวินิจฉัยหลงทาง | refresh ทั้ง 3 key อิงหลักฐานรอบ 49 (direct-evidence 100%, j2go6pmO block 3, pool 12) + review conditions ชี้ bench/tier | `accepted-flags.json` | ไม่ต้อง | flag triage รอบหน้าอ้างสถานะจริง |
| 2026-06-13 | C(เครื่องมือ)/E | quirks ใหม่ไม่อยู่ใน lessons: get_data_fields limit>50=400, sim-hang ไม่จำกัด kth_element, orchestrator scan field ตรงเร็วกว่า translator | one-liners ลง lessons §4 + แก้ SIM WATCHDOG wording ใน find-alphas | `knowledge/lessons-learned.md` §4, `find-alphas/SKILL.md` | ไม่ต้อง | ไม่เสีย cycle ซ้ำ |

**VERIFY:** metrics ก่อน=หลัง: ACTIONABLE 0→0, ไม่มี flag ใหม่จาก fix, integrity 12=12 คงเดิม, lessons 114 บรรทัด (เพดาน 200), accepted-flags โชว์เหตุผลใหม่ ✅ · dry-run: (1) OS-fail j2go6pmO → os-monitor ชี้ bench แทนขุด ✓ (2) researcher spawn → ได้ side-car + 3 แนบ ✓ (3) composite รอบหน้าอ่าน LEG-BANK → เห็น ❌ จอง 4 ขา ✓

## improve-system รอบ 6 (2026-06-13 — หลัง goal6 submit 7 ตัว #20-26 + breakthrough #10)
| วันที่ | มิติ | อาการ | fix | ไฟล์ที่แตะ | restart? | ผลที่คาด/วัดได้ |
|--------|------|-------|-----|-----------|----------|------------------|
| 2026-06-13 | A | orchestrator สรุป "ตัน จบที่ 3" เร็วเกินไป (ครั้งที่ 10) — กว่าจะเจอ cross-data-type interpolation ที่ให้อีก 4 ตัว = เกือบพลาดเป้า. ไม่มี guard บังคับลอง interpolation ก่อนสรุปตัน | เพิ่ม **ANTI-PREMATURE-EXHAUSTION checklist** (interpolation route + mechanism-map + tier-recheck ครบ 3 ค่อยสรุปตัน) + interpolation เป็น "ทางที่ยังเปิด" ข้อ 1 ใน find-alphas Stage 0 | `.claude/skills/find-alphas/SKILL.md` | ไม่ต้อง | รอบหน้า/cron/fresh-context ลอง interpolation อัตโนมัติก่อนสรุปตัน |
| 2026-06-13 | E | breakthrough #10 (cross-data-type interpolation) อยู่แค่ §0 status (ถูก overwrite ตามเวลา) + mechanism-map — ยังไม่อยู่ §2 toolkit ถาวร | เพิ่ม recipe interpolation เป็น entry แรกใน lessons §2 (กฎ weight/10d-reversal/INDUSTRY/cluster-limit 4/ห้าม reuse-pure-core) | `knowledge/lessons-learned.md` §2 | ไม่ต้อง | เทคนิคถาวร ใช้ซ้ำได้แม้ §0 ถูกเขียนทับ |
| 2026-06-13 | B | alpha-researcher มีกฎ "หลีกเลี่ยง attractor-locked (corr สูงแน่)" — แต่ breakthrough #10 ทำให้ strong attractor-locked fundamental ใช้ได้แล้ว (เป็น interpolation-core) → agent กำลังทิ้งโอกาสจริง | เพิ่ม **INTERPOLATION-CORE rule**: เสนอ fundamental แรง (≥1.3) แม้ corr 0.7-0.8 ได้ + flag เป็น interpolation-core; ห้าม reuse booked-pure core / core คล้าย cluster เดิม | `.claude/agents/alpha-researcher.md` | ไม่ต้อง | researcher ขยาย output ที่ใช้ได้จริง (ไม่ทิ้ง strong-but-locked signal) |

**สถานะ metrics รอบนี้:** DATA INTEGRITY สะอาด (submitted.jsonl=26 = registry-bucket=26 synced, ไม่มี dup/parse-error แม้ append 7 submit + ~50 sims), ACTIONABLE flags=0, lessons ~131/200, 0Q-streak=0, ROI session ~7 sims/submit (ดีกว่า lifetime 13.5). ไม่มี src fix = ไม่ต้อง /mcp reconnect

**BLOCKED ยังเหมือนเดิม:** tier ปิด (EUR/CHN/GLB sim ยืนยัน "not available"), OS ทั้ง 26 PENDING (รอ freeze ปลายมิ.ย.)

## auto-alpha post-run-1 tune (2026-06-14 — หลัง /auto-alpha 1 รันจริงครั้งแรก submit #35)
> evidence-driven จากการรัน skill จริง 1 รอบ (13 sims, 1 submit `N1OG0P5p` abnormal-capex × VWAP) — แก้จุดที่ "พาหลง" + เติมที่ขาด ให้ skill สมบูรณ์ขึ้น

| วันที่ | มิติ | อาการ (จาก run จริง) | fix | ไฟล์ที่แตะ | restart? | ผลที่คาด/วัดได้ |
|--------|------|-------|-----|-----------|----------|------------------|
| 2026-06-14 | A | **PICK VEIN เรียงผิด** — forecast-Bowley อยู่อันดับ 1 แต่ quantity ที่เหลือ (totassets/capex) อ่อน fit 0.75 → เสีย 4 sims; winner จริงมาจาก vein interpolation (อันดับ 3) | เลื่อน **INTERPOLATION เป็น vein 🥇 อันดับ 1** + ติดธง forecast-Bowley/model-factor ว่า "จอง/อ่อนแล้ว gauge ก่อน" + เรียง price-niche ตามความว่าง (VWAP ก่อน) | `auto-alpha/SKILL.md` §1 | ไม่ต้อง | run หน้าเริ่มจาก vein ที่ ROI สูงสุด ไม่เสีย sim กับ forecast-Bowley ที่อ่อน |
| 2026-06-14 | A | ขาด vein "เอา bench-core (รอ OS-fail) มา interpolate × price เลย" — concept กระจาย, ไม่มีที่บอกว่าปลดได้ทันที | เพิ่มแหล่ง core ชัด: `near-miss.md §CONDITIONAL` + attractor list → **interpolate ได้เลยไม่ต้องรอ OS-fail** (abnormal-capex พิสูจน์) | `auto-alpha/SKILL.md` §1 | ไม่ต้อง | bench cores (npWqOj3a/omYGW56l) = candidate ใช้ได้ทันที ไม่ต้องรอ attractor หลุด |
| 2026-06-14 | A | **weight-sweep บอกแค่ "2-3:1"** (ผิดทางสำหรับ attractor-core) — abnormal-capex ต้อง price-heavy 1:1 (fundamental ยิ่งมากยิ่งชน #23) | เพิ่มกฎ **WEIGHT-SWEEP DIRECTION**: orthogonal-moderate→fund-heavy 2-3:1; load-attractor-เอง→price-heavy ลง 1:1; ดู corr records หา binding-constraint | `auto-alpha/SKILL.md` §1+§4 | ไม่ต้อง | sweep ถูกทิศ → ไม่ตัน corr เพราะ sweep ผิดทาง |
| 2026-06-14 | F | SUBMIT-GUARD ไม่มี margin rule — เสี่ยง submit ตัวเฉียด 0.70 (leak ตอน recompute) | เพิ่มกฎ **เลือก variant margin หนา ≥0.03** (run จริงเลือก 1:1@0.647 แทน 1.25:1@0.689) | `auto-alpha/SKILL.md` SUBMIT-GUARD #1 + §4 | ไม่ต้อง | ลดความเสี่ยง corr-leak เข้า OS (บทเรียน RRrE1VNj 0.84) |
| 2026-06-14 | C(เครื่องมือ)/F | ขาด operational: (1) get_self_correlation อ่านฟรี map ได้หลาย variant (2) verify field ด้วย sim (search จับ description) (3) gauge core ก่อน sweep | เพิ่ม 3 tips ใน §3 SIM + §4 EVALUATE (corr-read ฟรี→map curve→submit 1; field error เร็ว; price-ขี่-Sharpe=core อ่อน pivot) | `auto-alpha/SKILL.md` §3+§4 | ไม่ต้อง | run หน้า map corr คุ้มขึ้น + ไม่เสีย sim กับ core อ่อน/field ปลอม |

## improve-system รอบ 7 (2026-06-14 — หลัง /auto-alpha10 submit 10/10; false-exhaustion ครั้งที่ 11)
> evidence: /auto-alpha10 ประกาศ "ตัน 5/10 + halt loop" 3 turns (เสีย ~40 sims พิสูจน์ตัน delay0/TOP500/vector_neut/options) ก่อน **ts_rank ปลด 5/10→10/10**. metrics สะอาด (integrity 45==45, dup 0, ACTIONABLE flag 0) → ปัญหาเป็น **STRATEGY/KNOWLEDGE gap ไม่ใช่ bug**

| วันที่ | มิติ | อาการ | fix | ไฟล์ที่แตะ | restart? | ผลที่คาด/วัดได้ |
|--------|------|-------|-----|-----------|----------|------------------|
| 2026-06-14 | A | **ANTI-PREMATURE-EXHAUSTION checklist ขาดมิติ construction-axis** — มีแค่ interpolation/mechanism-map/tier → สรุปตันผิดครั้งที่ 11 (ลืม ts_rank) | ขยาย checklist เป็น **4 AXIS** (เพิ่ม construction group_rank↔ts_rank↔ts_zscore↔ts_av_diff) ทั้ง 2 skill | `auto-alpha/SKILL.md` §7, `find-alphas/SKILL.md` Stage 0 | ไม่ต้อง | run หน้าลอง ts_rank ก่อนสรุปตัน → ไม่เสีย ~40 sims พิสูจน์ตันผิด |
| 2026-06-14 | A | ts_rank vein ไม่อยู่ใน PICK VEIN (เพิ่งค้นพบ breakthrough #11) | เพิ่ม **🥈 CONSTRUCTION-AXIS multiplier callout** ใน PICK VEIN | `auto-alpha/SKILL.md` §1 | ไม่ต้อง | ts_rank = first-class vein discoverable |
| 2026-06-14 | E | ts_rank อยู่แค่ §0 (ถูกเขียนทับตามเวลา) | เพิ่ม ts_rank entry ใน **lessons §2 (toolkit ถาวร)** | `lessons-learned.md` §2 | ไม่ต้อง | เทคนิคถาวร compound ข้าม session |
| 2026-06-14 | E | memory `max-lottery` (theme=อย่าด่วนสรุปตัน) ไม่มี breakthrough #11 | เพิ่ม breakthrough #11 + META-RULE 4-axis + แก้ "delay0 closed" | memory `max-lottery-breakthrough.md` + `MEMORY.md` | ไม่ต้อง | session ใหม่รู้ ts_rank + 4-axis ตั้งแต่ต้น |

**VERIFY:** integrity 45==45 คงเดิม · ACTIONABLE flag 0 · lessons 139→~142 (เพดาน 200) · ไม่แตะ src = ไม่ต้อง reconnect · dry-run: ก่อนสรุปตัน checklist บังคับลอง `ts_rank(<fund>)` = ตรงกับที่ปลด 5/10→10/10 · BLOCKED เดิม: tier USA-only, OS ทั้ง 45 PENDING

## auto-alpha vein-restructure (2026-06-14 — หลัง /auto-alpha10 10/10, จัด PICK VEIN ตาม ROI จริง)
> evidence: 2 run จริง (#35 + #36-45, ~165 sims). PICK VEIN เดิม ts_rank เป็นแค่ callout + Δ-trajectory ไม่อยู่เลย ทั้งที่ให้ 5+3 ตัว — vein order ไม่ตรง ROI

| วันที่ | มิติ | อาการ | fix | ไฟล์ | restart? | ผล |
|--------|------|-------|-----|------|----------|-----|
| 2026-06-14 | A | PICK VEIN เรียงผิด ROI — ts_rank(5 ตัว)=callout, Δ-trajectory(3 ตัว)=ไม่มีเลย, model-factor/forecast-Bowley(อ่อน/จอง)=อันดับ 2-3 | restructure 5 vein ตาม ROI: interpolation→ts_rank→Δ-trajectory→Bowley/factor(demote)→axis | `auto-alpha/SKILL.md` §1 | ไม่ต้อง | run หน้าลอง vein ที่ให้ผลจริงก่อน |
| 2026-06-14 | A | WEIGHT-SWEEP มีแค่กฎ corr-dodge — ขาดกฎ sub-rescue | เพิ่มกฎ sub-rescue (standalone sub<0.43×Sharpe → price-heavy 0.75-1:1 กู้ sub: ACI 0.06→1.07) | §1 | ไม่ต้อง | weak-sub/delta core ไม่ถูกทิ้งผิด |
| 2026-06-14 | A/F | เสีย ~40 sims พิสูจน์ axis ปิด (tier/delay0/TOP500/vector_neut/options) | เพิ่ม **DON'T-BOTHER list** + dimension-tracking principle (track dim ไม่ใช่แค่ niche) | §1 | ไม่ต้อง | ไม่เสีย sim ซ้ำกับ axis ปิด |
| 2026-06-14 | B | GENERATE ไม่มี researcher background-batch pattern | เพิ่ม `run_in_background` + multi-batch + dim-targeting + read-cores-file workflow | §2 | ไม่ต้อง | หา core ต่อได้ไม่ idle (auto-alpha10: 3 batch→4 wins) |
| 2026-06-14 | F | margin rule เข้มไป (≥0.03) ไม่ตรง reality pool อิ่ม | เพิ่ม nuance: ยอม thin 0.01-0.02 ถ้า dim ใหม่จริง+ดีสุดที่ sweep (#44/#45 ที่ 0.018/0.011) | §4 | ไม่ต้อง | ไม่ทิ้ง candidate สะอาดที่ margin บางเพราะ pool อิ่ม |

**VERIFY:** frontmatter parse ได้ (skill ยังอยู่ใน available-skills) · ไม่แตะ src · skill อ่านลื่น coherent · dry-run: PICK VEIN เห็น ts_rank/Δ-trajectory vein 2-3 + DON'T-BOTHER กัน sim เสีย

## auto-alpha post-/auto-alpha5 tune (2026-06-14 — หลัง submit 5/5 #46-50 ทั้งหมด ts_rank)
> evidence: /auto-alpha5 (~50 sims, 5 ts_rank submits จาก fresh dim) เผย 2 จุด skill ผิด/เก่า + 2 nuance ใหม่

| วันที่ | มิติ | อาการ | fix | ไฟล์ | restart? | ผล |
|--------|------|-------|-----|------|----------|-----|
| 2026-06-14 | A | ts_rank vein claim ผิด **"1 fund→หลาย alpha ผ่าน window"** — /auto-alpha5 พิสูจน์ window 504 ชน 252-version 0.83 (ไม่หลุด) | แก้เป็น **"DIFFERENTIATION มาจาก CONSTRUCTION ไม่ใช่ window; 1 fund×1 construction=1 alpha"** + group_rank↔ts_rank ของ fund เดียวกัน orthogonal ได้ (deferred-rev 0.52) | `auto-alpha/SKILL.md` §1 vein-2 | ไม่ต้อง | ไม่เสีย sim กับ window-variant ของ fund ที่ submit แล้ว |
| 2026-06-14 | A | ts_rank "strong dim=profitability/investment/NOA" เก่า — ตอนนี้จองอิ่ม ชน 0.74-0.92 | อัปเดต: investment/profitability/NOA=BOOKED; **fresh ที่หลุด=structural/quality/equity-issuance/demand/growth (0.52-0.69)** + heuristic non-investment-non-profitability | §1 vein-2 + dim-note | ไม่ต้อง | ขุด fresh dim ที่ยังหลุด ไม่เสีย sim กับ dim จอง |
| 2026-06-14 | A | ขาด niche-switch rule (binding-type→action) | เพิ่มกฎ: binding=**PRICE-cluster→ย้าย niche** (sales-growth 0.74→0.69); binding=**same-DIM fundamental→pivot dim** | §1 WEIGHT-SWEEP | ไม่ต้อง | แก้ near-miss 0.70-0.74 ถูกวิธี |
| 2026-06-14 | B | GENERATE researcher prompt ชี้ขอ profitability/investment (จองอิ่ม) | แก้เป็นขอ **STRUCTURAL/quality/equity-issuance/demand/governance** (non-inv-non-profit) | §2 | ไม่ต้อง | researcher เสนอ dim ที่ยังหลุดจริง |

**VERIFY:** frontmatter parse ได้ · ไม่แตะ src · dim-tracking note มี booked/fresh lists + construction nuance · dry-run: run หน้าเริ่ม ts_rank fresh-dim + niche-switch ถูกทิศ = ตรงเส้นทาง /auto-alpha5 ที่ได้ 5/5

**VERIFY:** integrity คงเดิม submitted.jsonl=35 = registry-bucket=35 (ไม่มี dup), skill frontmatter parse ได้ (อยู่ใน available-skills). ไม่มี src fix = ไม่ต้อง /mcp reconnect. dry-run: run หน้าจะ (1) เริ่ม interpolation+bench-core ก่อน (2) sweep ถูกทิศตาม core type (3) เลือก margin หนา — ตรงกับเส้นทางที่ทำให้ run #1 สำเร็จ
