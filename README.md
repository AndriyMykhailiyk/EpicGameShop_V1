# EpicGame Shop

Next.js game storefront with Supabase-backed users, optional cloud catalog, checkout persistence, and an **admin panel** for sales analytics and catalog management.

**Live demo (if deployed):** https://cheery-malasada-736afe.netlify.app/

## Requirements

- Node.js 20+
- PostgreSQL via [Supabase](https://supabase.com/) (URL + anon key for the client, **service role** key for server scripts and admin APIs)

## Environment variables

Create `.env.local` in the project root (never commit secrets):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) |
| `NEXTAUTH_SECRET` | Random secret for NextAuth JWT encryption |
| `NEXTAUTH_URL` | App base URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional OAuth |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Optional OAuth |
| `ADMIN_SEED_EMAIL` | Optional; default `admin@epicgame.shop` when seeding |
| `ADMIN_SEED_PASSWORD` | Optional; default `EpicAdmin!2026` when seeding (change in production) |

The public Supabase client (`lib/supabase/client.ts`) uses the standard anon key from your Supabase setup as already configured in your project.

## Database setup (admin panel)

1. In the Supabase SQL editor, run **`docs/supabase/admin_panel_schema.sql`**.  
   If you already had an older `orders` table (e.g. without an `email` column) and the script errors, use the one-paste file **`docs/supabase/admin_panel_full_setup.sql`** instead (it drops `order_items` / `orders` first — only if you can lose that data).
2. **Admin user:** on each `npm run dev` / `npm start` the server runs a small bootstrap that **creates** the admin row if it does not exist (same email/password as below). You do **not** need `npm run seed:admin` unless you want to **reset the password** from `.env` for an account that already exists.

   ```bash
   npm run seed:admin
   ```

3. Optionally sync the built-in catalog into `games` so the storefront and admin use the same data:

   ```bash
   npm run seed:games
   ```

The storefront always starts from the static catalog in `lib/api/game.ts`. Supabase rows with the **same** `id` replace those entries; rows with **new** ids are **appended** after all static games. If the `games` table is empty or unreadable, only the static list is used.

### Default administrator login (after `seed:admin`)

- **Email:** `admin@epicgame.shop`
- **Password:** `EpicAdmin!2026`

Override with `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD` before seeding. **Change the password in production.**

## Run locally

```bash
npm install
npm run dev
```

`npm run dev` uses **webpack** for more stable chunk loading on Windows (paths with non-ASCII folders, OneDrive, etc.). For Turbopack: `npm run dev:turbo`.

If the browser shows **Failed to load chunk** for `app/layout` or similar: stop the server, run `npm run clean`, then `npm run dev` again. Ensure only one dev server is running.

### Windows `EPERM` / `ENOENT` with `.next` (OneDrive / `NEXT_DIST_DIR`)

**Do not** set `NEXT_DIST_DIR` in Windows user/system environment variables to an absolute path like `C:\Users\...\cache` — Next will try to create `...\gamestore\C:\Users\...` and fail.

**OneDrive workaround (junction on `.next`):**

1. Stop `npm run dev` and close Node processes.
2. Delete the project’s `.next` folder (or rename it).
3. Create e.g. `C:\Users\<You>\AppData\Local\gamestore-next-cache`.
4. **Command Prompt as Administrator**, `cd` to the `gamestore` project root:
   ```bat
   mklink /J .next C:\Users\<You>\AppData\Local\gamestore-next-cache
   ```
5. Run `npm run dev` again — no `NEXT_DIST_DIR` in `.env` is required.

To remove the junction later: `rd .next` (removes the link, not the target folder if done correctly on Windows).

Open [http://localhost:3000](http://localhost:3000). Admin UI: [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## Admin panel

| Area | Path | Features |
|------|------|----------|
| Dashboard | `/admin` | KPIs (orders, AOV, tax/subtotal, 7-day revenue vs prior week), composed bar+line (revenue & units), order volume bars, area & line revenue, pie (order status), horizontal bar top games |
| Games | `/admin/games` | Create, edit, soft-delete (deactivate) games |
| Users | `/admin/users` | List users, block/unblock, view order history |
| Orders | `/admin/orders` | All orders, set status `paid` / `pending` |
| Analytics | `/admin/analytics` | Summary cards; composed bar+line (units + revenue); area revenue; order counts; pie (paid vs pending); top games bar + table |

Access is enforced by **NextAuth**: only users with `is_admin = true` in `users` can open `/admin` (see `middleware.ts`). Admins also get an **“Адмін-панель”** link in the header profile menu.

## Public API (reference)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/games/catalog` | Static built-in games + Supabase `games`: same `id` overrides static; new ids append at end |
| POST | `/api/orders` | Persist checkout (validated JSON body; used after client checkout) |

**Checkout vs admin analytics:** the storefront always updates **localStorage** on “Place order”. **Dashboard / analytics** read from Supabase `orders`. If `POST /api/orders` fails (wrong env, network, or DB error), the receipt still appears locally but **no row** is written — place a test order and check **Admin → Orders**. OAuth logins use a provider id in the session; the API **drops** non-UUID `user_id` and saves the order with `user_id` null so the row still inserts (linked by **email**). A yellow warning on the receipt means the server did not save the order.

Admin APIs under `/api/admin/*` require an authenticated admin session (same browser session cookie).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run test` | Unit tests (Vitest) |
| `npm run seed:admin` | Create/update admin user |
| `npm run seed:games` | Upsert static games into `games` |

## Tech stack

Next.js 16, React 19, NextAuth, Supabase, Redux (cart), Tailwind CSS 4, Zod (API validation), Recharts (admin charts).
