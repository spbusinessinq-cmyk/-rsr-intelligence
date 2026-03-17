import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string; handle: string; role: string; created_at: string };
        Insert: { id: string; email: string; handle: string; role?: string };
        Update: { handle?: string; role?: string };
      };
      room_channels: {
        Row: { id: string; slug: string; name: string; description: string | null; is_private: boolean; created_at: string };
      };
      room_messages: {
        Row: { id: string; channel_id: string; user_id: string; handle: string; role: string | null; body: string; created_at: string };
        Insert: { channel_id: string; user_id: string; handle: string; role?: string | null; body: string };
      };
    };
  };
};
