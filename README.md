# EpicGame Shop

Next.js game storefront with Supabase-backed users, optional cloud catalog, checkout persistence, LiqPay payment integration, and an **admin panel** for sales analytics and catalog management.

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
| `NEXT_PUBLIC_APP_URL` | Public app URL for callbacks and email links |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google OAuth |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Optional GitHub OAuth |
| `LIQPAY_PUBLIC_KEY` | LiqPay merchant public key |
| `LIQPAY_PRIVATE_KEY` | LiqPay merchant private key |
| `LIQPAY_SANDBOX` | Set to `1` for LiqPay sandbox mode |
| `RESEND_API_KEY` | Resend API key for transactional emails (receipts, password reset) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token from [@BotFather](https://t.me/BotFather) for feedback notifications |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID where feedback messages are sent |
| `ADMIN_SEED_EMAIL` | Optional; default `admin@epicgame.shop` when seeding |
| `ADMIN_SEED_PASSWORD` | Optional; default `EpicAdmin!2026` when seeding (change in production) |

The public Supabase client (`lib/supabase/client.ts`) uses the standard anon key from your Supabase setup as already configured in your project.

## Database setup

1. In the Supabase SQL editor, run **`docs/supabase/admin_panel_schema.sql`**.
   If you already had an older `orders` table (e.g. without an `email` column) and the script errors, use the one-paste file **`docs/supabase/admin_panel_full_setup.sql`** instead (it drops `order_items` / `orders` first — only if you can lose that data).

2. Run **`docs/supabase/liqpay_migration.sql`** to add LiqPay payment columns to the `orders` table.

3. Run **`docs/supabase/password_reset_migration.sql`** to add the password reset tokens table.

4. Run **`docs/supabase/refund_requests_migration.sql`** to add the refund requests table.

5. **Admin user:** on each `npm run dev` / `npm start` the server runs a small bootstrap that **creates** the admin row if it does not exist (same email/password as below). You do **not** need `npm run seed:admin` unless you want to **reset the password** from `.env` for an account that already exists.

   ```bash
   npm run seed:admin
   ```

6. Optionally sync the built-in catalog into `games` so the storefront and admin use the same data:

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
2. Delete the project's `.next` folder (or rename it).
3. Create e.g. `C:\Users\<You>\AppData\Local\gamestore-next-cache`.
4. **Command Prompt as Administrator**, `cd` to the `gamestore` project root:
   ```bat
   mklink /J .next C:\Users\<You>\AppData\Local\gamestore-next-cache
   ```
5. Run `npm run dev` again — no `NEXT_DIST_DIR` in `.env` is required.

To remove the junction later: `rd .next` (removes the link, not the target folder if done correctly on Windows).

Open [http://localhost:3000](http://localhost:3000). Admin UI: [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## Informational pages (Ukrainian)

Static App Router pages with metadata and inline-styled layouts:

| Path | Title (metadata) |
|------|------------------|
| `/about` | Про нас — Epic Games Store |
| `/terms` | Умови використання — Epic Games Store |
| `/privacy` | Політика конфіденційності — Epic Games Store |
| `/support` | Центр підтримки — Epic Games Store |

## Admin panel

| Area | Path | Features |
|------|------|----------|
| Dashboard | `/admin` | KPIs (orders, AOV, tax/subtotal, 7-day revenue vs prior week), composed bar+line (revenue & units), order volume bars, area & line revenue, pie (order status), horizontal bar top games |
| Games | `/admin/games` | Create, edit, soft-delete (deactivate) games |
| Users | `/admin/users` | List users, block/unblock, view order history |
| Orders | `/admin/orders` | All orders, set status `paid` / `pending` |
| Refunds | `/admin/refunds` | Review refund requests, approve/reject with comments |
| Analytics | `/admin/analytics` | Summary cards; composed bar+line (units + revenue); area revenue; order counts; pie (paid vs pending); top games bar + table |

Access is enforced by **NextAuth**: only users with `is_admin = true` in `users` can open `/admin` (see `middleware.ts`). Admins also get an **"Адмін-панель"** link in the header profile menu.

## API reference

### Public endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/games/catalog` | No | Returns full game catalog (static + Supabase merged). Supports `search`, `page`, `limit` query params |
| GET | `/api/games/search?q=...` | No | Autocomplete search, returns up to 8 matching games |
| GET | `/api/games/[id]` | No | Returns a single game by ID |
| POST | `/api/orders` | Session | Persists a completed checkout (Zod-validated JSON body) |
| POST | `/api/checkout/validate-promo` | No | Validates a promo code against the `promo_codes` table |
| POST | `/api/send-receipt` | No | Sends an order receipt email via Resend |
| POST | `/api/feedback` | No | Sends user feedback (bug/suggestion/question) to Telegram |

### Authentication endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET/POST | `/api/auth/[...nextauth]` | — | NextAuth handler (credentials, Google, GitHub) |
| POST | `/api/auth/forgot-password` | No | Generates a password reset token and sends an email |
| POST | `/api/auth/reset-password` | No | Validates the reset token and updates the user's password |

### Payment endpoints (LiqPay)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/payment/liqpay/create` | Session | Creates a pending order and returns a signed LiqPay payment payload |
| POST | `/api/payment/liqpay/callback` | Signature | LiqPay server-to-server callback (signature-verified) |
| GET | `/api/payment/liqpay/status/[orderId]` | Session | Returns order payment status, optionally syncs with LiqPay API |

### Refund endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/refunds` | Session | Returns the current user's refund requests |
| POST | `/api/refunds` | Session | Creates a new refund request for an order |

### Admin endpoints

All admin endpoints require an authenticated session with `is_admin = true`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/dashboard` | KPI data and chart series for the admin dashboard |
| GET | `/api/admin/analytics` | Analytics series with `from`, `to`, `granularity` query params |
| GET | `/api/admin/games` | List all games |
| POST | `/api/admin/games` | Create or upsert a game |
| PATCH | `/api/admin/games/[id]` | Update a game |
| DELETE | `/api/admin/games/[id]` | Soft-delete (deactivate) a game |
| GET | `/api/admin/orders` | List all orders with line items |
| PATCH | `/api/admin/orders/[id]` | Update order status (`paid` / `pending`) |
| GET | `/api/admin/users` | List all users (without passwords) |
| PATCH | `/api/admin/users/[id]` | Block or unblock a user |
| GET | `/api/admin/users/[id]/orders` | List orders for a specific user |
| GET | `/api/admin/refunds` | List all refund requests |
| PATCH | `/api/admin/refunds/[id]` | Approve or reject a refund request |

**Checkout vs admin analytics:** the storefront always updates **localStorage** on "Place order". **Dashboard / analytics** read from Supabase `orders`. If `POST /api/orders` fails (wrong env, network, or DB error), the receipt still appears locally but **no row** is written — place a test order and check **Admin → Orders**. OAuth logins use a provider id in the session; the API **drops** non-UUID `user_id` and saves the order with `user_id` null so the row still inserts (linked by **email**). A yellow warning on the receipt means the server did not save the order.

## Database migrations

Run the following SQL files in the Supabase SQL Editor in order:

| File | Purpose |
|------|---------|
| `docs/supabase/admin_panel_schema.sql` | Core schema: users, games, orders, order_items tables with indexes |
| `docs/supabase/admin_panel_full_setup.sql` | Same as above but drops existing orders tables first (destructive) |
| `docs/supabase/liqpay_migration.sql` | Adds LiqPay payment columns and status constraints to orders |
| `docs/supabase/password_reset_migration.sql` | Creates password_reset_tokens table |
| `docs/supabase/refund_requests_migration.sql` | Creates refund_requests table with indexes |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (webpack) |
| `npm run dev:turbo` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Unit tests (Vitest) |
| `npm run seed:admin` | Create/update admin user |
| `npm run seed:games` | Upsert static games into `games` |
| `npm run clean` | Clean `.next` build cache |

## Tech stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | App Router framework |
| React | 19.2.3 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Supabase | 2.90.1 | PostgreSQL database |
| NextAuth.js | 4.24.13 | Authentication (credentials + OAuth) |
| Redux Toolkit | 2.11.2 | Cart state management |
| Zod | 4.3.6 | API validation |
| LiqPay | — | Payment gateway |
| Resend | 6.7.0 | Transactional emails |
| Recharts | 3.8.0 | Admin analytics charts |
| Framer Motion | 12.26.2 | Animations |
| Embla Carousel | 8.6.0 | Carousels |
| bcryptjs | 3.0.3 | Password hashing |
| Vitest | 2.1.9 | Unit testing |
