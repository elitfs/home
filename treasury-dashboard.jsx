
import { useState, useMemo, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  navy: "#07101f",
  card: "#0d1b2e",
  cardHover: "#112240",
  border: "#1a2e4a",
  borderLight: "#243a5e",
  teal: "#00c9a7",
  tealDim: "#007a66",
  gold: "#f5a623",
  red: "#ff4560",
  green: "#06d6a0",
  blue: "#4cc9f0",
  purple: "#9b5de5",
  textPrimary: "#e2eaf5",
  textSecondary: "#7a90b0",
  textMuted: "#4a607a",
};

// ─── SAMPLE DATA ───────────────────────────────────────────────────────────────
const LOANS = [
  { id:"LN-001", customer:"Dangote Industries Ltd", product:"Invoice Discounting", principal:450, rate:22, dpd:0, stage:1, rating:"A", start:"2024-01-15", maturity:"2024-07-15", outstanding:420 },
  { id:"LN-002", customer:"Flour Mills Nigeria Plc", product:"Supply Chain Finance", principal:320, rate:20, dpd:18, stage:1, rating:"A-", start:"2024-02-01", maturity:"2024-08-01", outstanding:310 },
  { id:"LN-003", customer:"MTN Nigeria Comms", product:"Factoring", principal:280, rate:21, dpd:0, stage:1, rating:"AA", start:"2024-03-10", maturity:"2024-09-10", outstanding:280 },
  { id:"LN-004", customer:"Zenith Bank Plc", product:"Reverse Factoring", principal:500, rate:19, dpd:45, stage:2, rating:"BBB+", start:"2023-11-01", maturity:"2024-05-01", outstanding:480 },
  { id:"LN-005", customer:"BUA Foods Plc", product:"Invoice Discounting", principal:190, rate:23, dpd:0, stage:1, rating:"A", start:"2024-04-05", maturity:"2024-10-05", outstanding:190 },
  { id:"LN-006", customer:"Unilever Nigeria Plc", product:"Supply Chain Finance", principal:150, rate:21, dpd:62, stage:2, rating:"BB+", start:"2023-10-15", maturity:"2024-04-15", outstanding:145 },
  { id:"LN-007", customer:"Nigerian Breweries Plc", product:"Factoring", principal:220, rate:22, dpd:5, stage:1, rating:"A-", start:"2024-03-20", maturity:"2024-09-20", outstanding:215 },
  { id:"LN-008", customer:"Cadbury Nigeria Plc", product:"Invoice Discounting", principal:85, rate:24, dpd:120, stage:3, rating:"CCC", start:"2023-08-01", maturity:"2024-02-01", outstanding:82 },
  { id:"LN-009", customer:"PZ Cussons Nigeria", product:"Factoring", principal:110, rate:22, dpd:95, stage:3, rating:"B-", start:"2023-09-10", maturity:"2024-03-10", outstanding:108 },
  { id:"LN-010", customer:"Nestle Nigeria Plc", product:"Supply Chain Finance", principal:340, rate:20, dpd:0, stage:1, rating:"AA-", start:"2024-04-01", maturity:"2024-10-01", outstanding:340 },
  { id:"LN-011", customer:"NNPC Gas & Power Ltd", product:"Reverse Factoring", principal:600, rate:18, dpd:30, stage:1, rating:"A+", start:"2024-01-20", maturity:"2024-07-20", outstanding:580 },
  { id:"LN-012", customer:"Access Bank Plc", product:"Invoice Discounting", principal:250, rate:20, dpd:0, stage:1, rating:"AA", start:"2024-02-15", maturity:"2024-08-15", outstanding:250 },
  { id:"LN-013", customer:"Total Energies Nigeria", product:"Supply Chain Finance", principal:180, rate:21, dpd:75, stage:2, rating:"BB", start:"2023-12-01", maturity:"2024-06-01", outstanding:172 },
  { id:"LN-014", customer:"Lafarge Africa Plc", product:"Factoring", principal:130, rate:23, dpd:0, stage:1, rating:"A-", start:"2024-03-01", maturity:"2024-09-01", outstanding:130 },
  { id:"LN-015", customer:"Julius Berger Nigeria", product:"Invoice Discounting", principal:200, rate:22, dpd:155, stage:3, rating:"D", start:"2023-06-15", maturity:"2023-12-15", outstanding:195 },
];

const BORROWINGS = [
  { id:"BW-001", lender:"FCMB Ltd", type:"Term Loan", principal:500, rate:19.5, tenor:24, outstanding:420, maturity:"2025-06-30", repayment:"Monthly" },
  { id:"BW-002", lender:"Stanbic IBTC Bank", type:"Overdraft Facility", principal:200, rate:23, tenor:12, outstanding:150, maturity:"2024-12-31", repayment:"Revolving" },
  { id:"BW-003", lender:"DBN Nigeria", type:"On-lending Facility", principal:800, rate:14, tenor:36, outstanding:720, maturity:"2026-09-30", repayment:"Quarterly" },
  { id:"BW-004", lender:"Bank of Industry", type:"SME Fund", principal:300, rate:12, tenor:48, outstanding:280, maturity:"2027-03-31", repayment:"Monthly" },
  { id:"BW-005", lender:"LAPO MfB", type:"Wholesale Borrowing", principal:150, rate:21, tenor:12, outstanding:100, maturity:"2024-10-31", repayment:"Monthly" },
  { id:"BW-006", lender:"Pan-African Holdings", type:"Intercompany Loan", principal:1000, rate:16, tenor:60, outstanding:1000, maturity:"2028-01-31", repayment:"Bullet" },
];

const INVESTMENTS = [
  { id:"INV-001", counterparty:"Access Bank Plc", type:"Fixed Deposit", principal:300, rate:22, dateInvested:"2024-03-01", days:180, maturity:"2024-08-28" },
  { id:"INV-002", counterparty:"GTBank Ltd", type:"Fixed Deposit", principal:200, rate:21.5, dateInvested:"2024-02-15", days:91, maturity:"2024-05-17" },
  { id:"INV-003", counterparty:"FGN Bond (10yr)", type:"Government Securities", principal:500, rate:17.5, dateInvested:"2023-10-01", days:365, maturity:"2033-10-01" },
  { id:"INV-004", counterparty:"NTB (91-day)", type:"Treasury Bills", principal:250, rate:20.5, dateInvested:"2024-04-01", days:91, maturity:"2024-07-01" },
  { id:"INV-005", counterparty:"Zenith Bank Plc", type:"Fixed Deposit", principal:150, rate:22, dateInvested:"2024-04-10", days:60, maturity:"2024-06-09" },
  { id:"INV-006", counterparty:"NTB (182-day)", type:"Treasury Bills", principal:400, rate:21, dateInvested:"2024-01-15", days:182, maturity:"2024-07-15" },
];

