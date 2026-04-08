-- =============================================
-- TRIGGER PARA CRIAR STATUS E PRIORIDADES PADRÃO
-- =============================================
-- Quando um novo board é criado, automaticamente cria
-- status e prioridades padrão inspirados no Monday.com

create or replace function public.create_default_board_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Criar status padrão (inspirado no Monday.com)
  insert into public.task_statuses (board_id, name, color, sort_order) values
    (NEW.id, 'A fazer', '#C4C4C4', 0),        -- Cinza
    (NEW.id, 'Em andamento', '#FDAB3D', 1),   -- Laranja
    (NEW.id, 'Concluído', '#00C875', 2),      -- Verde
    (NEW.id, 'Bloqueado', '#E2445C', 3);      -- Vermelho

  -- Criar prioridades padrão (inspirado no Monday.com)
  insert into public.task_priorities (board_id, name, color, sort_order) values
    (NEW.id, 'Baixa', '#579BFC', 0),          -- Azul claro
    (NEW.id, 'Média', '#FDAB3D', 1),          -- Laranja
    (NEW.id, 'Alta', '#E2445C', 2),           -- Vermelho
    (NEW.id, 'Crítica', '#401694', 3);        -- Roxo escuro

  return NEW;
end;
$$;

-- Trigger que executa após criar um board
create trigger create_default_board_settings_trigger
  after insert on public.boards
  for each row
  execute function public.create_default_board_settings();

-- =============================================
-- POPULAR BOARDS EXISTENTES (RETROATIVO)
-- =============================================
-- Para boards que já existem sem status/prioridades,
-- vamos criar os padrões agora

do $$
declare
  board_record record;
begin
  -- Para cada board que não tem status
  for board_record in 
    select b.id 
    from public.boards b
    where not exists (
      select 1 from public.task_statuses ts where ts.board_id = b.id
    )
  loop
    -- Criar status padrão
    insert into public.task_statuses (board_id, name, color, sort_order) values
      (board_record.id, 'A fazer', '#C4C4C4', 0),
      (board_record.id, 'Em andamento', '#FDAB3D', 1),
      (board_record.id, 'Concluído', '#00C875', 2),
      (board_record.id, 'Bloqueado', '#E2445C', 3);
  end loop;

  -- Para cada board que não tem prioridades
  for board_record in 
    select b.id 
    from public.boards b
    where not exists (
      select 1 from public.task_priorities tp where tp.board_id = b.id
    )
  loop
    -- Criar prioridades padrão
    insert into public.task_priorities (board_id, name, color, sort_order) values
      (board_record.id, 'Baixa', '#579BFC', 0),
      (board_record.id, 'Média', '#FDAB3D', 1),
      (board_record.id, 'Alta', '#E2445C', 2),
      (board_record.id, 'Crítica', '#401694', 3);
  end loop;
end;
$$;
