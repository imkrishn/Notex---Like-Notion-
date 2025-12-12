import { tables } from "@/lib/appwriteServer";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Required fields are missing." },
        { status: 400 }
      );
    }

    const users = await tables.listRows({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
      queries: [Query.equal("email", email)],
    });

    if (users.total === 0) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = users.rows[0];

    const isRightPassword = await bcrypt.compare(password, user.password);

    if (!isRightPassword) {
      return NextResponse.json(
        { message: "Password is Wrong" },
        { status: 401 }
      );
    }

    // Create JWT
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({ sub: user.$id, name: user.fullName })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    // Set cookie securely

    const cookieStore = await cookies();
    cookieStore.set("notex_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json(
      { success: true, message: "Login successfull", name: user.fullName },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error while logging : ", err);
    return NextResponse.json(
      { message: "Failed to login.Try again" },
      { status: 500 }
    );
  }
}
