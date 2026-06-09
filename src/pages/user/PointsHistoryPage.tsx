// src/pages/user/PointsHistoryPage.tsx
// Halaman riwayat poin — gaya Stack Overflow
// Dipanggil dari src/routes/index.tsx

import React, { useState, useMemo, useEffect } from "react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
type EventTab      = "all" | "answer" | "question" | "bonus";
type PeriodFilter  = "all" | "7" | "30";
type IconType      =
  | "upvote-answer"
  | "accepted"
  | "upvote-question"
  | "downvote"
  | "bonus"
  | "badge"
  | "bounty";

interface PointEvent {
  id:    number;
  date:  string;
  tab:   Exclude<EventTab, "all">;
  icon:  IconType;
  pts:   number;
  label: string;
  meta:  string;
  tags:  string[];
  votes: number | null;
}

interface DayGroup {
  date:  string;
  items: PointEvent[];
  net:   number;
}

// ─────────────────────────────────────────────────────────────
// DATA — ganti dengan fetch("/api/points/me")
// ─────────────────────────────────────────────────────────────
const EVENTS: PointEvent[] = [
  { id: 1,  date: "2025-06-12", tab: "answer",   icon: "upvote-answer",   pts: +10,  label: "Kenapa useState tidak langsung update nilai?",           meta: "upvote jawaban",    tags: ["react", "js"], votes: 14   },
  { id: 2,  date: "2025-06-12", tab: "answer",   icon: "accepted",        pts: +15,  label: "Cara parse JSON nested di Python dengan error handling",  meta: "accepted answer",   tags: ["py"],          votes: 9    },
  { id: 3,  date: "2025-06-11", tab: "question", icon: "upvote-question", pts: +5,   label: "Bagaimana cara kerja event loop di Node.js?",             meta: "upvote pertanyaan", tags: ["js"],          votes: 22   },
  { id: 4,  date: "2025-06-10", tab: "answer",   icon: "upvote-answer",   pts: +10,  label: "Optimasi query SQL dengan jutaan baris data",             meta: "upvote jawaban",    tags: ["sql"],         votes: 31   },
  { id: 5,  date: "2025-06-10", tab: "answer",   icon: "downvote",        pts: -2,   label: "Perbedaan == dan === di JavaScript",                      meta: "downvote jawaban",  tags: ["js"],          votes: 3    },
  { id: 6,  date: "2025-06-09", tab: "bonus",    icon: "badge",           pts: +10,  label: 'Badge "Enlightened" diraih',                             meta: "badge reward",      tags: [],              votes: null },
  { id: 7,  date: "2025-06-08", tab: "answer",   icon: "upvote-answer",   pts: +10,  label: "Fix error CORS di Express.js",                           meta: "upvote jawaban",    tags: ["js"],          votes: 18   },
  { id: 8,  date: "2025-06-08", tab: "answer",   icon: "accepted",        pts: +15,  label: "Cara deploy Next.js ke VPS dengan Nginx",                meta: "accepted answer",   tags: ["js"],          votes: 7    },
  { id: 9,  date: "2025-06-05", tab: "bonus",    icon: "bonus",           pts: +100, label: "Asosiasi bonus — akun terhubung",                        meta: "bonus asosiasi",    tags: [],              votes: null },
  { id: 10, date: "2025-06-04", tab: "answer",   icon: "upvote-answer",   pts: +10,  label: "Perbedaan goroutine vs thread di Go",                    meta: "upvote jawaban",    tags: ["go"],          votes: 26   },
  { id: 11, date: "2025-06-03", tab: "question", icon: "upvote-question", pts: +5,   label: "Kapan sebaiknya pakai useCallback vs useMemo?",           meta: "upvote pertanyaan", tags: ["react"],       votes: 15   },
  { id: 12, date: "2025-06-03", tab: "bonus",    icon: "bounty",          pts: +50,  label: "Bounty — JWT refresh token di FastAPI",                  meta: "bounty diterima",   tags: ["py"],          votes: 41   },
  { id: 13, date: "2025-06-01", tab: "answer",   icon: "upvote-answer",   pts: +10,  label: "Array vs Slice di Go — kapan pakai mana?",              meta: "upvote jawaban",    tags: ["go"],          votes: 12   },
  { id: 14, date: "2025-05-30", tab: "answer",   icon: "downvote",        pts: -2,   label: "Kenapa async/await tidak bisa di forEach?",              meta: "downvote jawaban",  tags: ["js"],          votes: 2    },
  { id: 15, date: "2025-05-28", tab: "answer",   icon: "accepted",        pts: +15,  label: "Setup Docker Compose untuk Laravel + MySQL",             meta: "accepted answer",   tags: ["php"],         votes: 19   },
  { id: 16, date: "2025-05-25", tab: "bonus",    icon: "badge",           pts: +25,  label: 'Badge "Good Answer" diraih',                             meta: "badge reward",      tags: [],              votes: null },
  { id: 17, date: "2025-05-22", tab: "answer",   icon: "upvote-answer",   pts: +10,  label: "Cara kerja index di PostgreSQL",                         meta: "upvote jawaban",    tags: ["sql"],         votes: 33   },
  { id: 18, date: "2025-05-20", tab: "question", icon: "upvote-question", pts: +5,   label: "Best practice error handling di Go",                     meta: "upvote pertanyaan", tags: ["go"],          votes: 28   },
  { id: 19, date: "2025-05-18", tab: "answer",   icon: "upvote-answer",   pts: +10,  label: "Perbedaan interface dan type di TypeScript",             meta: "upvote jawaban",    tags: ["ts", "js"],    votes: 44   },
  { id: 20, date: "2025-05-15", tab: "answer",   icon: "accepted",        pts: +15,  label: "Cara handle file upload besar di Node.js",              meta: "accepted answer",   tags: ["js"],          votes: 8    },
  { id: 21, date: "2025-05-12", tab: "bonus",    icon: "bounty",          pts: +100, label: "Bounty — Race condition di goroutine Go",               meta: "bounty diterima",   tags: ["go"],          votes: 52   },
  { id: 22, date: "2025-05-10", tab: "answer",   icon: "upvote-answer",   pts: +10,  label: "Implementasi binary search tree di Python",             meta: "upvote jawaban",    tags: ["py"],          votes: 17   },
  { id: 23, date: "2025-05-08", tab: "question", icon: "upvote-question", pts: +5,   label: "Kenapa Prisma lambat saat relasi banyak?",              meta: "upvote pertanyaan", tags: ["js"],          votes: 11   },
  { id: 24, date: "2025-05-05", tab: "answer",   icon: "downvote",        pts: -2,   label: "Perbedaan let, var, const di JavaScript",               meta: "downvote jawaban",  tags: ["js"],          votes: 1    },
  { id: 25, date: "2025-05-01", tab: "answer",   icon: "accepted",        pts: +15,  label: "Setup Redis cache di Spring Boot",                      meta: "accepted answer",   tags: ["java"],        votes: 6    },
  { id: 26, date: "2025-04-28", tab: "answer",   icon: "upvote-answer",   pts: +10,  label: "Cara validasi form React tanpa library",                meta: "upvote jawaban",    tags: ["react", "js"], votes: 20   },
  { id: 27, date: "2025-04-25", tab: "question", icon: "upvote-question", pts: +5,   label: "Apa itu dependency injection dan kapan dipakai?",       meta: "upvote pertanyaan", tags: ["go"],          votes: 36   },
  { id: 28, date: "2025-04-20", tab: "bonus",    icon: "badge",           pts: +100, label: 'Badge "Famous Question" diraih',                        meta: "badge reward",      tags: [],              votes: null },
  { id: 29, date: "2025-04-18", tab: "answer",   icon: "upvote-answer",   pts: +10,  label: "Cara membuat custom hook di React",                     meta: "upvote jawaban",    tags: ["react", "js"], votes: 29   },
  { id: 30, date: "2025-04-15", tab: "answer",   icon: "accepted",        pts: +15,  label: "Perbedaan SQL JOIN: INNER, LEFT, RIGHT, FULL",          meta: "accepted answer",   tags: ["sql"],         votes: 55   },
  { id: 31, date: "2025-04-10", tab: "bonus",    icon: "bounty",          pts: +50,  label: "Bounty — WebSocket di Go dengan gorilla/websocket",     meta: "bounty diterima",   tags: ["go"],          votes: 38   },
  { id: 32, date: "2025-04-05", tab: "answer",   icon: "upvote-answer",   pts: +10,  label: "Cara setup ESLint + Prettier di proyek Next.js",        meta: "upvote jawaban",    tags: ["js"],          votes: 22   },
];

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const PER_PAGE   = 8;
const WEEK_COUNT = 12;

