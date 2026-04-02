"use client";

import Link from "next/link";
import Image from "next/image";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert } from "lucide-react";

const ERROR_COPY: Record<string, string> = {
  OAuthSignin: "Could not reach Google. Try again in a moment.",
  OAuthCallback: "Something went wrong after signing in with Google.",
  OAuthAccountNotLinked: "This account is linked to another sign-in method.",
  AccessDenied: "Access was denied.",
  Configuration: "Sign-in is not configured correctly on the server.",
  Verification: "The sign-in link expired or was already used.",
  Default: "Sign-in didn’t complete. Try again.",
};

function OAuthSignInInner() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account";
  const errorCode = searchParams.get("error");
  const errorMessage = errorCode ? ERROR_COPY[errorCode] ?? ERROR_COPY.Default : null;

  const [busy, setBusy] = useState(false);

  const startGoogle = () => {
    setBusy(true);
    void signIn("google", { callbackUrl });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="rounded-3xl border-border/60 bg-card/95 shadow-sm overflow-hidden">
            <CardHeader className="text-center space-y-3 pb-2">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Image src="/google-g.png" alt="" width={28} height={28} />
              </div>
              <CardTitle className="text-2xl">Continue with Google</CardTitle>
              <p className="text-sm text-muted-foreground">
                Sign in to Emperor&apos;s Choice with your Google account. You&apos;ll be sent to Google to
                confirm, then brought back here.
              </p>
            </CardHeader>
            <CardContent className="space-y-5 pt-2">
              {errorMessage && (
                <div
                  role="alert"
                  className="flex gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-foreground"
                >
                  <ShieldAlert className="w-5 h-5 shrink-0 text-destructive" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <Button
                type="button"
                className="w-full h-12 rounded-xl bg-background text-foreground border border-border shadow-sm hover:bg-muted flex items-center justify-center gap-3 text-sm md:text-base font-medium"
                onClick={startGoogle}
                disabled={busy}
              >
                {busy ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span>Opening Google…</span>
                  </>
                ) : (
                  <>
                    <Image src="/google-g.png" alt="" width={18} height={18} />
                    <span>Sign in with Google</span>
                  </>
                )}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                <Link href="/signin" className="text-primary hover:underline font-medium">
                  Back to email sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function OAuthSignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <OAuthSignInInner />
    </Suspense>
  );
}
