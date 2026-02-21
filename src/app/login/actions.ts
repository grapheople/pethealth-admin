"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac } from "crypto";

const ADMIN_ID = process.env.ADMIN_ID ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7일

// Server Actions는 Node.js runtime이므로 crypto 사용 가능
function makeToken(password: string): string {
  return createHmac("sha256", "pethealth-admin-salt")
    .update(password)
    .digest("hex");
}

export async function login(_prev: { error: string } | null, formData: FormData) {
  const password = formData.get("password") as string;

  if (!ADMIN_ID || !ADMIN_PASSWORD) {
    return { error: "서버에 ADMIN_ID 또는 ADMIN_PASSWORD가 설정되지 않았습니다" };
  }

  const username = formData.get("username") as string;

  if (username !== ADMIN_ID || password !== ADMIN_PASSWORD) {
    return { error: "아이디 또는 비밀번호가 일치하지 않습니다" };
  }

  const token = makeToken(password);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}
