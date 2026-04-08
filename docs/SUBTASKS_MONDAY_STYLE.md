# Sistema de Subtarefas Estilo Monday.com

## Visão Geral

Refatoração completa do sistema de subtarefas para replicar a UX do Monday.com, com tabela aninhada, células editáveis inline, e painel lateral de detalhes.

## Arquitetura

### Componentes Criados

1. **SubtaskRow.vue** - Linha individual de subtarefa
   - Checkbox para marcar como concluída
   - Título editável inline
   - Células dinâmicas (Status, Assignee, Date, Attachments, Priority)
   - Botões de ação (abrir detalhes, deletar)
   - Scroll horizontal em mobile
   - Reaproveitamento dos renderizadores de células existentes

2. **SubtasksTable.vue** - Tabela aninhada de subtarefas
   - Cabeçalho alinhado com as colunas do board
   - Lista de subtarefas ordenadas
   - Input inline para criação rápida
   - Expand/collapse controlado pela tarefa pai
   - Background diferenciado (azul claro)
   - Borda lateral para hierarquia visual

3. **SubtaskDetailPanel.vue** - Painel lateral de detalhes
   - Drawer lateral (BaseDrawer)
   - Todos os campos editáveis
   - Histórico de atividades
   - Botão de deletar
   - Carregamento lazy dos dados

### Componentes Modificados

1. **TaskRow.vue**
   - Botão expand/collapse (seta rotativa)
   - Integração com SubtasksTable
   - Integração com SubtaskDetailPanel
   - Carregamento de subtarefas ao montar
   - Indicador visual de tarefas com subtarefas

## Funcionalidades Implementadas

### ✅ Expand/Collapse da Tarefa Pai
- Botão com seta que rotaciona 90° ao expandir
- Só aparece se a tarefa tiver subtarefas
- Estado local (não persiste no backend)
- Carregamento lazy das subtarefas

### ✅ Subtabela Aninhada
- Aparece abaixo da tarefa pai quando expandida
- Background azul claro para diferenciação
- Borda lateral azul para hierarquia visual
- Alinhamento perfeito com as colunas do board

### ✅ Cabeçalho de Subtarefas
- Headers alinhados com as colunas visíveis
- Labels traduzidos (Owner, Status, Date, Arquivos, Priority)
- Scroll horizontal sincronizado
- Estilo diferenciado (uppercase, menor, cinza)

### ✅ Linhas de Subtarefa Editáveis
- Checkbox para marcar como concluída
- Título editável inline (click para editar)
- Células dinâmicas baseadas nas colunas visíveis do board
- Hover state com botões de ação
- Seleção visual quando detalhes estão abertos

### ✅ Criação Rápida de Subtarefa
- Input inline no final da tabela
- Placeholder "Adicionar subelemento"
- Enter para salvar, Esc para cancelar
- Botão "+" quando não está criando
- Desabilitado se não tiver permissão de edição

### ✅ Painel Lateral de Detalhes
- Drawer lateral (tamanho lg)
- Título editável
- Todos os campos da subtarefa
- Área de notas (textarea)
- Histórico de atividades
- Botão de deletar
- Confirmação antes de deletar

### ✅ Menus Funcionais
- Status: dropdown com cores
- Assignee: seletor de pessoas
- Date: date picker
- Attachments: gerenciador de arquivos
- Priority: seletor de prioridade
- Todos reutilizam os componentes existentes

### ✅ Hierarquia Visual Clara
- Borda lateral azul na tabela de subtarefas
- Background azul claro diferenciado
- Indentação visual
- Seta de expand/collapse
- Espaçamento adequado

### ✅ Responsividade
- Scroll horizontal real no mobile
- Snap points para navegação suave
- Gradiente indicador de scroll
- Botões com tamanho mínimo de toque (44px)
- Drawer full-screen em mobile

### ✅ Reaproveitamento de Células
- StatusCell
- AssigneeCell
- DueDateCell
- AttachmentsCell
- PriorityCell
- Todos com prop `is-subtask` para ajustes

### ✅ Código Modular e Tipado
- TypeScript em todos os componentes
- Props e emits tipados
- Composables reutilizados (useSubtasks, useBoardColumns)
- Separação clara de responsabilidades

## Estrutura de Dados

### Subtask (tabela `subtasks`)
```typescript
{
  id: string
  task_id: string
  title: string
  is_done: boolean
  sort_order: number
  status_id: string | null
  priority_id: string | null
  due_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
```

## Fluxo de Dados

1. **Carregamento**
   - TaskRow monta e carrega subtarefas (fetchSubtasks)
   - Se tiver subtarefas, mostra botão de expand
   - Ao expandir, SubtasksTable carrega dados se necessário

2. **Edição Inline**
   - SubtaskRow emite eventos de update
   - SubtasksTable chama useSubtasks.updateSubtask
   - Backend atualiza e retorna sucesso
   - UI reflete mudança imediatamente (optimistic)

