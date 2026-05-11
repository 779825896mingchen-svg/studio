import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";
import { ensureAdminAccount, getAccountByEmail } from "@/app/lib/auth/local-auth-store";
import { OAUTH_GOOGLE_INTENT_COOKIE } from "@/app/lib/auth/set-google-oauth-intent";

function appBaseUrl() {
  const u = (process.env.NEXTAUTH_URL || "").trim().replace(/\/$/, "");
  return u || "http://localhost:9003";
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/signin/oauth",
  },
  theme: {
    colorScheme: "light",
    brandColor: "#c33d22",
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      await ensureAdminAccount();
      if (account?.provider === "google" && user?.email) {
        const email = user.email.trim().toLowerCase();
        const existing = await getAccountByEmail(email);
        const jar = await cookies();
        const intent = jar.get(OAUTH_GOOGLE_INTENT_COOKIE)?.value;
        jar.delete(OAUTH_GOOGLE_INTENT_COOKIE);

        const base = appBaseUrl();

        if (existing && intent === "signup") {
          const emailQ = encodeURIComponent(email);
          return `${base}/signin?googleHasAccount=1&email=${emailQ}`;
        }

        if (!existing) {
          const name = encodeURIComponent((user.name || "").trim());
          const emailQ = encodeURIComponent(email);
          return `${base}/signup?google=1&name=${name}&email=${emailQ}`;
        }
      }
      return true;
    },
    async jwt({ token, profile }) {
      const pic =
        profile && typeof profile === "object" && "picture" in profile
          ? (profile as { picture?: string }).picture
          : undefined;
      if (pic) token.picture = pic;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.image =
          (token.picture as string | undefined) ?? session.user.image ?? undefined;
      }
      return session;
    },
  },
};
