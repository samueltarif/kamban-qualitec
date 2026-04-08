# Design — Subtarefas (Task 5.2.10)

## Arquitetura

### Camadas

```
TaskModal.vue (UI)
    ↓
useSubtasks.ts (Composable - Lógica de negócio)
    ↓
Supabase (Backend - RLS + Triggers)
```

### Fluxo de Dados

1. **Carregamento**: TaskModal monta → useSubtasks.fetchSubtasks(taskId) → Supabase query
2. **Criação**: Input Enter → useSubtasks.createSubtask() → Otimistic UI → Supabase insert
3. **Toggle**: Checkbox click → useSubtasks.toggleSubtask() → Otimistic UI → Supabase update
4. **Edição**: Blur/Enter → useSubtasks.updateSubtask() → Otimistic UI → Supabase update
5. **Exclusão**: Confirm → useSubtasks.deleteSubtask() → Otimistic UI → Supabase delete

## Estrutura de Componentes

### TaskModal.vue (Modificação)

Adicionar seção de subtarefas após a descrição:

```vue
<template>
  <!-- ... campos existentes ... -->

  <!-- Seção de Subtarefas -->
  <div class="pt-4 border-t border-neutral-200">
    <SubtasksSection :task-id="taskId" :board-id="boardId" />
  </div>

  <!-- Anexos -->
  <div class="pt-4 border-t border-neutral-200">
    <TaskAttachmentsManager :task-id="taskId" :board-id="boardId" />
  </div>
</template>
```

### SubtasksSection.vue (Novo Componente)

```vue
<template>
  <div class="space-y-3">
    <!-- Header com contador -->
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold text-neutral-700">
        Subtarefas
        <span v-if="subtasks.length > 0" class="text-neutral-400 font-normal">
          ({{ completedCount }}/{{ subtasks.length }})
        </span>
      </h3>
      
      <!-- Barra de progresso (opcional) -->
      <div v-if="subtasks.length > 0" class="w-24 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div 
          class="h-full bg-primary-500 transition-all duration-300"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </div>

    <!-- Input para criar nova subtarefa -->
    <div v-if="canEdit" class="flex items-center gap-2">
      <input
        v-model="newSubtaskTitle"
        type="text"
        placeholder="Adicionar subitem..."
        class="flex-1 text-sm border border-neutral-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-400 min-h-[44px]"
        @keydown.enter.prevent="handleCreate"
      />
      <button
        v-if="newSubtaskTitle.trim()"
        type="button"
        class="px-4 py-2.5 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors min-h-[44px]"
        :disabled="creating"
        @click="handleCreate"
      >
        {{ creating ? 'Criando...' : 'Adicionar' }}
      </button>
    </div>

    <!-- Lista de subtarefas -->
    <div v-if="subtasks.length > 0" class="space-y-2">
      <SubtaskItem
        v-for="subtask in sortedSubtasks"
        :key="subtask.id"
        :subtask="subtask"
        :can-edit="canEdit"
        @toggle="handleToggle"
        @update="handleUpdate"
        @delete="handleDelete"
      />
    </div>

    <!-- Estado vazio -->
    <p v-else class="text-sm text-neutral-400 italic py-2">
      Nenhuma subtarefa ainda
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSubtasks } from '~/composables/useSubtasks'
import { useBoardPermissions } from '~/composables/useBoardPermissions'

const props = defineProps<{
  taskId: string
  boardId: string
}>()

const { canEdit } = useBoardPermissions(props.boardId)
const {
  subtasks,
  loading,
  creating,
  fetchSubtasks,
  createSubtask,
  toggleSubtask,
  updateSubtask,
  deleteSubtask,
} = useSubtasks(props.taskId)

const newSubtaskTitle = ref('')

const sortedSubtasks = computed(() => 
  [...subtasks.value].sort((a, b) => a.sort_order - b.sort_order)
)

const completedCount = computed(() => 
  subtasks.value.filter(s => s.is_done).length
)

const progressPercent = computed(() => 
  subtasks.value.length > 0 
    ? Math.round((completedCount.value / subtasks.value.length) * 100)
    : 0
)

async function handleCreate() {
  const title = newSubtaskTitle.value.trim()
  if (!title) return
  
  await createSubtask(title)
  newSubtaskTitle.value = ''
}

async function handleToggle(subtaskId: string, isDone: boolean) {
  await toggleSubtask(subtaskId, isDone)
}

async function handleUpdate(subtaskId: string, title: string) {
  await updateSubtask(subtaskId, { title })
}

async function handleDelete(subtaskId: string) {
  await deleteSubtask(subtaskId)
}

// Carregar subtarefas ao montar
onMounted(() => {
  fetchSubtasks()
})
</script>
```

