/**
 * Upserts the static storefront catalog into Supabase `games`.
 * Run after applying `docs/supabase/admin_panel_schema.sql`.
 */
import { createClient } from "@supabase/supabase-js";
import { getSaleGames } from "../lib/api/game";
import { buildGameUpsertPayload } from "../lib/catalog/gameMapper";
import { parseUahString } from "../lib/pricing/parseUahString";

async function main() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY",
      );
    }

    const supabase = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const rows = getSaleGames().map((g) => ({
      ...buildGameUpsertPayload(
        {
          id: g.id,
          title: g.title,
          originalPrice: g.originalPrice,
          discountedPrice: g.discountedPrice,
          discount: g.discount,
          imageUrl: g.imageUrl,
          tags: g.tags ?? [],
          developer: g.developer,
          publisher: g.publisher,
          platforms: g.platforms ?? [],
          description: g.description,
          isMegaSale: g.isMegaSale,
          saleEndsAt: g.saleEndsAt ?? null,
        },
        parseUahString(g.originalPrice),
        parseUahString(g.discountedPrice),
      ),
      is_active: true,
    }));

    const { error } = await supabase.from("games").upsert(rows, {
      onConflict: "id",
    });
    if (error) {
      throw new Error(error.message);
    }
    process.stdout.write(`Seeded ${rows.length} games.\n`);
  } catch (err) {
    process.stderr.write(
      `${err instanceof Error ? err.message : String(err)}\n`,
    );
    process.exit(1);
  }
}

void main();
