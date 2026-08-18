import { getStore } from '@netlify/blobs';
import { promises as fs } from 'fs';
import path from 'path';

export type Availability = {
  closedDates: string[];
  blockedSlots: Record<string, string[]>;
};

const localFile = path.join(process.cwd(), 'data', 'availability.json');

function usesNetlifyStorage() {
  return process.env.NETLIFY === 'true' || Boolean(process.env.SITE_ID || process.env.NETLIFY_BLOBS_CONTEXT);
}

function normalize(value: unknown): Availability {
  if (!value || typeof value !== 'object') return { closedDates: [], blockedSlots: {} };
  const candidate = value as Partial<Availability>;
  return {
    closedDates: Array.isArray(candidate.closedDates) ? candidate.closedDates.filter(item => typeof item === 'string') : [],
    blockedSlots: candidate.blockedSlots && typeof candidate.blockedSlots === 'object' ? candidate.blockedSlots : {},
  };
}

export async function readAvailability(): Promise<Availability> {
  if (usesNetlifyStorage()) {
    const value = await getStore('elay-availability').get('settings', { type: 'json', consistency: 'strong' });
    return normalize(value);
  }
  const value = JSON.parse(await fs.readFile(localFile, 'utf8').catch(() => 'null'));
  return normalize(value);
}

export async function writeAvailability(availability: Availability) {
  const normalized = normalize(availability);
  if (usesNetlifyStorage()) {
    await getStore('elay-availability').setJSON('settings', normalized);
    return;
  }
  await fs.writeFile(localFile, JSON.stringify(normalized, null, 2), 'utf8');
}
