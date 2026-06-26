-- Migration: Add generation tracking columns to profiles
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- Add generations_remaining counter (defaults to 0 for free users)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS generations_remaining integer DEFAULT 0;

-- Add stripe_customer_id for future subscription management
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;
