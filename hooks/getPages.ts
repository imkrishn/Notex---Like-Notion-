import { database } from '@/app/appwrite';
import { PageType } from '@/types/pageType';
import { Query } from 'appwrite';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const PAGE_LIMIT = 6;

export const useGetPages = (userId: string | undefined) => {
  const [pages, setPages] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);


  useEffect(() => {
    if (userId) {
      resetAndFetch();
    }
  }, [userId]);

  const resetAndFetch = async () => {
    setPages([]);
    setHasMore(true);
    setLastDocId(null);
    await fetchPages(true);
  };

  const fetchPages = useCallback(
    async (isInitial = false) => {
      if (!userId || loading || !hasMore) return;

      setLoading(true);

      try {
        const queries = [
          Query.equal('ownerId', userId),
          Query.limit(PAGE_LIMIT),
          Query.orderDesc('$createdAt')
        ];

        if (!isInitial && lastDocId) {
          queries.push(Query.cursorAfter(lastDocId));
        }

        const res = await database.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
          queries
        );

        const newPages = res.documents as PageType[];

        // Prevent duplicates
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
    },
    [userId, lastDocId, hasMore, loading]
  );

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
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);

  const isFetchingRef = useRef(false);

  const fetchSharedPages = useCallback(async () => {
    if (!userId || isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const queries = [
        Query.equal('sharedUserId', userId),
        Query.notEqual('ownerId', userId),
        Query.limit(PAGE_LIMIT),
        Query.orderDesc('$createdAt')
      ];

      if (lastDocId) {
        queries.push(Query.cursorAfter(lastDocId));
      }

      const sharedWithMe = await database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_USERS_ID!,
        queries
      );

      const newPages = sharedWithMe.documents.map((shared) => shared.pages);

      /*   const newSharedPages: PageType[] = await Promise.all(
          newPageRefs.map(async (pageId) => {
            try {
              const pageDoc = await database.getDocument(
                process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
                process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
                pageId
              );
              return pageDoc as PageType;
            } catch (err) {
              console.error('Failed to fetch shared page:', err);
              return null;
            }
          })
        ).then((results) => results.filter((page): page is PageType => !!page)); */

      setSharedPages((prev) => [...prev, ...newPages]);
      setHasMore(newPages.length === PAGE_LIMIT);

      if (sharedWithMe.documents.length > 0) {
        setLastDocId(sharedWithMe.documents[sharedWithMe.documents.length - 1].$id);
      }
    } catch (error) {
      console.error('Error fetching shared pages:', error);
      toast.error('Error fetching shared pages');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [userId, lastDocId, hasMore]);

  useEffect(() => {
    if (userId) {
      fetchSharedPages();
    }
  }, [userId, fetchSharedPages]);

  return {
    sharedPages,
    loading,
    hasMore,
    loadMore: fetchSharedPages,
  };
};
