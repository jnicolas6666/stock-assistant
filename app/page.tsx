"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TrendingUp, Send } from "lucide-react";
import {
  TrendUp, TrendDown, Minus, ArrowUp, ArrowDown,
} from "@phosphor-icons/react";
import {
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

// ── Inline animated icons for AI responses ──────────────────────────────────

const EMOJI_TO_ICON: Record<string, string> = {
  // ZWJ sequences MUST come before their component emoji
  "🧑\u200D💼": "analyst",  // person+ZWJ+briefcase
  "👨\u200D💼": "analyst",
  "👩\u200D💼": "analyst",
  // Single emoji
  "🏦": "bank",   "🏛️": "bank",
  "📊": "barchart",
  "📈": "trendup",
  "📉": "trenddown",
  "🔍": "search",  "🔎": "search",
  "💼": "briefcase",
  "📰": "news",   "🗞️": "news",
  "✅": "check",
  "⚠️": "warning", "⚠": "warning",
  "💰": "money",   "💵": "money",
  "💡": "lightbulb",
  "🎯": "target",
};

function InlineIcon({ type }: { type: string }) {
  const c = "#cc1100";
  const a = (len: number, delay = 0) => ({
    strokeDasharray: len, strokeDashoffset: len,
    animation: `drawStroke 0.65s ease forwards ${delay}s`,
  } as React.CSSProperties);
  const scaleUp = (delay = 0) => ({
    transform: "scaleY(0)",
    animation: `scaleBarUp 0.45s ease forwards ${delay}s`,
  } as React.CSSProperties);

  const wrap = (children: React.ReactNode) => (
    <span style={{ display: "inline-flex", alignItems: "center", verticalAlign: "middle", margin: "0 2px" }}>
      <svg width={18} height={18} viewBox="0 0 20 20" fill="none">
        {children}
      </svg>
    </span>
  );

  switch (type) {
    case "bank": return wrap(<>
      <polyline points="1,8 10,2 19,8" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={a(22,0)}/>
      <line x1="1" y1="8" x2="19" y2="8" stroke={c} strokeWidth="1.5" style={a(18,0.2)}/>
      <line x1="4" y1="10" x2="4" y2="16" stroke={c} strokeWidth="1.8" strokeLinecap="round" style={a(6,0.4)}/>
      <line x1="10" y1="10" x2="10" y2="16" stroke={c} strokeWidth="1.8" strokeLinecap="round" style={a(6,0.5)}/>
      <line x1="16" y1="10" x2="16" y2="16" stroke={c} strokeWidth="1.8" strokeLinecap="round" style={a(6,0.6)}/>
      <line x1="1" y1="17" x2="19" y2="17" stroke={c} strokeWidth="2" strokeLinecap="round" style={a(18,0.75)}/>
    </>);
    case "barchart": return wrap(<>
      <rect x="2" y="12" width="4" height="6" rx="1" fill={c} opacity="0.65" style={{...scaleUp(0.1), transformOrigin:"4px 18px"}}/>
      <rect x="8" y="7" width="4" height="11" rx="1" fill={c} opacity="0.82" style={{...scaleUp(0.28), transformOrigin:"10px 18px"}}/>
      <rect x="14" y="3" width="4" height="15" rx="1" fill={c} style={{...scaleUp(0.46), transformOrigin:"16px 18px"}}/>
    </>);
    case "trendup": return wrap(<>
      <polyline points="1,16 6,11 11,14 19,4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={a(28,0)}/>
      <polyline points="14,4 19,4 19,9" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={a(14,0.5)}/>
    </>);
    case "trenddown": return wrap(<>
      <polyline points="1,4 6,9 11,6 19,16" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={a(28,0)}/>
      <polyline points="14,16 19,16 19,11" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={a(14,0.5)}/>
    </>);
    case "search": return wrap(<>
      <circle cx="8" cy="8" r="6" stroke={c} strokeWidth="1.8" style={a(38,0)}/>
      <line x1="13" y1="13" x2="19" y2="19" stroke={c} strokeWidth="2" strokeLinecap="round" style={a(9,0.5)}/>
    </>);
    case "briefcase": return wrap(<>
      <rect x="1" y="7" width="18" height="11" rx="2" stroke={c} strokeWidth="1.8" style={a(58,0)}/>
      <path d="M7 7V5a3 3 0 0 1 6 0v2" stroke={c} strokeWidth="1.8" strokeLinecap="round" style={a(12,0.4)}/>
      <line x1="1" y1="13" x2="19" y2="13" stroke={c} strokeWidth="1.3" strokeOpacity="0.4" style={a(18,0.65)}/>
    </>);
    case "check": return wrap(<>
      <circle cx="10" cy="10" r="8" stroke={c} strokeWidth="1.8" style={a(50,0)}/>
      <polyline points="6,10 9,13 14,7" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={a(12,0.45)}/>
    </>);
    case "warning": return wrap(<>
      <polygon points="10,2 19,17 1,17" stroke={c} strokeWidth="1.8" strokeLinejoin="round" fill="none" style={a(46,0)}/>
      <line x1="10" y1="8" x2="10" y2="12" stroke={c} strokeWidth="2" strokeLinecap="round" style={a(4,0.5)}/>
      <circle cx="10" cy="15" r="1.2" fill={c} style={{opacity:0, animation:"popIn 0.2s ease forwards 0.75s"}}/>
    </>);
    case "money": return wrap(<>
      <circle cx="10" cy="10" r="8" stroke={c} strokeWidth="1.8" style={a(50,0)}/>
      <line x1="10" y1="5" x2="10" y2="15" stroke={c} strokeWidth="1.5" strokeLinecap="round" style={a(10,0.4)}/>
      <path d="M7.5 7.5 Q10 6 12.5 7.5 Q10 9.5 7.5 11 Q10 13 12.5 11" stroke={c} strokeWidth="1.4" strokeLinecap="round" fill="none" style={a(20,0.55)}/>
    </>);
    case "lightbulb": return wrap(<>
      <path d="M10 2a6 6 0 0 1 4 10.2V14H6v-1.8A6 6 0 0 1 10 2z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" style={a(32,0)}/>
      <line x1="7" y1="16" x2="13" y2="16" stroke={c} strokeWidth="1.8" strokeLinecap="round" style={a(6,0.5)}/>
      <line x1="8.5" y1="18" x2="11.5" y2="18" stroke={c} strokeWidth="1.8" strokeLinecap="round" style={a(3,0.65)}/>
    </>);
    case "target": return wrap(<>
      <circle cx="10" cy="10" r="8" stroke={c} strokeWidth="1.5" style={a(50,0)}/>
      <circle cx="10" cy="10" r="4.5" stroke={c} strokeWidth="1.5" style={a(28,0.3)}/>
      <circle cx="10" cy="10" r="1.5" fill={c} style={{opacity:0, animation:"popIn 0.2s ease forwards 0.65s"}}/>
    </>);
    case "news": return wrap(<>
      <rect x="2" y="2" width="16" height="16" rx="2" stroke={c} strokeWidth="1.8" style={a(60,0)}/>
      <line x1="5" y1="7" x2="15" y2="7" stroke={c} strokeWidth="1.6" strokeLinecap="round" style={a(10,0.4)}/>
      <line x1="5" y1="10.5" x2="15" y2="10.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.7" style={a(10,0.55)}/>
      <line x1="5" y1="14" x2="11" y2="14" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.45" style={a(6,0.7)}/>
    </>);
    case "analyst": return wrap(<>
      <circle cx="10" cy="6.5" r="3.5" stroke={c} strokeWidth="1.8" style={a(22,0)}/>
      <path d="M3 18 C3 13 6 11 10 11 C14 11 17 13 17 18" stroke={c} strokeWidth="1.8" strokeLinecap="round" style={a(24,0.4)}/>
      <polyline points="14,5 17,2 17,5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={a(9,0.75)}/>
      <line x1="13" y1="6" x2="17" y2="2" stroke={c} strokeWidth="1.5" strokeLinecap="round" style={a(6,0.7)}/>
    </>);
    default: return null;
  }
}

function withIcons(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child !== "string") return child;
    const knownEmoji = Object.keys(EMOJI_TO_ICON);
    let parts: Array<string | React.ReactNode> = [child];
    for (const emoji of knownEmoji) {
      const next: Array<string | React.ReactNode> = [];
      for (const part of parts) {
        if (typeof part !== "string") { next.push(part); continue; }
        const segs = part.split(emoji);
        segs.forEach((seg, i) => {
          if (seg) next.push(seg);
          if (i < segs.length - 1) next.push(<InlineIcon key={emoji + i} type={EMOJI_TO_ICON[emoji]} />);
        });
      }
      parts = next;
    }
    return parts as React.ReactNode[];
  });
}

