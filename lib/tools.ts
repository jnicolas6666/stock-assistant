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
    const summary = await yahooFinance.quoteSummary(symbol, {
      modules: ["financialData"],
    }, FETCH_OPTS);
    const fd = summary.financialData;
    if (!fd) return { error: "No analyst data available for this symbol." };
    return {
      recommendationKey: fd.recommendationKey,
      recommendationMean: fd.recommendationMean,
      numberOfAnalystOpinions: fd.numberOfAnalystOpinions,
      targetMeanPrice: fd.targetMeanPrice,
      targetHighPrice: fd.targetHighPrice,
      targetLowPrice: fd.targetLowPrice,
      targetMedianPrice: fd.targetMedianPrice,
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
    const summary = await yahooFinance.quoteSummary(symbol, {
      modules: ["defaultKeyStatistics", "financialData", "summaryProfile"],
    }, FETCH_OPTS);
    const ks = summary.defaultKeyStatistics as any;
    const fd = summary.financialData as any;
    const sp = summary.summaryProfile as any;

    return {
      // defaultKeyStatistics
      trailingEPS: ks?.trailingEps,
      forwardEPS: ks?.forwardEps,
      priceToBook: ks?.priceToBook,
      beta: ks?.beta,
      shortRatio: ks?.shortRatio,
      earningsGrowth: ks?.earningsQuarterlyGrowth != null ? ks.earningsQuarterlyGrowth * 100 : null,
      revenueGrowth: fd?.revenueGrowth != null ? fd.revenueGrowth * 100 : null,
      fiftyTwoWeekChange: ks?.["52WeekChange"] != null ? ks["52WeekChange"] * 100 : null,
      // financialData
      totalRevenue: fd?.totalRevenue,
      grossMargins: fd?.grossMargins,
      operatingMargins: fd?.operatingMargins,
      profitMargins: fd?.profitMargins,
      returnOnEquity: fd?.returnOnEquity,
      returnOnAssets: fd?.returnOnAssets,
      debtToEquity: fd?.debtToEquity,
      currentRatio: fd?.currentRatio,
      freeCashflow: fd?.freeCashflow,
      revenuePerShare: fd?.revenuePerShare,
      // summaryProfile
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

const PERIOD_DAYS: Record<string, number> = {
  "1mo": 30,
  "3mo": 90,
  "6mo": 180,
  "1y": 365,
  "2y": 730,
};

async function getHistoricalPrices(symbol: string, period: string) {
  try {
    const days = PERIOD_DAYS[period] ?? 90;
    const period1 = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await yahooFinance.historical(symbol, { period1, interval: "1d" }, FETCH_OPTS);

    // Limit to 100 points max
    const step = rows.length > 100 ? Math.ceil(rows.length / 100) : 1;
    const sampled = rows.filter((_, i) => i % step === 0).slice(0, 100);

    return sampled.map((r: any) => ({
      date: r.date instanceof Date
        ? r.date.toISOString().slice(0, 10)
        : String(r.date).slice(0, 10),
      close: r.close != null ? Math.round(r.close * 100) / 100 : null,
      volume: r.volume ?? null,
    }));
  } catch (e: any) {
    return { error: e.message };
  }
}

const QUARTER_NAMES = ["Q1", "Q2", "Q3", "Q4"];

async function getEarnings(symbol: string) {
  try {
    const summary = await yahooFinance.quoteSummary(symbol, {
      modules: ["earningsHistory"],
    }, FETCH_OPTS);
    const history = (summary.earningsHistory as any)?.history;
    if (!history || !Array.isArray(history)) return { error: "No earnings history available." };

    const last8 = history.slice(-8);

    return last8.map((e: any) => {
      const date: Date | undefined = e.quarter instanceof Date ? e.quarter : undefined;
      let quarter = "N/A";
      if (date) {
        const month = date.getMonth(); // 0-indexed
        const qIndex = Math.floor(month / 3);
        quarter = `${QUARTER_NAMES[qIndex]} ${date.getFullYear()}`;
      }
      const actual = e.epsActual ?? null;
      const estimate = e.epsEstimate ?? null;
      const surprise = actual != null && estimate != null && estimate !== 0
        ? Math.round(((actual - estimate) / Math.abs(estimate)) * 10000) / 100
        : null;
      return { quarter, actual, estimate, surprise };
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
