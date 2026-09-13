export const SESSION_COOKIE = "admin_session";

// 从 Cookie 里取出 session id，去 KV 里核对是否有效
export async function getSession(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;
  const sessionId = match[1];
  const valid = await env.SITE_KV.get(`session:${sessionId}`);
  return valid ? sessionId : null;
}

export function unauthorized() {
  return new Response(JSON.stringify({ error: "未登录或登录已过期" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export function jsonError(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
