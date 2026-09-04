"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Pin, Plus, RefreshCcw, Star as StarIcon, Trash2 } from "lucide-react";
import type { Star, StarSource } from "@/lib/types";
import { sourceLabels } from "@/lib/types";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "https://temporary-turbo-piano-6h9pv8a.vercel.app/admin";
const sourceOptions: StarSource[] = ["manual", "xiaohongshu", "douyin", "wechat", "tablet"];

export default function AdminClient() {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);
  const [content, setContent] = useState("");
  const [source, setSource] = useState<StarSource>("manual");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const adminFetch = useCallback(async (path: string, init: RequestInit = {}, overridePassword = password) => {
    return fetch(path, {
      ...init,
      headers: {
        "content-type": "application/json",
        "x-admin-password": overridePassword,
        ...(init.headers ?? {}),
      },
    });
  }, [password]);

  const loadStars = useCallback(async (overridePassword = password) => {
    setBusy(true);
    const response = await adminFetch("/api/admin/stars", {}, overridePassword);
    setBusy(false);

    if (!response.ok) {
      setUnlocked(false);
      setMessage("管理员密码或服务端配置不可用。");
      return;
    }

    const data = (await response.json()) as Star[];
    setStars(data);
    setMessage("");
  }, [adminFetch, password]);

  useEffect(() => {
    if (basePath) {
      return;
    }

    const saved = window.sessionStorage.getItem("guoya-admin-password");
    if (saved) {
      setPassword(saved);
      setUnlocked(true);
      loadStars(saved);
    }
  }, [loadStars]);

  if (basePath) {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-10">
        <div className="grain" />
        <section className="relative w-full max-w-lg border border-ink/12 bg-rice px-6 py-7 shadow-soft">
          <p className="text-sm tracking-[0.22em] text-moss">星光管理台</p>
          <h1 className="mt-3 font-serif text-4xl font-bold">请前往管理后台</h1>
          <p className="mt-5 leading-7 text-ink/62">
            GitHub Pages 入口用于投稿和大屏展示，管理功能继续使用安全的服务端后台。
          </p>
          <a
            className="mt-7 inline-flex h-12 items-center justify-center rounded-full bg-ink px-7 text-rice transition hover:bg-clay"
            href={adminUrl}
          >
            打开后台
          </a>
        </section>
      </main>
    );
  }

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.sessionStorage.setItem("guoya-admin-password", password);
    setUnlocked(true);
    await loadStars(password);
  }

  async function addStar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    setBusy(true);
    const response = await adminFetch("/api/admin/stars", {
      method: "POST",
      body: JSON.stringify({ content: trimmed, source }),
    });
    setBusy(false);

    if (response.ok) {
      setContent("");
      await loadStars();
    } else {
      setMessage("添加失败，请检查后台配置。");
    }
  }

  async function patchStar(id: string, body: Partial<Pick<Star, "status" | "featured">>) {
    setBusy(true);
    const response = await adminFetch(`/api/admin/stars/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    setBusy(false);

    if (response.ok) {
      const updated = (await response.json()) as Star;
      setStars((current) => current.map((star) => (star.id === id ? updated : star)));
    } else {
      setMessage("操作失败，请稍后再试。");
    }
  }

  async function deleteStar(id: string) {
    if (!window.confirm("确认删除这颗星？删除后不可恢复。")) {
      return;
    }

    setBusy(true);
    const response = await adminFetch(`/api/admin/stars/${id}`, { method: "DELETE" });
    setBusy(false);

    if (response.ok) {
      setStars((current) => current.filter((star) => star.id !== id));
    } else {
      setMessage("删除失败，请稍后再试。");
    }
  }

  if (!unlocked) {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-10">
        <div className="grain" />
        <form className="relative w-full max-w-md border border-ink/12 bg-rice px-6 py-7 shadow-soft" onSubmit={unlock}>
          <p className="text-sm tracking-[0.22em] text-moss">星光管理台</p>
          <h1 className="mt-3 font-serif text-4xl font-bold">进入后台</h1>
          <label className="mt-8 block text-sm text-ink/58" htmlFor="password">
            管理员密码
          </label>
          <input
            id="password"
            className="mt-3 h-12 w-full border border-ink/16 bg-transparent px-4 outline-none focus:border-clay"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          <button className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-ink text-rice transition hover:bg-clay">
            进入
          </button>
          {message && <p className="mt-4 text-sm text-clay">{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <div className="grain" />
      <div className="relative mx-auto w-full max-w-7xl">
        <header className="flex flex-col gap-5 border-b border-ink/12 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm tracking-[0.22em] text-moss">星光管理台</p>
            <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">管理每一颗星</h1>
          </div>
          <button
            className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/14 bg-rice px-4 text-sm text-ink/70 transition hover:text-clay"
            onClick={() => loadStars()}
          >
            <RefreshCcw size={16} />
            刷新
          </button>
        </header>

        <form className="grid gap-4 border-b border-ink/12 py-6 lg:grid-cols-[1fr_12rem_auto]" onSubmit={addStar}>
          <textarea
            className="min-h-24 resize-none border border-ink/14 bg-rice px-4 py-3 text-base outline-none focus:border-clay"
            maxLength={120}
            onChange={(event) => setContent(event.target.value)}
            placeholder="手动添加来自小红书、抖音、朋友圈或现场收集的留言"
            value={content}
          />
          <select
            className="h-12 border border-ink/14 bg-rice px-3 outline-none focus:border-clay"
            onChange={(event) => setSource(event.target.value as StarSource)}
            value={source}
          >
            {sourceOptions.map((option) => (
              <option key={option} value={option}>
                {sourceLabels[option]}
              </option>
            ))}
          </select>
          <button className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ink px-6 text-rice transition hover:bg-clay disabled:bg-ink/35" disabled={busy}>
            <Plus size={17} />
            添加留言
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-clay">{message}</p>}

        <div className="mt-6 overflow-x-auto border border-ink/12 bg-rice/72">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="border-b border-ink/12 text-ink/52">
              <tr>
                <th className="px-4 py-3 font-medium">留言</th>
                <th className="px-4 py-3 font-medium">来源</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">共鸣</th>
                <th className="px-4 py-3 font-medium">时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {stars.map((star) => (
                <tr className="border-b border-ink/8 align-top last:border-0" key={star.id}>
                  <td className="max-w-xl px-4 py-4 text-base leading-7">{star.content}</td>
                  <td className="px-4 py-4 text-ink/62">{sourceLabels[star.source]}</td>
                  <td className="px-4 py-4">
                    <span className={star.status === "published" ? "text-moss" : "text-clay"}>
                      {star.status === "published" ? "显示中" : "已隐藏"}
                    </span>
                    {star.featured && <span className="ml-2 text-ember">精选</span>}
                  </td>
                  <td className="px-4 py-4">{star.likes}</td>
                  <td className="px-4 py-4 text-ink/50">{new Date(star.created_at).toLocaleString("zh-CN")}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/12 hover:border-clay hover:text-clay"
                        onClick={() => patchStar(star.id, { status: star.status === "published" ? "hidden" : "published" })}
                        title={star.status === "published" ? "隐藏" : "恢复"}
                        type="button"
                      >
                        {star.status === "published" ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/12 hover:border-clay hover:text-clay"
                        onClick={() => patchStar(star.id, { featured: !star.featured })}
                        title={star.featured ? "取消精选" : "精选"}
                        type="button"
                      >
                        {star.featured ? <Pin size={16} /> : <StarIcon size={16} />}
                      </button>
                      <button
                        className="grid h-9 w-9 place-items-center rounded-full border border-ink/12 hover:border-clay hover:text-clay"
                        onClick={() => deleteStar(star.id)}
                        title="删除"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
