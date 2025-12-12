"use client";

import { LiveblocksProvider } from "@liveblocks/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-ui/styles/dark/media-query.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-full w-full">
      <LiveblocksProvider throttle={16} authEndpoint="/api/liveblocks-auth">
        {children}
      </LiveblocksProvider>
    </main>
  );
}
