import fetch from "node-fetch";

type CoinInput = {
  [id: string]: {
    tokenName: string;
    tokenAddress: string;
  };
};

type CoinOutput = {
  [id: string]: {
    tokenName: string;
    tokenAddress: string;
    usd: number;
    rate: number;
  };
};

export const getRates = async (
  coins: CoinInput,
): Promise<CoinOutput> => {
  const coinIds = Object.keys(coins);
  const idsParam = [...coinIds, "usd-coin"].join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);

    const priceData = (await res.json()) as { [id: string]: { usd: number } };

    const baseUsd = priceData["usd-coin"]?.usd;
    if (!baseUsd) throw new Error(`USDC ('usd-coin') price not found.`);

    const output: CoinOutput = {};

    for (const id of coinIds) {
      const coinInfo = coins[id];
      const usd = priceData[id]?.usd;
      if (!usd) continue;

      output[id] = {
        ...coinInfo,
        usd,
        rate: parseFloat((baseUsd / usd).toFixed(6)),
      };
    }

    return output;

  } catch (err) {
    console.log(err);
    return {};
  }
};
