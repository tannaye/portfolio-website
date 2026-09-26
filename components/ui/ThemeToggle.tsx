"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Moon, Sun } from "./Icons";

type Theme = "dark" | "light";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as Theme) ?? "dark");
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className={cn(
        "grid size-10 place-items-center rounded-full text-fg transition-colors duration-300 hover:bg-fg/10",
        className,
      )}
    >
      {theme === "dark" ? <Sun width={18} height={18} /> : <Moon width={18} height={18} />}
    </button>
  );
}
