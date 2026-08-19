import { supabaseRequest } from './supabase';

export type Availability = {
  closedDates: string[];
  blockedSlots: Record<string, string[]>;
};

function normalize(value: unknown): Availability {
  if (!value || typeof value !== 'object') return { closedDates: [], blockedSlots: {} };
  const candidate = value as Partial<Availability>;
  return {
    closedDates: Array.isArray(candidate.closedDates) ? candidate.closedDates.filter(item => typeof item === 'string') : [],
    blockedSlots: candidate.blockedSlots && typeof candidate.blockedSlots === 'object' ? candidate.blockedSlots : {},
  };
}

export async function readAvailability(): Promise<Availability> {
  const rows = await supabaseRequest<Array<{settings: unknown}>>('availability?id=eq.default&select=settings');
  return normalize(rows[0]?.settings);
}

export async function writeAvailability(availability: Availability) {
  const normalized = normalize(availability);
  await supabaseRequest('availability', {
    method: 'POST', body: { id: 'default', settings: normalized },
    prefer: 'resolution=merge-duplicates,return=minimal',
  });
}
