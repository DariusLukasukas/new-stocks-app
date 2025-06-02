import Image from "next/image";

export default function TickerImage({ ticker }: { ticker: string }) {
  const imageUrl = `https://images.financialmodelingprep.com/symbol/${ticker.toLocaleUpperCase()}.png`;
  return (
    <Image
      src={imageUrl}
      alt={`Logo for ${ticker}`}
      width={48}
      height={48}
      quality={100}
      priority
    />
  );
}
