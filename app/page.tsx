import Dock from "@/components/dock/Dock";
import { Autocomplete } from "@/components/search/Autocomplete";

export default function Home() {
  return (
    <div className="container mx-auto">
      <Autocomplete />
      <Dock />
    </div>
  );
}
