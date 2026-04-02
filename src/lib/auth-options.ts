import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