// ─────────────────────────────────────────────────────────────────────────────

type ChartSpec = {
  type: "line" | "bar" | "area";
  title: string;
  data: Record<string, any>[];
  xKey: string;
  series: { key: string; name: string; color: string }[];
};

type AnalystRatingsSpec = {
  symbol: string;
  consensus: string;
  period?: string;
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  totalAnalysts: number;
  buyChangeVsLastMonth?: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  charts?: ChartSpec[];
  analystRatings?: AnalystRatingsSpec[];
};

const FLOATING_BUBBLES = [
  { symbol: "RY",  name: "Royal Bank",     color: "#0066cc", left: "4%",  top: "10%", size: 60, dx: 18,  dy: 14,  dur: 16, delay: 0   },
  { symbol: "TD",  name: "TD Bank",        color: "#34a853", left: "87%", top: "14%", size: 54, dx: -16, dy: 22,  dur: 20, delay: 1   },
  { symbol: "BNS", name: "Scotiabank",     color: "#ec1c24", left: "10%", top: "62%", size: 52, dx: 14,  dy: -20, dur: 18, delay: 2   },
  { symbol: "BMO", name: "BMO",            color: "#0079c1", left: "74%", top: "58%", size: 58, dx: -22, dy: -14, dur: 22, delay: 0.5 },
  { symbol: "CM",  name: "CIBC",           color: "#c41230", left: "48%", top: "4%",  size: 48, dx: 10,  dy: 24,  dur: 15, delay: 3   },
  { symbol: "NA",  name: "Nat. Bank",      color: "#da291c", left: "91%", top: "44%", size: 50, dx: -20, dy: 10,  dur: 19, delay: 1.5 },
  { symbol: "ENB", name: "Enbridge",       color: "#e07530", left: "2%",  top: "38%", size: 46, dx: 22,  dy: -12, dur: 23, delay: 2.5 },
  { symbol: "BCE", name: "BCE",            color: "#00a0df", left: "58%", top: "78%", size: 52, dx: -12, dy: -22, dur: 16, delay: 4   },
  { symbol: "CNR", name: "CN Rail",        color: "#cc3300", left: "28%", top: "83%", size: 48, dx: 16,  dy: -16, dur: 21, delay: 1   },
  { symbol: "SU",  name: "Suncor",         color: "#ffb300", left: "77%", top: "24%", size: 54, dx: -14, dy: 20,  dur: 17, delay: 3.5 },
  { symbol: "TRI", name: "Thomson Reuters",color: "#ff6200", left: "20%", top: "18%", size: 46, dx: 12,  dy: 22,  dur: 24, delay: 0   },
  { symbol: "MFC", name: "Manulife",       color: "#00a758", left: "43%", top: "73%", size: 50, dx: -10, dy: -24, dur: 19, delay: 2   },
  { symbol: "T",   name: "Telus",          color: "#7b2d8b", left: "66%", top: "87%", size: 44, dx: -16, dy: -12, dur: 25, delay: 4.5 },
  { symbol: "CP",  name: "CP Rail",        color: "#c8102e", left: "7%",  top: "86%", size: 46, dx: 20,  dy: -10, dur: 14, delay: 1   },
  { symbol: "CNQ", name: "Can. Natural",   color: "#4a90d9", left: "36%", top: "2%",  size: 48, dx: -10, dy: 20,  dur: 21, delay: 3   },
];

