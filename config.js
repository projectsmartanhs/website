/* SMART-ANHS backend settings.
   Fill these two values from Supabase: Project Settings > API.
   The anon key is designed to be public. NEVER put the service_role key or any Google secret in this file.
   Leave both blank to run in local prototype mode (data saved in this browser only, passcode admin). */
window.SMART_CONFIG = {
  SUPABASE_URL: "https://wutnegstfbxadbsdpmmy.supabase.co"
  SUPABASE_ANON_KEY: "sb_publishable_sOb42vRLJkcqfDmUME952g_EAs8Uvsi"
};
window.SMART_BACKEND_ON = !!(window.SMART_CONFIG.SUPABASE_URL && window.SMART_CONFIG.SUPABASE_ANON_KEY);
