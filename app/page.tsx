import { Container } from "@/components/ui/container";
// import yahooFinance from "yahoo-finance2";

// async function getWatchlistData() {
//   const tickers = ["AAPL", "MSFT", "TSLA", "META"];
//   const fields: "regularMarketPrice"[] = ["regularMarketPrice"];

//   const watchlist = await Promise.all(
//     tickers.map(async (ticker) => {
//       try {
//         const result = await yahooFinance.quoteCombine(ticker, { fields });
//         return {
//           ticker,
//           regularMarketPrice: result.regularMarketPrice ?? null,
//         };
//       } catch (error) {
//         console.error(`Error fetching data for ${ticker}:`, error);
//         return { ticker, regularMarketPrice: null };
//       }
//     }),
//   );
//   return watchlist;
// }

export default async function Home() {
  return <Container variant={"fullMobileConstrainedPadded"}></Container>;
}
