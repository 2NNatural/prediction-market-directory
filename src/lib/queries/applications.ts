import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { Application, FilterState } from '@/types';

export async function fetchApplications(filters: FilterState): Promise<Application[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('applications')
    .select('*')
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

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch applications: ${error.message}`);
  return (data ?? []) as Application[];
}