function FloatingBubble({ symbol, name, color, left, top, size, dx, dy, dur, delay }: typeof FLOATING_BUBBLES[0]) {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{
      position: "absolute", left, top,
      animation: `bubbleFloat ${dur}s ease-in-out infinite`,
      animationDelay: `${delay}s`,
      ["--dx" as any]: `${dx}px`,
      ["--dy" as any]: `${dy}px`,
      pointerEvents: "none",
      zIndex: 0,
    }}>
      <div style={{
        width: size, height: size, borderRadius: "50%",
        backgroundColor: "#ffffff",
        border: `1.5px solid ${color}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 0 18px ${color}1a, 0 4px 12px rgba(0,0,0,0.4)`,
        overflow: "hidden",
        position: "relative",
      }}>
        {!imgError ? (
          <img
            src={`https://assets.parqet.com/logos/symbol/${symbol}`}
            alt={symbol}
            width={size * 0.62}
            height={size * 0.62}
            onError={() => setImgError(true)}
            style={{ objectFit: "contain", borderRadius: "50%" }}
          />
        ) : (
          <span style={{ fontSize: size * 0.22, fontWeight: 800, color, fontFamily: "monospace", letterSpacing: "0.02em" }}>
            {symbol.slice(0, 3)}
          </span>
        )}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `radial-gradient(circle at 35% 28%, ${color}14, transparent 65%)`,
          pointerEvents: "none",
        }}/>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  { text: "Show TD Bank's price chart (3 months)", sub: "Price history · TD.TO", icon: "linechart" },
  { text: "Compare Canadian banks P/E ratios", sub: "Peer comparison · Big 6", icon: "barchart" },
  { text: "TD Bank earnings vs estimates", sub: "8 quarters · EPS history", icon: "search" },
  { text: "What do analysts think of TD?", sub: "Analyst consensus · Ratings", icon: "analyst" },
];

const CONSENSUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  strongBuy:  { label: "Strong Buy",  color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
  buy:        { label: "Buy",         color: "#86efac", bg: "rgba(134,239,172,0.1)" },
  hold:       { label: "Hold",        color: "#facc15", bg: "rgba(250,204,21,0.1)" },
  sell:       { label: "Sell",        color: "#f97316", bg: "rgba(249,115,22,0.1)" },
  strongSell: { label: "Strong Sell", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

function AnalystRatingsCard({ data }: { data: AnalystRatingsSpec }) {
  const cfg = CONSENSUS_CONFIG[data.consensus] ?? CONSENSUS_CONFIG.hold;
  const total = data.totalAnalysts || 1;

  const bars = [
    { label: "Strong Buy", count: data.strongBuy, color: "#22c55e" },
    { label: "Buy",        count: data.buy,        color: "#86efac" },
    { label: "Hold",       count: data.hold,       color: "#facc15" },
    { label: "Sell",       count: data.sell,       color: "#f97316" },
    { label: "Strong Sell",count: data.strongSell, color: "#ef4444" },
  ];

  const bullish = data.strongBuy + data.buy;
  const bearish = data.sell + data.strongSell;

  return (
    <div style={{
      backgroundColor: "#fafaf8",
      border: "1px solid rgba(28,26,27,0.1)",
      borderRadius: 8,
      padding: "14px 16px",
      marginTop: 10,
      width: "min(480px, 92vw)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#555", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 2 }}>
            Analyst Consensus · {data.symbol}
          </div>
          {data.period && (
            <div style={{ fontSize: 10, color: "#444" }}>{data.period}</div>
          )}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          backgroundColor: cfg.bg,
          border: `1px solid ${cfg.color}33`,
          borderRadius: 6,
          padding: "5px 10px",
        }}>
          {data.consensus === "strongBuy" || data.consensus === "buy"
            ? <TrendUp size={14} color={cfg.color} weight="bold" />
            : data.consensus === "strongSell" || data.consensus === "sell"
            ? <TrendDown size={14} color={cfg.color} weight="bold" />
            : <Minus size={14} color={cfg.color} weight="bold" />
          }
          <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{cfg.label}</span>
        </div>
      </div>

      {/* Rating bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
        {bars.map((b) => (
          <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 72, fontSize: 11, color: "#666", textAlign: "right" as const, flexShrink: 0 }}>{b.label}</div>
            <div style={{ flex: 1, height: 6, backgroundColor: "rgba(28,26,27,0.06)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${total > 0 ? (b.count / total) * 100 : 0}%`,
                backgroundColor: b.color,
                borderRadius: 3,
                transition: "width 0.4s ease",
              }} />
            </div>
            <div style={{ width: 20, fontSize: 11, color: "#555", textAlign: "right" as const, flexShrink: 0 }}>{b.count}</div>
          </div>
        ))}
      </div>

      {/* Footer stats */}
      <div style={{ display: "flex", gap: 12, borderTop: "1px solid rgba(28,26,27,0.06)", paddingTop: 10 }}>
        <div style={{ flex: 1, textAlign: "center" as const }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#22c55e" }}>{bullish}</div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>Bullish</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" as const }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#888" }}>{data.hold}</div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>Hold</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" as const }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#ef4444" }}>{bearish}</div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>Bearish</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" as const }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#888" }}>{data.totalAnalysts}</div>
          <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>Total</div>
        </div>
        {data.buyChangeVsLastMonth != null && (
          <div style={{ flex: 1, textAlign: "center" as const }}>
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: data.buyChangeVsLastMonth > 0 ? "#22c55e" : data.buyChangeVsLastMonth < 0 ? "#ef4444" : "#888",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 2,
            }}>
              {data.buyChangeVsLastMonth > 0
                ? <ArrowUp size={12} weight="bold" />
                : data.buyChangeVsLastMonth < 0
                ? <ArrowDown size={12} weight="bold" />
                : null}
              {Math.abs(data.buyChangeVsLastMonth)}
            </div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>vs Last Mo.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionIcon({ name }: { name: string }) {
  const id = Math.random().toString(36).slice(2);
  if (name === "linechart") return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <defs>
        <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="34" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#cc1100" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#cc1100"/>
        </linearGradient>
        <filter id={`glow-${id}`}>
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <polyline
        points="3,27 10,19 16,22 22,12 31,8"
        stroke={`url(#lg-${id})`} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 80, strokeDashoffset: 80, animation: "drawStroke 1.2s ease forwards 0.1s" }}
      />
      <circle cx="31" cy="8" r="3" fill="#cc1100" filter={`url(#glow-${id})`}
        style={{ animation: "popIn 0.3s ease forwards 1.2s", transform: "scale(0)", transformOrigin: "31px 8px" }}
      />
      <polyline points="3,27 10,19 16,22 22,12 31,8"
        stroke="#cc1100" strokeWidth="0.4" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.2"
      />
    </svg>
  );
  if (name === "barchart") return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <defs>
        <linearGradient id={`bar1-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cc1100"/><stop offset="100%" stopColor="#cc1100" stopOpacity="0.3"/>
        </linearGradient>
        <linearGradient id={`bar2-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cc1100" stopOpacity="0.8"/><stop offset="100%" stopColor="#cc1100" stopOpacity="0.2"/>
        </linearGradient>
        <linearGradient id={`bar3-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cc1100" stopOpacity="0.6"/><stop offset="100%" stopColor="#cc1100" stopOpacity="0.1"/>
        </linearGradient>
      </defs>
      <rect x="4" y="30" width="6" height="0" rx="1.5" fill={`url(#bar1-${id})`}
        style={{ animation: "growBar 0.6s ease forwards 0.1s", transformOrigin: "7px 30px" }}
      />
      <rect x="14" y="30" width="6" height="0" rx="1.5" fill={`url(#bar2-${id})`}
        style={{ animation: "growBar2 0.6s ease forwards 0.3s", transformOrigin: "17px 30px" }}
      />
      <rect x="24" y="30" width="6" height="0" rx="1.5" fill={`url(#bar3-${id})`}
        style={{ animation: "growBar3 0.6s ease forwards 0.5s", transformOrigin: "27px 30px" }}
      />
      <line x1="2" y1="30" x2="32" y2="30" stroke="#333" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );
  if (name === "search") return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <defs>
        <filter id={`sglow-${id}`}>
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="14" cy="14" r="9" stroke="#cc1100" strokeWidth="2.2" strokeOpacity="0.25"/>
      <circle cx="14" cy="14" r="9" stroke="#cc1100" strokeWidth="2.2"
        style={{ strokeDasharray: 56, strokeDashoffset: 56, animation: "drawStroke 0.9s ease forwards 0.1s" }}
        filter={`url(#sglow-${id})`}
      />
      <line x1="20.5" y1="20.5" x2="30" y2="30" stroke="#cc1100" strokeWidth="2.2" strokeLinecap="round"
        style={{ strokeDasharray: 14, strokeDashoffset: 14, animation: "drawStroke 0.4s ease forwards 0.9s" }}
      />
      <circle cx="14" cy="14" r="4" fill="#cc1100" fillOpacity="0.12"
        style={{ animation: "scanPulse 2s ease-in-out infinite 1.3s" }}
      />
    </svg>
  );
  // analyst
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
      <defs>
        <filter id={`aglow-${id}`}>
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="17" cy="11" r="5.5" stroke="#cc1100" strokeWidth="2"
        style={{ strokeDasharray: 35, strokeDashoffset: 35, animation: "drawStroke 0.7s ease forwards 0.1s" }}
        filter={`url(#aglow-${id})`}
      />
      <path d="M5 30 C5 22 10 18 17 18 C24 18 29 22 29 30"
        stroke="#cc1100" strokeWidth="2" strokeLinecap="round"
        style={{ strokeDasharray: 50, strokeDashoffset: 50, animation: "drawStroke 0.8s ease forwards 0.7s" }}
      />
      <line x1="22" y1="19" x2="30" y2="11" stroke="#cc1100" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5"
        style={{ strokeDasharray: 12, strokeDashoffset: 12, animation: "drawStroke 0.3s ease forwards 1.4s" }}
      />
      <polyline points="25,14 30,11 27,7" stroke="#cc1100" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 14, strokeDashoffset: 14, animation: "drawStroke 0.4s ease forwards 1.6s" }}
      />
    </svg>
  );
}

