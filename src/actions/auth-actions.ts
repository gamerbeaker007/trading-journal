"use server";

import { signIn, signOut } from "@auth";

export async function signInAction(formData: FormData) {
  await signIn("credentials", {
    password: formData.get("password"),
    redirectTo: "/",
  });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
