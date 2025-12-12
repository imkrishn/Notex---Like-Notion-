import { tables } from "@/lib/appwriteServer";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("notex_session")?.value;

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 400 });
    }

    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

    const tokenData: any = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!tokenData) {
      return NextResponse.json({ success: false, user: null }, { status: 409 });
    }

    const userId = tokenData.payload.sub;

    if (!userId) {
      return NextResponse.json({ succes: false, user: null }, { status: 409 });
    }

    const user = await tables.getRow({
      databaseId: process.env.APPWRITE_DATABASE_ID!,
      tableId: process.env.APPWRITE_USER_COLLECTION_ID!,
      rowId: userId,
    });

    if (user && user.isVerified) {
      return NextResponse.json(
        {
          success: true,
          user: {
            id: user.$id,
            email: user.email,
            name: user.fullName,
            avatar: user.imgUrl,
          },
        },
        { status: 200 }
      );
    }
  } catch (err) {
    console.error("Error verifing user :", err);
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
