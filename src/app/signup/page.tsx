"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UserPlus, Mail, Lock, UserRound } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export default function SignUpPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Demo-only UI. Wire this to your auth provider when ready.
      await new Promise((r) => setTimeout(r, 650));
      toast({
        title: "Account created",
        description: "Signed up (demo). Welcome to Emperor’s Choice.",
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
              <CardTitle className="text-3xl font-headline">Create Account</CardTitle>
              <CardDescription>Create an account to save favorites and track orders.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Your name"
                      className="pl-9 h-11 rounded-xl"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

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
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="At least 8 characters"
                      className="pl-9 h-11 rounded-xl"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90"
                >
                  <UserPlus className="w-4 h-4" />
                  {isSubmitting ? "Creating..." : "Create Account"}
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
                  Sign up with Google
                </Button>
              </div>

              <div className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <Link href="/signin" className="font-medium text-primary hover:underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

