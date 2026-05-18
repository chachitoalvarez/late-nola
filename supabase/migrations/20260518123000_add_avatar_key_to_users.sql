alter table public.users
add column if not exists avatar_key text;

alter table public.users
drop constraint if exists users_avatar_key_check;

alter table public.users
add constraint users_avatar_key_check
check (
  avatar_key is null
  or avatar_key in ('mascota', 'trofeo', 'pelota', 'estadio', 'camiseta10')
);
