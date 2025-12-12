import { tables } from "@/lib/appwriteServer";
import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, name, password, otp } = await req.json();

    if (!email || !name || !password || !otp)
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    const users = await tables.listRows({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
      queries: [Query.equal("email", email)],
    });

    if (users.total === 0)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const user = users.rows[0];

    //  Check OTP validity
    const tokenTime = new Date(user.verificationTokenTime).getTime();
    const isOtpValid =
      user.verificationToken === otp && Date.now() - tokenTime < 15 * 60 * 1000; // 15 minutes

    if (!isOtpValid)
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 400 }
      );
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await tables.updateRow({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
      rowId: user.$id,
      data: {
        fullName: name,
        password: hashedPassword,
        isVerified: true,
        verificationToken: null,
        verificationTokenTime: null,
      },
    });

    // Create JWT
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({ sub: user.$id, name })
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
      { success: true, message: "Signup successfull" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ message: "Failed to signup" }, { status: 500 });
  }
}
