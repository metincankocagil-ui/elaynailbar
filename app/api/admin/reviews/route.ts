import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin';
import { deleteReview, readReviews, updateReviewStatus } from '@/lib/reviews-store';

export async function GET(){if(!await isAdmin())return NextResponse.json({error:'Yetkisiz.'},{status:401});return NextResponse.json(await readReviews());}
export async function PATCH(request:Request){if(!await isAdmin())return NextResponse.json({error:'Yetkisiz.'},{status:401});const {id,status}=await request.json();if(!['approved','rejected'].includes(status))return NextResponse.json({error:'Geçersiz durum.'},{status:400});const item=await updateReviewStatus(id,status);if(!item)return NextResponse.json({error:'Yorum bulunamadı.'},{status:404});return NextResponse.json(item);}
export async function DELETE(request:Request){if(!await isAdmin())return NextResponse.json({error:'Yetkisiz.'},{status:401});const {id}=await request.json();await deleteReview(id);return NextResponse.json({ok:true});}
