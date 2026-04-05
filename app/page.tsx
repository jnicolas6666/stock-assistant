"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// Custom inline SVG icons — no external icon libraries
import {
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  ComposedChart,
  ScatterChart, Scatter, ZAxis,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LabelList, ReferenceLine,
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
  // Extended set
  "🏆": "trophy",
  "⚡": "lightning",
  "🔥": "fire",
  "🌍": "globe", "🌎": "globe", "🌏": "globe",
  "🛡️": "shield", "🛡": "shield",
  "💎": "diamond",
  "🚀": "rocket",
  "🔴": "reddot", "🔶": "reddot",
  "🟢": "greendot",
  "🟡": "yellowdot", "🟠": "yellowdot",
  "🔻": "downtri", "📌": "pin",
  "⭐": "star", "🌟": "star",
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
    // ── Extended icons ──────────────────────────────────────────────────────
    case "trophy": return wrap(<>
      <path d="M7,3 L13,3 L12.5,9.5 C12,12.5 10,13.5 10,13.5 C10,13.5 8,12.5 7.5,9.5 Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" style={a(32,0)}/>
      <path d="M7,5 C4.5,5 3,6.5 4.5,9" stroke={c} strokeWidth="1.5" strokeLinecap="round" style={a(7,0.3)}/>
      <path d="M13,5 C15.5,5 17,6.5 15.5,9" stroke={c} strokeWidth="1.5" strokeLinecap="round" style={a(7,0.3)}/>
      <line x1="10" y1="13.5" x2="10" y2="16.5" stroke={c} strokeWidth="1.6" strokeLinecap="round" style={a(3,0.5)}/>
      <line x1="7" y1="17.5" x2="13" y2="17.5" stroke={c} strokeWidth="1.9" strokeLinecap="round" style={a(6,0.65)}/>
    </>);
    case "lightning": return wrap(<>
      <path d="M13,2 L7,11 L11.5,11 L7,18 L13,9 L8.5,9 Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" style={a(44,0)}/>
    </>);
    case "fire": return wrap(<>
      <path d="M10,2 C12,5 14,8.5 14,11.5 C14,14.8 12.2,17 10,17 C7.8,17 6,14.8 6,11.5 C6,9.5 7,8 8,7.5 C8,9 9,10.5 10,10.5 C10,10.5 10,5.5 10,2 Z" stroke={c} strokeWidth="1.7" strokeLinejoin="round" style={a(50,0)}/>
    </>);
    case "globe": return wrap(<>
      <circle cx="10" cy="10" r="8" stroke={c} strokeWidth="1.7" style={a(50,0)}/>
      <ellipse cx="10" cy="10" rx="3.5" ry="8" stroke={c} strokeWidth="1.3" strokeOpacity="0.6" style={a(24,0.35)}/>
      <line x1="2" y1="10" x2="18" y2="10" stroke={c} strokeWidth="1.3" strokeOpacity="0.6" style={a(16,0.52)}/>
    </>);
    case "shield": return wrap(<>
      <path d="M10,2 L18,5.5 L18,11 C18,15 14.5,17.5 10,19 C5.5,17.5 2,15 2,11 L2,5.5 Z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" style={a(60,0)}/>
    </>);
    case "diamond": return wrap(<>
      <polygon points="10,2 18,9 10,18 2,9" stroke={c} strokeWidth="1.8" strokeLinejoin="round" style={a(42,0)}/>
      <line x1="2" y1="9" x2="18" y2="9" stroke={c} strokeWidth="1.3" strokeOpacity="0.45" style={a(16,0.5)}/>
      <polyline points="5.5,9 10,2 14.5,9" stroke={c} strokeWidth="1.2" strokeLinejoin="round" strokeOpacity="0.35" style={a(15,0.6)}/>
    </>);
    case "rocket": return wrap(<>
      <path d="M10,2 C13,4.5 15,8 15,11 L10,14 L5,11 C5,8 7,4.5 10,2 Z" stroke={c} strokeWidth="1.7" strokeLinejoin="round" style={a(34,0)}/>
      <path d="M5,11 L3,15 L7,13.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={a(10,0.4)}/>
      <path d="M15,11 L17,15 L13,13.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={a(10,0.4)}/>
      <circle cx="10" cy="8.5" r="1.6" stroke={c} strokeWidth="1.4" style={a(10,0.55)}/>
    </>);
    case "star": return wrap(<>
      <polygon points="10,2 12.5,7.8 18.8,8.2 14.2,12.5 15.6,18.8 10,15.3 4.4,18.8 5.8,12.5 1.2,8.2 7.5,7.8" stroke={c} strokeWidth="1.6" strokeLinejoin="round" style={a(60,0)}/>
    </>);
    case "pin": return wrap(<>
      <circle cx="10" cy="7.5" r="4.5" stroke={c} strokeWidth="1.8" style={a(28,0)}/>
      <line x1="10" y1="12" x2="10" y2="18" stroke={c} strokeWidth="1.8" strokeLinecap="round" style={a(6,0.45)}/>
    </>);
    // Status dot indicators — small colored circles with ring (use inline span, not SVG wrapper)
    case "reddot": return (
      <span style={{ display:"inline-flex", alignItems:"center", verticalAlign:"middle", margin:"0 2px" }}>
        <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
          <circle cx="5.5" cy="5.5" r="3.5" fill="#cc1100" style={{opacity:0, animation:"popIn 0.25s ease forwards 0.05s"}}/>
          <circle cx="5.5" cy="5.5" r="3.5" stroke="#cc1100" strokeWidth="1.2"/>
        </svg>
      </span>
    );
    case "greendot": return (
      <span style={{ display:"inline-flex", alignItems:"center", verticalAlign:"middle", margin:"0 2px" }}>
        <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
          <circle cx="5.5" cy="5.5" r="3.5" fill="#22c55e" style={{opacity:0, animation:"popIn 0.25s ease forwards 0.05s"}}/>
          <circle cx="5.5" cy="5.5" r="3.5" stroke="#22c55e" strokeWidth="1.2"/>
        </svg>
      </span>
    );
    case "yellowdot": return (
      <span style={{ display:"inline-flex", alignItems:"center", verticalAlign:"middle", margin:"0 2px" }}>
        <svg width={11} height={11} viewBox="0 0 11 11" fill="none">
          <circle cx="5.5" cy="5.5" r="3.5" fill="#f59e0b" style={{opacity:0, animation:"popIn 0.25s ease forwards 0.05s"}}/>
          <circle cx="5.5" cy="5.5" r="3.5" stroke="#f59e0b" strokeWidth="1.2"/>
        </svg>
      </span>
    );
    case "downtri": return (
      <span style={{ display:"inline-flex", alignItems:"center", verticalAlign:"middle", margin:"0 2px" }}>
        <svg width={12} height={10} viewBox="0 0 12 10" fill="none">
          <polygon points="6,9.5 0.5,1 11.5,1" fill={c} style={{opacity:0, animation:"popIn 0.25s ease forwards 0.05s"}}/>
        </svg>
      </span>
    );
    default: return null;
  }
}

// Strip any emoji that wasn't converted to a custom icon
// Matches emoji ranges without unicode flag (broad but safe for our use case)
function stripResidualEmoji(s: string): string {
  // Remove misc symbols/pictographs (U+1F300–U+1F9FF) and dingbats/misc (U+2600–U+27BF)
  // Using surrogate pairs for astral plane: U+1F300 = \uD83C\uDF00, U+1FFFF = \uD83F\uDFFF
  return s.replace(/[\uD83C-\uD83F][\uDC00-\uDFFF]|[\u2600-\u27BF]|[\uFE00-\uFE0F]/g, "").replace(/  +/g, " ");
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
    // Strip any remaining emoji not in our map
    parts = parts.map(p => typeof p === "string" ? stripResidualEmoji(p) : p);
    return parts.filter(p => p !== "") as React.ReactNode[];
  });
}

// ─────────────────────────────────────────────────────────────────────────────

type ChartSpec = {
  type: "line" | "bar" | "area" | "combo" | "scatter";
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
  tickers?: string[];
  isFollowUp?: boolean;       // response was a follow-up chip — merged into parent, shown compact
  followUpOfIndex?: number;   // index of the parent analysis this follow-up belongs to
};

type Position = { id: string; ticker: string; shares: number; avgCost: number };
type LivePrice = { price: number; currency: string; change: number; changePercent: number; name: string };

// ~1000+ popular tickers (US S&P 500, ETFs, ADRs, TSX)
const ALL_TICKERS: string[] = [
  // US Tech
  "AAPL","MSFT","NVDA","GOOGL","GOOG","META","TSLA","AVGO","ORCL","ADBE","CRM","NOW","INTU",
  "QCOM","TXN","AMD","INTC","AMAT","MU","LRCX","KLAC","MCHP","ADI","SNPS","CDNS","FTNT",
  "PANW","CRWD","ZS","NET","PLTR","SNOW","DDOG","WDAY","CTSH","VEEV","UBER","ABNB","COIN",
  "SPOT","ZM","DOCU","TWLO","OKTA","BILL","HUBS","PCTY","PAYC","ADP","PAYX","CSCO","ANET",
  "CDW","LDOS","SAIC","AKAM","VRSN","EPAM","JNPR","NTAP","HPQ","HPE","DELL","WDC","STX",
  "KEYS","TER","ZBRA","SMCI","IPGP","TRMB","CIEN","LITE","ANSS","RBLX","HOOD",
  // US Finance
  "JPM","BAC","WFC","C","GS","MS","BLK","BX","KKR","APO","V","MA","AXP","PYPL","COF",
  "SCHW","CME","ICE","SPGI","MCO","BK","STT","USB","PNC","TFC","FITB","RF","HBAN","KEY",
  "ALLY","SYF","DFS","AFRM","MET","PRU","AFL","ALL","AIG","TRV","CB","MMC","AON",
  "MKL","PGR","HIG","CINF","RNR","AXS","BRK-B","WTW","FNF","FAF","IBKR","MSCI","FDS",
  "VRSK","NDAQ","SPXS",
  // US Healthcare
  "JNJ","PFE","UNH","ABBV","LLY","MRK","TMO","ABT","DHR","MDT","BMY","AMGN","GILD",
  "REGN","VRTX","BIIB","ZTS","BDX","SYK","ISRG","EW","BSX","HUM","CI","CVS","MCK","MRNA",
  "DXCM","IDXX","IQV","HOLX","RMD","ALGN","PODD","GEHC","MOH","CNC","ELV","INCY","EXAS",
  "NBIX","SGEN","ALNY","SRPT","BNTX","NVAX","A","RVTY","BAX","PKI","XRAY","TECH","ENPH",
  // US Consumer Discretionary
  "AMZN","HD","TGT","NKE","MCD","SBUX","CMG","YUM","LOW","LULU","F","GM","TJX","ROST",
  "DG","DLTR","EBAY","ETSY","BKNG","MAR","HLT","MGM","LVS","RCL","CCL","DPZ","QSR","DRI",
  "TXRH","BBY","KSS","M","JWN","GPS","ANF","AEO","URBN","PTON","NIO","RIVN","LCID","CVNA",
  "AN","KMX","LAD","ORLY","AZO","GPC","LKQ","APTV","BWA","LEA","MGA","VC","GT","MOD",
  // US Consumer Staples
  "WMT","PG","KO","PEP","COST","PM","MO","BTI","KR","GIS","K","HRL","SJM","CL","KMB",
  "CHD","CLX","EL","ULTA","HSY","MKC","CPB","TSN","CAG","MNST","STZ","TAP","BUD","SAM",
  "BYND","SMPL","FRPT","VITL","SFM","UNFI","GO",
  // US Energy
  "XOM","CVX","COP","EOG","PXD","OXY","SLB","HAL","MPC","VLO","PSX","HES","DVN","FANG",
  "EQT","BKR","NOV","APA","CTRA","MRO","RRC","AR","WMB","KMI","ET","OKE","TRGP","LNG",
  "MMP","EPD","PAA","MPLX","DKL","PARR","PBF",
  // US Industrials
  "GE","HON","CAT","DE","MMM","RTX","LMT","BA","NOC","GD","LHX","TDG","HWM","EMR","ETN",
  "PH","ITW","ROK","FTV","CARR","OTIS","TT","JCI","GNRC","XYL","AME","ROP","GWW","FAST",
  "MSC","GPC","UPS","FDX","CHRW","EXPD","XPO","JBHT","SAIA","DAL","UAL","AAL","LUV",
  "JBLU","ALK","SAVE","WAB","CSGP","MTZ","PWR","STLD","RS","NUE","CMC",
  // US Materials
  "LIN","APD","ECL","SHW","FCX","NEM","VMC","MLM","ALB","CE","DD","PPG","RPM","IFF",
  "EMN","WRK","IP","PKG","BALL","SEE","ATR","CC","HUN","AXTA","FMC","CF","MOS","NTR",
  // US REIT / Utilities
  "NEE","DUK","SO","AEP","EXC","XEL","WEC","ES","CMS","NI","EVRG","PNW","D","PCG",
  "AMT","EQIX","PLD","CCI","DLR","O","PSA","EXR","AVB","EQR","SPG","VICI","GLPI","WY",
  "NNN","BXP","VNO","SLG","ARE","KIM","REG","MAA","UDR","CPT","SBAC","AMH","INVH",
  // US Telecom / Media
  "T","VZ","TMUS","NFLX","DIS","CMCSA","PARA","WBD","CHTR","FOXA","FOX","MTCH","IAC",
  "SNAP","PINS","RDDT","SPOT","ROKU","TTD","MGNI","IAS","DV","ZETA","PUBM",
  // Canadian — TSX majors
  "RY","TD","BNS","BMO","CM","NA","ENB","TRP","PPL","ALA","BCE","RCI","SU","CNQ","CVE",
  "IMO","CNR","CP","WCN","TIH","BAM","BN","MFC","SLF","GWO","POW","ATD","L","DOL","EMP",
  "MRU","GIL","CCL","ABX","AEM","WPM","FNV","AGI","SHOP","CGI","CSU","OTEX","BB","AQN",
  "FTS","IFC","NWC","TRI","NFI","BIPC","QBR","EMA","H","SAP","K","TCL","VET","CTC","WN",
  "MX","MG","CAE","STN","SNC","WSP","TFII","CPKC","ATZ","BYD","GFL","NPI","RNW","SPB",
  "BEI","CHP","CRR","CUF","DIR","HOM","REI","SRU","CRT","HR","CAR","AAR","IIP","AP",
  // ── US ETFs — index, sector, thematic, bond, commodity ──────────────────
  "SPY","IVV","VOO","SPLG","QQQ","QQQM","IWM","IJR","MDY","VTI","ITOT","DIA","VIG",
  "GLD","IAU","SLV","USO","UCO","UNG","PDBC","BCI",
  "TLT","IEF","SHY","GOVT","BND","AGG","BNDX","LQD","HYG","JNK","VCIT","VCSH",
  "EEM","EFA","VEA","IEMG","VWO","ACWI","VT","EWZ","EWJ","FXI","KWEB","EWY","EWG","EWU","EWC","EWA","INDA",
  "ARKK","ARKG","ARKW","ARKF","ARKX","TQQQ","SQQQ","SPXL","UPRO",
  "XLF","XLK","XLE","XLV","XLI","XLB","XLU","XLRE","XLY","XLP","XLC",
  "VNQ","VNQI","SCHD","VYM","DVY","HDV","JEPI","JEPQ","XYLD","QYLD","RYLD",
  "GDX","GDXJ","SIL","COPX","SOXX","SMH","IGV","CIBR","HACK","BOTZ","LIT","REMX",
  "IBIT","GBTC","FBTC","BITB","BITO",
  // ── International ADRs (NYSE/NASDAQ listed) ──────────────────────────────
  "TSM","ASML","NVO","BABA","JD","PDD","BIDU","NTES","TM","HMC","SONY",
  "SNY","AZN","GSK","NVS","RHHBY",
  "RIO","BHP","BP","SHEL","TTE","ENI",
  "MELI","NU","ITUB","BBD","VALE","PBR",
  "SE","GRAB","RACE","ABB","SIEGY","BAYRY",
  // ── More US Tech ─────────────────────────────────────────────────────────
  "ARM","SQ","LYFT","XPEV","LI","RKLB","IONQ","SOUN","AI","UPST",
  "DKNG","WYNN","CROX","DECK","SKX","SHAK","WING","CAVA","BROS","W",
  "AXON","MDB","CFLT","ZI","GTLB","ESTC","APP","CELH","MNDY","DOCN",
  "FOUR","ARRY","CHPT","BLNK","EVGO","RH","HIMS","KVYO","GH",
  "MPWR","TYL","MANH","TDOC","SMAR","APPF","TMDX","RXRX","ACHR","JOBY",
  "ELF","ONON","BIRK","GOOS","CPNG","RVLV","SFIX","STNE","PAGS","TOST",
  // ── More US Finance ──────────────────────────────────────────────────────
  "NLY","AGNC","TWO","CBOE","VIRT","LPLA","AMP","LMND","OPEN",
  "OWL","ARES","HLI","SF","ASB","HOPE","CVBF","WEX","COOP",
  // ── More US Healthcare ───────────────────────────────────────────────────
  "HCA","THC","UHS","JAZZ","IONS","CRSP","NTLA","EDIT","BEAM","ARWR",
  "BLUE","PRGO","ACAD","RARE","KYMR","DNLI","ARVN","ROIV","NVCR","ACLX",
  "STE","ZBH","MMSI","OMCL","RCM","ONEM","SDGR","SEER","TARS",
  // ── More US Industrials / Transport / RE ─────────────────────────────────
  "ODFL","GXO","RXO","KNX","LSTR","TKR","NDSN","ALLE","COLD",
  "STAG","TRNO","EGP","REXR","LXP","EPRT","NTST","IIPR",
  "RIG","VAL","CHK","SM","MTDR","CIVI","OVV","BSM","TELL","TAN","FAN","ICLN",
  // ── Canadian TSX — Energy additions ──────────────────────────────────────
  "PEY","ARX","WCP","BTE","CPG","ERF","MEG","TPZ","FRU","TVE","NVA",
  "PHX","OBE","BIR","GXE","KEL","PXT","SGY","RMP","LGO","SDE","PMT",
  "TDE","PBE","NGL","BNE","TGL","SCR","SII","ARC","ATH","POU",
  // ── Canadian TSX — Mining & Metals additions ──────────────────────────────
  "FM","LUN","HBM","TCK","NXE","DML","CCO","ERO","OR","MAG","FR",
  "TXG","ELD","OGC","EDV","PAAS","FVI","SVM","SEA","SSL","DPM","NGT",
  "CS","HWD","MDI","DGC","GSY","MND","SWY","SRC","GCM","AAB",
  // ── Canadian TSX — Tech & Software additions ──────────────────────────────
  "KXS","DCBO","LSPD","NVEI","TCS","DND","TOI","DSG","ENGH","MDF",
  "REAL","CLS","SECO","TSAT","PMC","PLUS","MTLO","GIB","SCI","PLC",
  // ── Canadian TSX — Consumer & Retail additions ────────────────────────────
  "SVI","PZA","MTY","JWEL","PBH","AC","TRZ","FSZ","GBT","ONEX",
  "CARA","WFG","DOOO","RFP","GUD","BRP","HRX","LNF","ZZZ","MFI",
  // ── Canadian TSX — Finance & Insurance additions ──────────────────────────
  "FFH","X","EFN","CWB","LB","EQB","HCG","ECN","DGS","PRM",
  "FAR","IGM","CIX","GWL","SFC","IAG","MIC",
  // ── Canadian TSX — REIT additions ────────────────────────────────────────
  "PLZ","PMZ","SIA","CSH","NWH","GRT","AX","FCR","BSR",
  "SOT","TNT","NXR","MRG","MEQ","MI","KMP","ACR","SMU",
  // ── Canadian TSX — Utilities & Clean Energy additions ─────────────────────
  "TA","CPX","BEP","BEPC","BIP","INE","ACO","FTG","CU","ATO","HNL",
  // ── Canadian TSX — Industrials & Diversified additions ────────────────────
  "MDA","BDT","FSV","CIGI","RBA","TF","SOX","TCA","WJX","LNR",
  "SJ","IFP","BAD","MDL","TBL","NFD","GDI","STLC","BFC","CJT",
  // ── Canadian TSX — Cannabis ───────────────────────────────────────────────
  "ACB","WEED","OGI","NEPT","VFF","CRON","HEXO","APHA","TLRY",
  // ── US Tech / Software (additions) ───────────────────────────────────────
  "TTWO","EA","U","PSTG","BOX","NTNX","MSTR","GENI","SLAB","LOGI",
  "FFIV","JKHY","QLYS","QTWO","APPN","ASAN","RPD","PCOR","BRZE","DUOL",
  "DOMO","JAMF","EGHT","LPSN","ALRM","SWKS","QRVO","WOLF","OLED","COHU",
  "ACMR","UCTT","FORM","MKSI","AEIS","ONTO","HXL","KTOS","CRUS","DIOD",
  // ── US Crypto / Blockchain ────────────────────────────────────────────────
  "CLSK","RIOT","MARA","HUT","BITF","CORZ","IREN","WULF","CIFR","BTDR",
  // ── US Regional Banks ─────────────────────────────────────────────────────
  "FHN","ZION","BPOP","OFG","FULT","WSFS","BOH","CATY","EWBC","FFIN",
  "IBTX","BANR","TOWN","RNST","SBCF","SPFI","NBTB","TRMK","SFNC","WSBC",
  // ── US Healthcare — Biotech / Devices ────────────────────────────────────
  "BNGO","PACB","NTRA","INSP","SWAV","RVNC","SAGE","PRAX","BHVN","KRTX",
  "IMVT","IOVA","RGEN","NARI","CYRX","PGNY","GDRX","NKTR","TWST","FATE",
  "BEAM","NTLA","EDIT","CRSP","BLUE","ARWR","DNLI","ARVN","ROIV","ACLX",
  // ── US Consumer / Restaurants / Retail ───────────────────────────────────
  "DNUT","CAKE","JACK","EAT","DIN","BLMN","BJRI","FAT","CHUY","YETI",
  "LESL","PRTS","GMS","BURL","FIVE","OLLI","BOOT","CHWY","WOOF","BARK",
  "LNW","RSG","WM","DKNG","PENN","CZR","RRR","ACMR","SG","FRSH",
  // ── US Clean Energy / Solar ───────────────────────────────────────────────
  "CHRD","NOG","VTLE","FLNC","STEM","FSLR","RUN","SEDG","NOVA","MAXN",
  "SPWR","SHLS","BE","PLUG","BLDP","HYZN","EVGO","CHPT","BLNK",
  // ── US Industrials / Construction ────────────────────────────────────────
  "UFPI","CSWI","SITE","DOOR","IBP","MHK","AWI","TREX","AZEK","WMS","SSD",
  // ── US REITs (additional) ─────────────────────────────────────────────────
  "OHI","SBRA","NHI","MPW","DOC","LTC","CTRE","UE","ALEX","BRT",
  "JBGS","PDM","GOOD","NXRT","AIV","CLPR","NLCP","GMRE",
  // ── US Media / Entertainment / Live ──────────────────────────────────────
  "LYV","TKO","MSGS","NYT","SIRI","WMG","EDR","NWSA","NWS",
  // ── International ADRs (additions) ───────────────────────────────────────
  "INFY","WIT","HDB","IBN","VWAGY","BMWYY","MBGAF","HSBC","UBS","DB",
  "BEKE","YUMC","VIPS","CAN","DLO","CSAN","TIMB","BRFS","AZUL","GLOB",
  // ── Space / Autonomous / Lidar ────────────────────────────────────────────
  "SPCE","LUNR","LILM","LAZR","MVIS","RKLB","ACHR","JOBY","EVEX","VTOL",
];
const ALL_TICKERS_SET = new Set(ALL_TICKERS);

