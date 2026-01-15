"use server";

import { signIn } from "next-auth";

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function signInWithGitHub() {
  await signIn("github", { redirectTo: "/" });
}

export async function signInWithCredentials(email: string, password: string) {
  const result = await signIn("credentials", {
    email,
    password,
    redirectTo: "/",
  });

  if (!result || result.error) {
    throw new Error("Помилка входу. Перевірьте email та пароль");
  }

  return result;
}
