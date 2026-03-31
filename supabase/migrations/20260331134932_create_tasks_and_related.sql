-- =============================================
-- TASK_GROUPS
-- =============================================
create table public.task_groups (
  id           uuid primary key default gen_random_uuid(),
  board_id     uuid not null references public.boards(id) on delete cascade,
  name         text not null,
  color        text,
  sort_order   int not null default 0,
  is_collapsed boolean not null default false
);

-- =============================================
-- TASKS
-- =============================================
create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  board_id    uuid not null references public.boards(id) on delete cascade,
  group_id    uuid references public.task_groups(id) on delete set null,
  title       text not null,
  description text,
  status_id   uuid,
  priority_id uuid,
  due_date    date,
  start_date  date,
  created_by  uuid references public.profiles(id) on delete set null,
  position    int not null default 0,
  archived_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- =============================================
-- TASK_ASSIGNEES
-- =============================================
create table public.task_assignees (
  task_id     uuid not null references public.tasks(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (task_id, user_id)
);

-- =============================================
-- SUBTASKS
-- =============================================
create table public.subtasks (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  title      text not null,
  is_done    boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- =============================================
-- TASK_COMMENTS
-- =============================================
create table public.task_comments (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  author_id  uuid references public.profiles(id) on delete set null,
  content    text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger task_comments_updated_at
  before update on public.task_comments
  for each row execute function public.set_updated_at();

-- =============================================
-- TASK_ATTACHMENTS
-- =============================================
create table public.task_attachments (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks(id) on delete cascade,
  file_name   text not null,
  file_path   text not null,
  mime_type   text,
  size_bytes  bigint,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- =============================================
-- LABELS / TASK_LABELS
-- =============================================
create table public.labels (
  id       uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  name     text not null,
  color    text not null
);

create table public.task_labels (
  task_id  uuid not null references public.tasks(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  primary key (task_id, label_id)
);

-- =============================================
-- SAVED_FILTERS / AUTOMATIONS / ACTIVITY_LOGS / NOTIFICATIONS
-- =============================================
create table public.saved_filters (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  board_id    uuid references public.boards(id) on delete cascade,
  name        text not null,
  filter_json jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table public.automations (
  id           uuid primary key default gen_random_uuid(),
  board_id     uuid not null references public.boards(id) on delete cascade,
  trigger_type text not null,
  action_type  text not null,
  config_json  jsonb not null default '{}',
  is_active    boolean not null default true
);

create table public.activity_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id   uuid not null,
  action      text not null,
  meta_json   jsonb default '{}',
  created_at  timestamptz not null default now()
);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text,
  read_at    timestamptz,
  link       text,
  created_at timestamptz not null default now()
);
