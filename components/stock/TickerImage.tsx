import Image from "next/image";

export default function TickerImage({ ticker }: { ticker: string }) {
  const imageUrl = `https://images.financialmodelingprep.com/symbol/${ticker.toLocaleUpperCase()}.png`;
  return (
    <Image
      src={imageUrl}
      alt={`Logo for ${ticker}`}
      width={24}
      height={24}
      quality={100}
      priority
    />
  );
}
