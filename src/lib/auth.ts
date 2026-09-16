import { PrismaAdapter } from "@auth/prisma-adapter";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { DEMO_USERS, DEMO_PASSWORD } from "../mocks/users";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid email or password");
        }

        const inputEmail = credentials.email.trim().toLowerCase();
        const inputPassword = credentials.password;

        // 1. Try database authentication first
        try {
          const user = await prisma.user.findUnique({
            where: { email: inputEmail },
          });

          if (user && user.passwordHash) {
            const isPasswordValid = await bcrypt.compare(
              inputPassword,
              user.passwordHash
            );

            if (isPasswordValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl ?? undefined,
                institution: user.institution ?? undefined,
                hospitalName: user.hospitalName ?? undefined,
              };
            }
          }
        } catch (dbError) {
          console.warn("Prisma user lookup skipped or failed, falling back to demo users", dbError);
        }

        // 2. Demo users fallback (allows nurse, doctor, patient, radiologist, etc. to log in seamlessly)
        const demoUser = DEMO_USERS.find(
          (u) => u.email.toLowerCase() === inputEmail
        );

        if (demoUser) {
          const isPasswordValid =
            inputPassword === DEMO_PASSWORD ||
            inputPassword === demoUser.passwordHash ||
            (await bcrypt.compare(inputPassword, demoUser.passwordHash).catch(() => false));

          if (isPasswordValid) {
            return {
              id: demoUser.id,
              email: demoUser.email,
              name: demoUser.name,
              role: demoUser.role,
              avatarUrl: demoUser.avatarUrl,
              institution: demoUser.institution,
              hospitalName: demoUser.hospitalName,
            };
          }
        }

        throw new Error("Invalid email or password");
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.avatarUrl = (user as any).avatarUrl;
        token.institution = (user as any).institution;
        token.hospitalName = (user as any).hospitalName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).avatarUrl = token.avatarUrl;
        (session.user as any).institution = token.institution;
        (session.user as any).hospitalName = token.hospitalName;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "breastcare_ai_super_secret_jwt_key_2026",
};
