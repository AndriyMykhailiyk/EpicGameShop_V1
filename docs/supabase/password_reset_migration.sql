-- Password Reset Tokens table
-- Run this in the Supabase SQL Editor to add password recovery functionality.

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_token ON public.password_reset_tokens (token) WHERE used = FALSE;
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON public.password_reset_tokens (user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON public.password_reset_tokens (expires_at);
