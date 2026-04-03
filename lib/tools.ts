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

async function getAnalystData(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=financialData`;
    const res = await fetch(url, {
      headers: YF_HEADERS,
      cache: "no-store",
    });
    if (!res.ok) return { error: `Yahoo Finance returned ${res.status}` };
    const json = await res.json();
    const fd = json?.quoteSummary?.result?.[0]?.financialData;
    if (!fd) return { error: "No analyst data available." };
    return {
      recommendationKey: fd.recommendationKey,
      recommendationMean: fd.recommendationMean?.raw,
      numberOfAnalystOpinions: fd.numberOfAnalystOpinions?.raw,
      targetMeanPrice: fd.targetMeanPrice?.raw,
      targetHighPrice: fd.targetHighPrice?.raw,
      targetLowPrice: fd.targetLowPrice?.raw,
      targetMedianPrice: fd.targetMedianPrice?.raw,
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

async function getNews(symbol: string) {
  try {
    const results = await yahooFinance.search(symbol, { quotesCount: 0, newsCount: 5 }, FETCH_OPTS);
    return (results.news || []).map((n: any) => ({
      title: n.title,
      publisher: n.publisher,
      link: n.link,
      publishedAt: n.providerPublishTime,
    }));
  } catch (e: any) {
    return { error: e.message };
  }
}

async function getFundamentals(symbol: string) {
  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=defaultKeyStatistics%2CfinancialData%2CsummaryProfile`;
    const res = await fetch(url, {
      headers: YF_HEADERS,
      cache: "no-store",
    });
    if (!res.ok) return { error: `Yahoo Finance returned ${res.status}` };
    const json = await res.json();
    const r = json?.quoteSummary?.result?.[0];
    if (!r) return { error: "No data returned." };
    const ks = r.defaultKeyStatistics;
    const fd = r.financialData;
    const sp = r.summaryProfile;
    return {
      trailingEPS: ks?.trailingEps?.raw,
      forwardEPS: ks?.forwardEps?.raw,
      priceToBook: ks?.priceToBook?.raw,
      beta: ks?.beta?.raw,
      shortRatio: ks?.shortRatio?.raw,
      earningsGrowth: ks?.earningsQuarterlyGrowth?.raw != null ? Math.round(ks.earningsQuarterlyGrowth.raw * 10000) / 100 : null,
      revenueGrowth: fd?.revenueGrowth?.raw != null ? Math.round(fd.revenueGrowth.raw * 10000) / 100 : null,
      fiftyTwoWeekChange: ks?.["52WeekChange"]?.raw != null ? Math.round(ks["52WeekChange"].raw * 10000) / 100 : null,
      totalRevenue: fd?.totalRevenue?.raw,
      grossMargins: fd?.grossMargins?.raw != null ? Math.round(fd.grossMargins.raw * 10000) / 100 : null,
      operatingMargins: fd?.operatingMargins?.raw != null ? Math.round(fd.operatingMargins.raw * 10000) / 100 : null,
      profitMargins: fd?.profitMargins?.raw != null ? Math.round(fd.profitMargins.raw * 10000) / 100 : null,
      returnOnEquity: fd?.returnOnEquity?.raw != null ? Math.round(fd.returnOnEquity.raw * 10000) / 100 : null,
      returnOnAssets: fd?.returnOnAssets?.raw != null ? Math.round(fd.returnOnAssets.raw * 10000) / 100 : null,
      debtToEquity: fd?.debtToEquity?.raw,
      currentRatio: fd?.currentRatio?.raw,
      freeCashflow: fd?.freeCashflow?.raw,
      revenuePerShare: fd?.revenuePerShare?.raw,
      longBusinessSummary: sp?.longBusinessSummary,
      sector: sp?.sector,
      industry: sp?.industry,
      fullTimeEmployees: sp?.fullTimeEmployees,
      website: sp?.website,
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
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=earningsHistory`;
    const res = await fetch(url, {
      headers: YF_HEADERS,
      cache: "no-store",
    });
    if (!res.ok) return { error: `Yahoo Finance returned ${res.status}` };
    const json = await res.json();
    const history = json?.quoteSummary?.result?.[0]?.earningsHistory?.history;
    if (!history) return { error: "No earnings history available." };
    const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];
    return history.slice(-8).map((e: any) => {
      const ts = e.quarter?.raw;
      let quarter = "N/A";
      if (ts) {
        const d = new Date(ts * 1000);
        quarter = `${QUARTERS[Math.floor(d.getMonth() / 3)]} ${d.getFullYear()}`;
      }
      return {
        quarter,
        actual: e.epsActual?.raw ?? null,
        estimate: e.epsEstimate?.raw ?? null,
        surprise: e.surprisePercent?.raw != null ? Math.round(e.surprisePercent.raw * 100) / 100 : null,
      };
    });
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
