import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth";
import { getAdminAuthConfig } from "@/lib/auth-config";
import { COOKIE_NAME } from "@/lib/auth-constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { password } = await request.json().catch(() => ({}));
  const config = getAdminAuthConfig();

  if (!config.ok) {
    console.error(`[admin-auth-config] ${config.message}`);
    return NextResponse.json(
      {
        code: "ADMIN_AUTH_CONFIG_ERROR",
        error: config.message,
        setup:
          "Create .env in the project root, set AUTH_SECRET and ADMIN_PASSWORD_HASH, then restart npm run dev."
      },
      { status: 500 }
    );
  }

  if (typeof password !== "string" || !password.trim()) {
    return NextResponse.json({ error: "Password is required." }, { status: 400 });
  }

  try {
    const passwordMatches = await bcrypt.compare(password, config.passwordHash);

    if (!passwordMatches) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const token = await createSessionToken();
    const response = NextResponse.json({ user: { role: "admin" } });
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
      path: "/"
    });
    return response;
  } catch (error) {
    console.error("[admin-login]", error);
    return NextResponse.json({ error: "Login failed. Please check server auth configuration." }, { status: 500 });
  }
}