const TABS: { label: string; value: EventTab }[] = [
  { label: "Semua",      value: "all"      },
  { label: "Jawaban",    value: "answer"   },
  { label: "Pertanyaan", value: "question" },
  { label: "Bonus",      value: "bonus"    },
];

const PERIODS: { label: string; value: PeriodFilter }[] = [
  { label: "Semua waktu", value: "all" },
  { label: "30 hari",     value: "30"  },
  { label: "7 hari",      value: "7"   },
];

const ICON_CONFIG: Record<IconType, { bg: string; color: string; svg: React.ReactNode }> = {
  "upvote-answer": {
    bg: "#dcfce7", color: "#15803d",
    svg: <path d="M12 19V5M5 12l7-7 7 7" />,
  },
  "accepted": {
    bg: "#dcfce7", color: "#14532d",
    svg: <><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></>,
  },
  "upvote-question": {
    bg: "#dbeafe", color: "#1d4ed8",
    svg: <><circle cx="12" cy="12" r="9" /><path d="M12 8v4" /><circle cx="12" cy="16" r=".8" fill="currentColor" stroke="none" /></>,
  },
  "downvote": {
    bg: "#fee2e2", color: "#b91c1c",
    svg: <path d="M12 5v14M5 12l7 7 7-7" />,
  },
  "bonus": {
    bg: "#ede9fe", color: "#6d28d9",
    svg: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
  },
  "badge": {
    bg: "#fef3c7", color: "#b45309",
    svg: <><circle cx="12" cy="8" r="6" /><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" /></>,
  },
  "bounty": {
    bg: "#fce7f3", color: "#9d174d",
    svg: <><circle cx="12" cy="12" r="9" /><path d="M12 7v1m0 8v1M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2.5-2.5 4" /></>,
  },
};

