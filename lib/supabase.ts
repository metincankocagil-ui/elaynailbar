function config() {
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const missing = [!process.env.SUPABASE_URL && 'SUPABASE_URL', !key && 'SUPABASE_SECRET_KEY'].filter(Boolean);
  if (missing.length) throw new Error(`Eksik Supabase ortam değişkenleri: ${missing.join(', ')}`);
  return {
    url: process.env.SUPABASE_URL!.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, ''),
    key: key!,
  };
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  prefer?: string;
};

export async function supabaseRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { url, key } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method: options.method || 'GET',
    headers: {
      apikey: key,
      ...(key.startsWith('sb_secret_') ? {} : { Authorization: `Bearer ${key}` }),
      'Content-Type': 'application/json',
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase isteği başarısız (${response.status}): ${detail}`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
