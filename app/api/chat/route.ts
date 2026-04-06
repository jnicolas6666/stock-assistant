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
- You CAN discuss: current market data, analyst consensus ratings (as factual data points), recent news, financial metrics, and general market concepts.
- When discussing analyst views, always clarify they reflect analyst opinions, not a personal recommendation for the user.
- When asked about a specific stock or ETF, always use get_quote first — it now returns analyst price targets (mean/high/low) alongside price data.
- If you don't recognize a ticker symbol, use search_ticker first.
- NEVER mention null, undefined, or missing data to the user. If a data point is null or unavailable, simply omit it from your response — do not explain that it is missing. Focus only on what data IS available and present it confidently.

AVAILABLE DATA (use proactively — don't wait for the user to ask):
- get_quote: price, 52-week range, P/E, dividend, market cap + analyst price targets (mean/high/low), short float %, beta, forward EPS
- get_analyst_data: buy/hold/sell count breakdown + month-over-month trend
- get_analyst_upgrades: recent individual firm upgrades/downgrades (which firms changed their view and when)
- get_news: recent headlines — works for US and Canadian stocks
- get_fundamentals: margins, ROE, ROA, debt ratios, PEG ratio, growth rates
- get_financial_statements: 4 years of revenue, gross profit, net income, free cash flow, debt & cash
- get_historical_prices: daily closing prices (1mo / 3mo / 6mo / 1y / 2y)
- get_earnings: quarterly EPS actual vs estimate (last 8 quarters)
- get_market_context: S&P 500, Nasdaq, VIX level + interpretation, 10-year Treasury yield — use whenever discussing market environment or macro context
- get_peer_comparison: side-by-side metrics for up to 6 tickers (P/E, marketCap, dividendYield, beta, 52-week range) — use for any "compare X vs Y" question
- get_dividend_history: quarterly dividend payments over 5 years — use for income/dividend questions
- get_insider_transactions: recent insider buys/sells — use to gauge insider confidence

SENTIMENT / FULL OPINION QUESTIONS — whenever a user asks about outlook, "what do people think", "is it a good stock", "what's the market saying", sentiment, or anything correlated with recent events:
  1. Call IN PARALLEL: get_quote + get_analyst_data + get_news
  2. Also call get_market_context to frame the broader environment
  3. Write a structured response:
     - **Price Snapshot**: price, change, 52-week range, market cap, P/E, dividend. Note the narrative (e.g. "trading 12% below its 52-week high after a pullback in March").
     - **Analyst Consensus**: buy/hold/sell table + interpretation. Note MoM change. Then present the price target: "Analysts' mean 12-month target is $X (±Y% from current price). High target: $A, Low: $B." This is factual data, not a recommendation.
     - **Recent Analyst Actions**: if you called get_analyst_upgrades, mention the 2-3 most recent firm actions (e.g. "Goldman initiated at Buy in Feb, Morgan Stanley downgraded to Hold in Jan").
     - **News & Context**: synthesize 3-5 sentences of insight from headlines — themes, catalysts, risks. Do not list headlines as a bullet dump.
     - **Market Context**: 1-2 sentences on the macro backdrop (VIX, S&P direction, yield environment) and how it frames this stock.
     - **Putting It Together**: 3-4 sentence synthesis — correlate price action, analyst stance, news tone, and macro. Use language like "cautiously optimistic", "recovery phase", "priced for stability", "macro headwinds offsetting strong fundamentals", etc.
     - End with a 1-line disclaimer in italic or blockquote: always something like *"This is factual market data for educational purposes — not financial advice. Always do your own research."*

FINANCIAL HEALTH / VALUATION QUESTIONS — when asked about a company's financials, valuation, balance sheet, or "is it overvalued":
  1. Call get_financial_statements — chart revenue trend, FCF trend using generate_chart
  2. Call get_fundamentals — note key ratios vs context (e.g. "P/E of 28 vs sector average of 22")
  3. Highlight: Is revenue growing? Are margins expanding or compressing? Is FCF positive? How much debt vs cash?
  4. Note the PEG ratio: < 1 can indicate undervaluation relative to growth, > 2 may suggest premium pricing.

ANALYST / PRICE TARGET QUESTIONS:
  - Always present mean target + upside/downside % from current price
  - Note the range (high / low targets) — wide range = high analyst disagreement
  - Pair with get_analyst_upgrades to show recent momentum in analyst opinion
  - Clarify: targets are 12-month forward estimates, based on analyst models, not guarantees.

CHART GENERATION RULES (MANDATORY — not optional):
  - After get_historical_prices → ALWAYS call generate_chart immediately (area type, title "Price History — [TICKER]")
  - After get_financial_statements → ALWAYS call generate_chart (combo type: bars=revenue, line=grossMarginPct OR fcfMarginPct)
  - After get_earnings → ALWAYS call generate_chart (bar type: EPS actual vs estimate, last 6-8 quarters)
  - After get_analyst_data → ALWAYS call display_analyst_ratings immediately, every single time
  - After get_peer_comparison → ALWAYS call generate_chart (bar type: tickers on x-axis, P/E as series; OR scatter: P/E vs 52wk return)
  - After get_dividend_history → ALWAYS call generate_chart (bar type: date on x-axis, dividend amount series)
  - After get_fundamentals → consider generate_chart for key ratios if comparable data exists
  → These fire EVERY TIME without exception. Do not skip chart generation if data was fetched.

  Chart type reference:
  - Price history: "area" type, smooth curve, domain auto
  - Revenue + margin combo: "combo" type — bars=revenue, line series key MUST contain "pct", "margin", or "rate"
  - Bar comparisons: "bar" type, LabelList, reference line at 0 for negatives
  - Peer comparisons: "bar" (tickers as x-axis) or "scatter" (P/E vs metric)
  - Dividend history: "bar" type, date on x-axis
  - EPS actual vs estimate: "bar" type, two series
  - Colors: #cc1100 (primary red), #3b82f6 (blue), #22c55e (green), #ef4444 (red), #a855f7 (purple), #f59e0b (amber), #888888 (grey)
  - Data format: flat objects with numeric values — [{ year: "2023", revenue: 45.2, grossMarginPct: 38.5 }]
  - For combo charts: ALWAYS include both bar series AND line series (key ending in "pct", "margin", or "rate")

GENERAL RULES:
  - NEVER provide links to external websites. Use your tools only.
  - Canadian ETFs on TSX use the .TO suffix (e.g. XIC.TO, VFV.TO, ZCN.TO, VFV.TO).
  - Always note whether prices are in USD or CAD.
  - Format numbers clearly: prices to 2 decimals, % with sign, large numbers in M/B.
  - Keep responses clear and accessible — your audience is a retail investor, not a Bay Street analyst.`;

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

type PortfolioActionSpec = {
  actionType: "add" | "remove" | "update";
  ticker: string;
  shares?: number;
  avgCost?: number;
  note: string;
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
  const { messages, portfolioContext, lang } = await req.json();
  const langSuffix = lang === "fr"
    ? "\n\nIMPORTANT: Always respond entirely in French. Use formal French (vous)."
    : "";
  const baseSystem = SYSTEM_PROMPT + langSuffix;
  const portfolioModInstructions = portfolioContext ? `

PORTFOLIO MODE — YOU ARE NOW IN PORTFOLIO SIMULATOR MODE. Different rules apply:

BUILDING A PORTFOLIO (when user says "build", "create", "make", "suggest", "give me" a portfolio):
1. If the user gives a budget, use it. If not, assume $100,000 CAD total.
2. Decide allocation strategy (equal weight unless user specifies otherwise).
3. Call get_quote for EACH ticker to get the current price.
4. Calculate shares = Math.floor(allocation_per_stock / current_price). Minimum 1 share.
5. Call add_portfolio_position for EACH stock — this is MANDATORY. You MUST call this tool for every position you propose. Do not skip this step.
6. Structure your response with ## Overview first (summary of strategy + total budget + number of positions), then other sections.
7. Optionally call generate_chart for an allocation breakdown.

If the user's request is too vague (no sector, no style, no budget), ask 1-2 targeted questions before proceeding.

MODIFYING THE PORTFOLIO (when user says "add", "remove", "delete", "sell", "update", "change"):
- ALWAYS call the matching tool: add_portfolio_position, remove_portfolio_position, or update_portfolio_position.
- Do this FIRST before writing your response text.
- After calling the tool, write a short confirmation message.

ANALYZING THE EXISTING PORTFOLIO:
- Focus ONLY on the positions listed in the portfolio context above.
- Discuss P&L, allocation %, concentration risk, sector exposure.
- You may call get_quote for fresh prices if discussing current value.
- Do NOT do generic market research unrelated to the user's actual holdings.

RESPONSE STRUCTURE (MANDATORY in portfolio mode):
- Your response MUST always start with ## Overview — a 2-4 sentence summary of what you did or analyzed.
- Then add other ## sections as needed.
- The Overview must be the very first section.

IMPORTANT: The user will see a confirmation button before any add/remove/update takes effect. You do not need to ask for confirmation in your text — just call the tool and explain what you proposed.` : "";
  const activeSystem = portfolioContext
    ? baseSystem + "\n\n" + portfolioContext + portfolioModInstructions
    : baseSystem;

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
  const analystRatings: AnalystRatingsSpec[] = [];
  const portfolioActions: PortfolioActionSpec[] = [];
  const mentionedSymbols: string[] = []; // tickers the AI actually fetched data for

  try {
  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const response = await client!.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: activeSystem,
      tools: toolDefinitions as any,
      messages: loopMessages,
    });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      const text = textBlock && textBlock.type === "text" ? textBlock.text : "";
      return NextResponse.json({ content: text, charts, analystRatings, portfolioActions, mentionedTickers: mentionedSymbols.slice(0, 6) });
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
            charts.push(block.input as unknown as ChartSpec);
            return {
              type: "tool_result" as const,
              tool_use_id: block.id,
              content: JSON.stringify({ ok: true }),
            };
          }

          if (block.name === "display_analyst_ratings") {
            analystRatings.push(block.input as unknown as AnalystRatingsSpec);
            return {
              type: "tool_result" as const,
              tool_use_id: block.id,
              content: JSON.stringify({ ok: true }),
            };
          }

          if (block.name === "add_portfolio_position") {
            const inp = block.input as any;
            portfolioActions.push({ actionType: "add", ticker: inp.ticker, shares: inp.shares, avgCost: inp.avgCost, note: inp.note });
            return { type: "tool_result" as const, tool_use_id: block.id, content: JSON.stringify({ ok: true }) };
          }
          if (block.name === "remove_portfolio_position") {
            const inp = block.input as any;
            portfolioActions.push({ actionType: "remove", ticker: inp.ticker, note: inp.note });
            return { type: "tool_result" as const, tool_use_id: block.id, content: JSON.stringify({ ok: true }) };
          }
          if (block.name === "update_portfolio_position") {
            const inp = block.input as any;
            portfolioActions.push({ actionType: "update", ticker: inp.ticker, shares: inp.shares, avgCost: inp.avgCost, note: inp.note });
            return { type: "tool_result" as const, tool_use_id: block.id, content: JSON.stringify({ ok: true }) };
          }

          // Track which symbols were actually looked up
          const sym = (block.input as Record<string, any>).symbol as string | undefined;
          if (sym && ["get_quote", "get_analyst_data", "get_news", "get_fundamentals", "get_financial_statements", "get_earnings", "get_analyst_upgrades", "get_dividend_history", "get_insider_transactions"].includes(block.name)) {
            if (!mentionedSymbols.includes(sym)) mentionedSymbols.push(sym);
          }
          // get_peer_comparison passes symbols array
          if (block.name === "get_peer_comparison") {
            const syms = (block.input as Record<string, any>).symbols as string[] | undefined;
            if (Array.isArray(syms)) syms.forEach(s => { if (!mentionedSymbols.includes(s)) mentionedSymbols.push(s); });
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

  return NextResponse.json({ content: "I'm sorry, I couldn't process your request.", charts, analystRatings, portfolioActions, mentionedTickers: mentionedSymbols.slice(0, 6) });
  } catch (e: any) {
    console.error("Chat route error:", e);
    return NextResponse.json(
      { content: `Something went wrong: ${e?.message ?? "unknown error"}. Please try again.`, charts: [] },
      { status: 200 } // return 200 so the frontend renders the message instead of throwing
    );
  }
}
