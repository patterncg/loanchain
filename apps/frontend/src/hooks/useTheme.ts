import { useState, useEffect } from "react";

type Theme = "light" | "dark";

const isClient = typeof window !== "undefined";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (!isClient) return "light"; // Default for server-side rendering

    try {
      // Check if theme is stored in localStorage
      const savedTheme = localStorage.getItem("theme") as Theme | null;
      // Check if system preference is dark and there's no saved theme
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;

      return (savedTheme || (prefersDark ? "dark" : "light")) as Theme;
    } catch {
      // Fallback in case of errors (e.g., localStorage blocked)
      return "light";
    }
  });

  useEffect(() => {
    if (!isClient) return;

    try {
      // Apply theme class to document
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Save theme preference to localStorage
      localStorage.setItem("theme", theme);
    } catch (error: unknown) {
      // Silent fail if localStorage is not available
      console.warn("Theme preference could not be saved:", error);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return { theme, toggleTheme, setTheme };
}
