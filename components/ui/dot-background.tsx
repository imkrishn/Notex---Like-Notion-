import { cn } from "@/lib/utils";
import React from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function DotBackground({ children, className }: Props) {
  return (
    <div
      className={cn("relative min-h-screen w-full overflow-hidden", className)}
    >
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-20",

          "bg-size-[40px_40px]",

          "bg-[linear-gradient(to_right,var(--color-base-300)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-base-300)_1px,transparent_1px)]"
        )}
      />
      {children}
    </div>
  );
}
