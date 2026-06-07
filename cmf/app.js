"use strict";

/* ── State ────────────────────────────────────────────────────────────── */
const state = { sources: [], currencies: [] };

/* ── DOM refs ─────────────────────────────────────────────────────────── */
const els = {
  asOfText:         document.querySelector("#asOfText"),
  refreshAll:       document.querySelector("#refreshAll"),
  sourceStrip:      document.querySelector("#sourceStrip"),
  sourceList:       document.querySelector("#sourceList"),
  crawlLog:         document.querySelector("#crawlLog"),
  crawlStatus:      document.querySelector("#crawlStatus"),
  // FX
  fxForm:           document.querySelector("#fxForm"),
  fxDate:           document.querySelector("#fxDate"),
  fxAmount:         document.querySelector("#fxAmount"),
  fxBase:           document.querySelector("#fxBase"),
  fxQuote:          document.querySelector("#fxQuote"),
  fxResult:         document.querySelector("#fxResult"),
  fxStatus:         document.querySelector("#fxStatus"),
  swapCurrencies:   document.querySelector("#swapCurrencies"),
  quickPairs:       document.querySelector("#quickPairs"),
  // Treasury
  treasuryForm:     document.querySelector("#treasuryForm"),
  treasuryDate:     document.querySelector("#treasuryDate"),
  treasuryStatus:   document.querySelector("#treasuryStatus"),
  yieldChart:       document.querySelector("#yieldChart"),
  treasuryMetrics:  document.querySelector("#treasuryMetrics"),
  // SEC
  secForm:          document.querySelector("#secForm"),
  tickerInput:      document.querySelector("#tickerInput"),
  formFilter:       document.querySelector("#formFilter"),
  secStatus:        document.querySelector("#secStatus"),
  filingsBody:      document.querySelector("#filingsBody"),
  // Metrics
  mEcbDate:         document.querySelector("#mEcbDate"),
  mCbnDate:         document.querySelector("#mCbnDate"),
  mTreasuryDate:    document.querySelector("#mTreasuryDate"),
  mSources:         document.querySelector("#mSources"),
  // Nav
  signOutBtn:       document.querySelector("#signOutBtn"),
  toast:            document.querySelector("#toast"),
};

/* ── Utilities ────────────────────────────────────────────────────────── */
function todayIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function fmt(value, digits = 4) {
  if (!Number.isFinite(Number(value))) return "N/A";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: Math.min(2, digits)
  }).format(Number(value));
}

function setStatus(el, text, mode = "") {
  el.textContent = text;
  el.className = `status-pill ${mode}`.trim();
}

function log(msg) {
  const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const line = `[${t}] ${msg}`;
  els.crawlLog.textContent = (line + "\n" + els.crawlLog.textContent).slice(0, 2000);
  setStatus(els.crawlStatus, "Active", "ok");
}

function toast(msg, isError = false) {
  els.toast.textContent = msg;
  els.toast.style.borderColor = isError ? "rgba(224,82,82,.4)" : "";
  els.toast.style.color = isError ? "var(--rd)" : "";
  els.toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.classList.remove("show"), 3800);
}

async function api(path, params = {}) {
  const url = new URL(path, window.location.origin);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  }
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || data.ok === false) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

/* ── Sources ──────────────────────────────────────────────────────────── */
async function loadSources() {
  try {
    const { sources } = await api("/api/sources");
    state.sources = sources;
    renderSources();
  } catch (e) {
    log(`Sources error: ${e.message}`);
  }
}

function renderSources() {
  els.sourceStrip.innerHTML = state.sources.map(s => `
    <div class="source-chip">
      <img src="${s.asset}" alt="" loading="lazy" onerror="this.style.display='none'"/>
      <div>
        <strong>${s.shortName}</strong>
        <span>${s.coverage}</span>
      </div>
    </div>
  `).join("");

  els.sourceList.innerHTML = state.sources.map(s => `
    <div class="source-item">
      <img src="${s.asset}" alt="" loading="lazy" onerror="this.style.display='none'"/>
      <div>
        <strong>${s.name}</strong>
        <span>${s.cadence}</span>
        <a href="${s.officialUrl}" target="_blank" rel="noopener">Official source ↗</a>
      </div>
    </div>
  `).join("");
}

