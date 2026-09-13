import { getSession } from "../../_lib/auth.js";

export async function onRequestGet({ request, env }) {
  const sessionId = await getSession(request, env);
  return Response.json({ loggedIn: !!sessionId });
}
