-- Table to store countries visited by users
-- Each user can have multiple visited countries, stored as individual rows

create table public.visited_countries (
    id bigint generated always as identity primary key,
    user_id uuid not null default next_auth.uid(),
    country_code varchar(2) not null,
    country_name text not null,
    visited_date timestamp with time zone default now(),
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now(),
    constraint visited_countries_user_country_unique unique (user_id, country_code)
);

comment on table public.visited_countries is 'Stores countries that users have visited. Each row represents one country visit per user. Uses ISO 3166-1 alpha-2 country codes.';

-- Enable RLS
alter table public.visited_countries enable row level security;

-- RLS Policies
create policy "Users can view their own visited countries"
  on public.visited_countries
  for select
  to authenticated
  using (next_auth.uid() = user_id);

create policy "Users can insert their own visited countries"
  on public.visited_countries
  for insert
  to authenticated
  with check (next_auth.uid() = user_id);

create policy "Users can update their own visited countries"
  on public.visited_countries
  for update
  to authenticated
  using (next_auth.uid() = user_id);

create policy "Users can delete their own visited countries"
  on public.visited_countries
  for delete
  to authenticated
  using (next_auth.uid() = user_id);

-- Index for faster queries
create index visited_countries_user_id_idx on public.visited_countries(user_id);
create index visited_countries_country_code_idx on public.visited_countries(country_code);