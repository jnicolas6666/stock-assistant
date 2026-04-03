import Anthropic from "@anthropic-ai/sdk";
import { toolDefinitions, handleToolCall } from "@/lib/tools";
import { NextRequest, NextResponse } from "next/server";

const isMockMode = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your_api_key_here";
const client = isMockMode ? null : new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a financial information assistant for a Canadian self-directed brokerage.
You help retail clients understand stocks, ETFs, and general investing concepts.

STRICT RULES:
- You are EDUCATIONAL ONLY. Never recommend buying, selling, or holding any specific security.
- Never tell a client what to do with their money.
- You CAN discuss: current market data, analyst consensus ratings (as factual data points), recent news headlines, what financial metrics mean, and general market concepts.
- When discussing analyst consensus, always clarify it reflects analyst opinions, not a personal recommendation for the user.
- When asked about a specific stock or ETF, use get_quote to fetch live data first.
- If you don't recognize the ticker symbol, use search_ticker first to find it.

SENTIMENT / OPINION QUESTIONS — whenever a user asks about general opinion, sentiment, outlook, analyst views, "what do people think", "is it a good stock", "what's the market saying", or anything correlated with recent events:
  1. Automatically call get_quote + get_analyst_data + get_news IN PARALLEL (all three, every time)
  2. Then write a structured response with these sections:
     - **Price Snapshot**: key metrics (price, change, 52-week range, market cap, P/E, dividend yield). Note the narrative — e.g. "trading near 52-week high after recovering X% from its low".
     - **News & Recent Context**: synthesize the news summaries into 3-5 sentences of insight. What themes are emerging? Any catalysts or risks? What does the absence of bad news signal? Reference headlines with dates but do not list them as a plain bullet dump.
     - **Analyst Sentiment**: present the buy/hold/sell breakdown in a small table. Then interpret: is the consensus stable, improving, or deteriorating month-over-month? What might explain the hold/sell minority? Give 2-3 sentences of context.
     - **Putting It Together**: 3-4 sentence synthesis correlating price action + news tone + analyst stance into one coherent view. Use language like "cautiously optimistic", "recovery phase", "priced for stability", etc.
     - End with the standard disclaimer (1 line, italic or blockquote).
  3. Do NOT wait for the user to ask for each piece separately — proactively fetch and synthesize all three.

- For analyst sentiment alone (not a full opinion question), use get_analyst_data. DO NOT just list raw numbers — interpret the consensus, note MoM change, give context. Always note this reflects analyst opinions, not a personal recommendation.
- For recent news alone, use get_news. Synthesize key themes from summaries — do not dump headlines. If empty/unrelated, say "No relevant news right now."
- NEVER provide links to external websites. Use your tools. If data is unavailable, say so plainly.
- Canadian ETFs on TSX use the .TO suffix (e.g. XIC.TO, VFV.TO, ZCN.TO).
- Keep answers concise and clear — your audience is a retail investor, not a professional.
- Always note whether prices are in USD or CAD.
- Format numbers clearly: prices to 2 decimals, percentages with % sign, large numbers in millions/billions.
- For any question about stock price history, earnings trends, or comparisons: use generate_chart to visualize the data.
- For peer comparison: fetch fundamentals for each peer separately using get_fundamentals, then call generate_chart with all peers' data side by side.
- When you have numeric data that would be clearer as a chart, always use generate_chart.
- Available chart types: "line" for price history, "area" for price history with fill, "bar" for comparisons and distributions.
- For generate_chart data array: each item must be a flat object. For price history: [{ date: "Jan 1", close: 150.5 }, ...]. For comparisons: [{ metric: "P/E", AAPL: 28.5, MSFT: 32.1 }, ...].
- Colors to use in series: #e05520 (primary/accent), #888888 (secondary), #22c55e (positive/green), #ef4444 (negative/red), #3b82f6 (blue), #a855f7 (purple).`;

type ChartSpec = {
  type: "line" | "bar" | "area";
  title: string;
  data: Record<string, any>[];
  xKey: string;
  series: { key: string; name: string; color: string }[];
};

