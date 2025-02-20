import Earnings from "@/components/stock/Earnings";

export default async function Home() {
  return (
    <div className="container mx-auto p-2">
      <div className="w-1/2">
        <Earnings ticker="TSLA" />
      </div>
    </div>
  );
}
