import { ReactNode } from "react";
import { RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import Spinner from "./Spinner";
import LiveCursorPointer from "./LiveCursorPointer";

export function Room({
  children,
  roomId,
}: {
  children: ReactNode;
  roomId: string;
}) {
  return (
    <div className="w-full h-full">
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
        }}
      >
        <ClientSideSuspense fallback={<Spinner size={40} color="#4e91df" />}>
          <LiveCursorPointer>{children}</LiveCursorPointer>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </div>
  );
}
