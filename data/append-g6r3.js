// Append top 5 goal6-round3 ideas to idea-backlog.jsonl
const fs = require('fs');
const path = require('path');

const backlogPath = path.join(__dirname, 'idea-backlog.jsonl');

const newEntries = [
  {
    "idea_id": "g6r3-target-price-dispersion",
    "category": "analyst-forecast",
    "hypothesis": "หุ้นที่มี analyst target price dispersion สูง (standard deviation ของ target prices ข้ามนักวิเคราะห์ สูง) สะท้อน high valuation uncertainty → returns ต่ำ; ทิศลบ — ต่างจาก EPS dispersion (dtstsespe ใน P01xQodW) เพราะ target price dispersion = direct valuation disagreement",
    "rationale": "Palley-Steffen-Zhang (2021 Management Science) พิสูจน์ว่า target price dispersion NEGATIVE predicts cross-sectional returns — NON-quality: ไม่ load j2go6pmO/d5Qz7erx เพราะเป็น analyst valuation disagreement dimension",
    "data_hint": "UNVERIFIED: target price dispersion field — อาจอยู่ใน sentiment1 หรือ analyst4 dataset (snt1_d1_targetprice_std หรือ similar); FASTEXPR: group_rank(-target_price_dispersion_field, sector) {SUBINDUSTRY decay10 trunc0.04 TOP3000} ทิศลบ; FALLBACK: group_rank(-ts_std_dev(snt1_d1_nettargetpct,63), sector) ถ้า nettargetpct เป็น rolling field — ห้ามใช้ dtstsespe (EPS dispersion ที่จองแล้ว); ต้อง verify field ด้วย get_data_fields search=target ก่อน sim",
    "status": "new",
    "source_url": "https://pubsonline.informs.org/doi/10.1287/mnsc.2021.03549"
  },
  {
    "idea_id": "g6r3-revenue-surprise-magnitude",
    "category": "analyst-forecast",
    "hypothesis": "หุ้นที่มี revenue surprise บวกขนาดใหญ่ (actual revenue beat consensus) drift ขึ้นต่อใน 20-60 วัน เพราะตลาด under-react ต่อ top-line beat; ทิศบวก — ต่างจาก EPS surprise (P01xQodW) เพราะ revenue = demand signal ที่ cost-cutting ปลอมแปลงไม่ได้",
    "rationale": "Ertimur-Livnat-Martikainen (2003) + Jegadeesh-Livnat (2006 JAE) พิสูจน์ว่า revenue surprise มี predictive power incremental กับ EPS surprise; NON-quality: demand signal ที่ไม่ load profitability attractor; ต่างจาก sales-Bowley skewness (goal6 submit) เพราะนั่น = distribution shape ของ estimates ไม่ใช่ actual beat magnitude",
    "data_hint": "UNVERIFIED: analyst4 revenue surprise fields (fam_rev_surp หรือ actual_sales vs consensus_sales) — ต้อง verify get_data_fields search=revenue; FALLBACK verified: group_rank(ts_delta(sales,63)/ts_delay(sales,252) - ts_delay(ts_delta(sales,63)/ts_delay(sales,252),63), sector) {SUBINDUSTRY decay10 trunc0.04 TOP3000} เป็น quarterly revenue acceleration ทิศบวก; NOTE: sales = standard field",
    "status": "new",
    "source_url": "https://www.tandfonline.com/doi/full/10.1080/00014788.2024.2400875"
  },
  {
    "idea_id": "g6r3-goodwill-accumulation-manda",
    "category": "corporate-events",
    "hypothesis": "หุ้นที่มี goodwill/assets สูง (accumulated acquisition premiums มาก) มี risk ที่ตลาด overprice synergies จาก past M&A → subsequent impairment + poor returns; ทิศลบ — corporate event dimension ใหม่ที่ไม่มีใน pool",
    "rationale": "Chen-Kohlbeck-Warfield (2008 Review of Accounting Studies 13) พิสูจน์ว่า goodwill intensity negative predicts returns; กลไก: market overvalues acquisition synergies → goodwill/assets สูง = accumulated overoptimism; ต่างจาก NOA (YPAzrowM = financing structure) และ j2go6pmO (org-capital = organic intangible ≠ goodwill จาก acquisition)",
    "data_hint": "UNVERIFIED: goodwill field — ต้อง verify get_data_fields search=goodwill (possible: goodwill, fn_goodwill_a); FASTEXPR: group_rank(-goodwill/ts_delay(assets,252), sector) {SUBINDUSTRY decay10 trunc0.04 TOP3000} ทิศลบ; FALLBACK: group_rank(-intangible_assets/ts_delay(assets,252), sector) ถ้า goodwill ไม่มีแยก; assets = standard field verified",
    "status": "new",
    "source_url": "https://ideas.repec.org/a/spr/reaccs/v23y2018i2d10.1007_s11142-018-9441-7.html"
  },
  {
    "idea_id": "g6r3-inventory-days-demand-miss",
    "category": "earnings-quality",
    "hypothesis": "หุ้นที่มี DIO (days inventory outstanding = inventory/(COGS/365)) สูงกว่า sector peers ผิดปกติ สะท้อน demand miss หรือ overproduction → subsequent returns ต่ำ; ทิศลบ — ต่างจาก CCC (tested: sub=-0.12 เพราะ DPO ดึงทิศ)",
    "rationale": "Thomas-Zhang (2002 Review of Accounting Studies 7) + Kesavan-Gaur-Nair (2014 Management Science 60(11)) พิสูจน์ inventory-demand miss anomaly; DIO เดี่ยว (demand-side only) ยังไม่เคยลองบน BRAIN โดยตรง; NON-quality: ไม่ load j2go6pmO/d5Qz7erx",
    "data_hint": "inventory, cogs — standard fields verified จากหลาย backlog entries; FASTEXPR: group_rank(-inventory/(cogs/365+0.001), sector) {SUBINDUSTRY decay10 trunc0.04 TOP3000} ทิศลบ (DIO สูง = short); ALTERNATIVE: group_rank(-ts_zscore(inventory/(ts_delay(cogs,252)/365+0.001),252), sector) ดัก abnormal DIO vs history; ลอง flip sign เสมอ",
    "status": "new",
    "source_url": "https://link.springer.com/article/10.1287/mnsc.2014.1936"
  },
  {
    "idea_id": "g6r3-dso-level-receivable-bloat",
    "category": "earnings-quality",
    "hypothesis": "หุ้นที่มี DSO level (receivables/(sales/365)) สูงกว่า sector peers สะท้อน receivable bloat structural / credit quality อ่อน → returns ต่ำ; ทิศลบ — ต่างจาก delta form (g5b-receivable-quality-dso-growth = rejected) เพราะ level rank จับ cross-sectional structural quality ไม่ใช่ short-term manipulation",
    "rationale": "Thomas-Zhang (2002) receivable changes เป็น strongest accrual component; DSO LEVEL cross-section (ไม่ใช่ delta/change) ยังไม่เคยลองบน BRAIN; receivable field verified จาก XgKekxb1 goal5 submit",
    "data_hint": "receivable (verified จาก XgKekxb1 goal5), sales (standard field) — FASTEXPR: group_rank(-receivable/(ts_delay(sales,252)/365+0.001), sector) {SUBINDUSTRY decay10 trunc0.04 TOP3000} ทิศลบ; ALTERNATIVE: group_rank(-receivable/(sales+0.001), sector) = receivable/sales ratio; composite candidate: DIO+DSO (demand-side working capital 2-leg ที่ต่างจาก CCC): group_rank(-receivable/(sales/365+0.001),sector) + group_rank(-inventory/(cogs/365+0.001),sector)",
    "status": "new"
  }
];

// Read current file to check last line
const content = fs.readFileSync(backlogPath, 'utf8');
const lines = content.split('\n').filter(l => l.trim());
console.log(`Current backlog lines: ${lines.length}`);

// Check for duplicates
const existingIds = new Set(lines.map(l => {
  try { return JSON.parse(l).idea_id; } catch(e) { return null; }
}));

const toAppend = newEntries.filter(e => !existingIds.has(e.idea_id));
console.log(`Appending ${toAppend.length} new entries (${newEntries.length - toAppend.length} already exist)`);

if (toAppend.length > 0) {
  const appendText = '\n' + toAppend.map(e => JSON.stringify(e)).join('\n');
  fs.appendFileSync(backlogPath, appendText, 'utf8');
  console.log('Done. Appended IDs:');
  toAppend.forEach(e => console.log(' -', e.idea_id));
} else {
  console.log('Nothing to append.');
}
