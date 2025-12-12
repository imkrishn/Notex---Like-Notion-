"use client";
import React from "react";
import Pointer from "./Pointer";
import { useOthers, useMyPresence } from "@liveblocks/react/suspense";

export default function LiveCursorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [myPresence, setMyPresence] = useMyPresence();

  const others = useOthers();

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const cursor = {
      x: Math.floor(e.pageX),
      y: Math.floor(e.pageY),
    };

    setMyPresence({ cursor });
  }

  function handlePointerLeave() {
    setMyPresence({ cursor: null });
  }

  return (
    <div onPointerMove={handlePointerMove} onPointerLeave={handlePointerLeave}>
      {others
        .filter((other) => other.presence.cursor !== null)
        .map(({ connectionId, presence, info }) => (
          <Pointer
            key={connectionId}
            info={info}
            x={presence.cursor!.x}
            y={presence.cursor!.y}
          />
        ))}

      {children}
    </div>
  );
}
