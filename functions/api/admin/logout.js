import { getSession, SESSION_COOKIE } from "../../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  const sessionId = await getSession(request, env);
  if (sessionId) {
    await env.SITE_KV.delete(`session:${sessionId}`);
  }
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
    },
  });
}
