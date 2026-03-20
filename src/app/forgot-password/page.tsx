"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, KeyRound, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Channel = "email" | "phone";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [channel, setChannel] = useState<Channel>("email");
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, identifier }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Could not send code",
          description: data?.error || "Please try again.",
        });
        return;
      }

      setCodeRequested(true);
      toast({
        title: "Code sent",
        description:
          channel === "email"
            ? "Check your email (local outbox file) for the reset code."
            : "Check your phone notification file (local outbox) for the reset code.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword.length < 6 || newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Check your password",
        description: "Password must be 6+ characters and match confirmation.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, identifier, code, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Reset failed",
          description: data?.error || "Invalid code or account.",
        });
        return;
      }

      toast({
        title: "Password updated",
        description: "You can now sign in with your new password.",
      });

      window.location.href = "/signin";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-lg mx-auto">
          <Card className="rounded-3xl border-border/60 bg-card/95 shadow-sm">
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Forgot Password</CardTitle>
              <p className="text-sm text-muted-foreground">
                Request a verification code by email or phone, then set a new password.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <Tabs
                value={channel}
                onValueChange={(v) => setChannel(v as Channel)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 w-full rounded-xl">
                  <TabsTrigger value="email" className="rounded-lg">Email</TabsTrigger>
                  <TabsTrigger value="phone" className="rounded-lg">Phone</TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier-email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email
                    </Label>
                    <Input
                      id="identifier-email"
                      type="email"
                      placeholder="you@example.com"
                      value={channel === "email" ? identifier : ""}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="identifier-phone" className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Phone Number
                    </Label>
                    <Input
                      id="identifier-phone"
                      type="tel"
                      placeholder="(919) 555-1234"
                      value={channel === "phone" ? identifier : ""}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {!codeRequested ? (
                <Button
                  className="w-full bg-primary hover:bg-primary/90 rounded-xl h-11"
                  onClick={requestCode}
                  disabled={loading || !identifier.trim()}
                >
                  {loading ? "Sending..." : "Send verification code"}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-muted-foreground" />
                      Verification Code
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 rounded-xl h-11"
                    onClick={resetPassword}
                    disabled={loading || !code.trim() || !newPassword.trim() || !confirmPassword.trim()}
                  >
                    {loading ? "Resetting..." : "Reset password"}
                  </Button>
                </div>
              )}

              <p className="text-sm text-muted-foreground text-center">
                Remembered your password?{" "}
                <Link href="/signin" className="text-primary hover:underline font-medium">
                  Back to sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

