import { getSession, unauthorized, jsonError } from "../../../_lib/auth.js";

export async function onRequestPut({ request, env, params }) {
  if (!(await getSession(request, env))) return unauthorized();
  const body = await request.json().catch(() => null);
  if (!body || !body.name || !body.url) {
    return jsonError("名称和链接为必填项");
  }
  const { name, url, description = "", image = "", sort_order = 0 } = body;
  await env.DB.prepare(
    "UPDATE subdomains SET name=?, url=?, description=?, image=?, sort_order=? WHERE id=?"
  )
    .bind(name, url, description, image, Number(sort_order) || 0, params.id)
    .run();
  return Response.json({ ok: true });
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await getSession(request, env))) return unauthorized();
  await env.DB.prepare("DELETE FROM subdomains WHERE id=?").bind(params.id).run();
  return Response.json({ ok: true });
}
