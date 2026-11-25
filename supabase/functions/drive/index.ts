// Supabase Edge Function: "drive"
// The ONLY place that talks to Google Drive. The browser never sees Google credentials.
//   POST   (multipart: file, module, category, note)  -> upload to Drive + record in public.files
//   GET    ?id=<files.id>                              -> download from Drive
//   DELETE ?id=<files.id>                              -> move to Drive trash + remove record
// Every call needs a signed-in Supabase user; the user's role in public.profiles decides what is allowed.
//
// Secrets (set with `supabase secrets set ...`, see SETUP.md):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
//   DRIVE_FOLDER_NAME (optional, default "SMART-ANHS Files")
//   ALLOWED_ORIGIN    (optional, your website address, e.g. https://yourname.github.io)
// SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const UPLOAD_ROLES = ["admin", "school_head", "teacher", "staff"];
const DELETE_ROLES = ["admin", "school_head"];
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB per file
const FOLDER_NAME = Deno.env.get("DRIVE_FOLDER_NAME") || "SMART-ANHS Files";
const ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "https://projectsmartanhs.github.io";

const cors = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Expose-Headers": "content-disposition",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

/* ---- Google auth: exchange the stored refresh token for a short-lived access token ---- */
let tokenCache: { value: string; exp: number } | null = null;
async function googleToken(): Promise<string> {
  if (tokenCache && tokenCache.exp > Date.now() + 60_000) return tokenCache.value;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
      refresh_token: Deno.env.get("GOOGLE_REFRESH_TOKEN") ?? "",
      grant_type: "refresh_token",
    }),
  });
  const j = await r.json();
  if (!r.ok || !j.access_token) throw new Error("Google sign-in failed: " + (j.error_description || j.error || r.status));
  tokenCache = { value: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 };
  return tokenCache.value;
}

/* ---- Find or create the Drive folder (with the drive.file scope the app only sees folders it made) ---- */
let folderId: string | null = null;
async function ensureFolder(token: string): Promise<string> {
  if (folderId) return folderId;
  const q = encodeURIComponent(`name='${FOLDER_NAME.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const found = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id)&pageSize=1`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then((r) => r.json());
  if (found.files?.length) return (folderId = found.files[0].id);
  const made = await fetch("https://www.googleapis.com/drive/v3/files?fields=id", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: FOLDER_NAME, mimeType: "application/vnd.google-apps.folder" }),
  }).then((r) => r.json());
  if (!made.id) throw new Error("Could not create the Drive folder.");
  return (folderId = made.id);
}

/* ---- Handler ---- */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    // Who is calling? (The anon key alone is NOT enough, a real signed-in user is required.)
    const asUser = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: u } = await asUser.auth.getUser();
    if (!u?.user) return json({ error: "Please sign in first." }, 401);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: prof } = await admin.from("profiles").select("role,email").eq("id", u.user.id).single();
    const role = prof?.role ?? "viewer";
    const email = prof?.email ?? u.user.email ?? "";
    const audit = (action: string, detail: unknown) =>
      admin.from("audit_log").insert({ user_id: u.user!.id, email, action, detail });

    const params = new URL(req.url).searchParams;

    /* -------- upload -------- */
    if (req.method === "POST") {
      if (!UPLOAD_ROLES.includes(role)) return json({ error: "Your role cannot upload files." }, 403);
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return json({ error: "No file received." }, 400);
      if (file.size > MAX_BYTES) return json({ error: `File is too large. Limit is ${MAX_BYTES / 1048576} MB.` }, 413);

      const token = await googleToken();
      const parent = await ensureFolder(token);
      const meta = { name: file.name, parents: [parent] };
      const boundary = "smartanhs" + crypto.randomUUID();
      const enc = new TextEncoder();
      const head = enc.encode(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n` +
          `--${boundary}\r\nContent-Type: ${file.type || "application/octet-stream"}\r\n\r\n`,
      );
      const tail = enc.encode(`\r\n--${boundary}--`);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const body = new Uint8Array(head.length + bytes.length + tail.length);
      body.set(head, 0); body.set(bytes, head.length); body.set(tail, head.length + bytes.length);

      const up = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": `multipart/related; boundary=${boundary}` },
        body,
      });
      const uj = await up.json();
      if (!up.ok) return json({ error: "Google Drive rejected the upload: " + (uj.error?.message || up.status) }, 502);

      const row = {
        drive_file_id: uj.id,
        name: uj.name,
        mime_type: uj.mimeType,
        size_bytes: Number(uj.size ?? file.size),
        module: String(form.get("module") || "General").slice(0, 60),
        category: String(form.get("category") || "").slice(0, 80) || null,
        note: String(form.get("note") || "").slice(0, 300) || null,
        uploaded_by: u.user.id,
        uploader: email,
      };
      const { data: saved, error } = await admin.from("files").insert(row).select().single();
      if (error) return json({ error: "Saved to Drive but not recorded: " + error.message }, 500);
      await audit("file_upload", { name: row.name, module: row.module });
      return json({ file: saved });
    }

    /* -------- download / delete need a record id -------- */
    const id = params.get("id");
    if (!id) return json({ error: "Missing id." }, 400);
    const { data: rec } = await admin.from("files").select("*").eq("id", id).single();
    if (!rec) return json({ error: "File not found." }, 404);

    if (req.method === "GET") {
      const token = await googleToken();
      const g = await fetch(`https://www.googleapis.com/drive/v3/files/${rec.drive_file_id}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!g.ok || !g.body) return json({ error: "Google Drive could not return that file." }, 502);
      await audit("file_download", { name: rec.name });
      return new Response(g.body, {
        headers: {
          ...cors,
          "Content-Type": rec.mime_type || "application/octet-stream",
          "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(rec.name)}`,
        },
      });
    }

    if (req.method === "DELETE") {
      if (!DELETE_ROLES.includes(role)) return json({ error: "Your role cannot delete files." }, 403);
      const token = await googleToken();
      // Moves to the Drive trash (recoverable for 30 days) instead of deleting forever.
      await fetch(`https://www.googleapis.com/drive/v3/files/${rec.drive_file_id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ trashed: true }),
      });
      await admin.from("files").delete().eq("id", id);
      await audit("file_delete", { name: rec.name });
      return json({ ok: true });
    }

    return json({ error: "Method not allowed." }, 405);
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
