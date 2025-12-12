import React from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import formatTime from "@/lib/formatTime";
import { PageType } from "@/types/pageType";

type CardProps = {
  data: PageType;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

export default function Card({ data, onClick }: CardProps) {
  const initials = (data?.title || " ")
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={0}
      aria-label={`Open ${data?.title}`}
      className="transform-gpu transition duration-250 hover:-translate-y-2 active:scale-[.98] focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-2xl shadow-lg relative overflow-hidden w-full max-w-68 h-56 cursor-pointer"
      style={{
        background:
          "linear-gradient(180deg, var(--color-base-100) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      {/* Cover area */}
      <div className="h-[60%] w-full relative flex items-start justify-start">
        {data?.coverUrl ? (
          <Image
            src={data.coverUrl}
            alt={`${data.title} cover`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 256px"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, var(--color-info-soft), rgba(0,0,0,0.02))",
            }}
          ></div>
        )}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.18))",
          }}
        />
      </div>

      <div className="h-[40%] p-4 flex flex-col justify-between bg-transparent">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0" style={{ width: 44, height: 44 }}>
            {data?.logoUrl ? (
              <Image
                src={data.logoUrl}
                alt={`${data.title} avatar`}
                width={44}
                height={44}
                className="rounded-full border-2"
              />
            ) : (
              <div
                className="rounded-full flex items-center justify-center font-semibold text-sm"
                style={{
                  width: 44,
                  height: 44,
                  background:
                    "linear-gradient(135deg, var(--color-primary), var(--color-info-soft))",
                  color: "var(--color-primary-content)",
                }}
              >
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold truncate"
              style={{ color: "var(--color-base-content)" }}
            >
              {data?.title}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end mt-2">
          <div
            className="flex items-center  gap-2 text-xs"
            style={{ color: "var(--color-neutral-content)" }}
          >
            <span>{formatTime(data?.$createdAt)}</span>
            <Clock className="w-3 h-3" />
          </div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition duration-300 hover:opacity-100"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.02), 0 8px 30px rgba(0,0,0,0.08)",
        }}
      />
    </div>
  );
}
