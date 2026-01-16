// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "../../../../auth";

const handler = NextAuth(authOptions);

// Обов'язково для App Router на Vercel
export { handler as GET, handler as POST };

// Додайте цей експорт для всіх методів (опційно)
export { handler as PUT, handler as DELETE, handler as PATCH };
