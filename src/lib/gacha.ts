import raw from "@/data/dishes.json";

export type Rarity = "N" | "R" | "SR" | "SSR" | "UR";

export interface Dish {
  id: string;
  name: string;
  desc: string;
  price: number;
  spot: string;
  emoji: string;
  rarity: Rarity;
  tag: string;
}

export const DISHES = raw as Dish[];

export const RARITY_ORDER: Rarity[] = ["N", "R", "SR", "SSR", "UR"];

interface RarityMeta {
  label: string;
  stars: number;
  weight: number;
  color: string;
  soft: string;
  gradient: string;
  glow: string;
}

/** Tỉ lệ gacha của banner hiện tại. Pity: 10 pull không SR+ thì pull 10 chắc chắn SR+. */
export const RARITY_META: Record<Rarity, RarityMeta> = {
  N: {
    label: "Thường",
    stars: 1,
    weight: 45,
    color: "#9aa4b2",
    soft: "rgba(154,164,178,.14)",
    gradient: "linear-gradient(135deg,#3a4150,#232936)",
    glow: "0 0 24px rgba(154,164,178,.25)",
  },
  R: {
    label: "Hiếm",
    stars: 2,
    weight: 30,
    color: "#38bdf8",
    soft: "rgba(56,189,248,.14)",
    gradient: "linear-gradient(135deg,#0c4a6e,#082f49)",
    glow: "0 0 28px rgba(56,189,248,.45)",
  },
  SR: {
    label: "Sử thi",
    stars: 3,
    weight: 15,
    color: "#c084fc",
    soft: "rgba(192,132,252,.16)",
    gradient: "linear-gradient(135deg,#6b21a8,#3b0764)",
    glow: "0 0 32px rgba(192,132,252,.55)",
  },
  SSR: {
    label: "Huyền thoại",
    stars: 4,
    weight: 8,
    color: "#fbbf24",
    soft: "rgba(251,191,36,.16)",
    gradient: "linear-gradient(135deg,#92400e,#451a03)",
    glow: "0 0 36px rgba(251,191,36,.6)",
  },
  UR: {
    label: "Vô giá",
    stars: 5,
    weight: 2,
    color: "#fb7185",
    soft: "rgba(251,113,133,.16)",
    gradient: "linear-gradient(135deg,#881337,#4c0519)",
    glow: "0 0 44px rgba(251,113,133,.7)",
  },
};

/** Id món SSR được rate-up trong banner này (50% số lần ra SSR). */
export const RATE_UP_ID = "pho-bat-dan";

const byRarity = (r: Rarity) => DISHES.filter((d) => d.rarity === r);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function rollRarity(pity: number): Rarity {
  // Pity cứng: pull thứ 10 không SR+ thì ép tối thiểu SR
  if (pity >= 9) {
    const r = Math.random() * (15 + 8 + 2);
    if (r < 15) return "SR";
    if (r < 23) return "SSR";
    return "UR";
  }
  const total = RARITY_ORDER.reduce((s, r) => s + RARITY_META[r].weight, 0);
  let r = Math.random() * total;
  for (const rarity of RARITY_ORDER) {
    r -= RARITY_META[rarity].weight;
    if (r <= 0) return rarity;
  }
  return "N";
}

export function rollOne(pity: number): Dish {
  const rarity = rollRarity(pity);
  if (rarity === "SSR" && Math.random() < 0.5) {
    const rateUp = DISHES.find((d) => d.id === RATE_UP_ID);
    if (rateUp) return rateUp;
  }
  return pick(byRarity(rarity));
}

export function rollMany(count: number, pityStart: number): { results: Dish[]; pityEnd: number } {
  const results: Dish[] = [];
  let pity = pityStart;
  for (let i = 0; i < count; i++) {
    const dish = rollOne(pity);
    results.push(dish);
    pity = dish.rarity === "SR" || dish.rarity === "SSR" || dish.rarity === "UR" ? 0 : pity + 1;
  }
  return { results, pityEnd: pity };
}

export function maxRarity(results: Dish[]): Rarity {
  let best: Rarity = "N";
  for (const d of results) {
    if (RARITY_ORDER.indexOf(d.rarity) > RARITY_ORDER.indexOf(best)) best = d.rarity;
  }
  return best;
}

export function formatPrice(vnd: number): string {
  if (vnd === 0) return "Vô giá";
  return `${vnd.toLocaleString("vi-VN")}đ`;
}

/** Blip synth theo độ hiếm, không cần asset âm thanh. */
export function playRaritySound(rarity: Rarity) {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const base: Record<Rarity, number[]> = {
      N: [330],
      R: [392, 494],
      SR: [523, 659, 784],
      SSR: [523, 659, 784, 1047],
      UR: [523, 659, 784, 1047, 1319],
    };
    base[rarity].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  } catch {
    /* bỏ qua khi trình duyệt chặn audio */
  }
}
