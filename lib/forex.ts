import { getDb, updateDb } from "./db";

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 Hours TTL

export interface ExchangeRatesResult {
  base: string;
  cachedAt: string;
  isStale: boolean;
  rates: Record<string, number>;
}

/**
 * Fetches live exchange rates for a given base currency with 12-hour caching in data/db.json.
 * Falls back gracefully to cached rates if offline or external APIs fail.
 */
export async function getExchangeRates(
  baseCurrency: string = "USD",
  forceRefresh: boolean = false
): Promise<ExchangeRatesResult> {
  const upperBase = baseCurrency.toUpperCase();
  const db = await getDb();
  const cache = db.exchange_rates_cache;

  const now = Date.now();
  const cacheTime = new Date(cache?.updatedAt || 0).getTime();
  const isFresh = !forceRefresh && cache?.base === upperBase && now - cacheTime < CACHE_TTL_MS;

  if (isFresh && cache?.rates && Object.keys(cache.rates).length > 0) {
    return {
      base: upperBase,
      cachedAt: cache.updatedAt,
      isStale: false,
      rates: cache.rates,
    };
  }

  // Attempt 1: Frankfurter API (European Central Bank data, 100% free, no API key)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://api.frankfurter.app/latest?from=${upperBase}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const rates: Record<string, number> = {
        [upperBase]: 1,
        ...data.rates,
      };

      // Add common regional currencies if missing from ECB
      if (!rates["DZD"]) rates["DZD"] = 134.50;
      if (!rates["MAD"]) rates["MAD"] = 9.95;
      if (!rates["EGP"]) rates["EGP"] = 48.80;

      // Update cache
      await updateDb((currentDb) => {
        currentDb.exchange_rates_cache = {
          base: upperBase,
          updatedAt: new Date().toISOString(),
          rates,
        };
      });

      return {
        base: upperBase,
        cachedAt: new Date().toISOString(),
        isStale: false,
        rates,
      };
    }
  } catch (err) {
    console.warn("[Forex] Frankfurter API fetch failed, trying fallback:", err);
  }

  // Attempt 2: Fallback to open.er-api.com
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://open.er-api.com/v6/latest/${upperBase}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data.rates) {
        await updateDb((currentDb) => {
          currentDb.exchange_rates_cache = {
            base: upperBase,
            updatedAt: new Date().toISOString(),
            rates: data.rates,
          };
        });

        return {
          base: upperBase,
          cachedAt: new Date().toISOString(),
          isStale: false,
          rates: data.rates,
        };
      }
    }
  } catch (err) {
    console.warn("[Forex] Fallback API failed:", err);
  }

  // Fallback: Return existing cached rates or baseline defaults
  console.log("[Forex] Serving cached or fallback baseline rates");
  return {
    base: upperBase,
    cachedAt: cache?.updatedAt || new Date().toISOString(),
    isStale: true,
    rates: cache?.rates || {
      USD: 1,
      EUR: 0.925,
      GBP: 0.785,
      JPY: 151.70,
      CAD: 1.38,
      DZD: 134.50,
      MAD: 9.95,
      EGP: 48.80,
    },
  };
}

/**
 * Converts an arbitrary amount between two currencies using live/cached rates.
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<{ convertedAmount: number; rate: number }> {
  const fromUpper = fromCurrency.toUpperCase();
  const toUpper = toCurrency.toUpperCase();

  if (fromUpper === toUpper) {
    return { convertedAmount: amount, rate: 1 };
  }

  const { rates } = await getExchangeRates(fromUpper);
  const rate = rates[toUpper] || 1;
  const convertedAmount = parseFloat((amount * rate).toFixed(2));

  return {
    convertedAmount,
    rate,
  };
}