// Brand color overrides for the most recognizable companies
const BRAND_COLORS: Record<string, string> = {
  AAPL:"#555555", MSFT:"#00a4ef", NVDA:"#76b900", GOOGL:"#4285f4", GOOG:"#4285f4",
  AMZN:"#ff9900", TSLA:"#cc1100", META:"#0082fb", NFLX:"#e50914", DIS:"#113ccf",
  JPM:"#1b5ca8", V:"#1a1f71",  MA:"#eb001b",   PYPL:"#003087", ADBE:"#ff0000",
  ORCL:"#c74634", IBM:"#054ada", INTC:"#0071c5", AMD:"#ed1c24", WMT:"#0071ce",
  COST:"#005dab", BAC:"#e31837", GS:"#7b8ea0",  CRM:"#00a1e0", SBUX:"#00704a",
  MCD:"#da291c",  NKE:"#f05a28", KO:"#ff0000",  PEP:"#006db0", XOM:"#dc143c",
  CVX:"#0047ab",  SHOP:"#96bf48",
  // Canadian
  RY:"#0066cc", TD:"#34a853", BNS:"#ec1c24", BMO:"#0079c1",
  CM:"#c41230", NA:"#da291c", ENB:"#e07530", BCE:"#00a0df",
  CNR:"#cc3300", SU:"#ffb300", TRI:"#ff6200", MFC:"#00a758",
  CP:"#c8102e",  CNQ:"#4a90d9",
};

// Auto-generate a pleasant, deterministic color from a symbol string
function symbolColor(s: string): string {
  const key = s.replace(/\.(TO|TSX|V)$/i, "");
  if (BRAND_COLORS[key]) return BRAND_COLORS[key];
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  const hue = ((h >>> 0) % 300) + 30;       // avoid near-0 red clash with accent
  return `hsl(${hue}, 55%, 38%)`;
}

// 15 fixed layout slots (positions + motion)
const BUBBLE_SLOTS = [
  { left: "4%",  top: "10%", size: 60, dx: 18,  dy: 14,  dur: 16, delay: 0   },
  { left: "87%", top: "14%", size: 54, dx: -16, dy: 22,  dur: 20, delay: 1   },
  { left: "10%", top: "62%", size: 52, dx: 14,  dy: -20, dur: 18, delay: 2   },
  { left: "74%", top: "58%", size: 58, dx: -22, dy: -14, dur: 22, delay: 0.5 },
  { left: "48%", top: "4%",  size: 48, dx: 10,  dy: 24,  dur: 15, delay: 3   },
  { left: "91%", top: "44%", size: 50, dx: -20, dy: 10,  dur: 19, delay: 1.5 },
  { left: "2%",  top: "38%", size: 46, dx: 22,  dy: -12, dur: 23, delay: 2.5 },
  { left: "58%", top: "78%", size: 52, dx: -12, dy: -22, dur: 16, delay: 4   },
  { left: "28%", top: "83%", size: 48, dx: 16,  dy: -16, dur: 21, delay: 1   },
  { left: "77%", top: "24%", size: 54, dx: -14, dy: 20,  dur: 17, delay: 3.5 },
  { left: "20%", top: "18%", size: 46, dx: 12,  dy: 22,  dur: 24, delay: 0   },
  { left: "43%", top: "73%", size: 50, dx: -10, dy: -24, dur: 19, delay: 2   },
  { left: "66%", top: "87%", size: 44, dx: -16, dy: -12, dur: 25, delay: 4.5 },
  { left: "7%",  top: "86%", size: 46, dx: 20,  dy: -10, dur: 14, delay: 1   },
  { left: "36%", top: "2%",  size: 48, dx: -10, dy: 20,  dur: 21, delay: 3   },
];

type BubbleData = typeof BUBBLE_SLOTS[0] & { symbol: string; color: string };

function getRandomBubbles(): BubbleData[] {
  const shuffled = [...ALL_TICKERS].sort(() => Math.random() - 0.5).slice(0, 15);
  return shuffled.map((sym, i) => ({ symbol: sym, color: symbolColor(sym), ...BUBBLE_SLOTS[i] }));
}

function FloatingBubble({ symbol, color, left, top, size, dx, dy, dur, delay, forming = false, toX = 0, toY = 0, isShockwave = false }: BubbleData & { forming?: boolean; toX?: number; toY?: number, isShockwave?: boolean }) {
  const [imgError, setImgError] = useState(false);
  
  // Calculate shock direction: away from center (50, 50)
  const lNum = parseFloat(left);
  const tNum = parseFloat(top);
  const sX = (lNum - 50) * 1.5; // push toward borders
  const sY = (tNum - 50) * 1.5;

  return (
    <div style={{
      position: "absolute", left, top,
      animation: forming
        ? "flyToCenter 0.65s ease-in forwards"
        : isShockwave 
          ? `bubbleShock 1.8s cubic-bezier(0.19, 1, 0.22, 1) forwards`
          : `bubbleFloat ${dur}s ease-in-out infinite`,
      animationDelay: forming ? "0s" : isShockwave ? "0s" : `${delay}s`,
      ["--dx" as any]: `${dx}px`,
      ["--dy" as any]: `${dy}px`,
      ["--to-x" as any]: `${toX}px`,
      ["--to-y" as any]: `${toY}px`,
      ["--shock-x" as any]: `${sX}vw`,
      ["--shock-y" as any]: `${sY}vh`,
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

// ── Orbit scene ─────────────────────────────────────────────────────────────

function BubbleInner({ symbol, color, size }: { symbol: string; color: string; size: number }) {
  const [imgError, setImgError] = useState(false);
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      backgroundColor: "#ffffff",
      border: `1.5px solid ${color}40`,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 0 16px ${color}18, 0 2px 8px rgba(0,0,0,0.1)`,
      overflow: "hidden", position: "relative",
    }}>
      {!imgError ? (
        <img
          src={`https://assets.parqet.com/logos/symbol/${symbol}`}
          alt={symbol}
          width={size * 0.62} height={size * 0.62}
          onError={() => setImgError(true)}
          style={{ objectFit: "contain" }}
        />
      ) : (
        <span style={{ fontSize: Math.max(7, size * 0.2), fontWeight: 800, color, fontFamily: "monospace", letterSpacing: "-0.02em", textAlign: "center", padding: "0 2px", lineHeight: 1 }}>
          {symbol.replace(/\.TO$/i, "").slice(0, 4)}
        </span>
      )}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: `radial-gradient(circle at 35% 28%, ${color}14, transparent 65%)`,
        pointerEvents: "none",
      }} />
    </div>
  );
}

function OrbitScene({ ticker, bubbles }: { ticker: string; bubbles: BubbleData[] }) {
  const innerBubbles = bubbles.slice(0, 7);
  const outerBubbles = bubbles.slice(7);
  const innerR = 118;
  const outerR = 186;

  return (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "relative", width: 420, height: 420, flexShrink: 0 }}>
        {/* Dashed orbit rings */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          width: innerR * 2, height: innerR * 2, borderRadius: "50%",
          border: "1px dashed rgba(204,17,0,0.13)",
          transform: "translate(-50%, -50%)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          width: outerR * 2, height: outerR * 2, borderRadius: "50%",
          border: "1px dashed rgba(204,17,0,0.06)",
          transform: "translate(-50%, -50%)", pointerEvents: "none",
        }} />

        {/* Inner ring */}
        {innerBubbles.map((b, i) => {
          const sz = Math.round(b.size * 0.75);
          const dur = 11 + i * 0.35;
          const delay = -((i / innerBubbles.length) * dur);
          return (
            <div key={b.symbol} style={{
              position: "absolute", left: "50%", top: "50%",
              width: 0, height: 0,
              animation: `orbitCW ${dur}s linear infinite`,
              animationDelay: `${delay}s`,
            }}>
              <div style={{
                position: "absolute",
                left: innerR - sz / 2,
                top: -(sz / 2),
                animation: `orbitCCW ${dur}s linear infinite`,
                animationDelay: `${delay}s`,
              }}>
                <BubbleInner symbol={b.symbol} color={b.color} size={sz} />
              </div>
            </div>
          );
        })}

        {/* Outer ring */}
        {outerBubbles.map((b, i) => {
          const sz = Math.round(b.size * 0.8);
          const dur = 19 + i * 0.5;
          const delay = -((i / outerBubbles.length) * dur);
          return (
            <div key={b.symbol} style={{
              position: "absolute", left: "50%", top: "50%",
              width: 0, height: 0,
              animation: `orbitCW ${dur}s linear infinite`,
              animationDelay: `${delay}s`,
            }}>
              <div style={{
                position: "absolute",
                left: outerR - sz / 2,
                top: -(sz / 2),
                animation: `orbitCCW ${dur}s linear infinite`,
                animationDelay: `${delay}s`,
              }}>
                <BubbleInner symbol={b.symbol} color={b.color} size={sz} />
              </div>
            </div>
          );
        })}

        {/* Center: wizard */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -64%)", zIndex: 10,
        }}>
          <PixelWizard />
        </div>

        {/* Center: searched ticker bubble pops in — only when a real ticker is known */}
        {ticker && (
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, 10%)", zIndex: 11,
          }}>
            <div style={{ opacity: 0, animation: "fadeScaleIn 0.45s ease forwards 0.7s" }}>
              <BubbleInner symbol={ticker} color="#cc1100" size={54} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

// ── Language system ───────────────────────────────────────────────────────────
type Lang = "en" | "fr";

const TRANSLATIONS = {
  en: {
    wizardPhrases: [
      "Fred — real-time market intelligence.",
      "Your market assistant is ready.",
      "Ask me anything about stocks, ETFs, or markets.",
      "Live data. Analyst insights. On demand.",
      "Fred — your self-directed investing companion.",
      "Market intelligence, at your fingertips.",
      "From price history to analyst consensus.",
      "Stocks, ETFs, earnings — ask me anything.",
      "Your financial information hub, powered by AI.",
      "Real-time data, synthesized for you.",
    ],
    homeTips: [
      "Hi! I'm Fred — your AI market intelligence tool. Ask me anything about stocks, ETFs, or markets!",
      "Type a company name or ask in plain English — I understand natural language",
      "I cover both US and Canadian markets — equities, ETFs, and more",
      "Ask for a chart and I'll generate one automatically with live data",
      "Compare two stocks side-by-side — just ask me to compare them",
      "I can fetch insider transactions, dividend history & analyst upgrades",
      "Ask about the market environment — I'll pull macro context for you",
      "Earnings history, price targets, short interest — just ask",
      "Click any past analysis button in chat to switch the left panel view",
    ],
    demoSteps: [
      "Hi! I'm Fred, your Market Wizard. I pull live stock data and synthesize it with AI. Let me show you around!",
      "This is the search bar. Type a company name, ask a question in plain English, or enter a ticker symbol — I understand it all.",
      "These suggestion cards give you a running start. Click one and I'll fetch live market data instantly.",
      "After I respond, a two-panel view opens. The left side shows deep analysis — expandable sections, live charts, insider data.",
      "The Premium menu unlocks the Portfolio Simulator — build a hypothetical portfolio and I'll track it with live prices.",
      "That's the tour! I cover US and Canadian markets — equities, ETFs, earnings, and more. Go ahead, ask me anything!",
    ],
    loadingPhrases: [
      "Gathering market intelligence...",
      "Consulting the financial scrolls...",
      "Alcheming the data points...",
      "Analyzing ticker symbols...",
      "Synthesizing analyst consensus...",
      "Brewing a fresh response...",
      "Polling the Big Six banks...",
      "Extracting historical trends...",
      "Mapping the volatility...",
      "Polishing the crystal ball...",
      "Crunching the quarterly numbers...",
      "Scanning recent headlines...",
      "Decoding the market sentiment...",
      "Filtering out the noise...",
      "Normalizing valuation metrics...",
      "Preparing the visual charts...",
      "Fact-checking the fundamentals...",
      "Optimizing the insight engine...",
      "Aligning the stars (and stocks)...",
      "Finalizing the synthesis...",
      "Reviewing the educational guardrails...",
    ],
    suggestions: [
      { text: "Show me a stock's 6-month price chart", sub: "Price history · Any stock or ETF", icon: "linechart" },
      { text: "Compare P/E ratios across a sector", sub: "Peer comparison · Valuations", icon: "barchart" },
      { text: "Explain earnings per share surprises", sub: "EPS actual vs estimate", icon: "search" },
      { text: "What do analyst ratings mean?", sub: "Buy · Hold · Sell · Consensus", icon: "analyst" },
      { text: "What's the dividend yield on a stock?", sub: "Income · Dividend investing", icon: "barchart" },
      { text: "How does a stock sit vs its 52-week range?", sub: "Momentum · High / Low context", icon: "linechart" },
      { text: "Show me analyst price targets for a stock", sub: "Consensus target · Upside estimate", icon: "analyst" },
      { text: "What's the latest news on a stock?", sub: "Headlines · Recent events", icon: "search" },
      { text: "Explain what forward P/E means", sub: "Valuation · Growth expectations", icon: "barchart" },
      { text: "What does market cap tell us?", sub: "Size · Risk · Sector context", icon: "analyst" },
      { text: "How do ETFs compare to individual stocks?", sub: "Diversification · Passive investing", icon: "search" },
      { text: "Show me a company's earnings history", sub: "Quarterly EPS trends · Growth", icon: "linechart" },
      { text: "What is a stock's current price?", sub: "Live quote · Any ticker", icon: "linechart" },
      { text: "Is a stock overbought or oversold?", sub: "RSI · Technical sentiment", icon: "barchart" },
      { text: "Compare two stocks on key metrics", sub: "Side-by-side · Any sector", icon: "barchart" },
      { text: "What sectors are outperforming this year?", sub: "Sector rotation · Market trends", icon: "search" },
      { text: "Explain short interest and what it signals", sub: "Short squeeze · Bearish bets", icon: "analyst" },
      { text: "How do I read an ETF's top holdings?", sub: "ETF breakdown · Concentration risk", icon: "linechart" },
      { text: "What is a stock's beta and why does it matter?", sub: "Volatility · Risk vs market", icon: "analyst" },
      { text: "How do I read a company's balance sheet?", sub: "Assets · Liabilities · Equity", icon: "search" },
      { text: "What's the difference between growth and value stocks?", sub: "Investing styles · Valuation", icon: "barchart" },
      { text: "Show me free cash flow for a company", sub: "FCF · Financial health", icon: "linechart" },
      { text: "What does the yield curve tell us?", sub: "Macro · Recession signals", icon: "barchart" },
      { text: "Explain options — calls and puts basics", sub: "Derivatives · Hedging · Speculation", icon: "analyst" },
      { text: "Which TSX stocks pay the highest dividends?", sub: "Canadian market · Income plays", icon: "barchart" },
      { text: "What is dollar-cost averaging?", sub: "Investing strategy · Risk reduction", icon: "search" },
    ],
    ui: {
      placeholder: "Ask about a stock, ETF, or market concept...",
      homeBtn: "← Home",
      demoBtn: "Request Demo",
      educationalOnly: "EDUCATIONAL USE ONLY",
      poweredBy: "Powered By Barrows Consulting",
      conversationLabel: "CONVERSATION",
      messageCount: (n: number) => `${n} ${n === 1 ? "message" : "messages"}`,
      sendBtn: "Send",
      greeting: `Hi! I'm **Fred**, your AI-powered market intelligence tool. I provide real-time stock data, earnings analysis, analyst views, and market insights — for **educational purposes only**. I don't give financial advice or tell you what to buy or sell. Ask me anything about stocks, ETFs, or market trends!`,
      loginSubtitle: "Sign in to access your market intelligence",
      loginUsername: "Username",
      loginPassword: "Password",
      loginSignIn: "Sign In",
      loginAuthenticated: "✓ Authenticated",
      loginWelcome: "Welcome back! Loading your workspace...",
      loginError: "Invalid username or password.",
      loginFooter: "Powered by Barrows Consulting · Educational Use Only",
      skipBtn: "Skip",
      nextBtn: "Next →",
      letsGoBtn: "Let's go!",
      viewAnalysis: "View full analysis →",
      viewingAnalysis: "Viewing in left panel",
      comparePeers: "Compare peers",
      dividends: "Dividends",
      emptyState: "Ask a question to see the\nanalysis here",
      subtitle: "stocks, ETFs, earnings, analyst views, and market trends.",
    },
  },
  fr: {
    wizardPhrases: [
      "Fred — intelligence de marché en temps réel.",
      "Votre assistant de marché est prêt.",
      "Posez-moi n'importe quelle question sur les marchés.",
      "Données en direct. Analyses d'experts. À la demande.",
      "Fred — votre compagnon d'investissement autonome.",
      "L'intelligence de marché, au bout des doigts.",
      "De l'historique des prix au consensus des analystes.",
      "Actions, FNB, résultats — posez-moi vos questions.",
      "Votre hub d'information financière, propulsé par l'IA.",
      "Des données en temps réel, synthétisées pour vous.",
    ],
    homeTips: [
      "Bonjour! Je suis Fred — votre outil d'intelligence de marché. Posez-moi n'importe quelle question!",
      "Tapez le nom d'une entreprise ou posez une question en français — je comprends le langage naturel",
      "Je couvre les marchés américains et canadiens — actions, FNB et plus encore",
      "Demandez un graphique et j'en génère un automatiquement avec des données en direct",
      "Comparez deux titres côte à côte — demandez-moi simplement de les comparer",
      "Je peux récupérer les transactions d'initiés, l'historique des dividendes et les révisions d'analystes",
      "Demandez-moi le contexte macroéconomique — je vous fournirai une vue d'ensemble des marchés",
      "Historique des bénéfices, cibles de prix, intérêt vendeur — il suffit de demander",
      "Cliquez sur un bouton d'analyse passée dans le chat pour changer le panneau gauche",
    ],
    demoSteps: [
      "Bonjour! Je suis Fred, votre Sorcier des marchés. Je récupère des données boursières en direct et les synthétise avec l'IA. Laissez-moi vous faire visiter!",
      "Voici la barre de recherche. Tapez un nom d'entreprise, posez une question en français, ou entrez un symbole boursier — je comprends tout.",
      "Ces suggestions vous donnent un bon départ. Cliquez sur une et je récupère des données de marché en direct instantanément.",
      "Après ma réponse, une vue à deux panneaux s'ouvre. Le côté gauche affiche l'analyse approfondie — sections extensibles, graphiques en direct, données d'initiés.",
      "Le menu Premium déverrouille le Simulateur de portefeuille — construisez un portefeuille hypothétique et je le suivrai avec des prix en direct.",
      "C'est la visite! Je couvre les marchés américains et canadiens — actions, FNB, résultats et plus. Allez-y, posez-moi n'importe quoi!",
    ],
    loadingPhrases: [
      "Analyse en cours...",
      "Récupération des données en direct...",
      "Consultation des analystes...",
      "Synthèse des informations...",
      "Vérification du contexte de marché...",
      "Calcul des métriques...",
      "Traitement des données fondamentales...",
      "Revue de l'actualité récente...",
      "Presque prêt...",
      "Mise en forme de l'analyse...",
    ],
    suggestions: [
      { text: "Analyser une action", sub: "Cours, fondamentaux, analystes", icon: "linechart" },
      { text: "Comparer deux titres", sub: "Analyse côte à côte", icon: "barchart" },
      { text: "Contexte de marché", sub: "S&P 500, VIX, taux", icon: "search" },
      { text: "Résultats trimestriels", sub: "Réel vs estimé, tendances", icon: "linechart" },
      { text: "Consensus des analystes", sub: "Notes Achat/Conserver/Vendre", icon: "analyst" },
      { text: "Historique du cours", sub: "Graphique sur 1 an", icon: "linechart" },
      { text: "Données fondamentales", sub: "Marges, ROE, endettement", icon: "barchart" },
      { text: "Dividendes", sub: "Historique et rendement", icon: "barchart" },
      { text: "Transactions d'initiés", sub: "Achats et ventes récents", icon: "analyst" },
      { text: "Bilan financier", sub: "Revenus, flux de trésorerie", icon: "search" },
      { text: "Révisions d'analystes", sub: "Hausses et baisses récentes", icon: "analyst" },
      { text: "Comparaison sectorielle", sub: "Vs les pairs du secteur", icon: "barchart" },
      { text: "Cours actuel", sub: "Cotation en direct", icon: "linechart" },
      { text: "Cible de prix des analystes", sub: "Potentiel de hausse estimé", icon: "analyst" },
      { text: "Historique des bénéfices", sub: "BPA trimestriel, tendances", icon: "linechart" },
      { text: "Santé financière", sub: "Flux de trésorerie disponible", icon: "search" },
    ],
    ui: {
      placeholder: "Posez une question sur un titre, FNB ou tendance de marché...",
      homeBtn: "← Accueil",
      demoBtn: "Voir la démo",
      educationalOnly: "À TITRE ÉDUCATIF SEULEMENT",
      poweredBy: "Propulsé par Barrows Consulting",
      conversationLabel: "CONVERSATION",
      messageCount: (n: number) => `${n} message${n === 1 ? "" : "s"}`,
      sendBtn: "Envoyer",
      greeting: `Bonjour! Je suis **Fred**, votre outil d'intelligence de marché propulsé par l'IA. Je fournis des données boursières en temps réel, des analyses de résultats, des avis d'analystes et des informations de marché — à **titre éducatif uniquement**. Je ne donne pas de conseils financiers. Posez-moi vos questions sur les actions, FNB ou les tendances de marché!`,
      loginSubtitle: "Connectez-vous pour accéder à votre intelligence de marché",
      loginUsername: "Nom d'utilisateur",
      loginPassword: "Mot de passe",
      loginSignIn: "Se connecter",
      loginAuthenticated: "✓ Authentifié",
      loginWelcome: "Bon retour! Chargement de votre espace...",
      loginError: "Nom d'utilisateur ou mot de passe invalide.",
      loginFooter: "Propulsé par Barrows Consulting · À titre éducatif seulement",
      skipBtn: "Passer",
      nextBtn: "Suivant →",
      letsGoBtn: "C'est parti!",
      viewAnalysis: "Voir l'analyse →",
      viewingAnalysis: "Affiché dans le panneau gauche",
      comparePeers: "Comparer les pairs",
      dividends: "Dividendes",
      emptyState: "Posez une question pour voir\nl'analyse ici",
      subtitle: "actions, FNB, résultats, analyses et tendances de marché.",
    },
  },
} as const;