function getMockResponse(userMessage: string): { content: string; charts: ChartSpec[] } {
  const msg = userMessage.toLowerCase();

  if (msg.includes("price") || msg.includes("chart") || msg.includes("history")) {
    return {
      content: "Here is TD Bank's (TD.TO) price history over the last 3 months on the TSX. The stock traded between $74 and $84 CAD, showing pressure in January before stabilizing through Q1 2025. (Mock data — add your API key to see live data.)",
      charts: [{
        type: "area",
        title: "TD.TO Price History — 3 Months (Mock, CAD)",
        xKey: "date",
        data: [
          { date: "Jan 2", close: 82.14 }, { date: "Jan 9", close: 80.87 }, { date: "Jan 16", close: 79.43 },
          { date: "Jan 23", close: 76.90 }, { date: "Jan 30", close: 74.55 }, { date: "Feb 6", close: 75.82 },
          { date: "Feb 13", close: 77.14 }, { date: "Feb 20", close: 78.63 }, { date: "Feb 27", close: 79.90 },
          { date: "Mar 6", close: 80.45 }, { date: "Mar 13", close: 78.92 }, { date: "Mar 20", close: 81.37 },
          { date: "Mar 27", close: 83.10 }, { date: "Apr 1", close: 82.76 },
        ],
        series: [{ key: "close", name: "TD.TO (CAD)", color: "#3b82f6" }],
      }],
    };
  }

  if (msg.includes("compare") || msg.includes("p/e") || msg.includes("peer") || msg.includes("bank")) {
    return {
      content: "Here's a P/E ratio comparison across Canada's Big 6 banks. TD and RBC trade at similar multiples, while BNS has the most compressed valuation, reflecting ongoing restructuring concerns. (Mock data — add your API key to see live data.)",
      charts: [{
        type: "bar",
        title: "P/E Ratio — Canadian Big 6 Banks (Mock)",
        xKey: "bank",
        data: [
          { bank: "TD", PE: 13.2 }, { bank: "RY", PE: 13.8 },
          { bank: "BNS", PE: 10.4 }, { bank: "BMO", PE: 12.1 },
          { bank: "CM", PE: 11.7 }, { bank: "NA", PE: 12.9 },
        ],
        series: [{ key: "PE", name: "P/E Ratio", color: "#3b82f6" }],
      }],
    };
  }

  if (msg.includes("earnings") || msg.includes("eps")) {
    return {
      content: "TD Bank has broadly met analyst EPS estimates over the last 8 quarters, though Q1 and Q2 2024 came in below expectations due to higher provisions for credit losses tied to U.S. regulatory issues. (Mock data — add your API key to see live data.)",
      charts: [{
        type: "bar",
        title: "TD.TO Quarterly EPS — Actual vs Estimate (Mock, CAD)",
        xKey: "quarter",
        data: [
          { quarter: "Q1 2023", actual: 2.02, estimate: 1.98 }, { quarter: "Q2 2023", actual: 1.94, estimate: 1.96 },
          { quarter: "Q3 2023", actual: 1.97, estimate: 1.95 }, { quarter: "Q4 2023", actual: 1.83, estimate: 1.87 },
          { quarter: "Q1 2024", actual: 1.35, estimate: 1.78 }, { quarter: "Q2 2024", actual: 1.62, estimate: 1.80 },
          { quarter: "Q3 2024", actual: 1.97, estimate: 1.94 }, { quarter: "Q4 2024", actual: 2.04, estimate: 2.01 },
        ],
        series: [
          { key: "actual", name: "Actual EPS (CAD)", color: "#3b82f6" },
          { key: "estimate", name: "Estimate", color: "#6b7280" },
        ],
      }],
    };
  }

  if (msg.includes("analyst") || msg.includes("target") || msg.includes("consensus") || msg.includes("td")) {
    return {
      content: "Analyst consensus on TD Bank (TD.TO) is cautiously positive. Out of 16 analysts covering the stock:\n- 9 have a Buy or Outperform rating\n- 6 have a Hold / Sector Perform\n- 1 has an Underperform\n\nConsensus 12-month price target: $88.50 CAD (range: $79 – $98)\nCurrent price: ~$83 CAD — implying ~7% upside to the mean target.\n\nKey concern: U.S. AML consent order and strategic repositioning. Note: This reflects analyst opinions, not a personal recommendation for you. (Mock data — add your API key to see live data.)",
      charts: [{
        type: "bar",
        title: "TD.TO Analyst Rating Distribution (Mock)",
        xKey: "rating",
        data: [
          { rating: "Buy", count: 6 }, { rating: "Outperform", count: 3 },
          { rating: "Hold", count: 5 }, { rating: "Sector Perform", count: 1 },
          { rating: "Underperform", count: 1 },
        ],
        series: [{ key: "count", name: "# of Analysts", color: "#10b981" }],
      }],
    };
  }

  return {
    content: "Welcome to Market Assistant — running in demo mode.\n\nTry asking:\n• \"Show TD Bank's price chart\"\n• \"Compare P/E ratios of Canadian banks\"\n• \"TD earnings history\"\n• \"What do analysts think of TD?\"\n\nAdd your ANTHROPIC_API_KEY to .env.local to enable live AI responses with real market data.",
    charts: [],
  };
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  if (isMockMode) {
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    const userText = typeof lastUserMsg?.content === "string" ? lastUserMsg.content : "";
    await new Promise((r) => setTimeout(r, 800)); // simulate latency
    return NextResponse.json(getMockResponse(userText));
  }

  // Strip frontend-only fields (e.g. charts) — Claude only accepts role + content
  let loopMessages = messages.map((m: any) => ({ role: m.role, content: m.content }));
  let iterations = 0;
  const MAX_ITERATIONS = 10;
  const charts: ChartSpec[] = [];

  try {
  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await client!.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools: toolDefinitions as any,
      messages: loopMessages,
    });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      const text = textBlock && textBlock.type === "text" ? textBlock.text : "";
      return NextResponse.json({ content: text, charts });
    }

    if (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");

      // Append Claude's assistant message (with tool_use blocks)
      loopMessages.push({ role: "assistant", content: response.content });

      // Process tool calls — generate_chart is handled specially
      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block) => {
          if (block.type !== "tool_use") return null;

          if (block.name === "generate_chart") {
            // Capture chart spec and return ok so Claude continues
            charts.push(block.input as unknown as ChartSpec);
            return {
              type: "tool_result" as const,
              tool_use_id: block.id,
              content: JSON.stringify({ ok: true }),
            };
          }

          const result = await handleToolCall(block.name, block.input as Record<string, any>);
          return {
            type: "tool_result" as const,
            tool_use_id: block.id,
            content: JSON.stringify(result),
          };
        })
      );

      loopMessages.push({
        role: "user",
        content: toolResults.filter(Boolean) as any,
      });

      continue;
    }

    // Unexpected stop reason
    break;
  }

  return NextResponse.json({ content: "I'm sorry, I couldn't process your request.", charts });
  } catch (e: any) {
    console.error("Chat route error:", e);
    return NextResponse.json(
      { content: `Something went wrong: ${e?.message ?? "unknown error"}. Please try again.`, charts: [] },
      { status: 200 } // return 200 so the frontend renders the message instead of throwing
    );
  }
}
