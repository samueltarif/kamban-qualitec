-- Helper functions
create or replace function public.my_role()
returns public.user_role language sql stable security definer as $$
  select role_global from public.profiles where id = auth.uid()
$$;

create or replace function public.my_org()
returns uuid language sql stable security definer as $$
  select organization_id from public.profiles where id = auth.uid()
$$;

-- RLS: organizations
alter table public.organizations enable row level security;
create policy "org: members can read own org" on public.organizations for select using (id = public.my_org());
create policy "org: master can update own org" on public.organizations for update using (id = public.my_org() and public.my_role() = 'master');

-- RLS: profiles
alter table public.profiles enable row level security;
create policy "profiles: user reads own profile" on public.profiles for select using (id = auth.uid() or organization_id = public.my_org());
create policy "profiles: user updates own profile" on public.profiles for update using (id = auth.uid());
create policy "profiles: master manages all in org" on public.profiles for all using (organization_id = public.my_org() and public.my_role() = 'master');

-- RLS: user_managed_users
alter table public.user_managed_users enable row level security;
create policy "managed: master full access" on public.user_managed_users for all using (public.my_role() = 'master');
create policy "managed: user reads own" on public.user_managed_users for select using (managed_user_id = auth.uid());

-- RLS: workspaces
alter table public.workspaces enable row level security;
create policy "workspaces: org members read" on public.workspaces for select using (organization_id = public.my_org());
create policy "workspaces: master full access" on public.workspaces for all using (organization_id = public.my_org() and public.my_role() = 'master');

-- RLS: boards
alter table public.boards enable row level security;
create policy "boards: member reads if in org workspace" on public.boards for select using (workspace_id in (select id from public.workspaces where organization_id = public.my_org()));
create policy "boards: master full access" on public.boards for all using (workspace_id in (select id from public.workspaces where organization_id = public.my_org()) and public.my_role() = 'master');
create policy "boards: board member can read private" on public.boards for select using (id in (select board_id from public.board_members where user_id = auth.uid()));

-- RLS: board_members
alter table public.board_members enable row level security;
create policy "board_members: read if member" on public.board_members for select using (user_id = auth.uid() or public.my_role() = 'master');
create policy "board_members: master manages" on public.board_members for all using (public.my_role() = 'master');

-- RLS: board_columns / board_views
alter table public.board_columns enable row level security;
alter table public.board_views enable row level security;
create policy "board_columns: read if board member" on public.board_columns for select using (board_id in (select board_id from public.board_members where user_id = auth.uid()) or public.my_role() = 'master');
create policy "board_columns: master manages" on public.board_columns for all using (public.my_role() = 'master');
create policy "board_views: read if board member" on public.board_views for select using (board_id in (select board_id from public.board_members where user_id = auth.uid()) or public.my_role() = 'master');
create policy "board_views: master manages" on public.board_views for all using (public.my_role() = 'master');

-- RLS: task_groups / tasks
alter table public.task_groups enable row level security;
alter table public.tasks enable row level security;
create policy "task_groups: read if board member" on public.task_groups for select using (board_id in (select board_id from public.board_members where user_id = auth.uid()) or public.my_role() = 'master');
create policy "task_groups: collaborator+ manages" on public.task_groups for all using (public.my_role() in ('master','collaborator'));
create policy "tasks: read if board member" on public.tasks for select using (board_id in (select board_id from public.board_members where user_id = auth.uid()) or public.my_role() = 'master');
create policy "tasks: collaborator+ manages" on public.tasks for all using (public.my_role() in ('master','collaborator'));

-- RLS: remaining tables
alter table public.task_assignees enable row level security;
alter table public.subtasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_attachments enable row level security;
alter table public.labels enable row level security;
alter table public.task_labels enable row level security;
alter table public.saved_filters enable row level security;
alter table public.automations enable row level security;
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;

create policy "task_assignees: read if board member" on public.task_assignees for select using (public.my_role() in ('master','collaborator') or user_id = auth.uid());
create policy "task_assignees: collaborator+ manages" on public.task_assignees for all using (public.my_role() in ('master','collaborator'));
create policy "subtasks: collaborator+ manages" on public.subtasks for all using (public.my_role() in ('master','collaborator'));
create policy "task_comments: read all in org" on public.task_comments for select using (public.my_role() in ('master','collaborator','guest','observer'));
create policy "task_comments: author or master manages" on public.task_comments for all using (author_id = auth.uid() or public.my_role() = 'master');
create policy "task_attachments: collaborator+ manages" on public.task_attachments for all using (public.my_role() in ('master','collaborator'));
create policy "labels: collaborator+ manages" on public.labels for all using (public.my_role() in ('master','collaborator'));
create policy "task_labels: collaborator+ manages" on public.task_labels for all using (public.my_role() in ('master','collaborator'));
create policy "saved_filters: own only" on public.saved_filters for all using (user_id = auth.uid());
create policy "automations: master manages" on public.automations for all using (public.my_role() = 'master');
create policy "activity_logs: read in org" on public.activity_logs for select using (public.my_role() in ('master','collaborator'));
create policy "notifications: own only" on public.notifications for all using (user_id = auth.uid());
