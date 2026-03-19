"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LogIn, Mail, Key, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SignInPage() {
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const isValidEmail = /\S+@\S+\.\S+/.test(email);
  const isValidPassword = password.trim().length >= 6;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!isValidEmail || !isValidPassword) {
      toast({
        title: "Check your details",
        description: "Enter a valid email and a password (6+ characters).",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // No backend auth wired yet; this is UI scaffolding consistent with the rest of the app.
      toast({
        title: "Sign in UI",
        description: "This page is ready for auth integration. Wire it to Firebase/custom auth when you’re ready.",
      });
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
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    className="h-11 rounded-xl"
                  />
                  {!isValidEmail && emailTouched && (
                    <p className="text-[12px] text-destructive">Please enter a valid email.</p>
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

