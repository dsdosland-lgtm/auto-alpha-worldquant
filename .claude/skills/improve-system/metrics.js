#!/usr/bin/env node
/**
 * metrics.js — health snapshot ของระบบหา alpha (อ่านอย่างเดียว ยกเว้นเขียน .last-snapshot.json)
 * รันจาก root: node .claude/skills/improve-system/metrics.js
 * ใช้ใน improve-system Stage 0 (snapshot) + Stage 4 (เทียบก่อน-หลัง)
 *
 * v2 (improve-system รอบ 2): + data-integrity, + keyed flags + accepted-flags (กัน cry-wolf),
 *   + snapshot delta (regression detection). flag มี stable `key` เพื่อ track ข้ามรอบ
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..", "..");
const P = (...a) => path.join(ROOT, ...a);
const SKILL = (...a) => path.join(__dirname, ...a);
const SNAP_FILE = SKILL(".last-snapshot.json");
const ACCEPTED_FILE = SKILL("accepted-flags.json");

function readText(rel) { try { return fs.readFileSync(P(rel), "utf8"); } catch { return null; } }
function readLines(rel) { const t = readText(rel); return t === null ? null : t.split(/\r?\n/).filter((l) => l.trim()); }
// readJsonl: คืน rows + parseErrors (ไม่กลืน error เงียบ — v1 bug)
function readJsonl(rel) {
  const lines = readLines(rel);
  if (lines === null) return null;
  const rows = []; let parseErrors = 0;
  for (const l of lines) { try { rows.push(JSON.parse(l)); } catch { parseErrors++; } }
  return { rows, parseErrors, count: lines.length };
}
function tally(rows, key) { const t = {}; for (const r of rows) { const v = r?.[key] ?? "(none)"; t[v] = (t[v] || 0) + 1; } return t; }
function pct(n, d) { return d ? Math.round((100 * n) / d) : 0; }

const CANON = ["submitted", "passed", "near-miss", "rejected", "redundant"];
function bucketOf(vd) {
  const s = String(vd ?? "").toLowerCase();
  if (CANON.includes(s)) return s;
  if (s.includes("submit")) return "submitted";
  if (s.includes("redundant") || s.includes("fail-corr") || /corr-?0?\.?\d/.test(s)) return "redundant";
  if (s.includes("near")) return "near-miss";
  if (s.includes("pass")) return "passed";
  if (s.includes("flat") || s.includes("reject") || s.includes("concentrated") || s.includes("infeasible")) return "rejected";
  return "other";
}

const out = []; const log = (s) => out.push(s);
const flags = []; // {key, sev(1-3), msg}
const addFlag = (key, sev, msg) => flags.push({ key, sev, msg });
const M = {}; // numeric metrics สำหรับ snapshot

log("══════════════════════════════════════════════");
log(" SYSTEM HEALTH SNAPSHOT — alpha factory (v2)");
log("══════════════════════════════════════════════");

// ── [0] DATA INTEGRITY (ใหม่ v2) ──────────────────
log(`\n[0] DATA INTEGRITY`);
const FILES = ["data/tried-registry.jsonl", "data/idea-backlog.jsonl", "data/submit-queue.jsonl", "data/submitted.jsonl"];
const jsonl = {};
for (const f of FILES) {
  const r = readJsonl(f);
  jsonl[f] = r;
  if (r === null) { log(`    ${path.basename(f)}: — (ไม่มี)`); continue; }
  log(`    ${path.basename(f)}: ${r.rows.length} rows${r.parseErrors ? ` ⚠️ ${r.parseErrors} บรรทัดเสีย` : ""}`);
  if (r.parseErrors > 0) addFlag(`DATA_PARSE_${path.basename(f)}`, 1, `${path.basename(f)}: ${r.parseErrors} บรรทัด JSON เสีย — data หายแบบเงียบ ต้องซ่อม`);
}
// duplicate alpha_id ใน registry
const reg = jsonl["data/tried-registry.jsonl"]?.rows;
if (reg) {
  const ids = {}; for (const r of reg) if (r.alpha_id) ids[r.alpha_id] = (ids[r.alpha_id] || 0) + 1;
  const dups = Object.entries(ids).filter(([, n]) => n > 1).map(([k]) => k);
  if (dups.length) { log(`    registry dup alpha_id: ${dups.length} (${dups.slice(0, 3).join(", ")}${dups.length > 3 ? "..." : ""})`); addFlag("DATA_DUP_ID", 3, `registry มี alpha_id ซ้ำ ${dups.length} ตัว — meta-analysis อาจนับเกิน`); }
  else log(`    registry dup alpha_id: ไม่มี ✅`);
}
// cross-file: submitted.jsonl vs registry submitted bucket
const subFile = jsonl["data/submitted.jsonl"]?.rows;
if (reg && subFile) {
  const regSub = reg.filter((r) => bucketOf(r.verdict) === "submitted").length;
  log(`    submitted: submitted.jsonl=${subFile.length} | registry-bucket=${regSub}`);
  if (subFile.length !== regSub) addFlag("DATA_XFILE_SUBMITTED", 2, `submitted.jsonl (${subFile.length}) ≠ registry submitted bucket (${regSub}) — ไฟล์ไม่ sync; registry อาจ log ไม่ครบทุก submit`);
}

// ── [1] SIM ROI ───────────────────────────────────
if (reg) {
  const total = reg.length;
  const b = {}; let nonCanon = 0;
  for (const r of reg) { b[bucketOf(r.verdict)] = (b[bucketOf(r.verdict)] || 0) + 1; if (!CANON.includes(String(r.verdict))) nonCanon++; }
  M.totalSims = total; M.rejectedPct = pct(b.rejected || 0, total); M.redundantPct = pct(b.redundant || 0, total);
  M.nearMissPct = pct(b["near-miss"] || 0, total); M.passedPct = pct(b.passed || 0, total); M.submittedReg = b.submitted || 0;
  log(`\n[1] SIM ROI (tried-registry: ${total} sims)`);
  log(`    buckets: ${JSON.stringify(b)}`);
  log(`    rejected ${M.rejectedPct}% | redundant ${M.redundantPct}% | near-miss ${M.nearMissPct}% | passed ${M.passedPct}% | submitted ${pct(b.submitted || 0, total)}%`);
  log(`    dataset coverage: ${Object.keys(tally(reg, "dataset")).length} datasets`);
  if (M.redundantPct >= 15) addFlag("ROI_REDUNDANT", 2, `redundant rate ${M.redundantPct}% สูง — agent อาจเสนอ variant base เดิม (เช็ค decision tree: agent-bug?)`);
  if (M.rejectedPct >= 60) addFlag("ROI_REJECTED", 2, `rejected rate ${M.rejectedPct}% สูง — อาจขุด space ที่ตัน (เช็ค decision tree: market-reality?)`);
  if (nonCanon > 0) addFlag("HYGIENE_VERDICT", 2, `${nonCanon} entries verdict นอก enum — normalize ให้สถิติแม่น`);
  if ((b.other || 0) > 0) addFlag("HYGIENE_BUCKET_OTHER", 2, `${b.other} entries verdict bucket ไม่ได้ — เพิ่ม mapping ใน bucketOf()`);
}

// ── [2] BACKLOG ──────────────────────────────────
const backlog = jsonl["data/idea-backlog.jsonl"]?.rows;
if (backlog) {
  const s = tally(backlog, "status");
  M.backlogNew = s.new || 0;
  log(`\n[2] BACKLOG (${backlog.length} ideas)`);
  log(`    status: ${JSON.stringify(s)}`);
  log(`    'new' (รอ sim): ${M.backlogNew}  |  categories: ${Object.keys(tally(backlog, "category")).length}`);
  if (M.backlogNew === 0) addFlag("BACKLOG_EMPTY", 2, "ไม่มี idea 'new' — research เติม หรือ space ตัน (เช็ค decision tree)");
}

// ── [3] PIPELINE OUTPUT ──────────────────────────
const queueRaw = jsonl["data/submit-queue.jsonl"]?.rows;
const queue = queueRaw ? queueRaw.filter((r) => !r._note) : queueRaw; // _note = บรรทัด log ไม่ใช่ candidate
log(`\n[3] PIPELINE OUTPUT`);
log(`    submit-queue: ${queue ? queue.length : "—"} รออนุมัติ  |  submitted.jsonl: ${subFile ? subFile.length : "—"} ส่งแล้ว`);
if (reg && subFile?.length) log(`    sims/submitted ≈ ${(reg.length / subFile.length).toFixed(1)} (รวม tuning variant — ดูเป็น trend ไม่ใช่ค่าสัมบูรณ์)`);

// ── [4] RUN REPORTS — 0-queued streak ────────────
try {
  const dir = P("data", "runs");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();
  const queuedOf = (txt) => { for (const re of [/ผ่านคิว[:\s*]*?(\d+)/, /(\d+)\s*ตัวเข้าคิว/, /queued[:\s*]*?(\d+)/i]) { const m = txt.match(re); if (m) return Number(m[1]); } return null; };
  let streak = 0, parsedOk = 0, skippedBeforeStop = 0;
  for (let i = files.length - 1; i >= 0; i--) {
    const q = queuedOf(fs.readFileSync(path.join(dir, files[i]), "utf8"));
    if (q === null) { skippedBeforeStop++; continue; } // ข้าม report ที่ parse ไม่ได้ (ไม่ break — กัน streak เพี้ยนเพราะชื่อไฟล์)
    parsedOk++;
    if (q === 0) streak++; else break; // เจอรอบที่ queued>0 = จบ streak (สแกนใหม่→เก่าแค่ถึงจุดนี้ — by design)
  }
  M.streak = streak;
  log(`\n[4] RUN REPORTS (${files.length} รอบ — สแกนใหม่→เก่า หยุดที่รอบแรกที่ queued>0; อ่านไป ${parsedOk + skippedBeforeStop} ไฟล์)`);
  log(`    ล่าสุด: ${files.slice(-3).join(", ") || "—"}`);
  log(`    0-queued streak: ${streak}${skippedBeforeStop > 0 ? ` (ข้าม ${skippedBeforeStop} ไฟล์ที่ไม่มี machine-readable 'queued: N' ระหว่างสแกน)` : ""}`);
  if (streak >= 3) addFlag("STREAK_ZERO", 2, `0-queued ${streak} รอบติด — diagnose market-reality (redirect) vs agent-bug (เสนอซ้ำ)`);
} catch { log("\n[4] data/runs/ ไม่พบ"); }

// ── [5] KNOWLEDGE HYGIENE ────────────────────────
log(`\n[5] KNOWLEDGE HYGIENE`);
const lessons = readLines("knowledge/lessons-learned.md");
if (lessons) { M.lessonsLines = lessons.length; log(`    lessons-learned.md: ${lessons.length} บรรทัด (เพดาน ~200)`); if (lessons.length > 200) addFlag("HYGIENE_LESSONS_BLOAT", 2, `lessons-learned ${lessons.length} > 200 — ย้ายลง archive`); }
for (const f of ["knowledge/mechanism-map.md", "knowledge/dataset-map.md", "knowledge/submitted-pool.md", "knowledge/system-changelog.md"]) {
  const ok = !!readLines(f); log(`    ${path.basename(f)}: ${ok ? "มี" : "ไม่มี"}`);
  if (!ok && f.includes("system-changelog")) addFlag("HYGIENE_NO_CHANGELOG", 1, "ไม่มี system-changelog.md — สร้างเพื่อ track การแก้ระบบ");
}

// ── SNAPSHOT DELTA (regression detection, ใหม่ v2) ─
let prev = null;
try { prev = JSON.parse(fs.readFileSync(SNAP_FILE, "utf8")); } catch { /* รอบแรก */ }
log(`\n══════════════════════════════════════════════`);
log(` Δ เทียบรอบก่อน${prev?.date ? ` (${prev.date})` : " (ไม่มี snapshot ก่อน)"}`);
log("══════════════════════════════════════════════");
if (prev?.M) {
  const watch = [["totalSims", "sims"], ["rejectedPct", "rejected%"], ["redundantPct", "redundant%"], ["backlogNew", "backlog-new"], ["lessonsLines", "lessons-บรรทัด"], ["streak", "0Q-streak"]];
  for (const [k, label] of watch) {
    if (typeof M[k] === "number" && typeof prev.M[k] === "number" && M[k] !== prev.M[k]) {
      const d = M[k] - prev.M[k]; const arrow = d > 0 ? "▲" : "▼";
      log(`    ${label}: ${prev.M[k]} → ${M[k]} (${arrow}${Math.abs(d)})`);
      if (k === "lessonsLines" && M[k] > 200 && prev.M[k] <= 200) addFlag("REGRESSION_LESSONS", 2, "lessons เพิ่งทะลุ 200 บรรทัด");
      if (k === "redundantPct" && d >= 5) addFlag("REGRESSION_REDUNDANT", 2, `redundant rate ไต่ขึ้น +${d}% — agent เริ่มเสนอ variant ซ้ำ?`);
    }
  }
  // flag ที่ใหม่/หายไป
  const prevKeys = new Set(prev.flagKeys || []); const nowKeys = new Set(flags.map((f) => f.key));
  const newK = [...nowKeys].filter((k) => !prevKeys.has(k));
  const goneK = [...prevKeys].filter((k) => !nowKeys.has(k));
  if (newK.length) log(`    🆕 flag ใหม่: ${newK.join(", ")}`);
  if (goneK.length) log(`    ✅ flag หายไป (แก้แล้ว/ดีขึ้น): ${goneK.join(", ")}`);
  if (!newK.length && !goneK.length) log(`    (ชุด flag เหมือนรอบก่อน)`);
} else log(`    — รอบแรกที่มี snapshot, รอบหน้าจะเทียบ delta ได้`);

