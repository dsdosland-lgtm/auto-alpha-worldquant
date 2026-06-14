import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { WorldQuantClient } from "./wq-client.js";

const client = new WorldQuantClient();

const server = new Server(
  { name: "worldquant-brain", version: "0.2.0" },
  { capabilities: { tools: {} } }
);

const SETTINGS_PROPS = {
  region: { type: "string", description: "USA, EUR, ASI, CHN, GLB ...", default: "USA" },
  universe: { type: "string", description: "TOP3000, TOP1000, TOP500, TOP200", default: "TOP3000" },
  delay: { type: "number", description: "0 หรือ 1", default: 1 },
  decay: { type: "number", description: "วัน decay (0 = ไม่ decay)", default: 0 },
  neutralization: { type: "string", description: "NONE, MARKET, SECTOR, INDUSTRY, SUBINDUSTRY", default: "SUBINDUSTRY" },
  truncation: { type: "number", description: "0.01–0.08", default: 0.08 },
};

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: "login", description: "เข้าสู่ระบบ WorldQuant BRAIN (Basic Auth จาก env)", inputSchema: { type: "object", properties: {}, required: [] } },
    {
      name: "simulate",
      description: "ส่ง alpha expression ไป simulate (async, รอผลให้เสร็จ) แล้วคืน alpha id + metrics + checks",
      inputSchema: {
        type: "object",
        properties: { expression: { type: "string", description: "FASTEXPR เช่น 'rank(-ts_delta(close,5))'" }, ...SETTINGS_PROPS },
        required: ["expression"],
      },
    },
    { name: "check_simulation", description: "ตามผล simulation ที่ client timeout ไปแล้ว (ใช้ location URL ที่ simulate คืนตอน pending) — ได้ alpha id + checks เมื่อเสร็จ", inputSchema: { type: "object", properties: { location: { type: "string", description: "Location URL จากผล simulate ที่ pending" } }, required: ["location"] } },
    { name: "get_alpha", description: "ดู metrics + is.checks ของ alpha", inputSchema: { type: "object", properties: { alpha_id: { type: "string" } }, required: ["alpha_id"] } },
    { name: "get_checks", description: "สรุปผล PASS/FAIL ทุกเกณฑ์ของ alpha (จาก is.checks)", inputSchema: { type: "object", properties: { alpha_id: { type: "string" } }, required: ["alpha_id"] } },
    { name: "get_self_correlation", description: "correlation กับ alpha ที่เรา submit แล้ว", inputSchema: { type: "object", properties: { alpha_id: { type: "string" } }, required: ["alpha_id"] } },
    { name: "get_prod_correlation", description: "correlation กับ production pool", inputSchema: { type: "object", properties: { alpha_id: { type: "string" } }, required: ["alpha_id"] } },
    { name: "submit_alpha", description: "SUBMIT alpha ขึ้น production — เรียกเฉพาะตอนผู้ใช้อนุมัติเท่านั้น. มี corr-guard: ไม่ POST/re-POST ถ้า self-corr เกิน limit (กัน leak เข้า OS); corr เกิน = คืน submitted:false + ค่า corr + blockedBy (probe ปลอดภัย)", inputSchema: { type: "object", properties: { alpha_id: { type: "string" }, force: { type: "boolean", description: "ข้าม corr-guard (ใช้เฉพาะผู้ใช้สั่งชัดเจน)", default: false } }, required: ["alpha_id"] } },
    {
      name: "get_data_fields",
      description: "ค้น data fields (filter ตาม region/delay/universe/dataset)",
      inputSchema: { type: "object", properties: { search: { type: "string" }, region: { type: "string", default: "USA" }, delay: { type: "number", default: 1 }, universe: { type: "string", default: "TOP3000" }, dataset: { type: "string" }, limit: { type: "number", default: 50 } }, required: [] },
    },
    { name: "get_datasets", description: "ลิสต์ datasets ที่ใช้ได้", inputSchema: { type: "object", properties: { region: { type: "string", default: "USA" }, delay: { type: "number", default: 1 }, universe: { type: "string", default: "TOP3000" } }, required: [] } },
    { name: "get_operators", description: "ลิสต์ operators ทั้งหมดของ FASTEXPR", inputSchema: { type: "object", properties: {}, required: [] } },
    { name: "list_alphas", description: "ดู alpha ทั้งหมดของ user", inputSchema: { type: "object", properties: { limit: { type: "number", default: 20 }, status: { type: "string" } }, required: [] } },
  ],
}));

