import { useState, useEffect, useRef, useMemo } from "react";

// ─── SUNTREX STRATEGIC COMMAND CENTER ───
// Business Audit Dashboard — Linear × Vercel × Stripe DNA

const ACCENT = { from: "#06b6d4", to: "#6366f1" };
const COLORS = {
  bg: "#08081a",
  surface: "rgba(255,255,255,0.03)",
  elevated: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.06)",
  borderHover: "rgba(255,255,255,0.12)",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#f43f5e",
  violet: "#8b5cf6",
  cyan: "#06b6d4",
  indigo: "#6366f1",
};

// ─── SPARKLINE COMPONENT ───
const Sparkline = ({ data, color = COLORS.cyan, width = 80, height = 28 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#spark-${color.replace("#", "")})`}
      />
    </svg>
  );
};

// ─── ANIMATED COUNTER ───
const AnimCounter = ({ target, prefix = "", suffix = "", decimals = 0, duration = 1800 }) => {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    let start = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(eased * target);
      if (p < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return (
    <span>
      {prefix}
      {val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
      {suffix}
    </span>
  );
};

// ─── DONUT CHART ───
const DonutChart = ({ segments, size = 120, strokeWidth = 14, centerLabel, centerValue }) => {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {segments.map((seg, i) => {
          const dash = (seg.value / 100) * c;
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 1s cubic-bezier(.16,1,.3,1)" }}
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.text }}>{centerValue}</span>
        <span style={{ fontSize: 9, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: COLORS.textDim }}>
          {centerLabel}
        </span>
      </div>
    </div>
  );
};

// ─── PROGRESS BAR ───
const ProgressBar = ({ value, max = 100, color = COLORS.cyan, label, sublabel }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: COLORS.text }}>{label}</span>
      <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace" }}>
        {value}/{max}
      </span>
    </div>
    <div
      style={{
        height: 6,
        borderRadius: 3,
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${(value / max) * 100}%`,
          borderRadius: 3,
          background: `linear-gradient(90deg, ${color}, ${COLORS.indigo})`,
          transition: "width 1.2s cubic-bezier(.16,1,.3,1)",
        }}
      />
    </div>
    {sublabel && (
      <span style={{ fontSize: 10, color: COLORS.textDim, marginTop: 2, display: "block" }}>
        {sublabel}
      </span>
    )}
  </div>
);

// ─── GLASS CARD ───
const GlassCard = ({ children, style = {}, hover = true, onClick, glow }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: COLORS.surface,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: `1px solid ${hovered && hover ? COLORS.borderHover : COLORS.border}`,
        borderRadius: 14,
        padding: 20,
        transition: "all 0.3s cubic-bezier(.16,1,.3,1)",
        transform: hovered && hover ? "translateY(-2px)" : "none",
        boxShadow: hovered && hover
          ? `0 8px 32px rgba(6,182,212,0.08), 0 0 0 1px ${COLORS.borderHover}`
          : "0 2px 8px rgba(0,0,0,0.2)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── PILL BADGE ───
const Pill = ({ children, color = COLORS.cyan, small }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 4,
      padding: small ? "2px 8px" : "4px 12px",
      borderRadius: 20,
      background: `${color}15`,
      color,
      fontSize: small ? 9 : 11,
      fontWeight: 600,
      letterSpacing: "0.02em",
      textTransform: "uppercase",
    }}
  >
    {children}
  </span>
);

// ─── PULSE DOT ───
const PulseDot = ({ color = COLORS.success }) => (
  <span style={{ position: "relative", display: "inline-block", width: 8, height: 8 }}>
    <span
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: "50%",
        background: color,
        animation: "pulse-dot 2s infinite",
      }}
    />
    <span
      style={{
        position: "absolute",
        inset: -3,
        borderRadius: "50%",
        background: color,
        opacity: 0.3,
        animation: "pulse-ring 2s infinite",
      }}
    />
  </span>
);

// ─── TREND ARROW ───
const TrendArrow = ({ up, value }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 2,
      color: up ? COLORS.success : COLORS.error,
      fontSize: 11,
      fontWeight: 600,
    }}
  >
    {up ? "↑" : "↓"} {value}
  </span>
);

// ─── SECTION TITLE ───
const SectionTitle = ({ children, icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, marginTop: 8 }}>
    {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
    <h2
      style={{
        fontSize: 13,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: COLORS.textDim,
        margin: 0,
      }}
    >
      {children}
    </h2>
    <div style={{ flex: 1, height: 1, background: COLORS.border, marginLeft: 8 }} />
  </div>
);

// ─── INVENTORY DATA (from CSV analysis) ───
const INVENTORY_STATS = {
  totalSKUs: 674,
  inventoryItems: 489,
  serviceItems: 112,
  salesItems: 73,
  brands: [
    { name: "Huawei", count: 87, pct: 17.8, color: COLORS.error },
    { name: "K2 Systems", count: 64, pct: 13.1, color: COLORS.cyan },
    { name: "ESDEC", count: 52, pct: 10.6, color: COLORS.indigo },
    { name: "APsystems", count: 41, pct: 8.4, color: COLORS.violet },
    { name: "Deye", count: 38, pct: 7.8, color: COLORS.success },
    { name: "RECOM", count: 34, pct: 7.0, color: COLORS.warning },
    { name: "Others", count: 358, pct: 35.3, color: COLORS.textDim },
  ],
  categories: [
    { name: "Onduleurs", count: 142, icon: "⚡" },
    { name: "Panneaux", count: 118, icon: "☀️" },
    { name: "Stockage", count: 89, icon: "🔋" },
    { name: "Montage", count: 167, icon: "🔩" },
    { name: "Câbles", count: 94, icon: "🔌" },
    { name: "Services", count: 64, icon: "🛠" },
  ],
};

// ─── MARKET DATA ───
const EU_MARKET = {
  tam: 95, // €95B EU solar market 2026
  sam: 12.4, // B2B equipment distribution
  som: 0.15, // Year 1 target
  growth: [28, 34, 42, 55, 71, 89, 95],
  countries: [
    { code: "🇩🇪", name: "Allemagne", share: 28, revenue: "€3.5B" },
    { code: "🇫🇷", name: "France", share: 18, revenue: "€2.2B" },
    { code: "🇳🇱", name: "Pays-Bas", share: 14, revenue: "€1.7B" },
    { code: "🇮🇹", name: "Italie", share: 13, revenue: "€1.6B" },
    { code: "🇪🇸", name: "Espagne", share: 11, revenue: "€1.4B" },
    { code: "🇧🇪", name: "Belgique", share: 8, revenue: "€1.0B" },
    { code: "🇵🇱", name: "Pologne", share: 8, revenue: "€1.0B" },
  ],
};

// ─── FINANCIAL PROJECTIONS ───
const FINANCIALS = {
  commissionRate: 4.75, // 5% below competitors
  competitorRate: 5.0,
  avgOrderValue: 8500,
  monthlyOrders: [12, 28, 55, 95, 150, 220, 310, 420, 560, 720, 900, 1100],
  revenueMonthly: [4845, 11305, 22219, 38381, 60600, 88880, 125228, 169680, 226240, 290880, 363600, 444400],
  burnRate: 18000,
  runway: 14,
};

// ─── ROADMAP ───
const PHASES = [
  {
    id: 1,
    name: "MVP Launch",
    duration: "4-6 sem.",
    status: "active",
    color: COLORS.cyan,
    items: [
      { t: "Catalogue + filtres avancés", done: true },
      { t: "Inscription KYC simplifié", done: true },
      { t: "Prix masqués / PriceGate", done: true },
      { t: "Fiches produits multi-vendeurs", done: false },
      { t: "Chat buyer-seller basique", done: false },
      { t: "Stripe Connect paiements", done: false },
      { t: "Dashboards buyer/seller", done: false },
      { t: "i18n FR/EN", done: false },
    ],
  },
  {
    id: 2,
    name: "Trust & Delivery",
    duration: "4-6 sem.",
    status: "planned",
    color: COLORS.violet,
    items: [
      { t: "SUNTREX DELIVERY (tracking, QR, photos)" },
      { t: "Escrow amélioré" },
      { t: "Badges vendeur + notation" },
      { t: "Support multi-canal" },
      { t: "Import offres xlsx" },
      { t: "Dashboard admin" },
      { t: "i18n DE/ES" },
    ],
  },
  {
    id: 3,
    name: "IA & Scale",
    duration: "6-8 sem.",
    status: "future",
    color: COLORS.indigo,
    items: [
      { t: "SUNTREX AI Advisor" },
      { t: "Modération IA chat" },
      { t: "Pricing intelligent" },
      { t: "Recherche sémantique" },
      { t: "Traduction IA PV" },
      { t: "i18n IT/NL" },
    ],
  },
  {
    id: 4,
    name: "Expansion",
    duration: "Continu",
    status: "future",
    color: COLORS.success,
    items: [
      { t: "Flotte livraison propre" },
      { t: "App mobile React Native" },
      { t: "Programme fidélité" },
      { t: "API publique ERP" },
      { t: "Marketplace services" },
    ],
  },
];

// ─── COMPETITIVE MATRIX ───
const COMPETITORS = [
  {
    feature: "Prix masqués / onboarding",
    suntrex: true, sunstore: true, solartraders: true,
  },
  {
    feature: "Chat buyer-seller modéré",
    suntrex: true, sunstore: true, solartraders: false,
  },
  {
    feature: "Livraison propriétaire",
    suntrex: true, sunstore: "partial", solartraders: false,
  },
  {
    feature: "Vérification colis QR/photo",
    suntrex: true, sunstore: false, solartraders: false,
  },
  {
    feature: "Outils IA (advisor, pricing)",
    suntrex: true, sunstore: false, solartraders: false,
  },
  {
    feature: "Support WhatsApp + Téléphone",
    suntrex: true, sunstore: false, solartraders: false,
  },
  {
    feature: "Commissions -5% vs marché",
    suntrex: true, sunstore: false, solartraders: false,
  },
  {
    feature: "Escrow + vérif. livraison",
    suntrex: true, sunstore: "partial", solartraders: false,
  },
  {
    feature: "Anti-fraude IA",
    suntrex: true, sunstore: false, solartraders: false,
  },
  {
    feature: "Traduction IA technique PV",
    suntrex: true, sunstore: "partial", solartraders: false,
  },
];

const CompCell = ({ val }) => {
  if (val === true) return <span style={{ color: COLORS.success, fontSize: 16 }}>✓</span>;
  if (val === "partial") return <span style={{ color: COLORS.warning, fontSize: 12 }}>◐</span>;
  return <span style={{ color: COLORS.error, fontSize: 14 }}>✗</span>;
};

// ─── MINI PROMPTS DATA ───
const MINI_PROMPTS = [
  {
    id: "MP-001",
    module: "Catalog",
    prompt: "Build accordion filter sidebar with brand, power, type, phases, MPPT filters. Collapsible groups, active tag chips, count badges. Mobile: bottom sheet.",
    priority: "P0",
    status: "done",
  },
  {
    id: "MP-002",
    module: "Auth",
    prompt: "2-step KYC: email+pass → company info (SIRET/VAT, country, role). Auto VAT validation via VIES API. GDPR checkboxes (CGV mandatory, marketing optional).",
    priority: "P0",
    status: "active",
  },
  {
    id: "MP-003",
    module: "PriceGate",
    prompt: "Blur price component with gradient overlay + CTA 'Inscrivez-vous pour voir les prix'. Unlock when user.isVerified. Animated reveal on auth.",
    priority: "P0",
    status: "active",
  },
  {
    id: "MP-004",
    module: "Product",
    prompt: "Multi-vendor product page: photo gallery, tech specs table, vendor comparison cards (price, stock, warehouse location, seller rating, country flag, trust badges).",
    priority: "P0",
    status: "todo",
  },
  {
    id: "MP-005",
    module: "Chat",
    prompt: "Real-time buyer-seller chat with auto-translation toggle, rich formatting (B/I/U), file attachments, report button, moderation flags. WebSocket or polling fallback.",
    priority: "P1",
    status: "todo",
  },
  {
    id: "MP-006",
    module: "Stripe",
    prompt: "Destination charges flow: server-side PaymentIntent with application_fee_amount, idempotency keys, webhook handler for payment_intent.succeeded, transfer.created, dispute.created.",
    priority: "P0",
    status: "todo",
  },
  {
    id: "MP-007",
    module: "Delivery",
    prompt: "SUNTREX DELIVERY tracking page: QR code generation at packing, photo upload at pickup/delivery, real-time map tracking, delivery confirmation with buyer signature.",
    priority: "P1",
    status: "backlog",
  },
  {
    id: "MP-008",
    module: "AI",
    prompt: "AI Solar Advisor chatbot: product recommendation engine based on project specs (roof area, orientation, budget). Uses Claude API with PV-specific system prompt.",
    priority: "P2",
    status: "backlog",
  },
  {
    id: "MP-009",
    module: "Seller",
    prompt: "Seller dashboard: manage listings (CRUD + bulk xlsx import), sales analytics with revenue charts, order management, Stripe Connect onboarding status, payout history.",
    priority: "P1",
    status: "todo",
  },
  {
    id: "MP-010",
    module: "Admin",
    prompt: "Admin reconciliation dashboard: commission tracking, transfer monitoring, dispute alerts, seller KYC status, amount discrepancy detection with automated notifications.",
    priority: "P1",
    status: "backlog",
  },
  {
    id: "MP-011",
    module: "Trust",
    prompt: "Seller trust system: auto-calculated score (transactions, response time, dispute rate, age), badge assignment (Verified, Super Seller, SUNTREX Delivery), public rating display.",
    priority: "P1",
    status: "backlog",
  },
  {
    id: "MP-012",
    module: "Escrow",
    prompt: "Enhanced escrow: funds held until delivery confirmation (photo+QR verified). Auto-release after 48h if no dispute. Manual release by admin for flagged transactions.",
    priority: "P1",
    status: "backlog",
  },
];

// ─── TECH STACK ───
const STACK = [
  { layer: "Frontend", tech: "Next.js + React + Tailwind", status: "active" },
  { layer: "Backend", tech: "API Routes + Netlify Functions", status: "active" },
  { layer: "Database", tech: "PostgreSQL (Neon)", status: "migrating" },
  { layer: "Auth", tech: "NextAuth / Clerk", status: "planned" },
  { layer: "Payments", tech: "Stripe Connect", status: "integration" },
  { layer: "Storage", tech: "Cloudflare R2 / S3", status: "planned" },
  { layer: "Search", tech: "Meilisearch / Algolia", status: "planned" },
  { layer: "i18n", tech: "next-intl (FR, EN, DE, ES, IT, NL)", status: "partial" },
  { layer: "Chat", tech: "WebSocket + Polling fallback", status: "architected" },
  { layer: "AI", tech: "Claude API (Anthropic)", status: "planned" },
  { layer: "Email", tech: "Resend / SendGrid", status: "planned" },
  { layer: "Monitoring", tech: "Sentry + Vercel Analytics", status: "active" },
];

// ─── MAIN APP ───
export default function SuntrexCommandCenter() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const isMobile = w < 768;
  const isTablet = w >= 768 && w < 1024;

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const tabs = [
    { id: "overview", label: "Vue d'ensemble", icon: "◈" },
    { id: "market", label: "Marché EU", icon: "◉" },
    { id: "roadmap", label: "Roadmap", icon: "◫" },
    { id: "competitive", label: "Concurrence", icon: "⬡" },
    { id: "prompts", label: "Mini-Prompts", icon: "⌘" },
    { id: "stack", label: "Tech Stack", icon: "⟐" },
    { id: "inventory", label: "Inventaire", icon: "▦" },
  ];

  const statusColor = (s) => {
    const map = { active: COLORS.success, migrating: COLORS.warning, planned: COLORS.textDim, partial: COLORS.cyan, integration: COLORS.violet, architected: COLORS.indigo, done: COLORS.success, todo: COLORS.warning, backlog: COLORS.textDim };
    return map[s] || COLORS.textDim;
  };

  const promptStatusLabel = (s) => {
    const map = { done: "DONE", active: "IN PROGRESS", todo: "TODO", backlog: "BACKLOG" };
    return map[s] || s;
  };

  // Calculate phase completion
  const phase1Done = PHASES[0].items.filter((i) => i.done).length;
  const phase1Total = PHASES[0].items.length;

  return (
    <div
      style={{
        fontFamily: "'SF Pro Display', 'Inter', -apple-system, sans-serif",
        background: COLORS.bg,
        color: COLORS.text,
        minHeight: "100vh",
        display: "flex",
        fontSize: 13,
        fontFeatureSettings: "'tnum'",
      }}
    >
      <style>{`
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.3; } 100% { transform: scale(1.8); opacity: 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes glow { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes slideIn { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .fade-in { animation: fadeUp 0.5s cubic-bezier(.16,1,.3,1) forwards; opacity: 0; }
        .stagger-1 { animation-delay: 60ms; }
        .stagger-2 { animation-delay: 120ms; }
        .stagger-3 { animation-delay: 180ms; }
        .stagger-4 { animation-delay: 240ms; }
        .stagger-5 { animation-delay: 300ms; }
        .stagger-6 { animation-delay: 360ms; }
      `}</style>

      {/* ─── SIDEBAR ─── */}
      {(!isMobile || sidebarOpen) && (
        <div
          style={{
            width: sidebarOpen ? (isMobile ? "100%" : 220) : 64,
            minWidth: sidebarOpen ? (isMobile ? "100%" : 220) : 64,
            borderRight: `1px solid ${COLORS.border}`,
            background: "rgba(8,8,26,0.95)",
            backdropFilter: "blur(20px)",
            transition: "width 0.3s cubic-bezier(.16,1,.3,1), min-width 0.3s cubic-bezier(.16,1,.3,1)",
            display: "flex",
            flexDirection: "column",
            position: isMobile ? "fixed" : "relative",
            inset: isMobile ? 0 : "auto",
            zIndex: isMobile ? 100 : 1,
            overflow: "hidden",
          }}
        >
          {/* Logo */}
          <div
            style={{
              padding: sidebarOpen ? "20px 16px" : "20px 12px",
              borderBottom: `1px solid ${COLORS.border}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: sidebarOpen ? "flex-start" : "center",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${ACCENT.from}, ${ACCENT.to})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 14,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              S
            </div>
            {sidebarOpen && (
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "0.04em" }}>SUNTREX</div>
                <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Command Center
                </div>
              </div>
            )}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  marginLeft: "auto",
                  background: "none",
                  border: "none",
                  color: COLORS.textMuted,
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Nav */}
          <nav style={{ padding: "12px 8px", flex: 1 }}>
            {tabs.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (isMobile) setSidebarOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: sidebarOpen ? "8px 12px" : "8px",
                    borderRadius: 8,
                    border: "none",
                    background: active ? "rgba(6,182,212,0.1)" : "transparent",
                    color: active ? COLORS.cyan : COLORS.textMuted,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    textAlign: "left",
                    marginBottom: 2,
                    transition: "all 0.2s",
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                    position: "relative",
                  }}
                >
                  {active && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 3,
                        height: 16,
                        borderRadius: 2,
                        background: `linear-gradient(180deg, ${ACCENT.from}, ${ACCENT.to})`,
                      }}
                    />
                  )}
                  <span style={{ fontSize: 14, opacity: active ? 1 : 0.5 }}>{tab.icon}</span>
                  {sidebarOpen && <span>{tab.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          {sidebarOpen && (
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PulseDot />
                <span style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Phase 1 — MVP Active
                </span>
              </div>
              <div
                style={{
                  marginTop: 8,
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.06)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(phase1Done / phase1Total) * 100}%`,
                    height: "100%",
                    background: `linear-gradient(90deg, ${ACCENT.from}, ${ACCENT.to})`,
                    borderRadius: 2,
                  }}
                />
              </div>
              <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 4 }}>
                {phase1Done}/{phase1Total} tâches
              </div>
            </div>
          )}

          {/* Collapse toggle (desktop only) */}
          {!isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                padding: "8px",
                border: "none",
                borderTop: `1px solid ${COLORS.border}`,
                background: "transparent",
                color: COLORS.textDim,
                cursor: "pointer",
                fontSize: 16,
                transition: "transform 0.3s",
                transform: sidebarOpen ? "none" : "rotate(180deg)",
              }}
            >
              ‹
            </button>
          )}
        </div>
      )}

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        {/* Header */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            padding: isMobile ? "12px 16px" : "12px 32px",
            borderBottom: `1px solid ${COLORS.border}`,
            background: "rgba(8,8,26,0.85)",
            backdropFilter: "blur(20px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: "none",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 6,
                  color: COLORS.textMuted,
                  padding: "4px 8px",
                  cursor: "pointer",
                  fontSize: 14,
                }}
              >
                ☰
              </button>
            )}
            <h1 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700 }}>
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Pill color={COLORS.success} small>
              <PulseDot /> LIVE
            </Pill>
            <span style={{ fontSize: 10, color: COLORS.textDim, fontFamily: "monospace" }}>
              v0.1.0-alpha
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? 16 : isTablet ? 24 : 32 }}>
          {/* ══════ OVERVIEW ══════ */}
          {activeTab === "overview" && (
            <div>
              {/* KPI Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "1fr"
                    : isTablet
                    ? "repeat(2, 1fr)"
                    : "repeat(4, 1fr)",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {[
                  {
                    label: "MARCHÉ EU PV",
                    value: <AnimCounter target={95} prefix="€" suffix="B" />,
                    sub: "TAM 2026",
                    trend: <TrendArrow up value="+18% YoY" />,
                    spark: [28, 34, 42, 55, 71, 89, 95],
                    color: COLORS.cyan,
                  },
                  {
                    label: "SAM DISTRIBUTION B2B",
                    value: <AnimCounter target={12.4} prefix="€" suffix="B" decimals={1} />,
                    sub: "Marché adressable",
                    trend: <TrendArrow up value="+22% YoY" />,
                    spark: [3.2, 4.8, 6.1, 7.8, 9.5, 11.2, 12.4],
                    color: COLORS.violet,
                  },
                  {
                    label: "TARGET Y1 GMV",
                    value: <AnimCounter target={2.8} prefix="€" suffix="M" decimals={1} />,
                    sub: "SOM année 1",
                    trend: <Pill small color={COLORS.warning}>OBJECTIF</Pill>,
                    spark: [0, 0.1, 0.3, 0.5, 0.8, 1.2, 1.6, 2.0, 2.3, 2.5, 2.7, 2.8],
                    color: COLORS.success,
                  },
                  {
                    label: "COMMISSION SUNTREX",
                    value: <AnimCounter target={4.75} suffix="%" decimals={2} />,
                    sub: "-5% vs concurrents",
                    trend: <TrendArrow up value="Avantage compétitif" />,
                    spark: [5.0, 5.0, 5.0, 5.0, 4.75, 4.75, 4.75],
                    color: COLORS.indigo,
                  },
                ].map((kpi, i) => (
                  <GlassCard key={i} style={{ animation: `fadeUp 0.5s cubic-bezier(.16,1,.3,1) ${i * 60}ms forwards`, opacity: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 500,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          color: COLORS.textDim,
                        }}
                      >
                        {kpi.label}
                      </span>
                      <Sparkline data={kpi.spark} color={kpi.color} />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>{kpi.value}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: COLORS.textMuted }}>{kpi.sub}</span>
                      {kpi.trend}
                    </div>
                  </GlassCard>
                ))}
              </div>

              {/* Revenue Projection + Inventory */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                {/* Revenue Chart Area */}
                <GlassCard>
                  <SectionTitle icon="📈">Projection Revenue Y1 — Commissions</SectionTitle>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 140, padding: "8px 0" }}>
                    {FINANCIALS.revenueMonthly.map((rev, i) => {
                      const max = Math.max(...FINANCIALS.revenueMonthly);
                      const h = (rev / max) * 120;
                      return (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <span style={{ fontSize: 8, color: COLORS.textDim, fontFamily: "monospace" }}>
                            {rev >= 1000 ? `${(rev / 1000).toFixed(0)}k` : rev}
                          </span>
                          <div
                            style={{
                              width: "100%",
                              height: h,
                              borderRadius: "4px 4px 0 0",
                              background: `linear-gradient(180deg, ${COLORS.cyan}80, ${COLORS.indigo}40)`,
                              transition: "height 1s cubic-bezier(.16,1,.3,1)",
                              animation: `fadeUp 0.6s ${i * 60}ms cubic-bezier(.16,1,.3,1) forwards`,
                              opacity: 0,
                            }}
                          />
                          <span style={{ fontSize: 9, color: COLORS.textDim }}>
                            {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 24, marginTop: 8, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Revenue Y1 Total
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>
                        €<AnimCounter target={1872} suffix="K" />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Commandes Y1
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>
                        <AnimCounter target={4570} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Panier moyen
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>
                        €<AnimCounter target={8500} />
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Inventory Donut */}
                <GlassCard>
                  <SectionTitle icon="📦">Inventaire Source</SectionTitle>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <DonutChart
                      segments={[
                        { value: 72.5, color: COLORS.cyan },
                        { value: 16.6, color: COLORS.violet },
                        { value: 10.9, color: COLORS.warning },
                      ]}
                      centerValue="674"
                      centerLabel="SKUs"
                    />
                    <div style={{ width: "100%" }}>
                      {[
                        { label: "Produits physiques", value: 489, pct: 72.5, color: COLORS.cyan },
                        { label: "Services", value: 112, pct: 16.6, color: COLORS.violet },
                        { label: "Ventes directes", value: 73, pct: 10.9, color: COLORS.warning },
                      ].map((item, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "4px 0",
                          }}
                        >
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 2,
                              background: item.color,
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 11, flex: 1 }}>{item.label}</span>
                          <span style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.textMuted }}>
                            {item.value}
                          </span>
                          <span style={{ fontSize: 10, color: COLORS.textDim }}>{item.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Business Model Canvas - Compact */}
              <GlassCard style={{ marginBottom: 24 }}>
                <SectionTitle icon="🏗">Business Model — SUNTREX Marketplace</SectionTitle>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                    gap: 12,
                  }}
                >
                  {[
                    {
                      title: "Proposition de valeur",
                      items: [
                        "Comparaison de prix multi-vendeurs vérifiés",
                        "Commissions -5% vs sun.store & SolarTraders",
                        "SUNTREX DELIVERY — confiance buyer/seller",
                        "Outils IA : advisor, pricing, modération",
                        "Support ultra-réactif multi-canal",
                      ],
                      color: COLORS.cyan,
                    },
                    {
                      title: "Segments clients",
                      items: [
                        "Installateurs PV (PME, 2-50 employés)",
                        "Distributeurs régionaux",
                        "Grossistes & importateurs",
                        "EPC contractors (grands projets)",
                      ],
                      color: COLORS.violet,
                    },
                    {
                      title: "Sources de revenus",
                      items: [
                        "Commission 4.75% par transaction",
                        "SUNTREX DELIVERY (marge logistique)",
                        "Listings premium vendeurs (futur)",
                        "SUNTREX AI Pro subscription (futur)",
                      ],
                      color: COLORS.success,
                    },
                    {
                      title: "Canaux",
                      items: [
                        "Plateforme web (responsive)",
                        "App mobile (Phase 4)",
                        "SEO / Content marketing PV",
                        "Salons professionnels (Intersolar...)",
                        "LinkedIn B2B outreach",
                      ],
                      color: COLORS.warning,
                    },
                    {
                      title: "Partenaires clés",
                      items: [
                        "Vendeurs Huawei, Deye (lancement)",
                        "Stripe (paiements)",
                        "Transporteurs EU (puis SUNTREX fleet)",
                        "Anthropic/Claude (IA)",
                      ],
                      color: COLORS.indigo,
                    },
                    {
                      title: "Avantages concurrentiels",
                      items: [
                        "First-mover sur IA + livraison propre",
                        "Escrow + vérification QR = confiance",
                        "Commissions les plus basses du marché",
                        "Équipe jeune, agile, orientée produit",
                      ],
                      color: COLORS.error,
                    },
                  ].map((block, i) => (
                    <div
                      key={i}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        background: `${block.color}08`,
                        border: `1px solid ${block.color}15`,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: block.color,
                          marginBottom: 8,
                        }}
                      >
                        {block.title}
                      </div>
                      {block.items.map((item, j) => (
                        <div
                          key={j}
                          style={{
                            fontSize: 11,
                            color: COLORS.textMuted,
                            padding: "3px 0",
                            borderBottom: j < block.items.length - 1 ? `1px solid ${COLORS.border}` : "none",
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* ══════ MARKET ══════ */}
          {activeTab === "market" && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <GlassCard>
                  <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    TAM — Marché EU Solaire
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4 }}>
                    €<AnimCounter target={95} />B
                  </div>
                  <TrendArrow up value="+18% CAGR" />
                </GlassCard>
                <GlassCard>
                  <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    SAM — Distribution B2B Équipements
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4, color: COLORS.violet }}>
                    €<AnimCounter target={12.4} decimals={1} />B
                  </div>
                  <TrendArrow up value="+22% CAGR" />
                </GlassCard>
                <GlassCard>
                  <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    SOM — Objectif Y1
                  </div>
                  <div style={{ fontSize: 32, fontWeight: 800, marginTop: 4, color: COLORS.success }}>
                    €<AnimCounter target={2.8} decimals={1} />M
                  </div>
                  <span style={{ fontSize: 11, color: COLORS.textDim }}>0.023% du SAM</span>
                </GlassCard>
              </div>

              <SectionTitle icon="🇪🇺">Marchés Cibles par Pays</SectionTitle>
              <GlassCard style={{ marginBottom: 24 }}>
                {EU_MARKET.countries.map((c, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: i < EU_MARKET.countries.length - 1 ? `1px solid ${COLORS.border}` : "none",
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{c.code}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
                        <span style={{ fontSize: 12, color: COLORS.cyan, fontWeight: 600 }}>{c.revenue}</span>
                      </div>
                      <div
                        style={{
                          height: 6,
                          borderRadius: 3,
                          background: "rgba(255,255,255,0.06)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${c.share * 3.5}%`,
                            borderRadius: 3,
                            background: `linear-gradient(90deg, ${COLORS.cyan}, ${COLORS.indigo})`,
                            transition: "width 1s cubic-bezier(.16,1,.3,1)",
                          }}
                        />
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.textMuted, minWidth: 30, textAlign: "right" }}>
                      {c.share}%
                    </span>
                  </div>
                ))}
              </GlassCard>

              <SectionTitle icon="🎯">Stratégie de Pénétration</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
                <GlassCard>
                  <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.cyan, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    Phase 1 — France & Benelux
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>
                    Lancement avec vendeurs Huawei/Deye (prix imbattables). Ciblage installateurs via LinkedIn + salons (Energaïa, Intersolar). KYC simplifié en français. SUNTREX DELIVERY sur corridor France-Benelux.
                  </div>
                </GlassCard>
                <GlassCard>
                  <div style={{ fontSize: 10, fontWeight: 600, color: COLORS.violet, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                    Phase 2 — Allemagne & Espagne
                  </div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>
                    Expansion DACH (plus gros marché EU). i18n DE/ES. Nouveaux vendeurs locaux. Corridors SUNTREX DELIVERY nord-sud. Partenariats distributeurs régionaux.
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {/* ══════ ROADMAP ══════ */}
          {activeTab === "roadmap" && (
            <div>
              {PHASES.map((phase, pi) => (
                <GlassCard
                  key={phase.id}
                  style={{
                    marginBottom: 16,
                    borderLeft: `3px solid ${phase.color}`,
                    animation: `fadeUp 0.5s ${pi * 80}ms cubic-bezier(.16,1,.3,1) forwards`,
                    opacity: 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                    <Pill color={phase.color}>Phase {phase.id}</Pill>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{phase.name}</span>
                    <span style={{ fontSize: 11, color: COLORS.textDim }}>{phase.duration}</span>
                    {phase.status === "active" && (
                      <Pill color={COLORS.success} small>
                        <PulseDot /> EN COURS
                      </Pill>
                    )}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
                      gap: 6,
                    }}
                  >
                    {phase.items.map((item, j) => (
                      <div
                        key={j}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "6px 8px",
                          borderRadius: 6,
                          background: item.done ? `${COLORS.success}10` : "transparent",
                        }}
                      >
                        <span
                          style={{
                            width: 16,
                            height: 16,
                            borderRadius: 4,
                            border: `1.5px solid ${item.done ? COLORS.success : COLORS.textDim}`,
                            background: item.done ? `${COLORS.success}20` : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 10,
                            color: COLORS.success,
                            flexShrink: 0,
                          }}
                        >
                          {item.done && "✓"}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: item.done ? COLORS.text : COLORS.textMuted,
                            textDecoration: item.done ? "none" : "none",
                          }}
                        >
                          {item.t}
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* ══════ COMPETITIVE ══════ */}
          {activeTab === "competitive" && (
            <div>
              <GlassCard style={{ overflow: "auto", marginBottom: 24 }}>
                <SectionTitle icon="⬡">Matrice Concurrentielle</SectionTitle>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 12,
                    minWidth: 500,
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: COLORS.textDim,
                          borderBottom: `1px solid ${COLORS.border}`,
                        }}
                      >
                        Feature
                      </th>
                      {["SUNTREX", "sun.store", "SolarTraders"].map((name) => (
                        <th
                          key={name}
                          style={{
                            textAlign: "center",
                            padding: "8px 12px",
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: name === "SUNTREX" ? COLORS.cyan : COLORS.textDim,
                            borderBottom: `1px solid ${COLORS.border}`,
                          }}
                        >
                          {name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPETITORS.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                        }}
                      >
                        <td style={{ padding: "8px 12px", borderBottom: `1px solid ${COLORS.border}`, color: COLORS.textMuted }}>
                          {row.feature}
                        </td>
                        <td style={{ textAlign: "center", padding: "8px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
                          <CompCell val={row.suntrex} />
                        </td>
                        <td style={{ textAlign: "center", padding: "8px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
                          <CompCell val={row.sunstore} />
                        </td>
                        <td style={{ textAlign: "center", padding: "8px 12px", borderBottom: `1px solid ${COLORS.border}` }}>
                          <CompCell val={row.solartraders} />
                        </td>
                      </tr>
                    ))}
                    {/* Score row */}
                    <tr>
                      <td
                        style={{
                          padding: "10px 12px",
                          fontWeight: 700,
                          fontSize: 11,
                          textTransform: "uppercase",
                        }}
                      >
                        Score Total
                      </td>
                      {[
                        { score: "10/10", color: COLORS.success },
                        { score: "4.5/10", color: COLORS.warning },
                        { score: "2/10", color: COLORS.error },
                      ].map((s, i) => (
                        <td
                          key={i}
                          style={{
                            textAlign: "center",
                            padding: "10px 12px",
                            fontWeight: 800,
                            fontSize: 14,
                            color: s.color,
                          }}
                        >
                          {s.score}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </GlassCard>

              <SectionTitle icon="💰">Comparaison Commissions</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 16 }}>
                {[
                  { name: "SUNTREX", rate: 4.75, color: COLORS.success, tag: "LE MOINS CHER" },
                  { name: "sun.store", rate: 5.0, color: COLORS.warning, tag: "STANDARD" },
                  { name: "SolarTraders", rate: 5.0, color: COLORS.error, tag: "STANDARD" },
                ].map((c, i) => (
                  <GlassCard key={i} style={{ textAlign: "center" }}>
                    <Pill color={c.color} small>{c.tag}</Pill>
                    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 8 }}>{c.name}</div>
                    <div style={{ fontSize: 36, fontWeight: 800, color: c.color, margin: "8px 0" }}>
                      {c.rate}%
                    </div>
                    <div style={{ fontSize: 11, color: COLORS.textDim }}>
                      Sur €8 500 = €{(8500 * c.rate / 100).toFixed(0)} de commission
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* ══════ MINI-PROMPTS ══════ */}
          {activeTab === "prompts" && (
            <div>
              <div style={{ marginBottom: 16, fontSize: 11, color: COLORS.textMuted }}>
                Chaque mini-prompt est un ticket de développement ultra-précis prêt à être exécuté par Claude Code.
              </div>
              {MINI_PROMPTS.map((mp, i) => (
                <GlassCard
                  key={mp.id}
                  style={{
                    marginBottom: 8,
                    padding: 14,
                    animation: `fadeUp 0.4s ${i * 40}ms cubic-bezier(.16,1,.3,1) forwards`,
                    opacity: 0,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.textDim }}>{mp.id}</span>
                    <Pill color={COLORS.indigo} small>{mp.module}</Pill>
                    <Pill
                      color={mp.priority === "P0" ? COLORS.error : mp.priority === "P1" ? COLORS.warning : COLORS.textDim}
                      small
                    >
                      {mp.priority}
                    </Pill>
                    <Pill color={statusColor(mp.status)} small>
                      {mp.status === "active" && <PulseDot color={COLORS.success} />}
                      {promptStatusLabel(mp.status)}
                    </Pill>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: COLORS.textMuted,
                      lineHeight: 1.5,
                      padding: "6px 10px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${COLORS.border}`,
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: 11,
                    }}
                  >
                    {mp.prompt}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* ══════ TECH STACK ══════ */}
          {activeTab === "stack" && (
            <div>
              <GlassCard style={{ marginBottom: 24 }}>
                <SectionTitle icon="⟐">Architecture Technique</SectionTitle>
                {STACK.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: i < STACK.length - 1 ? `1px solid ${COLORS.border}` : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: COLORS.textDim,
                        minWidth: isMobile ? 60 : 100,
                      }}
                    >
                      {s.layer}
                    </span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{s.tech}</span>
                    <Pill color={statusColor(s.status)} small>
                      {s.status === "active" && <PulseDot />}
                      {s.status}
                    </Pill>
                  </div>
                ))}
              </GlassCard>

              <SectionTitle icon="🔒">Sécurité Stripe — Checklist Non-Négociable</SectionTitle>
              <GlassCard>
                {[
                  "Clés API uniquement en variables d'environnement",
                  "Vérification de signature webhook (stripe-signature)",
                  "Idempotency keys sur toutes les opérations d'écriture",
                  "Prix vérifiés côté serveur (jamais client)",
                  "3D Secure / SCA activé (obligatoire EU)",
                  "API version épinglée dans le code",
                  "Mode test pour tout développement",
                  "CORS restreint aux domaines connus",
                  "RLS activé sur toutes les tables publiques",
                  "Logs de réconciliation payment_intent + transfer",
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 0",
                      borderBottom: i < 9 ? `1px solid ${COLORS.border}` : "none",
                    }}
                  >
                    <span style={{ color: COLORS.success, fontSize: 12 }}>◆</span>
                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>{item}</span>
                  </div>
                ))}
              </GlassCard>
            </div>
          )}

          {/* ══════ INVENTORY ══════ */}
          {activeTab === "inventory" && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                {[
                  { label: "Total SKUs", value: "674", color: COLORS.cyan },
                  { label: "Produits inventaire", value: "489", color: COLORS.success },
                  { label: "Services", value: "112", color: COLORS.violet },
                  { label: "Marques", value: "15+", color: COLORS.warning },
                ].map((s, i) => (
                  <GlassCard key={i} style={{ textAlign: "center", padding: 14 }}>
                    <div style={{ fontSize: 9, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                  </GlassCard>
                ))}
              </div>

              <SectionTitle icon="🏷">Répartition par Marque</SectionTitle>
              <GlassCard style={{ marginBottom: 24 }}>
                {INVENTORY_STATS.brands.map((b, i) => (
                  <ProgressBar
                    key={i}
                    label={b.name}
                    value={b.count}
                    max={INVENTORY_STATS.totalSKUs}
                    color={b.color}
                    sublabel={`${b.pct}% du catalogue`}
                  />
                ))}
              </GlassCard>

              <SectionTitle icon="📂">Catégories Produits</SectionTitle>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                {INVENTORY_STATS.categories.map((cat, i) => (
                  <GlassCard key={i} style={{ textAlign: "center", padding: 14 }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{cat.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{cat.name}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.cyan }}>{cat.count}</div>
                    <div style={{ fontSize: 10, color: COLORS.textDim }}>articles</div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 32px",
            borderTop: `1px solid ${COLORS.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 10, color: COLORS.textDim }}>
            SUNTREX © 2026 — Strategic Command Center
          </span>
          <span style={{ fontSize: 10, color: COLORS.textDim, fontFamily: "monospace" }}>
            Audit généré le 26/02/2026 — Données catalogue: 674 SKUs
          </span>
        </div>
      </div>
    </div>
  );
}