const ALL_SUGGESTIONS = TRANSLATIONS.en.suggestions;

function getRandomSuggestions(lang: Lang = "en") {
  return [...TRANSLATIONS[lang].suggestions].sort(() => Math.random() - 0.5).slice(0, 4);
}

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
            ? <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><polyline points="1,16 6,11 11,14 19,4" stroke={cfg.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14,4 19,4 19,9" stroke={cfg.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : data.consensus === "strongSell" || data.consensus === "sell"
            ? <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><polyline points="1,4 6,9 11,6 19,16" stroke={cfg.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="14,16 19,16 19,11" stroke={cfg.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><line x1="3" y1="10" x2="17" y2="10" stroke={cfg.color} strokeWidth="2.2" strokeLinecap="round"/></svg>
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
                ? <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><polyline points="6,10 6,2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="2,6 6,2 10,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                : data.buyChangeVsLastMonth < 0
                ? <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><polyline points="6,2 6,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="2,6 6,10 10,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
  // All animations use CSS transforms (not SVG attribute animation) for crisp rendering
  if (name === "linechart") return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" style={{ display: "block", overflow: "visible" }}>
      <polyline points="3,30 11,21 18,25 26,13 35,8"
        stroke="#cc1100" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.2"
      />
      <polyline points="3,30 11,21 18,25 26,13 35,8"
        stroke="#cc1100" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 95, strokeDashoffset: 95, animation: "drawStroke 1.1s ease forwards 0.1s" }}
      />
      <polyline points="29,8 35,8 35,14"
        stroke="#cc1100" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 20, strokeDashoffset: 20, animation: "drawStroke 0.35s ease forwards 1.1s" }}
      />
      <circle cx="35" cy="8" r="3" fill="#cc1100"
        style={{ opacity: 0, animation: "popIn 0.25s ease forwards 1.4s" }}
      />
    </svg>
  );
  if (name === "barchart") return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" style={{ display: "block" }}>
      {/* Bars use scaleY transform from bottom — CSS CAN animate transforms */}
      <rect x="4"  y="16" width="8" height="18" rx="1.5" fill="#cc1100" fillOpacity="0.45"
        style={{ transform: "scaleY(0)", transformOrigin: "8px 34px", animation: "scaleBarUp 0.45s ease forwards 0.1s" }}
      />
      <rect x="16" y="10" width="8" height="24" rx="1.5" fill="#cc1100" fillOpacity="0.7"
        style={{ transform: "scaleY(0)", transformOrigin: "20px 34px", animation: "scaleBarUp 0.45s ease forwards 0.28s" }}
      />
      <rect x="28" y="5"  width="8" height="29" rx="1.5" fill="#cc1100"
        style={{ transform: "scaleY(0)", transformOrigin: "32px 34px", animation: "scaleBarUp 0.45s ease forwards 0.46s" }}
      />
    </svg>
  );
  if (name === "search") return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" style={{ display: "block" }}>
      <circle cx="16" cy="16" r="11" stroke="#cc1100" strokeWidth="2.5" strokeOpacity="0.18" />
      <circle cx="16" cy="16" r="11" stroke="#cc1100" strokeWidth="2.5" strokeLinecap="round"
        style={{ strokeDasharray: 69, strokeDashoffset: 69, animation: "drawStroke 0.85s ease forwards 0.1s" }}
      />
      <line x1="24" y1="24" x2="34" y2="34" stroke="#cc1100" strokeWidth="2.5" strokeLinecap="round"
        style={{ strokeDasharray: 15, strokeDashoffset: 15, animation: "drawStroke 0.35s ease forwards 0.9s" }}
      />
    </svg>
  );
  // analyst
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" style={{ display: "block" }}>
      <circle cx="19" cy="12" r="6.5" stroke="#cc1100" strokeWidth="2.5" strokeLinecap="round"
        style={{ strokeDasharray: 41, strokeDashoffset: 41, animation: "drawStroke 0.65s ease forwards 0.1s" }}
      />
      <path d="M5 34 C5 26 11 21 19 21 C27 21 33 26 33 34"
        stroke="#cc1100" strokeWidth="2.5" strokeLinecap="round"
        style={{ strokeDasharray: 58, strokeDashoffset: 58, animation: "drawStroke 0.75s ease forwards 0.75s" }}
      />
      <line x1="25" y1="22" x2="33" y2="14" stroke="#cc1100" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5"
        style={{ strokeDasharray: 12, strokeDashoffset: 12, animation: "drawStroke 0.28s ease forwards 1.45s" }}
      />
      <polyline points="28,17 33,14 30,9" stroke="#cc1100" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ strokeDasharray: 15, strokeDashoffset: 15, animation: "drawStroke 0.35s ease forwards 1.65s" }}
      />
    </svg>
  );
}

// ── Home screen Fred tips (now sourced from TRANSLATIONS at runtime) ─────────
const HOME_TIPS = TRANSLATIONS.en.homeTips; // fallback reference (unused at runtime)

// ── Interactive demo steps ────────────────────────────────────────────────────
interface DemoStep {
  text: string;
  fredLeft: string; fredTop: string;
  flip?: boolean;    // mirror Fred horizontally (looking left)
  tilt?: number;     // rotate degrees
  highlightId?: string;
}

// Demo step layout (positions/layout only) — text is sourced from TRANSLATIONS at runtime
const DEMO_STEP_LAYOUTS: Omit<DemoStep, "text">[] = [
  { fredLeft: "50%", fredTop: "38%" },
  { fredLeft: "50%", fredTop: "74%", tilt: 12, highlightId: "fred-demo-input" },
  { fredLeft: "28%", fredTop: "56%", flip: true, highlightId: "fred-demo-cards" },
  { fredLeft: "50%", fredTop: "38%" },
  { fredLeft: "78%", fredTop: "12%", flip: true, highlightId: "fred-demo-premium" },
  { fredLeft: "50%", fredTop: "38%" },
];

function buildDemoSteps(lang: Lang): DemoStep[] {
  return DEMO_STEP_LAYOUTS.map((layout, i) => ({
    ...layout,
    text: TRANSLATIONS[lang].demoSteps[i] ?? TRANSLATIONS.en.demoSteps[i],
  }));
}

// Keep DEMO_STEPS as a const for backward compat (unused at runtime — replaced by buildDemoSteps)
const DEMO_STEPS = buildDemoSteps("en");

// WIZARD_PHRASES — now sourced from TRANSLATIONS at runtime via lang state
const WIZARD_PHRASES = TRANSLATIONS.en.wizardPhrases;

const WIZARD_VARIANTS = [
  // 0 — Teleport: portal rings + sparkles, scale bounce
  {
    animName: "wizardTeleportIn",
    animDuration: "0.72s",
    animEasing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    ringColor: "#cc1100",
    glowColor: "rgba(204,17,0,0.35)",
    sparkColors: ["#cc1100","#ff6600","#ffaa00","#cc1100","#ff4400","#ffcc00","#cc1100","#ff6600"],
    sparkChar: "✦",
  },
  // 1 — Lightning drop: drops from above with electric flash
  {
    animName: "wizardDropIn",
    animDuration: "0.68s",
    animEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
    ringColor: "#ffaa00",
    glowColor: "rgba(255,180,0,0.3)",
    sparkColors: ["#ffcc00","#ff8800","#ffee00","#ff6600","#ffbb00","#ffdd00","#ff9900","#ffcc00"],
    sparkChar: "⚡",
  },
  // 2 — Vortex spin: rotates in with purple/gold
  {
    animName: "wizardSpinIn",
    animDuration: "0.8s",
    animEasing: "cubic-bezier(0.34, 1.4, 0.64, 1)",
    ringColor: "#8844cc",
    glowColor: "rgba(136,68,204,0.3)",
    sparkColors: ["#aa55ff","#cc88ff","#ff66cc","#8844cc","#ff55aa","#bb44ff","#aa66ff","#dd88ff"],
    sparkChar: "✦",
  },
  // 3 — Celestial Rise: ascends with silver/blue starlight
  {
    animName: "wizardCelestialRise",
    animDuration: "1.2s",
    animEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
    ringColor: "#00a0df",
    glowColor: "rgba(0,160,223,0.25)",
    sparkColors: ["#00a0df","#ffffff","#88ccee","#00a0df","#ffffff","#88ccee","#00a0df","#ffffff"],
    sparkChar: "✨",
  },
  // 4 — Meteor Impact: fire streak slams in, then explosion
  {
    animName: "wizardImpactIn",
    animDuration: "0.5s",
    animEasing: "ease-out",
    ringColor: "#ff4400",
    glowColor: "rgba(255,68,0,0.4)",
    sparkColors: ["#ff4400","#ff8800","#ffff00","#ff4400","#ff8800","#ffff00","#ff4400","#ff8800"],
    sparkChar: "🔥",
  },
];

function WizardMeteorEntrance({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* The Meteor Streak */}
      <div style={{
        position: "absolute",
        top: "42%", left: "50%",
        width: 4, height: 160,
        background: "linear-gradient(to top, #ffaa00, #ff4400, transparent)",
        filter: "blur(1px) drop-shadow(0 0 10px #ff4400)",
        borderRadius: "50% 50% 0 0",
        transformOrigin: "bottom center",
        animation: "meteorStreak 0.4s ease-in forwards",
        zIndex: 10,
        opacity: 0,
      }} />
      
      {/* Impact Shockwave */}
      <div style={{
        position: "absolute",
        left: "50%", top: "42%",
        width: 10, height: 10,
        marginLeft: -5, marginTop: -5,
        borderRadius: "50%",
        border: "2px solid #ffaa00",
        animation: "meteorShockwave 0.5s ease-out forwards 0.35s",
        opacity: 0, pointerEvents: "none",
        zIndex: 5,
      }} />

      {/* Impact Flash */}
      <div style={{
        position: "absolute",
        left: "50%", top: "42%",
        width: 140, height: 140,
        marginLeft: -70, marginTop: -70,
        borderRadius: "50%",
        background: "radial-gradient(circle, #fff 10%, #ffaa00 40%, transparent 70%)",
        animation: "meteorFlash 0.45s ease-out forwards 0.35s",
        opacity: 0, pointerEvents: "none",
        zIndex: 15,
      }} />

      <div style={{ animation: "wizardImpactIn 0.6s cubic-bezier(0.17, 0.67, 0.83, 0.67) forwards 0.38s", opacity: 0 }}>
        {children}
      </div>
    </div>
  );
}

function WizardBounceEntrance({ children }: { children: React.ReactNode }) {
  // Dust puff positions match the 3 "bubble landings" in wizardBounceIn keyframes
  const landings = [
    { x: 110,  y: 75,  delay: 0.50 },
    { x: -75,  y: -80, delay: 1.02 },
    { x: 0,    y: 12,  delay: 1.54 },
  ];
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {landings.map((l, i) => (
        <React.Fragment key={i}>
          <div style={{
            position: "absolute",
            left: `calc(50% + ${l.x}px)`, top: `calc(50% + ${l.y}px)`,
            width: 28, height: 28, borderRadius: "50%",
            border: "2px solid rgba(204,17,0,0.55)",
            transform: "translate(-50%, -50%)",
            animation: `dustPuff 0.4s ease-out forwards ${l.delay}s`,
            opacity: 0, pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute",
            left: `calc(50% + ${l.x}px)`, top: `calc(50% + ${l.y}px)`,
            width: 14, height: 14, borderRadius: "50%",
            border: "1.5px solid rgba(204,17,0,0.3)",
            transform: "translate(-50%, -50%)",
            animation: `dustPuff 0.5s ease-out forwards ${l.delay + 0.05}s`,
            opacity: 0, pointerEvents: "none",
          }} />
        </React.Fragment>
      ))}
      <div style={{ animation: "wizardBounceIn 1.85s cubic-bezier(0.4,0,0.2,1) forwards" }}>
        {children}
      </div>
    </div>
  );
}

function WizardScannerEntrance({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: "relative", display: "inline-block", padding: "0 10px" }}>
      {/* Horizontal Laser Sweep Line */}
      <div style={{
        position: "absolute",
        left: "-20%",
        width: "140%",
        height: 1,
        backgroundColor: "#cc1100",
        boxShadow: "0 0 10px #cc1100, 0 0 4px #ffaa00",
        zIndex: 5,
        animation: "scannerSweep 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        opacity: 0,
      }} />
      {/* Wizard Reveal following the laser line */}
      <div style={{
        animation: "wizardReveal 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        opacity: 0,
        zIndex: 1,
      }}>
        {children}
      </div>
    </div>
  );
}

function WizardShockwaveEntrance({ children, onCast }: { children: React.ReactNode, onCast: () => void }) {
  const [phase, setPhase] = useState<"arrival" | "charging" | "casting" | "done">("arrival");
  const onCastRef = useRef(onCast);
  onCastRef.current = onCast;

  useEffect(() => {
    // Arrival: 0-0.8s → Charging: 0.8s-2.4s → Cast: 2.4s
    const chargeTimer = setTimeout(() => setPhase("charging"), 800);
    const castTimer = setTimeout(() => {
      setPhase("casting");
      onCastRef.current();
      setTimeout(() => setPhase("done"), 1000);
    }, 2400);
    return () => { clearTimeout(chargeTimer); clearTimeout(castTimer); };
  }, []); // run once — onCast accessed via ref to avoid restart loop

  return (
    <div style={{
      position: "relative",
      display: "inline-block",
      animation: phase === "casting" ? "wizardCastAction 1s cubic-bezier(0.22, 1, 0.36, 1) forwards" : "none"
    }}>
      <div style={{ animation: "wizardTeleportIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards", opacity: 0 }}>
        {children}

        {/* Charging Glow — wand tip is at left ~11%, top ~38% of the wizard */}
        {phase === "charging" && (
          <div style={{
            position: "absolute", left: "-8px", top: "34%",
            width: 28, height: 28,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(253,224,71,0.9) 0%, rgba(204,17,0,0.6) 50%, transparent 80%)",
            animation: "wandCharge 0.35s ease-in-out infinite",
            pointerEvents: "none", zIndex: 5,
            transform: "translate(-50%, -50%)",
          }} />
        )}

        {/* Cast burst — expands from the wand then fades */}
        {phase === "casting" && (
          <div style={{
            position: "absolute", left: "-8px", top: "34%",
            width: 80, height: 80,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            background: "radial-gradient(circle, #fff 0%, #cc1100 35%, transparent 70%)",
            animation: "castBurst 0.5s ease-out forwards",
            zIndex: 10,
            pointerEvents: "none",
          }} />
        )}
      </div>
    </div>
  );
}

function WizardEntrance({ children, onShockwave }: { children: React.ReactNode, onShockwave?: () => void }) {
  // 0-3: magic portal variants, 4: meteor impact, 5: bubble-bounce, 6: scanner, 7: shockwave
  const [varIdx] = useState(() => Math.floor(Math.random() * 8));
  const [v] = useState(() => WIZARD_VARIANTS[Math.min(varIdx, WIZARD_VARIANTS.length - 1)]);
  
  // Trigger onShockwave for non-shockwave variants after a delay if desired,
  // but let's keep it specific to variant 7 for the "special" arrival.
  useEffect(() => {
    if (varIdx < 7 && onShockwave) {
      // Small chance to shock even on normal entrance, or just skip.
      // Let's just trigger it on a timer for variant 7.
    }
  }, [varIdx, onShockwave]);

  if (varIdx === 7 && onShockwave) return <WizardShockwaveEntrance onCast={onShockwave}>{children}</WizardShockwaveEntrance>;
  if (varIdx === 6) return <WizardScannerEntrance>{children}</WizardScannerEntrance>;
  if (varIdx === 5) return <WizardBounceEntrance>{children}</WizardBounceEntrance>;
  if (varIdx === 4) return <WizardMeteorEntrance>{children}</WizardMeteorEntrance>;
  
  const sparkles = [
    { x: -40, y: -52 }, { x: 0, y: -64 }, { x: 40, y: -52 },
    { x: 54, y: -12 }, { x: -54, y: -12 },
    { x: -30, y: 14 },  { x: 30, y: 14 },
    { x: 10, y: -68 },
  ];
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Portal rings */}
      {[{ size: 96, delay: 0 }, { size: 64, delay: 0.1 }, { size: 42, delay: 0.18 }].map((r, i) => (
        <div key={i} style={{
          position: "absolute",
          left: "50%", top: "42%",
          width: r.size, height: r.size,
          borderRadius: "50%",
          border: `${i === 0 ? 2.5 : 1.5}px solid ${i === 0 ? v.ringColor : v.ringColor + "77"}`,
          marginLeft: -r.size / 2, marginTop: -r.size / 2,
          animation: `portalRing 0.75s cubic-bezier(0.2,0.8,0.4,1) forwards ${r.delay}s`,
          opacity: 0, pointerEvents: "none", zIndex: 0,
        }} />
      ))}
      {/* Glow burst */}
      <div style={{
        position: "absolute", left: "50%", top: "42%",
        width: 80, height: 80, borderRadius: "50%",
        background: `radial-gradient(circle, ${v.glowColor} 0%, transparent 70%)`,
        marginLeft: -40, marginTop: -40,
        animation: "glowBurst 0.5s ease-out forwards",
        opacity: 0, pointerEvents: "none",
      }} />
      {/* Sparkle particles */}
      {sparkles.map((s, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `calc(50% + ${s.x}px)`,
          top: `calc(42% + ${s.y}px)`,
          fontSize: i % 2 === 0 ? 11 : 8,
          color: v.sparkColors[i],
          animation: `sparkleFade 0.65s ease forwards ${0.04 + i * 0.055}s`,
          opacity: 0, pointerEvents: "none", zIndex: 20, lineHeight: 1,
          transform: "translate(-50%, -50%)",
        }}>{v.sparkChar}</div>
      ))}
      {/* Fred himself */}
      <div style={{ animation: `${v.animName} ${v.animDuration} ${v.animEasing} forwards`, opacity: 0 }}>
        {children}
      </div>
    </div>
  );
}

