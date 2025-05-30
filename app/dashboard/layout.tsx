import Dock from "@/components/dock/Dock";
import { Autocomplete } from "@/components/search/Autocomplete";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <>
      {children}
      <Dock />
      <Autocomplete />
    </>
  );
}
