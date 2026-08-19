create table if not exists public.bookings (
  id uuid primary key,
  service text not null,
  date date not null,
  time time not null,
  name text not null,
  phone text not null,
  email text,
  note text not null default '',
  design_code text,
  design_color text,
  status text not null default 'new' check (status in ('new', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  reminder_sent_at timestamptz
);

create index if not exists bookings_date_status_idx on public.bookings (date, status);
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);

create table if not exists public.reviews (
  id text primary key,
  text text not null,
  name text not null,
  service text not null,
  rating smallint not null check (rating between 1 and 5),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists reviews_status_created_at_idx on public.reviews (status, created_at desc);

create table if not exists public.availability (
  id text primary key,
  settings jsonb not null default '{"closedDates":[],"blockedSlots":{}}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.availability enable row level security;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.bookings to service_role;
grant select, insert, update, delete on table public.reviews to service_role;
grant select, insert, update, delete on table public.availability to service_role;

insert into public.availability (id, settings)
values ('default', '{"closedDates":[],"blockedSlots":{}}'::jsonb)
on conflict (id) do nothing;
