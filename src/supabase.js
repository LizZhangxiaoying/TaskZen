import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://oqqnecaoekdattvpdojz.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcW5lY2FvZWtkYXR0dnBkb2p6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwNTc2ODM3MywiZXhwIjoyMDIxMzQ0MzczfQ.Xz7x-V3octHLCr-DS71oFBtc_mjzO2mFYIuKhYGZbxM";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
