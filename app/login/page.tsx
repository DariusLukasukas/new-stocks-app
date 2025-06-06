import AuthForm from "@/components/auth/AuthForm";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Stocks",
  description: "Login page for the Stocks app",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <AuthForm mode="login" />
    </div>
  );
}
