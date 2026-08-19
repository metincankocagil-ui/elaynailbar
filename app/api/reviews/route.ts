import { NextResponse } from 'next/server';
import { createReview, readReviews, StoredReview } from '@/lib/reviews-store';

export const dynamic = 'force-dynamic';
export async function GET() {
  try { return NextResponse.json(await readReviews(true), { headers: { 'Cache-Control': 'no-store' } }); }
  catch { return NextResponse.json({ error: 'Yorumlar okunamadı.' }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim(); const service = String(body.service || '').trim(); const text = String(body.text || '').trim(); const rating = Number(body.rating);
    if (name.length < 2 || name.length > 40 || text.length < 10 || text.length > 600 || service.length < 2 || service.length > 50 || !Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: 'Lütfen tüm alanları doğru biçimde doldurun.' }, { status: 400 });
    const review: Required<StoredReview> = { id: crypto.randomUUID(), name, service, text, rating, status: 'pending', createdAt: new Date().toISOString() };
    return NextResponse.json(await createReview(review), { status: 201 });
  } catch { return NextResponse.json({ error: 'Yorum kaydedilemedi. Lütfen tekrar deneyin.' }, { status: 500 }); }
}
