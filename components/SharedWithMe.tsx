"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGetLoggedinUser } from "@/hooks/getLoggedInUser";
import { useSharedPages } from "@/hooks/getOwnedAndSharedPages";
import { DotBackground } from "./ui/dot-background";
import Spinner from "./Spinner";
import { useRouter } from "next/navigation";
import {
  Search,
  ExternalLink,
  Download,
  Copy,
  X,
  ArrowDown,
  ArrowUp,
  List,
  Grid,
  Link as LinkIcon,
} from "lucide-react";
import Card from "./Card";
import { PageType } from "@/types/pageType";

export default function SharedWithMeEnhanced() {
  const { id } = useGetLoggedinUser();
  const router = useRouter();
  const { sharedPages, loading, hasMore, loadMore, resetAndFetch } =
    useSharedPages(id);

  // UI state
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const debounceRef = useRef<number | undefined>(undefined);

  const [sort, setSort] = useState<"recent" | "alpha">("recent");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [preview, setPreview] = useState<PageType | null>(null);

  // debounce input
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

  // derived list: filter + sort
  const list = useMemo(() => {
    let arr = Array.isArray(sharedPages) ? [...sharedPages] : [];
    if (debounced) {
      const q = debounced.toLowerCase();
      arr = arr.filter((p: any) => {
        const title = (p.title ?? p.name ?? "").toString().toLowerCase();
        const snippet = (p.snippet ?? "").toString().toLowerCase();
        return title.includes(q) || snippet.includes(q);
      });
    }
    if (sort === "alpha") {
      arr.sort((a: any, b: any) =>
        (a.title ?? a.name ?? "").localeCompare(b.title ?? b.name ?? "")
      );
    } else {
      arr.sort((a: any, b: any) => {
        const ta = new Date(a.$createdAt ?? 0).getTime();
        const tb = new Date(b.$createdAt ?? 0).getTime();
        return tb - ta;
      });
    }
    return arr as PageType[];
  }, [sharedPages, debounced, sort]);

  /*   // keyboard navigation

  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!list || list.length === 0) return;
      if (e.key === "Escape") return setPreview(null);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((prev) => {
          if (prev === null) return list[0].$id;
          const idx = list.findIndex((i) => i.$id === prev);
          return list[Math.min(idx + 1, list.length - 1)].$id;
        });
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((prev) => {
          if (prev === null) return list[list.length - 1].$id;
          const idx = list.findIndex((i) => i.$id === prev);
          return list[Math.max(idx - 1, 0)].$id;
        });
      }
      if (e.key === "Enter" && selected) {
        const p = list.find((x) => x.$id === selected);
        if (p) router.push(`/page/${p.$id}`);
      }
      // Quick search focus: `/`
      if (e.key === "/") {
        const el = document.getElementById(
          "swm-search-input"
        ) as HTMLInputElement | null;
        if (el) {
          e.preventDefault();
          el.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [list, selected, router]); */

  // UI element if there is no shred page
  const Empty = () => (
    <div className="col-span-full flex flex-col items-center justify-center gap-4 p-8">
      <h3
        className="text-xl font-semibold"
        style={{ color: "var(--color-neutral-content)" }}
      >
        No pages shared with you
      </h3>
      <p
        className="text-sm"
        style={{ color: "var(--color-neutral-content-light)" }}
      >
        When someone shares a page with you it will show up here.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => resetAndFetch()}
          className="mt-2 px-4 py-2 rounded-full border"
          style={{
            borderColor: "var(--bn-colors-menu-background)",
            color: "var(--color-neutral-content)",
          }}
        >
          Refresh
        </button>
        <button
          onClick={() => setQuery("")}
          className="mt-2 px-4 py-2 rounded-full"
          style={{
            background: "var(--color-primary)",
            color: "var(--color-primary-content)",
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );

  return (
    <DotBackground>
      <div className="w-full min-h-[70vh] py-16 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {/* header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-lg shadow-sm"
                style={{
                  background: "var(--color-info-soft)",
                  color: "var(--color-info-content)",
                }}
              >
                <LinkIcon />
              </div>
              <div>
                <h1
                  className="text-3xl font-bold"
                  style={{ color: "var(--color-neutral-content)" }}
                >
                  Shared with you
                </h1>
                <p
                  className="text-sm mt-1"
                  style={{ color: "var(--color-neutral-content-light)" }}
                >
                  Quick access to pages others shared with you
                </p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <input
                  id="swm-search-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search shared pages... (press / to focus)"
                  className="w-full rounded-full px-4 py-2 pr-10 outline-none shadow-sm"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--bn-colors-menu-background)",
                    color: "var(--color-neutral-content)",
                  }}
                />
                <div style={{ position: "absolute", right: 10, top: 9 }}>
                  <Search size={16} />
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <div
                  className="rounded-md px-3 py-2 outline-none"
                  style={{
                    background: "var(--background)",
                    border: "1px solid var(--bn-colors-menu-background)",
                    color: "var(--color-neutral-content)",
                  }}
                >
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as any)}
                    className="bg-transparent outline-none"
                  >
                    <option value="recent">Most recent</option>
                    <option value="alpha">A → Z</option>
                  </select>
                </div>

                <div
                  className="flex items-center gap-2 "
                  style={{
                    borderColor: "var(--bn-colors-menu-background)",
                    background: "var(--background)",
                  }}
                >
                  <button
                    title="List view"
                    onClick={() => setView("list")}
                    className={`p-2 rounded ${view === "list" ? "ring-1" : ""}`}
                    style={{ color: "var(--color-neutral-content)" }}
                  >
                    <List />
                  </button>
                  <button
                    title="Grid view"
                    onClick={() => setView("grid")}
                    className={`p-2 rounded ${view === "grid" ? "ring-1" : ""}`}
                    style={{ color: "var(--color-neutral-content)" }}
                  >
                    <Grid />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* grid / list */}
          <div
            className={
              view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-3"
            }
          >
            {loading && (!list || list.length === 0) ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl animate-pulse ${
                    view === "list" ? "w-full" : ""
                  }`}
                  style={{
                    background: "var(--color-base-200)",
                    border: "1px solid var(--bn-colors-menu-background)",
                  }}
                >
                  <div className="h-6 w-3/4 bg-[rgba(0,0,0,0.04)] rounded mb-2" />
                  <div className="h-3 w-1/2 bg-[rgba(0,0,0,0.04)] rounded mb-4" />
                  <div className="h-28 bg-[rgba(0,0,0,0.03)] rounded" />
                </div>
              ))
            ) : list.length === 0 ? (
              <Empty />
            ) : (
              list.map((p) => {
                return (
                  <Card
                    key={p.$id}
                    data={p}
                    onClick={() => router.push(`/page/${p.$id}`)}
                  />
                );
              })
            )}
          </div>

          {/* load more */}
          <div className="mt-8 flex items-center justify-center">
            {hasMore ? (
              <button
                onClick={() => loadMore()}
                className="px-5 py-2 rounded-full"
                style={{
                  background: "var(--color-primary)",
                  color: "var(--color-primary-content)",
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner color="var(--color-primary)" size={14} />{" "}
                    Loading...
                  </span>
                ) : (
                  "Load more"
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* preview modal */}
      {preview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-6">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setPreview(null)}
          />
          <div
            className="relative max-w-3xl w-full rounded-xl p-6 shadow-2xl"
            style={{
              border: "1px solid var(--bn-colors-menu-background)",
              background: "var(--background)",
            }}
          >
            <button
              className="absolute top-3 right-3 p-1 rounded-md"
              onClick={() => setPreview(null)}
              style={{ color: "var(--color-neutral-content)" }}
            >
              <X />
            </button>
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--color-neutral-content)" }}
            >
              {preview.title ?? "Untitled"}
            </h2>
          </div>
        </div>
      )}
    </DotBackground>
  );
}
