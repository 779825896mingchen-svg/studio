"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Mail, Key, ArrowRight, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SignUpPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });

  const isValidName = name.trim().length >= 2;
  const isValidEmail = /\S+@\S+\.\S+/.test(email);
  const phoneDigits = phone.replace(/\D/g, "").slice(0, 10);
  const isValidPhone = phoneDigits.length === 10;
  const isValidPassword = password.trim().length >= 6;
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true });

    if (!isValidName || !isValidEmail || !isValidPhone || !isValidPassword || !doPasswordsMatch) {
      toast({
        title: "Check your details",
        description: "Make sure the name, email, phone, and passwords are valid.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone: phoneDigits, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: data?.error || "Please check your details.",
        });
        return;
      }

      toast({
        title: "Account created",
        description: "Please sign in.",
      });

      router.push("/signin");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background relative">
      <Navbar />

      {googlePending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-sm px-4"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="max-w-sm w-full rounded-3xl border border-border/60 bg-card/95 shadow-lg px-8 py-10 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-foreground">Connecting to Google</p>
              <p className="text-sm text-muted-foreground">
                Hang on — we&apos;re redirecting you to complete sign-in safely.
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="rounded-3xl border-border/60 bg-card/95 shadow-sm">
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <p className="text-sm text-muted-foreground">
                Get started with Emperor&apos;s Choice.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Alex Chen"
                    value={name}
                    autoComplete="name"
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                    className="h-11 rounded-xl"
                  />
                  {!isValidName && touched.name && (
                    <p className="text-[12px] text-destructive">Please enter your name.</p>
                  )}
                </div>

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
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    className="h-11 rounded-xl"
                  />
                  {!isValidEmail && touched.email && (
                    <p className="text-[12px] text-destructive">Please enter a valid email.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(919) 555-1234"
                    value={phone}
                    autoComplete="tel"
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                    className="h-11 rounded-xl"
                  />
                  {!isValidPhone && touched.phone && (
                    <p className="text-[12px] text-destructive">Please enter a valid 10-digit phone number.</p>
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
                    placeholder="Create a password"
                    value={password}
                    autoComplete="new-password"
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                    className="h-11 rounded-xl"
                  />
                  {!isValidPassword && touched.password && (
                    <p className="text-[12px] text-destructive">
                      Password must be at least 6 characters.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-type your password"
                    value={confirmPassword}
                    autoComplete="new-password"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
                    className="h-11 rounded-xl"
                  />
                  {touched.confirmPassword && !doPasswordsMatch && confirmPassword.length > 0 && (
                    <p className="text-[12px] text-destructive">Passwords do not match.</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base md:text-lg rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Sign Up"}
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </Button>
              </form>

              <Separator />

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 rounded-xl border border-input bg-background hover:bg-accent flex items-center justify-center gap-3 text-sm md:text-base font-medium"
                disabled={isSubmitting || googlePending}
                onClick={() => {
                  setGooglePending(true);
                  void signIn("google", { callbackUrl: "/account" });
                }}
              >
                <Image src="/google-g.png" alt="Google" width={18} height={18} />
                <span>Sign up with Google</span>
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <Link href="/signin" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

