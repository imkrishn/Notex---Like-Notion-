"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleX,
  RotateCcw,
  StickyNote,
  Trash,
  Search as SearchIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import formatTime from "@/lib/formatTime";
import { PageType } from "@/types/pageType";
import { useGetLoggedinUser } from "@/hooks/getLoggedInUser";
import { usePages, useSharedPages } from "@/hooks/getOwnedAndSharedPages";
import { databases } from "@/app/(root)/appwrite";
import Image from "next/image";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PAGE_TABLE_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!;

const Search = ({
  setMenu,
}: {
  setMenu: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { id, name } = useGetLoggedinUser();
  const loggedInUserId = id;

  const [query, setQuery] = useState("");
  const debounceRef = useRef<number | undefined>(undefined);
  const [debounced, setDebounced] = useState("");
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(
    () => new Set()
  );

  // use the hooks
  const {
    pages,
    hasMore,
    loadMore,
    loading,
    setPages,
    resetAndFetch: resetPagesFetch,
  } = usePages(loggedInUserId);

  const {
    sharedPages,
    hasMore: sharedHasMore,
    loading: sharedLoading,
    loadMore: sharedLoadMore,
    resetAndFetch: resetSharedFetch,
    setSharedPages,
  } = useSharedPages(loggedInUserId);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(
      () => setDebounced(query.trim()),
      200
    );
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Flatten the lists for local filtering & navigation
  const combined = useMemo(() => {
    const map = new Map<string, PageType>();
    for (const p of pages) {
      map.set(p.$id, p);
    }
    for (const p of sharedPages) {
      if (!map.has(p.$id)) map.set(p.$id, p);
    }
    return Array.from(map.values());
  }, [pages, sharedPages]);

  const filtered = useMemo(() => {
    if (!debounced) return combined;
    const q = debounced.toLowerCase();
    return combined.filter((p) => {
      const title = (p.title ?? "") + "";
      return title.toLowerCase().includes(q);
    });
  }, [debounced, combined]);

  // keyboard navigation

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenu("Personal");
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next =
            prev === null ? 0 : Math.min(prev + 1, filtered.length - 1);
          return next;
        });
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => {
          if (filtered.length === 0) return null;
          if (prev === null) return Math.max(filtered.length - 1, 0);
          return Math.max(prev - 1, 0);
        });
      }
      if (e.key === "Enter") {
        if (
          focusedIndex !== null &&
          focusedIndex >= 0 &&
          focusedIndex < filtered.length
        ) {
          const p = filtered[focusedIndex];
          router.push(`/page/${p.$id}`);
          setMenu("Personal");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [filtered, focusedIndex, router, setMenu]);

  // loading state for individual items
  const markProcessing = (id: string, on = true) => {
    setProcessingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  //delete permanent

  const deletePage = async (p: PageType) => {
    if (!p?.$id) return;
    const id = p.$id;

    if (p.isDeleted) {
      const confirmed = window.confirm(
        "This page is already in Trash. Permanently delete? This cannot be undone."
      );
      if (!confirmed) return;
      markProcessing(id, true);
      try {
        await databases.deleteRow({
          databaseId: DATABASE_ID,
          tableId: PAGE_TABLE_ID,
          rowId: id,
        });

        setPages((prev) => prev.filter((x) => x.$id !== id));
        setSharedPages((prev) => prev.filter((x) => x.$id !== id));
        toast.success("Permanently deleted");
      } catch (err) {
        console.error("Permanent delete failed", err);
        toast.error("Failed to permanently delete page");
      } finally {
        markProcessing(id, false);
      }
      return;
    }

    markProcessing(id, true);

    const previousPersonal = pages;
    const previousShared = sharedPages;

    setPages((prev) => prev.filter((x) => x.$id !== id));
    setSharedPages((prev) => prev.filter((x) => x.$id !== id));

    try {
      await databases.updateRow({
        databaseId: DATABASE_ID,
        tableId: PAGE_TABLE_ID,
        rowId: id,
        data: { isDeleted: true },
      });

      toast.success("Moved to trash");

      setTimeout(() => {
        resetPagesFetch().catch(() => {});
        resetSharedFetch().catch(() => {});
      }, 400);
    } catch (err) {
      console.error("Soft delete failed", err);
      setPages(previousPersonal);
      setSharedPages(previousShared);
      toast.error("Delete failed");
    } finally {
      markProcessing(id, false);
    }
  };

  //restore the page from trash
  const restorePage = async (p: PageType) => {
    if (!p?.$id) return;
    const id = p.$id;
    markProcessing(id, true);

    try {
      await databases.updateRow({
        databaseId: DATABASE_ID,
        tableId: PAGE_TABLE_ID,
        rowId: id,
        data: { isDeleted: false },
      });

      toast.success("Restored");

      await Promise.all([resetPagesFetch(), resetSharedFetch()]);
    } catch (err) {
      console.error("Restore failed", err);
      toast.error("Restore failed");
    } finally {
      markProcessing(id, false);
    }
  };

  const renderItem = (p: PageType, index: number) => {
    const isShared = sharedPages.some((s) => s.$id === p.$id);
    const isFocused = focusedIndex === index;
    const processing = processingIds.has(p.$id);

    return (
      <div
        key={p.$id}
        role="button"
        tabIndex={0}
        aria-selected={isFocused}
        onClick={() => {
          if (processing) return;
          router.push(`/page/${p.$id}`);
          setMenu("Personal");
        }}
        onMouseEnter={() => setFocusedIndex(index)}
        onMouseLeave={() => setFocusedIndex(null)}
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer group`}
        style={{
          background: isFocused
            ? "linear-gradient(90deg, rgba(0,0,0,0.02), transparent)"
            : "transparent",
          color: "var(--color-base-content)",
          opacity: processing ? 0.6 : 1,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            display: "grid",
            placeItems: "center",
            borderRadius: 10,
            background:
              "linear-gradient(135deg,var(--color-info-soft),var(--color-primary))",
            color: "var(--color-primary-content)",
          }}
        >
          {p.logoUrl ? (
            <Image src={p.logoUrl} alt="logo" width={24} height={24} />
          ) : (
            <StickyNote size={20} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p
              className="font-semibold truncate text-sm"
              style={{ color: "var(--color-base-content)" }}
            >
              {p.title ?? p.title ?? "Untitled"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-2">
          {processing ? (
            <div
              className="text-xs"
              style={{ color: "var(--color-neutral-content)" }}
            >
              Processing...
            </div>
          ) : p.isDeleted ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  restorePage(p);
                }}
                title="Restore"
                className="p-1 rounded-md"
                style={{
                  background: "transparent",
                  color: "var(--color-primary)",
                }}
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePage(p);
                }}
                title="Delete permanently"
                className="p-1 rounded-md"
                style={{
                  background: "transparent",
                  color: "var(--color-error)",
                }}
              >
                <Trash size={16} />
              </button>
            </>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deletePage(p);
              }}
              title="Move to trash"
              className="p-1 rounded-md"
              style={{ background: "transparent", color: "var(--color-error)" }}
            >
              <Trash size={16} />
            </button>
          )}
        </div>
        <p
          className="text-xs whitespace-nowrap"
          style={{ color: "var(--color-neutral-content-light)" }}
        >
          {formatTime(p.$createdAt)}
        </p>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 flex items-start justify-center z-50 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Search pages"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setMenu("Personal")}
      />

      <div
        className="relative w-full max-w-3xl min-h-[80vh] rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "var(--background)",
          color: "var(--color-base-content)",
          border: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ borderColor: "rgba(0,0,0,0.04)" }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 grid place-items-center rounded-md"
              style={{ background: "var(--bn-colors-menu-background)" }}
            >
              <SearchIcon size={18} />
            </div>
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--color-base-content)" }}
              >
                Search your pages
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--color-neutral-content-light)" }}
              >
                Type to filter, press Enter to open
              </p>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <CircleX
              size={20}
              className="cursor-pointer"
              onClick={() => setMenu("Personal")}
              style={{ color: "var(--color-primary)" }}
            />
          </div>
        </div>

        <div className="p-4 max-h-[60vh] overflow-auto">
          <div className="mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages you own or are shared with you..."
              className="w-full rounded-xl px-4 py-3 outline-none"
              style={{
                background: "var(--color-base-100)",
                border: "1px solid rgba(0,0,0,0.06)",
                color: "var(--color-base-content)",
              }}
              autoFocus
              aria-label="Search pages"
            />
          </div>

          <div className="space-y-2">
            {filtered.length === 0 && !loading ? (
              <div
                className="py-8 text-center"
                style={{ color: "var(--color-neutral-content)" }}
              >
                No results
              </div>
            ) : (
              filtered.map((p, i) => (
                <div key={p.$id} className="group">
                  {renderItem(p, i)}
                </div>
              ))
            )}
          </div>

          <div className="mt-3 flex justify-center">
            {hasMore && (
              <button
                onClick={() => loadMore()}
                className="px-3 py-1 rounded-md"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(0,0,0,0.06)",
                  color: "var(--color-base-content)",
                }}
              >
                {loading ? "Loading..." : "Load more"}
              </button>
            )}
          </div>

          {sharedPages.length > 0 && (
            <>
              <h3
                className="mt-6 mb-2 px-1 text-xs font-semibold"
                style={{ color: "var(--color-neutral-content)" }}
              >
                Shared with me
              </h3>
              <div className="space-y-2">
                {sharedPages.map((p, idx) => {
                  const globalIndex = pages.length + idx;
                  return (
                    <div key={p.$id} className="group">
                      {renderItem(p, globalIndex)}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex justify-center">
                {sharedHasMore && (
                  <button
                    onClick={() => sharedLoadMore()}
                    className="px-3 py-1 rounded-md"
                    style={{
                      background: "transparent",
                      border: "1px solid rgba(0,0,0,0.06)",
                      color: "var(--color-base-content)",
                    }}
                  >
                    {sharedLoading ? "Loading..." : "Load more"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
