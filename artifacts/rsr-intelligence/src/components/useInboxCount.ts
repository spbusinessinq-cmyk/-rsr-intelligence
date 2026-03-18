import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useInboxCount(userId: string | null): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    async function fetchCount() {
      const { count: c, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);
      if (!error) setCount(c ?? 0);
    }

    fetchCount();

    const channel = supabase
      .channel(`inbox-count-${userId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, fetchCount)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return count;
}
