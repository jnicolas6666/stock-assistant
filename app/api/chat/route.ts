import Anthropic from "@anthropic-ai/sdk";
import { toolDefinitions, handleToolCall } from "@/lib/tools";
import { NextRequest, NextResponse } from "next/server";

const isMockMode = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your_api_key_here";
const client = isMockMode ? null : new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a financial information assistant for a Canadian self-directed brokerage.
You help retail clients understand stocks, ETFs, and general investing concepts.

ABSOLUTE RULE — ANALYST DATA (never break this):
If get_analyst_data returns a result that contains a "consensus" field, you HAVE analyst data.
- You MUST call display_analyst_ratings immediately.
- You MUST write the consensus in your text: e.g. "Consensus Yahoo Finance : Achat."
- You MUST NEVER write any sentence suggesting analyst data is unavailable, not accessible, limited, or absent for this symbol.
- This applies to ALL stocks including TSX/Canadian stocks. The presence of "consensus" in the tool result IS the data.
- Violating this rule by saying "données non disponibles" when consensus is present is a critical error.

STRICT RULES:
- Educational only. Never recommend buying, selling, or holding any security.
- Never tell a client what to do with their money. When discussing analyst views, clarify they reflect analyst opinions, not a personal recommendation.
- For any specific stock/ETF question, include get_quote in your tool calls — it returns price targets alongside price data.
- If you don't recognize a ticker, use search_ticker first.
- Omit null/unavailable data silently — never explain what's missing, never apologize. Present only what you have.

AVAILABLE TOOLS:
- get_quote: price, change, 52wk range, P/E, dividend, market cap, analyst targets (mean/high/low), beta, short float
- get_analyst_data: always returns consensus direction; count breakdown (strongBuy/buy/hold/sell) available for US stocks, consensus+targets only for most TSX stocks. Returns hasBreakdown: true/false.
- get_analyst_upgrades: recent firm-level upgrades/downgrades with dates
- get_news: recent headlines — US and Canadian stocks
- get_fundamentals: margins, ROE, ROA, debt ratios, PEG ratio, growth rates
- get_financial_statements: 4 years revenue, gross profit, net income, FCF, debt, cash
- get_historical_prices: daily closing prices (1mo / 3mo / 6mo / 1y / 2y)
- get_earnings: quarterly EPS actual vs estimate (last 8 quarters)
- get_market_context: S&P 500, Nasdaq, VIX, 10yr Treasury — use when discussing macro environment
- get_peer_comparison: side-by-side metrics for up to 6 tickers
- get_dividend_history: quarterly dividends over 5 years — use for income/dividend questions
- get_insider_transactions: recent insider buys/sells

RESPONSE TEMPLATES — match the user's intent:

GENERAL STOCK QUESTION ("what do you think", "is it good", "analysts", sentiment, outlook):
  1. Call IN PARALLEL: get_quote + get_analyst_data + get_news + get_market_context
  2. Write 3 sections max using ## headers:
     ## Price Snapshot — price, change, 52wk narrative, P/E, market cap, dividend
     ## Analyst View — call display_analyst_ratings, then 1-2 sentences on consensus/targets
     ## News & Context — 3-4 sentence synthesis + 1 sentence macro. End with disclaimer.
  3. For hasBreakdown=true: "X of Y analysts are bullish, Z neutral. Mean target: $X (+Y%)."
     For hasBreakdown=false: "Yahoo Finance consensus: [Buy/Hold/Sell]. [Targets if available.]"
  4. Follow-up questions: add new sections only — do not regenerate existing ones.

ANALYST-SPECIFIC QUESTION ("what do analysts say", "price target", "upgrades"):
  1. Call IN PARALLEL: get_analyst_data + get_analyst_upgrades + get_quote
  2. Write 2 sections:
     ## Analyst Consensus — call display_analyst_ratings, present breakdown or consensus direction + targets
     ## Recent Actions — 2-3 most recent firm upgrades/downgrades with dates
  3. Note: targets are 12-month forward estimates, not guarantees.

FINANCIAL / VALUATION QUESTION ("financials", "balance sheet", "overvalued", "revenue"):
  1. Call: get_financial_statements + get_fundamentals
  2. Write 3 sections max:
     ## Financial Overview — revenue trend, margins, FCF
     ## Valuation & Ratios — P/E, PEG, debt/equity, ROE vs context
     ## Summary — Is it growing? Margins expanding? Cash position?

CHART RULES (fire after fetching data — skip only if tool returned an error):
  - get_historical_prices → generate_chart: area type, title "Price History — [TICKER]"
  - get_financial_statements → generate_chart: combo type (bars=revenue, line=grossMarginPct or fcfMarginPct)
  - get_earnings → generate_chart: bar type (EPS actual vs estimate)
  - get_analyst_data → display_analyst_ratings if result has consensus field (pass symbol + consensus + totalAnalysts; omit count fields when hasBreakdown=false)
  - get_peer_comparison → generate_chart: bar (P/E by ticker) or scatter (P/E vs return)
  - get_dividend_history → generate_chart: bar (date x-axis, dividend amount)

  Chart format:
  - Types: "area" | "bar" | "combo" | "scatter" (line also supported)
  - Combo: bars=revenue series, line series key must contain "pct", "margin", or "rate"
  - Data: flat objects with numeric values — [{ year: "2023", revenue: 45.2, grossMarginPct: 38.5 }]
  - Colors: #cc1100 (red) #3b82f6 (blue) #22c55e (green) #ef4444 (red2) #a855f7 (purple) #f59e0b (amber) #888888 (grey)

GENERAL:
  - No external links. Tools only.
  - Canadian stocks/ETFs use .TO suffix (e.g. RY.TO, XIC.TO, VFV.TO, XIU.TO).
  - Always note USD vs CAD. Format: prices to 2 decimals, % with sign, large numbers in M/B.
  - Audience is retail investors — clear, accessible language.`;

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
  strongBuy?: number;
  buy?: number;
  hold?: number;
  sell?: number;
  strongSell?: number;
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
          if (sym && ["get_quote", "get_analyst_data", "get_news", "get_fundamentals", "get_financial_statements", "get_earnings", "get_analyst_upgrades", "get_dividend_history", "get_insider_transactions", "get_historical_prices"].includes(block.name)) {
            if (!mentionedSymbols.includes(sym)) mentionedSymbols.push(sym);
          }
          // get_peer_comparison passes symbols array
          if (block.name === "get_peer_comparison") {
            const syms = (block.input as Record<string, any>).symbols as string[] | undefined;
            if (Array.isArray(syms)) syms.forEach(s => { if (!mentionedSymbols.includes(s)) mentionedSymbols.push(s); });
          }

          const result = await handleToolCall(block.name, block.input as Record<string, any>);
          // When analyst data has a consensus field, inject a mandatory instruction directly
          // into the tool result so Claude cannot ignore it while writing its response.
          const finalResult = (block.name === "get_analyst_data" && result && !(result as any).error && (result as any).consensus)
            ? { ...result, _MANDATORY_ACTION: "Consensus data is present. You MUST: (1) call display_analyst_ratings with this consensus right now. (2) Write the consensus in your response (e.g. 'Consensus Yahoo Finance : Achat'). (3) NEVER write any sentence suggesting analyst data is unavailable, limited, or not accessible for this symbol. The word 'unavailable' is FORBIDDEN when consensus is present." }
            : result;
          return {
            type: "tool_result" as const,
            tool_use_id: block.id,
            content: JSON.stringify(finalResult),
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
