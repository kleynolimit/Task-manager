import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL || 'pavel@landstargpk.com';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Only allow Pablo's email
      if (user.email === ALLOWED_EMAIL) {
        return true;
      }
      return false;
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
