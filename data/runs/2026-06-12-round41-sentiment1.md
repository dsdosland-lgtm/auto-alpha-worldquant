# Round 41 Report — sentiment1 analyst-sentiment probe (2026-06-12)

queued: 0
near_miss: 1 (conditional)
ideas_tested: 17 sims

## สรุป
เปิดรอบหลัง goal-10-complete (bonus ก่อน leaderboard freeze ปลาย มิ.ย.). ทำตาม VERDICT-PROVENANCE AUDIT: probe `sentiment1` ด้วย low-TO group_rank toolkit ใหม่ (ไม่เคยลอง — รอบ 8 ลองแค่ buzz level).

## ผลหลัก
- 🔑 **ค้นพบ field class ใหม่: sentiment1 = analyst recommendation/price-target/dispersion/torpedo (ไม่ใช่ social buzz)** — verdict เดิม "sentiment dead" ผิด (เหมารวมกับ scl12 social)
- **3 ขาแข็งบน low-TO route:** dispersion 1.27/sub0.71, earnings-torpedo 1.15/sub0.69, netrec 1.00/sub0.63 (group_rank sector, decay10, trunc0.04)
- **composite `YPAEbvGW` ผ่าน IS ครบ** Sharpe 1.28 fit 1.09 sub 0.89 TO 0.013 — แต่ **self-corr 0.8367 vs `j2go6pmO`** (org-capital niche #9 ของเราเอง)
- ตัวบล็อก = dispersion leg collinear org-capital (Sharpe-carrier + corr-bridge พร้อมกัน). neut เปลี่ยน (SUBIND/INDUSTRY/SECTOR) ไม่ช่วย; ตัด dispersion = Sharpe ร่วง <1.25

## TIER/DATA PROBE
- USA = 20 datasets เดิม (ไม่มีใหม่)
- EUR/CHN get_datasets = no output → tier ยังปิด (สอดคล้องรอบ 27/34)

## Verdict
- 0 queued. 1 conditional near-miss (YPAEbvGW) — submit ได้ทันทีถ้า j2go6pmO OS-fail
- ขาแข็ง 3 ตัวเข้า LEG-BANK; sentiment1 verdict แก้ใน dataset-map + mechanism-map
- default รอบถัดไป = **/os-monitor** (จับตา j2go6pmO เป็นพิเศษ — OS-fail = ปลด niche #11)
