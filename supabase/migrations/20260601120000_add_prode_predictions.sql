create table if not exists public.prode_predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  match_id text not null,
  predicted_home_score integer not null check (predicted_home_score >= 0),
  predicted_away_score integer not null check (predicted_away_score >= 0),
  predicted_qualified_team_id text,
  points integer not null default 0,
  exact_score_hit boolean not null default false,
  outcome_hit boolean not null default false,
  goal_difference_hit boolean not null default false,
  qualified_team_hit boolean not null default false,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

create index if not exists idx_prode_predictions_user_id
  on public.prode_predictions (user_id);

create index if not exists idx_prode_predictions_match_id
  on public.prode_predictions (match_id);

alter table public.prode_predictions enable row level security;

drop policy if exists "Users can read own prode predictions" on public.prode_predictions;
create policy "Users can read own prode predictions"
  on public.prode_predictions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own prode predictions" on public.prode_predictions;
create policy "Users can insert own prode predictions"
  on public.prode_predictions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own prode predictions" on public.prode_predictions;
create policy "Users can update own prode predictions"
  on public.prode_predictions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

drop trigger if exists set_prode_predictions_updated_at on public.prode_predictions;
create trigger set_prode_predictions_updated_at
  before update on public.prode_predictions
  for each row execute function public.set_updated_at();
