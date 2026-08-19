import { readFile } from 'node:fs/promises';

const url = process.env.SUPABASE_URL?.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  throw new Error('SUPABASE_URL ve SUPABASE_SECRET_KEY gerekli.');
}

const headers = {
  apikey: key,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=minimal',
};
if (!key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${key}`;

async function load(file) {
  return JSON.parse(await readFile(new URL(`../data/${file}`, import.meta.url), 'utf8'));
}

async function upsert(table, body) {
  const response = await fetch(`${url}/rest/v1/${table}`, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`${table} aktarılamadı (${response.status}): ${await response.text()}`);
}

const [bookings, reviews, availability] = await Promise.all([
  load('bookings.json'), load('reviews.json'), load('availability.json'),
]);

await upsert('bookings', bookings.map(item => ({
  id: item.id,
  service: item.service,
  date: item.date,
  time: item.time,
  name: item.name,
  phone: item.phone,
  email: item.email || null,
  note: item.note || '',
  design_code: item.designCode || null,
  design_color: item.designColor || null,
  status: item.status || 'new',
  created_at: item.createdAt || new Date().toISOString(),
  reminder_sent_at: item.reminderSentAt || null,
})));

await upsert('reviews', reviews.map((item, index) => ({
  id: item.id,
  text: item.text,
  name: item.name,
  service: item.service,
  rating: item.rating,
  status: item.status || 'approved',
  created_at: item.createdAt || new Date(Date.UTC(2026, 0, 1, 0, 0, index)).toISOString(),
})));

await upsert('availability', { id: 'default', settings: availability });
console.log(`${bookings.length} randevu, ${reviews.length} yorum ve müsaitlik ayarları aktarıldı.`);
