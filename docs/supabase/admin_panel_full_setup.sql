-- EpicGame Shop — повне застосування схеми адмін-панелі (один раз у SQL Editor → Run)
-- Якщо раніше вже створювали orders без колонки email — спочатку видаляємо старі таблиці замовлень.
-- УВАГА: це видалить усі рядки в order_items та orders. Не запускай на проді з реальними замовленнями без резервної копії.

DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

-- Далі — те саме, що в admin_panel_schema.sql

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS blocked BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.games (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  original_price TEXT NOT NULL DEFAULT '',
  discounted_price TEXT NOT NULL DEFAULT '',
  discount INTEGER NOT NULL DEFAULT 0,
  image_url TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  developer TEXT,
  publisher TEXT,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  is_mega_sale BOOLEAN NOT NULL DEFAULT FALSE,
  sale_ends_at TIMESTAMPTZ,
  original_price_uah NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discounted_price_uah NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_active ON public.games (is_active);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending')) DEFAULT 'paid',
  subtotal NUMERIC(12, 2) NOT NULL,
  tax NUMERIC(12, 2) NOT NULL,
  total NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders (email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  game_title TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL,
  line_total NUMERIC(12, 2) NOT NULL,
  activation_key TEXT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_game_id ON public.order_items (game_id);
