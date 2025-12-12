"use client";

import React from "react";

const PageSkeleton = () => {
  return (
    <div className="w-full h-full flex flex-col">
      {/* COVER SKELETON */}
      <div className="h-14"></div>
      <div
        className="relative w-full"
        style={{
          height: "260px",
          background: "var(--color-base-100)",
        }}
      >
        {/* Emoji placeholder */}
        <div className="absolute bg-(--color-base-200) w-20 h-20 -top-6 left-6 rounded-full skel-animate"></div>

        {/* Shimmer overlay */}
        <div className="skel-shimmer-overlay" />
      </div>

      {/* EDITOR AREA */}
      <div className="w-full px-10 mt-10">
        {/* Title skeleton */}
        <div
          className="rounded-lg skel-animate"
          style={{
            width: "200px",
            height: "32px",
            background: "var(--color-base-200)",
          }}
        ></div>

        {/* Editor placeholder */}
        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg skel-animate"
              style={{
                width: `${80 - i * 10}%`,
                height: "14px",
                background: "var(--color-base-200)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
