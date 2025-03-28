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
import { useEffect, useState, useRef, useCallback } from "react";


const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BLOCK_ID!;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
const PAGE_ID = '67e289650020686faa23';

async function saveBlocks(blocks: Block[]) {
  try {
    await Promise.all(
      blocks.map(async (block: Block, index: number) => {
        try {
          await database.updateDocument(
            DB_ID,
            COLLECTION_ID,
            block?.id,
            { content: JSON.stringify(block), position: index }
          );
          console.log(`Block ${block?.id} updated successfully.`);
        } catch (err: any) {
          if (err.code === 404) {
            console.warn(`Document not found. Creating new block ${block?.id}.`);
            try {
              await database.createDocument(
                DB_ID,
                COLLECTION_ID,
                block?.id,
                { content: JSON.stringify(block), position: index }
              );
              console.log(`Block ${block?.id} created successfully.`);
            } catch (createErr) {
              console.error(`Error creating block ${block?.id}:`, createErr);
            }
          } else {
            console.error(`Error updating block ${block?.id}:`, err);
          }
        }
      })
    );
    console.log("All blocks processed successfully.");
  } catch (Err) {
    console.error("Error in saveBlocks:", Err);
  }
}

// Upload file function for BlockNote
const uploadFile = async (file: File) => {
  try {
    const fileUpload = await storage.createFile(BUCKET_ID, ID.unique(), file);
    const fileUrl = await storage.getFileView(BUCKET_ID, fileUpload.$id);
    return fileUrl;
  } catch (err) {
    console.error("File upload error:", err);
    return '';
  }
};

const Editor = () => {
  const [initialBlocks, setInitialBlocks] = useState<Block[] | null>(null);
  const { theme } = useTheme();
  const isProcessing = useRef(false);
  const previousBlocks = useRef<Block[]>([]);

  // Load initial blocks
  const loadInitialBlocks = useCallback(async () => {
    try {
      const response = await database.listDocuments(DB_ID, COLLECTION_ID, [
        Query.equal('pages', PAGE_ID),
        Query.orderAsc('position'),
      ]);
      const blocks = response.documents.map((doc) => JSON.parse(doc.content));
      setInitialBlocks(blocks);
      previousBlocks.current = blocks; // Initialize previous blocks
    } catch (error) {
      console.error('Error loading blocks:', error);
    }
  }, []);

  useEffect(() => {
    loadInitialBlocks();
  }, [loadInitialBlocks]);



  // Initialize BlockNote editor with Liveblocks
  const editor = useCreateBlockNoteWithLiveblocks({
    initialContent: initialBlocks || undefined,
    uploadFile
  });

  useEffect(() => {
    if (editor && initialBlocks) {
      editor.replaceBlocks(editor.document, initialBlocks);
    }

    const container = document.querySelector('.bn-container') as HTMLElement | null;
    if (container) {
      container.style.setProperty('--bn-colors-editor-background', '#ffffff00')
    }
  }, [editor, initialBlocks]);

  // Save all blocks and handle deletions
  const saveAllBlocks = useCallback(async (currentBlocks: Block[]) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    try {
      // Get existing blocks from the database
      const existingBlocksResponse = await database.listDocuments(DB_ID, COLLECTION_ID, [
        Query.equal('pages', PAGE_ID),
      ]);
      const existingBlocks = existingBlocksResponse.documents;
      const existingBlockIds = existingBlocks.map(block => block.$id);

      // Extract current block IDs
      const currentBlockIds = currentBlocks.map(block => block.id);

      // Identify blocks to delete
      const blocksToDelete = existingBlockIds.filter(id => !currentBlockIds.includes(id));
      await Promise.all(blocksToDelete.map(id =>
        database.deleteDocument(DB_ID, COLLECTION_ID, id)
      ));

      // Create/update blocks
      await Promise.all(currentBlocks.map(async (block, index) => {
        const data = {
          content: JSON.stringify(block),
          pages: PAGE_ID,
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
  }, []);


  const handleChange = useCallback(
    debounce(async () => {
      const currentBlocks = editor.document;
      await saveAllBlocks(currentBlocks);
    }, 108),
    [editor]
  );

  useEffect(() => {
    const unsubscribe = editor?.onChange?.(handleChange);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [editor, handleChange]);

  // Debounce utility
  function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
    let timer: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    } as T;
  }

  return (
    <div className="w-full max-w-full py-8">
      <BlockNoteView
        editor={editor}
        theme={theme === 'dark' ? 'dark' : 'light'}
        editable={true}
        formattingToolbar={true}
      />
    </div>
  );
};

export default Editor;