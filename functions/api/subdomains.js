export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, name, url, description, image, sort_order FROM subdomains ORDER BY sort_order ASC, id ASC"
  ).all();
  return Response.json(results || []);
}
