"use server";

import { redirect } from "next/navigation";
import { setSession } from "@/lib/auth";

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    await setSession(username);
    redirect("/admin");
  }

  await new Promise((resolve) => setTimeout(resolve, 1500));
  return { error: "Feil brukernavn eller passord" };
}
