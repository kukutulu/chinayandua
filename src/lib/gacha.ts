import raw from "@/data/dishes.json";

export type Rarity = "N" | "R" | "SR" | "SSR" | "UR";

export interface Dish {
  id: string;
  district: string;
  name: string;
  /** Tên quán */
  quan: string;
  address: string;
  price: number;
  /** Đánh giá tham khảo (thang 5) */
  rating: number;
  /** Giờ mở cửa tham khảo */
  hours: string;
  desc: string;
  emoji: string;
  rarity: Rarity;
  tag: string;
}

export const DISHES = raw as Dish[];

export interface District {
  id: string;
  name: string;
}

export const DISTRICTS: District[] = [
  { id: "hoan-kiem", name: "Hoàn Kiếm" },
  { id: "ba-dinh", name: "Ba Đình" },
  { id: "hai-ba-trung", name: "Hai Bà Trưng" },
  { id: "dong-da", name: "Đống Đa" },
  { id: "cau-giay", name: "Cầu Giấy" },
  { id: "thanh-xuan", name: "Thanh Xuân" },
  { id: "hoang-mai", name: "Hoàng Mai" },
  { id: "tay-ho", name: "Tây Hồ" },
];

/** Món SSR được rate-up của từng quận (50% số lần ra SSR). */
export const RATE_UP_BY_DISTRICT: Record<string, string> = {
  "hoan-kiem": "hk-pho-bat-dan",
  "ba-dinh": "bd-pho-cuon-ngu-xa",
  "hai-ba-trung": "hbt-mi-van-than-hoa-ma",
  "dong-da": "dd-com-tho-anh-nguyen",
  "cau-giay": "cg-bun-dau-nghia-tan",
  "thanh-xuan": "tx-bun-dau-trieu-khuc",
  "hoang-mai": "hm-bun-ca-linh-dam",
  "tay-ho": "th-bun-oc-phu-tay-ho",
};

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

/**
 * Tỉ lệ banner: N 50% · R 30% · SR 14% · SSR 5% · UR 1%.
 * Pity kép: 100 pull không SSR thì pull 100 chắc chắn SSR;
 * 300 pull không UR thì pull 300 chắc chắn UR.
 */
export const RARITY_META: Record<Rarity, RarityMeta> = {
  N: {
    label: "Thường",
    stars: 1,
    weight: 50,
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
    weight: 14,
    color: "#c084fc",
    soft: "rgba(192,132,252,.16)",
    gradient: "linear-gradient(135deg,#6b21a8,#3b0764)",
    glow: "0 0 32px rgba(192,132,252,.55)",
  },
  SSR: {
    label: "Huyền thoại",
    stars: 4,
    weight: 5,
    color: "#fbbf24",
    soft: "rgba(251,191,36,.16)",
    gradient: "linear-gradient(135deg,#92400e,#451a03)",
    glow: "0 0 36px rgba(251,191,36,.6)",
  },
  UR: {
    label: "Vô giá",
    stars: 5,
    weight: 1,
    color: "#fb7185",
    soft: "rgba(251,113,133,.16)",
    gradient: "linear-gradient(135deg,#881337,#4c0519)",
    glow: "0 0 44px rgba(251,113,133,.7)",
  },
};

/** Số pull liên tiếp chưa ra SSR / UR. UR reset cả hai; SSR chỉ reset pity SSR. */
export interface Pity {
  ssr: number;
  ur: number;
}

export const PITY_SSR_AT = 100;
export const PITY_UR_AT = 300;

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Thuật toán roll một lượt:
 * 1. Kiểm tra pity cứng trước (UR@300 ưu tiên hơn SSR@100).
 * 2. Không pity thì weighted random: r = Math.random() * 100,
 *    đi qua trọng số cộng dồn [N50, R30, SR14, SSR5, UR1].
 */
function rollRarity(p: Pity): Rarity {
  if (p.ur + 1 >= PITY_UR_AT) return "UR";
  if (p.ssr + 1 >= PITY_SSR_AT) return "SSR";
  const total = RARITY_ORDER.reduce((s, r) => s + RARITY_META[r].weight, 0);
  let r = Math.random() * total;
  for (const rarity of RARITY_ORDER) {
    r -= RARITY_META[rarity].weight;
    if (r <= 0) return rarity;
  }
  return "N";
}

function rollDish(pool: Dish[], rarity: Rarity, rateUpId: string): Dish {
  // SSR tung đồng xu 50/50 về món rate-up của banner
  if (rarity === "SSR" && Math.random() < 0.5) {
    const rateUp = pool.find((d) => d.id === rateUpId);
    if (rateUp) return rateUp;
  }
  const bucket = pool.filter((d) => d.rarity === rarity);
  return pick(bucket.length ? bucket : pool);
}

function nextPity(p: Pity, r: Rarity): Pity {
  if (r === "UR") return { ssr: 0, ur: 0 };
  if (r === "SSR") return { ssr: 0, ur: p.ur + 1 };
  if (r === "SR") return { ssr: p.ssr + 1, ur: p.ur + 1 };
  return { ssr: p.ssr + 1, ur: p.ur + 1 };
}

export function rollMany(
  pool: Dish[],
  count: number,
  pityStart: Pity,
  rateUpId: string,
): { results: Dish[]; pityEnd: Pity } {
  const results: Dish[] = [];
  let pity = pityStart;
  for (let i = 0; i < count; i++) {
    const dish = rollDish(pool, rollRarity(pity), rateUpId);
    results.push(dish);
    pity = nextPity(pity, dish.rarity);
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