const CASH_ACCOUNTS = [
  { id:"CA-001", bank:"Access Bank Plc", account:"001-234567-001", type:"Current", balance:124.5, restricted:false, currency:"NGN" },
  { id:"CA-002", bank:"GTBank Ltd", account:"0123456789", type:"Current", balance:87.3, restricted:false, currency:"NGN" },
  { id:"CA-003", bank:"First Bank Nigeria", account:"2012345678", type:"Current", balance:43.8, restricted:true, currency:"NGN" },
  { id:"CA-004", bank:"Zenith Bank Plc", account:"1012345678", type:"Savings", balance:210.0, restricted:false, currency:"NGN" },
  { id:"CA-005", bank:"UBA Plc", account:"2012398765", type:"Current", balance:32.1, restricted:false, currency:"NGN" },
  { id:"CA-006", bank:"Access Bank Plc", account:"001-234567-002", type:"Dom (USD)", balance:18.4, restricted:false, currency:"USD" },
];

const CASH_TREND = [
  { month:"Nov", cash:410 }, { month:"Dec", cash:380 }, { month:"Jan", cash:445 },
  { month:"Feb", cash:398 }, { month:"Mar", cash:462 }, { month:"Apr", cash:490 },
  { month:"May", cash:517 }, { month:"Jun", cash:498 },
];

const ECL_TREND = [
  { month:"Jan", provision:45.2, coverage:3.1 }, { month:"Feb", provision:48.1, coverage:3.3 },
  { month:"Mar", provision:52.4, coverage:3.6 }, { month:"Apr", provision:55.8, coverage:3.8 },
  { month:"May", provision:61.2, coverage:4.1 }, { month:"Jun", provision:67.4, coverage:4.4 },
];

const LIQUIDITY_FORECAST = [
  { period:"Now", net:498, cumulative:498 },
  { period:"30d", net:312, cumulative:810 },
  { period:"60d", net:185, cumulative:995 },
  { period:"90d", net:-240, cumulative:755 },
  { period:"120d", net:420, cumulative:1175 },
  { period:"150d", net:380, cumulative:1555 },
  { period:"180d", net:290, cumulative:1845 },
];

// ─── ECL CALCULATION ENGINE ────────────────────────────────────────────────────
function calcECL(loans) {
  const PD_PARAMS = {
    1: { pd12m: 0.02, pdLifetime: 0.05, lgd: 0.45 },
    2: { pd12m: 0.15, pdLifetime: 0.35, lgd: 0.55 },
    3: { pd12m: 0.75, pdLifetime: 0.90, lgd: 0.65 },
  };
  return loans.map(l => {
    const p = PD_PARAMS[l.stage];
    const ead = l.outstanding;
    const ecl12m = p.pd12m * p.lgd * ead;
    const eclLifetime = p.pdLifetime * p.lgd * ead;
    const ecl = l.stage === 1 ? ecl12m : eclLifetime;
    return { ...l, pd: l.stage === 1 ? p.pd12m : p.pdLifetime, lgd: p.lgd, ead, ecl: +ecl.toFixed(2), eclRate: +(ecl / ead * 100).toFixed(2) };
  });
}

// ─── UTILITY HELPERS ──────────────────────────────────────────────────────────
const fmt = (n, d = 1) => n >= 1000 ? `₦${(n / 1000).toFixed(d)}B` : `₦${n.toFixed(d)}M`;
const fmtPct = n => `${n.toFixed(2)}%`;
const sum = (arr, key) => arr.reduce((a, b) => a + (b[key] || 0), 0);

function stageBadge(stage) {
  const cfg = { 1: ["#06d6a0", "#0d2b23", "Stage 1"], 2: ["#f5a623", "#2b200a", "Stage 2"], 3: ["#ff4560", "#2b0d12", "Stage 3"] };
  const [color, bg, label] = cfg[stage];
  return <span style={{ color, background: bg, border: `1px solid ${color}40`, padding: "2px 8px", borderRadius: 4, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", fontWeight: 600 }}>{label}</span>;
}

function KpiCard({ label, value, sub, color = T.teal, icon, delta }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "18px 20px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: color, borderRadius: "10px 0 0 10px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
          <div style={{ color: T.textPrimary, fontSize: 22, fontWeight: 700, fontFamily: "IBM Plex Mono, monospace", letterSpacing: "-0.02em" }}>{value}</div>
          {sub && <div style={{ color: T.textSecondary, fontSize: 11, marginTop: 4 }}>{sub}</div>}
          {delta !== undefined && (
            <div style={{ color: delta >= 0 ? T.green : T.red, fontSize: 11, marginTop: 4, fontFamily: "IBM Plex Mono, monospace" }}>
              {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% MoM
            </div>
          )}
        </div>
        {icon && <div style={{ fontSize: 24, opacity: 0.4 }}>{icon}</div>}
      </div>
    </div>
  );
}

function SectionHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ color: T.textPrimary, fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>{title}</h2>
      {sub && <p style={{ color: T.textSecondary, fontSize: 12, margin: "4px 0 0", fontFamily: "IBM Plex Mono, monospace" }}>{sub}</p>}
    </div>
  );
}

