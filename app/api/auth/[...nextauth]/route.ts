// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "../../../../auth";

const handler = NextAuth(authOptions);

// Тільки GET і POST - решта не потрібно!
export { handler as GET, handler as POST };
