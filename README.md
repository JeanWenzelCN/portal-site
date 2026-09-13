# 我的引导站（Portal Site）

放在根域名下的个人引导页：问候语 + 自我介绍 + 一组指向各个子域名的卡片。
颜色柔和、低饱和度、大圆角，单页实现，移动端 / 桌面端自适应。
数据存在 Cloudflare D1（子域名列表）和 KV（个人资料、会话），后台在 `/admin.html`，
密码通过 Cloudflare 环境变量注入，不写死在代码里。

## 目录结构

```
portal-site/
├── public/                 ← Pages 的构建输出目录（纯静态文件）
│   ├── index.html          ← 首页
│   ├── admin.html          ← 后台管理页
│   ├── css/
│   │   ├── style.css       ← 首页样式（设计变量都在这里）
│   │   └── admin.css       ← 后台样式
│   └── js/
│       ├── main.js         ← 首页逻辑（拉取配置 + 卡片列表）
│       └── admin.js        ← 后台逻辑（登录 + 增删改）
├── functions/               ← Cloudflare Pages Functions（后端 API）
│   ├── _lib/auth.js         ← 登录态校验（基于 KV 存 session）
│   └── api/
│       ├── config.js        ← GET  公开：读取个人资料
│       ├── subdomains.js    ← GET  公开：读取子域名列表
│       └── admin/
│           ├── login.js     ← POST 登录
│           ├── logout.js    ← POST 退出
│           ├── check.js     ← GET  是否已登录
│           ├── config.js    ← GET/PUT 修改个人资料
│           └── subdomains/
│               ├── index.js ← GET 全部 / POST 新增
│               └── [id].js  ← PUT 修改 / DELETE 删除
├── schema.sql               ← D1 建表语句
└── wrangler.toml             ← 本地 `wrangler pages dev` 用的绑定配置（可选）
```

## 一、创建 Cloudflare 资源

在 Cloudflare Dashboard 或用 wrangler CLI 创建：

1. **D1 数据库**
   ```
   npx wrangler d1 create portal_db
   npx wrangler d1 execute portal_db --file=./schema.sql --remote
   ```
2. **KV 命名空间**
   ```
   npx wrangler kv namespace create SITE_KV
   ```
   记下返回的 `id`，用于后面绑定（本地开发也可以填进 `wrangler.toml`）。

## 二、把代码推到 GitHub

把这个文件夹整体推到一个 GitHub 仓库（根目录就是这里的内容，不要再套一层）。

## 三、在 Cloudflare Pages 里新建项目

1. Pages → 创建项目 → 连接到 GitHub，选中这个仓库。
2. 构建设置：
   - 框架预设：`None`
   - 构建命令：留空
   - **构建输出目录：`public`**
3. 部署一次（这次会失败或部分功能不可用，因为还没绑定资源，属于正常现象）。
4. 进入项目 → Settings → Functions：
   - **D1 database bindings**：变量名 `DB`，选择上面创建的 `portal_db`。
   - **KV namespace bindings**：变量名 `SITE_KV`，选择上面创建的命名空间。
5. 进入项目 → Settings → Environment variables，添加：
   - `ADMIN_PASSWORD`：后台登录密码，建议加密（Encrypt）保存，**不要写进代码仓库**。
6. 触发一次重新部署（Retry deployment），让绑定生效。
7. 把你的根域名（自定义域）绑定到这个 Pages 项目。

## 四、使用

- 打开根域名，就是问候页 + 卡片列表（首次没有数据时会显示空状态提示）。
- 打开 `你的域名/admin.html`，输入 `ADMIN_PASSWORD` 登录后台：
  - 「资料」标签页：修改问候语、姓名、一句话介绍、简介、头像图片链接、首页背景图链接。
  - 「子域名」标签页：新增 / 编辑 / 删除卡片，每张卡片可以填名称、跳转链接、简介、背景图链接、排序号（数字越小越靠前）。
- 图片字段填写的是**图片 URL**（可以是任意图床、R2 公开链接、或子域名自己站点里的图），不涉及文件上传，避免额外依赖对象存储。

## 本地开发（可选）

```
npm install -g wrangler
wrangler d1 execute portal_db --file=./schema.sql --local
wrangler pages dev public --d1=DB=portal_db --kv=SITE_KV --binding ADMIN_PASSWORD=test123
```

`wrangler.toml` 里已经预留了绑定占位，把里面的 `database_id` / KV `id` 换成你自己的即可用 `wrangler pages dev public` 直接启动。
