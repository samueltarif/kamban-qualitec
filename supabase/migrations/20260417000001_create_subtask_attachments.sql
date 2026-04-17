-- =============================================
-- CREATE SUBTASK_ATTACHMENTS TABLE
-- =============================================

create table public.subtask_attachments (
  id          uuid primary key default gen_random_uuid(),
  subtask_id  uuid not null references public.subtasks(id) on delete cascade,
  file_name   text not null,
  file_path   text not null,
  mime_type   text,
  size_bytes  bigint,
  category    text,
  description text,
  sort_order  integer not null default 0,
  uploaded_by uuid references public.profiles(id),
  created_at  timestamp with time zone not null default now()
);

-- Comentários
comment on table public.subtask_attachments is 'Anexos de subtarefas';
comment on column public.subtask_attachments.category is 'Categoria/tópico do anexo (ex: Documentos, Imagens, Contratos)';
comment on column public.subtask_attachments.description is 'Descrição opcional do anexo';
comment on column public.subtask_attachments.sort_order is 'Ordem de exibição dentro da categoria';

-- =============================================
-- RLS POLICIES FOR SUBTASK_ATTACHMENTS
-- =============================================

alter table public.subtask_attachments enable row level security;

-- Policy: Membros do board podem ver anexos de subtarefas
create policy "Board members can view subtask attachments"
on public.subtask_attachments for select
using (
  -- Master pode ver tudo
  public.my_role() = 'master'
  or
  -- Membros do board podem ver
  exists (
    select 1 from public.subtasks st
    join public.tasks t on t.id = st.task_id
    join public.board_members bm on bm.board_id = t.board_id
    where st.id = subtask_attachments.subtask_id
      and bm.user_id = auth.uid()
  )
);

-- Policy: Owners e editors podem fazer upload em subtarefas
create policy "Owners and editors can upload subtask attachments"
on public.subtask_attachments for insert
with check (
  -- Master pode fazer upload
  public.my_role() = 'master'
  or
  -- Owners e editors do board podem fazer upload
  exists (
    select 1 from public.subtasks st
    join public.tasks t on t.id = st.task_id
    join public.board_members bm on bm.board_id = t.board_id
    where st.id = subtask_attachments.subtask_id
      and bm.user_id = auth.uid()
      and bm.access_role in ('owner', 'editor')
  )
);

-- Policy: Owners e editors podem atualizar anexos de subtarefas
create policy "Owners and editors can update subtask attachments"
on public.subtask_attachments for update
using (
  -- Master pode atualizar
  public.my_role() = 'master'
  or
  -- Owners e editors do board podem atualizar
  exists (
    select 1 from public.subtasks st
    join public.tasks t on t.id = st.task_id
    join public.board_members bm on bm.board_id = t.board_id
    where st.id = subtask_attachments.subtask_id
      and bm.user_id = auth.uid()
      and bm.access_role in ('owner', 'editor')
  )
);

-- Policy: Owners e editors podem deletar anexos de subtarefas
create policy "Owners and editors can delete subtask attachments"
on public.subtask_attachments for delete
using (
  -- Master pode deletar
  public.my_role() = 'master'
  or
  -- Owners e editors do board podem deletar
  exists (
    select 1 from public.subtasks st
    join public.tasks t on t.id = st.task_id
    join public.board_members bm on bm.board_id = t.board_id
    where st.id = subtask_attachments.subtask_id
      and bm.user_id = auth.uid()
      and bm.access_role in ('owner', 'editor')
  )
);
