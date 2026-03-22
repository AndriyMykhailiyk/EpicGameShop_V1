import { describe, expect, it } from "vitest";
import type { Game } from "@/types/game";
import type { GameRow } from "@/lib/catalog/gameMapper";
import { mergeStaticCatalogWithDbRows } from "@/lib/catalog/mergeCatalog";

const staticA: Game = {
  id: "1",
  title: "Static One",
  originalPrice: "100 ₴",
  discountedPrice: "50 ₴",
  imageUrl: "/a.jpg",
  tags: [],
  platforms: [],
};

const staticB: Game = {
  id: "2",
  title: "Static Two",
  originalPrice: "200 ₴",
  discountedPrice: "100 ₴",
  imageUrl: "/b.jpg",
  tags: [],
  platforms: [],
};

function row(
  id: string,
  title: string,
  created_at: string,
): GameRow {
  return {
    id,
    title,
    original_price: "0",
    discounted_price: "0",
    discount: 0,
    image_url: "https://example.com/i.jpg",
    tags: [],
    developer: null,
    publisher: null,
    platforms: [],
    description: null,
    is_mega_sale: false,
    sale_ends_at: null,
    original_price_uah: 0,
    discounted_price_uah: 0,
    is_active: true,
    created_at,
  };
}

describe("mergeStaticCatalogWithDbRows", () => {
  it("returns static list unchanged when db is empty", () => {
    expect(mergeStaticCatalogWithDbRows([staticA, staticB], [])).toEqual([
      staticA,
      staticB,
    ]);
  });

  it("appends only DB-only ids after all static games", () => {
    const extra = row("new-1", "New Game", "2026-01-02T00:00:00.000Z");
    const merged = mergeStaticCatalogWithDbRows([staticA, staticB], [extra]);
    expect(merged).toHaveLength(3);
    expect(merged[0]).toEqual(staticA);
    expect(merged[1]).toEqual(staticB);
    expect(merged[2].id).toBe("new-1");
    expect(merged[2].title).toBe("New Game");
  });

  it("replaces static entry when DB has same id", () => {
    const override = row("1", "Overridden", "2026-01-01T00:00:00.000Z");
    const merged = mergeStaticCatalogWithDbRows([staticA, staticB], [override]);
    expect(merged).toHaveLength(2);
    expect(merged[0].title).toBe("Overridden");
    expect(merged[1]).toEqual(staticB);
  });

  it("sorts extras by created_at then title", () => {
    const older = row("x", "B", "2026-01-01T00:00:00.000Z");
    const newer = row("y", "A", "2026-03-01T00:00:00.000Z");
    const merged = mergeStaticCatalogWithDbRows([staticA], [newer, older]);
    expect(merged.map((g) => g.id)).toEqual(["1", "x", "y"]);
  });
});
