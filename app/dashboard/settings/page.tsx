import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { createClient } from "@/utils/supabase/server";
import { Mail, User } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function page() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <Container variant={"fullMobileConstrainedPadded"}>
      <div className="mx-auto max-w-lg">
        <Card className="bg-secondary dark:bg-secondary/50 w-full border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-xl">Settings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-row items-center gap-2">
                <i className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <User className="size-5 stroke-2" />
                </i>
                <h2 className="font-semibold">Account</h2>
              </div>
              <div className="bg-card flex flex-row items-center justify-center gap-2 rounded-lg px-3 py-2 font-medium">
                <Mail className="text-muted-foreground size-5" />
                {data.user.email}
              </div>
            </div>

            <form action="/auth/signout" method="post">
              <Button
                variant={"secondary"}
                className="bg-card hover:bg-card/80 w-full text-red-500 hover:text-red-500"
              >
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
