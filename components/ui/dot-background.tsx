import { cn } from "@/lib/utils";
import React from "react";

export function DotBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative  h-screen w-full    bg-[#ffffffb2] dark:bg-black">
      <div
        className={cn(
          "absolute inset-0 -z-20",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
      {children}

    </div>
  );
}
