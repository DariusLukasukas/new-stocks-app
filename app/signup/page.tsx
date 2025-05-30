import AuthForm from "@/components/auth/AuthForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Signup | Stocks",
  description: "Signup page for the Stocks app",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <AuthForm mode="signup" />
    </div>
  );
}
