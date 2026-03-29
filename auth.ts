import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin } from "./lib/supabase/server";
import bcryptjs from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { logger } from "./lib/logger";

function buildProviders() {
  const providers = [];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
    );
  }

  if (
    process.env.GITHUB_CLIENT_ID &&
    process.env.GITHUB_CLIENT_SECRET &&
    !process.env.GITHUB_CLIENT_ID.startsWith("your_")
  ) {
    providers.push(
      GitHub({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
      }),
    );
  }

  return providers;
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...buildProviders(),
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { data: user, error } = await supabaseAdmin
            .from("users")
            .select("id, email, password, name, is_admin, blocked")
            .eq("email", credentials.email)
            .single();

          if (error || !user) {
            logger.debug("Credentials user lookup failed");
            return null;
          }

          if (user.blocked === true) {
            logger.warn("Blocked user sign-in attempt");
            return null;
          }

          const isPasswordValid = await bcryptjs.compare(
            credentials.password,
            user.password,
          );

          if (!isPasswordValid) {
            logger.debug("Invalid credentials for email sign-in");
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            isAdmin: user.is_admin === true,
          };
        } catch (error) {
          logger.error("Authorization error", {
            error: error instanceof Error ? error.message : String(error),
          });
          return null;
        }
      },
    }),
  ],

  // ⚠️ КРИТИЧНО для Netlify:
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/account",
  },

  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT & { id?: string; isAdmin?: boolean };
      user?: { id: string; isAdmin?: boolean };
    }) {
      try {
        if (user) {
          token.id = user.id;
          token.isAdmin = user.isAdmin === true;
        }
        return token;
      } catch (err) {
        logger.error("JWT callback error", {
          error: err instanceof Error ? err.message : String(err),
        });
        return token;
      }
    },

    async session({ session, token }) {
      try {
        if (session.user && token.id) {
          session.user.id = token.id as string;
          session.user.isAdmin = (token as JWT & { isAdmin?: boolean })
            .isAdmin === true;
        }
        return session;
      } catch (err) {
        logger.error("Session callback error", {
          error: err instanceof Error ? err.message : String(err),
        });
        return session;
      }
    },
  },

  // ⚠️ Додайте для production:
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