function PixelWizard() {
  return (
    <div style={{ animation: "wizardFloat 3s ease-in-out infinite", display: "inline-block" }}>
      <svg
        width="72"
        height="104"
        viewBox="0 0 18 26"
        style={{ imageRendering: "pixelated" as const }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hat */}
        <rect x="8" y="0" width="2" height="1" fill="#7c3aed"/>
        <rect x="7" y="1" width="4" height="1" fill="#7c3aed"/>
        <rect x="6" y="2" width="6" height="1" fill="#7c3aed"/>
        <rect x="5" y="3" width="8" height="1" fill="#7c3aed"/>
        <rect x="4" y="4" width="10" height="1" fill="#cc1100"/>

        {/* Face */}
        <rect x="5" y="5" width="8" height="4" fill="#fcd34d"/>
        {/* Eyebrows */}
        <rect x="6" y="5" width="2" height="1" fill="#92400e"/>
        <rect x="10" y="5" width="2" height="1" fill="#92400e"/>
        {/* Eyes */}
        <rect x="7" y="6" width="1" height="1" fill="#1e1b4b"/>
        <rect x="11" y="6" width="1" height="1" fill="#1e1b4b"/>
        {/* Mouth */}
        <rect x="7" y="8" width="4" height="1" fill="#dc2626"/>

        {/* Beard */}
        <rect x="5" y="9" width="8" height="1" fill="#f1f5f9"/>
        <rect x="6" y="10" width="6" height="1" fill="#f1f5f9"/>

        {/* Robe body */}
        <rect x="5" y="11" width="8" height="8" fill="#4c1d95"/>
        {/* Left sleeve */}
        <rect x="3" y="12" width="2" height="3" fill="#4c1d95"/>
        {/* Right sleeve */}
        <rect x="13" y="12" width="2" height="3" fill="#4c1d95"/>
        {/* Robe bottom flare */}
        <rect x="4" y="17" width="10" height="2" fill="#4c1d95"/>

        {/* Boots */}
        <rect x="5" y="19" width="3" height="2" fill="#1c1917"/>
        <rect x="10" y="19" width="3" height="2" fill="#1c1917"/>

        {/* Wand */}
        <rect x="2" y="11" width="1" height="6" fill="#92400e"/>
        {/* Wand tip with glow */}
        <g style={{ animation: "wandGlow 2s ease-in-out infinite" }}>
          <rect x="2" y="10" width="1" height="1" fill="#fde047"/>
        </g>

        {/* Stars with staggered twinkle */}
        <g style={{ animation: "starTwinkle 1.5s ease-in-out infinite", animationDelay: "0s" }}>
          <rect x="15" y="2" width="1" height="1" fill="#fde047"/>
        </g>
        <g style={{ animation: "starTwinkle 1.5s ease-in-out infinite", animationDelay: "0.3s" }}>
          <rect x="1" y="5" width="1" height="1" fill="#fde047"/>
        </g>
        <g style={{ animation: "starTwinkle 1.5s ease-in-out infinite", animationDelay: "0.6s" }}>
          <rect x="16" y="9" width="1" height="1" fill="#fde047"/>
        </g>
        <g style={{ animation: "starTwinkle 1.5s ease-in-out infinite", animationDelay: "0.9s" }}>
          <rect x="0" y="13" width="1" height="1" fill="#fde047"/>
        </g>
        <g style={{ animation: "starTwinkle 1.5s ease-in-out infinite", animationDelay: "1.2s" }}>
          <rect x="16" y="15" width="1" height="1" fill="#fde047"/>
        </g>
      </svg>
    </div>
  );
}

