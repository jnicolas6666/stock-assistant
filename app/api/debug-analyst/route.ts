import YahooFinance from "yahoo-finance2";
import { NextRequest, NextResponse } from "next/server";

const yahooFinance = new YahooFinance({ validation: { logErrors: false } });
const NO_VALIDATE = { validateResult: false } as any;

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
  "Accept-Language": "en-US,en;q=0.5",
};

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") ?? "AC.TO";

  const results: Record<string, any> = {};

  // 1. recommendationTrend via library
  try {
    const r = await yahooFinance.quoteSummary(symbol, { modules: ["recommendationTrend"] as any, fetchOptions: FETCH_OPTS.fetchOptions } as any, NO_VALIDATE);
    results.lib_recommendationTrend = (r as any)?.recommendationTrend ?? null;
  } catch (e: any) { results.lib_recommendationTrend_error = e.message; }

  // 2. financialData via library
  try {
    const r = await yahooFinance.quoteSummary(symbol, { modules: ["financialData"] as any, fetchOptions: FETCH_OPTS.fetchOptions } as any, NO_VALIDATE);
    const fd = (r as any)?.financialData ?? null;
    results.lib_financialData = {
      recommendationKey: fd?.recommendationKey,
      numberOfAnalystOpinions: fd?.numberOfAnalystOpinions,
      targetMeanPrice: fd?.targetMeanPrice,
      targetHighPrice: fd?.targetHighPrice,
      targetLowPrice: fd?.targetLowPrice,
    };
  } catch (e: any) { results.lib_financialData_error = e.message; }

  // 3. yfRest recommendationTrend
  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(symbol)}?modules=recommendationTrend`;
    const res = await fetch(url, { headers: YF_HEADERS, cache: "no-store" });
    const json = await res.json();
    results.yfRest_status = res.status;
    results.yfRest_recommendationTrend = json?.quoteSummary?.result?.[0]?.recommendationTrend ?? null;
    results.yfRest_error = json?.quoteSummary?.error ?? null;
  } catch (e: any) { results.yfRest_error = e.message; }

  // 4. combined modules (original approach)
  try {
    const r = await yahooFinance.quoteSummary(symbol, { modules: ["recommendationTrend", "financialData"] as any, fetchOptions: FETCH_OPTS.fetchOptions } as any, NO_VALIDATE);
    results.lib_combined_trend = (r as any)?.recommendationTrend?.trend ?? null;
    results.lib_combined_fd_key = (r as any)?.financialData?.recommendationKey ?? null;
  } catch (e: any) { results.lib_combined_error = e.message; }

  return NextResponse.json(results);
}
