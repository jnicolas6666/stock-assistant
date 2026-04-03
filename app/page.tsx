"use client";

import { useState, useRef, useEffect } from "react";
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
  "Show TD Bank's price chart (3 months)",
  "Compare P/E ratios of Canadian banks",
  "TD Bank earnings history",
  "What do analysts think of TD?",
];

function ChartMessage({ chart }: { chart: ChartSpec }) {
  const height = 260;
  const commonProps = {
    data: chart.data,
    margin: { top: 10, right: 20, left: 10, bottom: 5 },
  };
  const axisStyle = { fill: "#9ca3af", fontSize: 11 };
  const gridStyle = { stroke: "#1f2937" };

  function renderChart() {
    if (chart.type === "line") {
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
          <XAxis dataKey={chart.xKey} tick={axisStyle} />
          <YAxis tick={axisStyle} />
          <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", color: "#f9fafb" }} />
          <Legend />
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
          <YAxis tick={axisStyle} />
          <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", color: "#f9fafb" }} />
          <Legend />
          {chart.series.map((s) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} fill={s.color + "33"} strokeWidth={2} />
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
        <Tooltip contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", color: "#f9fafb" }} />
        <Legend />
        {chart.series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color} radius={[3, 3, 0, 0]} />
        ))}
      </BarChart>
    );
  }

  return (
    <div style={{ marginTop: 12, backgroundColor: "#111827", borderRadius: 12, padding: "14px 16px", border: "1px solid #1f2937" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#9ca3af", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Header */}
      <div style={{
        padding: "12px 20px",
        borderBottom: "1px solid #1f2937",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#111827",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>M</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>Market Assistant</div>
            <div style={{ fontSize: 11, color: "#6b7280" }}>Powered by Claude AI</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#4b5563", maxWidth: 300, textAlign: "right" }}>
          For informational purposes only. Not investment advice.
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", maxWidth: 500 }}>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Market Assistant</div>
            <div style={{ color: "#9ca3af", marginBottom: 28, fontSize: 14 }}>
              Ask me about stocks, ETFs, market concepts, analyst views, and more.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 20,
                    border: "1px solid #374151",
                    backgroundColor: "#1f2937",
                    color: "#d1d5db",
                    cursor: "pointer",
                    fontSize: 13,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#374151")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f2937")}
                >
                  {s}
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
              maxWidth: "72%",
              padding: "10px 14px",
              borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              backgroundColor: msg.role === "user" ? "#2563eb" : "#1f2937",
              color: "#f9fafb",
              fontSize: 14,
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}>
              {msg.content}
            </div>
            {msg.role === "assistant" && msg.charts && msg.charts.length > 0 && msg.charts.map((chart, ci) => (
              <div key={ci} style={{ width: "min(600px, 90vw)" }}>
                <ChartMessage chart={chart} />
              </div>
            ))}
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "12px 16px",
              borderRadius: "18px 18px 18px 4px",
              backgroundColor: "#1f2937",
              display: "flex",
              gap: 5,
              alignItems: "center",
            }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: "50%", backgroundColor: "#6b7280",
                  animation: "pulse 1.2s ease-in-out infinite",
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
        backgroundColor: "#111827",
        flexShrink: 0,
        display: "flex",
        gap: 10,
        alignItems: "center",
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about a stock, ETF, or market concept..."
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px 16px",
            borderRadius: 24,
            border: "1px solid #374151",
            backgroundColor: "#1f2937",
            color: "#f9fafb",
            fontSize: 14,
            outline: "none",
            opacity: loading ? 0.6 : 1,
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          style={{
            padding: "10px 18px",
            borderRadius: 24,
            border: "none",
            backgroundColor: loading || !input.trim() ? "#374151" : "#2563eb",
            color: "#f9fafb",
            cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 500,
            transition: "background 0.15s",
          }}
        >
          Send
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
