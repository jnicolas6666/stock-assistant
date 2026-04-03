"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  TrendingUp, Send, BarChart2, LineChart as LineChartIcon, Newspaper,
  Brain, Search, ChevronRight, Activity, DollarSign,
  Users, Clock,
} from "lucide-react";
import {
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

type ChartSpec = {
  type: "line" | "bar" | "area";
  title: string;
  data: Record<string, any>[];
  xKey: string;
  series: { key: string; name: string; color: string }[];
};

type Message = { role: "user" | "assistant"; content: string; charts?: ChartSpec[] };

const SUGGESTIONS = [
  { text: "Show TD Bank's price chart (3 months)", sub: "Price history · TD.TO", icon: "LineChart" },
  { text: "Compare Canadian banks P/E ratios", sub: "Peer comparison · Big 6", icon: "BarChart2" },
  { text: "TD Bank earnings vs estimates", sub: "8 quarters · EPS history", icon: "Activity" },
  { text: "What do analysts think of TD?", sub: "Analyst consensus · Ratings", icon: "Brain" },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  LineChart: <LineChartIcon size={16} color="#e05520" />,
  BarChart2: <BarChart2 size={16} color="#e05520" />,
  Activity: <Activity size={16} color="#e05520" />,
  Brain: <Brain size={16} color="#e05520" />,
};

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
  const gridStyle = { stroke: "rgba(255,255,255,0.05)" };
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#111",
      border: "1px solid rgba(255,255,255,0.1)",
      color: "#e5e5e5",
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
      backgroundColor: "#0a0a0a",
      border: "1px solid rgba(255,255,255,0.08)",
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
      setMessages([...newMessages, { role: "assistant", content: data.content, charts: data.charts || [] }]);
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#000" }}>
      {/* Header */}
      <header style={{
        height: 52,
        padding: "0 20px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: "#e05520",
            borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <TrendingUp size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5", letterSpacing: "-0.01em" }}>
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
          border: "1px solid rgba(255,255,255,0.08)",
          letterSpacing: "0.02em",
        }}>
          EDUCATIONAL USE ONLY
        </div>
      </header>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", maxWidth: 520, width: "100%", padding: "0 16px" }}>
            <div style={{
              width: 48, height: 48, background: "#111",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, margin: "0 auto 16px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <TrendingUp size={22} color="#e05520" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 6, color: "#f5f5f5", letterSpacing: "-0.02em" }}>
              Market Assistant
            </div>
            <div style={{ color: "#555", marginBottom: 28, fontSize: 13 }}>
              Ask about stocks, earnings, analyst views, or market trends.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxWidth: 480, margin: "0 auto" }}>
              {SUGGESTIONS.map((s) => (
                <button key={s.text} onClick={() => sendMessage(s.text)} style={{
                  padding: "12px 14px",
                  textAlign: "left",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  backgroundColor: "#111",
                  cursor: "pointer",
                  width: "100%",
                  transition: "border-color 0.15s, background 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#e05520"; e.currentTarget.style.backgroundColor = "#1a1a1a"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.backgroundColor = "#111"; }}
                >
                  <div style={{ marginBottom: 6 }}>{ICON_MAP[s.icon]}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "#f5f5f5", lineHeight: 1.4 }}>{s.text}</div>
                  <div style={{ fontSize: 11, color: "#555", marginTop: 3 }}>{s.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

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
              backgroundColor: msg.role === "user" ? "#e05520" : "#111",
              border: msg.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)",
              color: msg.role === "user" ? "#fff" : "#e5e5e5",
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
                      <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 8, fontSize: 13 }}>{children}</table>
                    ),
                    th: ({ children }) => (
                      <th style={{ padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.08)", textAlign: "left", color: "#888", fontWeight: 600 }}>{children}</th>
                    ),
                    td: ({ children }) => (
                      <td style={{ padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#e5e5e5" }}>{children}</td>
                    ),
                    p: ({ children }) => <p style={{ margin: "4px 0", lineHeight: 1.6 }}>{children}</p>,
                    ul: ({ children }) => <ul style={{ margin: "6px 0", paddingLeft: 18 }}>{children}</ul>,
                    li: ({ children }) => <li style={{ marginBottom: 3 }}>{children}</li>,
                    strong: ({ children }) => <strong style={{ color: "#f5f5f5", fontWeight: 600 }}>{children}</strong>,
                    h3: ({ children }) => <h3 style={{ margin: "10px 0 4px", fontSize: 14, color: "#f5f5f5", fontWeight: 600 }}>{children}</h3>,
                    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#e05520", textDecoration: "underline" }}>{children}</a>,
                    blockquote: ({ children }) => <blockquote style={{ margin: "8px 0", paddingLeft: 12, borderLeft: "3px solid #e05520", color: "#888" }}>{children}</blockquote>,
                    code: ({ children }) => <code style={{ backgroundColor: "#1a1a1a", padding: "1px 5px", borderRadius: 3, fontSize: 12, color: "#e05520" }}>{children}</code>,
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
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "10px 14px",
              borderRadius: "14px 14px 14px 3px",
              backgroundColor: "#111",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex", gap: 4, alignItems: "center",
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: "50%",
                  backgroundColor: "#e05520",
                  animation: "pulse 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.18}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "10px 14px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        backgroundColor: "#000",
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
            border: "1px solid rgba(255,255,255,0.1)",
            backgroundColor: "#111",
            color: "#f5f5f5",
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
            backgroundColor: input.trim() && !loading ? "#e05520" : "#1a1a1a",
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

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.75); }
          40% { opacity: 1; transform: scale(1); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>
    </div>
  );
}
