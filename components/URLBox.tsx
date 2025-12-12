"use client";

import { storage } from "@/app/(root)/appwrite";
import { updatePageData } from "@/lib/updatePageData";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Upload } from "lucide-react";
import React, { useState, forwardRef } from "react";
import Spinner from "./Spinner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { ID } from "appwrite";

type Props = {
  setObjectClick: (value: boolean) => void;
  className: string;
  isEmoji?: boolean;
  isLink?: boolean;
  accept: string;
  pageId: string;
  setValue: (value: any) => void;
};

type Click = "emoji" | "upload" | "link";

const URLBox = forwardRef<HTMLDivElement, Props>(
  (
    { setObjectClick, className, isEmoji, isLink, accept, pageId, setValue },
    ref
  ) => {
    const [onClick, setOnClick] = useState<Click>("upload");
    const [link, setLink] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const { theme } = useTheme();

    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;
    if (!bucketId) {
      console.error("Appwrite bucket ID is not defined.");
      return null;
    }

    const getButtonClass = (type: Click) =>
      cn(
        "px-3 py-1 text-sm font-medium transition-all duration-150 rounded-lg cursor-pointer",
        "hover:bg-[var(--color-base-200)] hover:text-[var(--color-primary)]",
        onClick === type
          ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]"
          : "text-[var(--color-base-content)] opacity-80"
      );

    const handleEmojiClick = async (emojiData: EmojiClickData) => {
      try {
        setLoading(true);
        setValue(emojiData.imageUrl);
        await updatePageData(pageId, { logoUrl: emojiData.imageUrl });
      } catch (error) {
        console.error("Error updating emoji:", error);
        toast.error("Failed, try again");
      } finally {
        setLoading(false);
        setObjectClick(false);
      }
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      try {
        setLoading(true);
        const file = e.target.files?.[0];
        if (file) {
          const uploadFile = await storage.createFile({
            bucketId,
            fileId: ID.unique(),
            file,
          });
          const fileHref = await storage.getFileView({
            bucketId,
            fileId: uploadFile.$id,
          });
          if (fileHref) {
            setValue(fileHref);
            isEmoji
              ? await updatePageData(pageId, { logoUrl: fileHref })
              : await updatePageData(pageId, { coverUrl: fileHref });
          }
        }
      } catch (error) {
        console.error("File upload failed:", error);
        toast.error("Failed to upload. Try again");
      } finally {
        setLoading(false);
        setObjectClick(false);
      }
    };

    const handleLink = () => {
      if (link.trim()) {
        setValue(link);
        setObjectClick(false);
        setLink("");
      }
    };

    return (
      <>
        {loading ? (
          <div
            ref={ref}
            className={cn(
              "min-w-56 flex justify-center rounded-xl shadow-md z-99999 p-4",
              "bg-(--color-base-200) border border-(--color-neutral)",
              className
            )}
          >
            <Spinner size={40} color="var(--color-primary)" />
          </div>
        ) : (
          <div
            ref={ref}
            className={cn(
              "rounded-xl shadow-lg z-99999 p-4 w-[370px] transition-all duration-200",
              "bg-(--color-base-100) border border-(--color-neutral)",
              "backdrop-blur-md backdrop-saturate-150",
              className
            )}
          >
            {/* Tabs */}
            <div className="flex gap-3 mb-4 border-b border-(--color-neutral) pb-2">
              {isEmoji && (
                <button
                  onClick={() => setOnClick("emoji")}
                  className={getButtonClass("emoji")}
                >
                  Emojis
                </button>
              )}
              {isLink && (
                <button
                  onClick={() => setOnClick("link")}
                  className={getButtonClass("link")}
                >
                  Link
                </button>
              )}
              <button
                onClick={() => setOnClick("upload")}
                className={getButtonClass("upload")}
              >
                Upload
              </button>
            </div>

            {/* Body */}
            <div className="w-full py-2">
              {onClick === "emoji" && (
                <div className="max-h-[300px] overflow-y-auto rounded-md">
                  <EmojiPicker
                    theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                    onEmojiClick={handleEmojiClick}
                    skinTonesDisabled
                    lazyLoadEmojis
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}

              {onClick === "link" && (
                <div className=" bg-(--color-base-200) rounded-xl p-4 flex flex-col gap-3 justify-center items-center transition-all duration-200">
                  <input
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    type="text"
                    placeholder="Paste any image link..."
                    className="text-sm rounded-lg outline-none border border-(--color-neutral) bg-(--color-base-100) px-3 py-2 w-full focus:border-(--color-primary) transition-all"
                  />
                  <button
                    onClick={handleLink}
                    className="bg-(--color-primary) text-(--color-primary-content) font-medium cursor-pointer rounded-lg px-4 py-1.5 hover:opacity-90 active:scale-[.98] transition-all"
                  >
                    Submit
                  </button>
                </div>
              )}

              {onClick === "upload" && (
                <div className="bg-(--color-base-200) rounded-xl p-4 transition-all duration-200">
                  <label className="cursor-pointer bg-(--color-base-300) text-(--color-base-content) rounded-lg w-full flex gap-2 items-center justify-center py-3 hover:bg-(--color-base-200) hover:text-(--color-primary) transition-all">
                    <Upload size={20} />
                    Upload File
                    <input
                      onChange={handleFile}
                      type="file"
                      accept={accept}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }
);

URLBox.displayName = "URLBox";
export default URLBox;
