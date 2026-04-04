-- Refund Requests table
-- Run this in the Supabase SQL Editor to add the refund request system.

CREATE TABLE IF NOT EXISTS public.refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users (id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  admin_comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refund_requests_order ON public.refund_requests (order_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_user ON public.refund_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_email ON public.refund_requests (email);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON public.refund_requests (status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_created ON public.refund_requests (created_at DESC);