function PixelWizard({ width = 72, height = 104 }: { width?: number | string, height?: number | string }) {
  return (
    <div style={{ animation: "wizardFloat 3s ease-in-out infinite", display: "inline-block" }}>
      <svg
        width={width}
        height={height}
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

// Company name → ticker lookup (case-insensitive)
const COMPANY_TO_TICKER: [string, string][] = [
  // US mega-cap
  ["apple", "AAPL"], ["microsoft", "MSFT"], ["google", "GOOGL"], ["alphabet", "GOOGL"],
  ["amazon", "AMZN"], ["tesla", "TSLA"], ["nvidia", "NVDA"], ["meta", "META"],
  ["netflix", "NFLX"], ["disney", "DIS"], ["berkshire", "BRK-B"], ["jpmorgan", "JPM"],
  ["jp morgan", "JPM"], ["visa", "V"], ["mastercard", "MA"], ["paypal", "PYPL"],
  ["salesforce", "CRM"], ["adobe", "ADBE"], ["intel", "INTC"], ["amd", "AMD"],
  ["qualcomm", "QCOM"], ["broadcom", "AVGO"], ["oracle", "ORCL"], ["ibm", "IBM"],
  ["exxon", "XOM"], ["chevron", "CVX"], ["pfizer", "PFE"], ["johnson", "JNJ"],
  ["unitedhealth", "UNH"], ["walmart", "WMT"], ["costco", "COST"],
  // Canadian
  ["royal bank", "RY.TO"], ["rbc", "RY.TO"],
  ["td bank", "TD.TO"], ["toronto dominion", "TD.TO"],
  ["bmo", "BMO.TO"], ["bank of montreal", "BMO.TO"],
  ["scotiabank", "BNS.TO"], ["bns", "BNS.TO"],
  ["cibc", "CM.TO"],
  ["national bank", "NA.TO"],
  ["shopify", "SHOP.TO"],
  ["enbridge", "ENB.TO"],
  ["suncor", "SU.TO"],
  ["manulife", "MFC.TO"],
  ["telus", "T.TO"],
  ["bce", "BCE.TO"],
  ["cn rail", "CNR.TO"], ["canadian national", "CNR.TO"],
  ["cp rail", "CP.TO"], ["canadian pacific", "CP.TO"],
  ["thomson reuters", "TRI.TO"],
  ["canadian natural", "CNQ.TO"],
];

function extractTicker(text: string): string {
  const lower = text.toLowerCase();

  // 1. Company name map (longest match first to avoid partial hits)
  for (const [name, ticker] of COMPANY_TO_TICKER) {
    if (lower.includes(name)) return ticker;
  }

  // 2. Explicit uppercase ticker in the text (e.g. "AAPL", "CNR.TO")
  const STOP = new Set(["A", "I", "AT", "BE", "IS", "TO", "OF", "IN", "ON", "DO", "IF", "US", "THE", "FOR", "AND", "OR", "HOW", "WHY", "WHAT", "SHOW", "GET", "ITS", "ARE"]);
  const upper = (text.match(/\b[A-Z]{2,5}(?:\.TO)?\b/g) || []).filter(t => !STOP.has(t));
  if (upper.length > 0) return upper[0];

  return "";
}

function extractTickers(text: string): string[] {
  const STOP = new Set(["A", "I", "AT", "BE", "IS", "TO", "OF", "IN", "ON", "DO", "IF", "US", "THE", "FOR", "AND", "OR", "HOW", "WHY", "WHAT", "SHOW", "GET", "ITS", "ARE"]);
  const found: string[] = [];
  const lower = text.toLowerCase();

  // Company name matches (can find multiple)
  for (const [name, ticker] of COMPANY_TO_TICKER) {
    if (lower.includes(name) && !found.includes(ticker)) found.push(ticker);
  }

  // Explicit uppercase tickers
  const upper = (text.match(/\b[A-Z]{2,5}(?:\.TO)?\b/g) || []).filter(t => !STOP.has(t));
  for (const t of upper) {
    if (!found.includes(t)) found.push(t);
  }

  return found.slice(0, 4); // cap at 4 bubbles
}


// ── Collapsible section helpers ──────────────────────────────────────────────

interface ParsedSection { title: string; content: string; }

const SECTION_COLORS: Record<string, string> = {
  "Price Snapshot":         "#3b82f6",
  "Analyst Consensus":      "#cc1100",
  "Recent Analyst Actions": "#f59e0b",
  "News & Context":         "#8b5cf6",
  "Market Context":         "#6b7280",
  "Putting It Together":    "#22c55e",
  "Analyst Ratings":        "#cc1100",
  "Overview":               "#888888",
};

function parseMessageSections(text: string): ParsedSection[] | null {
  // Detect either ## Heading OR **Bold**: section markers (Claude uses both)
  const mdHeaderRegex = /(?:^|\n)(#{1,3})\s+([^\n]+)/g;
  const boldRegex = /(?:^|\n)\*\*([A-Z][^*\n]{1,60})\*\*\s*:/g;

  let matches: { index: number; title: string; contentStart: number }[] = [];
  let m;

  while ((m = mdHeaderRegex.exec(text)) !== null) {
    // Strip trailing ** or emoji-like chars from h2/h3 titles
    const title = m[2].replace(/\*+$/, "").trim();
    matches.push({ index: m.index, title, contentStart: m.index + m[0].length });
  }

  if (matches.length < 2) {
    // Fallback to **Bold**: pattern
    matches = [];
    while ((m = boldRegex.exec(text)) !== null) {
      matches.push({ index: m.index, title: m[1].trim(), contentStart: m.index + m[0].length });
    }
  }

  if (matches.length < 2) return null;

  const sections: ParsedSection[] = [];
  const preamble = text.slice(0, matches[0].index).trim();
  if (preamble.length > 30) sections.push({ title: "Overview", content: preamble });
  matches.forEach((match, i) => {
    const end = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const content = text.slice(match.contentStart, end).trim();
    if (content) sections.push({ title: match.title, content });
  });
  return sections.length >= 2 ? sections : null;
}

// ── enrichChildren — emoji → icons + number coloring for section content ────
function enrichChildren(children: React.ReactNode): React.ReactNode {
  const knownEmoji = Object.keys(EMOJI_TO_ICON);

  function processStr(str: string): React.ReactNode[] {
    // 1. Colorize $amounts and ±% patterns
    const segments = str.split(/(\$[\d,]+(?:\.\d+)?[BMKTbmkt]?|[+-]\d+(?:\.\d+)?\s*%)/);
    const colored: Array<string | React.ReactNode> = segments.map((seg, i) => {
      if (!seg) return null;
      if (/^\+\d/.test(seg) && seg.includes('%'))
        return <span key={`c${i}`} style={{ color: "#22c55e", fontWeight: 700 }}>{seg}</span>;
      if (/^-\d/.test(seg) && seg.includes('%'))
        return <span key={`c${i}`} style={{ color: "#cc1100", fontWeight: 700 }}>{seg}</span>;
      if (/^\$\d/.test(seg))
        return <span key={`c${i}`} style={{ color: "#3b82f6", fontWeight: 600 }}>{seg}</span>;
      return seg;
    }).filter(Boolean) as Array<string | React.ReactNode>;

    // 2. Apply emoji → icons to any remaining plain strings
    const result: React.ReactNode[] = [];
    colored.forEach((item, ri) => {
      if (typeof item !== "string") { result.push(item); return; }
      let parts: Array<string | React.ReactNode> = [item];
      for (const emoji of knownEmoji) {
        const next: Array<string | React.ReactNode> = [];
        for (const p of parts) {
          if (typeof p !== "string") { next.push(p); continue; }
          const segs2 = p.split(emoji);
          segs2.forEach((s, si) => {
            if (s) next.push(s);
            if (si < segs2.length - 1) next.push(<InlineIcon key={`e${ri}-${si}`} type={EMOJI_TO_ICON[emoji]} />);
          });
        }
        parts = next;
      }
      result.push(...(parts as React.ReactNode[]));
    });
    // 3. Strip any residual emoji not handled above
    return result.map(item => typeof item === "string" ? stripResidualEmoji(item) : item).filter(item => item !== "") as React.ReactNode[];
  }

  return React.Children.map(children, (child) => {
    if (typeof child !== "string") return child;
    return processStr(child);
  });
}

// ── extractStatPills — pull key numbers from content for the pill header ────
type StatPill = { label: string; value: string; color: string };

function extractStatPills(content: string): StatPill[] {
  const text = content.slice(0, 900);
  const pills: StatPill[] = [];

  // Price: $12.50 or $1,234.56 (avoid matching market cap $ amounts immediately followed by B/T)
  const priceM = text.match(/\$(\d[\d,]*\.?\d{0,2})(?!\s*[BMKTbmkt])\b/);
  if (priceM) pills.push({ label: "Price", value: `$${priceM[1]}`, color: "#3b82f6" });

  // Change: +2.3% or -1.5% (first occurrence)
  const changeM = text.match(/([+-]\d+\.?\d*)\s*%/);
  if (changeM) {
    const v = parseFloat(changeM[1]);
    pills.push({ label: "Change", value: `${changeM[1]}%`, color: v >= 0 ? "#22c55e" : "#cc1100" });
  }

  // P/E ratio
  const peM = text.match(/P\/E\s*(?:ratio|of|:)?\s*([\d.]+)/i);
  if (peM) pills.push({ label: "P/E", value: `${peM[1]}×`, color: "#f59e0b" });

  // Yield
  const yieldM = text.match(/yield\s*(?:of|:)?\s*([\d.]+)\s*%/i);
  if (yieldM) pills.push({ label: "Yield", value: `${yieldM[1]}%`, color: "#8b5cf6" });

  // Market cap: $45.2B or $1.2T
  const capM = text.match(/\$([\d.]+)\s*([BT])\s*(?:market\s*cap|cap\b)/i);
  if (capM) pills.push({ label: "Mkt Cap", value: `$${capM[1]}${capM[2]}`, color: "#6b7280" });

  return pills.slice(0, 4);
}

const MD_COMPONENTS_SECTION = {
  table: ({ children }: any) => (
    <div style={{ overflowX: "auto", margin: "10px 0" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead style={{ backgroundColor: "#f5f2ee" }}>{children}</thead>,
  th: ({ children }: any) => <th style={{ padding: "7px 12px", borderBottom: "2px solid rgba(28,26,27,0.1)", textAlign: "left" as const, color: "#555", fontWeight: 700, fontSize: 10, textTransform: "uppercase" as const, letterSpacing: "0.07em" }}>{children}</th>,
  td: ({ children }: any) => <td style={{ padding: "7px 12px", borderBottom: "1px solid rgba(28,26,27,0.05)", color: "#2c2a29", fontSize: 12 }}>{enrichChildren(children)}</td>,
  tr: ({ children }: any) => <tr style={{ transition: "background 0.1s" }} onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#faf8f6")} onMouseLeave={e => (e.currentTarget.style.backgroundColor = "")}>{children}</tr>,
  p: ({ children }: any) => <p style={{ margin: "5px 0", lineHeight: 1.75 }}>{enrichChildren(children)}</p>,
  ul: ({ children }: any) => <ul style={{ margin: "6px 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column" as const, gap: 4 }}>{children}</ul>,
  ol: ({ children }: any) => <ol style={{ margin: "6px 0", paddingLeft: 18, display: "flex", flexDirection: "column" as const, gap: 4 }}>{children}</ol>,
  li: ({ children }: any) => (
    <li style={{ display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.65 }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#cc1100", flexShrink: 0, marginTop: 7 }} />
      <span>{enrichChildren(children)}</span>
    </li>
  ),
  strong: ({ children }: any) => <strong style={{ color: "#1d1a1b", fontWeight: 700 }}>{children}</strong>,
  blockquote: ({ children }: any) => <blockquote style={{ margin: "10px 0 4px", padding: "8px 12px", borderLeft: "3px solid #cc1100", backgroundColor: "rgba(204,17,0,0.04)", borderRadius: "0 6px 6px 0", color: "#666", fontSize: 12 }}>{children}</blockquote>,
  code: ({ children }: any) => <code style={{ backgroundColor: "#f0ece8", padding: "2px 6px", borderRadius: 3, fontSize: 12, color: "#cc1100", fontWeight: 600 }}>{children}</code>,
  hr: () => <hr style={{ border: "none", borderTop: "1px solid rgba(28,26,27,0.08)", margin: "10px 0" }}/>,
  a: ({ children }: any) => <span style={{ color: "#cc1100" }}>{children}</span>,
};

function CollapsibleSection({ title, content, delay = 0, defaultOpen = false, children }: {
  title: string; content?: string; delay?: number; defaultOpen?: boolean; children?: React.ReactNode;
}) {
  const [phase, setPhase] = React.useState<"closed" | "loading" | "open">(defaultOpen ? "open" : "closed");
  // Strip non-ASCII (emoji) for SECTION_COLORS lookup, then build icon nodes for display
  const cleanTitle = title.replace(/[^\x00-\x7F]/g, '').trim();
  const color = SECTION_COLORS[cleanTitle] ?? SECTION_COLORS[title] ?? "#888";
  const titleNodes = (() => {
    const knownEmoji = Object.keys(EMOJI_TO_ICON);
    let parts: Array<string | React.ReactNode> = [title];
    for (const emoji of knownEmoji) {
      const next: Array<string | React.ReactNode> = [];
      for (const part of parts) {
        if (typeof part !== "string" || !part.includes(emoji)) { next.push(part); continue; }
        const segs = part.split(emoji);
        segs.forEach((seg, i) => {
          if (seg) next.push(seg);
          if (i < segs.length - 1) next.push(<InlineIcon key={emoji + i} type={EMOJI_TO_ICON[emoji]} />);
        });
      }
      parts = next;
    }
    // Strip any remaining unknown emoji from string segments
    return parts.map((p, i) =>
      typeof p === "string"
        ? p.replace(/[^\x00-\x7F]/g, '').trim()
        : p
    );
  })();

  const toggle = () => {
    if (phase === "loading") return;
    if (phase === "open") { setPhase("closed"); return; }
    setPhase("loading");
    setTimeout(() => setPhase("open"), 1300);
  };

  return (
    <div style={{
      opacity: 0,
      animation: `fadeScaleIn 0.28s ease forwards ${delay}s`,
      borderRadius: 7,
      border: "1px solid rgba(28,26,27,0.08)",
      backgroundColor: "#fff",
      overflow: "hidden",
    }}>
      <button onClick={toggle} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 8,
        padding: "9px 12px 9px 14px",
        background: "none", border: "none", cursor: "pointer",
        textAlign: "left",
        borderLeft: `3px solid ${color}`,
      }}>
        <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "#1c1a1b", letterSpacing: "0.01em" }}>{titleNodes}</span>
        {phase === "loading" && (
          <span style={{ fontSize: 9, color: "#bbb", marginRight: 6 }}>analyzing…</span>
        )}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
          style={{ transform: phase === "open" ? "rotate(180deg)" : "none", transition: "transform 0.2s ease", color: "#bbb", flexShrink: 0 }}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {phase === "loading" && (
        <div style={{ padding: "10px 14px 14px 17px", borderTop: "1px solid rgba(28,26,27,0.06)" }}>
          {[88, 100, 70, 92, 58].map((w, idx) => (
            <div key={idx} style={{
              height: 8, borderRadius: 4, width: `${w}%`,
              backgroundColor: "rgba(0,0,0,0.05)",
              marginBottom: idx < 4 ? 9 : 0,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.08) 50%, transparent 100%)`,
                animation: `shimmerSlide ${0.9 + idx * 0.07}s ease-in-out infinite`,
              }} />
            </div>
          ))}
        </div>
      )}

      {phase === "open" && (
        <div style={{
          padding: "10px 14px 14px 17px",
          borderTop: "1px solid rgba(28,26,27,0.06)",
          animation: "expandDown 0.32s cubic-bezier(0.22,1,0.36,1)",
          fontSize: 13, lineHeight: 1.7, color: "#2c2a29",
        }}>
          {content && (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS_SECTION}>
              {content}
            </ReactMarkdown>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

function ChartMessage({ chart }: { chart: ChartSpec }) {
  const height = 280;

  const isPriceChart = chart.series.some(s =>
    s.key === "close" || s.key === "price" || s.key.toLowerCase().includes("price")
  );
  const isPercentChart = chart.series.some(s =>
    s.key.toLowerCase().includes("pct") || s.key.toLowerCase().includes("percent") || s.name.toLowerCase().includes("%")
  );

  const yFormatter = (value: number) => {
    if (isPriceChart) return `$${value}`;
    if (isPercentChart) return `${value}%`;
    if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
    return String(value);
  };

  const labelFormatter = (value: any) => {
    const n = typeof value === "number" ? value : parseFloat(String(value));
    if (isNaN(n)) return String(value ?? "");
    if (isPriceChart) return `$${n}`;
    if (isPercentChart) return `${n}%`;
    if (Math.abs(n) >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
    if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
    if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return String(n);
  };

  const commonProps = {
    data: chart.data,
    margin: { top: 22, right: 16, left: 0, bottom: 5 },
  };
  const axisStyle = { fill: "#999", fontSize: 10 };
  const gridStyle = { stroke: "rgba(0,0,0,0.05)" };
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#1c1a1b",
      border: "none",
      color: "#f0eeec",
      borderRadius: 6,
      padding: "8px 12px",
      fontSize: 12,
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
    },
    labelStyle: { color: "#aaa", marginBottom: 4, fontSize: 11 },
    itemStyle: { color: "#f0eeec" },
  };

  const hasNegative = chart.data.some(row =>
    chart.series.some(s => { const v = row[s.key]; return typeof v === "number" && v < 0; })
  );

  function renderChart() {
    if (chart.type === "area") {
      return (
        <AreaChart {...commonProps}>
          <defs>
            {chart.series.map(s => (
              <linearGradient key={s.key} id={`grad_${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} {...gridStyle} />
          <XAxis dataKey={chart.xKey} tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={yFormatter} width={52} domain={["auto", "auto"]} />
          <Tooltip {...tooltipStyle} />
          {chart.series.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: "#666", paddingTop: 8 }} />}
          {chart.series.map(s => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.name}
              stroke={s.color} strokeWidth={2.5}
              fill={`url(#grad_${s.key})`}
              dot={false} activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      );
    }
    if (chart.type === "line") {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid vertical={false} {...gridStyle} />
          <XAxis dataKey={chart.xKey} tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={yFormatter} width={52} domain={["auto", "auto"]} />
          <Tooltip {...tooltipStyle} />
          {chart.series.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: "#666", paddingTop: 8 }} />}
          {chart.series.map(s => (
            <Line key={s.key} type="monotone" dataKey={s.key} name={s.name}
              stroke={s.color} strokeWidth={2.5} dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      );
    }
    if (chart.type === "combo") {
      // Combo: first series = bars, remaining = lines (e.g. revenue bars + margin line)
      const barSeries = chart.series.filter(s => !s.key.toLowerCase().includes("margin") && !s.key.toLowerCase().includes("pct") && !s.key.toLowerCase().includes("percent") && !s.key.toLowerCase().includes("rate"));
      const lineSeries = chart.series.filter(s => s.key.toLowerCase().includes("margin") || s.key.toLowerCase().includes("pct") || s.key.toLowerCase().includes("percent") || s.key.toLowerCase().includes("rate") || (barSeries.length === 0));
      // If no clear split, first series is bar, rest are lines
      const finalBars = barSeries.length > 0 ? barSeries : chart.series.slice(0, 1);
      const finalLines = lineSeries.length > 0 ? lineSeries : chart.series.slice(1);
      return (
        <ComposedChart {...commonProps}>
          <CartesianGrid vertical={false} {...gridStyle} />
          <XAxis dataKey={chart.xKey} tick={axisStyle} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={yFormatter} width={52} />
          {finalLines.length > 0 && <YAxis yAxisId="right" orientation="right" tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={40} />}
          <Tooltip {...tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#666", paddingTop: 8 }} />
          {finalBars.map(s => (
            <Bar key={s.key} yAxisId="left" dataKey={s.key} name={s.name} fill={s.color} radius={[3, 3, 0, 0]} maxBarSize={52} />
          ))}
          {finalLines.map(s => (
            <Line key={s.key} yAxisId="right" type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2.5} dot={{ r: 3, fill: s.color, strokeWidth: 0 }} />
          ))}
        </ComposedChart>
      );
    }

    if (chart.type === "scatter") {
      // Scatter: expects data with x, y, and optional z keys; series defines which key maps to which axis
      const xSeries = chart.series[0];
      const ySeries = chart.series[1] ?? chart.series[0];
      return (
        <ScatterChart {...commonProps}>
          <CartesianGrid vertical={false} {...gridStyle} />
          <XAxis dataKey={xSeries?.key} name={xSeries?.name} tick={axisStyle} axisLine={false} tickLine={false} label={{ value: xSeries?.name, position: "insideBottom", offset: -2, style: { fontSize: 10, fill: "#999" } }} />
          <YAxis dataKey={ySeries?.key} name={ySeries?.name} tick={axisStyle} axisLine={false} tickLine={false} width={52} />
          <ZAxis range={[40, 40]} />
          <Tooltip {...tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={chart.data} fill={xSeries?.color ?? "#cc1100"} opacity={0.85} />
        </ScatterChart>
      );
    }

    // bar (default)
    return (
      <BarChart {...commonProps}>
        <CartesianGrid vertical={false} {...gridStyle} />
        <XAxis dataKey={chart.xKey} tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={yFormatter} width={52} />
        <Tooltip {...tooltipStyle} />
        {chart.series.length > 1 && <Legend wrapperStyle={{ fontSize: 11, color: "#666", paddingTop: 8 }} />}
        {hasNegative && <ReferenceLine y={0} stroke="rgba(0,0,0,0.18)" strokeWidth={1} />}
        {chart.series.map(s => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color}
            radius={[3, 3, 0, 0]} maxBarSize={52}
          >
            <LabelList dataKey={s.key} position="top"
              style={{ fontSize: 9, fill: "#555", fontWeight: 600 }}
              formatter={labelFormatter}
            />
          </Bar>
        ))}
      </BarChart>
    );
  }

  return (
    <div style={{
      backgroundColor: "#ffffff",
      border: "1px solid rgba(28,26,27,0.09)",
      borderRadius: 10,
      padding: "14px 16px",
      marginTop: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 3, height: 16, backgroundColor: "#cc1100", borderRadius: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: "#1c1a1b", letterSpacing: "0.01em" }}>
          {chart.title}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}

const QUICK_ACTIONS = [
  { label: "Show me visuals", msg: "Can you show me the price chart and key visuals for the stock we're discussing?" },
  { label: "Compare with 3 peers", msg: "Compare this stock with exactly 3 of its closest peers — show P/E, revenue, market cap, and dividend yield side by side." },
  { label: "Latest news", msg: "What's the latest news for the stock we're discussing?" },
  { label: "Analyst ratings", msg: "Show me the analyst ratings breakdown and consensus for this stock." },
  { label: "Earnings history", msg: "Show me the earnings per share history for this stock, actual vs estimate, as a chart." },
  { label: "Key fundamentals", msg: "Give me a fundamentals snapshot for this stock: P/E, market cap, revenue, profit margin, and debt-to-equity." },
  { label: "Dividend details", msg: "What are the dividend details for this stock? Yield, annual rate, and payout history." },
  { label: "52-week range", msg: "Where does this stock currently sit relative to its 52-week high and low? Analyze the context." },
  { label: "Analyst price target", msg: "What is the analyst consensus price target for this stock, and what does it imply?" },
  { label: "Sector comparison", msg: "How does this stock compare to other companies in its sector? Focus on valuation and growth." },
];

function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const start = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(start);
  }, [text]);
  return { displayed, done };
}

// LOADING_PHRASES — sourced from TRANSLATIONS at runtime
const LOADING_PHRASES = TRANSLATIONS.en.loadingPhrases;

function LoadingAssistant({ lang = "en" as Lang }: { lang?: Lang }) {
  const phrases = TRANSLATIONS[lang].loadingPhrases;
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    setPhraseIdx(0);
    const interval = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [lang, phrases.length]);

  return (
    <div style={{
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      animation: "floatingCloud 4s ease-in-out infinite",
      zIndex: 100,
    }}>
      {/* Main sleek pill-shaped bubble */}
      <div style={{
        padding: "16px 28px",
        backgroundColor: "rgba(255, 255, 255, 0.94)",
        backdropFilter: "blur(12px)",
        border: "1px solid #cc1100",
        borderRadius: "32px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08), 0 0 1px rgba(204,17,0,0.2)",
        minWidth: 240,
        textAlign: "center",
        position: "relative",
        zIndex: 2,
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#cc1100",
          fontStyle: "italic",
          letterSpacing: "-0.01em",
          lineHeight: 1.2,
          opacity: 0,
          animation: "fadeIn 0.4s ease forwards",
        }} key={phraseIdx}>
          {phrases[phraseIdx]}
        </div>
      </div>

      {/* Geometric Thinking Trail - Perfectly aligned circles */}
      <div style={{ position: "relative", width: "100%", height: 50, marginTop: 4 }}>
        <div style={{
          position: "absolute", left: "42%", top: 0,
          width: 14, height: 14, borderRadius: "50%",
          backgroundColor: "#fff", border: "1px solid rgba(204,17,0,0.4)",
          boxShadow: "0 4px 10px rgba(0,0,0,0.03)",
        }} />
        <div style={{
          position: "absolute", left: "38%", top: 22,
          width: 8, height: 8, borderRadius: "50%",
          backgroundColor: "#fff", border: "1px solid rgba(204,17,0,0.3)",
        }} />
        <div style={{
          position: "absolute", left: "35%", top: 36,
          width: 5, height: 5, borderRadius: "50%",
          backgroundColor: "#fff", border: "1px solid rgba(204,17,0,0.2)",
        }} />
      </div>
    </div>
  );
}

// ── Orbital loading bar — shown below the orbit scene during AI fetch ────────
const LOAD_STEPS_EN = ["Fetching market data", "Loading analyst views", "Pulling recent news", "Crunching financials", "Synthesizing insights"];
const LOAD_STEPS_FR = ["Récupération des données", "Chargement des analystes", "Lecture des actualités", "Analyse des finances", "Synthèse en cours"];
const SEGMENTS = 16;

function OrbitalLoadingBar({ lang }: { lang: Lang }) {
  const steps = lang === "fr" ? LOAD_STEPS_FR : LOAD_STEPS_EN;
  const [step, setStep] = useState(0);
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    // Advance label every 1.6s
    const labelTimer = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1600);
    // Fill segments progressively, a bit random for realism
    let seg = 0;
    const fillTimer = setInterval(() => {
      seg = Math.min(seg + Math.floor(Math.random() * 2) + 1, SEGMENTS - 2); // never reaches 100%
      setFilled(seg);
    }, 420);
    return () => { clearInterval(labelTimer); clearInterval(fillTimer); };
  }, [steps.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: 0, animation: "fadeScaleIn 0.6s ease forwards 0.3s" }}>
      {/* Step label */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#cc1100", animation: "blink 1s step-end infinite" }} />
        <span key={step} style={{ fontSize: 11, color: "#555", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600, opacity: 0, animation: "fadeIn 0.3s ease forwards" }}>
          {steps[step]}
        </span>
      </div>

      {/* Segmented bar */}
      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
        {Array.from({ length: SEGMENTS }).map((_, i) => {
          const active = i < filled;
          const isEdge = i === filled - 1;
          return (
            <div key={i} style={{
              width: 22, height: active ? 6 : 3,
              borderRadius: 3,
              backgroundColor: active ? "#cc1100" : "rgba(28,26,27,0.1)",
              opacity: active ? (isEdge ? 0.7 : 1) : 1,
              boxShadow: isEdge ? "0 0 8px rgba(204,17,0,0.6)" : "none",
              transition: "height 0.2s ease, background-color 0.3s ease, box-shadow 0.3s ease",
            }} />
          );
        })}
      </div>

      {/* Sweeping shimmer track */}
      <div style={{ width: SEGMENTS * 25, height: 2, backgroundColor: "rgba(28,26,27,0.06)", borderRadius: 1, overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute", top: 0, left: 0, height: "100%", width: "35%",
          background: "linear-gradient(90deg, transparent, rgba(204,17,0,0.5), transparent)",
          animation: "loadingBarMove 1.8s ease-in-out infinite",
        }} />
      </div>

      {/* Percentage */}
      <div style={{ fontSize: 10, color: "#bbb", fontWeight: 600, letterSpacing: "0.06em" }}>
        {Math.round((filled / SEGMENTS) * 100)}%
      </div>
    </div>
  );
}

