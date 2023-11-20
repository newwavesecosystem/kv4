"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import SunIcon from "../icon/outline/Sun";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
      <SunIcon className="h-40 w-40"/>
      {/* <Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" /> */}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
