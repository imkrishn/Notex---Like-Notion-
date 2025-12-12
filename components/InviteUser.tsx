"use client";

import { databases } from "@/app/(root)/appwrite";
import { cn } from "@/lib/utils";
import { ID, Query } from "appwrite";
import { CircleX } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface User {
  $id?: string;
  fullName?: string;
  permission?: Permission;
  email?: string;
  invited: boolean;
}

type Permission = "FULL_ACCESS" | "READ_ACCESS";

const InviteUser = ({
  loggedInUserId,
  pageId,
  setUI,
}: {
  loggedInUserId: string | undefined;
  pageId: string;
  setUI: (value: boolean) => void;
}) => {
  const [invitedUser, setInvitedUser] = useState<User>();
  const [permission, setPermission] = useState<Permission>("READ_ACCESS");
  const [loading, setLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [err, setErr] = useState("");
  const [onHover, setOnHover] = useState(false);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const isOwner = ownerId === loggedInUserId;

  function handleClickOutside(e: MouseEvent) {
    if (divRef.current && !divRef.current.contains(e.target as Node)) {
      setUI(false);
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        onSearch(searchQuery);
      } else {
        setInvitedUser(undefined);
      }
    }, 400);
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, [searchQuery]);

  async function onSearch(query: string) {
    try {
      setLoading(true);
      if (!loggedInUserId) {
        toast.error("You are not authorized");
        return;
      }

      const user = await databases.listRows({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
        queries: [Query.startsWith("email", query)],
      });

      if (user.total > 0) {
        const isShared = await databases.listRows({
          databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_PAGES_ID!,
          queries: [
            Query.equal("ownerId", loggedInUserId),
            Query.startsWith("email", query),
            Query.equal("pageId", pageId),
          ],
        });

        const { $id, fullName, email } = user.rows[0];

        setOwnerId($id);

        if (isShared.total > 0) {
          setInvitedUser({
            fullName,
            email,
            $id,
            permission: isShared.rows[0].permission,
            invited: true,
          });
        } else {
          setInvitedUser({
            fullName: fullName || "Unknown",
            email,
            permission: "READ_ACCESS",
            $id,
            invited: false,
          });
        }
      } else {
        setErr("No user found with this email");
        setInvitedUser(undefined);
        setOwnerId(null);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function onInviteUser() {
    if (!invitedUser || !invitedUser.email) {
      toast.error("Email is required");
      return;
    }

    if (!pageId || !loggedInUserId) {
      toast.error("Not authorized or page not found");
      return;
    }

    setInviteLoading(true);
    try {
      await databases.createRow({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_PAGES_ID!,
        rowId: ID.unique(),
        data: {
          pageId,
          ownerId: loggedInUserId,
          sharedUserId: invitedUser.$id,
          permission,
          email: invitedUser.email,
          active: true,
        },
      });
      toast.success("User Invited");
      setInvitedUser((prev) => ({ ...prev!, invited: true }));
    } catch (Err) {
      console.log(Err);
      toast.error("Failed to invite user");
    } finally {
      setInviteLoading(false);
    }
  }

  async function onDisInviteuser() {
    try {
      if (!invitedUser || !invitedUser.email) {
        toast.error("Email is required");
        return;
      }

      setInviteLoading(true);
      const isShared = await databases.listRows({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_PAGES_ID!,
        queries: [
          Query.equal("ownerId", loggedInUserId!),
          Query.equal("email", invitedUser.email),
        ],
      });

      await databases.deleteRow({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SHARED_PAGES_ID!,
        rowId: isShared.rows[0].$id,
      });

      toast.success("User Disinvited");
      setInvitedUser((prev) => ({ ...prev!, invited: false }));
    } catch (Err) {
      console.log(Err);
      toast.error("Failed to disinvite user");
    } finally {
      setInviteLoading(false);
    }
  }

  return (
    <div
      ref={divRef}
      className="absolute top-16 left-1/2 z-99999 -translate-x-1/2 min-w-max sm:w-1/3 rounded-2xl shadow-md bg-(--color-base-100) text-(--color-base-content) p-5 border border-(--color-base-300) transition-all duration-300"
    >
      {/* Close Button */}
      <div className="w-full flex justify-end mb-3">
        <CircleX
          onClick={() => setUI(false)}
          size={20}
          className="cursor-pointer text-(--color-neutral-content-light) hover:text-(--color-error) transition-colors"
        />
      </div>

      {/* Input */}
      <input
        onChange={(e) => setSearchQuery(e.target.value)}
        type="text"
        placeholder="Enter email to invite"
        className="w-full px-4 py-2 rounded-lg border border-(--color-info-soft) bg-(--color-base-200) text-(--color-neutral-content) placeholder:text-(--color-neutral-content-light) outline-none focus:ring-2 focus:ring-(--color-primary) transition-all"
      />

      {/* User Info */}
      <div className="rounded-lg grid place-items-center w-full h-full mt-4 text-(--color-neutral-content)">
        {loading ? (
          <p>Searching...</p>
        ) : invitedUser ? (
          <div
            onMouseEnter={() => setOnHover(true)}
            onMouseLeave={() => setOnHover(false)}
            className={cn(
              "flex items-center gap-3 relative w-full p-3 rounded-xl bg-(--color-base-200) hover:bg-(--color-info-soft) transition-colors cursor-pointer"
            )}
          >
            <span className="text-xl rounded-full p-3 px-4 text-(--color-primary-content) font-bold bg-(--color-primary)">
              {invitedUser.fullName?.[0]?.toUpperCase()}
            </span>

            <div className="w-full">
              <p className="font-medium text-sm">
                {invitedUser.fullName}
                {loggedInUserId === ownerId && " (You)"}
              </p>
              <span className="text-xs font-normal text-(--color-neutral-content-light)">
                {invitedUser.email}
              </span>
            </div>

            <select
              disabled={invitedUser.invited || isOwner}
              className="border border-(--color-base-300) rounded-lg px-2 py-1 text-xs cursor-pointer bg-(--color-base-100) hover:border-(--color-primary) transition-all"
              defaultValue={invitedUser.permission as Permission}
              onChange={(e) => setPermission(e.target.value as Permission)}
            >
              <option value="READ_ACCESS">READ_ACCESS</option>
              <option value="FULL_ACCESS">FULL_ACCESS</option>
            </select>

            {invitedUser.invited && onHover && (
              <p className="absolute right-0 text-xs bg-(--color-base-100) z-30 border border-(--color-base-300) rounded-xl p-2 -bottom-6 text-(--color-neutral-content-light)">
                Disinvite first
              </p>
            )}
          </div>
        ) : err && searchQuery ? (
          <p className="text-(--color-error)">{err}</p>
        ) : (
          <p className="my-3 text-(--color-neutral-content-light)">
            User will appear here
          </p>
        )}

        {invitedUser && loggedInUserId !== ownerId && (
          <button
            disabled={inviteLoading}
            onClick={invitedUser.invited ? onDisInviteuser : onInviteUser}
            className={cn(
              "mt-4 w-[92%] py-2 font-semibold rounded-lg transition-all duration-200",
              invitedUser.invited
                ? "bg-(--color-error) hover:bg-(--color-error-hover) text-(--color-primary-content)"
                : "bg-(--color-primary) hover:opacity-90 text-(--color-primary-content)"
            )}
          >
            {inviteLoading
              ? invitedUser.invited
                ? "Removing..."
                : "Inviting..."
              : invitedUser.invited
              ? "Disinvite"
              : "Invite"}
          </button>
        )}
      </div>
    </div>
  );
};

export default InviteUser;