// ── Auth ─────────────────────────────────────────────────────────────────────
const CREDENTIALS = { username: "admin", password: "Mkt@9274" };

function LoginScreen({ onLogin, lang = "en" }: { onLogin: () => void; lang?: Lang }) {
  const T = TRANSLATIONS[lang].ui;
  const [user, setUser] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [showPass, setShowPass] = React.useState(false);
  const [error, setError] = React.useState("");
  const [shake, setShake] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  function attempt() {
    if (user.trim() === CREDENTIALS.username && pass === CREDENTIALS.password) {
      setSuccess(true);
      sessionStorage.setItem("fred_authed", "1");
      setTimeout(onLogin, 900);
    } else {
      setError(T.loginError);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }

  function onKey(e: React.KeyboardEvent) { if (e.key === "Enter") attempt(); }

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "#f5f2ee",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 10000, flexDirection: "column",
    }}>
      {/* Background floating tickers (decorative) */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", opacity: 0.18 }}>
        {["AAPL","NVDA","TSLA","MSFT","AMZN","SPY","QQQ","GOOG","META","TD.TO"].map((t, i) => (
          <div key={t} style={{
            position: "absolute",
            left: `${(i * 11 + 5) % 95}%`, top: `${(i * 17 + 10) % 85}%`,
            fontSize: 11, fontWeight: 700, color: "#cc1100", letterSpacing: "0.05em",
            animation: `bubbleFloat ${6 + i * 0.7}s ease-in-out infinite`,
            animationDelay: `${i * 0.8}s`,
          }}>{t}</div>
        ))}
      </div>

      {/* Login card */}
      <div style={{
        backgroundColor: "#fff",
        border: "1px solid rgba(28,26,27,0.1)",
        borderRadius: 20,
        padding: "40px 44px 36px",
        width: 340,
        boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
        animation: "fadeScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      }}>
        {/* Fred */}
        <div style={{
          marginBottom: 6,
          transform: shake ? "translateX(0)" : "translateX(0)",
          animation: shake ? "loginShake 0.5s ease" : success ? "loginSuccess 0.6s ease forwards" : "wizardFloat 3s ease-in-out infinite",
          filter: success ? "drop-shadow(0 0 12px rgba(34,197,94,0.6))" : "none",
          transition: "filter 0.3s ease",
        }}>
          <PixelWizard width="64" height="90" />
        </div>

        <div style={{ fontSize: 16, fontWeight: 700, color: "#1d1a1b", letterSpacing: "-0.02em", marginBottom: 2 }}>
          Fred, The Market Wizard
        </div>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 28 }}>
          {success ? T.loginWelcome : T.loginSubtitle}
        </div>

        {/* Username */}
        <div style={{ width: "100%", marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            {T.loginUsername}
          </label>
          <input
            value={user} onChange={e => { setUser(e.target.value); setError(""); }}
            onKeyDown={onKey} placeholder={T.loginUsername}
            style={{
              width: "100%", padding: "10px 13px", borderRadius: 8, fontSize: 13,
              border: `1px solid ${error ? "rgba(204,17,0,0.5)" : "rgba(28,26,27,0.14)"}`,
              backgroundColor: "#f9f7f5", color: "#1d1a1b", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ width: "100%", marginBottom: 8, position: "relative" }}>
          <label style={{ fontSize: 10, fontWeight: 600, color: "#555", letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
            {T.loginPassword}
          </label>
          <input
            type={showPass ? "text" : "password"}
            value={pass} onChange={e => { setPass(e.target.value); setError(""); }}
            onKeyDown={onKey} placeholder={T.loginPassword}
            style={{
              width: "100%", padding: "10px 38px 10px 13px", borderRadius: 8, fontSize: 13,
              border: `1px solid ${error ? "rgba(204,17,0,0.5)" : "rgba(28,26,27,0.14)"}`,
              backgroundColor: "#f9f7f5", color: "#1d1a1b", outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button onClick={() => setShowPass(v => !v)} style={{
            position: "absolute", right: 10, bottom: 10,
            background: "none", border: "none", cursor: "pointer", padding: 2, color: "#aaa",
          }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              {showPass ? <>
                <path d="M1 10C1 10 4 4 10 4s9 6 9 6-3 6-9 6S1 10 1 10z" stroke="currentColor" strokeWidth="1.6"/>
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
                <line x1="2" y1="2" x2="18" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </> : <>
                <path d="M1 10C1 10 4 4 10 4s9 6 9 6-3 6-9 6S1 10 1 10z" stroke="currentColor" strokeWidth="1.6"/>
                <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6"/>
              </>}
            </svg>
          </button>
        </div>

        {/* Error */}
        <div style={{ height: 18, marginBottom: 14 }}>
          {error && <div style={{ fontSize: 11, color: "#cc1100", textAlign: "center", animation: "fadeIn 0.2s ease" }}>{error}</div>}
        </div>

        {/* Sign In */}
        <button
          onClick={attempt}
          disabled={success}
          style={{
            width: "100%", padding: "11px", borderRadius: 9, fontSize: 13, fontWeight: 700,
            backgroundColor: success ? "#22c55e" : "#cc1100",
            color: "#fff", border: "none", cursor: success ? "default" : "pointer",
            boxShadow: `0 4px 16px rgba(${success ? "34,197,94" : "204,17,0"},0.35)`,
            transition: "background-color 0.4s ease, box-shadow 0.4s ease",
            letterSpacing: "0.01em",
          }}
        >
          {success ? T.loginAuthenticated : T.loginSignIn}
        </button>

        {/* Footer */}
        <div style={{ marginTop: 20, fontSize: 9.5, color: "#bbb", textAlign: "center" }}>
          {T.loginFooter}
        </div>
      </div>

      <style>{`
        @keyframes loginShake {
          0%,100%{transform:translateX(0)} 18%{transform:translateX(-7px)} 36%{transform:translateX(7px)} 54%{transform:translateX(-5px)} 72%{transform:translateX(5px)} 88%{transform:translateX(-3px)}
        }
        @keyframes loginSuccess {
          0%{transform:scale(1)} 40%{transform:scale(1.18) rotate(-5deg)} 70%{transform:scale(0.95) rotate(3deg)} 100%{transform:scale(1.05)}
        }
      `}</style>
    </div>
  );
}

export default function Home() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem("fred_authed") === "1") setAuthed(true);
  }, []);

  // Language state — persisted in localStorage
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("fred_lang");
      return (saved === "fr" || saved === "en") ? saved : "en";
    } catch { return "en"; }
  });
  useEffect(() => {
    try { localStorage.setItem("fred_lang", lang); } catch {}
  }, [lang]);
  const T = TRANSLATIONS[lang].ui;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [appPhase, setAppPhase] = useState<"home" | "forming" | "orbiting" | "chat" | "portfolio">("home");
  const [orbitTicker, setOrbitTicker] = useState("");
  const [orbitFading, setOrbitFading] = useState(false);
  const [activeBubbles, setActiveBubbles] = useState<BubbleData[]>(() => getRandomBubbles());
  const [formingOffsets, setFormingOffsets] = useState<Record<string, { x: number; y: number }>>({});
  const [responseTicker, setResponseTicker] = useState("");
  const [pendingTickers, setPendingTickers] = useState<string[]>([]);
  useEffect(() => { if (!loading) setPendingTickers([]); }, [loading]);
  const [previewTickers, setPreviewTickers] = useState<string[]>([]);
  useEffect(() => {
    if (appPhase !== "home") { setPreviewTickers([]); return; }
    const t = setTimeout(() => setPreviewTickers(extractTickers(input)), 350);
    return () => clearTimeout(t);
  }, [input, appPhase]);
  const [selectedAnalysisIndex, setSelectedAnalysisIndex] = useState<number>(-1);
  // Auto-select the newest analysis when a response arrives (skip follow-up messages)
  useEffect(() => {
    if (!loading && messages.length > 0) {
      const lastIdx = messages.reduceRight((found: number, m: Message, idx: number) =>
        found === -1 && m.role === "assistant" && !m.isFollowUp &&
        (parseMessageSections(m.content) !== null || (m.charts && m.charts.length > 0) || (m.analystRatings && m.analystRatings.length > 0))
          ? idx : found, -1);
      if (lastIdx !== -1) setSelectedAnalysisIndex(lastIdx);
    }
  }, [messages, loading]);
  const [suggestions, setSuggestions] = useState(() => getRandomSuggestions("en"));
  const [expandedCharts, setExpandedCharts] = useState<Record<number, boolean>>({});
  const [showActionMenu, setShowActionMenu] = useState(false);
  // Portfolio state
  const [portfolioPositions, setPortfolioPositions] = useState<Position[]>([]);
  const [livePrices, setLivePrices] = useState<Record<string, LivePrice>>({});
  const [showPremiumMenu, setShowPremiumMenu] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isShockwave, setIsShockwave] = useState(false);
  const [demoStep, setDemoStep] = useState<number | null>(null);
  const [tipIndex, setTipIndex] = useState(0);
  const [tipVisible, setTipVisible] = useState(true);
  const [addTicker, setAddTicker] = useState("");
  const [addShares, setAddShares] = useState("");
  const [addCost, setAddCost] = useState("");
  const [fetchingPrices, setFetchingPrices] = useState(false);
  const [wizardPhrase] = useState(() => TRANSLATIONS.en.wizardPhrases[Math.floor(Math.random() * TRANSLATIONS.en.wizardPhrases.length)]);
  // Pick a phrase from current lang for display
  const activePhrases = TRANSLATIONS[lang].wizardPhrases;
  const activeWizardPhrase = activePhrases[Math.floor(activePhrases.length * (TRANSLATIONS.en.wizardPhrases.indexOf(wizardPhrase) / TRANSLATIONS.en.wizardPhrases.length))] ?? activePhrases[0];
  const { displayed: titleTyped, done: titleDone } = useTypewriter(activeWizardPhrase);
  const [contentVisible, setContentVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setContentVisible(true), 820); return () => clearTimeout(t); }, []);
  const bottomRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const premiumMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isShockwave) {
      // bubbleShock runs 1.8s, let it fully complete + settle before clearing
      const timer = setTimeout(() => setIsShockwave(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [isShockwave]);

  // Update suggestions when lang changes
  useEffect(() => {
    setSuggestions(getRandomSuggestions(lang));
  }, [lang]);

  // Tip cycling — greeting (index 0) stays 9s, rest 5s
  const activeTips = TRANSLATIONS[lang].homeTips;
  useEffect(() => {
    if (appPhase !== "home") return;
    let current = tipIndex;
    let timer: ReturnType<typeof setTimeout>;
    function scheduleNext() {
      const delay = current === 0 ? 9000 : 5000;
      timer = setTimeout(() => {
        setTipVisible(false);
        setTimeout(() => {
          current = (current + 1) % activeTips.length;
          setTipIndex(current);
          setTipVisible(true);
          scheduleNext();
        }, 400);
      }, delay);
    }
    scheduleNext();
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appPhase, lang]);

  // Escape key exits demo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setDemoStep(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  function goHome() {
    setAppPhase("home");
    setMessages([]);
    setInput("");
    setOrbitTicker("");
    setOrbitFading(false);
    setFormingOffsets({});
    setActiveBubbles(getRandomBubbles());
    setSuggestions(getRandomSuggestions(lang));
    setExpandedCharts({});
    setShowActionMenu(false);
    setShowPremiumMenu(false);
  }

  // ── Portfolio helpers ───────────────────────────────────────────────────

  useEffect(() => {
    try {
      const saved = localStorage.getItem("fred_portfolio");
      if (saved) setPortfolioPositions(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("fred_portfolio", JSON.stringify(portfolioPositions));
  }, [portfolioPositions]);

  useEffect(() => {
    if (appPhase === "portfolio" && portfolioPositions.length > 0) fetchLivePrices();
  }, [appPhase]);

  async function fetchLivePrices() {
    if (portfolioPositions.length === 0) return;
    setFetchingPrices(true);
    const results: Record<string, LivePrice> = {};
    await Promise.all(portfolioPositions.map(async (p) => {
      try {
        const res = await fetch(`/api/quote?symbol=${p.ticker}`);
        const d = await res.json();
        if (d.price != null) results[p.ticker] = {
          price: d.price, currency: d.currency || "USD",
          change: d.change || 0, changePercent: d.changePercent || 0,
          name: d.longName || d.shortName || p.ticker,
        };
      } catch {}
    }));
    setLivePrices(prev => ({ ...prev, ...results }));
    setFetchingPrices(false);
  }

  function addPosition() {
    const ticker = addTicker.trim().toUpperCase();
    const shares = parseFloat(addShares);
    const avgCost = parseFloat(addCost);
    if (!ticker || isNaN(shares) || shares <= 0 || isNaN(avgCost) || avgCost <= 0) return;
    const newPos: Position = { id: Date.now().toString(), ticker, shares, avgCost };
    const updated = [...portfolioPositions, newPos];
    setPortfolioPositions(updated);
    setAddTicker(""); setAddShares(""); setAddCost(""); setShowAddForm(false);
    // fetch live price for new position
    fetch(`/api/quote?symbol=${ticker}`).then(r => r.json()).then(d => {
      if (d.price != null) setLivePrices(prev => ({ ...prev, [ticker]: {
        price: d.price, currency: d.currency || "USD",
        change: d.change || 0, changePercent: d.changePercent || 0,
        name: d.longName || d.shortName || ticker,
      }}));
    }).catch(() => {});
  }

  function removePosition(id: string) {
    setPortfolioPositions(prev => prev.filter(p => p.id !== id));
  }

  function buildPortfolioContext(): string {
    if (portfolioPositions.length === 0) return "";
    let totalCost = 0, totalValue = 0;
    const lines = portfolioPositions.map(p => {
      const lp = livePrices[p.ticker];
      const cost = p.shares * p.avgCost;
      totalCost += cost;
      if (lp) {
        const val = p.shares * lp.price;
        totalValue += val;
        const pnl = val - cost;
        const pct = (pnl / cost) * 100;
        return `- ${p.ticker}: ${p.shares} shares @ $${p.avgCost.toFixed(2)} avg cost → current $${lp.price.toFixed(2)} ${lp.currency} → ${pct >= 0 ? "+" : ""}${pct.toFixed(1)}% → $${val.toFixed(0)} value`;
      }
      return `- ${p.ticker}: ${p.shares} shares @ $${p.avgCost.toFixed(2)} avg cost (live price unavailable)`;
    });
    const pnl = totalValue - totalCost;
    const pct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
    return `SIMULATED PORTFOLIO CONTEXT (factual data — no investment advice):
The user has the following simulated portfolio positions:
${lines.join("\n")}

Portfolio summary: Current value $${totalValue.toFixed(0)} vs cost basis $${totalCost.toFixed(0)} (${pnl >= 0 ? "+" : ""}$${pnl.toFixed(0)}, ${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)

When discussing this portfolio: present only factual metrics (allocation %, sector exposure, concentration, P&L attribution). Do NOT recommend buying, selling, or holding any position. Do NOT give investment advice.`;
  }

  function toggleChart(index: number) {
    setExpandedCharts(prev => ({ ...prev, [index]: !prev[index] }));
  }

  useEffect(() => {
    if (!showActionMenu) return;
    function handleOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowActionMenu(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showActionMenu]);

  useEffect(() => {
    if (!showPremiumMenu) return;
    function handleOutsideClick(e: MouseEvent) {
      if (premiumMenuRef.current && !premiumMenuRef.current.contains(e.target as Node)) {
        setShowPremiumMenu(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showPremiumMenu]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string, followUpOf?: number) {
    if (!text.trim() || loading) return;
    const isPortfolio = appPhase === "portfolio";
    const isFirst = messages.length === 0 && !isPortfolio;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Only show a loading bubble when we're clearly asking about a specific known stock
    const RESP_STOP = new Set(["A","I","AT","BE","IS","TO","OF","IN","ON","DO","IF","US","THE","FOR","AND","OR","HOW","WHY","WHAT","SHOW","GET","ITS","ARE","ETF","USD","CAD","EPS","P/E","CEO","BUY","HOLD","SELL"]);
    let responseSym = "";
    const lowerText = text.toLowerCase();
    for (const [name, ticker] of COMPANY_TO_TICKER) {
      if (lowerText.includes(name)) { responseSym = ticker; break; }
    }
    if (!responseSym) {
      const upperMatches = (text.match(/\b[A-Z]{2,5}(?:\.TO)?\b/g) || []).filter(t => !RESP_STOP.has(t));
      for (const m of upperMatches) {
        if (ALL_TICKERS_SET.has(m) || ALL_TICKERS_SET.has(m.replace(/\.TO$/i, ""))) { responseSym = m; break; }
      }
    }
    setResponseTicker(responseSym);

    // Collect all mentioned tickers for the loading bubble
    const allMatches = (text.match(/\b[A-Z]{2,5}(?:\.TO)?\b/g) || []).filter(t => !RESP_STOP.has(t));
    const foundTickers: string[] = [];
    // Company name matches first
    for (const [name, ticker] of COMPANY_TO_TICKER) {
      if (lowerText.includes(name) && !foundTickers.includes(ticker)) foundTickers.push(ticker);
    }
    // Then explicit ticker matches
    for (const m of allMatches) {
      if ((ALL_TICKERS_SET.has(m) || ALL_TICKERS_SET.has(m.replace(/\.TO$/i, ""))) && !foundTickers.includes(m)) {
        foundTickers.push(m);
      }
    }
    setPendingTickers(foundTickers.slice(0, 4));

    // Kick off the API fetch immediately (runs in parallel with forming animation)
    const portfolioCtx = isPortfolio ? buildPortfolioContext() : undefined;
    const fetchPromise = fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages, portfolioContext: portfolioCtx, lang }),
    });

    if (isFirst) {
      // Compute fly-to-center vectors for each bubble from its screen position to viewport center
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const headerH = 52;
      const containerH = vh - headerH;
      const cX = vw / 2;
      const cY = headerH + containerH / 2;
      const offsets: Record<string, { x: number; y: number }> = {};
      activeBubbles.forEach(b => {
        const bL = (parseFloat(b.left) / 100) * vw;
        const bT = headerH + (parseFloat(b.top) / 100) * containerH;
        offsets[b.symbol] = { x: cX - bL, y: cY - bT };
      });
      setFormingOffsets(offsets);
      setOrbitTicker(responseSym || extractTicker(text));
      setAppPhase("forming");
      await new Promise(r => setTimeout(r, 750));
      setAppPhase("orbiting");
    }

    const fetchStart = Date.now();

    try {
      const res = await fetchPromise;
      const data = await res.json();
      const mentionedTickers: string[] = data.mentionedTickers || [];
      const assistantMsg: Message = { role: "assistant", content: data.content, charts: data.charts || [], analystRatings: data.analystRatings || [], tickers: mentionedTickers.length > 0 ? mentionedTickers : undefined };

      if (isFirst) {
        const elapsed = Date.now() - fetchStart;
        if (elapsed < 2800) await new Promise((r) => setTimeout(r, 2800 - elapsed));
        setLoading(false);
        setOrbitFading(true);
        await new Promise((r) => setTimeout(r, 2000));
        setMessages([...newMessages, assistantMsg]);
        setAppPhase("chat");
        setOrbitFading(false);
      } else if (followUpOf !== undefined) {
        // Follow-up chip: merge charts/ratings into parent, show compact message
        const updatedMessages = [...newMessages];
        updatedMessages[followUpOf] = {
          ...updatedMessages[followUpOf],
          charts: [...(updatedMessages[followUpOf].charts || []), ...(data.charts || [])],
          analystRatings: [...(updatedMessages[followUpOf].analystRatings || []), ...(data.analystRatings || [])],
        };
        updatedMessages.push({
          role: "assistant" as const,
          content: data.content,
          charts: [],
          analystRatings: [],
          tickers: mentionedTickers.length > 0 ? mentionedTickers : undefined,
          isFollowUp: true,
          followUpOfIndex: followUpOf,
        });
        setMessages(updatedMessages);
        setLoading(false);
        // Keep selectedAnalysisIndex on the parent (useEffect will re-evaluate and pick followUpOf since it has charts now)
        setSelectedAnalysisIndex(followUpOf);
      } else {
        setMessages([...newMessages, assistantMsg]);
        setLoading(false);
      }
    } catch {
      const errorMsg: Message = { role: "assistant", content: "Sorry, something went wrong. Please try again." };
      if (isFirst) {
        const elapsed = Date.now() - fetchStart;
        if (elapsed < 2800) await new Promise((r) => setTimeout(r, 2800 - elapsed));
        setLoading(false);
        setOrbitFading(true);
        await new Promise((r) => setTimeout(r, 500));
        setMessages([...newMessages, errorMsg]);
        setAppPhase("chat");
        setOrbitFading(false);
      } else {
        setMessages([...newMessages, errorMsg]);
        setLoading(false);
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} lang={lang} />;

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
          <PixelWizard width="24" height="34" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1d1a1b", letterSpacing: "-0.01em" }}>
              Fred, The Market Wizard
            </div>
            <div style={{ fontSize: 10, color: "#555", marginTop: -1 }}>
              {T.poweredBy}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {(appPhase === "chat" || appPhase === "portfolio") && (
            <button
              onClick={goHome}
              style={{
                fontSize: 11, color: "#555", padding: "4px 10px", borderRadius: 6,
                border: "1px solid rgba(28,26,27,0.12)", backgroundColor: "transparent",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#cc1100"; e.currentTarget.style.color = "#cc1100"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,26,27,0.12)"; e.currentTarget.style.color = "#555"; }}
            >
              {T.homeBtn}
            </button>
          )}

          {/* Demo button — always visible */}
          <button
            id="fred-demo-premium"
            onClick={() => { goHome(); setDemoStep(0); }}
            style={{
              fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 6,
              border: "1px solid rgba(28,26,27,0.18)", backgroundColor: "transparent",
              color: "#1d1a1b", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#cc1100"; e.currentTarget.style.color = "#cc1100"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,26,27,0.18)"; e.currentTarget.style.color = "#1d1a1b"; }}
          >
            <svg width="11" height="11" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.8"/>
              <polygon points="8,6.5 15,10 8,13.5" fill="currentColor"/>
            </svg>
            {T.demoBtn}
          </button>

          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === "en" ? "fr" : "en")}
            style={{
              fontSize: 11, color: "#555", padding: "4px 10px", borderRadius: 6,
              border: "1px solid rgba(28,26,27,0.12)", backgroundColor: "transparent",
              cursor: "pointer", fontWeight: 600, letterSpacing: "0.04em",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#cc1100"; e.currentTarget.style.color = "#cc1100"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,26,27,0.12)"; e.currentTarget.style.color = "#555"; }}
          >
            {lang === "en" ? "FR" : "EN"}
          </button>

          {/* Premium dropdown */}
          <div style={{ position: "relative" }} ref={premiumMenuRef}>
            <button
              onClick={() => setShowPremiumMenu(v => !v)}
              style={{
                fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6,
                border: `1px solid ${showPremiumMenu ? "#cc1100" : "rgba(204,17,0,0.4)"}`,
                backgroundColor: showPremiumMenu ? "rgba(204,17,0,0.08)" : "rgba(204,17,0,0.04)",
                color: "#cc1100", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
                transition: "all 0.15s",
              }}
            >
              ✦ Premium <span style={{ fontSize: 8 }}>{showPremiumMenu ? "▲" : "▼"}</span>
            </button>
            {showPremiumMenu && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0,
                backgroundColor: "#ffffff", border: "1px solid rgba(28,26,27,0.12)",
                borderRadius: 10, boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                padding: 6, zIndex: 200, minWidth: 220,
              }}>
                <button
                  onClick={() => { setAppPhase("portfolio"); setMessages([]); setShowPremiumMenu(false); }}
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 7, textAlign: "left",
                    border: "none", backgroundColor: "transparent", fontSize: 12,
                    color: "#1d1a1b", cursor: "pointer", display: "flex", flexDirection: "column", gap: 1,
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5f2ee"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                      <rect x="1" y="10" width="4" height="8" rx="1" fill="#cc1100" opacity="0.7"/>
                      <rect x="7" y="6" width="4" height="12" rx="1" fill="#cc1100" opacity="0.85"/>
                      <rect x="13" y="2" width="4" height="16" rx="1" fill="#cc1100"/>
                      <polyline points="2,9 8,5 14,2" stroke="#cc1100" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
                      <circle cx="2" cy="9" r="1.5" fill="#cc1100" opacity="0.6"/>
                      <circle cx="8" cy="5" r="1.5" fill="#cc1100" opacity="0.75"/>
                      <circle cx="14" cy="2" r="1.5" fill="#cc1100"/>
                    </svg>
                    Portfolio Simulator
                  </span>
                  <span style={{ fontSize: 10, color: "#888" }}>Build & analyze a simulated portfolio</span>
                </button>
                <button
                  disabled
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 7, textAlign: "left",
                    border: "none", backgroundColor: "transparent", fontSize: 12,
                    color: "#aaa", cursor: "not-allowed", display: "flex", flexDirection: "column", gap: 1,
                  }}
                >
                  <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="8" cy="8" r="5.5" stroke="#aaa" strokeWidth="1.6"/>
                      <line x1="12" y1="12" x2="18" y2="18" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
                      <line x1="5" y1="8" x2="11" y2="8" stroke="#aaa" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
                      <line x1="8" y1="5" x2="8" y2="11" stroke="#aaa" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
                    </svg>
                    Deep Fundamentals Analysis
                    <span style={{ fontSize: 9, backgroundColor: "#f0ece8", color: "#999", padding: "1px 5px", borderRadius: 4, fontWeight: 500 }}>Soon</span>
                  </span>
                  <span style={{ fontSize: 10, color: "#bbb" }}>Advanced financial modelling</span>
                </button>
              </div>
            )}
          </div>

          <div style={{
            fontSize: 10, color: "#555", padding: "3px 8px", borderRadius: 4,
            border: "1px solid rgba(28,26,27,0.1)", letterSpacing: "0.02em",
          }}>
            {T.educationalOnly}
          </div>
        </div>
      </header>

      {/* Home + Forming screens share the same DOM for seamless transition */}
      {(appPhase === "home" || appPhase === "forming") && (
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          {/* Floating bubbles — fly to center when forming */}
          {activeBubbles.map((b) => (
            <FloatingBubble
              key={b.symbol} {...b}
              forming={appPhase === "forming"}
              isShockwave={isShockwave}
              toX={formingOffsets[b.symbol]?.x ?? 0}
              toY={formingOffsets[b.symbol]?.y ?? 0}
            />
          ))}

          {/* Shockwave Rings */}
          {isShockwave && (<>
            <div style={{
              position: "absolute", left: "50%", top: "42%",
              width: 10, height: 10, borderRadius: "50%",
              border: "4px solid #cc1100",
              animation: "shockwaveRing 1s ease-out forwards",
              zIndex: 10, pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", left: "50%", top: "42%",
              width: 10, height: 10, borderRadius: "50%",
              border: "2px solid #fde047",
              animation: "shockwaveRing 1s ease-out forwards",
              animationDelay: "0.12s",
              zIndex: 10, pointerEvents: "none",
            }} />
          </>)}

          {/* Center content */}
          <div style={{
            position: "relative", zIndex: 1,
            height: "100%", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "0 20px",
          }}>
            {/* Wizard + bubble — column layout: bubble above Fred */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 16 }}>

              {/* Ticker preview bubbles — pop in as user types recognized tickers */}
              {previewTickers.length > 0 && appPhase === "home" && (
                <div style={{ marginBottom: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 0, pointerEvents: "none" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    {previewTickers.map((ticker, i) => (
                      <div key={ticker} style={{ animation: `fadeScaleIn 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards ${i * 0.06}s`, opacity: 0 }}>
                        <BubbleInner symbol={ticker} color={symbolColor(ticker)} size={i === 0 ? 54 : 44} />
                      </div>
                    ))}
                  </div>
                  {/* Tail under center of the row */}
                  <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid rgba(28,26,27,0.15)", marginTop: 1 }} />
                </div>
              )}

              {/* Tip speech bubble — hidden when ticker preview is showing */}
              {previewTickers.length === 0 && (
                <div style={{
                  marginBottom: 12,
                  opacity: (appPhase === "home" && contentVisible) ? (tipVisible ? 1 : 0) : 0,
                  transition: "opacity 0.35s ease",
                  pointerEvents: "none",
                  position: "relative",
                  backgroundColor: "#fff",
                  border: "1px solid rgba(204,17,0,0.25)",
                  borderRadius: 14,
                  padding: "11px 16px",
                  maxWidth: 230, minWidth: 180,
                  boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 11, color: "#1d1a1b", lineHeight: 1.65, fontStyle: "italic" }}>
                    {activeTips[tipIndex % activeTips.length]}
                  </div>
                  <div style={{ marginTop: 7, display: "flex", gap: 3, justifyContent: "center" }}>
                    {activeTips.map((_, i) => (
                      <div key={i} style={{
                        width: i === tipIndex ? 10 : 4, height: 4, borderRadius: 2,
                        backgroundColor: i === tipIndex ? "#cc1100" : "rgba(28,26,27,0.15)",
                        transition: "all 0.3s ease",
                      }} />
                    ))}
                  </div>
                  {/* Tail pointing down toward Fred */}
                  <div style={{ position: "absolute", bottom: -7, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: "7px solid rgba(204,17,0,0.25)" }} />
                  <div style={{ position: "absolute", bottom: -5.5, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid #fff" }} />
                </div>
              )}

              {/* Fred */}
              <div style={{
                transform: appPhase === "forming" ? "scale(1.12)" : "scale(1)",
                transition: "transform 0.5s ease",
              }}>
                <WizardEntrance onShockwave={() => setIsShockwave(true)}>
                  <PixelWizard />
                </WizardEntrance>
              </div>
            </div>

            {/* Title + cards + input — hidden until Fred lands, fade out during forming */}
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
              opacity: appPhase === "forming" ? 0 : contentVisible ? 1 : 0,
              transform: appPhase === "forming" ? "translateY(-12px) scale(0.97)" : contentVisible ? "translateY(0)" : "translateY(10px)",
              transition: "opacity 0.45s ease, transform 0.45s ease",
              pointerEvents: appPhase === "forming" ? "none" : "auto",
            }}>
              <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, color: "#1d1a1b", letterSpacing: "-0.02em", minHeight: "1.4em" }}>
                {titleTyped}
                {!titleDone && <span style={{ display: "inline-block", width: 2, height: "1em", background: "#cc1100", marginLeft: 2, verticalAlign: "text-bottom", animation: "blink 0.8s step-end infinite" }} />}
              </div>
              <div style={{ color: "#555", marginBottom: 24, fontSize: 13, opacity: titleDone ? 1 : 0, transition: "opacity 0.5s ease" }}>
                {T.subtitle}
              </div>
              <div id="fred-demo-cards" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, width: "100%", maxWidth: 480, marginBottom: 16 }}>
                {suggestions.map((s) => (
                  <button key={s.text} onClick={() => sendMessage(s.text)} style={{
                    padding: "5px 8px", textAlign: "left", borderRadius: 5,
                    border: "1px solid rgba(28,26,27,0.1)", backgroundColor: "#ffffff",
                    cursor: "pointer", width: "100%", transition: "border-color 0.15s, background 0.15s",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#cc1100"; e.currentTarget.style.backgroundColor = "#ede8e4"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,26,27,0.1)"; e.currentTarget.style.backgroundColor = "#ffffff"; }}
                  >
                    <div style={{ flexShrink: 0 }}><SuggestionIcon name={s.icon} /></div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 500, color: "#1d1a1b", lineHeight: 1.3 }}>{s.text}</div>
                      <div style={{ fontSize: 9, color: "#777", marginTop: 1 }}>{s.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
              <div id="fred-demo-input" style={{ display: "flex", gap: 8, alignItems: "center", width: "100%", maxWidth: 480 }}>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={T.placeholder}
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
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><line x1="2" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="11,4 17,10 11,16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orbit animation screen */}
      {appPhase === "orbiting" && (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          opacity: orbitFading ? 0 : 1,
          transition: "opacity 2s ease",
          animation: "fadeIn 0.4s ease forwards",
          position: "relative",
        }}>
          <OrbitScene ticker={orbitTicker} bubbles={activeBubbles} />
          {/* Loading bar below orbit */}
          <div style={{
            position: "absolute",
            bottom: "16%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
          }}>
            <OrbitalLoadingBar lang={lang} />
          </div>
        </div>
      )}

      {/* Two-column chat layout */}
      {appPhase === "chat" && (
      <div style={{ flex: 1, display: "flex", overflow: "hidden", opacity: 0, animation: "fadeSlideUp 1s cubic-bezier(0.22,1,0.36,1) forwards" }}>

        {/* LEFT PANEL: Analysis content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", backgroundColor: "#f9f7f5", borderRight: "1px solid rgba(28,26,27,0.1)" }}>
          {(() => {
            // Show the selected analysis (or latest if none selected yet)
            const latestAiMsg = selectedAnalysisIndex >= 0 ? messages[selectedAnalysisIndex] : null;
            if (!latestAiMsg) {
              return (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#bbb" }}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                    <rect x="4" y="26" width="6" height="10" rx="2" fill="currentColor" opacity="0.4"/>
                    <rect x="14" y="18" width="6" height="18" rx="2" fill="currentColor" opacity="0.6"/>
                    <rect x="24" y="10" width="6" height="26" rx="2" fill="currentColor" opacity="0.8"/>
                    <rect x="34" y="4" width="2" height="32" rx="1" fill="#cc1100" opacity="0.5"/>
                  </svg>
                  <div style={{ fontSize: 13, textAlign: "center", lineHeight: 1.6 }}>
                    {T.emptyState.split("\n").map((line, i) => <React.Fragment key={i}>{line}{i === 0 && <br/>}</React.Fragment>)}
                  </div>
                </div>
              );
            }
            const sections = parseMessageSections(latestAiMsg.content);
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {/* Tickers row */}
                {latestAiMsg.tickers && latestAiMsg.tickers.length > 0 && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                    {latestAiMsg.tickers.map((ticker, ti) => (
                      <div key={ticker} style={{ opacity: 0, animation: `fadeScaleIn 0.35s ease forwards ${ti * 0.07}s` }}>
                        <BubbleInner symbol={ticker} color={symbolColor(ticker)} size={44} />
                      </div>
                    ))}
                  </div>
                )}
                {sections ? (
                  <>
                    {/* Stat pills — auto-extracted key numbers */}
                    {(() => {
                      const pills = extractStatPills(latestAiMsg.content);
                      if (pills.length < 2) return null;
                      return (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const, marginBottom: 4 }}>
                          {pills.map((pill) => (
                            <div key={pill.label} style={{
                              display: "flex", alignItems: "center", gap: 5,
                              padding: "5px 11px", borderRadius: 20,
                              backgroundColor: "#fff",
                              border: `1.5px solid ${pill.color}33`,
                              opacity: 0, animation: "fadeScaleIn 0.3s ease forwards 0.05s",
                            }}>
                              <span style={{ fontSize: 10, color: "#888", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{pill.label}</span>
                              <span style={{ fontSize: 13, fontWeight: 700, color: pill.color }}>{pill.value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    {sections.map((s, si) => (
                      <CollapsibleSection key={si} title={s.title} content={s.content} delay={si * 0.04} defaultOpen={si === 0} />
                    ))}
                    {latestAiMsg.analystRatings && latestAiMsg.analystRatings.length > 0 && (
                      <CollapsibleSection title="Analyst Ratings" delay={sections.length * 0.04}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
                          {latestAiMsg.analystRatings.map((rating, ri) => (
                            <AnalystRatingsCard key={ri} data={rating} />
                          ))}
                        </div>
                      </CollapsibleSection>
                    )}
                    {/* Charts rendered directly — never inside a collapsed container (ResponsiveContainer needs visible DOM) */}
                    {latestAiMsg.charts && latestAiMsg.charts.length > 0 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
                        {latestAiMsg.charts.map((chart, ci) => (
                          <div key={ci} style={{ width: "100%", minWidth: 0, opacity: 0, animation: `fadeScaleIn 0.35s ease forwards ${((sections.length + (latestAiMsg.analystRatings?.length ? 1 : 0)) * 0.04) + ci * 0.08}s` }}>
                            <ChartMessage chart={chart} />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  // Flat content (no sections) — show full markdown + visuals in left panel
                  <div style={{ fontSize: 13, lineHeight: 1.7, color: "#2c2a29" }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD_COMPONENTS_SECTION}>
                      {latestAiMsg.content}
                    </ReactMarkdown>
                    {latestAiMsg.analystRatings && latestAiMsg.analystRatings.length > 0 && (
                      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                        {latestAiMsg.analystRatings.map((rating, ri) => (
                          <AnalystRatingsCard key={ri} data={rating} />
                        ))}
                      </div>
                    )}
                    {latestAiMsg.charts && latestAiMsg.charts.length > 0 && (
                      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                        {latestAiMsg.charts.map((chart, ci) => (
                          <div key={ci} style={{ width: "100%", minWidth: 0 }}>
                            <ChartMessage chart={chart} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* RIGHT PANEL: Chat thread + input */}
        <div style={{ width: 390, flexShrink: 0, display: "flex", flexDirection: "column", backgroundColor: "#fafaf8" }}>

          {/* Panel header */}
          <div style={{
            padding: "13px 18px",
            borderBottom: "1px solid rgba(28,26,27,0.09)",
            display: "flex", alignItems: "center", gap: 8,
            flexShrink: 0, backgroundColor: "#fff",
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#cc1100", flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#1d1a1b", letterSpacing: "0.06em", textTransform: "uppercase" as const }}>
              {T.conversationLabel}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#bbb", fontWeight: 500 }}>
              {T.messageCount(messages.filter(m => m.role === "user").length)}
            </span>
          </div>

          {/* Chat messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Fred greeting — always first */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(28,26,27,0.1)", backgroundColor: "#f5f2ee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PixelWizard width="18" height="25" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#cc1100", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>FRED</div>
                <div style={{ backgroundColor: "#f5f2ee", borderRadius: "4px 12px 12px 12px", padding: "9px 12px", fontSize: 12, color: "#1d1a1b", lineHeight: 1.65 }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                    p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                    strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                  }}>{T.greeting}</ReactMarkdown>
                </div>
              </div>
            </div>

            {messages.map((msg, i) => {
              const hasSections = msg.role === "assistant" && parseMessageSections(msg.content) !== null;

              // Build preamble for AI messages
              let chatPreamble = "";
              if (msg.role === "assistant") {
                const firstHeader = msg.content.search(/(?:^|\n)#{1,3}\s+/);
                chatPreamble = firstHeader > 0 ? msg.content.slice(0, firstHeader).trim() : "";
                // If AI jumped straight to ## headers with no intro, extract teaser from first section
                if (!chatPreamble && hasSections) {
                  const parsed = parseMessageSections(msg.content);
                  const firstContent = parsed?.[0]?.content ?? "";
                  const clean = firstContent.replace(/\*\*/g, "").replace(/#{1,3}\s+/g, "").trim();
                  chatPreamble = clean.length > 140 ? clean.slice(0, 137) + "…" : clean;
                }
              }

              // ── Follow-up compact message (chart/data added to parent analysis) ──
              if (msg.isFollowUp) {
                const parentIdx = msg.followUpOfIndex!;
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#cc1100", letterSpacing: "0.07em", textTransform: "uppercase" as const, paddingLeft: 4, marginBottom: 1 }}>Fred</span>
                    <div style={{
                      maxWidth: "91%", padding: "10px 14px",
                      borderRadius: "4px 18px 18px 18px",
                      backgroundColor: "#eeeae6",
                      fontSize: 13, lineHeight: 1.6, color: "#1d1a1b",
                    }}>
                      {/* Brief conversational response */}
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                        p: ({ children }) => <p style={{ margin: "3px 0" }}>{withIcons(children)}</p>,
                        strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                        a: () => null,
                      }}>
                        {msg.content.split(/\n#{2,3}\s/)[0].trim()}
                      </ReactMarkdown>
                      {/* "Added to analysis" badge */}
                      <button
                        onClick={() => setSelectedAnalysisIndex(parentIdx)}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          marginTop: 10, padding: "6px 12px", borderRadius: 8,
                          border: `1.5px solid ${selectedAnalysisIndex === parentIdx ? "#22c55e" : "rgba(34,197,94,0.35)"}`,
                          backgroundColor: selectedAnalysisIndex === parentIdx ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.06)",
                          color: "#16a34a", fontSize: 11, fontWeight: 600, cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#16a34a" strokeWidth="1.5"/><polyline points="5,8 7,10 11,6" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        {selectedAnalysisIndex === parentIdx ? T.viewingAnalysis : T.viewAnalysis}
                      </button>
                    </div>
                  </div>
                );
              }

              // ── Normal message ──
              return (
                <div key={i} style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: 4,
                }}>
                  {msg.role === "assistant" && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#cc1100", letterSpacing: "0.07em", textTransform: "uppercase" as const, paddingLeft: 4, marginBottom: 1 }}>
                      Fred
                    </span>
                  )}
                  <div style={{
                    maxWidth: "91%",
                    padding: msg.role === "user" ? "10px 15px" : "13px 16px",
                    borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                    backgroundColor: msg.role === "user" ? "#cc1100" : "#eeeae6",
                    color: msg.role === "user" ? "#fff" : "#1d1a1b",
                    fontSize: 13,
                    lineHeight: 1.65,
                    wordBreak: "break-word" as const,
                  }}>
                    {msg.role === "user" ? (
                      msg.content
                    ) : (
                      <>
                        {msg.tickers && msg.tickers.length > 0 && (
                          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 11, paddingBottom: 11, borderBottom: "1px solid rgba(28,26,27,0.09)" }}>
                            {msg.tickers.map((ticker, ti) => (
                              <div key={ticker} style={{ opacity: 0, animation: `fadeScaleIn 0.3s ease forwards ${ti * 0.06}s` }}>
                                <BubbleInner symbol={ticker} color={symbolColor(ticker)} size={42} />
                              </div>
                            ))}
                          </div>
                        )}
                        {hasSections ? (
                          <>
                            {chatPreamble && (
                              <div style={{ marginBottom: 12, fontSize: 13, lineHeight: 1.65, color: "#1d1a1b" }}>
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                                  p: ({ children }) => <p style={{ margin: "3px 0" }}>{withIcons(children)}</p>,
                                  strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
                                  em: ({ children }) => <em>{children}</em>,
                                  a: () => null,
                                  ul: ({ children }) => <ul style={{ margin: "4px 0", paddingLeft: 14 }}>{children}</ul>,
                                  li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
                                }}>
                                  {chatPreamble}
                                </ReactMarkdown>
                              </div>
                            )}
                            <button
                              onClick={() => setSelectedAnalysisIndex(i)}
                              style={{
                                display: "flex", alignItems: "center", gap: 8,
                                padding: "9px 14px", borderRadius: 10,
                                border: `1.5px solid ${selectedAnalysisIndex === i ? "#cc1100" : "rgba(28,26,27,0.18)"}`,
                                backgroundColor: selectedAnalysisIndex === i ? "rgba(204,17,0,0.09)" : "rgba(255,255,255,0.65)",
                                color: selectedAnalysisIndex === i ? "#cc1100" : "#444",
                                fontSize: 12, fontWeight: 600, cursor: "pointer",
                                width: "100%", textAlign: "left" as const,
                                transition: "all 0.15s",
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <rect x="1" y="9" width="3" height="6" rx="1" fill="currentColor" opacity="0.6"/>
                                <rect x="6" y="5" width="3" height="10" rx="1" fill="currentColor" opacity="0.8"/>
                                <rect x="11" y="2" width="3" height="13" rx="1" fill="currentColor"/>
                              </svg>
                              {selectedAnalysisIndex === i ? T.viewingAnalysis : T.viewAnalysis}
                            </button>
                            {/* Follow-up suggestion chips — send as follow-up (merges into this analysis) */}
                            {(() => {
                              const t = msg.tickers?.[0] ?? "";
                              const noChart = !msg.charts || msg.charts.length === 0;
                              const noRatings = !msg.analystRatings || msg.analystRatings.length === 0;
                              const chips = ([
                                noChart && t && { icon: "trendup", label: "Price chart", prompt: `Show me ${t}'s price chart` },
                                noRatings && t && { icon: "analyst", label: "Analyst view", prompt: `What do analysts say about ${t}?` },
                                t && !noChart && { icon: "search", label: T.comparePeers, prompt: `Compare ${t} with its main competitors` },
                                t && { icon: "money", label: T.dividends, prompt: `Show ${t}'s dividend history` },
                              ].filter(Boolean) as Array<{ icon: string; label: string; prompt: string }>).slice(0, 2);
                              if (!chips.length) return null;
                              return (
                                <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" as const }}>
                                  {chips.map((chip) => (
                                    <button
                                      key={chip.label}
                                      onClick={() => sendMessage(chip.prompt, i)}
                                      style={{
                                        display: "flex", alignItems: "center", gap: 5,
                                        padding: "5px 11px", borderRadius: 20,
                                        border: "1px solid rgba(28,26,27,0.16)",
                                        backgroundColor: "rgba(255,255,255,0.55)",
                                        color: "#444", fontSize: 11, fontWeight: 500,
                                        cursor: "pointer", transition: "all 0.12s",
                                      }}
                                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(204,17,0,0.08)"; e.currentTarget.style.borderColor = "#cc1100"; e.currentTarget.style.color = "#cc1100"; }}
                                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.55)"; e.currentTarget.style.borderColor = "rgba(28,26,27,0.16)"; e.currentTarget.style.color = "#444"; }}
                                    >
                                      <InlineIcon type={chip.icon} />
                                      {chip.label}
                                    </button>
                                  ))}
                                </div>
                              );
                            })()}
                          </>
                        ) : (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p style={{ margin: "4px 0", lineHeight: 1.65 }}>{withIcons(children)}</p>,
                              ul: ({ children }) => <ul style={{ margin: "4px 0", paddingLeft: 16 }}>{children}</ul>,
                              li: ({ children }) => <li style={{ marginBottom: 3 }}>{withIcons(children)}</li>,
                              strong: ({ children }) => <strong style={{ color: "#1d1a1b", fontWeight: 700 }}>{children}</strong>,
                              a: () => null,
                              h2: ({ children }) => <div style={{ fontWeight: 700, fontSize: 13, margin: "10px 0 4px" }}>{withIcons(children)}</div>,
                              h3: ({ children }) => <div style={{ fontWeight: 700, fontSize: 11, color: "#cc1100", margin: "7px 0 2px", textTransform: "uppercase" as const }}>{withIcons(children)}</div>,
                              blockquote: ({ children }) => <blockquote style={{ margin: "6px 0", padding: "5px 10px", borderLeft: "2px solid #cc1100", color: "#666", fontSize: 12 }}>{children}</blockquote>,
                              code: ({ children }) => <code style={{ backgroundColor: "rgba(0,0,0,0.07)", padding: "1px 5px", borderRadius: 3, fontSize: 11, color: "#cc1100" }}>{children}</code>,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", gap: 8 }}>
                <div style={{
                  padding: "11px 15px",
                  borderRadius: "4px 18px 18px 18px",
                  backgroundColor: "#eeeae6",
                  display: "flex", gap: 5, alignItems: "center",
                }}>
                  {[0, 1, 2].map((j) => (
                    <div key={j} style={{
                      width: 6, height: 6, borderRadius: "50%",
                      backgroundColor: "#cc1100",
                      animation: "pulse 1.2s ease-in-out infinite",
                      animationDelay: `${j * 0.18}s`,
                    }} />
                  ))}
                </div>
                {pendingTickers.map((ticker, j) => (
                  <div key={ticker} style={{ opacity: 0, animation: `fadeScaleIn 0.3s ease forwards ${j * 0.08}s` }}>
                    <BubbleInner symbol={ticker} color={symbolColor(ticker)} size={36} />
                  </div>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={{ backgroundColor: "#f0ece8", borderTop: "1px solid rgba(28,26,27,0.1)", flexShrink: 0 }}>
            {/* Quick-action chips + dropdown */}
            <div style={{ display: "flex", gap: 6, padding: "8px 14px 0", flexWrap: "wrap", alignItems: "center", position: "relative" }} ref={menuRef}>
              {QUICK_ACTIONS.slice(0, 2).map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => { sendMessage(chip.msg); setShowActionMenu(false); }}
                  disabled={loading}
                  style={{
                    fontSize: 11, fontWeight: 500,
                    padding: "5px 12px", borderRadius: 20,
                    border: "1px solid rgba(204,17,0,0.35)",
                    backgroundColor: "rgba(204,17,0,0.06)",
                    color: "#cc1100", cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                    transition: "background-color 0.15s, border-color 0.15s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.backgroundColor = "rgba(204,17,0,0.14)"; e.currentTarget.style.borderColor = "#cc1100"; } }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(204,17,0,0.06)"; e.currentTarget.style.borderColor = "rgba(204,17,0,0.35)"; }}
                >
                  {chip.label}
                </button>
              ))}

              {/* More actions dropdown trigger */}
              <button
                onClick={() => setShowActionMenu(v => !v)}
                disabled={loading}
                style={{
                  fontSize: 11, fontWeight: 600,
                  padding: "5px 10px", borderRadius: 20,
                  border: `1px solid ${showActionMenu ? "#cc1100" : "rgba(28,26,27,0.15)"}`,
                  backgroundColor: showActionMenu ? "rgba(204,17,0,0.08)" : "transparent",
                  color: showActionMenu ? "#cc1100" : "#666",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.5 : 1,
                  transition: "all 0.15s", whiteSpace: "nowrap",
                  display: "flex", alignItems: "center", gap: 4,
                }}
              >
                ⚡ More tools
                <span style={{ fontSize: 8 }}>{showActionMenu ? "▲" : "▼"}</span>
              </button>

              {/* Dropdown menu */}
              {showActionMenu && (
                <div style={{
                  position: "absolute", bottom: "calc(100% + 6px)", left: 0,
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(28,26,27,0.12)",
                  borderRadius: 10, boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                  padding: "6px", zIndex: 100,
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: 4, width: "min(460px, 92vw)",
                }}>
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => { sendMessage(action.msg); setShowActionMenu(false); }}
                      disabled={loading}
                      style={{
                        padding: "8px 10px", borderRadius: 7, textAlign: "left",
                        border: "1px solid transparent", backgroundColor: "transparent",
                        fontSize: 12, color: "#2c2a29", cursor: "pointer",
                        transition: "background 0.1s, border-color 0.1s",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#f5f2ee"; e.currentTarget.style.borderColor = "rgba(204,17,0,0.2)"; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ padding: "8px 14px 10px", display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={T.placeholder}
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
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><line x1="2" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="11,4 17,10 11,16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            </div>
          </div>
        </div>

      </div>
      )}

      {/* ── Portfolio Screen ─────────────────────────────────────────────── */}
      {appPhase === "portfolio" && (
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* Left: Portfolio Panel */}
          <div style={{
            width: 340, flexShrink: 0, display: "flex", flexDirection: "column",
            borderRight: "1px solid rgba(28,26,27,0.1)", backgroundColor: "#fafaf8",
            overflow: "hidden",
          }}>
            {/* Panel header */}
            <div style={{
              padding: "14px 16px 10px", borderBottom: "1px solid rgba(28,26,27,0.08)",
              display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1d1a1b", letterSpacing: "-0.01em" }}>
                📊 My Portfolio
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={fetchLivePrices}
                  disabled={fetchingPrices || portfolioPositions.length === 0}
                  title="Refresh prices"
                  style={{
                    padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(28,26,27,0.12)",
                    backgroundColor: "transparent", fontSize: 11, cursor: "pointer",
                    color: "#666", opacity: fetchingPrices ? 0.5 : 1,
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#cc1100"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(28,26,27,0.12)"}
                >
                  {fetchingPrices ? "..." : "↻"}
                </button>
                <button
                  onClick={() => setShowAddForm(v => !v)}
                  style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                    border: "1px solid rgba(204,17,0,0.4)",
                    backgroundColor: showAddForm ? "rgba(204,17,0,0.1)" : "rgba(204,17,0,0.05)",
                    color: "#cc1100", cursor: "pointer",
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(204,17,0,0.12)"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = showAddForm ? "rgba(204,17,0,0.1)" : "rgba(204,17,0,0.05)"}
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Add position form */}
            {showAddForm && (
              <div style={{
                padding: "12px 14px", borderBottom: "1px solid rgba(28,26,27,0.08)",
                backgroundColor: "#ffffff", flexShrink: 0,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#1d1a1b", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Add Position
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 3 }}>Ticker</div>
                    <input
                      value={addTicker}
                      onChange={e => setAddTicker(e.target.value.toUpperCase())}
                      placeholder="AAPL"
                      style={{
                        width: "100%", padding: "6px 8px", borderRadius: 6, boxSizing: "border-box",
                        border: "1px solid rgba(28,26,27,0.15)", fontSize: 12, outline: "none",
                        backgroundColor: "#f5f2ee", color: "#1d1a1b", fontWeight: 600,
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 3 }}>Shares</div>
                    <input
                      value={addShares}
                      onChange={e => setAddShares(e.target.value)}
                      placeholder="10"
                      type="number" min="0"
                      style={{
                        width: "100%", padding: "6px 8px", borderRadius: 6, boxSizing: "border-box",
                        border: "1px solid rgba(28,26,27,0.15)", fontSize: 12, outline: "none",
                        backgroundColor: "#f5f2ee", color: "#1d1a1b",
                      }}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: "#888", marginBottom: 3 }}>Avg cost per share ($)</div>
                  <input
                    value={addCost}
                    onChange={e => setAddCost(e.target.value)}
                    placeholder="150.00"
                    type="number" min="0"
                    style={{
                      width: "100%", padding: "6px 8px", borderRadius: 6, boxSizing: "border-box",
                      border: "1px solid rgba(28,26,27,0.15)", fontSize: 12, outline: "none",
                      backgroundColor: "#f5f2ee", color: "#1d1a1b",
                    }}
                  />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => { setShowAddForm(false); setAddTicker(""); setAddShares(""); setAddCost(""); }}
                    style={{
                      flex: 1, padding: "7px", borderRadius: 6, border: "1px solid rgba(28,26,27,0.15)",
                      backgroundColor: "transparent", fontSize: 11, color: "#666", cursor: "pointer",
                    }}
                  >Cancel</button>
                  <button
                    onClick={addPosition}
                    disabled={!addTicker.trim() || !addShares || !addCost}
                    style={{
                      flex: 2, padding: "7px", borderRadius: 6, border: "none",
                      backgroundColor: addTicker && addShares && addCost ? "#cc1100" : "#ddd",
                      color: addTicker && addShares && addCost ? "#fff" : "#aaa",
                      fontSize: 11, fontWeight: 600, cursor: addTicker && addShares && addCost ? "pointer" : "not-allowed",
                    }}
                  >Add Position →</button>
                </div>
              </div>
            )}

            {/* Positions list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
              {portfolioPositions.length === 0 ? (
                <div style={{ padding: "32px 16px", textAlign: "center", color: "#aaa", fontSize: 12, lineHeight: 1.7 }}>
                  No positions yet.<br/>Click <strong>+ Add</strong> to build your portfolio.
                </div>
              ) : (
                portfolioPositions.map(p => {
                  const lp = livePrices[p.ticker];
                  const cost = p.shares * p.avgCost;
                  const value = lp ? p.shares * lp.price : null;
                  const pnl = value !== null ? value - cost : null;
                  const pnlPct = pnl !== null ? (pnl / cost) * 100 : null;
                  const isUp = pnl !== null && pnl >= 0;
                  return (
                    <div key={p.id} style={{
                      backgroundColor: "#ffffff", borderRadius: 8, padding: "10px 12px",
                      marginBottom: 6, border: "1px solid rgba(28,26,27,0.07)",
                      position: "relative",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                        <BubbleInner symbol={p.ticker} color={symbolColor(p.ticker)} size={30} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#1d1a1b" }}>{p.ticker}</div>
                          {lp?.name && <div style={{ fontSize: 10, color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lp.name}</div>}
                        </div>
                        <button
                          onClick={() => removePosition(p.id)}
                          style={{
                            width: 18, height: 18, borderRadius: "50%", border: "none",
                            backgroundColor: "transparent", color: "#bbb", cursor: "pointer",
                            fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = "#cc1100"}
                          onMouseLeave={e => e.currentTarget.style.color = "#bbb"}
                        >×</button>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        <div style={{ fontSize: 10, color: "#888" }}>
                          {p.shares} sh × ${p.avgCost.toFixed(2)}{" "}
                          <span style={{ color: "#bbb" }}>= ${cost.toFixed(0)}</span>
                        </div>
                        {lp ? (
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#1d1a1b" }}>
                              ${value!.toFixed(0)} <span style={{ fontSize: 10, color: "#888" }}>{lp.currency}</span>
                            </div>
                            <div style={{ fontSize: 10, fontWeight: 600, color: isUp ? "#16a34a" : "#dc2626" }}>
                              {isUp ? "+" : ""}{pnl!.toFixed(0)} ({isUp ? "+" : ""}{pnlPct!.toFixed(1)}%)
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: 10, color: "#bbb" }}>loading…</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Summary footer */}
            {portfolioPositions.length > 0 && (() => {
              const totalCost = portfolioPositions.reduce((s, p) => s + p.shares * p.avgCost, 0);
              const totalValue = portfolioPositions.reduce((s, p) => {
                const lp = livePrices[p.ticker];
                return s + (lp ? p.shares * lp.price : p.shares * p.avgCost);
              }, 0);
              const totalPnl = totalValue - totalCost;
              const totalPct = (totalPnl / totalCost) * 100;
              const isUp = totalPnl >= 0;
              return (
                <div style={{
                  padding: "12px 14px", borderTop: "1px solid rgba(28,26,27,0.08)",
                  backgroundColor: "#ffffff", flexShrink: 0,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: "#888" }}>Cost basis</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#1d1a1b" }}>${totalCost.toLocaleString("en", { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "#888" }}>Current value</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1d1a1b" }}>${totalValue.toLocaleString("en", { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "6px 10px", borderRadius: 6,
                    backgroundColor: isUp ? "rgba(22,163,74,0.07)" : "rgba(220,38,38,0.07)",
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: isUp ? "#16a34a" : "#dc2626" }}>Unrealized P&L</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: isUp ? "#16a34a" : "#dc2626" }}>
                      {isUp ? "+" : ""}${totalPnl.toLocaleString("en", { maximumFractionDigits: 0 })} ({isUp ? "+" : ""}{totalPct.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right: Chat with Fred */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* Portfolio-aware messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
              {messages.length === 0 && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: "40px 20px" }}>
                  <PixelWizard />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#1d1a1b", marginBottom: 6 }}>Ask Fred about your portfolio</div>
                    <div style={{ fontSize: 12, color: "#888", maxWidth: 320, lineHeight: 1.6 }}>
                      Add positions on the left, then ask factual questions about your holdings.
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, width: "100%", maxWidth: 420 }}>
                    {[
                      { text: "What's my portfolio worth right now?", sub: "Live valuation" },
                      { text: "Where am I most concentrated?", sub: "Allocation analysis" },
                      { text: "Which position has the highest return?", sub: "Performance breakdown" },
                      { text: "What sectors am I exposed to?", sub: "Sector distribution" },
                    ].map(s => (
                      <button key={s.text} onClick={() => sendMessage(s.text)} style={{
                        padding: "10px 12px", textAlign: "left", borderRadius: 8,
                        border: "1px solid rgba(28,26,27,0.1)", backgroundColor: "#ffffff",
                        cursor: "pointer", transition: "border-color 0.15s, background 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#cc1100"; e.currentTarget.style.backgroundColor = "#f9f6f3"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(28,26,27,0.1)"; e.currentTarget.style.backgroundColor = "#ffffff"; }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#1d1a1b", marginBottom: 2 }}>{s.text}</div>
                        <div style={{ fontSize: 10, color: "#888" }}>{s.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: 4 }}>
                  <div style={{
                    maxWidth: msg.role === "user" ? "70%" : "82%",
                    padding: msg.role === "user" ? "9px 14px" : "12px 16px",
                    borderRadius: msg.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                    backgroundColor: msg.role === "user" ? "#cc1100" : "#ffffff",
                    border: msg.role === "user" ? "none" : "1px solid rgba(28,26,27,0.09)",
                    color: msg.role === "user" ? "#fff" : "#2c2a29",
                    fontSize: 13, lineHeight: 1.6, wordBreak: "break-word",
                  }}>
                    {msg.role === "user" ? msg.content : (
                      <>
                        {msg.tickers && msg.tickers.length > 0 && (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid rgba(28,26,27,0.07)" }}>
                            {msg.tickers.map((ticker, ti) => (
                              <div key={ticker} style={{ opacity: 0, animation: `fadeScaleIn 0.35s ease forwards ${ti * 0.07}s` }}>
                                <BubbleInner symbol={ticker} color={symbolColor(ticker)} size={36} />
                              </div>
                            ))}
                          </div>
                        )}
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
                          table: ({ children }) => <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 8, fontSize: 12 }}>{children}</table>,
                          th: ({ children }) => <th style={{ padding: "6px 10px", borderBottom: "1px solid rgba(28,26,27,0.1)", textAlign: "left", color: "#666", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{children}</th>,
                          td: ({ children }) => <td style={{ padding: "6px 10px", borderBottom: "1px solid rgba(28,26,27,0.06)", color: "#3a3836" }}>{children}</td>,
                          p: ({ children }) => <p style={{ margin: "6px 0", lineHeight: 1.7 }}>{children}</p>,
                          ul: ({ children }) => <ul style={{ margin: "6px 0", paddingLeft: 16 }}>{children}</ul>,
                          li: ({ children }) => <li style={{ marginBottom: 4, lineHeight: 1.6 }}>{children}</li>,
                          strong: ({ children }) => <strong style={{ color: "#1d1a1b", fontWeight: 700 }}>{children}</strong>,
                          blockquote: ({ children }) => <blockquote style={{ margin: "10px 0 4px", padding: "8px 12px", borderLeft: "2px solid #cc1100", backgroundColor: "rgba(204,17,0,0.04)", borderRadius: "0 4px 4px 0", color: "#666", fontSize: 12 }}>{children}</blockquote>,
                          code: ({ children }) => <code style={{ backgroundColor: "#f0ece8", padding: "1px 5px", borderRadius: 3, fontSize: 12, color: "#cc1100", fontWeight: 600 }}>{children}</code>,
                        }}>{msg.content}</ReactMarkdown>
                      </>
                    )}
                  </div>
                  {msg.role === "assistant" && (() => {
                    const total = (msg.charts?.length || 0) + (msg.analystRatings?.length || 0);
                    if (!total) return null;
                    const isOpen = !!expandedCharts[i + 10000];
                    return (
                      <>
                        <button onClick={() => toggleChart(i + 10000)} style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          fontSize: 11, fontWeight: 500, color: isOpen ? "#cc1100" : "#666",
                          padding: "4px 10px", borderRadius: 6,
                          border: `1px solid ${isOpen ? "rgba(204,17,0,0.35)" : "rgba(28,26,27,0.12)"}`,
                          backgroundColor: isOpen ? "rgba(204,17,0,0.05)" : "transparent",
                          cursor: "pointer", transition: "all 0.15s",
                        }}>
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="1" y="9" width="3" height="6" rx="1" fill="currentColor" opacity="0.6"/><rect x="6" y="5" width="3" height="10" rx="1" fill="currentColor" opacity="0.8"/><rect x="11" y="2" width="3" height="13" rx="1" fill="currentColor"/></svg>
                          {total} visual{total > 1 ? "s" : ""} <span style={{ fontSize: 9 }}>{isOpen ? "▲" : "▼"}</span>
                        </button>
                        {isOpen && <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {msg.charts?.map((chart, ci) => <div key={ci} style={{ width: "min(560px, 92vw)" }}><ChartMessage chart={chart} /></div>)}
                          {msg.analystRatings?.map((r, ri) => <div key={ri}><AnalystRatingsCard data={r} /></div>)}
                        </div>}
                      </>
                    );
                  })()}
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{
                    padding: "10px 14px",
                    borderRadius: "14px 14px 14px 3px",
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(28,26,27,0.09)",
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

            {/* Portfolio chat input */}
            <div style={{ backgroundColor: "#f5f2ee", borderTop: "1px solid rgba(28,26,27,0.1)", padding: "8px 14px 10px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={T.placeholder}
                disabled={loading}
                style={{
                  flex: 1, padding: "9px 14px", borderRadius: 8,
                  border: "1px solid rgba(28,26,27,0.1)", backgroundColor: "#ffffff",
                  color: "#1d1a1b", fontSize: 13, outline: "none",
                  opacity: loading ? 0.6 : 1,
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                style={{
                  width: 34, height: 34, borderRadius: 8, border: "none", flexShrink: 0,
                  backgroundColor: input.trim() && !loading ? "#cc1100" : "#1a1a1a",
                  color: input.trim() && !loading ? "#fff" : "#444",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background 0.15s",
                }}
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><line x1="2" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="11,4 17,10 11,16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes flyToCenter {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          60%  { opacity: 0.5; }
          100% { transform: translate(var(--to-x), var(--to-y)) scale(0.25); opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes orbitCW {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes orbitCCW {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-360deg); }
        }
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.4); }
          to   { opacity: 1; transform: scale(1); }
        }
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
        @keyframes floatingCloud {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-4px) translateX(2px); }
          66% { transform: translateY(2px) translateX(-2px); }
        }
        @keyframes wizardFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmerSlide {
          0%   { transform: translateX(-160%); }
          100% { transform: translateX(260%); }
        }
        @keyframes expandDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes wizardTeleportIn {
          0%   { opacity: 0; transform: scale(0.08) rotate(-18deg); filter: brightness(6) saturate(0.5); }
          25%  { opacity: 1; filter: brightness(2.5); }
          65%  { transform: scale(1.12) rotate(5deg); filter: brightness(1.15); }
          82%  { transform: scale(0.96) rotate(-2deg); filter: brightness(1); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); filter: brightness(1); }
        }
        @keyframes wizardDropIn {
          0%   { opacity: 0; transform: translateY(-55px) scale(0.75); filter: brightness(4); }
          30%  { opacity: 1; filter: brightness(2); transform: translateY(-10px) scale(1.06); }
          60%  { transform: translateY(7px) scale(0.97); filter: brightness(1); }
          80%  { transform: translateY(-3px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: brightness(1); }
        }
        @keyframes wizardSpinIn {
          0%   { opacity: 0; transform: scale(0.05) rotate(-270deg); filter: brightness(5); }
          30%  { opacity: 1; filter: brightness(2); }
          70%  { transform: scale(1.1) rotate(12deg); filter: brightness(1.1); }
          85%  { transform: scale(0.97) rotate(-4deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); filter: brightness(1); }
        }
        @keyframes wizardCelestialRise {
          0%   { opacity: 0; transform: translateY(60px) scale(0.85); filter: brightness(2.5) blur(4px) saturate(0.2); }
          40%  { opacity: 1; filter: brightness(1.8) blur(1px) saturate(0.6); }
          75%  { transform: translateY(-8px) scale(1.04); filter: brightness(1.1) blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: brightness(1) blur(0) saturate(1); }
        }
        @keyframes meteorStreak {
          0%   { transform: translate(500px, -500px) rotate(45deg); opacity: 0; }
          10%  { opacity: 1; }
          95%  { opacity: 1; }
          100% { transform: translate(0px, 0px) rotate(45deg); opacity: 0; }
        }
        @keyframes meteorShockwave {
          0%   { opacity: 1; transform: scale(0.2); border-width: 4px; }
          100% { opacity: 0; transform: scale(10); border-width: 0.1px; }
        }
        @keyframes meteorFlash {
          0%   { opacity: 0; transform: scale(0.1); }
          40%  { opacity: 1; transform: scale(1.4); }
          100% { opacity: 0; transform: scale(2.8); }
        }
        @keyframes wizardImpactIn {
          0%   { opacity: 0; transform: scale(0.1) translateY(-30px); filter: brightness(10); }
          20%  { opacity: 1; transform: scale(1.4) translateY(10px); filter: brightness(3); }
          40%  { transform: scale(0.9) translateY(-5px); }
          60%  { transform: scale(1.05) translateY(2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: brightness(1); }
        }        @keyframes wizardBounceIn {          /* Start: lower-left bubble */
          0%   { transform: translate(-170px, 90px) scaleX(1.22) scaleY(0.82); }
          /* Launch up-right */
          7%   { transform: translate(-145px, 18px) scaleX(0.84) scaleY(1.22); }
          /* Arc peak */
          17%  { transform: translate(-55px, -52px) scaleX(0.9) scaleY(1.12); }
          /* Descend to bubble 2 */
          24%  { transform: translate(75px, 40px); }
          /* Land: right bubble — squish */
          28%  { transform: translate(110px, 75px) scaleX(1.28) scaleY(0.78); }
          /* Launch up-left */
          36%  { transform: translate(88px, -2px) scaleX(0.84) scaleY(1.22); }
          /* Arc peak */
          47%  { transform: translate(18px, -92px) scaleX(0.9) scaleY(1.12); }
          /* Descend to bubble 3 */
          54%  { transform: translate(-55px, -58px); }
          /* Land: upper-left bubble — squish */
          57%  { transform: translate(-75px, -80px) scaleX(1.22) scaleY(0.82); }
          /* Launch toward center */
          65%  { transform: translate(-52px, -142px) scaleX(0.84) scaleY(1.22); }
          /* Arc peak */
          75%  { transform: translate(-10px, -78px) scaleX(0.9) scaleY(1.1); }
          /* Overshoot center */
          85%  { transform: translate(0px, 12px) scaleX(1.18) scaleY(0.86); }
          92%  { transform: translate(0px, -6px) scaleX(0.95) scaleY(1.06); }
          100% { transform: translate(0px, 0px) scaleX(1) scaleY(1); }
        }
        @keyframes scannerSweep {
          0%   { top: -5%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 105%; opacity: 0; }
        }
        @keyframes wizardReveal {
          0%   { clip-path: inset(0 0 100% 0); opacity: 0; }
          10%  { opacity: 1; }
          100% { clip-path: inset(0 0 0 0); opacity: 1; }
        }
        @keyframes scannerGlow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.5) drop-shadow(0 0 8px #cc1100); }
        }
        @keyframes shockwaveRing {
          0%   { transform: translate(-50%, -50%) scale(0.1); opacity: 1; border-width: 4px; }
          100% { transform: translate(-50%, -50%) scale(6); opacity: 0; border-width: 0.1px; }
        }
        @keyframes wizardCastAction {
          0%   { transform: scale(1) translateY(0); filter: brightness(1); }
          20%  { transform: scale(1.5) translateY(-18px) rotate(-8deg); filter: brightness(3) drop-shadow(0 0 16px #cc1100) drop-shadow(0 0 32px #fde047); }
          45%  { transform: scale(1.35) translateY(-14px) rotate(-4deg); filter: brightness(2.5) drop-shadow(0 0 10px #cc1100); }
          70%  { transform: scale(1.1) translateY(-4px) rotate(0deg); filter: brightness(1.5); }
          100% { transform: scale(1) translateY(0); filter: brightness(1); }
        }
        @keyframes wandCharge {
          0%, 100% { transform: translate(-50%, -50%) scale(0.6); opacity: 0.4; }
          50% { transform: translate(-50%, -50%) scale(2.2); opacity: 1; filter: blur(1px); }
        }
        @keyframes castBurst {
          0%   { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
          60%  { transform: translate(-50%, -50%) scale(1.4); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
        }
        @keyframes bubbleShock {
          0%   { transform: translate(0, 0); }
          15%  { transform: translate(var(--shock-x), var(--shock-y)) scale(1.2); }
          50%  { transform: translate(var(--shock-x), var(--shock-y)) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes dustPuff {
          0%   { opacity: 0.85; transform: translate(-50%, -50%) scale(0.15); }
          55%  { opacity: 0.4;  transform: translate(-50%, -50%) scale(1.4); }
          100% { opacity: 0;    transform: translate(-50%, -50%) scale(2.4); }
        }
        @keyframes portalRing {
          0%   { opacity: 1; transform: scale(0.15); }
          100% { opacity: 0; transform: scale(3.2); }
        }
        @keyframes glowBurst {
          0%   { opacity: 0.9; transform: scale(0.3); }
          60%  { opacity: 0.4; transform: scale(1.6); }
          100% { opacity: 0; transform: scale(2.5); }
        }
        @keyframes sparkleFade {
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(0); }
          35%  { opacity: 1; transform: translate(-50%,-50%) scale(1.5); }
          100% { opacity: 0; transform: translate(-50%,-70%) scale(0.6); }
        }
        @keyframes wandGlow {
          0%, 100% { filter: drop-shadow(0 0 2px #fde047); opacity: 1; }
          50% { filter: drop-shadow(0 0 6px #cc1100) drop-shadow(0 0 12px #cc1100); opacity: 0.9; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.2; transform: scale(0.5); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes loadingBarMove {
          0% { left: -40%; width: 40%; }
          50% { left: 40%; width: 60%; }
          100% { left: 100%; width: 40%; }
        }        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(28,26,27,0.1); border-radius: 2px; }
        @keyframes demoBobble {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
        }
        @keyframes demoFadeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.88) translateY(10px); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1) translateY(0px); }
        }
        @keyframes highlightPulse {
          0%, 100% { box-shadow: 0 0 0 9999px rgba(245,242,238,0.86), 0 0 0 2.5px rgba(204,17,0,0.7), 0 0 16px rgba(204,17,0,0.2); }
          50%       { box-shadow: 0 0 0 9999px rgba(245,242,238,0.86), 0 0 0 4px   rgba(204,17,0,0.9), 0 0 28px rgba(204,17,0,0.4); }
        }
      `}</style>

      {/* ── Demo overlay ──────────────────────────────────────────────────── */}
      {demoStep !== null && (() => {
        const activeDemoSteps = buildDemoSteps(lang);
        const step = activeDemoSteps[demoStep];
        const isLast = demoStep === activeDemoSteps.length - 1;
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 9000, pointerEvents: "none" }}>
            {/* Backdrop — plain dim, NO blur so highlighted elements stay sharp */}
            <div
              style={{
                position: "absolute", inset: 0,
                backgroundColor: step.highlightId ? "transparent" : "rgba(245,242,238,0.82)",
                pointerEvents: "auto",
              }}
              onClick={() => setDemoStep(null)}
            />

            {/* Spotlight — box-shadow punches a clear hole around the target, dims everything else */}
            {step.highlightId && (() => {
              const el = document.getElementById(step.highlightId);
              if (!el) return null;
              const r = el.getBoundingClientRect();
              return (
                <div
                  onClick={() => setDemoStep(null)}
                  style={{
                    position: "fixed",
                    left: r.left - 10, top: r.top - 10,
                    width: r.width + 20, height: r.height + 20,
                    borderRadius: 12,
                    boxShadow: "0 0 0 9999px rgba(245,242,238,0.86), 0 0 0 2.5px rgba(204,17,0,0.7), 0 0 20px rgba(204,17,0,0.25)",
                    animation: "highlightPulse 1.8s ease-in-out infinite",
                    zIndex: 9001,
                    pointerEvents: "auto",
                  }}
                />
              );
            })()}

            {/* Floating Fred + speech bubble */}
            <div style={{
              position: "fixed",
              left: step.fredLeft, top: step.fredTop,
              transform: "translate(-50%, -50%)",
              animation: "demoBobble 2.5s ease-in-out infinite",
              pointerEvents: "none",
              zIndex: 9002,
              display: "flex", flexDirection: "column", alignItems: "center",
            }}>
              {/* Speech bubble above Fred */}
              <div style={{
                backgroundColor: "#fff",
                border: "1.5px solid rgba(204,17,0,0.3)",
                borderRadius: 16,
                padding: "14px 18px",
                maxWidth: 280,
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                marginBottom: 12,
                textAlign: "center",
                animation: "demoFadeIn 0.35s ease forwards",
                position: "relative",
              }}>
                <div style={{ fontSize: 12.5, color: "#1d1a1b", lineHeight: 1.65 }}>
                  {step.text}
                </div>
                {/* Bubble tail */}
                <div style={{
                  position: "absolute", bottom: -7, left: "50%", transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "7px solid transparent", borderRight: "7px solid transparent",
                  borderTop: "7px solid rgba(204,17,0,0.3)",
                }} />
                <div style={{
                  position: "absolute", bottom: -5.5, left: "50%", transform: "translateX(-50%)",
                  width: 0, height: 0,
                  borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
                  borderTop: "6px solid #fff",
                }} />
              </div>

              {/* Fred */}
              <div style={{ transform: step.flip ? "scaleX(-1)" : "none", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.18))" }}>
                <PixelWizard width="64" height="90" />
              </div>

              {/* Step dots */}
              <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
                {activeDemoSteps.map((_, i) => (
                  <div key={i} style={{
                    width: i === demoStep ? 14 : 6, height: 6, borderRadius: 3,
                    backgroundColor: i === demoStep ? "#cc1100" : "rgba(28,26,27,0.2)",
                    transition: "all 0.3s ease",
                  }} />
                ))}
              </div>
            </div>

            {/* Control buttons */}
            <div style={{
              position: "fixed", bottom: 36, left: "50%", transform: "translateX(-50%)",
              display: "flex", gap: 10, pointerEvents: "auto", zIndex: 9003,
            }}>
              <button
                onClick={() => setDemoStep(null)}
                style={{
                  padding: "9px 20px", borderRadius: 8, fontSize: 12,
                  border: "1px solid rgba(28,26,27,0.15)", backgroundColor: "#fff",
                  color: "#555", cursor: "pointer",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                }}
              >
                {T.skipBtn}
              </button>
              <button
                onClick={() => isLast ? setDemoStep(null) : setDemoStep(demoStep + 1)}
                style={{
                  padding: "9px 24px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  border: "none", backgroundColor: "#cc1100",
                  color: "#fff", cursor: "pointer",
                  boxShadow: "0 2px 12px rgba(204,17,0,0.35)",
                }}
              >
                {isLast ? T.letsGoBtn : T.nextBtn}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
