"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Heart, X } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/browser";
import type { Star } from "@/lib/types";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

type PositionedStar = Star & {
  x: number;
  y: number;
  size: number;
};

function hashId(id: string) {
  return Array.from(id).reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function positionStar(star: Star): PositionedStar {
  const seed = hashId(star.id);
  const likesBoost = Math.min(star.likes, 20);

  return {
    ...star,
    x: 7 + ((seed * 37) % 86),
    y: ((seed * 61) % 100) < 50 ? 12 + ((seed * 61) % 22) : 67 + ((seed * 61) % 21),
    size: 24 + likesBoost * 0.95 + (star.featured ? 12 : 0),
  };
}

export default function StarsClient() {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [stars, setStars] = useState<PositionedStar[]>([]);
  const [active, setActive] = useState<PositionedStar | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const client = supabase;
    let mounted = true;

    async function loadStars() {
      const { data } = await client
        .from("stars")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(180);

      if (mounted) {
        setStars((data ?? []).map(positionStar));
        setLoading(false);
      }
    }

    loadStars();

    const channel = client
      .channel("stars-screen")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stars" },
        (payload) => {
          setStars((current) => {
            if (payload.eventType === "DELETE") {
              return current.filter((star) => star.id !== payload.old.id);
            }

            const next = payload.new as Star;
            if (next.status !== "published") {
              return current.filter((star) => star.id !== next.id);
            }

            const positioned = positionStar(next);
            const exists = current.some((star) => star.id === next.id);

            if (!exists) {
              return [positioned, ...current].slice(0, 180);
            }

            return current.map((star) => (star.id === next.id ? positioned : star));
          });

          if (payload.eventType !== "DELETE") {
            const next = payload.new as Star;
            setActive((current) => (current?.id === next.id ? positionStar(next) : current));
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      client.removeChannel(channel);
    };
  }, [supabase]);

  async function likeStar() {
    if (!active || liking) {
      return;
    }

    setLiking(true);
    const response = await fetch(`${apiBaseUrl || basePath}/api/stars/${active.id}/like`, { method: "POST" }).catch(() => null);

    if (response?.ok) {
      const updated = (await response.json()) as Star;
      const positioned = positionStar(updated);
      setActive(positioned);
      setStars((current) => current.map((star) => (star.id === updated.id ? positioned : star)));
      setLiking(false);
      return;
    }

    if (supabase) {
      const { data } = await supabase.rpc("increment_star_likes", { star_id: active.id });
      if (data) {
        const positioned = positionStar(data as Star);
        setActive(positioned);
        setStars((current) => current.map((star) => (star.id === active.id ? positioned : star)));
      }
    }

    setLiking(false);
  }

  return (
    <main className="star-field relative min-h-screen overflow-hidden text-ink">
      <div className="grain" />
      {Array.from({ length: 42 }).map((_, index) => (
        <span
          className={`ambient-star ${index % 3 === 0 ? "ambient-star-far" : ""}`}
          key={index}
          style={{
            left: `${(index * 17) % 100}%`,
            top: `${(index * 29) % 100}%`,
            fontSize: `${7 + (index % 5) * 2}px`,
            animationDelay: `${(index % 13) * 0.66}s`,
            animationDuration: `${7.8 + (index % 7) * 1.25}s`,
          }}
        >
          ✨
        </span>
      ))}
      <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
        {Array.from({ length: 10 }).map((_, index) => {
          const angle = (index / 10) * Math.PI * 2;
          const distance = 170 + (index % 5) * 72;
          return (
            <span
              className="burst-star"
              key={`burst-${index}`}
              style={{
                ["--tx" as string]: `${Math.cos(angle) * distance}px`,
                ["--ty" as string]: `${Math.sin(angle) * distance}px`,
                animationDelay: `${(index % 5) * 1.1}s`,
                animationDuration: `${10.5 + (index % 4) * 0.9}s`,
                fontSize: `${10 + (index % 4) * 3}px`,
              }}
            >
              ✨
            </span>
          );
        })}
        {Array.from({ length: 12 }).map((_, index) => (
          <span
            className="falling-star"
            key={`falling-${index}`}
            style={{
              left: `${6 + ((index * 31) % 88)}%`,
              animationDelay: `${(index % 8) * 1.6}s`,
              animationDuration: `${12 + (index % 6) * 1.1}s`,
              fontSize: `${8 + (index % 5) * 2}px`,
            }}
          >
            ✨
          </span>
        ))}
      </div>

      <header className="pointer-events-none absolute left-0 top-0 z-10 flex w-full items-start justify-between px-6 py-5 sm:px-10">
        <div className="flex max-w-[62vw] flex-col gap-2">
          <Image
            alt="赢未来国雅"
            className="h-auto w-32 brightness-0 invert opacity-85 sm:w-44 lg:w-52"
            height={493}
            src={`${basePath}/guoya-logo.png`}
            priority
            width={1541}
          />
          <p className="text-[0.68rem] font-medium tracking-[0.26em] text-rice/42 sm:text-xs">
            GUOYA Question Galaxy
          </p>
        </div>
        <a
          className="pointer-events-auto rounded-full border border-rice/16 bg-rice/8 px-4 py-2 text-sm text-rice/72 shadow-soft transition hover:border-rice/36 hover:text-rice"
          href={`${basePath}/submit`}
        >
          留下一颗
        </a>
      </header>

      <section className="relative h-screen w-screen" aria-label="实时问题星空">
        <div className="galaxy-center-copy pointer-events-none absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="mb-5 text-xs font-medium tracking-[0.34em] text-rice/48 sm:mb-7">
            A QUESTION TO THE SKY
          </p>
          <h2 className="galaxy-question font-serif font-bold text-rice">
            <span>
              如果真的可以改变一件事，
              <span>你会选什么？</span>
            </span>
          </h2>
          <p className="mt-7 text-sm font-medium tracking-[0.18em] text-rice/50 sm:mt-8 sm:text-base">
            期待更多星光被点亮
          </p>
        </div>
        {loading && (
          <p className="absolute left-1/2 top-[62%] z-[3] -translate-x-1/2 text-sm tracking-[0.24em] text-rice/40">
            正在等待星光
          </p>
        )}
        {stars.map((star) => (
          <button
            aria-label={`查看问题：${star.content}`}
            className={`question-star ${star.featured ? "featured" : ""}`}
            key={star.id}
            onClick={() => setActive(star)}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              fontSize: `${star.size}px`,
              animationDelay: `${(hashId(star.id) % 12) * 0.2}s`,
              ["--glow" as string]: `${22 + Math.min(star.likes, 28) * 2}px`,
              ["--glow-wide" as string]: `${42 + Math.min(star.likes, 28) * 3}px`,
              ["--glow-alpha" as string]: `${0.3 + Math.min(star.likes, 20) * 0.025}`,
            }}
          >
            ✨
          </button>
        ))}
      </section>

      <div className="pointer-events-none absolute bottom-6 left-6 z-10 text-sm text-rice/48 sm:left-10">
        {stars.length} 颗星正在被看见
      </div>

      {active && (
        <aside className="absolute bottom-0 right-0 z-20 w-full border-t border-rice/12 bg-soot/92 px-6 py-6 text-rice shadow-soft sm:bottom-8 sm:right-8 sm:w-[31rem] sm:border">
          <button
            className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-rice/58 transition hover:bg-rice/8 hover:text-rice"
            onClick={() => setActive(null)}
            aria-label="关闭"
          >
            <X size={18} />
          </button>
          <p className="pr-12 text-sm tracking-[0.2em] text-ember">{active.featured ? "精选星光" : "一颗问题星"}</p>
          <p className="mt-5 font-serif text-2xl font-bold leading-relaxed text-rice">{active.content}</p>
          <div className="mt-6 flex items-center justify-between gap-4">
            <span className="text-sm text-rice/48">{active.likes} 人也在意</span>
            <button
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-rice px-5 text-sm font-medium text-soot transition hover:bg-ember disabled:bg-rice/35"
              disabled={liking}
              onClick={likeStar}
            >
              <Heart size={17} />
              我也在意
            </button>
          </div>
        </aside>
      )}
    </main>
  );
}
