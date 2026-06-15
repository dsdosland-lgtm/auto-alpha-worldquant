# /auto-alpha6 Run Report — 2026-06-15

submitted: 1
queued: 0

## สรุป

| # | alpha_id | dim | Sharpe | Fitness | Sub | Corr | Binding | Expression |
|---|----------|-----|--------|---------|-----|------|---------|------------|
| 67 | `mLXv5rJ9` | CONSERVATISM earnings-smoothing | 2.18 | 1.31 | 1.67 | 0.6325 | zqWEWEvO | `2*group_rank(-ts_rank(ts_std_dev(income/(assets+1),756)/(ts_std_dev(cashflow_op/(assets+1),756)+0.01), 252), sector) + rank(-(close-low)/(high-low+0.001))` |

- **Settings:** USA / TOP3000 / delay1 / INDUSTRY / decay4 / trunc0.08
- **dateSubmitted:** 2026-06-15T06:07:53-04:00
- **attempts:** 1
- **Corr margin:** 0.0675 (limit 0.70, max 0.6325)

## กลไก

**Earnings-smoothing (Tucker-Zarowin 2006 informative conservatism):**
- NI-vol = `ts_std_dev(income/(assets+1), 756)` = net income volatility 3yr
- CFO-vol = `ts_std_dev(cashflow_op/(assets+1), 756)` = operating cash flow volatility 3yr
- ratio = NI-vol / CFO-vol: LOW = NI มีความผันผวนน้อยกว่า CFO → income smoothing
- ts_rank(-ratio, 252): LONG companies ที่ ratio ต่ำสุดในรอบ 1ปีเทียบกับประวัติตัวเอง
- price leg: close-range reversal `-(close-low)/(high-low)` 2:1 weight

**ทำไมหลุด pool:** NI-vol/CFO-vol เป็น 2nd-order volatility ratio ≠ accrual level ≠ special items ≠ earnings variance — fresh conservatism dim ที่ไม่มีใน pool 76 ACTIVE alphas (corr max 0.6325 vs zqWEWEvO = CFO/payout coverage VWAP)

## sims ที่ล้มเหลว

| sim_id | expr ย่อ | ผล | หมายเหตุ |
|--------|---------|-----|---------|
| FEcwsaNW | vec_avg(fnd6_mrc1) ts_rank x close-range | FAIL | lease-duration mrc MATRIX field incompatible with ts_rank context |
| 4irwLu7zB | vec_avg(mdl177_2_managementqualityfactor_chgollev) ts_rank x close-range | FAIL | change-in-OLL mdl177 MATRIX field FAIL |
| (session prev) | vec_avg(mrc1)/(vec_avg(mrct)+0.001) | FAIL | ratio of two MATRIX fails |
| (session prev) | vec_avg(mrc1)/(assets+0.001) | FAIL | MATRIX field / scalar fails |

**Verdict lease-duration:** ปิด — vec_avg(fnd6_mrcN) ทุก variant ไม่ work ใน sim context (sparse field หรือ MATRIX incompatible); supply-chain = ไม่มี field ที่ใช้ได้

## Pool หลัง submit

- ACTIVE alphas: **76** (9 ต้นฉบับ + 67 ของเรา)
- OS ยัง PENDING ไม่มี FAIL
- IQC2026S2 leaderboard freeze ประมาณ ~10-15 วัน (end of June 2026)

## dim เปิดต่อ (สำหรับ /auto-alpha7)

ต้องใช้ researcher สำรวจ dim ใหม่ เนื่องจาก open-dim ทั้ง 3 จาก mechanism-map ปิดแล้ว:
- ~~lease-duration~~ FAIL
- ~~conservatism~~ CLOSED (#67)
- ~~supply-chain~~ ไม่มี field

แนวทางต่อ:
1. **governance-quality** (board independence/institutional ownership/proxy contest — ยังไม่เคยลอง)
2. **earnings-restatement / auditor quality** (auditor size, restatement history)
3. **warranty/contingent liabilities** (ถ้ามี field)
4. **construction-axis ใหม่** (ts_av_diff บน fund ที่ work แล้ว)
5. **researcher batch** หา fresh dim จาก accounting/governance literature
