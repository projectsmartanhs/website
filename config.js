/* SMART-ANHS backend settings.
   Fill these two values from Supabase: Project Settings > API.
   The anon key is designed to be public. NEVER put the service_role key or any Google secret in this file.
   Leave both blank to run in local prototype mode (data saved in this browser only, passcode admin). */
window.SMART_CONFIG = {
  SUPABASE_URL: "",       // e.g. "https://abcdefghijkl.supabase.co"
  SUPABASE_ANON_KEY: ""   // the long "anon public" key
};
window.SMART_BACKEND_ON = !!(window.SMART_CONFIG.SUPABASE_URL && window.SMART_CONFIG.SUPABASE_ANON_KEY);
