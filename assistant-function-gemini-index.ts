// Supabase Edge Function: "assistant"
// SMART Assistant chat. The browser never sees the AI key; this function holds it.
// Needs a signed-in user whose role in public.profiles is allowed to use the assistant.
//
// Secrets (Edge Functions > Secrets):
//   GEMINI_API_KEY   (required)  key from aistudio.google.com
//   GEMINI_MODEL     (optional)  default "gemini-2.5-flash"
//   ALLOWED_ORIGIN      (already set for the drive function)

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const ROLES = ["admin", "school_head", "teacher", "staff"];
const MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-2.5-flash";
const ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";
const HOURLY_LIMIT = 40;     // messages per user per hour
const MAX_TURNS = 12;        // earlier messages kept for context
const MAX_CHARS = 4000;      // per message

const cors = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const SYSTEM = `You are the SMART Assistant for Alcantara National High School (Romblon, Philippines), a DepEd public school.
You help authorized school staff draft and organize work: memos, meeting minutes, report narratives, lesson plan ideas, data summaries, and communication drafts.
Rules:
- Your output is advisory. Staff review and decide. Say so briefly when a draft will be used officially.
- Never ask for, repeat, or invent learner or personnel personal information (names, LRN, addresses, grades of named people). If the user pastes any, tell them to remove it and use codes such as "Learner A" instead.
- Do not invent school data, statistics, or DepEd policy numbers. If you are not sure, say what to verify.
- Follow Philippine school context and the Data Privacy Act (RA 10173).
- Reply in the language the user writes in (English or Filipino). Keep answers short and practical.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  try {
    const key = Deno.env.get("GEMINI_API_KEY");
    if (!key) return json({ error: "The assistant is not set up yet (missing GEMINI_API_KEY)." }, 503);

    const url = Deno.env.get("SUPABASE_URL")!;
    const asUser = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: u } = await asUser.auth.getUser();
    if (!u?.user) return json({ error: "Please sign in first." }, 401);

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: prof } = await admin.from("profiles").select("role,email").eq("id", u.user.id).single();
    if (!ROLES.includes(prof?.role ?? "viewer")) return json({ error: "Your role cannot use the assistant." }, 403);

    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await admin.from("audit_log").select("id", { count: "exact", head: true })
      .eq("user_id", u.user.id).eq("action", "assistant_chat").gte("at", since);
    if ((count ?? 0) >= HOURLY_LIMIT) return json({ error: "Hourly assistant limit reached. Try again later." }, 429);

    const body = await req.json().catch(() => ({}));
    const msgs = (Array.isArray(body.messages) ? body.messages : [])
      .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim())
      .slice(-MAX_TURNS)
      .map((m: any) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
    if (!msgs.length || msgs[msgs.length - 1].role !== "user") return json({ error: "Type a message first." }, 400);

    // Block 12-digit numbers (looks like a DepEd LRN) before anything leaves the school's system.
    if (msgs.some((m: any) => /\b\d{12}\b/.test(m.content)))
      return json({ error: "That looks like a learner reference number (LRN). Remove it and use a code like 'Learner A'." }, 400);

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: msgs.map((m: any) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: { maxOutputTokens: 2048 },
      }),
    });
    const j = await r.json();
    if (!r.ok) return json({ error: "AI service error: " + (j.error?.message || r.status) }, 502);
    if (j.promptFeedback?.blockReason) return json({ error: "The AI service could not answer that request. Try rewording it." }, 400);
    const reply = (j.candidates?.[0]?.content?.parts || []).map((p: any) => p.text || "").join("\n").trim();

    // Log that a chat happened (never the content).
    await admin.from("audit_log").insert({ user_id: u.user.id, email: prof?.email ?? "", action: "assistant_chat", detail: { chars: msgs[msgs.length - 1].content.length } });
    return json({ reply: reply || "I could not produce a reply. Please try again." });
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});
