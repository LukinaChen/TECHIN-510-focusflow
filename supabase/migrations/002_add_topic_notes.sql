-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS notes TEXT;
