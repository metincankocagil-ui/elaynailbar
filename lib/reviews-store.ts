import { supabaseRequest } from './supabase';

export type StoredReview = {
  id: string; text: string; name: string; service: string; rating: number;
  status?: string; createdAt?: string;
};

type ReviewRow = {
  id: string; text: string; name: string; service: string; rating: number;
  status: string; created_at: string;
};

const fromRow = (row: ReviewRow): StoredReview => ({
  id: row.id, text: row.text, name: row.name, service: row.service,
  rating: row.rating, status: row.status, createdAt: row.created_at,
});

export async function readReviews(approvedOnly = false) {
  const filter = approvedOnly ? '&status=eq.approved' : '';
  const rows = await supabaseRequest<ReviewRow[]>(`reviews?select=*&order=created_at.desc${filter}`);
  return rows.map(fromRow);
}

export async function createReview(review: Required<StoredReview>) {
  const rows = await supabaseRequest<ReviewRow[]>('reviews', {
    method: 'POST',
    body: {
      id: review.id, text: review.text, name: review.name, service: review.service,
      rating: review.rating, status: review.status, created_at: review.createdAt,
    },
    prefer: 'return=representation',
  });
  return fromRow(rows[0]);
}

export async function updateReviewStatus(id: string, status: string) {
  const rows = await supabaseRequest<ReviewRow[]>(`reviews?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH', body: { status }, prefer: 'return=representation',
  });
  return rows[0] ? fromRow(rows[0]) : null;
}

export async function deleteReview(id: string) {
  await supabaseRequest(`reviews?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
}
