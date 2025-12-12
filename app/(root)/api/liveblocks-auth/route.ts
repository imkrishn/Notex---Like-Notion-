import { tables } from "@/lib/appwriteServer";
import { Liveblocks } from "@liveblocks/node";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCK_SECRET_KEY!,
});

export async function POST(req: NextRequest) {
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

  const session = liveblocks.prepareSession(user.email, {
    userInfo: {
      name: user.fullName,
      avatar: user.imgUrl,
    },
  });

  // Allow access to any of your app’s rooms
  session.allow("notex*", session.FULL_ACCESS);

  // Authorize and send proper JSON
  const { status, body } = await session.authorize();

  return new NextResponse(body, {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
