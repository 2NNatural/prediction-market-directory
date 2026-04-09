import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Application, FilterState } from '@/types';

export async function fetchApplications(
  filters: FilterState,
  search?: string
): Promise<Application[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('applications')
    .select('*')
    .eq('status', 'approved')
    .order('name', { ascending: true });

  // AND across dimensions, OR within each dimension
  // .overlaps() maps to PostgreSQL && (has any element in common)
  if (filters.content.length > 0) {
    query = query.overlaps('content_tags', filters.content);
  }
  if (filters.instrument.length > 0) {
    query = query.overlaps('instrument_tags', filters.instrument);
  }
  if (filters.execution.length > 0) {
    query = query.overlaps('execution_tags', filters.execution);
  }
  if (filters.interface.length > 0) {
    query = query.overlaps('interface_tags', filters.interface);
  }
  if (filters.resolution.length > 0) {
    query = query.overlaps('resolution_tags', filters.resolution);
  }

  // Search: match name OR description
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch applications: ${error.message}`);

  let results = (data ?? []) as Application[];

  // Rank results: name matches first, then description-only matches
  if (search) {
    const q = search.toLowerCase();
    results.sort((a, b) => {
      const aNameMatch = a.name.toLowerCase().includes(q);
      const bNameMatch = b.name.toLowerCase().includes(q);
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      // Within name matches, exact/starts-with ranks higher
      if (aNameMatch && bNameMatch) {
        const aExact = a.name.toLowerCase() === q;
        const bExact = b.name.toLowerCase() === q;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        const aStarts = a.name.toLowerCase().startsWith(q);
        const bStarts = b.name.toLowerCase().startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  return results;
}
