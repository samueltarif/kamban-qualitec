-- Adicionar campos faltantes na tabela subtasks
ALTER TABLE public.subtasks
ADD COLUMN IF NOT EXISTS status_id uuid REFERENCES public.task_statuses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS priority_id uuid REFERENCES public.task_priorities(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER subtasks_updated_at
  BEFORE UPDATE ON public.subtasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Comentários
COMMENT ON COLUMN public.subtasks.status_id IS 'Status da subtarefa (referência a task_statuses)';
COMMENT ON COLUMN public.subtasks.priority_id IS 'Prioridade da subtarefa (referência a task_priorities)';
COMMENT ON COLUMN public.subtasks.due_date IS 'Data de vencimento da subtarefa';
COMMENT ON COLUMN public.subtasks.notes IS 'Notas/descrição da subtarefa';
COMMENT ON COLUMN public.subtasks.updated_at IS 'Data da última atualização';
