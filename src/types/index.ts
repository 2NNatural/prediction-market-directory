// ─── Dimension Tag Constants ──────────────────────────────────────

export const CONTENT_TAGS = [
  'Sports', 'Politics', 'Pop Culture', 'Financials', 'Science/Tech', 'Governance/DAO',
] as const;

export const INSTRUMENT_TAGS = [
  'Binary Spot', 'Scalar', 'Perpetual', 'Parlay', 'Conditional (Futarchy)',
] as const;

export const EXECUTION_TAGS = [
  'CLOB', 'AMM', 'Parimutuel',
] as const;

export const INTERFACE_TAGS = [
  'Pro Terminal', 'Retail Wrapper', 'Social Wrapper', 'Agentic', 'Aggregator',
] as const;

export const RESOLUTION_TAGS = [
  'Centralized', 'Optimistic', 'Social', 'On-Chain', 'AI Oracle',
] as const;

export type ContentTag = typeof CONTENT_TAGS[number];
export type InstrumentTag = typeof INSTRUMENT_TAGS[number];
export type ExecutionTag = typeof EXECUTION_TAGS[number];
export type InterfaceTag = typeof INTERFACE_TAGS[number];
export type ResolutionTag = typeof RESOLUTION_TAGS[number];

export type DimensionKey = 'content' | 'instrument' | 'execution' | 'interface' | 'resolution';

// ─── Application Status ───────────────────────────────────────────

export const APPLICATION_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ApplicationStatus = typeof APPLICATION_STATUSES[number];

// ─── Application ──────────────────────────────────────────────────

export interface Application {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  url: string | null;
  logo_url: string | null;
  content_tags: ContentTag[];
  instrument_tags: InstrumentTag[];
  execution_tags: ExecutionTag[];
  interface_tags: InterfaceTag[];
  resolution_tags: ResolutionTag[];
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

// ─── Filter State ─────────────────────────────────────────────────

export interface FilterState {
  content: ContentTag[];
  instrument: InstrumentTag[];
  execution: ExecutionTag[];
  interface: InterfaceTag[];
  resolution: ResolutionTag[];
}

export const EMPTY_FILTER_STATE: FilterState = {
  content: [],
  instrument: [],
  execution: [],
  interface: [],
  resolution: [],
};

// ─── Dimension Config (for rendering sidebar) ─────────────────────

export interface DimensionConfig {
  key: DimensionKey;
  label: string;
  description: string;
  dbColumn: string;
  tags: readonly string[];
}

export const DIMENSION_CONFIGS: DimensionConfig[] = [
  { key: 'content', label: 'Content', description: 'The Subject', dbColumn: 'content_tags', tags: CONTENT_TAGS },
  { key: 'instrument', label: 'Instrument', description: 'The Contract', dbColumn: 'instrument_tags', tags: INSTRUMENT_TAGS },
  { key: 'execution', label: 'Execution', description: 'The Engine', dbColumn: 'execution_tags', tags: EXECUTION_TAGS },
  { key: 'interface', label: 'Interface', description: 'The Form Factor', dbColumn: 'interface_tags', tags: INTERFACE_TAGS },
  { key: 'resolution', label: 'Resolution', description: 'The Trust Layer', dbColumn: 'resolution_tags', tags: RESOLUTION_TAGS },
];
