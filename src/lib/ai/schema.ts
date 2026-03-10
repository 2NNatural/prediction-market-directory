import { z } from 'zod';
import {
  CONTENT_TAGS,
  INSTRUMENT_TAGS,
  EXECUTION_TAGS,
  INTERFACE_TAGS,
  RESOLUTION_TAGS,
} from '@/types';

// Build Zod enums from the canonical tag constants in types/index.ts.
// This ensures the LLM output is validated against the exact same values
// enforced by the DB CHECK constraints.
const contentEnum = z.enum(CONTENT_TAGS);
const instrumentEnum = z.enum(INSTRUMENT_TAGS);
const executionEnum = z.enum(EXECUTION_TAGS);
const interfaceEnum = z.enum(INTERFACE_TAGS);
const resolutionEnum = z.enum(RESOLUTION_TAGS);

export const applicationAnalysisSchema = z.object({
  isValidApplication: z
    .boolean()
    .describe(
      'True if this site actually constructs, routes, or executes prediction market trades. False if it is a news aggregator, analytics dashboard, portfolio tracker, or affiliate site that only links/redirects to Polymarket/Kalshi without routing the transaction itself.'
    ),
  rejectReason: z
    .string()
    .optional()
    .describe(
      'If isValidApplication is false, a brief explanation of why. Must end with: "If you believe this was rejected in error, please contact nneri@usc.edu"'
    ),
  name: z.string().describe('The official name of the application'),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be a URL-safe lowercase slug')
    .describe('URL-safe lowercase slug, e.g. "polymarket" or "billy-bets"'),
  description: z
    .string()
    .max(300)
    .describe('One sentence describing what this application does in the prediction market context'),
  dimensions: z
    .object({
      content_tags: z
        .array(contentEnum)
        .describe('Which market subjects this app covers'),
      instrument_tags: z
        .array(instrumentEnum)
        .describe('Which financial contract types this app uses'),
      execution_tags: z
        .array(executionEnum)
        .describe('How prices are determined and orders matched'),
      interface_tags: z
        .array(interfaceEnum)
        .describe('How users interact with this platform'),
      resolution_tags: z
        .array(resolutionEnum)
        .describe('How market outcomes are determined'),
    })
    .optional()
    .describe('The 5-dimension taxonomy tags. Only fill out if isValidApplication is true.'),
});

export type ApplicationAnalysis = z.infer<typeof applicationAnalysisSchema>;
