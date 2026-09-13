async function loadConfig() {
  try {
    const res = await fetch("/api/config");
    const config = await res.json();

    document.title = config.name ? `${config.name}` : "主页";
    document.getElementById("greeting").textContent = config.greeting || "";
    document.getElementById("tagline").textContent = config.tagline || "";
    document.getElementById("bio").textContent = config.bio || "";

    const avatarWrap = document.getElementById("avatar-wrap");
    const avatar = document.getElementById("avatar");
    if (config.avatar) {
      avatar.src = config.avatar;
      avatarWrap.classList.remove("hidden");
    } else {
      avatarWrap.classList.add("hidden");
    }

    const heroBg = document.getElementById("hero-bg");
    if (config.heroBackground) {
      heroBg.classList.add("has-image");
      heroBg.style.setProperty("--custom-bg", `url("${config.heroBackground}")`);
    }
  } catch (err) {
    console.error("读取个人资料失败", err);
  }
}

function cardTemplate(item) {
  const hasImage = Boolean(item.image);
  const el = document.createElement("a");
  el.className = `card ${hasImage ? "has-image" : "no-image"}`;
  el.href = item.url;
  el.rel = "noopener";

  if (hasImage) {
    const bg = document.createElement("div");
    bg.className = "card-bg";
    bg.style.backgroundImage = `url("${item.image}")`;
    el.appendChild(bg);
  }

  const body = document.createElement("div");
  body.className = "card-body";

  const name = document.createElement("p");
  name.className = "card-name";
  name.textContent = item.name;
  body.appendChild(name);

  if (item.description) {
    const desc = document.createElement("p");
    desc.className = "card-desc";
    desc.textContent = item.description;
    body.appendChild(desc);
  }

  el.appendChild(body);
  return el;
}

async function loadSubdomains() {
  const grid = document.getElementById("grid");
  try {
    const res = await fetch("/api/subdomains");
    const list = await res.json();

    if (!Array.isArray(list) || list.length === 0) {
      grid.innerHTML = `<div class="empty-state">还没有添加任何链接，去 /admin.html 加一些吧</div>`;
      return;
    }

    grid.innerHTML = "";
    list.forEach((item) => grid.appendChild(cardTemplate(item)));
  } catch (err) {
    console.error("读取子域名列表失败", err);
    grid.innerHTML = `<div class="empty-state">列表加载失败，稍后再试试</div>`;
  }
}

document.getElementById("year").textContent = new Date().getFullYear();
loadConfig();
loadSubdomains();
