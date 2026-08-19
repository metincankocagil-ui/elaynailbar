# Cloudflare Workers + Supabase kurulumu

## 1. Supabase veritabanı

1. Supabase'te ücretsiz bir proje oluşturun.
2. **SQL Editor** bölümünde `supabase/schema.sql` dosyasının tamamını çalıştırın.
3. **Project Settings > API Keys** bölümünden Project URL ve `sb_secret_...` sunucu anahtarını alın.
4. Yerel `.env.local` dosyasına aşağıdakileri ekleyin:

```env
SUPABASE_URL=https://PROJE.supabase.co/rest/v1
SUPABASE_SECRET_KEY=sb_secret_sunucu-anahtari
```

`SUPABASE_SECRET_KEY` gizlidir; tarayıcı kodunda kullanılmamalı ve Git'e gönderilmemelidir.

## 2. Mevcut yerel verileri aktarın

Ortam değişkenlerini terminal oturumuna yükledikten sonra:

```bash
npm run db:import
```

Bu komut `data/` klasöründeki randevuları, yorumları ve müsaitlik ayarlarını Supabase'e aktarır. Tekrar çalıştırılması mevcut satırları çoğaltmaz.

## 3. Cloudflare'a bağlayın

1. Cloudflare Dashboard'da **Workers & Pages > Create > Import a repository** yoluyla GitHub deposunu seçin.
2. Build command olarak `npm run cf:build`, deploy command olarak `npx wrangler deploy` kullanın.
3. Build variables ve Worker secrets alanlarına şunları ekleyin:
   - `SUPABASE_URL`
   - `SUPABASE_SECRET_KEY`
   - `ADMIN_PASSWORD`
   - `RESEND_API_KEY`
   - `BOOKING_NOTIFICATION_EMAIL`
   - `BOOKING_FROM_EMAIL`
   - `CRON_SECRET`
4. İlk deployment sonrasında Worker'ın **Settings > Domains & Routes** bölümünden `elaynailbar.com` alan adını ekleyin.

Yerelde Cloudflare çalışma ortamını sınamak için `npm run preview`, doğrudan yayınlamak için `npm run deploy` kullanılabilir.

Cloudflare Cron Trigger her saat başında çalışır ve onaylanmış randevuların yaklaşık 24 saat önceki e-posta hatırlatmalarını gönderir.
