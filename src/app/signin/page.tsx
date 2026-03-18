"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn, Mail, Lock } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Demo-only UI. Wire this to your auth provider when ready.
      await new Promise((r) => setTimeout(r, 500));
      toast({
        title: "Welcome back",
        description: "Signed in (demo). You can now continue to the menu.",
      });
      router.push("/menu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <Card className="rounded-3xl border-border shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-3xl font-headline">Sign In</CardTitle>
              <CardDescription>Enter your details to continue.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-9 h-11 rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button type="button" variant="link" className="h-auto p-0 text-sm">
                      Forgot password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9 h-11 rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                    <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
                    Remember me
                  </label>
                  <Link href="/signup" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                    Create account
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90"
                >
                  <LogIn className="w-4 h-4" />
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <div className="relative">
                <Separator />
                <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-3 text-xs text-muted-foreground">
                  or
                </div>
              </div>

              <div className="grid gap-3">
                <Button variant="outline" className="h-11 rounded-xl">
                  <GoogleIcon className="w-4 h-4" />
                  Continue with Google
                </Button>
              </div>

              <div className="text-sm text-muted-foreground text-center">
                New here?{" "}
                <Link href="/signup" className="font-medium text-primary hover:underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

