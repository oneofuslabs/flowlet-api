import fetch from "node-fetch";

type RateResponseItem = {
  usd: number;
  rate: number;
  symbol: string;
};

type PriceMap = {
  [key: string]: RateResponseItem;
};

type PriceResponse = {
  [key: string]: {
    usd: number;
    rate?: number;
  };
};

type CoinInfo = {
  symbol: string;
};

export const getRates = async (
  coinIds: string[],
  baseSymbol: string = "usd-coin"
): Promise<PriceMap> => {
  const finalIds = Array.from(new Set([...coinIds, baseSymbol]));
  const idsParam = finalIds.join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`CoinGecko price API error: ${res.status}`);

    const priceData = await res.json() as PriceResponse;
    const baseUsd = priceData[baseSymbol]?.usd;
    if (!baseUsd) throw new Error(`Base coin '${baseSymbol}' price not found.`);

    const results: PriceMap = {};

    for (const id of finalIds) {
      const usd = priceData[id]?.usd;
      if (!usd) continue;

      // Her coin için symbol'ü ayrı çağır
      const coinRes = await fetch(`https://api.coingecko.com/api/v3/coins/${id}`);
      const coinJson = (await coinRes.json()) as CoinInfo;
      const symbol = coinJson?.symbol?.toUpperCase() || "UNKNOWN";

      results[id] = {
        usd,
        rate: parseFloat((baseUsd / usd).toFixed(6)),
        symbol,
      };
    }

    return results;

  } catch (err) {
    console.log(err);
    return {};
  }
};
