import { createHash, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const tokenFor = (password: string) => createHash('sha256').update(`elay-admin:${password}`).digest('hex');
export function validPassword(password: string) { const expected = process.env.ADMIN_PASSWORD; return !!expected && password.length === expected.length && timingSafeEqual(Buffer.from(password), Buffer.from(expected)); }
export async function isAdmin() { const expected = process.env.ADMIN_PASSWORD; const token = (await cookies()).get('elay_admin')?.value; return !!expected && token === tokenFor(expected); }
export function sessionToken() { return tokenFor(process.env.ADMIN_PASSWORD || ''); }