const TAG_COLOR: Record<string, string> = {
  js:    "#92400e|#fef3c7",
  ts:    "#1e40af|#dbeafe",
  py:    "#166534|#dcfce7",
  go:    "#0f5544|#ccfbf1",
  php:   "#5b21b6|#ede9fe",
  sql:   "#9f1239|#ffe4e6",
  java:  "#991b1b|#fee2e2",
  react: "#0369a1|#e0f2fe",
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const daysAgo = (d: string) =>
  Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

const fmtShort = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

function toGroups(events: PointEvent[]): DayGroup[] {
  const map: Record<string, PointEvent[]> = {};
  for (const e of events) (map[e.date] ??= []).push(e);
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({ date, items, net: items.reduce((s, i) => s + i.pts, 0) }));
}

// ─────────────────────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────

// SVG Icon wrapper
const EventIcon: React.FC<{ type: IconType }> = ({ type }) => {
  const cfg = ICON_CONFIG[type];
  return (
    <div style={{ background: cfg.bg, color: cfg.color, width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {cfg.svg}
      </svg>
    </div>
  );
};

// Tag pill
const TagPill: React.FC<{ name: string }> = ({ name }) => {
  const colors = TAG_COLOR[name]?.split("|") ?? ["#5b21b6", "#ede9fe"];
  return (
    <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 4, background: colors[1], color: colors[0], fontFamily: "monospace", lineHeight: 1.6 }}>
      {name}
    </span>
  );
};

