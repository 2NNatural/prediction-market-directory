-- ============================================================
-- Prediction Market Directory — Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- Create the applications table
create table applications (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  description     text,
  url             text,
  logo_url        text,
  -- Five dimension tag arrays
  content_tags    text[] not null default '{}',
  instrument_tags text[] not null default '{}',
  execution_tags  text[] not null default '{}',
  interface_tags  text[] not null default '{}',
  resolution_tags text[] not null default '{}',
  -- Metadata
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- GIN indexes for fast array overlap queries
create index idx_applications_content_tags    on applications using gin(content_tags);
create index idx_applications_instrument_tags on applications using gin(instrument_tags);
create index idx_applications_execution_tags  on applications using gin(execution_tags);
create index idx_applications_interface_tags  on applications using gin(interface_tags);
create index idx_applications_resolution_tags on applications using gin(resolution_tags);

-- CHECK constraints to enforce valid tag values
alter table applications
  add constraint chk_content_tags check (
    content_tags <@ array['Sports','Politics','Pop Culture','Financials','Science/Tech','Governance/DAO']
  ),
  add constraint chk_instrument_tags check (
    instrument_tags <@ array['Binary Spot','Scalar','Perpetual','Parlay','Conditional (Futarchy)']
  ),
  add constraint chk_execution_tags check (
    execution_tags <@ array['CLOB','AMM','Parimutuel']
  ),
  add constraint chk_interface_tags check (
    interface_tags <@ array['Pro Terminal','Retail Wrapper','Social Wrapper','Agentic','Aggregator']
  ),
  add constraint chk_resolution_tags check (
    resolution_tags <@ array['Centralized','Optimistic','Social','On-Chain','AI Oracle']
  );

-- Auto-update updated_at on row changes
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger applications_updated_at
  before update on applications
  for each row execute function update_updated_at();

-- Row Level Security: public read access
alter table applications enable row level security;

create policy "Public read access"
  on applications for select
  using (true);
