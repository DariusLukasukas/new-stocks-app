import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login, signup } from "@/components/auth/actions";
import Link from "next/link";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  return (
    <Card className="bg-background-primary w-full max-w-md border-none shadow-none">
      <CardHeader className="pb-6">
        <CardTitle className="text-center text-4xl text-balance">
          {mode === "login" ? "Welcome back" : "Create your free account"}
        </CardTitle>
        {mode === "signup" ? (
          <CardDescription className="text-text-secondary py-3 text-center font-medium tracking-tight text-balance">
            {
              "Create a free account to track and get alerts on 5,000+ stocks in real time. No credit card required."
            }
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="p-1">
        <form className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter email address"
              className="bg-background-tertiary dark:bg-background-tertiary placeholder:text-text-tertiary h-12 rounded-xl border-none text-base font-semibold shadow-none md:text-base"
            />
          </div>
          <div className="grid gap-2">
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter password"
              className="bg-background-tertiary dark:bg-background-tertiary placeholder:text-text-tertiary h-12 rounded-xl border-none text-base font-semibold shadow-none md:text-base"
            />
          </div>
          {mode === "login" ? (
            <Button
              size={"lg"}
              formAction={login}
              className="rounded-3xl text-base font-semibold"
            >
              Log in
            </Button>
          ) : (
            <Button
              size={"lg"}
              formAction={signup}
              className="rounded-3xl text-base font-semibold"
            >
              Sign up
            </Button>
          )}
        </form>
      </CardContent>
      {mode === "signup" ? (
        <CardFooter className="text-text-secondary justify-center gap-2 pt-6 text-center text-sm font-medium tracking-tight">
          <p>Already have an account?</p>
          <Link href="/login" prefetch={false} className="hover:opacity-80">
            Log in
          </Link>
        </CardFooter>
      ) : null}
    </Card>
  );
}
