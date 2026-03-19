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
import { UserPlus, Mail, Key, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SignUpPage() {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const isValidName = name.trim().length >= 2;
  const isValidEmail = /\S+@\S+\.\S+/.test(email);
  const isValidPassword = password.trim().length >= 6;
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();

    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (!isValidName || !isValidEmail || !isValidPassword || !doPasswordsMatch) {
      toast({
        title: "Check your details",
        description: "Make sure the name, email, and passwords are valid.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // No backend auth wired yet; this is UI scaffolding consistent with the rest of the app.
      toast({
        title: "Sign up UI",
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
                onClick={() => {
                  toast({
                    title: "Google Sign-Up UI",
                    description: "Wire this button to Google OAuth when you’re ready.",
                  });
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

