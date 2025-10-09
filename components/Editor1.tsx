'use client'

import React, { useEffect, useState } from 'react'
import { useRoom, useSelf } from '@liveblocks/react/suspense'
import { LiveblocksYjsProvider } from '@liveblocks/yjs'
import * as Y from 'yjs'
import { BlockNoteView } from '@blocknote/shadcn'
import { BlockNoteEditor } from '@blocknote/core'
import { useCreateBlockNote } from '@blocknote/react'
import { stringToRandomColor } from '@/helpers/stringToHash'

type EditorProps = {
  doc: Y.Doc;
  provider: any;

}

function BlockNote({ doc, provider }: EditorProps) {
  const userInfo = useSelf((me) => me.info);
  console.log(userInfo);

  const editor: BlockNoteEditor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment('document-store'),
      user: {
        name: 'Anonyms',
        color: stringToRandomColor('hero')
      }
    }
  })
  return (
    <div>
      <BlockNoteView editor={editor} />
    </div>
  )
}

const Editor1 = () => {
  const room = useRoom()
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<LiveblocksYjsProvider>()

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider)

    return () => {
      yDoc.destroy();
      yProvider.destroy();
    }
  }, [room])

  if (!doc || !provider) {
    return null;
  }

  return (
    <div>
      <BlockNote doc={doc} provider={provider} />
    </div>
  )
}

export default Editor1