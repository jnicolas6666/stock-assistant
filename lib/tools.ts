import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ validation: { logErrors: false } });

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
    description: "Get real-time price, fundamentals, analyst price targets, and key stats for a stock or ETF. Returns current price, 52-week range, P/E, dividend yield, analyst consensus price target (mean/high/low), short interest, and more.",
    input_schema: {
      type: "object" as const,
      properties: {
        symbol: { type: "string", description: "Stock ticker symbol (e.g. AAPL, MSFT, RY.TO)" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_analyst_data",
    description: "Get analyst consensus ratings breakdown (strong buy / buy / hold / sell / strong sell counts) and month-over-month trend for a stock. Use alongside get_quote which already provides the price targets.",
    input_schema: {
      type: "object" as const,
      properties: {
        symbol: { type: "string", description: "Stock ticker symbol" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_analyst_upgrades",
    description: "Get recent individual analyst upgrade/downgrade actions for a stock — which firms changed their rating and in which direction. Use this to enrich analyst sentiment discussions.",
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
    description: "Get recent news headlines and summaries for a stock or ETF. Works for US and Canadian stocks.",
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
    description: "Get detailed fundamental data for a stock: valuation metrics, profitability ratios, short interest, PEG ratio, forward EPS, and company profile.",
    input_schema: {
      type: "object" as const,
      properties: {
        symbol: { type: "string", description: "Stock ticker symbol" },
      },
      required: ["symbol"],
    },
  },
  {
    name: "get_financial_statements",
    description: "Get 4 years of annual financial statements: revenue, gross profit, net income, free cash flow, total debt, and cash position. Use this for any question about a company's financial health, growth trajectory, or when comparing fundamentals over time.",
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
    name: "get_market_context",
    description: "Get current broad market context: S&P 500, Nasdaq, VIX (fear index), and 10-year Treasury yield. Use this whenever a user asks about market conditions, macro environment, or when contextualizing any stock discussion.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "display_analyst_ratings",
    description: "Render a visual analyst ratings card in the UI. Call this whenever you have analyst consensus data to display — after calling get_analyst_data. Pass all the rating counts and the overall consensus.",
    input_schema: {
      type: "object" as const,
      properties: {
        symbol: { type: "string", description: "Stock ticker symbol" },
        consensus: { type: "string", description: "Overall consensus label: strongBuy, buy, hold, sell, strongSell" },
        period: { type: "string", description: "Data period e.g. 2026-04-01" },
        strongBuy: { type: "number" },
        buy: { type: "number" },
        hold: { type: "number" },
        sell: { type: "number" },
        strongSell: { type: "number" },
        totalAnalysts: { type: "number" },
        buyChangeVsLastMonth: { type: "number", description: "Change in bullish count vs last month (positive = more bullish)" },
      },
      required: ["symbol", "consensus", "strongBuy", "buy", "hold", "sell", "strongSell", "totalAnalysts"],
    },
  },
  {
    name: "generate_chart",
    description: "Render a chart in the UI with provided data. Use this to visualize price history, comparisons, earnings trends, revenue growth, and any numeric data. Always call this after fetching data that would benefit from visualization.",
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
        xKey: { type: "string", description: "Key name for x-axis labels (e.g. 'date', 'metric', 'year')" },
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

// ── Helpers ───────────────────────────────────────────────────────────────────

// Finnhub free tier only supports US-listed symbols — strip exchange suffixes
function fh(symbol: string) {
  return encodeURIComponent(symbol.replace(/\.(TO|TSX|V|CN)$/i, ""));
}

async function finnhubGet(path: string) {
  const key = process.env.FINNHUB_API_KEY;
  const res = await fetch(`https://finnhub.io/api/v1${path}&token=${key}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Finnhub returned ${res.status}`);
  const json = await res.json();
  if (json?.error) throw new Error(json.error);
  return json;
}

function fmt(n: number | null | undefined, decimals = 2): number | null {
  if (n == null || isNaN(n)) return null;
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function fmtLarge(n: number | null | undefined): string | null {
  if (n == null || isNaN(n)) return null;
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + "M";
  return n.toFixed(0);
}

// ── Tool handlers ─────────────────────────────────────────────────────────────

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
    // Fetch basic quote + extended summary (price targets, short interest) in parallel
    const [q, summary] = await Promise.all([
      yahooFinance.quote(symbol, {}, FETCH_OPTS),
      yahooFinance.quoteSummary(symbol, {
        modules: ["financialData", "defaultKeyStatistics"] as any,
        fetchOptions: FETCH_OPTS.fetchOptions,
      } as any).catch(() => null),
    ]);

    const fd = (summary as any)?.financialData ?? {};
    const ks = (summary as any)?.defaultKeyStatistics ?? {};

    return {
      symbol: q.symbol,
      longName: q.longName,
      price: q.regularMarketPrice,
      currency: q.currency,
      change: fmt(q.regularMarketChange),
      changePercent: fmt(q.regularMarketChangePercent),
      marketCap: fmtLarge(q.marketCap ?? null),
      peRatio: fmt(q.trailingPE ?? null),
      forwardPE: fmt(fd.currentPrice ? null : q.forwardPE ?? null) ?? fmt(fd.currentPrice ? (fd.currentPrice / (ks.forwardEps ?? 0)) || null : null),
      dividendYield: fmt(q.trailingAnnualDividendYield ?? null, 4),
      dividendRate: fmt(q.trailingAnnualDividendRate ?? null),
      fiftyTwoWeekHigh: fmt(q.fiftyTwoWeekHigh ?? null),
      fiftyTwoWeekLow: fmt(q.fiftyTwoWeekLow ?? null),
      // Analyst price targets from Yahoo Finance
      analystTargetMean: fmt(fd.targetMeanPrice ?? null),
      analystTargetHigh: fmt(fd.targetHighPrice ?? null),
      analystTargetLow: fmt(fd.targetLowPrice ?? null),
      analystTargetMedian: fmt(fd.targetMedianPrice ?? null),
      numberOfAnalystOpinions: fd.numberOfAnalystOpinions ?? null,
      yahooRecommendation: fd.recommendationKey ?? null,
      // Key stats
      shortPercentOfFloat: fmt(ks.shortPercentOfFloat ?? null, 4),
      forwardEps: fmt(ks.forwardEps ?? null),
      pegRatio: fmt(ks.pegRatio ?? null),
      beta: fmt(q.beta ?? ks.beta ?? null),
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
    const recs = await finnhubGet(`/stock/recommendation?symbol=${fh(symbol)}`);
    if (!Array.isArray(recs) || recs.length === 0) return { error: "No analyst data available." };

    const latest = recs[0];
    const prev = recs[1] ?? null;
    const total = (latest.strongBuy ?? 0) + (latest.buy ?? 0) + (latest.hold ?? 0) + (latest.sell ?? 0) + (latest.strongSell ?? 0);
    const bullish = (latest.strongBuy ?? 0) + (latest.buy ?? 0);
    const bearish = (latest.sell ?? 0) + (latest.strongSell ?? 0);
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
      trend: recs.slice(0, 3).map((r: any) => ({
        period: r.period,
        strongBuy: r.strongBuy, buy: r.buy, hold: r.hold, sell: r.sell, strongSell: r.strongSell,
      })),
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

async function getAnalystUpgrades(symbol: string) {
  try {
    const summary = await yahooFinance.quoteSummary(symbol, {
      modules: ["upgradeDowngradeHistory"] as any,
      fetchOptions: FETCH_OPTS.fetchOptions,
    } as any);

    const history: any[] = (summary as any)?.upgradeDowngradeHistory?.history ?? [];
    if (history.length === 0) return { error: "No recent upgrade/downgrade data available." };

    return history.slice(0, 12).map((h: any) => ({
      date: new Date(h.epochGradeDate * 1000).toISOString().slice(0, 10),
      firm: h.firm,
      fromGrade: h.fromGrade || null,
      toGrade: h.toGrade,
      action: h.action, // "up", "down", "main", "init", "reit"
    }));
  } catch (e: any) {
    return { error: e.message };
  }
}

async function getNews(symbol: string) {
  try {
    // Primary: Yahoo Finance search (works for Canadian stocks too)
    const results = await yahooFinance.search(symbol, { quotesCount: 0, newsCount: 10 }, FETCH_OPTS);
    const yfNews: any[] = results.news ?? [];
    if (yfNews.length > 0) {
      return yfNews.slice(0, 8).map((n: any) => ({
        headline: n.title,
        source: n.publisher,
        summary: null,
        date: new Date(n.providerPublishTime * 1000).toISOString().slice(0, 10),
      }));
    }

    // Fallback: Finnhub (US only)
    const sym = fh(symbol);
    const to = new Date().toISOString().slice(0, 10);
    const from = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const news = await finnhubGet(`/company-news?symbol=${sym}&from=${from}&to=${to}`);
    if (!Array.isArray(news) || news.length === 0) return { error: "No recent news found." };
    return news.slice(0, 8).map((n: any) => ({
      headline: n.headline,
      source: n.source,
      summary: n.summary || null,
      date: new Date(n.datetime * 1000).toISOString().slice(0, 10),
    }));
  } catch (e: any) {
    return { error: e.message };
  }
}

async function getFundamentals(symbol: string) {
  try {
    const sym = fh(symbol);
    // Fetch Finnhub + Yahoo in parallel
    const [profileRes, metricsRes, summaryRes] = await Promise.allSettled([
      finnhubGet(`/stock/profile2?symbol=${sym}`),
      finnhubGet(`/stock/metric?symbol=${sym}&metric=all`),
      yahooFinance.quoteSummary(symbol, {
        modules: ["defaultKeyStatistics", "financialData"] as any,
        fetchOptions: FETCH_OPTS.fetchOptions,
      } as any),
    ]);

    const profile = profileRes.status === "fulfilled" ? profileRes.value : {};
    const m = metricsRes.status === "fulfilled" ? (metricsRes.value?.metric ?? {}) : {};
    const ks = summaryRes.status === "fulfilled" ? ((summaryRes.value as any)?.defaultKeyStatistics ?? {}) : {};
    const fd = summaryRes.status === "fulfilled" ? ((summaryRes.value as any)?.financialData ?? {}) : {};

    return {
      sector: profile?.finnhubIndustry,
      industry: profile?.finnhubIndustry,
      fullTimeEmployees: profile?.employeeTotal,
      website: profile?.weburl,
      // Valuation
      peRatioAnnual: fmt(m.peNormalizedAnnual ?? null),
      peTTM: fmt(m.peTTM ?? null),
      forwardPE: fmt(ks.forwardPE ?? null),
      priceToBook: fmt(m.pbAnnual ?? ks.priceToBook ?? null),
      priceToSales: fmt(m.psTTM ?? null),
      pegRatio: fmt(ks.pegRatio ?? null),
      enterpriseToEbitda: fmt(ks.enterpriseToEbitda ?? null),
      // Per-share
      epsAnnual: fmt(m.epsNormalizedAnnual ?? null),
      forwardEps: fmt(ks.forwardEps ?? null),
      revenuePerShare: fmt(m.revenuePerShareAnnual ?? null),
      bookValue: fmt(ks.bookValue ?? null),
      // Growth
      revenueGrowthAnnual: fmt(m.revenueGrowthAnnual ?? null),
      revenueGrowthYoY: fmt(fd.revenueGrowth ? fd.revenueGrowth * 100 : null),
      earningsGrowthYoY: fmt(fd.earningsGrowth ? fd.earningsGrowth * 100 : null),
      epsGrowth3Y: fmt(m.epsGrowth3Y ?? null),
      // Margins & Returns
      grossMargin: fmt(fd.grossMargins ? fd.grossMargins * 100 : m.grossMarginAnnual ?? null),
      operatingMargin: fmt(fd.operatingMargins ? fd.operatingMargins * 100 : null),
      netMargin: fmt(fd.profitMargins ? fd.profitMargins * 100 : m.netProfitMarginAnnual ?? null),
      ebitdaMargin: fmt(fd.ebitdaMargins ? fd.ebitdaMargins * 100 : null),
      returnOnEquity: fmt(fd.returnOnEquity ? fd.returnOnEquity * 100 : m.roeAnnual ?? null),
      returnOnAssets: fmt(fd.returnOnAssets ? fd.returnOnAssets * 100 : m.roaAnnual ?? null),
      // Balance sheet / liquidity
      debtToEquity: fmt(fd.debtToEquity ?? m["totalDebt/totalEquityAnnual"] ?? null),
      currentRatio: fmt(fd.currentRatio ?? m.currentRatioAnnual ?? null),
      quickRatio: fmt(fd.quickRatio ?? null),
      // Short interest
      shortPercentOfFloat: fmt(ks.shortPercentOfFloat ? ks.shortPercentOfFloat * 100 : null),
      shortRatio: fmt(ks.shortRatio ?? null),
      // 52-week
      fiftyTwoWeekHigh: fmt(m["52WeekHigh"] ?? null),
      fiftyTwoWeekLow: fmt(m["52WeekLow"] ?? null),
      fiftyTwoWeekReturn: fmt(m["52WeekPriceReturnDaily"] ?? null),
      beta: fmt(m.beta ?? ks.beta ?? null),
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

async function getFinancialStatements(symbol: string) {
  try {
    const summary = await yahooFinance.quoteSummary(symbol, {
      modules: ["incomeStatementHistory", "cashflowStatementHistory", "balanceSheetHistory"] as any,
      fetchOptions: FETCH_OPTS.fetchOptions,
    } as any);

    const income: any[] = (summary as any)?.incomeStatementHistory?.incomeStatementHistory ?? [];
    const cashflow: any[] = (summary as any)?.cashflowStatementHistory?.cashflowStatements ?? [];
    const balance: any[] = (summary as any)?.balanceSheetHistory?.balanceSheetStatements ?? [];

    if (income.length === 0 && cashflow.length === 0) {
      return { error: "Financial statements not available for this security (may be an ETF or data unavailable)." };
    }

    const years = income.map((stmt: any, i: number) => {
      const cf = cashflow[i] ?? {};
      const bs = balance[i] ?? {};
      const yr = stmt.endDate ? new Date(stmt.endDate).getFullYear().toString() : `Year ${i + 1}`;
      const revenue = stmt.totalRevenue ?? null;
      const grossProfit = stmt.grossProfit ?? null;
      const netIncome = stmt.netIncome ?? null;
      const operatingCF = cf.totalCashFromOperatingActivities ?? null;
      const capex = cf.capitalExpenditures ?? null;
      // FCF = Operating CF - CapEx (capex is usually negative in Yahoo data)
      const fcf = operatingCF != null && capex != null ? operatingCF + capex : (cf.freeCashFlow ?? null);
      const totalDebt = (bs.longTermDebt ?? 0) + (bs.shortTermDebt ?? 0) || null;
      const cash = bs.cash ?? null;

      return {
        year: yr,
        revenue: fmtLarge(revenue),
        grossProfit: fmtLarge(grossProfit),
        grossMarginPct: revenue && grossProfit ? fmt((grossProfit / revenue) * 100) : null,
        netIncome: fmtLarge(netIncome),
        netMarginPct: revenue && netIncome ? fmt((netIncome / revenue) * 100) : null,
        freeCashFlow: fmtLarge(fcf),
        totalDebt: fmtLarge(totalDebt),
        cash: fmtLarge(cash),
        netDebt: totalDebt != null && cash != null ? fmtLarge(totalDebt - cash) : null,
      };
    });

    return { symbol, years };
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

    const res = await fetch(url, { headers: YF_HEADERS, cache: "no-store" });
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

    const step = rows.length > 60 ? Math.ceil(rows.length / 60) : 1;
    return rows.filter((_, i) => i % step === 0);
  } catch (e: any) {
    return { error: e.message };
  }
}

async function getEarnings(symbol: string) {
  try {
    const sym = fh(symbol);
    const data = await finnhubGet(`/stock/earnings?symbol=${sym}`);
    if (!Array.isArray(data) || data.length === 0) return { error: "No earnings data available." };
    return data.slice(0, 8).map((e: any) => ({
      quarter: e.period,
      actual: e.actual,
      estimate: e.estimate,
      surprise: e.surprise,
      surprisePercent: e.surprisePercent != null ? fmt(e.surprisePercent) : null,
    }));
  } catch (e: any) {
    return { error: e.message };
  }
}

async function getMarketContext() {
  try {
    const symbols = ["^GSPC", "^IXIC", "^VIX", "^TNX", "^RUT"];
    const quotes = await Promise.allSettled(
      symbols.map(s => yahooFinance.quote(s, {}, FETCH_OPTS))
    );

    const get = (i: number) => quotes[i].status === "fulfilled" ? quotes[i].value : null;
    const sp500 = get(0);
    const nasdaq = get(1);
    const vix = get(2);
    const tnx = get(3);
    const rut = get(4);

    const vixLevel = vix?.regularMarketPrice ?? null;
    const vixInterpretation =
      vixLevel == null ? null :
      vixLevel < 15 ? "low (market calm, low fear)" :
      vixLevel < 20 ? "below average (mild uncertainty)" :
      vixLevel < 25 ? "moderate (elevated concern)" :
      vixLevel < 30 ? "elevated (significant fear)" :
      "high (extreme fear / market stress)";

    return {
      sp500: {
        price: fmt(sp500?.regularMarketPrice ?? null),
        change: fmt(sp500?.regularMarketChange ?? null),
        changePercent: fmt(sp500?.regularMarketChangePercent ?? null),
      },
      nasdaq: {
        price: fmt(nasdaq?.regularMarketPrice ?? null),
        change: fmt(nasdaq?.regularMarketChange ?? null),
        changePercent: fmt(nasdaq?.regularMarketChangePercent ?? null),
      },
      russellSmallCap: {
        price: fmt(rut?.regularMarketPrice ?? null),
        changePercent: fmt(rut?.regularMarketChangePercent ?? null),
      },
      vix: {
        level: fmt(vixLevel),
        interpretation: vixInterpretation,
      },
      tenYearYield: {
        percent: fmt(tnx?.regularMarketPrice ?? null),
        change: fmt(tnx?.regularMarketChange ?? null),
      },
    };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function handleToolCall(name: string, input: Record<string, any>) {
  switch (name) {
    case "search_ticker":       return searchTicker(input.query);
    case "get_quote":           return getQuote(input.symbol);
    case "get_analyst_data":    return getAnalystData(input.symbol);
    case "get_analyst_upgrades": return getAnalystUpgrades(input.symbol);
    case "get_news":            return getNews(input.symbol);
    case "get_fundamentals":    return getFundamentals(input.symbol);
    case "get_financial_statements": return getFinancialStatements(input.symbol);
    case "get_historical_prices": return getHistoricalPrices(input.symbol, input.period);
    case "get_earnings":        return getEarnings(input.symbol);
    case "get_market_context":  return getMarketContext();
    default:                    return { error: `Unknown tool: ${name}` };
  }
}
