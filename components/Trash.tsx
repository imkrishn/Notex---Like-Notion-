"use client";

import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Card from "./Card";
import { useGetLoggedinUser } from "@/hooks/getLoggedInUser";
import { useRouter } from "next/navigation";
import {
  ArrowLeftCircle,
  ArrowRightCircle,
  CircleX,
  Trash2,
  RotateCw,
} from "lucide-react";
import { PageType } from "@/types/pageType";
import { useMediaQuery } from "usehooks-ts";
import Spinner from "./Spinner";
import { Menu } from "@/types/menuType";
import { databases } from "@/app/(root)/appwrite";
import { Query } from "appwrite";
import { toast } from "sonner";

/**
 * Trash component — fixed and functional
 *
 * Notes:
 * - Expects your Appwrite wrapper to expose:
 *     databases.listRows({ databaseId, tableId, queries })
 *     databases.updateRow({ databaseId, tableId, rowId, data })
 *     databases.deleteRow({ databaseId, tableId, rowId })
 *   If your wrapper uses different names (e.g., `getDocuments` / `updateDocument`),
 *   replace those calls accordingly.
 */

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PAGE_COL_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function Trash({ setMenu }: { setMenu: Dispatch<SetStateAction<Menu>> }) {
  // support multiple shapes returned by useGetLoggedInUser
  const user = useGetLoggedinUser();
  const userId = user.id;

  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:768px)");
  const cardsPerView = isMobile ? 1 : 2;

  const [deletedPages, setDeletedPages] = useState<PageType[]>([]);
  const [backupPages, setBackupPages] = useState<PageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Reset slide index when cardsPerView changes
  useEffect(() => setSlideIndex(0), [cardsPerView]);

  // Fetch deleted pages; if reset === true, replace lists and reset cursor
  const fetchDeletedPages = useCallback(
    async (reset = false) => {
      if (!userId) return;
      if (loading) return;
      setLoading(true);

      try {
        // when resetting, clear cursor so we fetch from start
        const cursor = reset ? null : lastDocId;
        if (reset) {
          setLastDocId(null);
        }

        const limit = cardsPerView * 3; // fetch a few frames worth
        const queries: any[] = [
          Query.equal("ownerId", userId),
          Query.equal("isDeleted", true),
          Query.orderDesc("deletedAt"),
          Query.limit(limit),
        ];

        if (cursor) queries.push(Query.cursorAfter(cursor));

        const res = await databases.listRows({
          databaseId: DB_ID,
          tableId: PAGE_COL_ID,
          queries,
        });

        const docs: PageType[] =
          (res as any).rows ?? (res as any).documents ?? [];

        if (reset) {
          setDeletedPages(docs);
          setBackupPages(docs);
        } else {
          // append
          setDeletedPages((prev) => [...prev, ...docs]);
          setBackupPages((prev) => [...prev, ...docs]);
        }

        if (docs.length > 0) {
          setLastDocId(docs[docs.length - 1].$id ?? null);
          setHasMore(docs.length === limit);
        } else {
          // no docs returned
          if (reset) {
            setLastDocId(null);
          }
          setHasMore(false);
        }
      } catch (err) {
        console.error("fetchDeletedPages:", err);
      } finally {
        setLoading(false);
      }
    },
    [userId, lastDocId, loading, cardsPerView]
  );

  // initial load
  useEffect(() => {
    fetchDeletedPages(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDeletedPages]);

  useEffect(() => {
    if (!searchQuery) {
      setDeletedPages(backupPages);
      setSlideIndex(0);
      return;
    }
    const q = searchQuery.trim().toLowerCase();
    const filtered = backupPages.filter((p) => {
      const title = (p.title ?? "").toString().toLowerCase();

      return title.includes(q);
    });
    setDeletedPages(filtered);
    setSlideIndex(0);
  }, [searchQuery, backupPages]);

  const frames = useMemo(
    () => chunk(deletedPages, cardsPerView),
    [deletedPages, cardsPerView]
  );

  const totalFrames = Math.max(1, frames.length);

  const handleNext = useCallback(async () => {
    const next = slideIndex + 1;

    if (next >= frames.length) {
      if (hasMore) {
        await fetchDeletedPages(false);

        setSlideIndex((s) => s + 1);
      }
    } else {
      setSlideIndex((s) => s + 1);
    }
  }, [slideIndex, frames.length, hasMore, fetchDeletedPages]);

  const handlePrev = useCallback(() => {
    setSlideIndex((s) => Math.max(s - 1, 0));
  }, []);

  // restore page
  const handleRestore = useCallback(async (pageId: string) => {
    if (!pageId) return;
    setLoading(true);
    try {
      await databases.updateRow({
        databaseId: DB_ID,
        tableId: PAGE_COL_ID,
        rowId: pageId,
        data: { isDeleted: false },
      });
      // remove locally
      setDeletedPages((prev) => prev.filter((p) => p.$id !== pageId));
      setBackupPages((prev) => prev.filter((p) => p.$id !== pageId));
      toast?.success?.("Restored");
    } catch (err) {
      console.error("handleRestore:", err);
      toast?.error?.("Restore failed");
    } finally {
      setLoading(false);
    }
  }, []);

  // permanent delete
  const handlePermanentDelete = useCallback(async (pageId: string) => {
    if (!pageId) return;
    if (!confirm("Permanently delete this page? This cannot be undone."))
      return;
    setLoading(true);
    try {
      await databases.deleteRow({
        databaseId: DB_ID,
        tableId: PAGE_COL_ID,
        rowId: pageId,
      });
      setDeletedPages((prev) => prev.filter((p) => p.$id !== pageId));
      setBackupPages((prev) => prev.filter((p) => p.$id !== pageId));
      toast.success("Deleted permanently");
    } catch (err) {
      console.error("handlePermanentDelete:", err);
      toast.error("Permanent delete failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const onCardClick = (id: string) => {
    setMenu("Create");
    router.push(`/page/${id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-(--color-base-100) w-full max-w-3xl h-[78vh] rounded-lg shadow-xl overflow-hidden"
        style={{ color: "var(--sidebar-foreground)" }}
      >
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: "var(--color-base-300)" }}
        >
          <h3 className="text-lg font-semibold">Trash</h3>

          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-1 rounded-md"
              onClick={() => {
                setSearchQuery("");
                fetchDeletedPages(true);
              }}
              title="Refresh"
            >
              <RotateCw size={16} />
              <span className="text-sm">Refresh</span>
            </button>

            <CircleX
              size={20}
              className="cursor-pointer"
              onClick={() => setMenu("Create")}
            />
          </div>
        </div>

        <div className="p-4 h-full flex flex-col">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deleted pages..."
            className="w-full rounded-md px-3 py-2 mb-4 outline-none"
            style={{
              backgroundColor: "var(--color-base-200)",
              border: `1px solid var(--color-base-300)`,
              color: "var(--sidebar-foreground)",
            }}
          />

          <p className="font-medium mb-2">Recently deleted...</p>

          <div className="relative bg-transparent flex-1 overflow-hidden">
            {loading && deletedPages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <Spinner color="var(--color-primary)" size={25} />
              </div>
            ) : deletedPages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm opacity-60">Trash is empty</p>
              </div>
            ) : (
              <div
                className="h-full w-full transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${slideIndex * 100}%)`,
                  display: "flex",
                  width: `${frames.length * 100}%`,
                }}
              >
                {frames.map((frame, frameIdx) => (
                  <div
                    key={`frame-${frameIdx}`}
                    className="flex gap-4 items-start justify-start p-1"
                    style={{
                      width: `${100 / frames.length}%`,
                      paddingRight: 8,
                      paddingLeft: 8,
                    }}
                  >
                    {frame.map((page) => (
                      <div
                        key={page.$id}
                        className="shrink-0 rounded-md p-2 border bg-(--color-base-100)"
                        style={{
                          width: `calc((100% - ${
                            (cardsPerView - 1) * 16
                          }px) / ${cardsPerView})`,
                          borderColor: "var(--color-base-300)",
                        }}
                      >
                        <Card
                          data={page}
                          onClick={() => onCardClick(page.$id)}
                        />
                        <div className="mt-3 flex items-center gap-2 justify-end">
                          <button
                            title="Restore"
                            onClick={() => handleRestore(page.$id)}
                            className="flex items-center gap-2 px-2 py-1 rounded-md"
                            style={{ color: "var(--color-primary)" }}
                          >
                            <RotateCw size={16} />
                            <span className="text-sm">Restore</span>
                          </button>

                          <button
                            title="Delete permanently"
                            onClick={() => handlePermanentDelete(page.$id)}
                            className="flex items-center gap-2 px-2 py-1 rounded-md"
                            style={{ color: "var(--color-error)" }}
                          >
                            <Trash2 size={16} />
                            <span className="text-sm">Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* if frame has fewer than cardsPerView, fill with spacer(s) to keep layout stable */}
                    {frame.length < cardsPerView &&
                      Array.from({ length: cardsPerView - frame.length }).map(
                        (_, i) => (
                          <div
                            key={`spacer-${i}`}
                            className="shrink-0"
                            style={{
                              width: `calc((100% - ${
                                (cardsPerView - 1) * 16
                              }px) / ${cardsPerView})`,
                            }}
                          />
                        )
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <ArrowLeftCircle
              size={30}
              className={`cursor-pointer active:scale-95 ${
                slideIndex === 0 ? "opacity-30 cursor-not-allowed" : ""
              }`}
              onClick={handlePrev}
            />

            <p className="text-sm">
              {deletedPages.length > 0
                ? `${Math.min(slideIndex + 1, totalFrames)} of ${totalFrames}`
                : ""}
            </p>

            <ArrowRightCircle
              size={30}
              className={`cursor-pointer active:scale-95 ${
                slideIndex >= totalFrames - 1 && !hasMore
                  ? "opacity-30 cursor-not-allowed"
                  : ""
              }`}
              onClick={handleNext}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Trash;
