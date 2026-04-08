-- Adicionar policy para permitir leitura de logs de atividade de subtarefas
-- Membros do board podem ver logs de subtarefas das tarefas do board

CREATE POLICY "activity_logs: board members can read subtask logs"
ON public.activity_logs
FOR SELECT
USING (
  entity_type = 'subtask'
  AND entity_id IN (
    SELECT s.id
    FROM subtasks s
    JOIN tasks t ON t.id = s.task_id
    JOIN board_members bm ON bm.board_id = t.board_id
    WHERE bm.user_id = auth.uid()
  )
);

-- Adicionar policy para permitir inserção de logs de atividade de subtarefas
-- Owner/editor podem criar logs de subtarefas

CREATE POLICY "activity_logs: owner/editor can create subtask logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (
  entity_type = 'subtask'
  AND entity_id IN (
    SELECT s.id
    FROM subtasks s
    JOIN tasks t ON t.id = s.task_id
    JOIN board_members bm ON bm.board_id = t.board_id
    WHERE bm.user_id = auth.uid()
    AND bm.access_role IN ('owner', 'editor')
  )
);

-- Comentários
COMMENT ON POLICY "activity_logs: board members can read subtask logs" ON public.activity_logs IS 
'Permite que membros do board vejam logs de atividade de subtarefas';

COMMENT ON POLICY "activity_logs: owner/editor can create subtask logs" ON public.activity_logs IS 
'Permite que owner/editor criem logs de atividade de subtarefas';