// Sparkline
const Sparkline: React.FC<{ data: number[] }> = ({ data }) => {
  const max    = Math.max(...data, 1);
  const showAt = new Set([0, Math.floor(data.length / 2), data.length - 1]);
  return (
    <div style={{ background: "#faf9ff", border: "1px solid #ede9fe", borderRadius: 12, padding: "14px 16px 10px", marginBottom: 20 }}>
      <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 10px" }}>Poin per minggu (12 minggu terakhir)</p>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
        {data.map((v, i) => {
          const wk  = data.length - 1 - i;
          const h   = v === 0 ? 4 : Math.max(Math.round((v / max) * 100), 7);
          const lbl = wk === 0 ? "skrg" : fmtShort(new Date(Date.now() - wk * 7 * 86_400_000).toISOString().slice(0, 10));
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }} title={`+${v} poin`}>
              <div style={{ width: "100%", height: `${h}%`, borderRadius: "2px 2px 0 0", background: v === 0 ? "#e0d9f7" : "#7c3aed" }} />
              <span style={{ fontSize: 9.5, color: "#9ca3af" }}>{showAt.has(i) ? lbl : ""}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
const PointsHistoryPage: React.FC = () => {
  const [tab,    setTab]    = useState<EventTab>("all");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [query,  setQuery]  = useState("");
  const [page,   setPageRaw] = useState(1);

  // reset page on filter change
  const setTab_    = (v: EventTab)      => { setTab(v);    setPageRaw(1); };
  const setPeriod_ = (v: PeriodFilter)  => { setPeriod(v); setPageRaw(1); };
  const setQuery_  = (v: string)        => { setQuery(v);  setPageRaw(1); };

  // filtered events
  const filtered = useMemo(() =>
    EVENTS.filter((e) => {
      const tOk = tab    === "all" || e.tab === tab;
      const dOk = period === "all" || daysAgo(e.date) <= +period;
      const qOk = !query  || e.label.toLowerCase().includes(query.toLowerCase());
      return tOk && dOk && qOk;
    }),
    [tab, period, query]
  );

  const allGroups  = useMemo(() => toGroups(filtered), [filtered]);
  const totalPages = Math.max(1, Math.ceil(allGroups.length / PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const groups     = allGroups.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // stats
  const stats = useMemo(() =>
    EVENTS.reduce(
      (a, e) => {
        if (e.pts > 0)                      a.total          += e.pts;
        if (e.icon === "upvote-answer")     a.upvoteAnswer   += e.pts;
        if (e.icon === "accepted")          a.accepted       += e.pts;
        if (e.icon === "upvote-question")   a.upvoteQuestion += e.pts;
        if (e.icon === "downvote")          a.downvote       += e.pts;
        if (daysAgo(e.date) <= 7 && e.pts > 0)  a.thisWeek  += e.pts;
        if (daysAgo(e.date) <= 30 && e.pts > 0) a.thisMonth  += e.pts;
        return a;
      },
      { total: 0, upvoteAnswer: 0, accepted: 0, upvoteQuestion: 0, downvote: 0, thisWeek: 0, thisMonth: 0 }
    ), []
  );

  // sparkline
  const sparkline = useMemo(() =>
    Array.from({ length: WEEK_COUNT }, (_, i) => {
      const wk = WEEK_COUNT - 1 - i;
      return EVENTS
        .filter((e) => e.pts > 0 && daysAgo(e.date) >= wk * 7 && daysAgo(e.date) < (wk + 1) * 7)
        .reduce((s, e) => s + e.pts, 0);
    }), []
  );

  // pagination pages
  const pgStart = Math.max(1, safePage - 1);
  const pgEnd   = Math.min(totalPages, safePage + 1);
  const pgNums  = Array.from({ length: pgEnd - pgStart + 1 }, (_, i) => pgStart + i);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f7ff", fontFamily: "-apple-system, 'Segoe UI', system-ui, sans-serif" }}>

      {/* ══════════════════════════════════════════════════
          SIDEBAR KIRI — nav + profil user
          ══════════════════════════════════════════════════ */}
      <aside style={{ width: 220, background: "#fff", borderRight: "1px solid #e9e8f5", display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh" }}>

        {/* Logo */}
        <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #e9e8f5", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "#f97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 10h16M4 14h10" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#111827", letterSpacing: "-0.01em" }}>Threadly</span>
        </div>

        {/* Nav */}
        <nav style={{ padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { label: "Home",       emoji: "🏠", to: "/"           },
            { label: "Questions",  emoji: "📋", to: "/questions"  },
            { label: "Tags",       emoji: "🏷️", to: "/tags"       },
            { label: "Users",      emoji: "👥", to: "/users"      },
            { label: "Categories", emoji: "📁", to: "/categories" },
          ].map((item) => (
            <a
              key={item.to}
              href={item.to}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, fontSize: 13.5, color: "#4b5563", textDecoration: "none", transition: "background .12s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f0ff")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: 15 }}>{item.emoji}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div style={{ margin: "4px 16px", borderTop: "1px solid #e9e8f5" }} />

        {/* User card */}
        <div style={{ padding: "16px 12px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#c4b5fd", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
            <span style={{ color: "#5b21b6", fontWeight: 700, fontSize: 22 }}>A</span>
          </div>
          <p style={{ fontWeight: 600, fontSize: 14, color: "#111827", margin: "0 0 2px" }}>@ayunda</p>
          <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 12px" }}>evi@gmail.com</p>

          {/* Poin badge — ini yang membuka halaman history */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef9c3", border: "1px solid #fde047", borderRadius: 20, padding: "5px 14px", marginBottom: 8 }}>
            <span style={{ fontSize: 15 }}>⭐</span>
            <span style={{ fontWeight: 700, color: "#92400e", fontSize: 14 }}>{stats.total.toLocaleString("id-ID")}</span>
            <span style={{ fontSize: 12, color: "#a16207" }}>poin</span>
          </div>

          <span style={{ fontSize: 12, background: "#ede9fe", color: "#6d28d9", padding: "2px 12px", borderRadius: 20 }}>user</span>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT
          ══════════════════════════════════════════════════ */}
      <main style={{ flex: 1, minWidth: 0, padding: "28px 32px 60px" }}>

        {/* ── Page title ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>Riwayat Poin</h1>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Semua aktivitas reputasi akun kamu</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fef9c3", border: "1px solid #fde047", borderRadius: 20, padding: "6px 16px" }}>
            <span style={{ fontSize: 16 }}>⭐</span>
            <span style={{ fontWeight: 700, fontSize: 20, color: "#92400e" }}>{stats.total.toLocaleString("id-ID")}</span>
            <span style={{ fontSize: 12, color: "#a16207" }}>reputasi</span>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Upvote jawaban",    value: stats.upvoteAnswer,   color: "#15803d" },
            { label: "Accepted answer",   value: stats.accepted,        color: "#14532d" },
            { label: "Upvote pertanyaan", value: stats.upvoteQuestion,  color: "#1d4ed8" },
            { label: "Downvote",          value: stats.downvote,        color: "#b91c1c" },
          ].map((c) => (
            <div key={c.label} style={{ background: "#fff", border: "1px solid #e9e8f5", borderRadius: 12, padding: "14px 16px" }}>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 6px" }}>{c.label}</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: c.color, margin: 0 }}>
                {c.value >= 0 ? "+" : ""}{c.value.toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>

        {/* ── Sparkline ── */}
        <Sparkline data={sparkline} />

        {/* ── Tabs ── */}
        <div style={{ display: "flex", borderBottom: "1.5px solid #e9e8f5", marginBottom: 14 }}>
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab_(t.value)}
              style={{
                padding: "9px 18px",
                fontSize: 13.5,
                fontFamily: "inherit",
                fontWeight: tab === t.value ? 600 : 400,
                color: tab === t.value ? "#7c3aed" : "#9ca3af",
                background: "none",
                border: "none",
                borderBottom: tab === t.value ? "2.5px solid #7c3aed" : "2.5px solid transparent",
                marginBottom: -1.5,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Filter row ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod_(p.value)}
                style={{
                  padding: "4px 14px",
                  fontSize: 12.5,
                  fontFamily: "inherit",
                  borderRadius: 20,
                  border: period === p.value ? "1.5px solid #a78bfa" : "1.5px solid #e5e7eb",
                  background: period === p.value ? "#f5f3ff" : "transparent",
                  color: period === p.value ? "#6d28d9" : "#6b7280",
                  fontWeight: period === p.value ? 600 : 400,
                  cursor: "pointer",
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Cari pertanyaan atau jawaban…"
              value={query}
              onChange={(e) => setQuery_(e.target.value)}
              style={{ paddingLeft: 32, paddingRight: 14, paddingTop: 7, paddingBottom: 7, fontSize: 13, fontFamily: "inherit", border: "1.5px solid #e5e7eb", borderRadius: 10, outline: "none", width: 240, color: "#111827", background: "#fff" }}
              onFocus={(e)  => (e.target.style.borderColor = "#a78bfa")}
              onBlur={(e)   => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
        </div>

        {/* ── History list ── */}
        <div>
          {groups.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "#9ca3af" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#c4b5fd" strokeWidth="1.5" strokeLinecap="round" style={{ display: "block", margin: "0 auto 10px" }}>
                <path d="M9.17 6H6a4 4 0 00-4 4v8a4 4 0 004 4h12a4 4 0 004-4v-6M13 2l3 3-3 3M16 5H9" />
              </svg>
              <p style={{ fontSize: 14 }}>Tidak ada aktivitas ditemukan</p>
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.date} style={{ marginBottom: 8 }}>
                {/* Day header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0 5px" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {fmtDate(g.date)}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: g.net >= 0 ? "#15803d" : "#b91c1c" }}>
                    {g.net >= 0 ? "+" : ""}{g.net} poin
                  </span>
                </div>

                {/* Event rows */}
                {g.items.map((e) => {
                  const ptsColor = e.pts > 0 ? "#15803d" : "#b91c1c";
                  const ptsStr   = (e.pts > 0 ? "+" : "") + e.pts;
                  return (
                    <div
                      key={e.id}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", background: "#fff", border: "1px solid #f0eeff", borderRadius: 12, marginBottom: 4, cursor: "default", transition: "border-color .12s" }}
                      onMouseEnter={(el) => (el.currentTarget.style.borderColor = "#c4b5fd")}
                      onMouseLeave={(el) => (el.currentTarget.style.borderColor = "#f0eeff")}
                    >
                      {/* Points */}
                      <span style={{ minWidth: 44, textAlign: "right", fontSize: 14, fontWeight: 700, flexShrink: 0, color: ptsColor, fontVariantNumeric: "tabular-nums" }}>
                        {ptsStr}
                      </span>

                      {/* Icon */}
                      <EventIcon type={e.icon} />

                      {/* Body */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13.5, color: "#111827", margin: "0 0 3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {e.label}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, color: "#9ca3af" }}>{e.meta}</span>
                          {e.tags.map((t) => <TagPill key={t} name={t} />)}
                          {e.votes !== null && (
                            <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "#9ca3af", flexShrink: 0 }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M12 19V5M5 12l7-7 7 7" />
                              </svg>
                              {e.votes}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginTop: 20 }}>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                disabled={safePage <= 1}
                onClick={() => setPageRaw(safePage - 1)}
                style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "transparent", color: "#6b7280", fontSize: 14, cursor: safePage <= 1 ? "default" : "pointer", opacity: safePage <= 1 ? 0.35 : 1 }}
              >
                ‹
              </button>
              {pgNums.map((p) => (
                <button
                  key={p}
                  onClick={() => setPageRaw(p)}
                  style={{ padding: "5px 12px", borderRadius: 8, border: p === safePage ? "1.5px solid #7c3aed" : "1px solid #e5e7eb", background: p === safePage ? "#7c3aed" : "transparent", color: p === safePage ? "#fff" : "#6b7280", fontSize: 14, fontWeight: p === safePage ? 700 : 400, cursor: "pointer" }}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={safePage >= totalPages}
                onClick={() => setPageRaw(safePage + 1)}
                style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid #e5e7eb", background: "transparent", color: "#6b7280", fontSize: 14, cursor: safePage >= totalPages ? "default" : "pointer", opacity: safePage >= totalPages ? 0.35 : 1 }}
              >
                ›
              </button>
            </div>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
              Halaman {safePage} dari {totalPages} · {allGroups.length} grup
            </p>
          </div>
        )}

      </main>
    </div>
  );
};

export default PointsHistoryPage;