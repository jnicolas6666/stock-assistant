import YahooFinance from "yahoo-finance2";
import { NextRequest, NextResponse } from "next/server";

const yahooFinance = new YahooFinance({ validation: { logErrors: false } });

const FETCH_OPTS = {
  fetchOptions: {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.5",
    },
  },
};

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });

  try {
    // The "price" quoteSummary module is the most reliable source —
    // always returns regularMarketPreviousClose even when markets are closed.
    const summary = await (yahooFinance as any).quoteSummary(symbol, {
      modules: ["price"],
      fetchOptions: FETCH_OPTS.fetchOptions,
    });

    const p = summary?.price ?? {};

    // Best available price: live > post-market > pre-market > previous close
    const price =
      p.regularMarketPrice ??
      p.postMarketPrice ??
      p.preMarketPrice ??
      p.regularMarketPreviousClose ??
      null;

    if (price == null) {
      return NextResponse.json({ error: "price unavailable" }, { status: 404 });
    }

    return NextResponse.json({
      price,
      previousClose: p.regularMarketPreviousClose ?? null,
      postMarketPrice: p.postMarketPrice ?? null,
      currency: p.currency ?? "USD",
      change: p.regularMarketChange ?? 0,
      changePercent: p.regularMarketChangePercent ?? 0,
      longName: p.longName ?? p.shortName ?? symbol,
      shortName: p.shortName ?? symbol,
      marketState: p.marketState ?? "CLOSED",
    });
  } catch {
    // Fallback to basic quote if quoteSummary fails
    try {
      const q = await (yahooFinance as any).quote(symbol, {}, FETCH_OPTS);
      const price =
        q.regularMarketPrice ??
        q.regularMarketPreviousClose ??
        null;
      if (price == null) {
        return NextResponse.json({ error: "price unavailable" }, { status: 404 });
      }
      return NextResponse.json({
        price,
        previousClose: q.regularMarketPreviousClose ?? null,
        currency: q.currency ?? "USD",
        change: q.regularMarketChange ?? 0,
        changePercent: q.regularMarketChangePercent ?? 0,
        longName: q.longName ?? q.shortName ?? symbol,
        shortName: q.shortName ?? symbol,
        marketState: q.marketState ?? "CLOSED",
      });
    } catch (e2: any) {
      return NextResponse.json({ error: e2?.message ?? "failed" }, { status: 500 });
    }
  }
}
