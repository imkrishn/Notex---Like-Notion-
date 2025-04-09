import { database } from '@/app/appwrite';
import { PageType } from '@/types/pageType';
import { Query } from 'appwrite';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const PAGE_LIMIT = 3;

export const useGetPages = (userId: string | undefined) => {
  const [pages, setPages] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchPages();
    }
  }, [userId]);

  async function fetchPages() {
    if (!userId) {
      toast.error('Failed to fetch pages');
      throw new Error('User is not authorized');
    }

    setLoading(true);
    try {
      const queries = [
        Query.equal('ownerId', userId),
        Query.limit(PAGE_LIMIT),
      ];

      if (lastDocId) {
        queries.push(Query.cursorAfter(lastDocId));
      }

      const res = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        queries
      );

      const newPages = res.documents as PageType[];
      setPages((prev) => [...prev, ...newPages]);
      setHasMore(newPages.length === PAGE_LIMIT);
      if (newPages.length > 0) {
        setLastDocId(newPages[newPages.length - 1].$id);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching pages');
    } finally {
      setLoading(false);
    }
  }

  return {
    pages,
    loading,
    hasMore,
    loadMore: fetchPages,
    setPages
  };
};

export const useGetSharedPages = (userId: string | undefined) => {
  const [sharedPages, setSharedPages] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchSharedPages();
    }
  }, [userId]);

  async function fetchSharedPages() {
    if (!userId) {
      toast.error('Failed to fetch pages');
      throw new Error('User is not authorized');
    }

    setLoading(true);
    try {
      const queries = [
        Query.equal('sharedUserId', userId),
        Query.limit(PAGE_LIMIT),
      ];

      if (lastDocId) {
        queries.push(Query.cursorAfter(lastDocId));
      }

      const sharedWithMe = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_USERS_ID!,
        queries
      );

      const newPageRefs = sharedWithMe.documents.map((shared) => shared.pages);

      console.log(sharedWithMe);



      const newSharedPages: PageType[] = [];
      for (const pageId of newPageRefs) {
        try {
          const pageDoc = await database.getDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
            pageId
          );
          newSharedPages.push(pageDoc as PageType);
        } catch (err) {
          console.error('Failed to fetch shared page:', err);
        }
      }

      setSharedPages((prev) => [...prev, ...newSharedPages]);
      setHasMore(newSharedPages.length === PAGE_LIMIT);
      if (sharedWithMe.documents.length > 0) {
        setLastDocId(sharedWithMe.documents[sharedWithMe.documents.length - 1].$id);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error fetching shared pages');
    } finally {
      setLoading(false);
    }
  }

  return {
    sharedPages,
    loading,
    hasMore,
    loadMore: fetchSharedPages,
  };
};