### SubtaskItem.vue (Novo Componente)

```vue
<template>
  <div 
    class="flex items-start gap-3 p-2 rounded-lg hover:bg-neutral-50 transition-colors group"
    :class="{ 'opacity-60': subtask.is_done }"
  >
    <!-- Checkbox -->
    <input
      type="checkbox"
      :checked="subtask.is_done"
      :disabled="!canEdit"
      class="mt-1 w-5 h-5 rounded border-neutral-300 text-primary-500 focus:ring-2 focus:ring-primary-400 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
      :aria-label="`Marcar '${subtask.title}' como ${subtask.is_done ? 'não concluída' : 'concluída'}`"
      @change="$emit('toggle', subtask.id, !subtask.is_done)"
    />

    <!-- Título editável -->
    <div class="flex-1 min-w-0">
      <input
        v-if="isEditing"
        ref="editInput"
        v-model="editTitle"
        type="text"
        class="w-full text-sm border border-primary-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-400"
        @blur="saveEdit"
        @keydown.enter.prevent="saveEdit"
        @keydown.esc.prevent="cancelEdit"
      />
      <p
        v-else
        class="text-sm text-neutral-700 cursor-text select-none"
        :class="{ 'line-through text-neutral-400': subtask.is_done }"
        @click="canEdit && startEdit()"
      >
        {{ subtask.title }}
      </p>
    </div>

    <!-- Botão de exclusão -->
    <button
      v-if="canEdit"
      type="button"
      class="opacity-0 group-hover:opacity-100 sm:opacity-100 p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
      aria-label="Excluir subtarefa"
      @click="confirmDelete"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>

  <!-- Modal de confirmação de exclusão -->
  <BaseModal v-model="showDeleteConfirm" title="Excluir subitem?" size="sm">
    <p class="text-sm text-neutral-600">
      Tem certeza que deseja excluir o subitem <span class="font-semibold">"{{ subtask.title }}"</span>?
    </p>
    <p class="text-sm text-neutral-500 mt-2">
      Esta ação não pode ser desfeita.
    </p>

    <template #footer>
      <BaseButton variant="ghost" @click="showDeleteConfirm = false">Cancelar</BaseButton>
      <BaseButton variant="danger" @click="handleDelete">Excluir</BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import type { Tables } from '~/shared/types/database'

type Subtask = Tables<'subtasks'>

const props = defineProps<{
  subtask: Subtask
  canEdit: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle', id: string, isDone: boolean): void
  (e: 'update', id: string, title: string): void
  (e: 'delete', id: string): void
}>()

const isEditing = ref(false)
const editTitle = ref('')
const editInput = ref<HTMLInputElement | null>(null)
const showDeleteConfirm = ref(false)

function startEdit() {
  if (!props.canEdit) return
  editTitle.value = props.subtask.title
  isEditing.value = true
  nextTick(() => {
    editInput.value?.focus()
    editInput.value?.select()
  })
}

function saveEdit() {
  const title = editTitle.value.trim()
  if (!title || title === props.subtask.title) {
    cancelEdit()
    return
  }
  emit('update', props.subtask.id, title)
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
  editTitle.value = ''
}

function confirmDelete() {
  showDeleteConfirm.value = true
}

function handleDelete() {
  emit('delete', props.subtask.id)
  showDeleteConfirm.value = false
}
</script>
```

## Composable: useSubtasks.ts

