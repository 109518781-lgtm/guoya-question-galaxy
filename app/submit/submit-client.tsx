"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowRight, Sparkle } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const maxLength = 80;

export default function SubmitClient() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [content, setContent] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();

    if (!supabase) {
      setState("error");
      setMessage("Supabase 还没有配置，暂时不能提交。");
      return;
    }

    if (trimmed.length < 2) {
      setState("error");
      setMessage("请写下至少两个字。");
      return;
    }

    setState("submitting");
    setMessage("");

    const { error } = await supabase.from("stars").insert({
      content: trimmed,
      source: "tablet",
      status: "published",
    });

    if (error) {
      setState("error");
      setMessage("这颗星暂时没有送达，请稍后再试。");
      return;
    }

    setContent("");
    setState("done");
    setMessage("已经点亮。请看向大屏，它会在那里出现。");
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 sm:px-8">
      <div className="grain" />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col justify-between">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 bg-rice text-clay shadow-soft">
              <Sparkle size={18} strokeWidth={1.8} />
            </span>
            <span className="text-sm font-medium tracking-[0.18em] text-ink/58">GUOYA Question Galaxy</span>
          </div>
          <a className="text-sm text-ink/60 transition hover:text-clay" href={`${basePath}/stars`}>
            看星空
          </a>
        </header>

        <section className="py-12 sm:py-20">
          <p className="mb-5 text-sm font-medium tracking-[0.24em] text-moss">点亮一颗星</p>
          <h1 className="font-serif text-[clamp(2.6rem,8vw,5.7rem)] font-bold leading-[1.03] text-ink">
            如果真的可以改变一件事，你会选什么？
          </h1>
          <form className="mt-10" onSubmit={handleSubmit}>
            <label className="sr-only" htmlFor="content">
              写下你的问题
            </label>
            <textarea
              id="content"
              value={content}
              maxLength={maxLength}
              onChange={(event) => {
                setContent(event.target.value);
                if (state !== "submitting") {
                  setState("idle");
                  setMessage("");
                }
              }}
              className="min-h-44 w-full resize-none rounded-none border-0 border-b border-ink/25 bg-transparent px-0 py-5 text-2xl leading-relaxed text-ink outline-none placeholder:text-ink/28 focus:border-clay sm:text-3xl"
              placeholder="写下一句话，让它成为一颗星。"
            />
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-ink/48">{content.length}/{maxLength}</span>
              <button
                type="submit"
                disabled={state === "submitting"}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-ink px-8 text-base font-medium text-rice transition hover:bg-clay disabled:bg-ink/35"
              >
                {state === "submitting" ? "正在点亮" : "送到星空"}
                <ArrowRight size={18} />
              </button>
            </div>
            {message && (
              <p className={`mt-6 text-base ${state === "error" ? "text-clay" : "text-moss"}`} role="status">
                {message}
              </p>
            )}
            {!supabase && (
              <p className="mt-4 text-sm text-clay" role="status">
                当前缺少 Supabase 环境变量，配置后即可提交。
              </p>
            )}
          </form>
        </section>

        <footer className="pb-3 text-sm leading-6 text-ink/48">
          把一个人的问题，变成一颗值得被看见的星。
        </footer>
      </div>
    </main>
  );
}