/* ── Currencies ───────────────────────────────────────────────────────── */
async function loadCurrencies() {
  try {
    const { currencies } = await api("/api/currencies");
    state.currencies = currencies;
    populateCurrencySelects();
  } catch (e) {
    log(`Currency load error: ${e.message}`);
  }
}

function populateCurrencySelects() {
  const opts = state.currencies
    .map(c => `<option value="${c.code}">${c.code} — ${c.name}</option>`)
    .join("");
  els.fxBase.innerHTML = opts;
  els.fxQuote.innerHTML = opts;
  // Defaults: USD → NGN
  const baseOpt = [...els.fxBase.options].find(o => o.value === "USD");
  if (baseOpt) els.fxBase.value = "USD";
  const quoteOpt = [...els.fxQuote.options].find(o => o.value === "NGN");
  if (quoteOpt) els.fxQuote.value = "NGN";
}

/* ── FX Lookup ────────────────────────────────────────────────────────── */
els.fxForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  await doFxLookup(els.fxDate.value, els.fxBase.value, els.fxQuote.value, els.fxAmount.value);
});

els.swapCurrencies.addEventListener("click", () => {
  const tmp = els.fxBase.value;
  els.fxBase.value = els.fxQuote.value;
  els.fxQuote.value = tmp;
});

els.quickPairs.addEventListener("click", (e) => {
  const btn = e.target.closest(".qp-btn");
  if (!btn) return;
  const { base, quote } = btn.dataset;
  els.fxBase.value = base;
  els.fxQuote.value = quote;
  els.fxAmount.value = "1";
  doFxLookup(els.fxDate.value, base, quote, "1");
});

async function doFxLookup(date, base, quote, amount) {
  if (!base || !quote) { toast("Select both currencies", true); return; }
  setStatus(els.fxStatus, "Loading…", "loading");
  log(`FX lookup: ${amount} ${base}/${quote} @ ${date || "today"}`);
  try {
    const d = await api("/api/fx", { date, base, quote, amount });
    renderFxResult(d);
    setStatus(els.fxStatus, "OK", "ok");
    els.mEcbDate.textContent = d.provider === "ECB" ? d.effectiveDate : els.mEcbDate.textContent;
    els.mCbnDate.textContent = d.provider === "CBN" ? d.effectiveDate : els.mCbnDate.textContent;
    log(`FX result: 1 ${base} = ${fmt(d.rate)} ${quote} (${d.provider}, eff. ${d.effectiveDate})`);
  } catch (err) {
    setStatus(els.fxStatus, "Error", "error");
    els.fxResult.innerHTML = `<div class="error-box">⚠ ${escHtml(err.message)}</div>`;
    log(`FX error: ${err.message}`);
    toast(err.message, true);
  }
}

function renderFxResult(d) {
  els.fxResult.innerHTML = `
    <div class="rate-main">
      <span style="font-family:var(--mo);font-size:12px;color:var(--tx3);margin-bottom:4px;display:block">
        ${d.amount} ${d.base} =
      </span>
      <strong>${fmt(d.converted, 4)} ${d.quote}</strong>
    </div>
    <div class="rate-meta">
      <div class="rate-meta-item">
        <span>Exchange rate</span>
        <strong>1 ${d.base} = ${fmt(d.rate, 6)} ${d.quote}</strong>
      </div>
      <div class="rate-meta-item">
        <span>Inverse</span>
        <strong>1 ${d.quote} = ${fmt(1 / d.rate, 6)} ${d.base}</strong>
      </div>
      <div class="rate-meta-item">
        <span>Effective date</span>
        <strong>${d.effectiveDate}</strong>
      </div>
    </div>
    <span class="provider-badge">${d.provider} official rate</span>
  `;
}

/* ── Treasury Yield Curve ─────────────────────────────────────────────── */
els.treasuryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  await doTreasury(els.treasuryDate.value);
});

