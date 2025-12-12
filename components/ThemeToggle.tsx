"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle({
  textVisibility = false,
}: {
  textVisibility?: boolean;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="flex items-center gap-3 "
    >
      {theme === "light" ? <Moon size={21} /> : <Sun size={21} />}
      {textVisibility && (theme === "light" ? "Dark mode" : "Light mode")}
    </button>
  );
}
