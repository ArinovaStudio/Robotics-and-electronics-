import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import prisma from "@/app/lib/db";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "CUSTOMER",
          emailVerified: new Date(),
        };
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email before logging in");
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        // For Google OAuth, user.id is profile.sub — we need the real DB user ID
        if (account?.provider === "google" && user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true },
          });
          if (dbUser) {
            token.userId = dbUser.id;
            token.role = dbUser.role || "CUSTOMER";
          } else {
            token.userId = user.id;
            token.role = "CUSTOMER";
          }
        } else {
          // Credentials login — user.id is already the DB id
          token.userId = user.id;
          token.role = user.role || "CUSTOMER";
        }
        token.email = user.email;
      }

      // Handle session update
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // For OAuth providers (Google)
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email as string },
          });

          // If user doesn't exist, create with proper defaults
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email as string,
                name: user.name as string,
                image: user.image,
                emailVerified: new Date(),
                role: "CUSTOMER",
              },
            });
          } else {
            // Update existing user's emailVerified if not set
            if (!existingUser.emailVerified) {
              await prisma.user.update({
                where: { email: user.email as string },
                data: {
                  emailVerified: new Date(),
                  image: user.image,
                },
              });
            }
          }
        } catch (error) {
          console.error("Error in Google signIn callback:", error);
          return false;
        }
      }
      return true;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
