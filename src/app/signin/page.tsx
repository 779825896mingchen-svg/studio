"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LogIn, Mail, Key, ArrowRight, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SignInPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [identifierTouched, setIdentifierTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const identifierDigits = identifier.replace(/\D/g, "").slice(0, 10);
  const isValidEmail = /\S+@\S+\.\S+/.test(identifier.trim());
  const isValidPhone = identifierDigits.length === 10;
  const isValidIdentifier = isValidEmail || isValidPhone;
  const isValidPassword = password.trim().length >= 6;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setIdentifierTouched(true);
    setPasswordTouched(true);

    if (!isValidIdentifier || !isValidPassword) {
      toast({
        title: "Check your details",
        description: "Enter a valid email or phone number and a password (6+ characters).",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: data?.error || "Invalid email/phone or password.",
        });
        return;
      }

      toast({
        title: "Signed in",
        description: "Welcome back.",
      });

      router.push("/account");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="rounded-3xl border-border/60 bg-card/95 shadow-sm">
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <LogIn className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sign in to access your cart and manage orders.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="identifier" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Email or Phone
                  </Label>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="you@example.com or (919) 555-1234"
                    value={identifier}
                    autoComplete="username"
                    onChange={(e) => setIdentifier(e.target.value)}
                    onBlur={() => setIdentifierTouched(true)}
                    className="h-11 rounded-xl"
                  />
                  {!isValidIdentifier && identifierTouched && (
                    <p className="text-[12px] text-destructive">Please enter a valid email or 10-digit phone number.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Key className="w-4 h-4 text-muted-foreground" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    className="h-11 rounded-xl"
                  />
                  {!isValidPassword && passwordTouched && (
                    <p className="text-[12px] text-destructive">
                      Password must be at least 6 characters.
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base md:text-lg rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl border border-input bg-background hover:bg-accent flex items-center justify-center gap-3 text-sm md:text-base font-medium"
                onClick={() => {
                  toast({
                    title: "Google Sign-In UI",
                    description: "Wire this button to Google OAuth when you’re ready.",
                  });
                }}
              >
                <Image src="/google-g.png" alt="Google" width={18} height={18} />
                <span>Sign in with Google</span>
              </Button>

              <Separator />

              <p className="text-sm text-muted-foreground text-center">
                <Link href="/forgot-password" className="text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </p>

              <p className="text-sm text-muted-foreground text-center">
                New here?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Create an account
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

