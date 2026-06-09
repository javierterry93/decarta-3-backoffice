-- =============================================================================
-- SUPABASE SCHEMA
-- =============================================================================
-- Ejecutar en SQL Editor
--
-- Estructura por entidad (un repositorio por entidad en la app):
-- auth.users
--     └── businesses                 → Business
--             ├── categories         → Category
--             │       └── products   → Product
--             └── images             → Image
--
-- Snapshot: la carta completa, expuesta en lectura pública vía snapshot_data.
--
-- Regla:
-- 1 usuario = 1 negocio
-- =============================================================================

-- =============================================================================
-- LIMPIEZA
-- =============================================================================

drop view if exists public.snapshot_data cascade;
drop view if exists public.view_business_menu cascade;

drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.images cascade;
drop table if exists public.menu_images cascade;
drop table if exists public.businesses cascade;

drop function if exists public.set_updated_at() cascade;
drop function if exists public.set_last_modified() cascade;

-- =============================================================================
-- BUSINESS
-- =============================================================================

create table public.businesses (
    id uuid primary key default gen_random_uuid(),

    owner_user_id uuid not null unique
        references auth.users (id)
        on delete cascade,

    name text not null default 'Mi Restaurante',

    logo_image_id uuid,

    phone text not null default '',
    address text not null default '',

    hours text not null default 'Lun–Dom: 12:00–23:00',

    social_instagram text not null default '',
    social_facebook text not null default '',
    social_twitter text not null default '',

    last_modified timestamptz not null default now()
);

create index businesses_owner_user_id_idx
    on public.businesses (owner_user_id);

alter table public.businesses enable row level security;

create policy businesses_owner_policy
on public.businesses
for all
using (
    owner_user_id = auth.uid()
)
with check (
    owner_user_id = auth.uid()
);

-- =============================================================================
-- IMAGE
-- =============================================================================

create table public.images (
    id uuid primary key default gen_random_uuid(),

    business_id uuid not null
        references public.businesses (id)
        on delete cascade,

    name text not null,

    url text,
    thumbnail_url text,

    created_at timestamptz not null default now()
);

-- El logo del negocio referencia a images; la FK se añade aquí porque
-- la tabla businesses se crea antes que images.
alter table public.businesses
    add constraint businesses_logo_image_id_fkey
    foreign key (logo_image_id)
    references public.images (id)
    on delete set null;

create index images_business_id_idx
    on public.images (business_id);

alter table public.images enable row level security;

create policy images_owner_policy
on public.images
for all
using (
    exists (
        select 1
        from public.businesses b
        where b.id = images.business_id
        and b.owner_user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.businesses b
        where b.id = images.business_id
        and b.owner_user_id = auth.uid()
    )
);

-- =============================================================================
-- CATEGORY
-- =============================================================================

create table public.categories (
    id uuid primary key default gen_random_uuid(),

    business_id uuid not null
        references public.businesses (id)
        on delete cascade,

    name text not null default '',

    sort_order int not null default 0
        check (sort_order >= 0),

    visible boolean not null default true
);

create index categories_business_id_idx
    on public.categories (business_id);

-- Categorías únicas por negocio (insensible a mayúsculas)
create unique index categories_business_name_unique_idx
    on public.categories (
        business_id,
        lower(name)
    );

alter table public.categories enable row level security;

create policy categories_owner_policy
on public.categories
for all
using (
    exists (
        select 1
        from public.businesses b
        where b.id = categories.business_id
        and b.owner_user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.businesses b
        where b.id = categories.business_id
        and b.owner_user_id = auth.uid()
    )
);

-- =============================================================================
-- PRODUCT
-- =============================================================================

create table public.products (
    id uuid primary key default gen_random_uuid(),

    name text not null default '',

    category_id uuid not null
        references public.categories (id)
        on delete cascade,

    sort_order int not null default 0
        check (sort_order >= 0),

    price numeric(10,2) not null default 0
        check (price >= 0),

    short_description text not null default '',

    visible boolean not null default true,

    image_id uuid
        references public.images (id)
        on delete set null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index products_category_id_idx
    on public.products (category_id);

alter table public.products enable row level security;

create policy products_owner_policy
on public.products
for all
using (
    exists (
        select 1
        from public.categories c
        inner join public.businesses b
            on b.id = c.business_id
        where c.id = products.category_id
        and b.owner_user_id = auth.uid()
    )
)
with check (
    exists (
        select 1
        from public.categories c
        inner join public.businesses b
            on b.id = c.business_id
        where c.id = products.category_id
        and b.owner_user_id = auth.uid()
    )
);

-- =============================================================================
-- SNAPSHOT (VISTA PÚBLICA)
-- =============================================================================

create view public.snapshot_data
as
select
    c.business_id,

    p.id as product_id,
    p.name as product_name,
    p.sort_order as product_order,
    p.price,
    p.short_description,
    p.image_id,

    c.id as category_id,
    c.name as category_name,
    c.sort_order as category_order

from public.products p
inner join public.categories c
    on c.id = p.category_id

where
    c.visible = true
    and p.visible = true;

-- Solo lectura pública
revoke all on public.snapshot_data from public;

grant select on public.snapshot_data
to anon, authenticated;

-- =============================================================================
-- TRIGGERS DE TIMESTAMPS
-- =============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create or replace function public.set_last_modified()
returns trigger
language plpgsql
as $$
begin
    new.last_modified = now();
    return new;
end;
$$;

create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create trigger businesses_set_last_modified
before update on public.businesses
for each row
execute function public.set_last_modified();
