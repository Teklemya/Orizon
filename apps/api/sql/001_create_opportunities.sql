-- SQL: create opportunities table
-- Run with: psql $DATABASE_URL -f apps/api/sql/001_create_opportunities.sql

CREATE TABLE IF NOT EXISTS opportunities (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT,
  location TEXT,
  paid BOOLEAN DEFAULT false,
  deadline TIMESTAMPTZ,
  link TEXT,
  created_by TEXT,
  posted_at TIMESTAMPTZ DEFAULT now()
);

-- Optional indices
CREATE INDEX IF NOT EXISTS opportunities_posted_at_idx ON opportunities(posted_at DESC);
CREATE INDEX IF NOT EXISTS opportunities_type_idx ON opportunities(type);
