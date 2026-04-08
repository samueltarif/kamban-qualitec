-- =============================================
-- RLS POLICIES PARA SUBTASKS
-- =============================================
-- Garante que apenas membros do board com permissões adequadas
-- possam visualizar, criar, editar ou excluir subtarefas.
-- Segue o mesmo padrão de segurança das outras tabelas relacionadas a tasks.

-- Policy: SELECT (todos os membros do board podem ver subtarefas)
create policy "Membros do board podem ver subtarefas"
  on public.subtasks for select
  using (
    exists (
      select 1 from public.tasks t
      inner join public.board_members bm on bm.board_id = t.board_id
      where t.id = subtasks.task_id
        and bm.user_id = auth.uid()
    )
  );

-- Policy: INSERT (apenas owner e editor podem criar subtarefas)
create policy "Apenas owner/editor podem criar subtarefas"
  on public.subtasks for insert
  with check (
    exists (
      select 1 from public.tasks t
      inner join public.board_members bm on bm.board_id = t.board_id
      where t.id = subtasks.task_id
        and bm.user_id = auth.uid()
        and bm.access_role in ('owner', 'editor')
    )
  );

-- Policy: UPDATE (apenas owner e editor podem editar subtarefas)
create policy "Apenas owner/editor podem editar subtarefas"
  on public.subtasks for update
  using (
    exists (
      select 1 from public.tasks t
      inner join public.board_members bm on bm.board_id = t.board_id
      where t.id = subtasks.task_id
        and bm.user_id = auth.uid()
        and bm.access_role in ('owner', 'editor')
    )
  );

-- Policy: DELETE (apenas owner e editor podem excluir subtarefas)
create policy "Apenas owner/editor podem excluir subtarefas"
  on public.subtasks for delete
  using (
    exists (
      select 1 from public.tasks t
      inner join public.board_members bm on bm.board_id = t.board_id
      where t.id = subtasks.task_id
        and bm.user_id = auth.uid()
        and bm.access_role in ('owner', 'editor')
    )
  );

-- =============================================
-- TRIGGER PARA AUDITORIA DE SUBTAREFAS
-- =============================================
-- Registra todas as operações em subtarefas no activity_logs
-- para rastreabilidade e histórico de mudanças.

create or replace function public.log_subtask_activity()
returns trigger 
language plpgsql 
security definer
set search_path = public
as $$
declare
  v_actor_id uuid := auth.uid();
  v_action text;
  v_meta jsonb;
begin
  if TG_OP = 'INSERT' then
    v_action := 'subtask_created';
    v_meta := jsonb_build_object(
      'subtask_id', NEW.id,
      'title', NEW.title,
      'task_id', NEW.task_id
    );
  elsif TG_OP = 'UPDATE' then
    if OLD.is_done != NEW.is_done then
      v_action := case when NEW.is_done then 'subtask_completed' else 'subtask_reopened' end;
    else
      v_action := 'subtask_updated';
    end if;
    v_meta := jsonb_build_object(
      'subtask_id', NEW.id,
      'title', NEW.title,
      'task_id', NEW.task_id,
      'is_done', NEW.is_done,
      'old_title', OLD.title,
      'old_is_done', OLD.is_done
    );
  elsif TG_OP = 'DELETE' then
    v_action := 'subtask_deleted';
    v_meta := jsonb_build_object(
      'subtask_id', OLD.id,
      'title', OLD.title,
      'task_id', OLD.task_id
    );
  end if;

  insert into public.activity_logs (actor_id, entity_type, entity_id, action, meta_json)
  values (v_actor_id, 'subtask', coalesce(NEW.id, OLD.id), v_action, v_meta);

  return coalesce(NEW, OLD);
end;
$$;

create trigger subtasks_activity_log
  after insert or update or delete on public.subtasks
  for each row execute function public.log_subtask_activity();