function summarizeChecks(checks) {
  if (!Array.isArray(checks) || checks.length === 0) return "ยังไม่มีผล checks (อาจยัง simulate ไม่เสร็จ)";
  return checks
    .map((c) => {
      const icon = c.result === "PASS" ? "✅" : c.result === "FAIL" ? "❌" : c.result === "PENDING" ? "⏳" : "⚠️";
      // Many gates (CONCENTRATED_WEIGHT, MATCHES_COMPETITION) are categorical with no
      // numeric value — show the result word instead of a bare "?". PENDING means the
      // metric (e.g. SELF_CORRELATION) is still being computed server-side.
      const shown = c.value != null ? c.value : (c.result || "?");
      const limit = c.limit != null ? ` (limit ${c.limit})` : "";
      return `${icon} ${c.name}: ${shown}${limit}`;
    })
    .join("\n");
}

function summarizeMetrics(is) {
  if (!is) return "";
  const p = (v, d = 3) => (typeof v === "number" ? v.toFixed(d) : "N/A");
  return `Sharpe: ${p(is.sharpe)} | Fitness: ${p(is.fitness)} | Turnover: ${p(is.turnover)} | Returns: ${p(is.returns)} | Drawdown: ${p(is.drawdown)} | Margin: ${p(is.margin, 4)}`;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  try {
    let result;

    if (name === "login") {
      result = await client.login();

    } else if (name === "simulate") {
      const { expression, ...settings } = args;
      const sim = await client.simulate({ expression, settings });
      if (sim.pending) {
        // Client-side timeout — the sim is still running on BRAIN (quota already
        // spent). Hand back the Location so the caller can resume, never re-sim.
        result = `⏳ SIM PENDING (client timeout — อย่า simulate ซ้ำ จะเปลือง quota)\nexpression: ${expression}\nlocation: ${sim.location}\n→ ตามผลด้วย tool check_simulation {"location": "${sim.location}"}`;
      } else {
        const { is, checks } = await client.getChecks(sim.alphaId);
        result = `alpha_id: ${sim.alphaId}\nexpression: ${expression}\n${summarizeMetrics(is)}\n\nChecks:\n${summarizeChecks(checks)}`;
      }

    } else if (name === "check_simulation") {
      const sim = await client.checkSimulation(args.location);
      if (sim.pending) {
        result = `⏳ ยังรันอยู่ (progress: ${sim.progress ?? "?"}) — เรียก check_simulation ซ้ำภายหลัง\nlocation: ${args.location}\n⚠️ ถ้า progress ค้างค่าเดิม >5 นาที (พบบ่อยกับ kth_element บน derived expression เช่น close/open-1) = sim อาจ hang ถาวร — ทิ้งได้เลย ใช้ power-norm แทน (เช่น ts_sum(power(max(x,0),2),d))`;
      } else {
        const { is, checks } = await client.getChecks(sim.alphaId);
        result = `alpha_id: ${sim.alphaId}\n${summarizeMetrics(is)}\n\nChecks:\n${summarizeChecks(checks)}`;
      }

    } else if (name === "get_alpha") {
      result = await client.getAlpha(args.alpha_id);

    } else if (name === "get_checks") {
      const { is, checks } = await client.getChecks(args.alpha_id);
      result = `${summarizeMetrics(is)}\n\nChecks:\n${summarizeChecks(checks)}`;

    } else if (name === "get_self_correlation") {
      result = await client.getSelfCorrelation(args.alpha_id);

    } else if (name === "get_prod_correlation") {
      result = await client.getProdCorrelation(args.alpha_id);

    } else if (name === "submit_alpha") {
      result = await client.submitAlpha(args.alpha_id, { force: !!args.force });

    } else if (name === "get_data_fields") {
      const data = await client.getDataFields(args);
      const fields = data.results || data;
      result = Array.isArray(fields)
        ? `พบ ${fields.length} fields:\n${fields.map((f) => `• ${f.id}: ${f.description || ""} [${f.type || ""}]`).join("\n")}`
        : data;

    } else if (name === "get_datasets") {
      const data = await client.getDatasets(args);
      const sets = data.results || data;
      result = Array.isArray(sets) ? sets.map((d) => `• ${d.id}: ${d.name || ""}`).join("\n") : data;

    } else if (name === "get_operators") {
      const data = await client.getOperators();
      const ops = Array.isArray(data) ? data : data.results || [];
      result = ops.map((o) => `• ${o.name} [${o.category || ""}]: ${o.definition || o.description || ""}`).join("\n");

    } else if (name === "list_alphas") {
      const data = await client.listAlphas(args);
      const alphas = data.results || data;
      result = Array.isArray(alphas)
        ? alphas.map((a) => `• ${a.id} | ${a.status || "?"} | Sharpe ${a.is?.sharpe?.toFixed(2) ?? "N/A"} | ${a.regular?.code || a.regular || ""}`).join("\n")
        : data;

    } else {
      result = `ไม่รู้จัก tool: ${name}`;
    }

    return { content: [{ type: "text", text: typeof result === "string" ? result : JSON.stringify(result, null, 2) }] };
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