function Table({ cols, rows, compact }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: compact ? 11 : 12 }}>
        <thead>
          <tr>{cols.map(c => (
            <th key={c.key} style={{ textAlign: c.align || "left", padding: compact ? "8px 10px" : "10px 12px", borderBottom: `1px solid ${T.border}`, color: T.textSecondary, fontFamily: "IBM Plex Mono, monospace", fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>{c.label}</th>
          ))}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${T.border}20`, transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = T.cardHover}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {cols.map(c => (
                <td key={c.key} style={{ padding: compact ? "7px 10px" : "10px 12px", textAlign: c.align || "left", color: c.color ? c.color(r) : T.textPrimary, fontFamily: c.mono ? "IBM Plex Mono, monospace" : "inherit", whiteSpace: "nowrap" }}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ChartTooltipStyle = { background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, color: T.textPrimary, fontSize: 12 };

// ─── MODULE: EXECUTIVE DASHBOARD ──────────────────────────────────────────────
function DashboardView({ loans, borrowings, investments, cashAccounts }) {
  const eclLoans = useMemo(() => calcECL(loans), [loans]);
  const totalCash = useMemo(() => sum(cashAccounts.filter(a => a.currency === "NGN"), "balance"), [cashAccounts]);
  const totalLoans = useMemo(() => sum(loans, "outstanding"), [loans]);
  const totalECL = useMemo(() => sum(eclLoans, "ecl"), [eclLoans]);
  const totalBorrowings = useMemo(() => sum(borrowings, "outstanding"), [borrowings]);
  const totalInvestments = useMemo(() => sum(investments, "principal"), [investments]);
  const netLiquidity = totalCash + totalInvestments - totalBorrowings * 0.1;

  const stageData = useMemo(() => {
    const s1 = eclLoans.filter(l => l.stage === 1);
    const s2 = eclLoans.filter(l => l.stage === 2);
    const s3 = eclLoans.filter(l => l.stage === 3);
    return [
      { name: "Stage 1", value: sum(s1, "outstanding"), ecl: sum(s1, "ecl"), count: s1.length, fill: T.green },
      { name: "Stage 2", value: sum(s2, "outstanding"), ecl: sum(s2, "ecl"), count: s2.length, fill: T.gold },
      { name: "Stage 3", value: sum(s3, "outstanding"), ecl: sum(s3, "ecl"), count: s3.length, fill: T.red },
    ];
  }, [eclLoans]);

  const productData = useMemo(() => {
    const map = {};
    loans.forEach(l => { map[l.product] = (map[l.product] || 0) + l.outstanding; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [loans]);

  const maturityData = useMemo(() => {
    const buckets = { "0-30d": 0, "31-60d": 0, "61-90d": 0, "91-180d": 0, ">180d": 0 };
    const now = new Date("2024-06-01");
    loans.forEach(l => {
      const days = Math.max(0, (new Date(l.maturity) - now) / 86400000);
      if (days <= 30) buckets["0-30d"] += l.outstanding;
      else if (days <= 60) buckets["31-60d"] += l.outstanding;
      else if (days <= 90) buckets["61-90d"] += l.outstanding;
      else if (days <= 180) buckets["91-180d"] += l.outstanding;
      else buckets[">180d"] += l.outstanding;
    });
    return Object.entries(buckets).map(([period, loans]) => ({ period, loans }));
  }, [loans]);

  const COLORS = [T.teal, T.blue, T.purple, T.gold, T.green];

  return (
    <div>
      <SectionHeader title="Executive Dashboard" sub="Consolidated treasury & credit position — as at 01 June 2024" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
        <KpiCard label="Total Cash" value={fmt(totalCash)} sub="Across 6 accounts" color={T.teal} delta={2.4} />
        <KpiCard label="Net Liquidity" value={fmt(netLiquidity)} sub="Cash + Investments − Obligations" color={T.blue} delta={1.8} />
        <KpiCard label="Loan Book" value={fmt(totalLoans)} sub="15 active facilities" color={T.green} delta={4.2} />
        <KpiCard label="ECL Provision" value={fmt(totalECL)} sub={`Coverage: ${fmtPct(totalECL / totalLoans * 100)}`} color={T.gold} delta={8.6} />
        <KpiCard label="Total Borrowings" value={fmt(totalBorrowings)} sub="6 facilities" color={T.purple} delta={-1.2} />
        <KpiCard label="Investment Portfolio" value={fmt(totalInvestments)} sub="Avg yield: 20.9%" color={T.teal} delta={3.1} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Cash Position Trend (₦M)</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={CASH_TREND}>
              <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.teal} stopOpacity={0.3} /><stop offset="95%" stopColor={T.teal} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke={T.border} strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ChartTooltipStyle} />
              <Area type="monotone" dataKey="cash" stroke={T.teal} strokeWidth={2} fill="url(#cg)" dot={{ fill: T.teal, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Loan Stage Distribution (₦M)</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={stageData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {stageData.map((s, i) => <Cell key={i} fill={s.fill} />)}
                </Pie>
                <Tooltip contentStyle={ChartTooltipStyle} formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {stageData.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${T.border}30` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: s.fill }} />
                    <span style={{ color: T.textSecondary, fontSize: 11 }}>{s.name}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: T.textPrimary, fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}>{fmt(s.value)}</div>
                    <div style={{ color: T.textMuted, fontSize: 10 }}>ECL: {fmt(s.ecl)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Portfolio by Product (₦M)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={productData} layout="vertical">
              <CartesianGrid stroke={T.border} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: T.textSecondary, fontSize: 10 }} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={ChartTooltipStyle} formatter={(v) => fmt(v)} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {productData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Loan Maturity Ladder (₦M)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={maturityData}>
              <CartesianGrid stroke={T.border} strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ChartTooltipStyle} formatter={(v) => fmt(v)} />
              <Bar dataKey="loans" fill={T.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ─── MODULE: LOAN PORTFOLIO ───────────────────────────────────────────────────
function LoanPortfolioView({ loans }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let l = loans;
    if (filter !== "all") l = l.filter(x => x.stage === parseInt(filter));
    if (search) l = l.filter(x => x.customer.toLowerCase().includes(search.toLowerCase()) || x.id.toLowerCase().includes(search.toLowerCase()));
    return l;
  }, [loans, filter, search]);

  const total = sum(loans, "outstanding");
  const perf = loans.filter(l => l.dpd < 90);
  const nonPerf = loans.filter(l => l.dpd >= 90);

  const agingData = [
    { bucket: "Current", count: loans.filter(l => l.dpd === 0).length, value: sum(loans.filter(l => l.dpd === 0), "outstanding") },
    { bucket: "1-30d", count: loans.filter(l => l.dpd > 0 && l.dpd <= 30).length, value: sum(loans.filter(l => l.dpd > 0 && l.dpd <= 30), "outstanding") },
    { bucket: "31-60d", count: loans.filter(l => l.dpd > 30 && l.dpd <= 60).length, value: sum(loans.filter(l => l.dpd > 30 && l.dpd <= 60), "outstanding") },
    { bucket: "61-90d", count: loans.filter(l => l.dpd > 60 && l.dpd <= 90).length, value: sum(loans.filter(l => l.dpd > 60 && l.dpd <= 90), "outstanding") },
    { bucket: "91-180d", count: loans.filter(l => l.dpd > 90 && l.dpd <= 180).length, value: sum(loans.filter(l => l.dpd > 90 && l.dpd <= 180), "outstanding") },
    { bucket: ">180d", count: loans.filter(l => l.dpd > 180).length, value: sum(loans.filter(l => l.dpd > 180), "outstanding") },
  ];

  const cols = [
    { key: "id", label: "Loan ID", mono: true, color: () => T.teal },
    { key: "customer", label: "Customer" },
    { key: "product", label: "Product", color: () => T.textSecondary },
    { key: "outstanding", label: "Outstanding (₦M)", align: "right", mono: true, render: r => fmt(r.outstanding) },
    { key: "rate", label: "Rate", align: "right", mono: true, render: r => `${r.rate}%` },
    { key: "dpd", label: "DPD", align: "right", mono: true, color: r => r.dpd >= 90 ? T.red : r.dpd >= 30 ? T.gold : T.green },
    { key: "stage", label: "Stage", render: r => stageBadge(r.stage) },
    { key: "rating", label: "Rating", mono: true, color: r => r.rating?.startsWith("A") ? T.green : r.rating?.startsWith("B") ? T.gold : T.red },
    { key: "maturity", label: "Maturity", color: () => T.textSecondary, mono: true },
  ];

  const inputStyle = { background: T.navy, border: `1px solid ${T.border}`, borderRadius: 6, color: T.textPrimary, padding: "7px 12px", fontSize: 12, fontFamily: "IBM Plex Mono, monospace", outline: "none" };
  const btnStyle = (active) => ({ background: active ? T.teal : "transparent", color: active ? "#000" : T.textSecondary, border: `1px solid ${active ? T.teal : T.border}`, borderRadius: 6, padding: "6px 14px", fontSize: 11, cursor: "pointer", fontFamily: "IBM Plex Mono, monospace", fontWeight: 600 });

  return (
    <div>
      <SectionHeader title="Loan Portfolio Management" sub={`${loans.length} facilities · Total outstanding: ${fmt(total)}`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Total Exposure" value={fmt(total)} color={T.teal} />
        <KpiCard label="Performing (NPL < 90d)" value={fmt(sum(perf, "outstanding"))} sub={`${perf.length} loans`} color={T.green} />
        <KpiCard label="Non-Performing" value={fmt(sum(nonPerf, "outstanding"))} sub={`${nonPerf.length} loans`} color={T.red} />
        <KpiCard label="NPL Ratio" value={fmtPct(sum(nonPerf, "outstanding") / total * 100)} sub="IFRS 9 Stage 3" color={T.gold} />
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Loan Aging Distribution (₦M)</div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={agingData}>
            <CartesianGrid stroke={T.border} strokeDasharray="3 3" />
            <XAxis dataKey="bucket" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ChartTooltipStyle} formatter={(v, n) => [fmt(v), "Outstanding"]} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {agingData.map((d, i) => <Cell key={i} fill={i === 0 ? T.green : i <= 1 ? T.teal : i <= 2 ? T.blue : i <= 3 ? T.gold : T.red} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[["all","All"],["1","Stage 1"],["2","Stage 2"],["3","Stage 3"]].map(([v,l]) => (
              <button key={v} style={btnStyle(filter === v)} onClick={() => setFilter(v)}>{l}</button>
            ))}
          </div>
          <input style={{ ...inputStyle, width: 220 }} placeholder="Search customer / ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Table cols={cols} rows={filtered} compact />
        <div style={{ marginTop: 12, color: T.textMuted, fontSize: 10, fontFamily: "IBM Plex Mono, monospace" }}>
          Showing {filtered.length} of {loans.length} facilities · Total: {fmt(sum(filtered, "outstanding"))}
        </div>
      </div>
    </div>
  );
}

