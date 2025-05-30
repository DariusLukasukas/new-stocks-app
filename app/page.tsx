import HomepageDock from "@/components/dock/HomepageDock";
import Hero from "@/components/hero/hero";

export default async function Home() {
  return (
    <div className="relative">
      <HomepageDock />
      <Hero />

      <section className="bg-background-secondary mt-16 grid w-full place-items-center overflow-hidden rounded-3xl px-20 pt-20">
        <div className="bg-background-tertiary relative aspect-video size-full min-h-[445px] min-w-[668px] overflow-hidden rounded-t-3xl"></div>
      </section>
    </div>
  );
}
