import { SESSION_COOKIE, jsonError } from "../../_lib/auth.js";

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD) {
    return jsonError("服务端未配置 ADMIN_PASSWORD 环境变量", 500);
  }

  const body = await request.json().catch(() => null);
  const password = body && body.password;

  if (!password || password !== env.ADMIN_PASSWORD) {
    return jsonError("密码错误", 401);
  }

  const sessionId = crypto.randomUUID();
  const ttlSeconds = 60 * 60 * 24 * 7; // 7 天
  await env.SITE_KV.put(`session:${sessionId}`, "1", { expirationTtl: ttlSeconds });

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `${SESSION_COOKIE}=${sessionId}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${ttlSeconds}`,
    },
  });
}
