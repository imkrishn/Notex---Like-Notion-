import { tables } from "@/lib/appwriteServer";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

export async function POST(req: NextRequest) {
  try {
    const { email, password, otp } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Required fields are missing" },
        { status: 400 }
      );
    }

    const users = await tables.listRows({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
      queries: [Query.equal("email", email)],
    });

    if (users.total === 0) {
      return NextResponse.json(
        { message: "user not exists with the mail" },
        { status: 404 }
      );
    }

    const user = users.rows[0];

    //  Check OTP validity
    const tokenTime = new Date(user.resetVerificationTokenTime).getTime();
    const isOtpValid =
      user.resetVerificationToken === otp &&
      Date.now() - tokenTime < 15 * 60 * 1000; // 15 minutes

    if (!isOtpValid) {
      return NextResponse.json(
        { message: "Invalid or expired OTP" },
        { status: 409 }
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await tables.updateRow({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
      rowId: user.$id,
      data: {
        password: hashedPassword,
        resetVerificationToken: null,
        resetVerificationTokenTime: null,
      },
    });

    return NextResponse.json(
      { message: "Password Reset Successfully", success: true },
      { status: 200 }
    );
  } catch (Err) {
    console.error("Error while reset password");
    return NextResponse.json(
      { message: "Failed to reset Password" },
      { status: 500 }
    );
  }
}
