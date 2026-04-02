"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, KeyRound, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [loading, setLoading] = useState(false);

  const normalizedEmailList = useMemo(() => email.trim().toLowerCase(), [email]);
  const emailLooksValid = useMemo(
    () => /\S+@\S+\.\S+/.test(normalizedEmailList),
    [normalizedEmailList],
  );

  const requestCode = async () => {
    if (!emailLooksValid) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Enter the email address you used to sign up.",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmailList }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Could not send email",
          description: data?.error || "Please try again.",
        });
        return;
      }

      setCodeRequested(true);
      toast({
        title: "Check your email",
        description:
          "If that address is registered, you should receive a code. If mail isn’t configured on this server, open the newest HTML file in data/outbox.",
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
        body: JSON.stringify({
          email: normalizedEmailList,
          code,
          newPassword,
        }),
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
              <CardTitle className="text-2xl">Reset password</CardTitle>
              <p className="text-sm text-muted-foreground">
                We&apos;ll email a one-time code to your address. Enter it below with a new password.
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {!codeRequested ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 rounded-xl h-11"
                    onClick={() => void requestCode()}
                    disabled={loading || !email.trim()}
                  >
                    {loading ? "Sending…" : "Send reset code"}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Code sent to <span className="font-medium text-foreground">{email.trim()}</span>.{" "}
                    <button
                      type="button"
                      className="text-primary font-medium underline-offset-4 hover:underline"
                      onClick={() => {
                        setCodeRequested(false);
                        setCode("");
                      }}
                    >
                      Use a different email
                    </button>
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="code" className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-muted-foreground" />
                      Verification code
                    </Label>
                    <Input
                      id="code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6-digit code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>

                  <Button
                    className="w-full bg-primary hover:bg-primary/90 rounded-xl h-11"
                    onClick={() => void resetPassword()}
                    disabled={loading || code.length < 6 || !newPassword.trim() || !confirmPassword.trim()}
                  >
                    {loading ? "Resetting…" : "Reset password"}
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
