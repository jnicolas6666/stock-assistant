import yahooFinance from "yahoo-finance2";

yahooFinance.setGlobalConfig({ validation: { logErrors: false } });

// Spoof a browser User-Agent so Vercel's server IPs don't get blocked by Yahoo Finance
const FETCH_OPTS = {
  fetchOptions: {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.5",
    },
  },
};

const YF_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json",
};

// Tool definitions for Anthropic API
export const toolDefinitions = [
  {
    name: "search_ticker",
    description: "Search for a stock or ETF ticker symbol by company name or keyword. Use this when the user mentions a company name instead of a ticker symbol.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Company name or keyword to search for" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_quote",
    description: "Get real-time price, fundamentals, and key stats for a stock or ETF ticker symbol.",
    input_schema: {
      type: "object" as const,
      properties: {
        symbol: { type: "string", description: "Stock ticker symbol (e.g. AAPL, MSFT, XIC.TO)" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_analyst_data",
    description: "Get analyst consensus ratings and price targets for a stock. Returns factual data about what analysts collectively think — not a personal recommendation.",
    input_schema: {
      type: "object" as const,
      properties: {
        symbol: { type: "string", description: "Stock ticker symbol" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_news",
    description: "Get recent news headlines for a stock or ETF.",
    input_schema: {
      type: "object" as const,
      properties: {
        symbol: { type: "string", description: "Stock ticker symbol" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_fundamentals",
    description: "Get detailed fundamental data for a stock: valuation metrics, profitability ratios, company profile, and growth rates.",
    input_schema: {
      type: "object" as const,
      properties: {
        symbol: { type: "string", description: "Stock ticker symbol" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_historical_prices",
    description: "Get historical daily closing prices for a stock over a given time period.",
    input_schema: {
      type: "object" as const,
      properties: {
        symbol: { type: "string", description: "Stock ticker symbol" },
        period: {
          type: "string",
          enum: ["1mo", "3mo", "6mo", "1y", "2y"],
          description: "Time period for historical data",
        },
      },
      required: ["symbol", "period"],
    },
  },
  {
    name: "get_earnings",
    description: "Get historical quarterly earnings (EPS actual vs estimate) for a stock.",
    input_schema: {
      type: "object" as const,
      properties: {
        symbol: { type: "string", description: "Stock ticker symbol" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "generate_chart",
    description: "Render a chart in the UI with provided data. Use this to visualize price history, comparisons, earnings trends, and any numeric data. Always call this after fetching data that would benefit from visualization.",
    input_schema: {
      type: "object" as const,
      properties: {
        type: {
          type: "string",
          enum: ["line", "bar", "area"],
          description: "Chart type: line or area for time series, bar for comparisons",
        },
        title: { type: "string", description: "Chart title" },
        data: {
          type: "array",
          description: "Array of data point objects. Each item must be a flat object. For price history: [{date: 'Jan 1', close: 150.5}, ...]. For comparisons: [{metric: 'P/E', AAPL: 28.5, MSFT: 32.1}, ...].",
        },
        xKey: { type: "string", description: "Key name for x-axis labels (e.g. 'date', 'metric')" },
        series: {
          type: "array",
          description: "Array of {key, name, color} objects defining which data keys to plot",
          items: { type: "object" },
        },
      },
      required: ["type", "title", "data", "xKey", "series"],
    },
  },
];

// Tool handlers

async function searchTicker(query: string) {
  try {
    const results = await yahooFinance.search(query, { quotesCount: 3, newsCount: 0 }, FETCH_OPTS);
    return (results.quotes || []).slice(0, 3).map((q: any) => ({
      symbol: q.symbol,
      shortname: q.shortname || q.longname,
      exchange: q.exchange,
      quoteType: q.quoteType,
    }));
  } catch (e: any) {
    return { error: e.message };
  }
}

async function getQuote(symbol: string) {
  try {
    const q = await yahooFinance.quote(symbol, {}, FETCH_OPTS);
    return {
      symbol: q.symbol,
      longName: q.longName,
      price: q.regularMarketPrice,
      currency: q.currency,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      marketCap: q.marketCap,
      peRatio: q.trailingPE,
      forwardPE: q.forwardPE,
      dividendYield: q.trailingAnnualDividendYield,
      dividendRate: q.trailingAnnualDividendRate,
      fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: q.fiftyTwoWeekLow,
      sector: (q as any).sector,
      industry: (q as any).industry,
      exchange: q.fullExchangeName,
      quoteType: q.quoteType,
      marketState: q.marketState,
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

async function finnhubGet(path: string) {
  const key = process.env.FINNHUB_API_KEY;
  const res = await fetch(`https://finnhub.io/api/v1${path}&token=${key}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Finnhub returned ${res.status}`);
  const json = await res.json();
  if (json?.error) throw new Error(json.error);
  return json;
}

async function getAnalystData(symbol: string) {
  try {
    // Fetch last 3 months of recommendations
    const recs = await finnhubGet(`/stock/recommendation?symbol=${encodeURIComponent(symbol)}`);
    if (!Array.isArray(recs) || recs.length === 0) return { error: "No analyst data available." };

    const latest = recs[0];
    const prev = recs[1] ?? null;
    const total = (latest.strongBuy ?? 0) + (latest.buy ?? 0) + (latest.hold ?? 0) + (latest.sell ?? 0) + (latest.strongSell ?? 0);
    const bullish = (latest.strongBuy ?? 0) + (latest.buy ?? 0);
    const bearish = (latest.sell ?? 0) + (latest.strongSell ?? 0);

    // Month-over-month change in buy ratings
    const buyChange = prev ? ((latest.buy + latest.strongBuy) - (prev.buy + prev.strongBuy)) : null;

    return {
      period: latest.period,
      strongBuy: latest.strongBuy,
      buy: latest.buy,
      hold: latest.hold,
      sell: latest.sell,
      strongSell: latest.strongSell,
      totalAnalysts: total,
      bullishCount: bullish,
      bearishCount: bearish,
      buyChangeVsLastMonth: buyChange,
      // Last 3 months trend for context
      trend: recs.slice(0, 3).map((r: any) => ({
        period: r.period,
        strongBuy: r.strongBuy, buy: r.buy, hold: r.hold, sell: r.sell, strongSell: r.strongSell,
      })),
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

async function getNews(symbol: string) {
  try {
    const sym = encodeURIComponent(symbol);
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const news = await finnhubGet(`/company-news?symbol=${sym}&from=${from}&to=${to}`);
    if (!Array.isArray(news) || news.length === 0) return { error: "No recent news found." };
    return news.slice(0, 5).map((n: any) => ({
      headline: n.headline,
      source: n.source,
      summary: n.summary ? n.summary.slice(0, 250) : null,
      date: new Date(n.datetime * 1000).toISOString().slice(0, 10),
    }));
  } catch (e: any) {
    return { error: e.message };
  }
}

async function getFundamentals(symbol: string) {
  try {
    const sym = encodeURIComponent(symbol);
    const [profile, metrics] = await Promise.all([
      finnhubGet(`/stock/profile2?symbol=${sym}`),
      finnhubGet(`/stock/metric?symbol=${sym}&metric=all`),
    ]);
    const m = metrics?.metric ?? {};
    return {
      sector: profile?.finnhubIndustry,
      industry: profile?.finnhubIndustry,
      fullTimeEmployees: profile?.employeeTotal,
      website: profile?.weburl,
      // Valuation
      peRatioAnnual: m.peNormalizedAnnual,
      peTTM: m.peTTM,
      priceToBook: m.pbAnnual,
      priceToSales: m.psTTM,
      beta: m.beta,
      // Per-share
      epsAnnual: m.epsNormalizedAnnual,
      revenuePerShare: m.revenuePerShareAnnual,
      // Growth
      revenueGrowthAnnual: m.revenueGrowthAnnual ? Math.round(m.revenueGrowthAnnual * 100) / 100 : null,
      epsGrowth3Y: m.epsGrowth3Y ? Math.round(m.epsGrowth3Y * 100) / 100 : null,
      // Margins & Returns
      grossMargin: m.grossMarginAnnual ? Math.round(m.grossMarginAnnual * 100) / 100 : null,
      netMargin: m.netProfitMarginAnnual ? Math.round(m.netProfitMarginAnnual * 100) / 100 : null,
      returnOnEquity: m.roeAnnual ? Math.round(m.roeAnnual * 100) / 100 : null,
      returnOnAssets: m.roaAnnual ? Math.round(m.roaAnnual * 100) / 100 : null,
      // Balance sheet
      debtToEquity: m["totalDebt/totalEquityAnnual"],
      currentRatio: m.currentRatioAnnual,
      // Dividend
      dividendYield: m.dividendYieldIndicatedAnnual,
      // 52-week
      fiftyTwoWeekHigh: m["52WeekHigh"],
      fiftyTwoWeekLow: m["52WeekLow"],
      fiftyTwoWeekReturn: m["52WeekPriceReturnDaily"] ? Math.round(m["52WeekPriceReturnDaily"] * 100) / 100 : null,
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

async function getHistoricalPrices(symbol: string, period: string) {
  try {
    const PERIOD_MAP: Record<string, string> = {
      "1mo": "1mo", "3mo": "3mo", "6mo": "6mo", "1y": "1y", "2y": "2y",
    };
    const range = PERIOD_MAP[period] ?? "3mo";
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d&includePrePost=false`;

    const res = await fetch(url, {
      headers: YF_HEADERS,
      cache: "no-store",
    });

    if (!res.ok) return { error: `Yahoo Finance returned ${res.status}` };

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return { error: "No data returned from Yahoo Finance." };

    const timestamps: number[] = result.timestamp ?? [];
    const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];

    const formatDate = (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const rows = timestamps.map((ts, i) => ({
      date: formatDate(new Date(ts * 1000).toISOString().slice(0, 10)),
      close: closes[i] != null ? Math.round(closes[i] * 100) / 100 : null,
    })).filter(r => r.close != null);

    // Sample down to max 60 points
    const step = rows.length > 60 ? Math.ceil(rows.length / 60) : 1;
    return rows.filter((_, i) => i % step === 0);
  } catch (e: any) {
    return { error: e.message };
  }
}

async function getEarnings(symbol: string) {
  try {
    const sym = encodeURIComponent(symbol);
    const data = await finnhubGet(`/stock/earnings?symbol=${sym}`);
    if (!Array.isArray(data) || data.length === 0) return { error: "No earnings data available." };
    return data.slice(0, 8).map((e: any) => ({
      quarter: e.period,
      actual: e.actual,
      estimate: e.estimate,
      surprise: e.surprise,
      surprisePercent: e.surprisePercent != null ? Math.round(e.surprisePercent * 100) / 100 : null,
    }));
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function handleToolCall(name: string, input: Record<string, any>) {
  switch (name) {
    case "search_ticker":
      return searchTicker(input.query);
    case "get_quote":
      return getQuote(input.symbol);
    case "get_analyst_data":
      return getAnalystData(input.symbol);
    case "get_news":
      return getNews(input.symbol);
    case "get_fundamentals":
      return getFundamentals(input.symbol);
    case "get_historical_prices":
      return getHistoricalPrices(input.symbol, input.period);
    case "get_earnings":
      return getEarnings(input.symbol);
    default:
      return { error: `Unknown tool: ${name}` };
  }
}