// ─── MODULE: ECL MODEL ────────────────────────────────────────────────────────
function ECLModelView({ loans }) {
  const [pdAdj, setPdAdj] = useState(0);
  const eclLoans = useMemo(() => {
    const adj = 1 + pdAdj / 100;
    return calcECL(loans).map(l => ({ ...l, pd: +(l.pd * adj).toFixed(4), ecl: +(l.ecl * adj).toFixed(2) }));
  }, [loans, pdAdj]);

  const totalECL = sum(eclLoans, "ecl");
  const totalEAD = sum(eclLoans, "ead");
  const coverage = totalECL / totalEAD * 100;

  const stageStats = [1, 2, 3].map(s => {
    const sl = eclLoans.filter(l => l.stage === s);
    return { stage: s, count: sl.length, ead: sum(sl, "ead"), ecl: sum(sl, "ecl") };
  });

  const heatmapData = eclLoans.map(l => ({
    name: l.customer.split(" ")[0],
    ecl: l.ecl,
    ead: l.ead,
    eclRate: l.eclRate,
    stage: l.stage,
  }));

  const cols = [
    { key: "id", label: "Loan ID", mono: true, color: () => T.teal },
    { key: "customer", label: "Customer" },
    { key: "stage", label: "Stage", render: r => stageBadge(r.stage) },
    { key: "ead", label: "EAD (₦M)", align: "right", mono: true, render: r => fmt(r.ead) },
    { key: "pd", label: "PD", align: "right", mono: true, render: r => fmtPct(r.pd * 100), color: r => r.pd > 0.5 ? T.red : r.pd > 0.1 ? T.gold : T.green },
    { key: "lgd", label: "LGD", align: "right", mono: true, render: r => fmtPct(r.lgd * 100) },
    { key: "ecl", label: "ECL (₦M)", align: "right", mono: true, render: r => fmt(r.ecl), color: r => r.ecl > 50 ? T.red : r.ecl > 20 ? T.gold : T.green },
    { key: "eclRate", label: "ECL Rate", align: "right", mono: true, render: r => `${r.eclRate}%`, color: r => r.eclRate > 50 ? T.red : r.eclRate > 15 ? T.gold : T.teal },
  ];

  return (
    <div>
      <SectionHeader title="Expected Credit Loss (ECL) Model" sub="IFRS 9 compliant · Stage 1: 12-month ECL · Stage 2 & 3: Lifetime ECL" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Total ECL Provision" value={fmt(totalECL)} color={T.gold} />
        <KpiCard label="Coverage Ratio" value={fmtPct(coverage)} sub="ECL / EAD" color={T.teal} />
        <KpiCard label="Stage 2 Exposure" value={fmt(stageStats[1].ead)} sub={`${stageStats[1].count} loans`} color={T.gold} />
        <KpiCard label="Stage 3 Exposure" value={fmt(stageStats[2].ead)} sub={`${stageStats[2].count} loans`} color={T.red} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>ECL Provision Trend (₦M)</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={ECL_TREND}>
              <CartesianGrid stroke={T.border} strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ChartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 10, color: T.textSecondary }} />
              <Line yAxisId="left" type="monotone" dataKey="provision" stroke={T.gold} strokeWidth={2} dot={{ fill: T.gold, r: 3 }} name="Provision (₦M)" />
              <Line yAxisId="right" type="monotone" dataKey="coverage" stroke={T.teal} strokeWidth={2} dot={{ fill: T.teal, r: 3 }} name="Coverage %" strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Stage Distribution</div>
          {stageStats.map((s, i) => {
            const pct = s.ead / totalEAD * 100;
            const colors = [T.green, T.gold, T.red];
            return (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: T.textSecondary, fontSize: 11 }}>Stage {s.stage} ({s.count} loans)</span>
                  <span style={{ color: colors[i], fontFamily: "IBM Plex Mono, monospace", fontSize: 11 }}>{fmt(s.ead)} · ECL: {fmt(s.ecl)}</span>
                </div>
                <div style={{ background: T.navy, borderRadius: 4, height: 8, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: colors[i], borderRadius: 4, transition: "width 0.6s ease" }} />
                </div>
                <div style={{ color: T.textMuted, fontSize: 10, marginTop: 2, fontFamily: "IBM Plex Mono, monospace" }}>{pct.toFixed(1)}% of portfolio</div>
              </div>
            );
          })}

          <div style={{ marginTop: 16, borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
            <div style={{ color: T.textSecondary, fontSize: 11, marginBottom: 8 }}>Scenario Analysis — PD Stress Test</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="range" min={-50} max={100} value={pdAdj} onChange={e => setPdAdj(+e.target.value)}
                style={{ flex: 1, accentColor: T.teal }} />
              <span style={{ color: pdAdj > 0 ? T.red : T.green, fontFamily: "IBM Plex Mono, monospace", fontSize: 12, minWidth: 60 }}>
                {pdAdj > 0 ? "+" : ""}{pdAdj}%
              </span>
            </div>
            <div style={{ color: T.textMuted, fontSize: 10, marginTop: 4 }}>
              Stressed ECL: <span style={{ color: T.gold, fontFamily: "IBM Plex Mono, monospace" }}>{fmt(totalECL)}</span> · Coverage: <span style={{ color: T.teal, fontFamily: "IBM Plex Mono, monospace" }}>{fmtPct(coverage)}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Credit Risk Heatmap — ECL Rate by Facility (₦M)</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={heatmapData} margin={{ left: 60 }}>
            <CartesianGrid stroke={T.border} strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fill: T.textMuted, fontSize: 9 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ChartTooltipStyle} formatter={(v, n, p) => [n === "ead" ? fmt(v) : `${v}%`, n === "ead" ? "EAD" : "ECL Rate"]} />
            <Bar dataKey="ead" name="EAD" fill={T.blue} opacity={0.5} radius={[2, 2, 0, 0]} />
            <Bar dataKey="ecl" name="ECL" fill={T.gold} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
        <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Loan-level ECL Schedule</div>
        <Table cols={cols} rows={eclLoans} compact />
        <div style={{ marginTop: 12, padding: "10px 0", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace" }}>TOTAL ECL PROVISION</span>
          <span style={{ color: T.gold, fontSize: 14, fontFamily: "IBM Plex Mono, monospace", fontWeight: 700 }}>{fmt(totalECL)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── MODULE: BORROWINGS ───────────────────────────────────────────────────────
function BorrowingsView({ borrowings }) {
  const total = sum(borrowings, "outstanding");
  const wacd = borrowings.reduce((acc, b) => acc + (b.outstanding / total) * b.rate, 0);

  const maturityData = useMemo(() => {
    const now = new Date("2024-06-01");
    return borrowings.map(b => ({
      lender: b.lender.split(" ")[0],
      outstanding: b.outstanding,
      days: Math.max(0, Math.round((new Date(b.maturity) - now) / 86400000)),
      rate: b.rate,
      type: b.type,
    })).sort((a, b) => a.days - b.days);
  }, [borrowings]);

  const debtByType = useMemo(() => {
    const map = {};
    borrowings.forEach(b => { map[b.type] = (map[b.type] || 0) + b.outstanding; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [borrowings]);

  const COLORS = [T.teal, T.blue, T.purple, T.gold, T.green, T.red];

  const cols = [
    { key: "id", label: "ID", mono: true, color: () => T.teal },
    { key: "lender", label: "Lender" },
    { key: "type", label: "Type", color: () => T.textSecondary },
    { key: "outstanding", label: "Outstanding (₦M)", align: "right", mono: true, render: r => fmt(r.outstanding) },
    { key: "rate", label: "Rate", align: "right", mono: true, render: r => `${r.rate}%`, color: r => r.rate > 20 ? T.red : r.rate > 16 ? T.gold : T.green },
    { key: "tenor", label: "Tenor (mo)", align: "right", mono: true },
    { key: "repayment", label: "Repayment", color: () => T.textSecondary },
    { key: "maturity", label: "Maturity", mono: true, color: () => T.textSecondary },
  ];

  return (
    <div>
      <SectionHeader title="Borrowings Management" sub="Debt facilities · Cost of funds analysis" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Total Debt" value={fmt(total)} color={T.purple} />
        <KpiCard label="WACD" value={fmtPct(wacd)} sub="Wtd. avg. cost of debt" color={T.gold} />
        <KpiCard label="Facilities" value={borrowings.length} sub="Active borrowings" color={T.teal} />
        <KpiCard label="Interco. Debt" value={fmt(borrowings.find(b => b.type === "Intercompany Loan")?.outstanding || 0)} sub="Pan-African Holdings" color={T.blue} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Debt Maturity Profile (₦M)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={maturityData}>
              <CartesianGrid stroke={T.border} strokeDasharray="3 3" />
              <XAxis dataKey="lender" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ChartTooltipStyle} formatter={(v) => fmt(v)} />
              <Bar dataKey="outstanding" radius={[4, 4, 0, 0]}>
                {maturityData.map((d, i) => <Cell key={i} fill={d.days < 180 ? T.red : d.days < 360 ? T.gold : T.teal} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
            {[["< 180d", T.red], ["180-360d", T.gold], ["> 360d", T.teal]].map(([l, c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />
                <span style={{ color: T.textMuted, fontSize: 10 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Debt by Facility Type</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={debtByType} cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                {debtByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={ChartTooltipStyle} formatter={(v) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
        <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Borrowings Schedule</div>
        <Table cols={cols} rows={borrowings} />
      </div>
    </div>
  );
}

// ─── MODULE: INVESTMENTS ──────────────────────────────────────────────────────
function InvestmentsView({ investments }) {
  const total = sum(investments, "principal");
  const interest = useMemo(() => investments.reduce((acc, inv) => {
    const days = inv.days;
    return acc + inv.principal * (inv.rate / 100) * (days / 365);
  }, 0), [investments]);

  const avgYield = investments.reduce((acc, inv) => acc + (inv.principal / total) * inv.rate, 0);

  const maturityData = investments.map(inv => ({
    counterparty: inv.counterparty.split(" ")[0],
    principal: inv.principal,
    interest: +(inv.principal * (inv.rate / 100) * (inv.days / 365)).toFixed(2),
    rate: inv.rate,
    days: inv.days,
  }));

  const typeData = useMemo(() => {
    const map = {};
    investments.forEach(inv => { map[inv.type] = (map[inv.type] || 0) + inv.principal; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [investments]);

  const COLORS = [T.teal, T.blue, T.gold, T.purple];

  const cols = [
    { key: "id", label: "ID", mono: true, color: () => T.teal },
    { key: "counterparty", label: "Counterparty" },
    { key: "type", label: "Type", color: () => T.textSecondary },
    { key: "principal", label: "Principal (₦M)", align: "right", mono: true, render: r => fmt(r.principal) },
    { key: "rate", label: "Rate", align: "right", mono: true, render: r => `${r.rate}%`, color: () => T.green },
    { key: "days", label: "Tenor", align: "right", mono: true, render: r => `${r.days}d` },
    { key: "dateInvested", label: "Date Invested", mono: true, color: () => T.textSecondary },
    { key: "maturity", label: "Maturity", mono: true, color: () => T.textSecondary },
    { key: "interest", label: "Interest (₦M)", align: "right", mono: true, render: r => fmt(r.principal * (r.rate / 100) * (r.days / 365)), color: () => T.gold },
  ];

  return (
    <div>
      <SectionHeader title="Investment Portfolio" sub="Treasury placements · Yield analysis" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Portfolio Value" value={fmt(total)} color={T.teal} />
        <KpiCard label="Projected Interest" value={fmt(interest)} sub="Full tenor" color={T.gold} />
        <KpiCard label="Avg. Yield" value={fmtPct(avgYield)} sub="Wtd. average" color={T.green} />
        <KpiCard label="Instruments" value={investments.length} sub="Active placements" color={T.blue} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Investment Maturity Ladder & Accrued Interest (₦M)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={maturityData}>
              <CartesianGrid stroke={T.border} strokeDasharray="3 3" />
              <XAxis dataKey="counterparty" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ChartTooltipStyle} formatter={(v) => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 10, color: T.textSecondary }} />
              <Bar dataKey="principal" name="Principal" fill={T.teal} radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="interest" name="Interest" fill={T.gold} radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Portfolio Mix</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" outerRadius={75} paddingAngle={3} dataKey="value">
                {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={ChartTooltipStyle} formatter={(v) => fmt(v)} />
              <Legend wrapperStyle={{ fontSize: 10, color: T.textSecondary }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
        <Table cols={cols} rows={investments} />
      </div>
    </div>
  );
}

// ─── MODULE: CASH POSITION ────────────────────────────────────────────────────
function CashView({ cashAccounts }) {
  const ngnAccounts = cashAccounts.filter(a => a.currency === "NGN");
  const usdAccounts = cashAccounts.filter(a => a.currency === "USD");
  const totalNGN = sum(ngnAccounts, "balance");
  const totalUnrestricted = sum(ngnAccounts.filter(a => !a.restricted), "balance");
  const totalRestricted = sum(ngnAccounts.filter(a => a.restricted), "balance");
  const totalUSD = sum(usdAccounts, "balance");

  const cols = [
    { key: "id", label: "Account ID", mono: true, color: () => T.teal },
    { key: "bank", label: "Bank" },
    { key: "account", label: "Account No.", mono: true, color: () => T.textSecondary },
    { key: "type", label: "Type", color: () => T.textSecondary },
    { key: "currency", label: "CCY", mono: true, color: r => r.currency === "USD" ? T.gold : T.textPrimary },
    { key: "balance", label: "Balance", align: "right", mono: true, render: r => r.currency === "USD" ? `$${r.balance.toFixed(2)}M` : fmt(r.balance), color: r => r.restricted ? T.textMuted : T.textPrimary },
    { key: "restricted", label: "Status", render: r => <span style={{ color: r.restricted ? T.red : T.green, fontFamily: "IBM Plex Mono, monospace", fontSize: 11 }}>{r.restricted ? "🔒 Restricted" : "✓ Available"}</span> },
  ];

  const bankData = ngnAccounts.map(a => ({ bank: a.bank.split(" ")[0], balance: a.balance, restricted: a.restricted }));

  return (
    <div>
      <SectionHeader title="Cash Position" sub="Real-time treasury balances across all accounts" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Total NGN Cash" value={fmt(totalNGN)} color={T.teal} delta={1.5} />
        <KpiCard label="Unrestricted Cash" value={fmt(totalUnrestricted)} sub="Available for use" color={T.green} />
        <KpiCard label="Restricted Cash" value={fmt(totalRestricted)} sub="Encumbered" color={T.red} />
        <KpiCard label="FX Holdings (USD)" value={`$${totalUSD.toFixed(1)}M`} sub={`≈ ₦${(totalUSD * 1580).toFixed(0)}M`} color={T.gold} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Cash Trend (₦M)</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={CASH_TREND}>
              <defs><linearGradient id="cgt2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={T.teal} stopOpacity={0.25} /><stop offset="95%" stopColor={T.teal} stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke={T.border} strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ChartTooltipStyle} />
              <Area type="monotone" dataKey="cash" stroke={T.teal} strokeWidth={2} fill="url(#cgt2)" dot={{ fill: T.teal, r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Cash by Bank (₦M)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={bankData}>
              <CartesianGrid stroke={T.border} strokeDasharray="3 3" />
              <XAxis dataKey="bank" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ChartTooltipStyle} formatter={(v) => fmt(v)} />
              <Bar dataKey="balance" radius={[4, 4, 0, 0]}>
                {bankData.map((d, i) => <Cell key={i} fill={d.restricted ? T.red : T.teal} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
        <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Bank Account Balances</div>
        <Table cols={cols} rows={cashAccounts} />
      </div>
    </div>
  );
}

// ─── MODULE: LIQUIDITY ────────────────────────────────────────────────────────
function LiquidityView({ loans, borrowings, investments, cashAccounts }) {
  const totalCash = sum(cashAccounts.filter(a => a.currency === "NGN"), "balance");
  const totalInv = sum(investments, "principal");
  const totalDebt = sum(borrowings, "outstanding");
  const totalLoans = sum(loans, "outstanding");
  const netLiq = totalCash + totalInv - totalDebt * 0.1;
  const liqRatio = (totalCash + totalInv) / (totalDebt * 0.2 + totalLoans * 0.1) * 100;

  const gapData = [
    { period: "0-7d", inflows: 245, outflows: 180, gap: 65 },
    { period: "8-30d", inflows: 380, outflows: 420, gap: -40 },
    { period: "31-60d", inflows: 510, outflows: 290, gap: 220 },
    { period: "61-90d", inflows: 180, outflows: 480, gap: -300 },
    { period: "91-180d", inflows: 620, outflows: 210, gap: 410 },
    { period: "181-365d", inflows: 850, outflows: 320, gap: 530 },
  ];

  return (
    <div>
      <SectionHeader title="Liquidity Management" sub="Net liquidity position · Cash flow forecast · Gap analysis" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <KpiCard label="Net Liquidity" value={fmt(netLiq)} color={T.teal} delta={2.1} />
        <KpiCard label="Liquidity Ratio" value={fmtPct(liqRatio)} sub="Liquid assets / obligations" color={T.green} />
        <KpiCard label="30d Cash Forecast" value={fmt(LIQUIDITY_FORECAST[1].cumulative)} sub="Projected balance" color={T.blue} />
        <KpiCard label="90d Gap" value={fmt(LIQUIDITY_FORECAST.find(d => d.period === "90d")?.net || 0)} sub={`${LIQUIDITY_FORECAST.find(d => d.period === "90d")?.net < 0 ? "Deficit" : "Surplus"}`} color={LIQUIDITY_FORECAST.find(d => d.period === "90d")?.net < 0 ? T.red : T.green} />
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>180-Day Liquidity Forecast (₦M)</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={LIQUIDITY_FORECAST}>
            <defs>
              <linearGradient id="liqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={T.blue} stopOpacity={0.3} />
                <stop offset="95%" stopColor={T.blue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={T.border} strokeDasharray="3 3" />
            <XAxis dataKey="period" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ChartTooltipStyle} formatter={(v) => fmt(v)} />
            <Legend wrapperStyle={{ fontSize: 10, color: T.textSecondary }} />
            <ReferenceLine y={0} stroke={T.border} strokeDasharray="4 4" />
            <Area type="monotone" dataKey="cumulative" name="Cumulative" stroke={T.blue} strokeWidth={2} fill="url(#liqGrad)" dot={{ fill: T.blue, r: 3 }} />
            <Bar dataKey="net" name="Net Flow" fill={T.teal} radius={[2, 2, 0, 0]} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Liquidity Gap Analysis (₦M) — Inflows vs. Outflows</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={gapData}>
            <CartesianGrid stroke={T.border} strokeDasharray="3 3" />
            <XAxis dataKey="period" tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: T.textMuted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={ChartTooltipStyle} formatter={(v) => fmt(v)} />
            <Legend wrapperStyle={{ fontSize: 10, color: T.textSecondary }} />
            <Bar dataKey="inflows" name="Inflows" fill={T.green} radius={[4, 4, 0, 0]} />
            <Bar dataKey="outflows" name="Outflows" fill={T.red} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Liquidity Sources</div>
          {[
            { label: "Unrestricted Cash", value: sum(cashAccounts.filter(a => !a.restricted && a.currency === "NGN"), "balance"), color: T.teal },
            { label: "Investment Maturities (<90d)", value: sum(investments.filter(inv => inv.days <= 90), "principal"), color: T.blue },
            { label: "Loan Collections (est.)", value: totalLoans * 0.12, color: T.green },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}30` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 3, height: 16, background: item.color, borderRadius: 2 }} />
                <span style={{ color: T.textSecondary, fontSize: 12 }}>{item.label}</span>
              </div>
              <span style={{ color: item.color, fontFamily: "IBM Plex Mono, monospace", fontSize: 13, fontWeight: 600 }}>{fmt(item.value)}</span>
            </div>
          ))}
        </div>

        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 20 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Liquidity Obligations</div>
          {[
            { label: "Debt Due (<90d)", value: sum(borrowings.filter(b => b.outstanding > 0 && b.type !== "Intercompany Loan"), "outstanding") * 0.15, color: T.red },
            { label: "Operational Expenses", value: 45, color: T.gold },
            { label: "Funding Commitments", value: 120, color: T.purple },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.border}30` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 3, height: 16, background: item.color, borderRadius: 2 }} />
                <span style={{ color: T.textSecondary, fontSize: 12 }}>{item.label}</span>
              </div>
              <span style={{ color: item.color, fontFamily: "IBM Plex Mono, monospace", fontSize: 13, fontWeight: 600 }}>{fmt(item.value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── UPLOAD MODAL ─────────────────────────────────────────────────────────────
function UploadModal({ onClose, module }) {
  const [step, setStep] = useState("idle");
  const [rows, setRows] = useState([]);

  const handleFile = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStep("validating");
    setTimeout(() => {
      setRows([
        { status: "✓", row: 1, data: "Sample row validated" },
        { status: "✓", row: 2, data: "Sample row validated" },
        { status: "⚠", row: 3, data: "Warning: Rate field missing — defaulted to 0%" },
      ]);
      setStep("preview");
    }, 1200);
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000a", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28, width: 480, boxShadow: "0 24px 64px #0008" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ color: T.textPrimary, fontWeight: 700, fontSize: 15 }}>Upload {module}</div>
            <div style={{ color: T.textMuted, fontSize: 11, fontFamily: "IBM Plex Mono, monospace", marginTop: 2 }}>CSV / Excel (.xlsx) supported</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.textMuted, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>

        {step === "idle" && (
          <label style={{ display: "block", border: `2px dashed ${T.borderLight}`, borderRadius: 10, padding: 32, textAlign: "center", cursor: "pointer", transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.teal}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.borderLight}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📂</div>
            <div style={{ color: T.textPrimary, fontSize: 13, marginBottom: 4 }}>Drop file or click to browse</div>
            <div style={{ color: T.textMuted, fontSize: 11 }}>Max 5MB · CSV or XLSX</div>
            <input type="file" accept=".csv,.xlsx" onChange={handleFile} style={{ display: "none" }} />
          </label>
        )}

        {step === "validating" && (
          <div style={{ textAlign: "center", padding: 32 }}>
            <div style={{ color: T.teal, fontSize: 24, marginBottom: 8 }}>⟳</div>
            <div style={{ color: T.textSecondary, fontSize: 13 }}>Validating and parsing data...</div>
          </div>
        )}

        {step === "preview" && (
          <div>
            <div style={{ background: T.navy, borderRadius: 8, padding: 16, marginBottom: 16, maxHeight: 160, overflowY: "auto" }}>
              {rows.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "4px 0", borderBottom: `1px solid ${T.border}30`, fontSize: 11 }}>
                  <span style={{ color: r.status === "✓" ? T.green : T.gold, fontFamily: "IBM Plex Mono, monospace" }}>{r.status}</span>
                  <span style={{ color: T.textMuted, fontFamily: "IBM Plex Mono, monospace" }}>Row {r.row}</span>
                  <span style={{ color: T.textSecondary }}>{r.data}</span>
                </div>
              ))}
            </div>
            <button onClick={() => { setStep("done"); setTimeout(onClose, 1500); }}
              style={{ width: "100%", background: T.teal, color: "#000", border: "none", borderRadius: 8, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "IBM Plex Mono, monospace" }}>
              Confirm Import
            </button>
          </div>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: 24 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ color: T.green, fontSize: 13 }}>Data imported successfully</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadModule, setUploadModule] = useState("");

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "▣" },
    { id: "loans", label: "Loans", icon: "🏦" },
    { id: "ecl", label: "ECL Model", icon: "⚡" },
    { id: "borrowings", label: "Borrowings", icon: "↕" },
    { id: "investments", label: "Investments", icon: "📈" },
    { id: "cash", label: "Cash", icon: "💵" },
    { id: "liquidity", label: "Liquidity", icon: "💧" },
  ];

  const uploadMap = { loans: "Loan Portfolio", borrowings: "Borrowings", investments: "Investment Portfolio", cash: "Cash Balances" };

  return (
    <div style={{ minHeight: "100vh", background: T.navy, fontFamily: "'Syne', 'IBM Plex Mono', sans-serif", color: T.textPrimary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1a2e4a; border-radius: 2px; }
        input[type=range] { height: 4px; border-radius: 2px; }
      `}</style>

      {/* TOP NAVIGATION */}
      <div style={{ borderBottom: `1px solid ${T.border}`, background: T.card, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg, ${T.teal}, ${T.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}>⬡</div>
          <div>
            <div style={{ color: T.textPrimary, fontWeight: 800, fontSize: 13, letterSpacing: "-0.01em" }}>FSCF Treasury Intelligence</div>
            <div style={{ color: T.textMuted, fontSize: 9, fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.06em" }}>FACTORING & SUPPLY CHAIN FINANCE LTD</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 2 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ background: activeTab === t.id ? `${T.teal}15` : "transparent", color: activeTab === t.id ? T.teal : T.textSecondary, border: activeTab === t.id ? `1px solid ${T.teal}30` : "1px solid transparent", borderRadius: 6, padding: "6px 12px", fontSize: 11, cursor: "pointer", fontFamily: "IBM Plex Mono, monospace", fontWeight: activeTab === t.id ? 600 : 400, transition: "all 0.15s", whiteSpace: "nowrap" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {uploadMap[activeTab] && (
            <button onClick={() => { setUploadModule(uploadMap[activeTab]); setShowUpload(true); }}
              style={{ background: T.teal, color: "#000", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "IBM Plex Mono, monospace" }}>
              ↑ Upload
            </button>
          )}
          <div style={{ background: T.navy, borderRadius: 6, padding: "5px 10px", fontSize: 10, fontFamily: "IBM Plex Mono, monospace", color: T.textMuted, border: `1px solid ${T.border}` }}>
            01 Jun 2024 · 09:41 WAT
          </div>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${T.purple}, ${T.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>F</div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ padding: 28, maxWidth: 1400, margin: "0 auto" }}>
        {activeTab === "dashboard" && <DashboardView loans={LOANS} borrowings={BORROWINGS} investments={INVESTMENTS} cashAccounts={CASH_ACCOUNTS} />}
        {activeTab === "loans" && <LoanPortfolioView loans={LOANS} />}
        {activeTab === "ecl" && <ECLModelView loans={LOANS} />}
        {activeTab === "borrowings" && <BorrowingsView borrowings={BORROWINGS} />}
        {activeTab === "investments" && <InvestmentsView investments={INVESTMENTS} />}
        {activeTab === "cash" && <CashView cashAccounts={CASH_ACCOUNTS} />}
        {activeTab === "liquidity" && <LiquidityView loans={LOANS} borrowings={BORROWINGS} investments={INVESTMENTS} cashAccounts={CASH_ACCOUNTS} />}
      </div>

      {/* STATUS BAR */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: T.card, borderTop: `1px solid ${T.border}`, padding: "6px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 20 }}>
          {[["Loans", fmt(sum(LOANS, "outstanding")), T.teal], ["ECL", fmt(sum(calcECL(LOANS), "ecl")), T.gold], ["Debt", fmt(sum(BORROWINGS, "outstanding")), T.purple], ["Cash", fmt(sum(CASH_ACCOUNTS.filter(a => a.currency === "NGN"), "balance")), T.green]].map(([l, v, c]) => (
            <div key={l} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ color: T.textMuted, fontSize: 9, fontFamily: "IBM Plex Mono, monospace", textTransform: "uppercase" }}>{l}:</span>
              <span style={{ color: c, fontSize: 10, fontFamily: "IBM Plex Mono, monospace", fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.green, animation: "pulse 2s infinite" }} />
          <span style={{ color: T.textMuted, fontSize: 9, fontFamily: "IBM Plex Mono, monospace" }}>LIVE · CBN-licensed · IFRS 9 compliant</span>
        </div>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} module={uploadModule} />}
    </div>
  );
}
