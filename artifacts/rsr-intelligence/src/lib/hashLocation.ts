import { useState, useEffect, useCallback } from "react";

/**
 * Custom wouter-compatible hash location hook.
 *
 * URL format: https://example.com/?search#/path
 * - The path after '#/' is the wouter route (e.g. /investigation-room)
 * - Search params (?channel=xxx) go in the REAL url.search so useSearch() works
 *
 * navigate("/investigation-room?channel=foo") produces:
 *   → hash: #/investigation-room
 *   → search: ?channel=foo
 */

function getPath(): string {
  return "/" + window.location.hash.replace(/^#\/?/, "");
}

function navigate(to: string): void {
  // Split off any search params embedded in the target path
  const [rawPath, rawSearch] = to.replace(/^#\/?/, "").split("?");
  const url = new URL(window.location.href);
  url.hash = "/" + (rawPath || "");
  url.search = rawSearch ? "?" + rawSearch : "";
  window.history.pushState(null, "", url.href);
  window.dispatchEvent(new Event("hashchange"));
}

export function useHashLocation(): [string, (to: string) => void] {
  const [path, setPath] = useState<string>(getPath);

  useEffect(() => {
    const handler = () => setPath(getPath());
    window.addEventListener("hashchange", handler);
    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("hashchange", handler);
      window.removeEventListener("popstate", handler);
    };
  }, []);

  const stableNavigate = useCallback((to: string) => navigate(to), []);

  return [path, stableNavigate];
}