function formatYAxis(value: number) {
  return `$${value}`;
}

function ChartMessage({ chart }: { chart: ChartSpec }) {
  const height = 240;
  const commonProps = {
    data: chart.data,
    margin: { top: 10, right: 20, left: 10, bottom: 5 },
  };
  const axisStyle = { fill: "#444", fontSize: 10 };
  const gridStyle = { stroke: "rgba(28,26,27,0.06)" };
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#ffffff",
      border: "1px solid rgba(28,26,27,0.1)",
      color: "#6b6460",
      borderRadius: 6,
      padding: "6px 10px",
      fontSize: 12,
    },
    labelStyle: { color: "#888", marginBottom: 3 },
  };

  const isPriceChart = chart.series.some(s =>
    s.key === "close" || s.key === "price" || s.key.toLowerCase().includes("price")
  );

  function renderChart() {
    if (chart.type === "line") {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
          <XAxis dataKey={chart.xKey} tick={axisStyle} />
          <YAxis
            tick={axisStyle}
            tickFormatter={isPriceChart ? formatYAxis : undefined}
          />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#555" }} />
          {chart.series.map((s) => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} dot={false} strokeWidth={2} />
          ))}
        </LineChart>
      );
    }
    if (chart.type === "area") {
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
          <XAxis dataKey={chart.xKey} tick={axisStyle} />
          <YAxis
            tick={axisStyle}
            tickFormatter={isPriceChart ? formatYAxis : undefined}
          />
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#555" }} />
          {chart.series.map((s) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} fill={s.color + "22"} strokeWidth={2} />
          ))}
        </AreaChart>
      );
    }
    // bar
    return (
      <BarChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
        <XAxis dataKey={chart.xKey} tick={axisStyle} />
        <YAxis tick={axisStyle} />
        <Tooltip {...tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#555" }} />
        {chart.series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    );
  }

  return (
    <div style={{
      backgroundColor: "#fafaf8",
      border: "1px solid rgba(28,26,27,0.1)",
      borderRadius: 8,
      padding: "12px 14px",
      marginTop: 10,
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 600,
        color: "#555",
        textTransform: "uppercase" as const,
        letterSpacing: "0.08em",
        marginBottom: 12,
      }}>
        {chart.title}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.content, charts: data.charts || [], analystRatings: data.analystRatings || [] }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f5f2ee" }}>
      {/* Header */}
      <header style={{
        height: 52,
        padding: "0 20px",
        borderBottom: "1px solid rgba(28,26,27,0.1)",
        backgroundColor: "#f5f2ee",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: "#cc1100",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <TrendingUp size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1a1b", letterSpacing: "-0.01em" }}>
              Market Assistant
            </div>
            <div style={{ fontSize: 10, color: "#555", marginTop: -1 }}>
              Real-time data · Powered by Claude
            </div>
          </div>
        </div>
        <div style={{
          fontSize: 10,
          color: "#555",
          padding: "3px 8px",
          borderRadius: 4,
          border: "1px solid rgba(28,26,27,0.1)",
          letterSpacing: "0.02em",
        }}>
          EDUCATIONAL USE ONLY
        </div>
      </header>

      {/* Empty home screen */}
      {messages.length === 0 && (
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Floating bubbles background */}
          {FLOATING_BUBBLES.map((b) => <FloatingBubble key={b.symbol} {...b} />)}

          {/* Center content */}
          <div style={{
            position: "relative", zIndex: 1,
            height: "100%", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "0 20px",
          }}>
            <div style={{ marginBottom: 16 }}><PixelWizard /></div>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, color: "#1d1a1b", letterSpacing: "-0.02em" }}>
              Market Assistant
            </div>
            <div style={{ color: "#555", marginBottom: 24, fontSize: 13 }}>
              Ask about stocks, earnings, analyst views, or market trends.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%", maxWidth: 480, marginBottom: 16 }}>
              {SUGGESTIONS.map((s) => (
                <button key={s.text} onClick={() => sendMessage(s.text)} style={{
                  padding: "12px 14px", textAlign: "left", borderRadius: 8,
                  border: "1px solid rgba(28,26,27,0.1)", backgroundColor: "#ffffff",
                  cursor: "pointer", width: "100%", transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#cc1100"; e.currentTarget.style.backgroundColor = "#ede8e4"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,26,27,0.1)"; e.currentTarget.style.backgroundColor = "#ffffff"; }}
                >
                  <div style={{ marginBottom: 6 }}><SuggestionIcon name={s.icon} /></div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#1d1a1b", lineHeight: 1.4 }}>{s.text}</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>{s.sub}</div>
                </button>
              ))}
            </div>
            {/* Centered input bar */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", maxWidth: 480 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a stock, ETF, or market concept..."
                autoFocus
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 8,
                  border: "1px solid rgba(28,26,27,0.14)", backgroundColor: "#ffffff",
                  color: "#1d1a1b", fontSize: 13, outline: "none",
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                style={{
                  width: 36, height: 36, borderRadius: 8, border: "none", flexShrink: 0,
                  backgroundColor: input.trim() ? "#cc1100" : "#1a1a1a",
                  color: input.trim() ? "#fff" : "#444",
                  cursor: input.trim() ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s",
                }}
              >
                <Send size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages area — only when chatting */}
      {messages.length > 0 && (
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: msg.role === "user" ? "flex-end" : "flex-start",
            gap: 4,
          }}>
            <div style={{
              maxWidth: msg.role === "user" ? "70%" : "80%",
              padding: msg.role === "user" ? "9px 14px" : "12px 16px",
              borderRadius: msg.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
              backgroundColor: msg.role === "user" ? "#cc1100" : "#111",
              border: msg.role === "user" ? "none" : "1px solid rgba(28,26,27,0.1)",
              color: msg.role === "user" ? "#fff" : "#6b6460",
              fontSize: 13,
              lineHeight: 1.6,
              wordBreak: "break-word",
            }}>
              {msg.role === "user" ? (
                msg.content
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ children }) => (
                      <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 8, fontSize: 12 }}>{children}</table>
                    ),
                    th: ({ children }) => (
                      <th style={{ padding: "6px 10px", borderBottom: "1px solid rgba(28,26,27,0.1)", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{withIcons(children)}</th>
                    ),
                    td: ({ children }) => (
                      <td style={{ padding: "6px 10px", borderBottom: "1px solid rgba(28,26,27,0.05)", color: "#d0d0d0" }}>{withIcons(children)}</td>
                    ),
                    p: ({ children }) => <p style={{ margin: "6px 0", lineHeight: 1.7 }}>{withIcons(children)}</p>,
                    ul: ({ children }) => <ul style={{ margin: "6px 0", paddingLeft: 16 }}>{children}</ul>,
                    ol: ({ children }) => <ol style={{ margin: "6px 0", paddingLeft: 16 }}>{children}</ol>,
                    li: ({ children }) => <li style={{ marginBottom: 4, lineHeight: 1.6 }}>{withIcons(children)}</li>,
                    strong: ({ children }) => <strong style={{ color: "#f0f0f0", fontWeight: 600 }}>{children}</strong>,
                    h2: ({ children }) => (
                      <div style={{ margin: "14px 0 6px", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#f0f0f0", letterSpacing: "-0.01em" }}>{withIcons(children)}</span>
                        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(204,17,0,0.25), transparent)" }}/>
                      </div>
                    ),
                    h3: ({ children }) => <h3 style={{ margin: "10px 0 4px", fontSize: 12, fontWeight: 700, color: "#cc1100", textTransform: "uppercase", letterSpacing: "0.06em" }}>{withIcons(children)}</h3>,
                    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#cc1100", textDecoration: "underline" }}>{children}</a>,
                    blockquote: ({ children }) => <blockquote style={{ margin: "10px 0 4px", padding: "8px 12px", borderLeft: "2px solid #cc1100", backgroundColor: "rgba(224,85,32,0.05)", borderRadius: "0 4px 4px 0", color: "#888", fontSize: 12 }}>{children}</blockquote>,
                    code: ({ children }) => <code style={{ backgroundColor: "#ede8e4", padding: "1px 5px", borderRadius: 3, fontSize: 12, color: "#cc1100" }}>{children}</code>,
                    hr: () => <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.06)", margin: "10px 0" }}/>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
            {msg.role === "assistant" && msg.charts && msg.charts.length > 0 && msg.charts.map((chart, ci) => (
              <div key={ci} style={{ width: "min(640px, 92vw)" }}>
                <ChartMessage chart={chart} />
              </div>
            ))}
            {msg.role === "assistant" && msg.analystRatings && msg.analystRatings.length > 0 && msg.analystRatings.map((rating, ri) => (
              <div key={ri}>
                <AnalystRatingsCard data={rating} />
              </div>
            ))}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "10px 14px",
              borderRadius: "14px 14px 14px 3px",
              backgroundColor: "#ffffff",
              border: "1px solid rgba(28,26,27,0.1)",
              display: "flex", gap: 4, alignItems: "center",
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: "50%",
                  backgroundColor: "#cc1100",
                  animation: "pulse 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.18}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
      )}

      {/* Bottom input — only while chatting */}
      {messages.length > 0 && (
      <div style={{
        padding: "10px 14px",
        borderTop: "1px solid rgba(28,26,27,0.1)",
        backgroundColor: "#f5f2ee",
        display: "flex", gap: 8, alignItems: "center", flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about a stock, ETF, or market concept..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "9px 14px",
            borderRadius: 8,
            border: "1px solid rgba(28,26,27,0.1)",
            backgroundColor: "#ffffff",
            color: "#1d1a1b",
            fontSize: 13,
            outline: "none",
            opacity: loading ? 0.6 : 1,
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{
            width: 34, height: 34,
            borderRadius: 8,
            border: "none",
            backgroundColor: input.trim() && !loading ? "#cc1100" : "#1a1a1a",
            color: input.trim() && !loading ? "#fff" : "#444",
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          aria-label="Send"
        >
          <Send size={14} strokeWidth={2} />
        </button>
      </div>
      )}

      <style>{`
        @keyframes scaleBarUp {
          to { transform: scaleY(1); }
        }
        @keyframes bubbleFloat {
          0%, 100% { transform: translate(0, 0); }
          33%  { transform: translate(var(--dx), var(--dy)); }
          66%  { transform: translate(calc(var(--dx) * -0.4), calc(var(--dy) * 0.6)); }
        }
        @keyframes drawStroke {
          to { stroke-dashoffset: 0; }
        }
        @keyframes popIn {
          to { transform: scale(1); }
        }
        @keyframes growBar {
          to { y: 8px; height: 22px; }
        }
        @keyframes growBar2 {
          to { y: 15px; height: 15px; }
        }
        @keyframes growBar3 {
          to { y: 20px; height: 10px; }
        }
        @keyframes scanPulse {
          0%, 100% { r: 4; opacity: 0.12; }
          50% { r: 7; opacity: 0.25; }
        }
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.75); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes wizardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes wandGlow {
          0%, 100% { filter: drop-shadow(0 0 2px #fde047); opacity: 1; }
          50% { filter: drop-shadow(0 0 6px #cc1100) drop-shadow(0 0 12px #cc1100); opacity: 0.9; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(0.5); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(28,26,27,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}
