export const meta = {
  name: 'alpha-batch',
  description: 'Sweep ไอเดีย alpha จำนวนมากแบบขนาน: แปลง → simulate → ประเมิน แล้วคืนผลแบ่งกลุ่ม pass/near-miss/fail',
  phases: [
    { title: 'Translate', detail: 'แปลงแต่ละไอเดียเป็น FASTEXPR' },
    { title: 'Simulate', detail: 'simulate บน BRAIN (เคารพ concurrency)' },
    { title: 'Evaluate', detail: 'จัดกลุ่มตามเกณฑ์ submit' },
  ],
}

// รับไอเดียจาก args: [{id, hypothesis, data_needed, expected_sign, category}, ...]
// (ถ้าไม่ส่งมา ใช้ตัวอย่าง seed ด้านล่างเพื่อทดสอบ flow)
const ideas = Array.isArray(args) && args.length
  ? args
  : [
      { id: 'rev-5d', hypothesis: 'short-term reversal 5 วัน', data_needed: ['close'], expected_sign: 'negative ts_delta', category: 'reversal' },
      { id: 'pv-corr', hypothesis: 'price-volume divergence', data_needed: ['close', 'volume'], expected_sign: 'negative', category: 'price-volume' },
    ]

const TRANSLATE_SCHEMA = {
  type: 'object',
  properties: {
    idea_id: { type: 'string' },
    expression: { type: 'string' },
    settings: { type: 'object' },
    verified: { type: 'boolean' },
    notes: { type: 'string' },
  },
  required: ['idea_id', 'expression', 'verified'],
}

const SIM_SCHEMA = {
  type: 'object',
  properties: {
    alpha_id: { type: 'string' },
    sharpe: { type: 'number' },
    fitness: { type: 'number' },
    turnover: { type: 'number' },
    returns: { type: 'number' },
    checks_passed: { type: 'boolean' },
    failed_checks: { type: 'array', items: { type: 'string' } },
  },
  required: ['alpha_id', 'checks_passed'],
}

log(`เริ่ม batch กับ ${ideas.length} ไอเดีย`)

const results = await pipeline(
  ideas,
  // Stage 1: แปลงเป็น FASTEXPR ด้วย sub-agent alpha-translator
  (idea) =>
    agent(
      `แปลงไอเดียนี้เป็น FASTEXPR + settings และตรวจ field จริงผ่าน MCP:\n${JSON.stringify(idea)}`,
      { agentType: 'alpha-translator', phase: 'Translate', label: `translate:${idea.id}`, schema: TRANSLATE_SCHEMA }
    ),
  // Stage 2: simulate ผ่าน MCP (agent เรียก tool mcp__worldquant__simulate)
  (t, idea) => {
    if (!t || !t.verified) return null // ข้ามตัวที่ field ไม่ผ่าน
    return agent(
      `เรียก MCP tool worldquant.simulate ด้วย expression="${t.expression}" และ settings=${JSON.stringify(t.settings || {})}. ` +
        `จากนั้นเรียก get_checks. คืน alpha_id, sharpe, fitness, turnover, returns, checks_passed (ผ่านทุก check ไหม), failed_checks (ชื่อ check ที่ FAIL).`,
      { phase: 'Simulate', label: `sim:${idea.id}`, schema: SIM_SCHEMA }
    )
  },
  // Stage 3: ประเมิน/จัดกลุ่ม (โค้ดล้วน ไม่ใช้ agent)
  (sim, idea) => {
    if (!sim) return { idea_id: idea.id, bucket: 'skipped' }
    if (sim.checks_passed) return { ...sim, idea_id: idea.id, bucket: 'pass' }
    // Feasibility screen (lessons รอบ 9): fitness>=1.0 ต้องมี returns >= turnover/sharpe^2
    // ตัวที่ returns ต่ำกว่า 85% ของ required = tune ไม่มีทางผ่าน อย่าส่งเข้า tuner ให้เปลือง sims
    const near = (sim.sharpe ?? 0) >= 0.8 && (sim.failed_checks?.length ?? 9) <= 2
    if (near && typeof sim.returns === 'number' && typeof sim.turnover === 'number' && (sim.sharpe ?? 0) > 0) {
      const required = sim.turnover / (sim.sharpe * sim.sharpe)
      if (sim.returns < required * 0.85) return { ...sim, idea_id: idea.id, bucket: 'infeasible', required_returns: required }
    }
    return { ...sim, idea_id: idea.id, bucket: near ? 'near-miss' : 'fail' }
  }
)

const clean = results.filter(Boolean)
const grouped = {
  pass: clean.filter((r) => r.bucket === 'pass'),
  nearMiss: clean.filter((r) => r.bucket === 'near-miss'),
  infeasible: clean.filter((r) => r.bucket === 'infeasible'),
  fail: clean.filter((r) => r.bucket === 'fail'),
  skipped: clean.filter((r) => r.bucket === 'skipped'),
}

log(`เสร็จ: pass=${grouped.pass.length} near=${grouped.nearMiss.length} infeasible=${grouped.infeasible.length} fail=${grouped.fail.length} skip=${grouped.skipped.length}`)

// คืนผลให้ผู้เรียก (find-alphas) เอาไปเขียน submit-queue / near-miss ต่อ
return grouped
