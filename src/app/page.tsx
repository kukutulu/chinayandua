"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SplitText, ShinyText, SpotlightCard, StarBorder } from "@/components/bits";
import {
  DISHES,
  Dish,
  RATE_UP_ID,
  RARITY_META,
  RARITY_ORDER,
  Rarity,
  formatPrice,
  maxRarity,
  playRaritySound,
  rollMany,
} from "@/lib/gacha";

const SUMMON_MS = 1800;
const START_TICKETS = 30;

type Phase = "idle" | "summoning" | "reveal";

function useCountdown() {
  const [left, setLeft] = useState("--:--:--");
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const s = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
      const h = String(Math.floor(s / 3600)).padStart(2, "0");
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
      const sec = String(s % 60).padStart(2, "0");
      setLeft(`${h}:${m}:${sec}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  return left;
}

function RarityStamp({ rarity }: { rarity: Rarity }) {
  const meta = RARITY_META[rarity];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black tracking-widest uppercase"
      style={{ color: meta.color, background: meta.soft, border: `1px solid ${meta.color}55` }}
    >
      {"★".repeat(meta.stars)}{" "}
      <span className={rarity === "UR" ? "rainbow-text" : undefined}>{rarity}</span>
    </span>
  );
}

export default function Home() {
  const [tickets, setTickets] = useState(START_TICKETS);
  const [phase, setPhase] = useState<Phase>("idle");
  const [results, setResults] = useState<Dish[]>([]);
  const [pending, setPending] = useState<Dish[]>([]);
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [pity, setPity] = useState(0);
  const [muted, setMuted] = useState(false);
  const [filter, setFilter] = useState<Rarity | "ALL">("ALL");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdown = useCountdown();

  // Nạp lịch sử đã quay để tính bộ sưu tập
  useEffect(() => {
    try {
      const h = JSON.parse(localStorage.getItem("lunch-gacha-history") ?? "[]");
      const p = Number(localStorage.getItem("lunch-gacha-pity") ?? 0);
      if (Array.isArray(h)) setHistoryIds(h.filter((x) => typeof x === "string"));
      if (Number.isFinite(p)) setPity(Math.max(0, Math.min(9, p)));
    } catch {
      /* storage trống thì thôi */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lunch-gacha-history", JSON.stringify(historyIds.slice(0, 200)));
      localStorage.setItem("lunch-gacha-pity", String(pity));
    } catch {
      /* private mode: bỏ qua */
    }
  }, [historyIds, pity]);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const discovered = useMemo(() => new Set(historyIds), [historyIds]);
  const rateUp = DISHES.find((d) => d.id === RATE_UP_ID) ?? DISHES[0];
  const pendingTop = pending.length ? maxRarity(pending) : "N";
  const pendingColor = RARITY_META[pendingTop].color;
  const filtered = filter === "ALL" ? DISHES : DISHES.filter((d) => d.rarity === filter);

  const doPull = (count: 1 | 10) => {
    if (phase === "summoning") return;
    if (tickets < count) {
      alert("Hết vé rồi! Bấm +Nạp vé để quay tiếp.");
      return;
    }
    const { results: rolled, pityEnd } = rollMany(count, pity);
    setPending(rolled);
    setPity(pityEnd);
    setTickets((t) => t - count);
    setPhase("summoning");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => finishPull(rolled), SUMMON_MS);
  };

  const finishPull = (rolled: Dish[]) => {
    if (timer.current) clearTimeout(timer.current);
    setResults(rolled);
    setPending([]);
    setHistoryIds((h) => [...rolled.map((d) => d.id), ...h]);
    setPhase("reveal");
    if (!muted) playRaritySound(maxRarity(rolled));
  };

  const skipSummon = () => {
    if (pending.length) finishPull(pending);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-16 pt-5 sm:px-6">
      {/* ---------- Header ---------- */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-300 to-fuchsia-600 text-2xl shadow-lg shadow-fuchsia-950/50">
            🍱
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-200/70">
              Hanoi Lunch Gacha
            </p>
            <h1 className="text-lg font-black leading-tight sm:text-xl">
              <SplitText text="TRƯA NAY ĂN GÌ?" step={32} />
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-bold">
            🎟️ Vé: <b className="text-amber-300">{tickets}</b>
          </span>
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-bold">
            🛟 Pity: <b className="text-fuchsia-300">{pity}/10</b>
          </span>
          <button
            onClick={() => setTickets((t) => t + 30)}
            className="rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 font-bold text-amber-200 transition hover:bg-amber-300/20"
          >
            + Nạp vé
          </button>
          <button
            onClick={() => setMuted((m) => !m)}
            className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 font-bold transition hover:bg-white/10"
            aria-label="Bật/tắt âm thanh"
          >
            {muted ? "🔇" : "🔔"}
          </button>
        </div>
      </header>

      {/* ---------- Banner ---------- */}
      <SpotlightCard className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-950 via-[#160a2e] to-sky-950 p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72">
          <div className="rays absolute inset-0 rounded-full opacity-60" />
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            className="mote"
            style={{
              left: `${6 + i * 9}%`,
              width: 5 + (i % 3) * 3,
              height: 5 + (i % 3) * 3,
              background: i % 2 ? "#fbbf24" : "#c084fc",
              animationDuration: `${3.5 + (i % 4)}s`,
              animationDelay: `${(i * 0.5) % 3}s`,
            }}
          />
        ))}

        <div className="relative grid items-center gap-6 md:grid-cols-[1.2fr_.8fr]">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-amber-200">
              ✨ Banner limited — kết thúc trong {countdown}
            </p>
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">
              <SplitText text="CƠM TRƯA" base={150} step={40} />
              <br />
              <ShinyText className="text-4xl sm:text-6xl">SSR RATE-UP</ShinyText>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
              20 món trưa Hà Nội đang chờ. Quay ra món nào — trưa nay ăn món đó, cấm đổi ý.
              Bảo hiểm pity: 10 pull không SR trở lên thì pull 10 chắc chắn có hàng hiếm.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
              {RARITY_ORDER.map((r) => (
                <span
                  key={r}
                  className="rounded-full px-2.5 py-1"
                  style={{
                    color: RARITY_META[r].color,
                    background: RARITY_META[r].soft,
                    border: `1px solid ${RARITY_META[r].color}44`,
                  }}
                >
                  {r} {RARITY_META[r].weight}%
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <StarBorder onClick={() => doPull(1)} glow="rgba(56,189,248,.6)">
                🎲 QUAY x1 <span className="opacity-70">· 1 vé</span>
              </StarBorder>
              <StarBorder onClick={() => doPull(10)} glow="rgba(251,191,36,.65)">
                🔥 QUAY x10 <span className="opacity-70">· 10 vé</span>
              </StarBorder>
            </div>
          </div>

          {/* Món rate-up */}
          <div className="shine card-in relative rounded-2xl border border-amber-300/40 p-5 text-center shadow-[0_0_50px_rgba(251,191,36,.25)]" style={{ background: RARITY_META.SSR.gradient, animationDelay: "400ms" }}>
            <RarityStamp rarity="SSR" />
            <div className="float-slow my-2 text-8xl drop-shadow-[0_10px_20px_rgba(0,0,0,.5)]">
              {rateUp.emoji}
            </div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-200/80">
              Rate-up 50% khung SSR
            </p>
            <p className="mt-1 text-xl font-black">{rateUp.name}</p>
            <p className="mt-1 text-xs text-white/70">
              {formatPrice(rateUp.price)} · {rateUp.spot}
            </p>
          </div>
        </div>
      </SpotlightCard>

      {/* ---------- Bộ sưu tập ---------- */}
      <section>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-black">
              Thực đơn Hà Nội{" "}
              <span className="text-sm font-bold text-white/50">
                {discovered.size}/{DISHES.length} đã mở
              </span>
            </h3>
            <div className="mt-2 h-2 w-56 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 via-fuchsia-400 to-amber-300 transition-all"
                style={{ width: `${(discovered.size / DISHES.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs font-bold">
            {(["ALL", ...RARITY_ORDER] as const).map((r) => (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={`rounded-full border px-3 py-1.5 transition ${
                  filter === r
                    ? "border-amber-300/60 bg-amber-300/15 text-amber-200"
                    : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                {r === "ALL" ? "Tất cả" : r}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((d) => {
            const meta = RARITY_META[d.rarity];
            const locked = !discovered.has(d.id);
            return (
              <SpotlightCard
                key={d.id}
                className="rounded-2xl border border-white/10 p-4"
                style={{ background: `${meta.gradient}` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <RarityStamp rarity={d.rarity} />
                  {discovered.has(d.id) && <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Đã mở</span>}
                </div>
                <div className={`my-2 text-center text-5xl ${locked ? "opacity-30 grayscale" : ""}`}>
                  {locked ? "❔" : d.emoji}
                </div>
                <p className="font-extrabold leading-snug">{locked ? "Món bí ẩn" : d.name}</p>
                {!locked && (
                  <>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/65">{d.desc}</p>
                    <p className="mt-2 text-xs font-bold text-white/85">
                      {formatPrice(d.price)} · <span className="font-normal text-white/60">{d.spot}</span>
                    </p>
                    <p className="mt-1 inline-block rounded-full bg-black/30 px-2 py-0.5 text-[11px] font-bold text-white/70">
                      #{d.tag}
                    </p>
                  </>
                )}
              </SpotlightCard>
            );
          })}
        </div>
      </section>

      {/* ---------- Lịch sử ---------- */}
      {historyIds.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
          <h3 className="mb-2 text-sm font-black uppercase tracking-widest text-white/60">
            Lịch sử quay gần đây
          </h3>
          <div className="flex flex-wrap gap-2">
            {historyIds.slice(0, 20).map((id, i) => {
              const d = DISHES.find((x) => x.id === id);
              if (!d) return null;
              return (
                <span
                  key={`${id}-${i}`}
                  title={d.name}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold"
                  style={{
                    borderColor: `${RARITY_META[d.rarity].color}55`,
                    background: RARITY_META[d.rarity].soft,
                  }}
                >
                  {d.emoji} {d.name}
                </span>
              );
            })}
          </div>
        </section>
      )}

      <footer className="pt-2 text-center text-xs text-white/40">
        Tỉ lệ: N 45% · R 30% · SR 15% · SSR 8% (½ ra món rate-up) · UR 2% · Pity SR+ mỗi 10 pull
      </footer>

      {/* ---------- Overlay triệu hồi ---------- */}
      {phase === "summoning" && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-black/85 backdrop-blur-sm">
          <div className="flash pointer-events-none absolute inset-0 bg-white" />
          <div
            className="rays absolute h-[130vmax] w-[130vmax] rounded-full opacity-70"
            style={{ filter: `drop-shadow(0 0 60px ${pendingColor})` }}
          />
          <div className="relative flex flex-col items-center gap-4 px-6 text-center">
            <div
              className="orb grid h-28 w-28 place-items-center rounded-full border-4 text-6xl"
              style={{ borderColor: pendingColor, boxShadow: `0 0 80px ${pendingColor}`, background: "#0d0d1a" }}
            >
              🍱
            </div>
            <p className="text-xl font-black tracking-wide">
              <SplitText text="ĐANG TRIỆU HỒI MÓN TRƯA..." step={24} />
            </p>
            <p className="text-sm text-white/60">Đầu bếp đang tung chảo, đừng thoát...</p>
            <button
              onClick={skipSummon}
              className="mt-2 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-sm font-bold transition hover:bg-white/20"
            >
              Bỏ qua ⏩
            </button>
          </div>
        </div>
      )}

      {/* ---------- Modal kết quả ---------- */}
      {phase === "reveal" && results.length > 0 && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl py-8">
            <h3 className="text-center text-2xl font-black sm:text-3xl">
              {results.length === 1 ? (
                <span>
                  Trưa nay bạn ăn... <ShinyText>{results[0].name}!</ShinyText>
                </span>
              ) : (
                <span>
                  Combo trưa nay —{" "}
                  <ShinyText>
                    {results.some((d) => d.rarity === "UR" || d.rarity === "SSR")
                      ? "NỔ VÀNG RỰC RỠ!"
                      : "MỜI CẢ TEAM!"}
                  </ShinyText>
                </span>
              )}
            </h3>

            <div className={`mt-6 grid gap-3 ${results.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"}`}>
              {results.map((d, i) => {
                const meta = RARITY_META[d.rarity];
                const firstPullCount = historyIds.filter((id) => id === d.id).length;
                const firstTime = firstPullCount <= 1;
                return (
                  <div
                    key={`${d.id}-${i}`}
                    className={`shine card-in rounded-2xl border-2 p-4 text-center ${results.length === 1 ? "sm:p-8" : ""}`}
                    style={{
                      borderColor: `${meta.color}88`,
                      background: meta.gradient,
                      boxShadow: meta.glow,
                      animationDelay: `${i * 120}ms`,
                    }}
                  >
                    <RarityStamp rarity={d.rarity} />
                    <div className={`${results.length === 1 ? "text-9xl" : "text-6xl"} my-3`}>{d.emoji}</div>
                    <p className={`${results.length === 1 ? "text-2xl" : "text-base"} font-black`}>
                      <SplitText text={d.name} base={i * 120 + 300} step={18} />
                    </p>
                    <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-white/70 sm:text-sm">
                      {d.desc}
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      {formatPrice(d.price)} · <span className="font-normal text-white/65">{d.spot}</span>
                    </p>
                    {firstTime && (
                      <p className="mx-auto mt-2 inline-block rounded-full bg-emerald-400/20 border border-emerald-300/50 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-widest text-emerald-200">
                        ✨ New!
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setPhase("idle")}
                className="rounded-full border border-white/25 bg-white/10 px-6 py-3 font-extrabold transition hover:bg-white/20"
              >
                Nhận món ✅
              </button>
              <StarBorder onClick={() => doPull(results.length === 1 ? 1 : 10)} glow="rgba(251,191,36,.65)">
                🔁 Quay tiếp {results.length === 1 ? "x1" : "x10"}
              </StarBorder>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