```typescript
import { ref, computed } from 'vue'
import type { Tables } from '~/shared/types/database'

type Subtask = Tables<'subtasks'>

export function useSubtasks(taskId: string) {
  const supabase = useNuxtApp().$supabase as any
  
  const subtasks = ref<Subtask[]>([])
  const loading = ref(false)
  const creating = ref(false)
  const error = ref<string | null>(null)

  async function fetchSubtasks() {
    loading.value = true
    error.value = null
    
    try {
      const { data, error: fetchError } = await supabase
        .from('subtasks')
        .select('*')
        .eq('task_id', taskId)
        .order('sort_order', { ascending: true })
      
      if (fetchError) throw fetchError
      subtasks.value = data || []
    } catch (err: any) {
      console.error('Erro ao buscar subtarefas:', err)
      error.value = err.message
      subtasks.value = []
    } finally {
      loading.value = false
    }
  }

  async function createSubtask(title: string) {
    if (!title.trim()) return
    
    creating.value = true
    error.value = null
    
    // Calcular próximo sort_order
    const maxOrder = subtasks.value.length > 0
      ? Math.max(...subtasks.value.map(s => s.sort_order))
      : -1
    
    const newSubtask: Partial<Subtask> = {
      task_id: taskId,
      title: title.trim(),
      is_done: false,
      sort_order: maxOrder + 1,
    }
    
    try {
      const { data, error: insertError } = await supabase
        .from('subtasks')
        .insert(newSubtask)
        .select()
        .single()
      
      if (insertError) throw insertError
      
      // Atualização otimista
      subtasks.value.push(data)
    } catch (err: any) {
      console.error('Erro ao criar subtarefa:', err)
      error.value = err.message
    } finally {
      creating.value = false
    }
  }

  async function toggleSubtask(subtaskId: string, isDone: boolean) {
    // Atualização otimista
    const index = subtasks.value.findIndex(s => s.id === subtaskId)
    if (index === -1) return
    
    const oldValue = subtasks.value[index].is_done
    subtasks.value[index].is_done = isDone
    
    try {
      const { error: updateError } = await supabase
        .from('subtasks')
        .update({ is_done: isDone })
        .eq('id', subtaskId)
      
      if (updateError) throw updateError
    } catch (err: any) {
      console.error('Erro ao atualizar subtarefa:', err)
      // Reverter otimismo
      subtasks.value[index].is_done = oldValue
      error.value = err.message
    }
  }

  async function updateSubtask(subtaskId: string, updates: Partial<Subtask>) {
    const index = subtasks.value.findIndex(s => s.id === subtaskId)
    if (index === -1) return
    
    const oldValue = { ...subtasks.value[index] }
    
    // Atualização otimista
    Object.assign(subtasks.value[index], updates)
    
    try {
      const { error: updateError } = await supabase
        .from('subtasks')
        .update(updates)
        .eq('id', subtaskId)
      
      if (updateError) throw updateError
    } catch (err: any) {
      console.error('Erro ao atualizar subtarefa:', err)
      // Reverter otimismo
      subtasks.value[index] = oldValue
      error.value = err.message
    }
  }

  async function deleteSubtask(subtaskId: string) {
    const index = subtasks.value.findIndex(s => s.id === subtaskId)
    if (index === -1) return
    
    const removed = subtasks.value.splice(index, 1)[0]
    
    try {
      const { error: deleteError } = await supabase
        .from('subtasks')
        .delete()
        .eq('id', subtaskId)
      
      if (deleteError) throw deleteError
    } catch (err: any) {
      console.error('Erro ao excluir subtarefa:', err)
      // Reverter otimismo
      subtasks.value.splice(index, 0, removed)
      error.value = err.message
    }
  }

  return {
    subtasks,
    loading,
    creating,
    error,
    fetchSubtasks,
    createSubtask,
    toggleSubtask,
    updateSubtask,
    deleteSubtask,
  }
}
```

## Segurança: RLS Policies

Verificar se as policies existentes cobrem subtasks. Se não, criar migration:

```sql
-- Migration: 20260408000001_add_subtasks_rls.sql

-- Policy: SELECT (todos os membros do board podem ver)
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

-- Policy: INSERT (apenas owner e editor)
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

-- Policy: UPDATE (apenas owner e editor)
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

-- Policy: DELETE (apenas owner e editor)
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
```

## Auditoria (Opcional)

Adicionar trigger para logar criação/edição/exclusão de subtarefas:

```sql
-- Trigger para auditoria de subtarefas
create or replace function public.log_subtask_activity()
returns trigger language plpgsql security definer as $$
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
      'is_done', NEW.is_done
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
```

## Padrões de Design

### Mobile-First
- Touch targets: 44px mínimo
- Botões sempre visíveis em mobile (sem hover)
- Input com font-size >= 16px para evitar zoom no iOS

### Otimistic UI
- Atualizar estado local imediatamente
- Reverter em caso de erro
- Feedback visual discreto (sem toasts excessivos)

### Acessibilidade
- Labels em checkboxes
- Aria-labels em botões de ação
- Navegação por teclado (Tab, Enter, Esc)
- Foco visível

### Inspiração Monday.com
- Checkbox à esquerda
- Título editável inline
- Contador de progresso no header
- Barra de progresso visual (opcional)
- Botão trash no hover
