import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
const file = path.join(process.cwd(), 'data', 'reviews.json');

type Review = { id: string; text: string; name: string; service: string; rating: number; status?: string; createdAt?: string };
async function readReviews(): Promise<Review[]> { return JSON.parse(await fs.readFile(file, 'utf8')); }

export async function GET() {
  try { return NextResponse.json((await readReviews()).filter(review => !review.status || review.status === 'approved'), { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'Yorumlar okunamadı.' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim(); const service = String(body.service || '').trim(); const text = String(body.text || '').trim(); const rating = Number(body.rating);
    if (name.length < 2 || name.length > 40 || text.length < 10 || text.length > 600 || service.length < 2 || service.length > 50 || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: 'Lütfen tüm alanları doğru biçimde doldurun.' }, { status: 400 });
    const review: Review & {status:string} = { id: crypto.randomUUID(), name, service, text, rating, status: 'pending', createdAt: new Date().toISOString() };
    const reviews = await readReviews(); reviews.unshift(review);
    await fs.writeFile(file, JSON.stringify(reviews, null, 2), 'utf8');
    return NextResponse.json(review, { status: 201 });
  } catch { return NextResponse.json({ error: 'Yorum kaydedilemedi. Lütfen tekrar deneyin.' }, { status: 500 }); }
}
