export default function Page({ params }: { params: { ticker: string } }) {
  return (
    <div className="container mx-auto">
      <div>
        <h1>{params.ticker}</h1>
      </div>
    </div>
  );
}
