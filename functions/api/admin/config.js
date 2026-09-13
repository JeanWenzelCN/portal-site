import { getSession, unauthorized, jsonError } from "../../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  if (!(await getSession(request, env))) return unauthorized();
  const raw = await env.SITE_KV.get("site_config");
  return Response.json(raw ? JSON.parse(raw) : {});
}

export async function onRequestPut({ request, env }) {
  if (!(await getSession(request, env))) return unauthorized();
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return jsonError("请求格式错误");
  await env.SITE_KV.put("site_config", JSON.stringify(body));
  return Response.json({ ok: true });
}
