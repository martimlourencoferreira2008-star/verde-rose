-- Corre isto no Supabase: SQL Editor -> New query -> Run
create table if not exists public.docs (
  uid uuid not null references auth.users(id) on delete cascade,
  path text not null,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (uid, path)
);

alter table public.docs enable row level security;

-- Cada utilizador só vê e altera as suas próprias linhas (privacidade real entre contas)
create policy "cada utilizador acede aos seus dados" on public.docs
  for all using (auth.uid() = uid) with check (auth.uid() = uid);
