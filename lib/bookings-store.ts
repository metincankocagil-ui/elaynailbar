import { getStore } from '@netlify/blobs';
import { promises as fs } from 'fs';
import path from 'path';

export type StoredBooking = {
  id: string; service: string; date: string; time: string; name: string;
  phone: string; email?: string; note: string; designCode?: string;
  designColor?: string; status: string; createdAt: string;
};

const localFile = path.join(process.cwd(), 'data', 'bookings.json');

function usesNetlifyStorage() {
  return process.env.NETLIFY === 'true' || Boolean(process.env.SITE_ID || process.env.NETLIFY_BLOBS_CONTEXT);
}

export async function readBookings(): Promise<StoredBooking[]> {
  if (usesNetlifyStorage()) {
    const value = await getStore('elay-bookings').get('all', { type: 'json', consistency: 'strong' });
    return Array.isArray(value) ? value : [];
  }
  return JSON.parse(await fs.readFile(localFile, 'utf8').catch(() => '[]')) as StoredBooking[];
}

export async function writeBookings(bookings: StoredBooking[]) {
  if (usesNetlifyStorage()) {
    await getStore('elay-bookings').setJSON('all', bookings);
    return;
  }
  await fs.writeFile(localFile, JSON.stringify(bookings, null, 2));
}
