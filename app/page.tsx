"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  { text: "Show TD Bank's price chart (3 months)", sub: "Price history · TD.TO" },
  { text: "Compare Canadian banks P/E ratios", sub: "Peer comparison · Big 6" },
  { text: "TD Bank earnings vs estimates", sub: "8 quarters · EPS history" },
  { text: "What do analysts think of TD?", sub: "Analyst consensus · Price targets" },
];

function formatYAxis(value: number) {
  return `$${value}`;
}

function ChartMessage({ chart }: { chart: ChartSpec }) {
  const height = 240;
  const commonProps = {
    data: chart.data,
    margin: { top: 10, right: 20, left: 10, bottom: 5 },
  };
  const axisStyle = { fill: "#6e7681", fontSize: 11 };
  const gridStyle = { stroke: "#21262d" };
  const tooltipStyle = {
    contentStyle: {
      backgroundColor: "#161b22",
      border: "1px solid #30363d",
      color: "#e6edf3",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 12,
    },
    labelStyle: { color: "#8b949e", marginBottom: 4 },
  };

  // Determine if this looks like a price chart (has a "close" or "price" series key)
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
          <Legend wrapperStyle={{ fontSize: 12, color: "#8b949e" }} />
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
          <Legend wrapperStyle={{ fontSize: 12, color: "#8b949e" }} />
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
        <Legend wrapperStyle={{ fontSize: 12, color: "#8b949e" }} />
        {chart.series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    );
  }

  return (
    <div style={{
      marginTop: 12,
      backgroundColor: "#0d1117",
      borderRadius: 10,
      padding: "14px 16px",
      border: "1px solid #21262d",
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        color: "#6e7681",
        marginBottom: 12,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#0d1117" }}>
      {/* Header */}
      <div style={{
        padding: "0 24px",
        height: 56,
        borderBottom: "1px solid #1f2937",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backgroundColor: "#0d1117",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #1d4ed8, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 15, fontWeight: 700, color: "#fff",
          }}>M</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em" }}>Market Assistant</div>
            <div style={{ fontSize: 11, color: "#4b5563", marginTop: -1 }}>Powered by Claude AI · Real-time data</div>
          </div>
        </div>
        <div style={{
          fontSize: 11, color: "#4b5563",
          padding: "4px 10px", borderRadius: 20,
          border: "1px solid #1f2937",
        }}>
          Educational use only · Not investment advice
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", maxWidth: 560, width: "100%" }}>
            <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.02em", color: "#e6edf3" }}>
              Market Assistant
            </div>
            <div style={{ color: "#6e7681", marginBottom: 32, fontSize: 14, lineHeight: 1.6 }}>
              Ask about stocks, ETFs, earnings, analyst views, and more.
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              maxWidth: 520,
              margin: "0 auto",
            }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.text}
                  onClick={() => sendMessage(s.text)}
                  style={{
                    padding: "12px 16px", textAlign: "left",
                    borderRadius: 10, border: "1px solid #21262d",
                    backgroundColor: "#161b22", color: "#e6edf3",
                    cursor: "pointer", fontSize: 13, width: "100%",
                    transition: "border-color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#388bfd")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#21262d")}
                >
                  <div style={{ fontWeight: 500 }}>{s.text}</div>
                  <div style={{ fontSize: 11, color: "#6e7681", marginTop: 3 }}>{s.sub}</div>
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
              maxWidth: msg.role === "user" ? "68%" : "78%",
              padding: msg.role === "user" ? "10px 14px" : "14px 18px",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              backgroundColor: msg.role === "user" ? "#2563eb" : "#161b22",
              border: msg.role === "user" ? "none" : "1px solid #21262d",
              boxShadow: msg.role === "user" ? "0 1px 3px rgba(0,0,0,0.3)" : "none",
              color: "#e6edf3",
              fontSize: 14,
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
                      <th style={{ padding: "6px 10px", borderBottom: "1px solid #374151", textAlign: "left", color: "#9ca3af", fontWeight: 600 }}>{children}</th>
                    ),
                    td: ({ children }) => (
                      <td style={{ padding: "6px 10px", borderBottom: "1px solid #1f2937", color: "#e5e7eb" }}>{children}</td>
                    ),
                    p: ({ children }) => <p style={{ margin: "4px 0", lineHeight: 1.6 }}>{children}</p>,
                    ul: ({ children }) => <ul style={{ margin: "6px 0", paddingLeft: 18 }}>{children}</ul>,
                    li: ({ children }) => <li style={{ marginBottom: 3 }}>{children}</li>,
                    strong: ({ children }) => <strong style={{ color: "#f9fafb", fontWeight: 600 }}>{children}</strong>,
                    h3: ({ children }) => <h3 style={{ margin: "10px 0 4px", fontSize: 14, color: "#f9fafb", fontWeight: 600 }}>{children}</h3>,
                    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "underline" }}>{children}</a>,
                    blockquote: ({ children }) => <blockquote style={{ margin: "8px 0", paddingLeft: 12, borderLeft: "3px solid #374151", color: "#9ca3af" }}>{children}</blockquote>,
                    code: ({ children }) => <code style={{ backgroundColor: "#1f2937", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>{children}</code>,
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
              padding: "12px 18px",
              borderRadius: "18px 18px 18px 4px",
              backgroundColor: "#161b22",
              border: "1px solid #21262d",
              display: "flex",
              gap: 5,
              alignItems: "center",
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: "50%", backgroundColor: "#6e7681",
                  animation: "bounce 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #1f2937",
        backgroundColor: "#0d1117",
        flexShrink: 0,
        display: "flex",
        gap: 10,
        alignItems: "center",
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about a stock, ETF, or market concept... (Enter to send)"
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 10,
            border: "1px solid #21262d",
            backgroundColor: "#161b22",
            color: "#e6edf3",
            fontSize: 14,
            outline: "none",
            opacity: loading ? 0.6 : 1,
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{
            width: 36, height: 36,
            borderRadius: "50%",
            border: "none",
            backgroundColor: loading || !input.trim() ? "#21262d" : "#2563eb",
            color: loading || !input.trim() ? "#6e7681" : "#fff",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.15s",
          }}
          aria-label="Send"
        >
          ↑
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #21262d; border-radius: 3px; }
      `}</style>
    </div>
  );
}
