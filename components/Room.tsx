"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import Spinner from "./Spinner";
import LiveCursorPointer from "./LiveCursorPointer";

export function Room({ children, roomId }: { children: ReactNode, roomId: string }) {
  return (
    <LiveblocksProvider publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCK_API_KEY!}>
      <RoomProvider id={roomId} initialPresence={{
        cursor: null,
        info: {
          name: "Alice",
          avatar: "https://i.pravatar.cc/150?u=alice" // example
        }
      }}
      >
        <ClientSideSuspense fallback={<Spinner size={40} color="#4e91df" />}>
          <LiveCursorPointer>
            {children}
          </LiveCursorPointer>
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}