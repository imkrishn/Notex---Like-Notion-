"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
import URLBox from "./URLBox";
import Image from "next/image";
import { useGetLoggedinUser } from "@/hooks/getLoggedInUser";
import Spinner from "./Spinner";
import InviteUser from "./InviteUser";
import Publish from "./Publish";
import { EllipsisVertical, Languages, RotateCw, Trash, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Translate from "./Translate";
import ThemeToggle from "./ThemeToggle";
import { databases } from "@/app/(root)/appwrite";
import { updatePageData } from "@/lib/updatePageData";
import { Editor } from "./Editor";
import { Room } from "./Room";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setPageData } from "@/redux/slices/pageData";
import PageSkeleton from "./ui/SkeletonPage";

const Create = ({ pageId, edit }: { pageId: string; edit: boolean }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const divRef = useRef<HTMLDivElement>(null);
  const coverDivRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const loggedInUser = useGetLoggedinUser();
  const loggedInUserId = loggedInUser.id;
  const roomId = `notex-${pageId}`;

  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [onCoverClick, setOnCoverClick] = useState<boolean>(false);
  const [onImageClick, setOnImageClick] = useState<boolean>(false);
  const [isDeleted, setIsDeleted] = useState<boolean>(false);
  const [coverImgUrl, setCoverImgUrl] = useState<string | undefined>();
  const [imgUrl, setImgUrl] = useState<string | undefined>();
  const [pageName, setPageName] = useState<string | undefined>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [restoreLoading, setRestoreLoading] = useState<boolean>(false);
  const [onInvitedClick, setOnInvitedClick] = useState<boolean>(false);
  const [onPublishClick, setOnPublishClick] = useState<boolean>(false);
  const [onMenuClick, setOnMenuClick] = useState<boolean>(false);
  const [onTranslateClick, setOnTranslateClick] = useState(false);
  const [mount, setMount] = useState(false);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [text, setText] = useState<string | undefined>();

  const handleClickOutside = (event: MouseEvent) => {
    if (divRef.current && !divRef.current.contains(event.target as Node)) {
      setOnImageClick(false);
    }
    if (
      coverDivRef.current &&
      !coverDivRef.current.contains(event.target as Node)
    ) {
      setOnCoverClick(false);
    }
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setOnMenuClick(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (imgUrl) {
      dispatch(setPageData({ id: pageId, logoUrl: imgUrl }));
    }
  }, [imgUrl]);

  useEffect(() => {
    async function fetchPageData() {
      setLoading(true);
      setMount(true);
      try {
        const page = await databases.getRow({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
          rowId: pageId,
        });

        if (!page) {
          return toast.error("No page found");
        }

        const { title, coverUrl, logoUrl, isDeleted, ownerId } = page;

        setCoverImgUrl(coverUrl);
        setPageName(title);
        setImgUrl(logoUrl);
        setIsDeleted(isDeleted);
        setIsOwner(loggedInUserId === ownerId);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch page.Try again");
      } finally {
        setLoading(false);
      }
    }

    if (pageId && loggedInUserId) {
      fetchPageData();
    }
  }, [pageId, loggedInUserId]);

  //update title

  const updateTitle = (query: string) => {
    if (!query.trim()) return;
    dispatch(
      setPageData({
        id: pageId,
        title: query,
      })
    );
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        await updatePageData(pageId, { title: query });
      } catch (err) {
        console.error("Failed while updating page title", err);
      }
    }, 400);
  };

  // move to trash

  async function moveToTrash() {
    if (!pageId || !loggedInUserId) {
      return toast.error("Unable to put in trash");
    }
    setDeleteLoading(true);
    try {
      await updatePageData(pageId, { isDeleted: true });
      setIsDeleted(true);
    } catch (err) {
      console.error("Error while moving to trash :", err);
    } finally {
      setDeleteLoading(false);
      setOnMenuClick(false);
    }
  }

  //restore page
  async function restorePage() {
    if (!pageId || !loggedInUserId) {
      return toast.error("Unable to restore page");
    }

    if (!isOwner) {
      toast.warning("Only owner can restore the page");
    }
    setRestoreLoading(true);
    try {
      await updatePageData(pageId, { isDeleted: false });
      setIsDeleted(false);
    } catch (err) {
      console.error("Error whiling restoring page :", err);
    } finally {
      setRestoreLoading(false);
    }
  }

  // delete Permanently

  async function deletePermanently() {
    if (!pageId || !loggedInUserId) {
      return toast.error("Unable to put in trash");
    }
    if (!isOwner) {
      toast.warning("Only owner can delete the page permanently");
      return;
    }
    setDeleteLoading(true);
    try {
      await databases.deleteRow({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAGE_ID!,
        rowId: pageId,
      });

      toast.success("Page Deleted");
      window.location.href = process.env.NEXT_PUBLIC_URL!;
    } catch (err) {
      console.error("Error whiling deleting page :", err);
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "w-full h-screen flex justify-center transition-colors duration-300",
        "bg-(--background) text-(--color-neutral-content)"
      )}
      data-theme={theme}
    >
      {loading || !mount ? (
        <PageSkeleton />
      ) : (
        <div className="w-full h-full">
          {edit && isDeleted && isOwner && (
            <div className=" text-(--color-info-content) py-2 text-xs font-medium flex justify-center items-center gap-6 ">
              <button
                disabled={restoreLoading}
                onClick={restorePage}
                className="rounded-md block px-3 py-1 bg-(--color-base-200) text-(--color-primary) border border-(--color-primary) hover:bg-(--color-base-300) transition"
              >
                {restoreLoading ? "Restoring" : "Restore"}{" "}
                <RotateCw className="mx-2 inline" size={15} />
              </button>
              <button
                disabled={deleteLoading}
                onClick={deletePermanently}
                className="rounded-md bg-(--color-error) text-white px-3 py-1 hover:bg-(--color-error-hover) transition flex items-center gap-1"
              >
                {deleteLoading ? "Deleting ..." : "Delete Permanently"}{" "}
                <X size={18} />
              </button>
            </div>
          )}

          {/*  Translate modal */}
          {onTranslateClick && <Translate setUI={setOnTranslateClick} />}

          {/* Top Bar */}
          {edit && isOwner && !isDeleted ? (
            <div className="flex  pt-3  justify-end px-6 items-center gap-1 relative">
              <ThemeToggle />
              <button
                onClick={() => setOnTranslateClick((prev) => !prev)}
                className="flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-md text-(--color-neutral-content) hover:bg-(--color-base-200) transition"
              >
                <Languages size={15} /> Translate
              </button>

              <button
                onClick={() => setOnInvitedClick((prev) => !prev)}
                className="flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-md text-(--color-neutral-content) hover:bg-(--color-base-200) transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-plus"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                Invite
              </button>

              <button
                onClick={() => setOnPublishClick((prev) => !prev)}
                className="rounded-md px-4 py-1 text-(--color-primary) border border-(--color-primary) hover:bg-(--color-primary) hover:text-(--color-primary-content) transition font-medium"
              >
                Publish{" "}
              </button>

              <EllipsisVertical
                size={22}
                className="cursor-pointer text-(--color-neutral-content) hover:opacity-80"
                onClick={() => setOnMenuClick((prev) => !prev)}
              />

              {onInvitedClick && (
                <InviteUser
                  loggedInUserId={loggedInUserId}
                  pageId={pageId}
                  setUI={setOnInvitedClick}
                />
              )}

              {onPublishClick && (
                <Publish setUI={setOnPublishClick} pageId={pageId} />
              )}

              {onMenuClick && (
                <div
                  ref={menuRef}
                  className="absolute top-12 right-8 rounded-md p-2 z-50 bg-(--color-base-100) border border-(--color-base-300) shadow-md"
                >
                  <button
                    disabled={deleteLoading}
                    onClick={moveToTrash}
                    className="flex gap-2 items-center rounded-md text-sm text-(--color-neutral-content) hover:bg-(--color-base-200) p-2 cursor-pointer transition"
                  >
                    <Trash size={15} />{" "}
                    {deleteLoading ? "Moving ..." : "Move to Trash"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex  pt-3 justify-end px-6 items-center gap-1 relative">
              <ThemeToggle />
              <button
                onClick={() => setOnTranslateClick((prev) => !prev)}
                className="flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-md text-(--color-neutral-content) hover:bg-(--color-base-200) transition"
              >
                <Languages size={15} /> Translate
              </button>
            </div>
          )}

          {/* Page Section */}
          <div className=" w-full h-full overflow-auto ">
            <div className=" w-full min-h-60 relative my-8">
              <div
                onClick={() => {
                  if (isOwner) setOnImageClick((prev) => !prev);
                }}
                className={cn(
                  "absolute left-8 h-20 w-20  -top-8 cursor-pointer rounded-full   shadow-md ",
                  !imgUrl &&
                    "bg-(--color-base-200) border-2 border-(--color-base-300)"
                )}
              >
                {imgUrl && (
                  <Image
                    key={imgUrl}
                    src={imgUrl || ""}
                    alt="User Avatar"
                    width={1000}
                    height={1000}
                    className="rounded-full  h-20 w-20 object-cover"
                  />
                )}
              </div>

              {onImageClick && edit && (
                <URLBox
                  ref={divRef}
                  accept="image/*"
                  pageId={pageId}
                  setObjectClick={setOnImageClick}
                  setValue={setImgUrl}
                  isLink={false}
                  isEmoji={true}
                  className="absolute top-10 left-20"
                />
              )}

              <div
                onClick={() => {
                  if (isOwner) setOnCoverClick((prev) => !prev);
                }}
                className="w-full h-64 bg-(--color-base-200) border-y border-(--color-base-300) hover:bg-(--color-base-300) transition cursor-pointer overflow-hidden ml-1"
              >
                {coverImgUrl && (
                  <Image
                    key={coverImgUrl}
                    src={coverImgUrl}
                    alt="Cover Image"
                    width={2000}
                    height={600}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {onCoverClick && edit && (
                <URLBox
                  ref={coverDivRef}
                  pageId={pageId}
                  accept="image/*"
                  setObjectClick={setOnCoverClick}
                  setValue={setCoverImgUrl}
                  isLink={true}
                  isEmoji={false}
                  className="absolute top-20 right-20"
                />
              )}
            </div>

            <input
              onChange={(e) => updateTitle(e.target.value)}
              disabled={!edit}
              type="text"
              className="text-4xl px-6 mt-6 w-full outline-none bg-transparent font-black text-(--color-neutral-content) placeholder-(--color-neutral-content-light)"
              defaultValue={pageName}
              placeholder="Untitled"
            />
            <Room roomId={roomId}>
              <Editor pageId={pageId} />
            </Room>
          </div>
        </div>
      )}
    </div>
  );
};

export default Create;
