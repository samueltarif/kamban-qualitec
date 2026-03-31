-- =============================================
-- WORKSPACES
-- =============================================
create type public.visibility_type as enum ('public', 'private', 'org');

create table public.workspaces (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name            text not null,
  slug            text not null,
  visibility      public.visibility_type not null default 'org',
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  unique (organization_id, slug)
);

-- =============================================
-- BOARDS
-- =============================================
create type public.board_type as enum ('kanban', 'scrum', 'list');

create table public.boards (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references public.workspaces(id) on delete cascade,
  name            text not null,
  description     text,
  board_type      public.board_type not null default 'kanban',
  visibility      public.visibility_type not null default 'org',
  cover_color     text,
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now()
);

-- =============================================
-- BOARD_MEMBERS
-- =============================================
create type public.board_access_role as enum ('owner', 'editor', 'viewer', 'guest');

create table public.board_members (
  board_id    uuid not null references public.boards(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  access_role public.board_access_role not null default 'viewer',
  primary key (board_id, user_id)
);

-- =============================================
-- BOARD_COLUMNS
-- =============================================
create type public.column_type as enum ('status','priority','due_date','start_date','assignee','notes','files','budget','last_updated','timeline','custom');

create table public.board_columns (
  id            uuid primary key default gen_random_uuid(),
  board_id      uuid not null references public.boards(id) on delete cascade,
  type          public.column_type not null,
  label         text not null,
  settings_json jsonb default '{}',
  sort_order    int not null default 0
);

-- =============================================
-- BOARD_VIEWS
-- =============================================
create type public.view_type as enum ('board','kanban','calendar','timeline','gantt','cards','table');

create table public.board_views (
  id            uuid primary key default gen_random_uuid(),
  board_id      uuid not null references public.boards(id) on delete cascade,
  view_type     public.view_type not null default 'kanban',
  name          text not null,
  settings_json jsonb default '{}',
  is_default    boolean not null default false
);
