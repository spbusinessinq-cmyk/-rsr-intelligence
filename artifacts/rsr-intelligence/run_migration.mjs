import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Check table existence
const { data: channels, error: chanErr } = await supabase.from("room_channels").select("id").limit(1);
console.log("room_channels:", chanErr ? `MISSING — ${chanErr.message}` : `EXISTS`);

const { data: profiles, error: profErr } = await supabase.from("profiles").select("id").limit(1);
console.log("profiles:", profErr ? `MISSING — ${profErr.message}` : `EXISTS`);

const { data: msgs, error: msgErr } = await supabase.from("room_messages").select("id").limit(1);
console.log("room_messages:", msgErr ? `MISSING — ${msgErr.message}` : `EXISTS`);
