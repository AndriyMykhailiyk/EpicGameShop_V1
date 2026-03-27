import type { CartItem } from "@/lib/store/cartSlice";
import { getItemPrice } from "./priceUtils";

/** Shape returned by generateActivationKeys for each game. */
export interface GameActivationKeys {
  title: string;
  gameId: string;
  keys: string[];
}

/** Flat activation-key row stored alongside each order item. */
export interface FlatActivationKey {
  game_id: string;
  game_title: string;
  activation_key: string;
}

/**
 * Generates a random order number in the format ORD-XXXXXXXX.
 *
 * @returns Order number string
 */
export function generateOrderNumber(): string {
  return (
    "ORD-" + Math.random().toString(36).substring(2, 10).toUpperCase()
  );
}

/**
 * Generates a single activation key in hex format XXXX-XXXX-XXXX-XXXX.
 *
 * @returns Activation key string
 */
export function generateGameKey(): string {
  const hex = () =>
    Math.floor(Math.random() * 16)
      .toString(16)
      .toUpperCase();

  const segment = (len: number) =>
    Array.from({ length: len }, hex).join("");

  return [segment(4), segment(4), segment(4), segment(4)].join("-");
}

/**
 * Generates activation keys for every cart item respecting quantity.
 *
 * @param items - Cart items array
 * @returns Grouped keys per game + flat key array
 */
export function generateActivationKeys(items: CartItem[]): {
  grouped: GameActivationKeys[];
  flat: FlatActivationKey[];
} {
  const grouped: GameActivationKeys[] = [];
  const flat: FlatActivationKey[] = [];

  for (const item of items) {
    const keys: string[] = [];
    for (let i = 0; i < item.quantity; i++) {
      const key = generateGameKey();
      keys.push(key);
      flat.push({
        game_id: item.id,
        game_title: item.title,
        activation_key: key,
      });
    }
    grouped.push({ title: item.title, gameId: item.id, keys });
  }

  return { grouped, flat };
}

/**
 * Merges newly purchased game IDs into the localStorage purchasedGames list.
 *
 * @param items - Cart items that were just purchased
 */
export function mergePurchasedGames(items: CartItem[]): void {
  try {
    const raw = localStorage.getItem("purchasedGames") || "[]";
    const existing: Record<string, unknown>[] = JSON.parse(raw);
    const now = new Date().toISOString();

    const toAdd = items.map((it) => ({
      id: it.id,
      title: it.title,
      image: it.imageUrl || "",
      purchasedAt: now,
    }));

    const mergedMap: Record<string, Record<string, unknown>> = {};
    for (const g of existing) {
      if (typeof g.id === "string") mergedMap[g.id] = g;
    }
    for (const g of toAdd) {
      mergedMap[g.id] = { ...(mergedMap[g.id] || {}), ...g };
    }

    localStorage.setItem(
      "purchasedGames",
      JSON.stringify(Object.values(mergedMap)),
    );
  } catch {
    /* localStorage may be unavailable — silently skip */
  }
}

/**
 * Saves the full order object into localStorage `userOrders` array.
 *
 * @param orderData - Order payload to persist locally
 */
export function saveOrderLocally(orderData: Record<string, unknown>): void {
  try {
    const saved = localStorage.getItem("userOrders");
    const existing: unknown[] = saved ? JSON.parse(saved) : [];
    existing.push(orderData);
    localStorage.setItem("userOrders", JSON.stringify(existing));
  } catch {
    /* localStorage may be unavailable — silently skip */
  }
}

/**
 * Builds the payload expected by POST /api/orders.
 *
 * @param params - Order parameters
 * @returns Body object matching createOrderSchema
 */
export function buildServerOrderPayload(params: {
  email: string;
  userId: string | null;
  orderNumber: string;
  items: CartItem[];
  flatKeys: FlatActivationKey[];
  subtotal: number;
  tax: number;
  total: number;
}): Record<string, unknown> {
  return {
    email: params.email,
    userId: params.userId,
    status: "paid" as const,
    subtotal: params.subtotal,
    tax: params.tax,
    total: params.total,
    orderNumber: params.orderNumber,
    items: params.items.map((item) => {
      const keysForGame = params.flatKeys.filter(
        (k) => k.game_id === item.id,
      );
      return {
        gameId: item.id,
        gameTitle: item.title,
        quantity: item.quantity,
        unitPrice: getItemPrice(item),
        lineTotal: getItemPrice(item) * item.quantity,
        activationKey: keysForGame[0]?.activation_key,
      };
    }),
  };
}
