## Overview
This application is designed to help you quickly search for U.S. publicly traded companies by ticker or name, retrieve up-to-date financial data, and visualize key metrics.

## Features
- Trie-based Autocomplete: For fast and efficient by company name or ticker lookups.
- Finance API Integration: Fetching real-time and historical stock data from Yahoo Finance.
- Interactive Charts: Visualizing stock performance using Recharts library.

## Data Sources
Company Tickers Dataset
File: company_tickers_exchange.json 
Size: 539.29 kB 
Remote Source: SEC.gov

This JSON file contains basic identification information about publicly traded companies filing with the U.S. Securities and Exchange Commission (SEC). Each entry consists of:
- CIK (Central Index Key): Unique identifier assigned by the SEC.
- Name: The company’s official name.
- Ticker: The symbol under which the company trades.
- Exchange: The stock exchange where the company is listed.
  
The JSON object has two primary keys:
- fields: an array of field names in order, e.g. ["cik", "name", "ticker", "exchange"].
- data: an array of company records, each structured like [789019, "MICROSOFT CORP", "MSFT", "Nasdaq"].

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
