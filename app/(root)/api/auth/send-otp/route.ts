import { tables } from "@/lib/appwriteServer";
import { sendVerificationEmail } from "@/lib/sendEmail";
import { NextRequest, NextResponse } from "next/server";
import { Query, ID } from "node-appwrite";

export async function POST(req: NextRequest) {
  try {
    const { email, name, type } = await req.json();

    if (!email)
      return NextResponse.json(
        { message: "Email is missing" },
        { status: 400 }
      );

    // if user exists
    const userExists = await tables.listRows({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
      queries: [Query.equal("email", email)],
    });

    const existingUser = userExists.rows[0];

    // Signup flow
    if (type === "signup" && existingUser?.isVerified) {
      return NextResponse.json(
        { message: "User already exists with this email" },
        { status: 400 }
      );
    }

    // Reset password flow
    if (type === "reset" && userExists.total === 0) {
      return NextResponse.json(
        { message: "User does not exist with this email" },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const finalData =
      type === "signup"
        ? {
            verificationToken: otp,
            verificationTokenTime: new Date(),
            isVerified: false,
          }
        : {
            resetVerificationToken: otp,
            resetVerificationTokenTime: new Date(),
          };

    // Create or update record
    if (existingUser) {
      await tables.updateRow({
        databaseId: process.env.APPWRITE_DATABASE_ID!,
        tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
        rowId: existingUser.$id,
        data: finalData,
      });
    } else {
      await tables.createRow({
        databaseId: process.env.APPWRITE_DATABASE_ID!,
        tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
        rowId: ID.unique(),
        data: {
          email,
          fullName: name,
          ...finalData,
        },
      });
    }

    // Send email
    const finalName =
      type === "signup" ? name : existingUser?.fullName || "User";

    await sendVerificationEmail(email, finalName, otp, type);

    return NextResponse.json(
      { success: true, message: "OTP sent successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error sending OTP:", err);
    return NextResponse.json(
      { message: "Failed to send OTP", error: String(err) },
      { status: 500 }
    );
  }
}
