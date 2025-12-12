"use client";

import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useRoom, useSelf } from "@liveblocks/react/suspense";
import stringToColor from "@/lib/stringToColor";

const BlockNote = ({
  doc,
  provider,
}: {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
}) => {
  const { theme } = useTheme();
  const userInfo = useSelf((me) => me.info);
  const editor: BlockNoteEditor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user: {
        name: userInfo.name,
        color: stringToColor(userInfo.name),
      },
    },
  });

  return (
    <div className="h-screen pl-11 py-5 relative min-w-full max-w-full">
      <BlockNoteView
        editor={editor}
        theme={theme === "dark" ? "dark" : "light"}
      />
    </div>
  );
};

export function Editor({ pageId }: { pageId: string }) {
  const room = useRoom();

  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<LiveblocksYjsProvider>();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yProvider.destroy();
      yDoc.destroy();
    };
  }, [room]);

  if (!doc || !provider) {
    return null;
  }

  return (
    <div className="min-h-screen w-full">
      <BlockNote doc={doc} provider={provider} />
    </div>
  );
}
