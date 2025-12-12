"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { databases } from "@/app/(root)/appwrite";
import { PageType } from "@/types/pageType";
import { Query } from "appwrite";
import Card from "./Card";
import Spinner from "./Spinner";
import { useGetLoggedinUser } from "@/hooks/getLoggedInUser";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ThemeToggle from "./ThemeToggle";

const PAGE_LIMIT = 10;

export default function HomeInlineFetch() {
  const { id: userId, name } = useGetLoggedinUser();
  const router = useRouter();

  const [pages, setPages] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const lastDocIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);
  const isMountedRef = useRef(true);
  const hasMoreRef = useRef(true);

  // keep hasMoreRef in sync
  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  //fetch user pages

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

        // Appwrite list call - adjust if your SDK differs
        const res = await databases.listRows({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
          queries,
        });

        // support both shapes: { rows: [] } or { documents: [] }
        const fetched = ((res as any).rows ??
          (res as any).documents ??
          []) as PageType[];

        if (!fetched || fetched.length === 0) {
          // if initial fetch returned nothing, mark hasMore false
          if (isInitial) {
            setPages([]);
          }
          setHasMore(false);
          return;
        }

        setPages((prev) => {
          const merged = dedupeAndAppend(prev, fetched);
          if (merged.length === prev.length) return prev;
          return merged;
        });

        lastDocIdRef.current =
          fetched[fetched.length - 1].$id ?? lastDocIdRef.current;
        setHasMore(fetched.length === PAGE_LIMIT);
      } catch (err) {
        console.error("Error fetching pages:", err);
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

  // initial load when userId changes
  useEffect(() => {
    if (!userId) {
      lastDocIdRef.current = null;
      setPages([]);
      setHasMore(true);
      setLoading(false);
      return;
    }
    resetAndFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadMore = useCallback(async () => {
    await fetchPages(false);
  }, [fetchPages]);

  // sentinel for intersection observer
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && hasMore && !loading) {
            loadMore();
          }
        }
      },
      { root: null, rootMargin: "300px", threshold: 0.1 }
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, [loadMore, hasMore, loading]);

  return (
    <main className="min-h-screen p-8 bg-(--background) text-(--color-base-content)">
      <div className="max-w-[1400px] mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight">
              {name ? `Welcome, ${name.split(" ")[0]}` : "Your Workspace"}
            </h1>
            <p className="text-sm text-(--color-neutral-content) mt-1">
              Quick access to your recent pages & collections
            </p>
          </div>

          <ThemeToggle />
        </header>

        <section
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          aria-live="polite"
        >
          {pages.length === 0 && !loading ? (
            <div className="col-span-full text-(--color-neutral-content) py-20 flex flex-col items-center justify-center rounded-2xl border border-dashed">
              <div className="mb-4 text-lg font-semibold">No pages yet</div>
              <div className="text-sm mb-6">
                Create your first page to get started
              </div>
            </div>
          ) : (
            pages.map((p) => (
              <Card
                key={p.$id}
                data={p}
                onClick={() => {
                  router.push(`/page/${p.$id}`);
                }}
              />
            ))
          )}
        </section>

        {/* Loading / sentinel */}
        <div className="mt-8 flex flex-col items-center">
          {loading && (
            <div className="py-4">
              <Spinner color="var(--color-primary)" size={28} />
            </div>
          )}

          {!hasMore && !loading && pages.length > 0 && (
            <div className="text-sm text-(--color-neutral-content) py-2">
              You're all caught up
            </div>
          )}

          <div
            ref={sentinelRef}
            style={{ width: "100%", height: 1 }}
            aria-hidden
          />
        </div>
      </div>
    </main>
  );
}
