-- MARÉVIA initial schema. Review and apply with Supabase SQL editor or Supabase CLI.
create extension if not exists pgcrypto;
create table if not exists public.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text unique not null, created_at timestamptz not null default now());
create table if not exists public.products (id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, description text not null default '', category_id uuid references public.categories(id), price_cents integer not null check(price_cents >= 0), compare_at_cents integer check(compare_at_cents is null or compare_at_cents >= price_cents), published boolean not null default false, seo_title text, seo_description text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.product_images (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, image_url text not null, alt_text text not null default '', position integer not null default 0);
create table if not exists public.product_variants (id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, sku text unique not null, size text not null, color text not null, stock integer not null default 0 check(stock >= 0), active boolean not null default true, unique(product_id,size,color));
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, display_name text, role text not null default 'customer' check(role in ('customer','admin')), created_at timestamptz not null default now());
create table if not exists public.coupons (id uuid primary key default gen_random_uuid(), code text unique not null, discount_percent integer check(discount_percent between 1 and 100), discount_cents integer check(discount_cents >= 0), min_subtotal_cents integer not null default 0, active boolean not null default true, starts_at timestamptz, expires_at timestamptz, usage_limit integer, usage_count integer not null default 0);
create table if not exists public.orders (id uuid primary key default gen_random_uuid(), public_token uuid not null unique default gen_random_uuid(), customer_name text not null, customer_email text not null, customer_phone text not null, shipping_address jsonb not null, subtotal_cents integer not null check(subtotal_cents >= 0), shipping_cents integer not null default 0 check(shipping_cents >= 0), discount_cents integer not null default 0 check(discount_cents >= 0), total_cents integer not null check(total_cents >= 0), status text not null default 'pending_payment' check(status in ('pending_payment','paid','payment_pending','payment_failed','cancelled','processing','shipped','delivered','refunded')), payment_provider text, provider_payment_id text, provider_preference_id text, inventory_reserved_until timestamptz, tracking_code text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.order_items (id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, product_id uuid references public.products(id) on delete set null, variant_id uuid references public.product_variants(id) on delete set null, product_name text not null, product_slug text not null, sku text, size text not null, color text not null, unit_price_cents integer not null check(unit_price_cents >= 0), quantity integer not null check(quantity > 0), line_total_cents integer not null check(line_total_cents >= 0));
create table if not exists public.payment_events (id uuid primary key default gen_random_uuid(), provider text not null, event_id text not null, order_id uuid references public.orders(id) on delete set null, payload jsonb not null default '{}', processed_at timestamptz, created_at timestamptz not null default now(), unique(provider,event_id));
create table if not exists public.inventory_movements (id uuid primary key default gen_random_uuid(), variant_id uuid references public.product_variants(id) on delete set null, order_id uuid references public.orders(id) on delete set null, quantity_delta integer not null, reason text not null, created_at timestamptz not null default now());
create index if not exists products_published_idx on public.products(published, created_at desc);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists variants_product_idx on public.product_variants(product_id);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_email_idx on public.orders(customer_email);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.profiles enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_events enable row level security;
alter table public.inventory_movements enable row level security;

-- Public read access only to published catalogue data. Writes must go through trusted server endpoints.
create policy "public read categories" on public.categories for select using (true);
create policy "public read published products" on public.products for select using (published = true);
create policy "public read product images for published products" on public.product_images for select using (exists(select 1 from public.products p where p.id=product_id and p.published=true));
create policy "public read active variants for published products" on public.product_variants for select using (active=true and exists(select 1 from public.products p where p.id=product_id and p.published=true));
create policy "users read own profile" on public.profiles for select using (auth.uid()=id);
create policy "users update own profile" on public.profiles for update using (auth.uid()=id) with check (auth.uid()=id);
-- Intentionally no client policies for orders, order_items, coupons, payment_events or inventory_movements.
-- Configure admin access via server-side role checks; never trust a client-provided role.
