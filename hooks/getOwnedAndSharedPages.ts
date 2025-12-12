import { useCallback, useEffect, useRef, useState } from "react";

import { toast } from "sonner";
import { databases } from "@/app/(root)/appwrite";
import { PageType } from "@/types/pageType";
import { Query } from "appwrite";

// fetch owned pages
export function usePages(userId: string | undefined) {
  const PAGE_LIMIT = 6;
  const [pages, setPages] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const lastDocIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const hasMoreRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const dedupeAndAppend = useCallback(
    (current: PageType[], incoming: PageType[]) => {
      if (!incoming || incoming.length === 0) return current;
      const existing = new Set(current.map((p) => p.$id));
      const merged = [...current];
      for (const p of incoming) {
        if (!existing.has(p.$id)) {
          merged.push(p);
          existing.add(p.$id);
        }
      }
      return merged;
    },
    []
  );

  const fetchPages = useCallback(
    async (isInitial = false) => {
      if (!userId) return;
      if (isFetchingRef.current) return;
      if (!isInitial && !hasMoreRef.current) return;

      isFetchingRef.current = true;
      if (isMountedRef.current) setLoading(true);

      try {
        const queries: any[] = [
          Query.equal("ownerId", userId),
          Query.limit(PAGE_LIMIT),
          Query.orderDesc("$updatedAt"),
        ];

        if (!isInitial && lastDocIdRef.current) {
          queries.push(Query.cursorAfter(lastDocIdRef.current));
        }

        const res = await databases.listRows({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
          queries,
        });

        const newPages = res.rows;

        if (!newPages || newPages.length === 0) {
          if (isInitial) setPages([]);
          setHasMore(false);
          return;
        }

        setPages((prev) => {
          const merged = dedupeAndAppend(prev, newPages);
          if (merged.length === prev.length) return prev;
          return merged;
        });

        lastDocIdRef.current =
          newPages[newPages.length - 1].$id ?? lastDocIdRef.current;
        setHasMore(newPages.length === PAGE_LIMIT);
      } catch (err) {
        console.error("usePages.fetchPages:", err);
        toast.error("Error fetching pages");
      } finally {
        if (isMountedRef.current) setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [userId, dedupeAndAppend]
  );

  const resetAndFetch = useCallback(async () => {
    lastDocIdRef.current = null;
    setPages([]);
    setHasMore(true);
    hasMoreRef.current = true;
    await fetchPages(true);
  }, [fetchPages]);

  useEffect(() => {
    if (!userId) {
      lastDocIdRef.current = null;
      setPages([]);
      setHasMore(true);
      setLoading(false);
      return;
    }
    resetAndFetch();
  }, [userId]);

  const loadMore = useCallback(async () => {
    await fetchPages(false);
  }, [fetchPages]);

  return {
    pages,
    loading,
    hasMore,
    loadMore,
    resetAndFetch,
    setPages,
  };
}

// fetched shared pages hook
export function useSharedPages(userId: string | undefined) {
  const PAGE_LIMIT = 6;
  const [sharedPages, setSharedPages] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const lastDocIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const hasMoreRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const dedupeAndAppend = useCallback(
    (current: PageType[], incoming: PageType[]) => {
      if (!incoming || incoming.length === 0) return current;
      const existing = new Set(current.map((p) => p.$id));
      const merged = [...current];
      for (const p of incoming) {
        if (!existing.has(p.$id)) {
          merged.push(p);
          existing.add(p.$id);
        }
      }
      return merged;
    },
    []
  );

  const fetchShared = useCallback(
    async (isInitial = false) => {
      if (!userId) return;
      if (isFetchingRef.current) return;
      if (!isInitial && !hasMoreRef.current) return;

      isFetchingRef.current = true;
      if (isMountedRef.current) setLoading(true);

      try {
        const queries: any[] = [
          Query.equal("sharedUserId", userId),
          Query.notEqual("ownerId", userId),
          Query.limit(PAGE_LIMIT),
          Query.orderDesc("$updatedAt"),
        ];

        if (!isInitial && lastDocIdRef.current) {
          queries.push(Query.cursorAfter(lastDocIdRef.current));
        }

        const res = await databases.listRows({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_PAGES_ID!,
          queries,
        });

        const docs = res.rows;

        if (!docs || docs.length === 0) {
          if (isInitial) setSharedPages([]);
          setHasMore(false);
          return;
        }

        const pageIdsToFetch: string[] = docs.map((user) => user.pageId);

        const fetches = await databases
          .listRows({
            databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
            queries: [Query.equal("$id", pageIdsToFetch)],
          })
          .catch((err) => {
            console.warn("Failed to fetch shared page id:", err);
            return null;
          });

        if (!fetches || fetches.rows.length === 0) {
          if (isInitial) setSharedPages([]);
          setHasMore(false);
          return;
        }

        setSharedPages((prev) => {
          const merged = dedupeAndAppend(prev, fetches.rows);
          if (merged.length === prev.length) return prev;
          return merged;
        });

        lastDocIdRef.current =
          docs[docs.length - 1]?.$id ?? lastDocIdRef.current;
        setHasMore(docs.length === PAGE_LIMIT);
      } catch (err) {
        console.error("useSharedPages.fetchShared:", err);
        toast.error("Error fetching shared pages");
      } finally {
        if (isMountedRef.current) setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [userId, dedupeAndAppend]
  );

  const resetAndFetch = useCallback(async () => {
    lastDocIdRef.current = null;
    setSharedPages([]);
    setHasMore(true);
    hasMoreRef.current = true;
    await fetchShared(true);
  }, [fetchShared]);

  useEffect(() => {
    if (!userId) {
      lastDocIdRef.current = null;
      setSharedPages([]);
      setHasMore(true);
      setLoading(false);
      return;
    }
    resetAndFetch();
  }, [userId]);

  const loadMore = useCallback(async () => {
    await fetchShared(false);
  }, [fetchShared]);

  return {
    sharedPages,
    loading,
    hasMore,
    loadMore,
    resetAndFetch,
    setSharedPages,
  };
}
