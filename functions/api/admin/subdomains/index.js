import { getSession, unauthorized, jsonError } from "../../../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  if (!(await getSession(request, env))) return unauthorized();
  const { results } = await env.DB.prepare(
    "SELECT * FROM subdomains ORDER BY sort_order ASC, id ASC"
  ).all();
  return Response.json(results || []);
}

export async function onRequestPost({ request, env }) {
  if (!(await getSession(request, env))) return unauthorized();
  const body = await request.json().catch(() => null);
  if (!body || !body.name || !body.url) {
    return jsonError("名称和链接为必填项");
  }
  const { name, url, description = "", image = "", sort_order = 0 } = body;
  const result = await env.DB.prepare(
    "INSERT INTO subdomains (name, url, description, image, sort_order) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(name, url, description, image, Number(sort_order) || 0)
    .run();
  return Response.json({ ok: true, id: result.meta.last_row_id });
}
