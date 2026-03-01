-- ============================================================
-- Seed Data — 3 Sample Applications
-- Run this in the Supabase SQL Editor after schema.sql
-- ============================================================

insert into applications (name, slug, description, url, content_tags, instrument_tags, execution_tags, interface_tags, resolution_tags) values
(
  'Polymarket',
  'polymarket',
  'The world''s largest prediction market platform for political, cultural, and sports events.',
  'https://polymarket.com',
  array['Sports', 'Politics', 'Pop Culture'],
  array['Binary Spot'],
  array['CLOB'],
  array['Retail Wrapper'],
  array['Optimistic']
),
(
  'Sharpe.ai',
  'sharpe-ai',
  'Professional-grade prediction market terminal for serious traders.',
  'https://sharpe.ai',
  array['Sports', 'Politics'],
  array['Binary Spot'],
  array['CLOB'],
  array['Pro Terminal'],
  array['Optimistic']
),
(
  'Billy Bets',
  'billy-bets',
  'Agentic sports betting platform combining AMM and orderbook execution.',
  'https://billybets.io',
  array['Sports'],
  array['Binary Spot'],
  array['AMM', 'CLOB'],
  array['Agentic'],
  array['Centralized']
);
