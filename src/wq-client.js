// WorldQuant BRAIN API client
// API host (not the web app host). Auth is HTTP Basic against /authentication,
// which returns a JWT-backed session cookie that we replay on every request.
const BASE_URL = "https://api.worldquantbrain.com";

// How long to keep polling an async simulation before giving up (ms).
const SIM_TIMEOUT_MS = 5 * 60 * 1000;
// Fallback poll interval when the server doesn't send Retry-After (ms).
const DEFAULT_POLL_MS = 2500;
// Transient HTTP statuses (server/proxy hiccups, rate limit) worth a retry.
const TRANSIENT_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 3;
// 429s arrive in long windows (a heavy session stays rate-limited for minutes,
// seen live round 26: linear 2.5-7.5s waits never outlasted the window), so
// rate limits get more attempts + exponential waits and honor Retry-After.
const MAX_RETRIES_429 = 5;
const MAX_BACKOFF_MS = 30 * 1000;

export class WorldQuantClient {
  constructor() {
    this.username = process.env.WQ_USERNAME || "";
    this.password = process.env.WQ_PASSWORD || "";
    this.cookies = "";
    this.loggedIn = false;
  }

  // Low-level request. `absoluteUrl` lets pollers hit a full Location URL.
  async _request(method, path, { body = null, params = null, absoluteUrl = null, headers = {} } = {}) {
    let url = absoluteUrl || `${BASE_URL}${path}`;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      url += `?${qs}`;
    }

    const finalHeaders = { ...headers };
    if (body) finalHeaders["Content-Type"] = "application/json";
    if (this.cookies) finalHeaders["Cookie"] = this.cookies;

    const options = { method, headers: finalHeaders };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(url, options);

