"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useGetLoggedinUser } from "@/hooks/getLoggedInUser";
import Spinner from "./Spinner";
import { PageType } from "@/types/pageType";
import { toast } from "sonner";
import Search from "./Search";
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  FilePlus,
  Home,
  Search as SearchIcon,
  Trash2,
  VenetianMask,
  Waypoints,
  File,
} from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import Trash from "./Trash";
import { Menu } from "@/types/menuType";
import { databases } from "@/app/(root)/appwrite";
import { ID, Query } from "appwrite";
import Page from "./Page";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "next-themes";

export default function SideBar() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width:768px)");
  const { id, email, name } = useGetLoggedinUser();
  const isResizing = useRef(false);
  const sideBarRef = useRef<HTMLDivElement | null>(null);

  const [isPersonal, setIsPersonal] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [pages, setPages] = useState<PageType[]>([]);
  const [deletedPageId, setDeletedPageId] = useState<string | undefined>(
    undefined
  );
  const [onCreatePageLoading, setOnCreatePageLoading] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState<string>(
    isMobile ? "w-1" : "min-w-72"
  );

  const [menu, setMenuState] = useState<Menu | null>(null);

  const setMenu = (m: Menu | null) => {
    try {
      if (typeof window !== "undefined")
        localStorage.setItem("menu", JSON.stringify(m));
    } catch (e) {}
    setMenuState(m);
  };

  // initialize menu and sidebar width from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const menuValue = localStorage.getItem("menu");
    if (menuValue) {
      try {
        setMenuState(JSON.parse(menuValue));
      } catch (e) {
        setMenuState(null);
      }
    }
    const savedWidth = localStorage.getItem("sidebarWidth");
    if (savedWidth) {
      setSidebarWidth(savedWidth);
      if (sideBarRef.current) sideBarRef.current.style.width = savedWidth;
    }
  }, []);

  // persist width on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("sidebarWidth", sidebarWidth);
    } catch (e) {}
  }, [sidebarWidth]);

  //sync ui on delete page

  useEffect(() => {
    if (!deletedPageId) return;
    setPages((prev) => prev.filter((c) => c.$id !== deletedPageId));
  }, [deletedPageId]);

  // fetch user's pages

  useEffect(() => {
    let mounted = true;
    const fetchPages = async () => {
      try {
        const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
        const PAGE_COLLECTION =
          process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!;

        const res = await (databases as any).listRows({
          databaseId: DB_ID,
          tableId: PAGE_COLLECTION,
          queries: [
            Query.equal("isDeleted", false),
            Query.equal("ownerId", id),
            Query.isNull("parentId"),
            Query.orderDesc("$updatedAt"),
          ],
        });

        const rows = res.rows;
        if (mounted) setPages(rows || []);
      } catch (err) {
        console.debug("fetchPages error:", err);
        toast.error("Failed to load pages.");
      }
    };
    if (id) fetchPages();
    return () => {
      mounted = false;
    };
  }, [id]);

  // create a new page

  async function onCreatePage() {
    try {
      setOnCreatePageLoading(true);
      setMenuState("Create");

      const newPage = await databases.createRow({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        rowId: ID.unique(),
        data: { ownerId: id },
      });

      await databases.createRow({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_PAGES_ID!,
        rowId: ID.unique(),
        data: {
          pageId: newPage.$id,
          ownerId: id,
          sharedUserId: id,
          permission: "FULL_ACCESS",
          email,
          active: true,
        },
      });

      toast.success("New page created");

      setPages((prev) => (newPage ? [...prev, newPage] : prev));

      router.push(`/page/${newPage.$id}`);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't create page — try again");
    } finally {
      setOnCreatePageLoading(false);
    }
  }

  //resize sidebar width

  const mouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current) return;
    let newWidth = e.clientX;
    if (newWidth < 288) newWidth = 288;
    if (newWidth > 1000) newWidth = 1000;
    if (sideBarRef.current) {
      sideBarRef.current.style.width = `${newWidth}px`;
      setSidebarWidth(`${newWidth}px`);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const onChevronLeftClick = () => {
    if (sideBarRef.current) {
      sideBarRef.current.style.width = "3px";
      setSidebarWidth("w-1");
    }
  };

  //logout functionality

  async function logout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      toast.success("Logged out successfully");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Logout failed. Please try again.");
    }
  }

  // keyboard accessibility: toggle sidebar with Esc when open on mobile
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobile && sidebarWidth !== "w-0") {
        if (sideBarRef.current) sideBarRef.current.style.width = "0px";
        setSidebarWidth("w-0");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile, sidebarWidth]);

  return (
    <aside
      ref={sideBarRef}
      className={cn(
        " h-screen transition-all  duration-200 ease-in-out ",
        sidebarWidth
      )}
      aria-label="Main sidebar"
    >
      <div className="relative w-full h-full">
        {sidebarWidth !== "w-1" ? (
          <div
            className={`p-4 bg-(--sidebar-background) text-(--sidebar-foreground) h-screen shadow-lg ${
              isMobile ? "fixed w-full z-50" : ""
            } flex flex-col gap-4`}
          >
            {/* Conditional menus */}
            {menu === "Search" && (
              <Search
                setMenu={
                  setMenu as React.Dispatch<React.SetStateAction<string>>
                }
              />
            )}
            {menu === "Trash" && (
              <Trash
                setMenu={setMenu as React.Dispatch<React.SetStateAction<Menu>>}
              />
            )}

            {/* Brand */}
            <div className="flex items-center justify-between">
              <div className="flex items-end gap-1 select-none">
                <p className="text-4xl font-black text-(--color-primary)">N</p>
                <p className="text-2xl font-black text-[#30C24B]">otex</p>
              </div>
              <button
                aria-label="Collapse sidebar"
                onClick={onChevronLeftClick}
                className="p-1 rounded hover:bg-black/5 active:scale-95"
              >
                <ChevronsLeft size={20} color="var(--sidebar-foreground)" />
              </button>
            </div>

            {/* Menu list */}
            <nav className="flex-1 overflow-auto">
              <ul className="flex flex-col gap-1">
                <li>
                  <button
                    onClick={() => {
                      setMenu("Home");
                      router.push(`/home/${name}`);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 rounded px-3 py-1 text-sm font-medium",
                      menu === "Home"
                        ? "bg-[#3fabe0] text-[#ffffff]"
                        : "hover:bg-[#52b5e6a9] hover:text-[#ffffff]"
                    )}
                  >
                    <Home size={18} />
                    <span>Home</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => setMenuState("Search")}
                    className="w-full flex items-center gap-3 rounded px-3 py-1 hover:bg-[#52b5e6a9] hover:text-[#ffffff]  text-sm font-medium"
                  >
                    <SearchIcon size={18} />
                    <span>Search</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => setMenuState("Trash")}
                    className="w-full flex items-center gap-3 hover:bg-[#52b5e6a9] hover:text-[#ffffff] rounded px-3 py-1 text-sm font-medium"
                  >
                    <Trash2 size={18} />
                    <span>Trash</span>
                  </button>
                </li>

                <li>
                  <div className="w-full flex items-center gap-3 rounded px-3 py-1 text-sm font-medium hover:bg-[#52b5e6a9] hover:text-[#ffffff]">
                    <FilePlus size={18} />
                    <button onClick={onCreatePage} className="w-full text-left">
                      Create New
                    </button>
                  </div>
                </li>

                <li>
                  <button
                    onClick={() => {
                      setMenu("Shared");
                      router.push(`/shared/${name}`);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 rounded px-3 py-1  text-sm font-medium",
                      menu === "Shared"
                        ? "bg-[#3fabe0] text-[#ffffff]"
                        : "hover:bg-[#52b5e6a9] hover:text-[#ffffff]"
                    )}
                  >
                    <Waypoints size={18} />
                    <span>Shared with me</span>
                  </button>
                </li>

                <li>
                  <div>
                    <button
                      onClick={() => setIsPersonal((v) => !v)}
                      className={cn(
                        "w-full flex items-center gap-3 rounded px-3 py-1  text-sm font-medium",
                        menu === "Personal"
                          ? "bg-[#3fabe0] text-[#ffffff]"
                          : "hover:bg-[#52b5e6a9] hover:text-[#ffffff]"
                      )}
                      aria-expanded={isPersonal}
                    >
                      <VenetianMask size={18} />
                      <span className="flex-1 text-left">Personal</span>
                      {isPersonal ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronUp size={16} />
                      )}
                    </button>

                    {/* pages list */}
                    <div className="ml-8 mt-2 mb-2 max-h-52 overflow-auto pr-2">
                      {isPersonal && pages.length === 0 && (
                        <p className="text-xs opacity-60">
                          No pages yet — create a new one.
                        </p>
                      )}
                      {isPersonal &&
                        pages.map((p) => (
                          <Page
                            key={p.$id}
                            page={p}
                            loggedInUserId={id}
                            loggedInUserName={name}
                            setDeletedId={setDeletedPageId}
                          />
                        ))}
                    </div>
                  </div>
                </li>
              </ul>
            </nav>

            {/* footer*/}
            <div className="flex items-center justify-between gap-2 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-gray-200 to-gray-400 flex items-center justify-center text-sm font-semibold">
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="flex flex-col">
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="text-sm font-medium text-left"
                  >
                    {name || "Unknown"}
                  </button>
                  <span className="text-xs opacity-60">{email}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  aria-label="Profile menu"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="p-1 rounded hover:bg-black/5"
                >
                  {profileOpen ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* profile dropdown */}
            {profileOpen && (
              <div
                className="
    absolute left-4 bottom-20 w-[220px]
    rounded-2xl p-3 shadow-xl backdrop-blur-sm border
    transition-transform hover:-translate-y-1
    bg-(--background)
    border-(--bn-colors-menu-background)
    text-(--color-neutral-content)
  "
              >
                <ThemeToggle textVisibility />

                {/* Sign Out */}
                <button
                  onClick={logout}
                  className="
      mt-3 w-full flex items-center gap-3  rounded-sm text-sm font-medium
      text-(--color-error)
      transition-all
      hover:bg-(--color-error-hover)/15%  py-1
      focus:outline-none focus:ring-2 focus:ring-(--color-primary)
      focus:ring-offset-1
    "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2
         2 0 012-2h6a2 2 0 012 2v1"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            )}

            {/* resize handle */}
            <div
              onMouseDown={mouseDown}
              role="separator"
              aria-orientation="vertical"
              className="cursor-ew-resize h-full w-0.5 hover:bg-[#979696] absolute right-0 top-0"
            />
          </div>
        ) : (
          <button
            onClick={() => {
              if (sideBarRef.current) sideBarRef.current.style.width = "320px";
              setSidebarWidth("min-w-72");
            }}
            aria-label="Open sidebar"
            className="absolute -right-9 top-4 z-50 cursor-pointer  p-1 "
          >
            <ChevronsRight size={24} color="var(--sidebar-foreground)" />
          </button>
        )}
      </div>
      {/* Loading overlay when creating */}
      {onCreatePageLoading && (
        <div className="absolute inset-0 z-50 flex width-screen height-screen items-center justify-center bg-white/70 dark:bg-[#00000066]">
          <div className="flex items-center gap-3">
            <Spinner size={28} color="var(--color-primary)" />
            <span className="font-semibold text-(--color-base-content)">
              Creating...
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
