# 国雅问题星空 / GUOYA Question Galaxy

一个真实可运行的互动问题星空 MVP：投稿后生成星星，大屏实时出现，观众可点击查看并点「我也在意」，后台可管理和手动添加外部平台留言。

## 三端页面

- `/submit`：平板投稿端，标题「点亮一颗星」
- `/stars`：大屏星空端，标题「国雅问题星空」
- `/admin`：管理员后台，标题「星光管理台」

首页 `/` 会自动跳转到 `/stars`。

## 本地运行

1. 安装依赖：

```bash
npm install
```

2. 复制环境变量：

```bash
cp .env.example .env.local
```

3. 在 `.env.local` 填入：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=change-this-password
```

4. 在 Supabase SQL Editor 执行 [supabase/schema.sql](./supabase/schema.sql)。

5. 启动：

```bash
npm run dev
```

然后打开：

- http://localhost:3000/submit
- http://localhost:3000/stars
- http://localhost:3000/admin

## Supabase 设置

数据库表：`public.stars`

字段：

- `id uuid primary key default gen_random_uuid()`
- `content text not null`
- `source text default 'tablet'`
- `status text default 'published'`
- `likes integer default 0`
- `featured boolean default false`
- `created_at timestamptz default now()`

约束：

- `status` 只允许 `published`、`hidden`
- `source` 只允许 `tablet`、`xiaohongshu`、`douyin`、`wechat`、`manual`
- `likes >= 0`

RLS：

- 公开端只能读取 `published` 星星
- 公开端只能新增 `source = tablet`、`status = published`、`likes = 0`、`featured = false` 的投稿
- 后台管理通过服务端 `SUPABASE_SERVICE_ROLE_KEY` 执行，不暴露给浏览器

Realtime：

- SQL 会把 `public.stars` 加入 `supabase_realtime` publication
- `/stars` 监听 insert/update/delete，投稿、隐藏、恢复、精选、点赞会实时更新大屏

## 管理员方式

后台地址：`/admin`

输入 `.env.local` 中的 `ADMIN_PASSWORD`。密码只保存在当前浏览器 sessionStorage，用于请求服务端管理接口。第一版没有用户账号、角色系统或审计日志。

后台功能：

- 隐藏
- 恢复
- 精选
- 取消精选
- 删除
- 手动添加留言

## 外部平台留言添加方法

进入 `/admin` 后，在顶部输入留言内容，选择来源：

- 手动添加
- 小红书
- 抖音
- 朋友圈
- 平板投稿

点击「添加留言」后，这条留言会以星星形式实时出现在 `/stars`。

## 文案和颜色修改位置

- 投稿端文案：[app/submit/submit-client.tsx](./app/submit/submit-client.tsx)
- 大屏文案和星星表现：[app/stars/stars-client.tsx](./app/stars/stars-client.tsx)
- 后台文案：[app/admin/admin-client.tsx](./app/admin/admin-client.tsx)
- 全局颜色、背景、星星光效：[app/globals.css](./app/globals.css)
- Tailwind 颜色 token：[tailwind.config.ts](./tailwind.config.ts)

当前视觉方向：暖白、米纸、墨色、陶土、琥珀、苔绿；没有紫色渐变、科技蓝、玻璃拟态或营销式大量卡片。

## Vercel 部署

1. 将项目推送到 GitHub。
2. 在 Vercel 新建项目并导入仓库。
3. 在 Vercel Project Settings -> Environment Variables 添加：

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
```

4. 部署后访问：

- `https://your-vercel-domain/submit`
- `https://your-vercel-domain/stars`
- `https://your-vercel-domain/admin`

## GitHub Pages 入口

GitHub Pages 版本用于更容易在中国浏览器、微信群和公众号文章里打开的公开入口。它保留同一个 Supabase 数据库，不会丢失已有留言。

适合使用：

- `/submit`：投稿
- `/stars`：大屏展示

后台管理仍建议使用 Vercel：

- `https://temporary-turbo-piano-6h9pv8a.vercel.app/admin`

部署前在 GitHub 仓库设置里添加两个 Variables：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

路径：GitHub 仓库 -> Settings -> Secrets and variables -> Actions -> Variables -> New repository variable。

然后进入 GitHub 仓库 -> Settings -> Pages，把 Source 设置为 `GitHub Actions`。推送到 `main` 分支后，工作流会自动部署。

如果需要 GitHub Pages 上的「我也在意」点赞可用，请在 Supabase SQL Editor 重新执行 [supabase/schema.sql](./supabase/schema.sql)，里面包含 `increment_star_likes` 安全函数。

## 自测清单

- `/submit` 可以提交一句话
- `/stars` 几秒内出现新星
- 点击星星可查看留言
- 点击「我也在意」后亮度和计数更新
- `/admin` 输入管理员密码后可进入
- 后台可隐藏、恢复、精选、取消精选、删除
- 后台可添加小红书、抖音、朋友圈、手动来源留言
- 隐藏或删除后，大屏实时移除

## 第一版未实现项

按需求，第一版不包含学生账号、头像、积分、等级、金币、商城、聊天、评论回复和复杂权限系统。