    // Persist session cookie returned by /authentication.
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) this.cookies = setCookie.split(";")[0];

    return res;
  }

  async login() {
    const basic = Buffer.from(`${this.username}:${this.password}`).toString("base64");
    const res = await this._request("POST", "/authentication", {
      headers: { Authorization: `Basic ${basic}` },
    });

    if (res.status === 201 || res.ok) {
      this.loggedIn = true;
      return { success: true, message: "Login สำเร็จ" };
    }

    // 401 with a WWW-Authenticate persona challenge => biometric/2FA account.
    const text = await res.text().catch(() => "");
    if (res.status === 401 && /persona|biometric/i.test(text + (res.headers.get("www-authenticate") || ""))) {
      return { success: false, message: "บัญชีนี้ต้องยืนยัน biometric/2FA ผ่าน browser ก่อน — login API ล้วนไม่ได้" };
    }
    return { success: false, message: `Login ล้มเหลว (${res.status}): ${text}` };
  }

  async ensureLoggedIn() {
    if (!this.loggedIn) {
      const result = await this.login();
      if (!result.success) throw new Error(result.message);
    }
  }

  // One retry on 401 (session expired) by re-authenticating.
  async _authed(method, path, opts = {}) {
    await this.ensureLoggedIn();
    let res = await this._request(method, path, opts);
    if (res.status === 401) {
      this.loggedIn = false;
      await this.ensureLoggedIn();
      res = await this._request(method, path, opts);
    }
    return res;
  }

  // Retry idempotent requests on transient 5xx/429 or network throw (e.g. the
  // getAlpha 504s and proxy hiccups seen during polling). Linear backoff.
  // Use ONLY for GETs — POSTs (e.g. creating a simulation) are not idempotent.
  async _authedRetry(method, path, opts = {}) {
    let lastErr = null;
    for (let attempt = 0; attempt <= MAX_RETRIES_429; attempt++) {
      try {
        const res = await this._authed(method, path, opts);
        if (TRANSIENT_STATUS.has(res.status)) {
          const maxForStatus = res.status === 429 ? MAX_RETRIES_429 : MAX_RETRIES;
          if (attempt < maxForStatus) {
            const retryAfterSec = Number(res.headers.get("retry-after")) || 0;
            const waitMs = res.status === 429
              ? Math.min(MAX_BACKOFF_MS, retryAfterSec * 1000 || 5000 * 2 ** attempt)
              : DEFAULT_POLL_MS * (attempt + 1);
            await new Promise((r) => setTimeout(r, waitMs));
            continue;
          }
        }
        return res;
      } catch (e) {
        lastErr = e;
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, DEFAULT_POLL_MS * (attempt + 1)));
          continue;
        }
        throw lastErr;
      }
    }
    throw lastErr || new Error("_authedRetry: exhausted");
  }

  buildSettings({
    region = "USA",
    universe = "TOP3000",
    delay = 1,
    decay = 0,
    neutralization = "SUBINDUSTRY",
    truncation = 0.08,
    instrumentType = "EQUITY",
    pasteurization = "ON",
    unitHandling = "VERIFY",
    nanHandling = "ON",
    visualization = false,
  } = {}) {
    return {
      instrumentType,
      region,
      universe,
      delay,
      decay,
      neutralization,
      truncation,
      pasteurization,
      unitHandling,
      nanHandling,
      language: "FASTEXPR",
      visualization,
    };
  }

  // Submit an async simulation, poll Location until done, return the alpha id.
  // onProgress(progressFloat) is optional.
  async simulate({ expression, settings = {}, onProgress = null }) {
    const payload = {
      type: "REGULAR",
      settings: this.buildSettings(settings),
      regular: expression,
    };

    const res = await this._authed("POST", "/simulations", { body: payload });
    if (res.status !== 201 && !res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`simulate POST failed (${res.status}): ${text}`);
    }

    const location = res.headers.get("location");
    if (!location) {
      // Some tiers return the result inline.
      const inline = await res.json().catch(() => ({}));
      if (inline.alpha) return { alphaId: inline.alpha, raw: inline };
      throw new Error("simulate: ไม่มี Location header และไม่มี alpha id ใน response");
    }

    const deadline = Date.now() + SIM_TIMEOUT_MS;
    while (Date.now() < deadline) {
      // Retry the poll on transient 5xx so a single proxy hiccup doesn't abort a sim.
      const poll = await this._authedRetry("GET", null, { absoluteUrl: location });
      const retryAfter = poll.headers.get("retry-after");
      const data = await poll.json().catch(() => ({}));

      if (onProgress && typeof data.progress === "number") onProgress(data.progress);

      // Done when the body carries the resulting alpha id.
      if (data.alpha) return { alphaId: data.alpha, raw: data };
      if (data.status && /ERROR|FAIL/i.test(data.status)) {
        throw new Error(`simulation error: ${JSON.stringify(data.message || data)}`);
      }

      const waitMs = retryAfter ? Number(retryAfter) * 1000 : DEFAULT_POLL_MS;
      await new Promise((r) => setTimeout(r, waitMs));
    }
    // Client-side timeout only — the sim keeps running on BRAIN and still burns
    // quota, so surface the Location instead of throwing (a thrown error here
    // used to lose the result entirely; see lessons round 23).
    return { pending: true, location, note: "sim ยังรันอยู่ฝั่ง BRAIN (client timeout) — ผลไม่หาย ตามด้วย check_simulation กับ location นี้ อย่า sim ซ้ำ" };
  }

  // Poll a simulation Location once (for sims that outlived the simulate() timeout).
  // Returns {alphaId} when finished, or {pending:true, progress} while still running.
  async checkSimulation(location) {
    const poll = await this._authedRetry("GET", null, { absoluteUrl: location });
    const data = await poll.json().catch(() => ({}));
    if (data.alpha) return { alphaId: data.alpha, raw: data };
    if (data.status && /ERROR|FAIL/i.test(data.status)) {
      throw new Error(`simulation error: ${JSON.stringify(data.message || data)}`);
    }
    return { pending: true, location, progress: typeof data.progress === "number" ? data.progress : null };
  }

  async getAlpha(alphaId) {
    // Retry: getAlpha sometimes returns a transient 504 right after a sim finishes.
    const res = await this._authedRetry("GET", `/alphas/${alphaId}`);
    if (!res.ok) throw new Error(`getAlpha failed: ${res.status}`);
    return res.json();
  }

  // Pull the is.checks[] gate results (name/result/value/limit).
  async getChecks(alphaId) {
    const alpha = await this.getAlpha(alphaId);
    const checks = alpha?.is?.checks || [];
    return { alphaId, status: alpha.status, is: alpha.is, checks };
  }

  // BRAIN correlation endpoints are async (202 + Retry-After while computing) and
  // may return an empty body when there is nothing to compare against (e.g. an
  // empty self registry). We poll, then degrade gracefully instead of throwing so
  // the pipeline can still queue an alpha and flag corr for manual review.
  async _correlation(label, path, alphaId) {
    const deadline = Date.now() + SIM_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const res = await this._authed("GET", path);

      if (res.status === 202) {
        const retryAfter = res.headers.get("retry-after");
        await new Promise((r) => setTimeout(r, retryAfter ? Number(retryAfter) * 1000 : DEFAULT_POLL_MS));
        continue;
      }

      const text = await res.text().catch(() => "");

      // Non-OK (commonly 403 = tier-gated): don't throw, surface as unavailable.
      if (!res.ok) {
        return { alphaId, label, unavailable: true, status: res.status, note: `${label} correlation ใช้ไม่ได้ (HTTP ${res.status}) — ให้เช็คมือก่อน submit` };
      }

      // OK but empty body = STILL COMPUTING (not "nothing to compare"). Keep
      // polling until the deadline instead of returning immediately — returning
      // here was the bug that forced callers to manually re-request to get the
      // real value (e.g. self-corr 0.9238 only appeared on a 2nd manual call).
      // With a non-empty submitted pool, empty body is always transient.
      if (!text.trim()) {
        await new Promise((r) => setTimeout(r, DEFAULT_POLL_MS));
        continue;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return { alphaId, label, unavailable: true, note: `${label} correlation parse ไม่ได้`, raw: text.slice(0, 200) };
      }
      return { alphaId, label, max: extractMaxCorrelation(data), ...data };
    }
    return { alphaId, label, pending: true, note: `${label} correlation ยังคำนวณไม่เสร็จ (timeout)` };
  }

  // The dedicated correlation endpoints are flaky: self returns an empty body
  // intermittently even when a value exists, and prod is often 403 (tier-gated).
  // The authoritative number is carried on the alpha record (is.selfCorrelation /
  // is.prodCorrelation) once computed — fall back to it so callers get a real value.
  async _correlationWithFallback(label, path, alphaId, isField) {
    const r = await this._correlation(label, path, alphaId);
    if (typeof r.max === "number" && r.max > 0 && !r.empty) return r;
    const alpha = await this.getAlpha(alphaId).catch(() => null);
    const v = alpha?.is?.[isField];
    if (typeof v === "number") {
      return { alphaId, label, max: v, source: `getAlpha.is.${isField}`, endpoint: r };
    }
    return r;
  }

  async getSelfCorrelation(alphaId) {
    return this._correlationWithFallback("self", `/alphas/${alphaId}/correlations/self`, alphaId, "selfCorrelation");
  }

  async getProdCorrelation(alphaId) {
    return this._correlationWithFallback("prod", `/alphas/${alphaId}/correlations/prod`, alphaId, "prodCorrelation");
  }

  // Submit is ASYNC on BRAIN: POST /submit returns 201 (accepted) while the
  // platform finalizes the OS/SELF_CORRELATION checks — the alpha stays
  // status:UNSUBMITTED, dateSubmitted:null until that resolves. A raw 200/201
  // is NOT proof of submission (this caused the system to log false "submitted"
  // records for the whole project history). We POST, then VERIFY against the
  // alpha record (source of truth) and return an honest submitted:true/false.
  //
  // ⚠️ LEAK GUARD (round 25): a re-POST issued while SELF_CORRELATION is still
  // PENDING slips past the corr gate — RRrE1VNj entered OS at corr 0.8404 that
  // way while a clean first-POST 403-blocks at >0.70. So this client NEVER
  // blind re-POSTs: after an ack it polls the record until the corr value
  // materializes, refuses to re-POST when over the limit, and re-POSTs only on
  // a confirmed pass. The same guard runs BEFORE the first POST (an over-limit
  // corr already on the record from a prior probe blocks the call). Pass
  // force:true to override deliberately.
  async submitAlpha(alphaId, { force = false } = {}) {
    const MAX_SUBMIT_ATTEMPTS = 4;
    const CORR_WAIT_MS = 90 * 1000;
    const corrCheckOf = (alpha) => (alpha?.is?.checks || []).find((c) => c.name === "SELF_CORRELATION");
    const submittedResult = (alpha, extra = {}) => ({
      success: true,
      submitted: true,
      alphaId,
      status: alpha.status,
      stage: alpha.stage,
      dateSubmitted: alpha.dateSubmitted,
      selfCorrelation: alpha?.is?.selfCorrelation ?? null,
      prodCorrelation: alpha?.is?.prodCorrelation ?? null,
      ...extra,
    });

    // --- Pre-POST guard: never POST when the outcome is already knowable. ---
    const pre = await this.getAlpha(alphaId).catch(() => null);
    if (pre?.dateSubmitted) return submittedResult(pre, { alreadySubmitted: true });
    const preLimit = corrCheckOf(pre)?.limit ?? 0.7;
    const preCorr = pre?.is?.selfCorrelation;
    if (!force && typeof preCorr === "number" && preCorr > preLimit) {
      return {
        success: false,
        submitted: false,
        alphaId,
        selfCorrelation: preCorr,
        limit: preLimit,
        reason: `SELF_CORRELATION ${preCorr} > limit ${preLimit} (ค่าบน record จาก probe ก่อนหน้า) — ไม่ POST กัน leak เข้า OS; ถ้าจงใจ override ใช้ force:true`,
      };
    }

    let lastHttp = null;
    for (let attempt = 1; attempt <= MAX_SUBMIT_ATTEMPTS; attempt++) {
      const res = await this._authedRetry("POST", `/alphas/${alphaId}/submit`);
      lastHttp = res.status;

      // Some tiers hand back a Location to poll while the submit finalizes.
      const location = res.headers.get("location");
      if (location) {
        const pollDeadline = Date.now() + SIM_TIMEOUT_MS;
        while (Date.now() < pollDeadline) {
          const poll = await this._authedRetry("GET", null, { absoluteUrl: location });
          if (poll.status === 202) {
            const ra = poll.headers.get("retry-after");
            await new Promise((r) => setTimeout(r, ra ? Number(ra) * 1000 : DEFAULT_POLL_MS));
            continue;
          }
          break;
        }
      } else if (!res.ok && res.status !== 201) {
        const text = await res.text().catch(() => "");
        // Transient proxy hiccup ("plain HTTP request was sent to HTTPS port") —
        // seen live 2026-06-11, an immediate retry succeeded. Real validation
        // 400s must NOT be retried, so match this exact body only.
        if (/plain HTTP request.*sent to HTTPS port/i.test(text) && attempt < MAX_SUBMIT_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, DEFAULT_POLL_MS));
          continue;
        }
        // 403 carrying is.checks = the corr gate verdict on first-POST: a FREE
        // corr reading (records name the pool alpha we collide with) — return
        // structured instead of throwing so callers log it cleanly.
        const parsed = safeJsonParse(text);
        const failCheck = (parsed?.is?.checks || []).find((c) => c.name === "SELF_CORRELATION" && c.result === "FAIL");
        if (res.status === 403 && failCheck) {
          return {
            success: false,
            submitted: false,
            alphaId,
            httpStatus: res.status,
            selfCorrelation: failCheck.value ?? null,
            limit: failCheck.limit ?? null,
            blockedBy: parsed?.selfCorrelated?.records ?? null,
            reason: `SELF_CORRELATION FAIL ${failCheck.value} > limit ${failCheck.limit} — corr probe สำเร็จ (ไม่ถูก submit, ไม่เสียหาย)`,
          };
        }
        throw new Error(`submit failed (${res.status}): ${text}`);
      }

      // Source of truth: the alpha record. dateSubmitted set => really submitted.
      let alpha = await this.getAlpha(alphaId).catch(() => null);
      if (alpha?.dateSubmitted) return submittedResult(alpha, { httpStatus: lastHttp, attempts: attempt });

      // Ack received but corr still PENDING: poll the RECORD ONLY (never POST)
      // until the value materializes, then decide.
      const corrDeadline = Date.now() + CORR_WAIT_MS;
      while (Date.now() < corrDeadline) {
        if (alpha?.dateSubmitted) return submittedResult(alpha, { httpStatus: lastHttp, attempts: attempt });
        const check = corrCheckOf(alpha);
        const corr = alpha?.is?.selfCorrelation;
        const limit = check?.limit ?? preLimit;
        if (check?.result === "FAIL" || (typeof corr === "number" && corr > limit)) {
          return {
            success: false,
            submitted: false,
            alphaId,
            httpStatus: lastHttp,
            selfCorrelation: corr ?? check?.value ?? null,
            limit,
            reason: "SELF_CORRELATION เกิน limit — ไม่ re-POST (กัน leak เข้า OS แบบ RRrE1VNj รอบ 25)",
          };
        }
        if (typeof corr === "number") break; // finalized under limit → safe to re-POST
        await new Promise((r) => setTimeout(r, DEFAULT_POLL_MS * 2));
        alpha = await this.getAlpha(alphaId).catch(() => alpha);
      }

      if (typeof alpha?.is?.selfCorrelation !== "number") {
        return {
          success: false,
          submitted: false,
          alphaId,
          httpStatus: lastHttp,
          selfCorrelation: null,
          note: "self-corr ยัง PENDING หลังรอ — ไม่ blind re-POST (กัน leak). รอ 1-2 นาทีแล้วเรียก submit_alpha ใหม่ (pre-guard จะอ่านค่า corr จาก record ให้เอง)",
        };
      }
      // corr finalized under limit → loop continues: re-POST to complete the submit.
      if (attempt < MAX_SUBMIT_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, DEFAULT_POLL_MS * 2));
      }
    }

    const alpha = await this.getAlpha(alphaId).catch(() => null);
    return {
      success: false,
      submitted: false,
      alphaId,
      httpStatus: lastHttp,
      status: alpha?.status ?? null,
      dateSubmitted: alpha?.dateSubmitted ?? null,
      selfCorrelation: alpha?.is?.selfCorrelation ?? null,
      note: `submit ยังไม่ยืนยันหลัง ${MAX_SUBMIT_ATTEMPTS} ครั้ง — get_alpha เช็ค status/dateSubmitted ก่อนแล้วค่อยเรียกซ้ำ`,
    };
  }

  async getDataFields({ search = "", region = "USA", delay = 1, universe = "TOP3000", dataset = "", limit = 50, offset = 0 } = {}) {
    const params = { instrumentType: "EQUITY", region, delay, universe, limit, offset };
    if (search) params.search = search;
    if (dataset) params["dataset.id"] = dataset;
    const res = await this._authed("GET", "/data-fields", { params });
    if (!res.ok) throw new Error(`getDataFields failed: ${res.status}`);
    return res.json();
  }

  async getDatasets({ region = "USA", delay = 1, universe = "TOP3000", limit = 50, offset = 0 } = {}) {
    const params = { instrumentType: "EQUITY", region, delay, universe, limit, offset };
    const res = await this._authed("GET", "/data-sets", { params });
    if (!res.ok) throw new Error(`getDatasets failed: ${res.status}`);
    return res.json();
  }

  async getOperators() {
    const res = await this._authed("GET", "/operators");
    if (!res.ok) throw new Error(`getOperators failed: ${res.status}`);
    return res.json();
  }

  async listAlphas({ limit = 20, offset = 0, status = "" } = {}) {
    const params = { limit, offset };
    if (status) params.status = status;
    const res = await this._authed("GET", "/users/self/alphas", { params });
    if (!res.ok) throw new Error(`listAlphas failed: ${res.status}`);
    return res.json();
  }
}

function safeJsonParse(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Best-effort: pull the peak correlation out of a BRAIN correlation payload.
// BRAIN usually carries a top-level `max` (the highest corr vs any compared alpha);
// otherwise we scan `records` for the largest-magnitude value within [-1, 1].
function extractMaxCorrelation(data) {
  if (!data || typeof data !== "object") return null;
  if (typeof data.max === "number") return data.max;
  const records = Array.isArray(data.records) ? data.records : [];
  let best = null;
  for (const row of records) {
    const vals = Array.isArray(row) ? row : Object.values(row || {});
    for (const v of vals) {
      if (typeof v === "number" && v >= -1 && v <= 1 && (best === null || Math.abs(v) > Math.abs(best))) {
        best = v;
      }
    }
  }
  return best;
}
