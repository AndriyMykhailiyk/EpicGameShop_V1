-- =============================================================
-- Migration: Add LiqPay payment columns to orders table
-- Run this SQL in the Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================

-- Add payment_method column to track how each order was paid
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'card';

-- Add LiqPay-specific tracking columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS liqpay_status TEXT;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS liqpay_payment_id TEXT;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Update the status CHECK constraint to allow 'cancelled' status
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('paid', 'pending', 'cancelled'));

-- Index on payment_method for filtering by payment type
CREATE INDEX IF NOT EXISTS idx_orders_payment_method
  ON public.orders (payment_method);

-- Index on liqpay_status for monitoring LiqPay payments
CREATE INDEX IF NOT EXISTS idx_orders_liqpay_status
  ON public.orders (liqpay_status)
  WHERE liqpay_status IS NOT NULL;
