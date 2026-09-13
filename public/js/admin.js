const loginView = document.getElementById("login-view");
const adminView = document.getElementById("admin-view");

function showLogin() {
  loginView.hidden = false;
  adminView.hidden = true;
}

function showAdmin() {
  loginView.hidden = true;
  adminView.hidden = false;
  loadProfile();
  loadLinks();
}

async function checkLogin() {
  const res = await fetch("/api/admin/check");
  const data = await res.json();
  if (data.loggedIn) {
    showAdmin();
  } else {
    showLogin();
  }
}

// ---------- 登录 / 退出 ----------

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = document.getElementById("password").value;
  const errorEl = document.getElementById("login-error");
  errorEl.textContent = "";

  try {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      errorEl.textContent = data.error || "登录失败";
      return;
    }
    showAdmin();
  } catch (err) {
    errorEl.textContent = "网络错误，请重试";
  }
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  showLogin();
});

// ---------- Tabs ----------

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`panel-${btn.dataset.tab}`).classList.add("active");
  });
});

// ---------- 资料 ----------

async function loadProfile() {
  const res = await fetch("/api/admin/config");
  if (!res.ok) return;
  const config = await res.json();
  document.getElementById("f-greeting").value = config.greeting || "";
  document.getElementById("f-name").value = config.name || "";
  document.getElementById("f-avatar").value = config.avatar || "";
  document.getElementById("f-tagline").value = config.tagline || "";
  document.getElementById("f-bio").value = config.bio || "";
  document.getElementById("f-hero-bg").value = config.heroBackground || "";
}

document.getElementById("profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const hint = document.getElementById("profile-hint");
  const payload = {
    greeting: document.getElementById("f-greeting").value.trim(),
    name: document.getElementById("f-name").value.trim(),
    avatar: document.getElementById("f-avatar").value.trim(),
    tagline: document.getElementById("f-tagline").value.trim(),
    bio: document.getElementById("f-bio").value.trim(),
    heroBackground: document.getElementById("f-hero-bg").value.trim(),
  };

  const res = await fetch("/api/admin/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  hint.textContent = res.ok ? "已保存" : "保存失败";
  setTimeout(() => (hint.textContent = ""), 2000);
});

// ---------- 子域名 ----------

const linkForm = document.getElementById("link-form");
const linkSubmitBtn = document.getElementById("link-submit-btn");
const linkCancelBtn = document.getElementById("link-cancel-btn");
const linkList = document.getElementById("link-list");

function resetLinkForm() {
  document.getElementById("l-id").value = "";
  document.getElementById("l-name").value = "";
  document.getElementById("l-url").value = "";
  document.getElementById("l-desc").value = "";
  document.getElementById("l-image").value = "";
  document.getElementById("l-order").value = "0";
  linkSubmitBtn.textContent = "添加子域名";
  linkCancelBtn.hidden = true;
}

function fillLinkForm(item) {
  document.getElementById("l-id").value = item.id;
  document.getElementById("l-name").value = item.name;
  document.getElementById("l-url").value = item.url;
  document.getElementById("l-desc").value = item.description || "";
  document.getElementById("l-image").value = item.image || "";
  document.getElementById("l-order").value = item.sort_order ?? 0;
  linkSubmitBtn.textContent = "保存修改";
  linkCancelBtn.hidden = false;
  linkForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

linkCancelBtn.addEventListener("click", resetLinkForm);

async function loadLinks() {
  const res = await fetch("/api/admin/subdomains");
  const list = await res.json();
  linkList.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    linkList.innerHTML = `<p class="save-hint">还没有子域名，先在上面加一个吧</p>`;
    return;
  }

  list.forEach((item) => {
    const row = document.createElement("div");
    row.className = "list-card";
    row.innerHTML = `
      <div class="list-card-info">
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.url)}</p>
      </div>
      <div class="list-card-actions">
        <button class="btn btn-ghost" data-action="edit">编辑</button>
        <button class="btn btn-danger" data-action="delete">删除</button>
      </div>
    `;
    row.querySelector('[data-action="edit"]').addEventListener("click", () => fillLinkForm(item));
    row.querySelector('[data-action="delete"]').addEventListener("click", () => deleteLink(item.id));
    linkList.appendChild(row);
  });
}

async function deleteLink(id) {
  if (!confirm("确定要删除这个子域名吗？")) return;
  await fetch(`/api/admin/subdomains/${id}`, { method: "DELETE" });
  loadLinks();
}

linkForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const hint = document.getElementById("link-hint");
  const id = document.getElementById("l-id").value;
  const payload = {
    name: document.getElementById("l-name").value.trim(),
    url: document.getElementById("l-url").value.trim(),
    description: document.getElementById("l-desc").value.trim(),
    image: document.getElementById("l-image").value.trim(),
    sort_order: Number(document.getElementById("l-order").value) || 0,
  };

  const res = await fetch(id ? `/api/admin/subdomains/${id}` : "/api/admin/subdomains", {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();

  if (!res.ok) {
    hint.textContent = data.error || "保存失败";
    return;
  }

  hint.textContent = "已保存";
  setTimeout(() => (hint.textContent = ""), 2000);
  resetLinkForm();
  loadLinks();
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

checkLogin();
