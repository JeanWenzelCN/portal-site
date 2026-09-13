const DEFAULT_CONFIG = {
  greeting: "你好，很高兴你路过这里",
  name: "你的名字",
  tagline: "在这里写一句最能代表你的话",
  bio: "这里是简介，可以多写几句话：你在做什么、最近在关心什么、想让访客了解你的哪一面。",
  avatar: "",
  heroBackground: "",
};

export async function onRequestGet({ env }) {
  const raw = await env.SITE_KV.get("site_config");
  const config = raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  return Response.json(config);
}