async function doTreasury(date) {
  setStatus(els.treasuryStatus, "Loading…", "loading");
  log(`Treasury yield curve @ ${date || "today"}`);
  try {
    const d = await api("/api/treasury", { date });
    renderYieldCurve(d.curve);
    renderTreasuryMetrics(d.curve);
    setStatus(els.treasuryStatus, "OK", "ok");
    els.mTreasuryDate.textContent = d.effectiveDate;
    log(`Treasury loaded: ${d.curve.length} tenors, eff. ${d.effectiveDate}`);
    els.asOfText.textContent = `Latest official crawl — ${d.effectiveDate}`;
  } catch (err) {
    setStatus(els.treasuryStatus, "Error", "error");
    els.yieldChart.innerHTML = `<div class="error-box" style="margin:14px">⚠ ${escHtml(err.message)}</div>`;
    log(`Treasury error: ${err.message}`);
  }
}

function renderYieldCurve(curve) {
  if (!curve || !curve.length) {
    els.yieldChart.innerHTML = `<p class="empty-state">No yield data returned.</p>`;
    return;
  }

  const W = 480, H = 180, pad = { t: 20, r: 16, b: 36, l: 44 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;

  const yields = curve.map(c => c.yield);
  const minY = Math.min(...yields) - 0.2;
  const maxY = Math.max(...yields) + 0.2;

  const xScale = i => pad.l + (i / (curve.length - 1)) * iW;
  const yScale = v => pad.t + iH - ((v - minY) / (maxY - minY)) * iH;

  const pathD = curve
    .map((c, i) => `${i === 0 ? "M" : "L"}${xScale(i).toFixed(1)},${yScale(c.yield).toFixed(1)}`)
    .join(" ");

  // Area fill path (close to bottom)
  const areaD = pathD + ` L${xScale(curve.length - 1).toFixed(1)},${(pad.t + iH).toFixed(1)} L${xScale(0).toFixed(1)},${(pad.t + iH).toFixed(1)} Z`;

  // Y-axis labels
  const yTicks = 4;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = minY + ((maxY - minY) * i) / yTicks;
    const y = yScale(v);
    return `<text x="${pad.l - 6}" y="${y.toFixed(1)}" text-anchor="end" dominant-baseline="middle">${v.toFixed(1)}%</text>`;
  }).join("");

  // X-axis labels (every other)
  const xLabels = curve
    .filter((_, i) => i % 2 === 0 || i === curve.length - 1)
    .map((c, _, arr) => {
      const origIdx = curve.indexOf(c);
      const x = xScale(origIdx);
      return `<text x="${x.toFixed(1)}" y="${(pad.t + iH + 14).toFixed(1)}" text-anchor="middle">${c.tenor}</text>`;
    }).join("");

  // Grid lines
  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const v = minY + ((maxY - minY) * i) / yTicks;
    const y = yScale(v).toFixed(1);
    return `<line x1="${pad.l}" y1="${y}" x2="${pad.l + iW}" y2="${y}" stroke="rgba(255,255,255,.06)" stroke-width="1"/>`;
  }).join("");

  // Dots on curve
  const dots = curve.map((c, i) =>
    `<circle cx="${xScale(i).toFixed(1)}" cy="${yScale(c.yield).toFixed(1)}" r="3" fill="#00c9a7" opacity=".85"/>`
  ).join("");

  els.yieldChart.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00c9a7" stop-opacity=".25"/>
          <stop offset="100%" stop-color="#00c9a7" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaD}" fill="url(#curveGrad)" stroke="none"/>
      <path d="${pathD}" fill="none" stroke="#00c9a7" stroke-width="2" stroke-linejoin="round"/>
      ${dots}
      ${yLabels}
      ${xLabels}
    </svg>
  `;
}

function renderTreasuryMetrics(curve) {
  if (!curve || curve.length < 2) { els.treasuryMetrics.innerHTML = ""; return; }
  const get = (tenor) => curve.find(c => c.tenor === tenor)?.yield;
  const y2 = get("2Y"), y10 = get("10Y"), y3m = get("3M"), y30 = get("30Y");
  const spread = (y2 !== undefined && y10 !== undefined) ? (y10 - y2).toFixed(2) : "—";
  const spreadColor = parseFloat(spread) < 0 ? "var(--rd)" : "var(--gr)";

  els.treasuryMetrics.innerHTML = `
    <div class="metric-box">
      <span>3M</span>
      <strong>${y3m !== undefined ? y3m.toFixed(2) + "%" : "—"}</strong>
    </div>
    <div class="metric-box">
      <span>10Y</span>
      <strong>${y10 !== undefined ? y10.toFixed(2) + "%" : "—"}</strong>
    </div>
    <div class="metric-box">
      <span>2s10s Spread</span>
      <strong style="color:${spreadColor}">${spread !== "—" ? spread + "%" : "—"}</strong>
    </div>
  `;
}

/* ── SEC Filings ──────────────────────────────────────────────────────── */
els.secForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const ticker = els.tickerInput.value.trim().toUpperCase();
  const form = els.formFilter.value.trim();
  if (!ticker) { toast("Enter a ticker symbol", true); return; }
  await doSecSearch(ticker, form);
});

async function doSecSearch(ticker, formFilter) {
  setStatus(els.secStatus, "Loading…", "loading");
  log(`SEC EDGAR search: ${ticker}${formFilter ? ` (${formFilter})` : ""}`);
  try {
    const d = await api("/api/filings", { ticker, form: formFilter });
    renderFilings(d);
    setStatus(els.secStatus, `${d.filings.length} filings`, "ok");
    log(`SEC EDGAR: ${d.name} (CIK ${d.cik}) — ${d.filings.length} filings returned`);
  } catch (err) {
    setStatus(els.secStatus, "Error", "error");
    els.filingsBody.innerHTML = `<tr><td colspan="4" class="empty-state" style="color:var(--rd)">⚠ ${escHtml(err.message)}</td></tr>`;
    log(`SEC error: ${err.message}`);
  }
}

function renderFilings(d) {
  if (!d.filings.length) {
    els.filingsBody.innerHTML = `<tr><td colspan="4" class="empty-state">No filings found for ${escHtml(d.ticker)}${d.name ? ` (${escHtml(d.name)})` : ""}.</td></tr>`;
    return;
  }
  els.filingsBody.innerHTML = d.filings.map(f => `
    <tr>
      <td><span class="form-badge">${escHtml(f.form)}</span></td>
      <td style="font-family:var(--mo);font-size:11px;color:var(--tx2)">${escHtml(f.date)}</td>
      <td style="font-size:11px;color:var(--tx3);max-width:200px;word-break:break-word">${escHtml(f.document || "")}</td>
      <td><a href="${f.url}" target="_blank" rel="noopener">View ↗</a></td>
    </tr>
  `).join("");
}

/* ── Refresh All ──────────────────────────────────────────────────────── */
els.refreshAll.addEventListener("click", async () => {
  els.refreshAll.disabled = true;
  log("Manual refresh triggered");
  setStatus(els.crawlStatus, "Refreshing…", "loading");
  try {
    await Promise.allSettled([
      doFxLookup(els.fxDate.value, els.fxBase.value, els.fxQuote.value, els.fxAmount.value),
      doTreasury(els.treasuryDate.value)
    ]);
    toast("Crawl refreshed");
    setStatus(els.crawlStatus, "Done", "ok");
  } catch {
    setStatus(els.crawlStatus, "Partial", "loading");
  } finally {
    els.refreshAll.disabled = false;
  }
});

/* ── Sign out ─────────────────────────────────────────────────────────── */
els.signOutBtn.addEventListener("click", () => {
  if (confirm("Sign out of FM Finance Suite?")) {
    window.location.href = "../";
  }
});

/* ── Escape HTML ──────────────────────────────────────────────────────── */
function escHtml(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

/* ── Init ─────────────────────────────────────────────────────────────── */
(async function init() {
  // Set date defaults
  const today = todayIso();
  els.fxDate.value = today;
  els.treasuryDate.value = today;

  // Load data
  await loadSources();
  await loadCurrencies();

  // Auto-run FX and Treasury on load
  await Promise.allSettled([
    doFxLookup(today, "USD", "NGN", "1"),
    doTreasury(today)
  ]);

  log("Console initialised. Sources: ECB, CBN, U.S. Treasury, SEC EDGAR.");
  els.asOfText.textContent = `Console loaded — ${today}`;
})();
