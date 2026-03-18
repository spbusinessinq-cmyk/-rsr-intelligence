import { useState, useEffect, useCallback } from "react";

/**
 * Custom wouter-compatible hash location hook.
 *
 * Direct window.location.hash = "/path?search" assignments are supported.
 * - The path portion is used for wouter route matching (/investigation-room)
 * - The search portion (?channel=foo) is preserved in the hash string and
 *   readable via useHashSearch() in components that need deep-link params.
 *
 * Navigate: setLocation("/investigation-room?channel=foo")
 * Result:   window.location.hash = "#/investigation-room?channel=foo"
 *           getPath()             = "/investigation-room"   (for route matching)
 *           useHashSearch()       = "?channel=foo"          (for components)
 */

/** Extract just the pathname portion from the current hash (strips ?search). */
function getPath(): string {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const pathOnly = hash.split("?")[0];
  return "/" + (pathOnly || "");
}

/** Navigate: set hash to the target path (with optional embedded ?search). */
function navigate(to: string): void {
  // Strip leading slashes/hashes and re-add one clean slash
  const clean = to.replace(/^[#\/]+/, "");
  window.location.hash = "/" + clean;
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

/**
 * Reactive hook that returns the search-param string embedded in the hash.
 * e.g. hash "#/investigation-room?channel=signals" → "?channel=signals"
 * Use this instead of wouter's useSearch() when search params come from the hash.
 */
export function useHashSearch(): string {
  const getSearch = () => {
    const hash = window.location.hash.replace(/^#\/?/, "");
    const idx = hash.indexOf("?");
    return idx >= 0 ? hash.slice(idx) : "";
  };

  const [search, setSearch] = useState<string>(getSearch);

  useEffect(() => {
    const handler = () => setSearch(getSearch());
    window.addEventListener("hashchange", handler);
    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("hashchange", handler);
      window.removeEventListener("popstate", handler);
    };
  }, []);

  return search;
}