// ── FLAGS: แยก ACTIONABLE จาก ACCEPTED (กัน cry-wolf) ─
let accepted = [];
try { accepted = JSON.parse(fs.readFileSync(ACCEPTED_FILE, "utf8")); } catch { /* ไม่มี = ทุก flag actionable */ }
const acceptedKeys = new Set((accepted || []).map((a) => a.key));
const actionable = flags.filter((f) => !acceptedKeys.has(f.key)).sort((a, b) => a.sev - b.sev);
const known = flags.filter((f) => acceptedKeys.has(f.key));

log(`\n══════════════════════════════════════════════`);
log(` 🚩 ACTIONABLE FLAGS (${actionable.length}) — ต้อง diagnose/แก้`);
log("══════════════════════════════════════════════");
if (!actionable.length) log(" ✅ ไม่มี flag ใหม่ที่ต้องทำ (ที่เหลือ accepted แล้ว)");
else actionable.forEach((f, i) => log(` ${i + 1}. [${f.key} · sev${f.sev}] ${f.msg}`));
if (known.length) {
  log(`\n ✓ ACCEPTED (${known.length}) — market-reality ที่รับรู้แล้ว (ดู accepted-flags.json):`);
  known.forEach((f) => { const a = accepted.find((x) => x.key === f.key); log(`   · ${f.key} — ${a?.reason || "(accepted)"}`); });
}
log(`\n→ ตัวเลขนี้คือจุดเริ่ม DIAGNOSE ไม่ใช่ข้อสรุป: แยก system-bug จาก market-reality ก่อนแก้`);
log(`→ flag market-reality ที่ยืนยันแล้วว่ารับได้ → ใส่ key ลง accepted-flags.json เพื่อกัน cry-wolf รอบหน้า`);

// ── เขียน snapshot ────────────────────────────────
try {
  fs.writeFileSync(SNAP_FILE, JSON.stringify({ date: new Date().toISOString().slice(0, 16).replace("T", " "), M, flagKeys: flags.map((f) => f.key) }, null, 2));
} catch { /* เขียนไม่ได้ก็ไม่เป็นไร */ }

console.log(out.join("\n"));
