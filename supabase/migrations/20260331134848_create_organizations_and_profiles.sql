-- =============================================
-- ORGANIZATIONS
-- =============================================
create table public.organizations (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  logo_url      text,
  created_at    timestamptz not null default now()
);

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
create type public.user_role as enum ('master', 'collaborator', 'guest', 'observer');
create type public.user_status as enum ('active', 'inactive', 'pending');

create table public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name       text,
  email           text not null,
  avatar_url      text,
  role_global     public.user_role not null default 'collaborator',
  status          public.user_status not null default 'active',
  created_at      timestamptz not null default now()
);

-- =============================================
-- USER_MANAGED_USERS (master → managed members)
-- =============================================
create table public.user_managed_users (
  master_user_id  uuid not null references public.profiles(id) on delete cascade,
  managed_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (master_user_id, managed_user_id),
  constraint no_self_manage check (master_user_id <> managed_user_id)
);
