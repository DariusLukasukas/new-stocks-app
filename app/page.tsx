import HomepageDock from "@/components/dock/HomepageDock";
import Hero from "@/components/hero/hero";
import SlideShow from "@/components/hero/SlideShow";

export default async function Home() {
  return (
    <div className="relative">
      <HomepageDock />
      <Hero />

      <section className="bg-background-secondary mt-16 hidden w-full place-items-center overflow-hidden rounded-3xl px-20 pt-20 md:grid">
        <div className="bg-background relative aspect-video size-full min-h-[445px] min-w-[668px] overflow-hidden rounded-t-3xl">
          <SlideShow />
        </div>
      </section>
    </div>
  );
}
