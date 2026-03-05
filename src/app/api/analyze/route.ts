import { NextRequest, NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { scrapeUrl } from '@/lib/scraper';
import { applicationAnalysisSchema, type ApplicationAnalysis } from '@/lib/ai/schema';
import { ANALYSIS_SYSTEM_PROMPT } from '@/lib/ai/prompt';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

// Simple in-memory cooldown to prevent rapid re-submission of the same URL.
// Keyed by URL, value is the timestamp when the cooldown expires.
const urlCooldowns = new Map<string, number>();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (
    !body ||
    typeof body !== 'object' ||
    !('url' in body) ||
    typeof (body as Record<string, unknown>).url !== 'string'
  ) {
    return NextResponse.json({ error: 'Missing required field: url' }, { status: 400 });
  }

  const url = ((body as Record<string, unknown>).url as string).trim();

  if (!url) {
    return NextResponse.json({ error: 'URL cannot be empty' }, { status: 400 });
  }

  // Validate URL format early
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Only http and https URLs are supported' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
  }

  // Rate limiting: reject if this URL was submitted recently
  const cooldownExpiry = urlCooldowns.get(url);
  if (cooldownExpiry && Date.now() < cooldownExpiry) {
    const secondsLeft = Math.ceil((cooldownExpiry - Date.now()) / 1000);
    return NextResponse.json(
      { error: `This URL was submitted recently. Please wait ${secondsLeft}s before resubmitting.` },
      { status: 429 }
    );
  }

  const supabase = createSupabaseServiceClient();

  // Check if URL already exists in the database
  const { data: existing } = await supabase
    .from('applications')
    .select('id, name, status')
    .eq('url', url)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error: `This application already exists in the directory as "${existing.name}" (status: ${existing.status}).`,
        existing,
      },
      { status: 409 }
    );
  }

  // Set cooldown now (before scraping) to prevent race conditions
  urlCooldowns.set(url, Date.now() + COOLDOWN_MS);

  // Step 1: Scrape the URL
  let markdown: string;
  try {
    markdown = await scrapeUrl(url);
  } catch (err) {
    urlCooldowns.delete(url); // release cooldown on failure
    const message = err instanceof Error ? err.message : 'Unknown scraping error';
    return NextResponse.json(
      { error: `Failed to scrape website: ${message}` },
      { status: 502 }
    );
  }

  // Step 2: Classify with LLM
  let analysis: ApplicationAnalysis;
  try {
    const result = await generateObject({
      model: anthropic('claude-sonnet-4-5'),
      schema: applicationAnalysisSchema,
      system: ANALYSIS_SYSTEM_PROMPT,
      prompt: `Analyze this prediction market application:\n\nURL: ${url}\n\n---\n\n${markdown}`,
    });
    analysis = result.object;
  } catch (err) {
    urlCooldowns.delete(url); // release cooldown on AI failure
    const message = err instanceof Error ? err.message : 'Unknown AI error';
    return NextResponse.json(
      { error: `AI analysis failed: ${message}` },
      { status: 500 }
    );
  }

  // Step 3: Handle slug collisions
  let slug = analysis.slug;
  const { data: slugExists } = await supabase
    .from('applications')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (slugExists) {
    // Append a random 4-char hex suffix to make it unique
    const suffix = Math.random().toString(16).slice(2, 6);
    slug = `${slug}-${suffix}`;
  }

  // Step 4: Insert as pending
  const { data: inserted, error: insertError } = await supabase
    .from('applications')
    .insert({
      name: analysis.name,
      slug,
      description: analysis.description,
      url,
      logo_url: null,
      content_tags: analysis.content_tags,
      instrument_tags: analysis.instrument_tags,
      execution_tags: analysis.execution_tags,
      interface_tags: analysis.interface_tags,
      resolution_tags: analysis.resolution_tags,
      status: 'pending',
    })
    .select()
    .single();

  if (insertError || !inserted) {
    urlCooldowns.delete(url);
    return NextResponse.json(
      { error: `Database insert failed: ${insertError?.message ?? 'Unknown error'}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ application: inserted }, { status: 201 });
}
