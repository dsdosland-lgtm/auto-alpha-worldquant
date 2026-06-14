# Run Report — 2026-06-12 รอบ 35

queued: 0

## สรุป
- ค้นพบ **field class ใหม่: short interest** (mdl77/mdl177 — ไม่เคยอยู่ใน map) ผ่านวิธี search ข้าม dataset
- ผล: **near-miss ใหญ่ `qMXObw9j` 2×DTC−Δmonthly-SIP = Sharpe 1.24 (ขาด 0.01!) fitness 0.94 sub-univ 1.11** — ลองครบ 8 variant ไม่ทะลุ
- ⚠️ DTC ทิศกลับ literature (long high-DTC ชนะ) + มี volume denominator = corr-risk vs turnover-niche (ยังไม่เช็ค corr เพราะยังไม่ผ่าน IS)
- sims: 13 · near-miss: 5 · rejected: 8 · queued: 0
- mechanism-map เพิ่มแถว short-interest positioning 🟠 (เงื่อนไขกลับมา: ขาที่ 3 / OS-fail turnover-niche)
