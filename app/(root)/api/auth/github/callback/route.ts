export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "auto";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { tables } from "@/lib/appwriteServer";
import { ID, Query } from "node-appwrite";

export async function GET(req: NextRequest) {
  try {
    const { SignJWT } = await import("jose");

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    //  environment variables
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const secret = process.env.JWT_SECRET;

    if (!clientId || !clientSecret || !secret) {
      console.error(" Missing required environment variables");
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    const JWT_SECRET = new TextEncoder().encode(secret);

    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      }
    );

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error("GitHub token exchange failed:", tokenData);
      return NextResponse.json(
        { error: "GitHub authentication failed" },
        { status: 401 }
      );
    }

    const [userRes, emailRes] = await Promise.all([
      fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const ghUser = await userRes.json();
    const emails = await emailRes.json();
    const primaryEmail =
      emails.find((e: any) => e.primary && e.verified)?.email || ghUser.email;

    if (!primaryEmail) {
      return NextResponse.json(
        { error: "Could not retrieve user email" },
        { status: 400 }
      );
    }

    const users = await tables.listRows({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
      queries: [Query.equal("email", primaryEmail)],
    });

    let user;

    if (users.total === 0) {
      user = await tables.createRow({
        databaseId: process.env.APPWRITE_DATABASE_ID!,
        tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
        rowId: ID.unique(),
        data: {
          email: primaryEmail,
          fullName: ghUser.name ?? ghUser.login,
          imgUrl: ghUser.avatar_url,
          isVerified: true,
        },
      });
    } else {
      user = users.rows[0];
      await tables.updateRow({
        databaseId: process.env.APPWRITE_DATABASE_ID!,
        tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
        rowId: user?.$id,
        data: {
          fullName: ghUser.name ?? ghUser.login,
          imgUrl: ghUser.avatar_url,
          isVerified: true,
        },
      });
    }

    // Create session JWT

    const sessionToken = await new SignJWT({
      sub: user.$id,
      name: user.fullName,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // Set cookie
    const cookieStore = await cookies();

    cookieStore.set("notex_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json(
      { success: true, name: user.fullName },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("GitHub OAuth error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
