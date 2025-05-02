// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Add LinkedIn or other providers if needed
  ],
  pages: {
    signIn: "/auth/signin", // Optional: Custom sign-in page
  },
  session: {
    strategy: "jwt", // Default strategy is "jwt"
  },
});
