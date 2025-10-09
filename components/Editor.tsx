'use client';
import { database, storage } from "@/app/appwrite";
import { Block } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "@liveblocks/react-ui/styles.css";
import "@liveblocks/react-ui/styles/dark/media-query.css";
import "@liveblocks/react-tiptap/styles.css";
import { useCreateBlockNoteWithLiveblocks } from "@liveblocks/react-blocknote";
import { ID, Query } from "appwrite";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef, useCallback, Dispatch, SetStateAction } from "react";
import { useCreateBlockNote } from "@blocknote/react";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BLOCK_ID!;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

const uploadFile = async (file: File) => {
  try {
    const fileUpload = await storage.createFile(BUCKET_ID, ID.unique(), file);
    return storage.getFileView(BUCKET_ID, fileUpload.$id);
  } catch (err) {
    console.error("File upload error:", err);
    return '';
  }
};

const Editor = ({ pageId, edit, setText }: { pageId: string, edit: boolean, setText: Dispatch<SetStateAction<string | undefined>> }) => {
  const [initialBlocks, setInitialBlocks] = useState<Block[] | null>(null);
  const { theme } = useTheme();
  const isProcessing = useRef(false);
  const previousBlocks = useRef<Block[]>([]);
  const currentPageId = useRef(pageId);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const loadInitialBlocks = useCallback(async () => {
    setInitialBlocks(null);
    try {
      const response = await database.listDocuments(DB_ID, COLLECTION_ID, [
        Query.equal('pages', pageId),
        Query.orderAsc('position'),
      ]);
      const blocks = response.documents.map((doc) => JSON.parse(doc.content));


      setInitialBlocks(blocks);
      previousBlocks.current = blocks;
      currentPageId.current = pageId;
    } catch (error) {
      console.error('Error loading blocks:', error);
      setInitialBlocks([]);
    }
  }, [pageId]);

  useEffect(() => {
    loadInitialBlocks();
  }, [loadInitialBlocks]);

  const editor = !edit ? useCreateBlockNote({
    initialContent: initialBlocks || undefined,
    uploadFile
  }) : useCreateBlockNoteWithLiveblocks({
    initialContent: initialBlocks || undefined,
    uploadFile
  }, { mentions: true });



  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (editor) {
      editor.replaceBlocks(editor.document, []);
    }

    currentPageId.current = pageId;
  }, [pageId, editor]);

  useEffect(() => {
    if (editor && initialBlocks) {
      editor.replaceBlocks(editor.document, initialBlocks);
    }

    const container = document.querySelector('.bn-container') as HTMLElement | null;
    container?.style.setProperty('--bn-colors-editor-background', '#ffffff00');
  }, [editor, initialBlocks]);

  const saveAllBlocks = useCallback(async (currentBlocks: Block[]) => {
    if (isProcessing.current || currentPageId.current !== pageId || !pageId) return;
    isProcessing.current = true;

    try {
      const existingBlocks = await database.listDocuments(DB_ID, COLLECTION_ID, [
        Query.equal('pages', pageId),
      ]);
      const existingBlockIds = existingBlocks.documents.map(block => block.$id);
      const currentBlockIds = currentBlocks.map(block => block.id);

      await Promise.all(
        existingBlockIds
          .filter(id => !currentBlockIds.includes(id))
          .map(id => database.deleteDocument(DB_ID, COLLECTION_ID, id))
      );

      await Promise.all(currentBlocks.map(async (block, index) => {
        const data = {
          content: JSON.stringify(block),
          pages: pageId,
          position: index,
        };

        try {
          await database.updateDocument(DB_ID, COLLECTION_ID, block.id, data);
        } catch (error) {
          await database.createDocument(DB_ID, COLLECTION_ID, block.id, data);
        }
      }));

      previousBlocks.current = currentBlocks;
    } catch (error) {
      console.error("Error saving blocks:", error);
    } finally {
      isProcessing.current = false;
    }
  }, [pageId]);

  const handleChange = useCallback(
    async (latestPageId: string) => {
      if (!editor) return;
      const currentBlocks = editor.document;
      console.log(currentBlocks);

      /* const plainText = currentBlocks
    ?.map(block => block.content?((inline: any) => inline.text).join('') || '')
    .join('\n'); */

      if (latestPageId === currentPageId.current) {
        await saveAllBlocks(currentBlocks);
      }
    },
    [editor, saveAllBlocks]
  );

  const debouncedHandleChange = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const currentPageWhenCalled = pageId;
    timeoutRef.current = setTimeout(() => {
      handleChange(currentPageWhenCalled);
    }, 700);
  }, [handleChange, pageId]);

  useEffect(() => {
    const unsubscribe = editor?.onChange?.(debouncedHandleChange);
    return () => {
      unsubscribe?.();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [editor, debouncedHandleChange]);

  return (
    <div className="w-full max-w-full h-full py-8">
      <BlockNoteView
        editor={editor}
        theme={theme === 'dark' ? 'dark' : 'light'}
        editable={edit}
        formattingToolbar={true}
      />
    </div>
  );
};

export default Editor;