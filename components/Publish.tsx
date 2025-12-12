"use client";

import { databases } from "@/app/(root)/appwrite";
import { Copy, Globe, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Spinner from "./Spinner";

interface PageCache {
  isPublished: boolean;
  copiedText: string;
}

const Publish = ({
  setUI,
  pageId,
}: {
  setUI: (value: boolean) => void;
  pageId: string;
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isPublished, setIsPublished] = useState<boolean | undefined>();
  const [loadingData, setLoadingData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [onClickCopiedBtn, setOnClickCopiedBtn] = useState(false);

  //  Handle click outside
  function handleClickOutside(e: MouseEvent) {
    if (divRef.current && !divRef.current.contains(e.target as Node)) {
      setUI(false);
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //  load from cache
  useEffect(() => {
    async function fetchData() {
      try {
        if (!pageId) return;

        const cachedData = localStorage.getItem(`publish_${pageId}`);
        if (cachedData) {
          const parsed: PageCache = JSON.parse(cachedData);
          setIsPublished(parsed.isPublished);
          setCopiedText(parsed.copiedText);
          return;
        }

        setLoadingData(true);
        const page = await databases.getRow({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
          rowId: pageId,
        });

        if (page) {
          const url = `${process.env.NEXT_PUBLIC_URL}/preview/${pageId}`;
          setIsPublished(page.isPublished);
          setCopiedText(url);
          localStorage.setItem(
            `publish_${pageId}`,
            JSON.stringify({ isPublished: page.isPublished, copiedText: url })
          );
        }
      } catch (err) {
        console.log(err);
        toast.error("Failed to load");
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, [pageId]);

  // Publish page
  async function onPublish() {
    try {
      if (!pageId) return toast.error("Page is missing");
      setLoading(true);

      await databases.updateRow({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        rowId: pageId,
        data: { isPublished: true },
      });

      const url = `${process.env.NEXT_PUBLIC_URL}/preview/${pageId}`;
      setCopiedText(url);
      setIsPublished(true);
      toast.success("Note published successfully");

      localStorage.setItem(
        `publish_${pageId}`,
        JSON.stringify({ isPublished: true, copiedText: url })
      );
    } catch (err) {
      console.log(err);
      toast.error("Failed to publish");
    } finally {
      setLoading(false);
    }
  }

  //  Unpublish page
  async function onUnpublish() {
    try {
      if (!pageId) return toast.error("Page is missing");
      setLoading(true);

      await databases.updateRow({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        rowId: pageId,
        data: { isPublished: false },
      });

      setIsPublished(false);
      toast.success("Note unpublished successfully");

      localStorage.setItem(
        `publish_${pageId}`,
        JSON.stringify({ isPublished: false, copiedText })
      );
    } catch (err) {
      console.log(err);
      toast.error("Failed to unpublish");
    } finally {
      setLoading(false);
    }
  }

  function onClickCopyBtn() {
    navigator.clipboard.writeText(copiedText);
    setOnClickCopiedBtn(true);
    setTimeout(() => setOnClickCopiedBtn(false), 2000);
  }

  return (
    <div
      ref={divRef}
      className="absolute top-12 right-6 z-30 w-[380px] p-5 rounded-2xl shadow-lg border 
      border-(--color-base-300)
      bg-(--color-base-100)
      text-(--color-base-content)
      transition-all duration-300 animate-fadeIn"
    >
      <div className="flex justify-between items-center mb-4">
        <X
          size={20}
          className="cursor-pointer text-(--color-neutral-content-light) hover:text-(--color-primary) transition"
          onClick={() => setUI(false)}
        />
      </div>

      {loadingData ? (
        <div className="flex justify-center py-6">
          <Spinner size={40} color="var(--color-primary)" />
        </div>
      ) : isPublished ? (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 text-(--color-neutral-content)">
            <Globe size={24} className="text-(--color-primary)" />
            <span>This page is live</span>
          </div>

          <div className="flex items-center gap-2 mt-4 w-full border border-(--color-primary) rounded-xl bg-(--color-base-200) focus-within:ring-2 focus-within:ring-(--color-primary) transition">
            <textarea
              readOnly
              value={copiedText}
              className="w-full bg-transparent text-sm px-3 py-2 outline-none resize-none text-(--color-base-content)"
            />
            <Copy
              onClick={onClickCopyBtn}
              size={22}
              className="mr-3 cursor-pointer text-(--color-primary) hover:scale-95 transition-transform"
            />
          </div>

          {onClickCopiedBtn && (
            <p className="text-sm text-(--color-info-content) mt-1">
              Link copied ✅
            </p>
          )}

          <button
            onClick={onUnpublish}
            disabled={loading}
            className="w-full mt-5 py-2 rounded-lg font-semibold transition active:scale-95
            bg-(--color-primary) text-(--color-primary-content)
            hover:opacity-90"
          >
            {loading ? "Unpublishing..." : "Unpublish"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Globe
            size={42}
            className="text-(--color-primary) mb-2 animate-pulse"
          />
          <p className="text-(--color-neutral-content-light) text-sm text-center mb-4">
            Publishing makes your page publicly accessible.
          </p>

          <button
            onClick={onPublish}
            disabled={loading}
            className="w-full py-2 rounded-lg font-semibold transition active:scale-95
            bg-(--color-primary) text-(--color-primary-content)
            hover:opacity-90"
          >
            {loading ? "Publishing..." : "Publish"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Publish;
