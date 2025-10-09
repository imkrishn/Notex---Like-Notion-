'use client'

import { useMyPresence, useOthers } from "@liveblocks/react"
import React from "react";
import FollowPointer from "./FollowPointer";

const LiveCursorPointer = ({ children }: { children: React.ReactNode }) => {
  const [myPresence, updateMyPresence] = useMyPresence();
  const others = useOthers()

  function handleMouseMove(e: React.PointerEvent<HTMLDivElement>) {
    const cursor = { x: Math.floor(e.pageX), y: Math.floor(e.pageY) };

    updateMyPresence({ cursor })
  }

  function handleMouseLeave(e: React.PointerEvent<HTMLDivElement>) {
    const cursor = null;
    updateMyPresence({ cursor })
  }


  return (
    <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="w-full">
      {others.filter((other) => other.presence.cursor !== null).map(({ info, presence, connectionId }) => (
        <FollowPointer
          key={connectionId}
          info={info}
          x={presence.cursor?.x}
          y={presence.cursor?.y}
        />
      ))}

      {children}
    </div>
  )
}

export default LiveCursorPointer