3. **Criação**
   - Input inline em SubtasksTable
   - Enter chama useSubtasks.createSubtask
   - Nova subtarefa aparece na lista
   - Input limpa e fecha

4. **Detalhes**
   - Click no botão abre SubtaskDetailPanel
   - Panel carrega dados completos da subtarefa
   - Edições salvam automaticamente (blur/enter)
   - Histórico de atividades carrega separadamente

5. **Deleção**
   - Confirmação antes de deletar
   - useSubtasks.deleteSubtask
   - Subtarefa removida da lista
   - Se era a última, botão de expand desaparece

## Comparação com Monday.com

### ✅ Reproduzido
- [x] Botão expand/collapse com seta rotativa
- [x] Subtabela aninhada com background diferenciado
- [x] Cabeçalho alinhado com colunas
- [x] Células editáveis inline
- [x] Checkbox para marcar como concluída
- [x] Input de criação rápida
- [x] Painel lateral de detalhes
- [x] Menus dropdown para status, pessoa, etc.
- [x] Hierarquia visual clara
- [x] Scroll horizontal em mobile
- [x] Reaproveitamento de células
- [x] Hover states e botões de ação

### 🔄 Adaptado
- Cores e estilos seguem o design system do projeto
- Labels em português
- Sem branding do Monday.com
- Estrutura de dados própria

### ❌ Não Implementado (fora do escopo)
- Drag and drop de subtarefas
- Conversão de subtarefa em tarefa
- Duplicação de subtarefas
- Filtros específicos de subtarefas
- Agrupamento de subtarefas
- Automações

## Próximos Passos

1. Testar em diferentes resoluções
2. Adicionar testes unitários
3. Otimizar performance (virtualização se necessário)
4. Adicionar animações de transição
5. Implementar drag and drop de subtarefas
6. Adicionar atalhos de teclado

## Arquivos Criados/Modificados

### Criados
- `app/components/SubtaskRow.vue`
- `app/components/SubtasksTable.vue`
- `app/components/SubtaskDetailPanel.vue`
- `docs/SUBTASKS_MONDAY_STYLE.md`

### Modificados
- `app/components/TaskRow.vue`

### Reutilizados
- `app/components/StatusCell.vue`
- `app/components/AssigneeCell.vue`
- `app/components/DueDateCell.vue`
- `app/components/AttachmentsCell.vue`
- `app/components/PriorityCell.vue`
- `app/components/BaseDrawer.vue`
- `app/components/TaskActivityHistory.vue`
- `app/composables/useSubtasks.ts`
- `app/composables/useBoardColumns.ts`
- `app/composables/useBoardPermissions.ts`

## Principais Trechos de Código

### 1. Botão Expand/Collapse (TaskRow.vue)
```vue
<button
  v-if="hasSubtasks"
  type="button"
  class="flex-shrink-0 p-0.5 text-neutral-400 hover:text-neutral-700 transition-transform"
  :class="{ 'rotate-90': isExpanded }"
  @click="toggleExpand"
>
  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
  </svg>
</button>
```

### 2. Tabela Aninhada (SubtasksTable.vue)
```vue
<div v-if="isExpanded" class="bg-blue-50/20 border-l-4 border-primary-400">
  <!-- Cabeçalho alinhado -->
  <div class="flex items-center gap-2 px-4 py-2 bg-neutral-50/80">
    <!-- Headers dinâmicos -->
  </div>
  
  <!-- Linhas de subtarefas -->
  <SubtaskRow v-for="subtask in sortedSubtasks" :key="subtask.id" />
  
  <!-- Input de criação -->
  <input v-if="isCreating" @keydown.enter="saveNewSubtask" />
</div>
```

### 3. Célula Editável (SubtaskRow.vue)
```vue
<input
  v-if="isEditingTitle"
  v-model="localTitle"
  @blur="saveTitle"
  @keydown.enter="saveTitle"
  @keydown.esc="cancelEdit"
/>
<div v-else @click="startEditTitle">
  {{ subtask.title }}
</div>
```

### 4. Painel de Detalhes (SubtaskDetailPanel.vue)
```vue
<BaseDrawer :model-value="modelValue" title="Detalhes da Subtarefa" size="lg">
  <div class="space-y-6">
    <!-- Campos editáveis -->
    <StatusCell :task-id="subtaskId" :is-subtask="true" />
    <AssigneeCell :task-id="subtaskId" :is-subtask="true" />
    <!-- ... -->
  </div>
</BaseDrawer>
```

## Performance

- Carregamento lazy de subtarefas
- Renderização condicional (v-if para tabela expandida)
- Eventos debounced para edição inline
- Scroll virtual se necessário (futuro)
- Memoização de computed properties

## Acessibilidade

- Botões com tamanho mínimo de toque (44px)
- Labels semânticos
- Navegação por teclado (Enter, Esc)
- Contraste adequado de cores
- Focus states visíveis
- ARIA labels onde necessário

## Segurança

- Validação de permissões (canEdit)
- Sanitização de inputs
- Confirmação antes de deletar
- RLS policies no Supabase
- Autenticação em todas as operações
