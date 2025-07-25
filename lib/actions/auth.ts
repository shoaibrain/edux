'use server';

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  // Destroy the session cookie by setting its expiration date to the past
  (await cookies()).set("authToken", "", { expires: new Date(0) });
  // Redirect to the login page
  redirect('/login');
}