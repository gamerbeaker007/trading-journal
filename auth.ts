import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: { password: { label: "Password", type: "password" } },
      async authorize(credentials) {
        const password = process.env.ADMIN_PASSWORD;
        if (!password) return null;
        if (credentials?.password !== password) return null;
        // Single admin user — no DB needed
        return { id: "admin", name: "Admin" };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
});
