"use client";

import { PageType } from "@/types/pageType";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  StickyNote,
  Trash,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

import { databases } from "@/app/(root)/appwrite";
import { ID, Query } from "appwrite";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const Page = ({
  page,
  loggedInUserId,
  loggedInUserName,
  setDeletedId,
}: {
  page?: PageType;
  loggedInUserId?: string;
  loggedInUserName?: string;
  setDeletedId: (id: string) => void;
}) => {
  const params = usePathname().split("/");
  const [childrens, setChildrens] = useState<PageType[]>([]);
  const [chevronDown, setChevronDown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deletedPageId, setDeletedPageId] = useState<string | undefined>();
  const [imgUrl, setImgUrl] = useState<string | undefined>(page?.logoUrl);
  const [title, setTitle] = useState<string | undefined>(page?.title);
  const pageData = useSelector((state: RootState) => state.pageData);

  const router = useRouter();

  //realtime update page data

  useEffect(() => {
    if (pageData.id === page?.$id && pageData.logoUrl) {
      setImgUrl(pageData.logoUrl);
    } else if (pageData.id === page?.$id && pageData.title) {
      setTitle(pageData.title);
    }
  }, [pageData]);

  // Fetch children pages using childrenIds
  const viewChilds = async () => {
    try {
      if (!loggedInUserId || !page?.$id) {
        throw new Error("User is not authorized");
      }

      setChevronDown(true);

      setLoading(true);

      const result = await databases.listRows({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        queries: [
          Query.equal("parentId", page.$id),
          Query.equal("isDeleted", false),
        ],
      });

      const rows = Array.isArray(result) ? result : result.rows ?? [];
      setChildrens(rows as PageType[]);
    } catch (err) {
      console.error("Failed to fetch child pages:", err);
      toast.error("Failed to load child pages.");
      setChildrens([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new child page
  const addChild = async (e?: React.MouseEvent) => {
    e?.stopPropagation();

    try {
      if (!loggedInUserId) throw new Error("User is not authorized");
      setLoading(true);

      const newPage = await databases.createRow({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        rowId: ID.unique(),
        data: {
          ownerId: loggedInUserId,
          parentId: page?.$id,
          title: "Untitled",
          isDeleted: false,
        },
      });

      await databases.createRow({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_CHILDREN_PAGE_ID!,
        rowId: ID.unique(),
        data: { childrenPageId: newPage.$id, pages: page?.$id },
      });

      setChildrens((prev) => [...prev, newPage]);

      setChevronDown(true);
      toast.success("Page created");
    } catch (err) {
      console.error("Failed to add child:", err);
      toast.error("Failed to add page");
    } finally {
      setLoading(false);
    }
  };

  const onDeletePage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!page?.$id || !loggedInUserId) {
      toast.error("You are not authorized to delete this page.");
      return;
    }

    toast.warning("Are you sure?", {
      description: "This page will be moved to 🗑️ Trash.",
      action: {
        label: "Move to Trash",
        onClick: () => handleDelete(),
      },
    });
  };

  // delete page
  const handleDelete = async () => {
    try {
      if (!page?.$id || !loggedInUserId) {
        toast.error("You are not authorized to delete this page.");
        return;
      }

      await databases.updateRow({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        rowId: page.$id,
        data: { isDeleted: true, deletedAt: new Date().toISOString() },
      });

      setDeletedId(page.$id);
      setDeletedPageId(page.$id);
      params[2] === page.$id && router.push(`/home/${loggedInUserName}`);
      toast.success("Page moved to trash.");
    } catch (err) {
      console.error("Failed to delete page:", err);
      toast.error("Failed to delete the page.");
    }
  };

  useEffect(() => {
    if (!deletedPageId) return;
    setChildrens((prev) => prev.filter((c) => c.$id !== deletedPageId));
  }, [deletedPageId]);

  const handleChevronToggle = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!chevronDown) {
      await viewChilds();
    } else {
      setChevronDown(false);
    }
  };

  return (
    <div className="w-full">
      <div
        className={cn(
          "group w-full flex items-center gap-1.5 rounded-sm p-1 m-0.5 cursor-pointer hover:bg-[#52b5e6a9] hover:text-[#ffffff] active:bg-[#3fabe0] active:text-[#ffffff]",
          params[2] === page?.$id && "bg-[#3fabe0] text-[#ffffff]"
        )}
        onClick={() => {
          localStorage.removeItem("menu");
          if (page?.$id && loggedInUserName) {
            router.push(`/page/${page.$id}`);
          }
        }}
      >
        <div
          onClick={handleChevronToggle}
          role="button"
          aria-label={chevronDown ? "Collapse children" : "Expand children"}
          className="flex items-center justify-center"
        >
          <div className="flex items-center">
            <div className="hidden group-hover:block">
              {!chevronDown ? (
                <ChevronRight size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </div>

            <div className="group-hover:hidden">
              {imgUrl ? (
                <Image
                  src={imgUrl}
                  alt="Page Image"
                  width={20}
                  height={20}
                  className="rounded-full    object-cover"
                />
              ) : (
                <StickyNote
                  color={params[2] === page?.$id ? undefined : "#63A1C0"}
                  size={18}
                />
              )}
            </div>
          </div>
        </div>

        <p className="w-full text-[13px] font-[410] truncate">
          {title ?? "Untitled"}
        </p>

        {/* hover actions: use group-hover to control visibility */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeletePage(e);
            }}
            aria-label="Delete page"
            className="p-1 rounded hover:bg-[#63A1C0] z-20"
            title="Delete page"
          >
            <Trash size={15} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addChild(e);
            }}
            aria-label="Add child page"
            className="p-1 rounded hover:bg-[#63A1C0] z-20"
            title="Add child page"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      {/* Render child pages with left border (hierarchy) */}
      <div className="ml-3.5 border-l-2 border-gray-300 pl-2">
        {loading && (
          <span className="flex justify-center">
            <Spinner size={26} color="#3897E4" />
          </span>
        )}

        {chevronDown && !loading && childrens.length > 0 && (
          <>
            {childrens.map((child) => (
              <Page
                key={child.$id}
                page={child}
                loggedInUserId={loggedInUserId}
                loggedInUserName={loggedInUserName}
                setDeletedId={setDeletedPageId}
              />
            ))}
          </>
        )}

        {chevronDown && childrens.length === 0 && !loading && (
          <p className="pl-3 text-xs text-gray-500">No Pages</p>
        )}
      </div>
    </div>
  );
};

export default Page;
