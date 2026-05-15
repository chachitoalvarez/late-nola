-- Catalog of all 980 stickers in the Panini FIFA World Cup 2026 album.
-- Read-only reference table: users never write to this, only the seed script does.

create table if not exists public.stickers (
  id              text primary key,          -- "wc2026:base:ARG001"
  numero_orden    smallint not null unique,  -- 1..980
  seccion         text not null,             -- "Apertura", "Grupo A", …, "Cierre"
  subseccion      text not null,             -- "México", "Argentina", …
  codigo_figura   text not null unique,      -- "ARG001"
  pais_equipo     text not null default '',
  nombre_figura   text not null default '',
  nombre_jugador  text not null default '',
  tipo_figura     text not null,             -- "jugador", "escudo", …
  tipo_coleccion  text not null default 'normal', -- "normal" | "especial"
  es_especial     boolean not null default false,
  acabado         text not null default 'standard' -- "standard" | "foil"
);

-- Index for the most common lookup: by codigo_figura
create index if not exists idx_stickers_codigo on public.stickers (codigo_figura);

-- Index for section grouping
create index if not exists idx_stickers_subseccion on public.stickers (subseccion);

-- RLS: everyone can read, nobody can write via the API
alter table public.stickers enable row level security;

create policy "Stickers are publicly readable"
  on public.stickers for select
  using (true);

-- No insert/update/delete policies — only service_role or migrations can write.
