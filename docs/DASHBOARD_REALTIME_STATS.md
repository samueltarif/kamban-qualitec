# Dashboard com Estatísticas em Tempo Real

## Objetivo
Implementar dashboard com estatísticas reais de tarefas e subtarefas, com atualização automática em tempo real usando Supabase Realtime.

## Funcionalidades Implementadas

### ✅ 1. Estatísticas em Tempo Real
- Tarefas abertas (não concluídas)
- Tarefas em andamento (com assignee)
- Tarefas concluídas hoje
- Tarefas atrasadas (due_date no passado)
- Inclui tanto tarefas quanto subtarefas nos cálculos

### ✅ 2. Quadros Recentes
- Lista dos 5 boards mais acessados
- Nome do board e workspace
- Contagem de tarefas por board
- Link direto para cada board
- Ordenado por último acesso

### ✅ 3. Atualização Automática
- Subscrição Supabase Realtime em tasks
- Subscrição Supabase Realtime em subtasks
- Atualização instantânea quando status muda
- Cleanup automático ao desmontar componente

### ✅ 4. UX Melhorada
- Loading state durante carregamento inicial
- Empty state quando não há boards
- Saudação dinâmica (Bom dia/Boa tarde/Boa noite)
- Cards coloridos por categoria
- Hover states nos boards recentes

## Arquivos Criados/Modificados

### 1. `app/composables/useDashboard.ts` (NOVO)
**Responsabilidades:**
- Buscar estatísticas de tarefas e subtarefas
- Buscar boards recentes do usuário
- Subscrever atualizações em tempo real
- Calcular métricas (abertas, em andamento, concluídas, atrasadas)

**Funções principais:**
```typescript
fetchStats() // Busca estatísticas
fetchRecentBoards() // Busca boards recentes
subscribeToUpdates() // Subscreve realtime
```

**Lógica de cálculo:**
- Tarefas abertas: `!is_done`
- Em andamento: `!is_done && has assignee`
- Concluídas hoje: `is_done` (aproximação)
- Atrasadas: `!is_done && due_date < today`

**Realtime:**
```typescript
supabase
  .channel('dashboard-tasks')
  .on('postgres_changes', { table: 'tasks' }, () => fetchStats())
  .subscribe()
```

### 2. `app/pages/index.vue` (MODIFICADO)
**Mudanças:**
- Integração com `useDashboard` composable
- Dados reais em vez de valores estáticos
- Loading state com `LoadingState` component
- Lista de boards recentes com links
- Saudação dinâmica baseada no horário
- Empty state quando não há boards
- Cleanup de subscrições no `onUnmounted`

**Template:**
- Cards de resumo com valores dinâmicos
- Lista de boards recentes clicáveis
- Empty state ilustrado
- Loading state durante fetch inicial

## Queries Supabase

### Estatísticas de Tarefas
```sql
SELECT tasks.*
FROM tasks
INNER JOIN boards ON tasks.board_id = boards.id
INNER JOIN board_members ON boards.id = board_members.board_id
LEFT JOIN task_assignees ON tasks.id = task_assignees.task_id
WHERE board_members.user_id = :user_id
   OR task_assignees.user_id = :user_id
```

### Estatísticas de Subtarefas
```sql
SELECT subtasks.*
FROM subtasks
INNER JOIN tasks ON subtasks.task_id = tasks.id
INNER JOIN boards ON tasks.board_id = boards.id
INNER JOIN board_members ON boards.id = board_members.board_id
LEFT JOIN subtask_assignees ON subtasks.id = subtask_assignees.subtask_id
WHERE board_members.user_id = :user_id
   OR subtask_assignees.user_id = :user_id
```

### Boards Recentes
```sql
SELECT boards.*, workspaces.name, board_members.last_accessed
FROM boards
INNER JOIN board_members ON boards.id = board_members.board_id
LEFT JOIN workspaces ON boards.workspace_id = workspaces.id
WHERE board_members.user_id = :user_id
ORDER BY board_members.last_accessed DESC
LIMIT 5
```

## Realtime Subscriptions

### Tasks Channel
```typescript
supabase
  .channel('dashboard-tasks')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tasks'
  }, () => fetchStats())
  .subscribe()
```

### Subtasks Channel
```typescript
supabase
  .channel('dashboard-subtasks')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'subtasks'
  }, () => fetchStats())
  .subscribe()
```

## Comportamento

### Ao Montar
1. Busca estatísticas de tarefas/subtarefas
2. Busca boards recentes
3. Subscreve canais realtime
4. Exibe loading durante fetch inicial

### Durante Uso
1. Qualquer mudança em tasks → atualiza stats
2. Qualquer mudança em subtasks → atualiza stats
3. Atualização instantânea sem reload
4. Sem polling, apenas event-driven

### Ao Desmontar
1. Remove subscrição de tasks
2. Remove subscrição de subtasks
3. Cleanup automático de canais

## Melhorias Futuras

### Precisão de "Concluídas Hoje"
Atualmente usa aproximação. Para precisão:
1. Adicionar campo `completed_at` em tasks/subtasks
2. Filtrar por `completed_at >= today`
3. Migration necessária

### Cache e Performance
- Implementar cache local com TTL
- Debounce de atualizações realtime
- Lazy loading de boards recentes

### Filtros Adicionais
- Filtrar por workspace
- Filtrar por período (semana, mês)
- Filtrar por prioridade

### Gráficos
- Gráfico de tarefas por status
- Gráfico de produtividade semanal
- Gráfico de tarefas por board

## Teste de Aceitação

1. Abra o dashboard (/)
2. Veja estatísticas reais de tarefas
3. Veja lista de boards recentes
4. Abra outro tab e mude status de uma tarefa
5. Dashboard atualiza automaticamente (sem reload)
6. Crie uma nova tarefa
7. Contador de "Tarefas abertas" aumenta instantaneamente
8. Marque tarefa como concluída
9. Contador de "Concluídas hoje" aumenta
10. Verifique saudação muda conforme horário

## Benefícios

- Dados reais em vez de valores estáticos
- Atualização automática sem polling
- Performance otimizada (event-driven)
- UX melhorada com loading/empty states
- Inclui tarefas e subtarefas nos cálculos
- Cleanup automático de recursos
- Saudação personalizada
- Acesso rápido a boards recentes

## Segurança

- RLS policies do Supabase aplicadas
- Apenas tarefas/boards do usuário são retornadas
- Queries filtradas por `user_id`
- Realtime respeitando permissões RLS
- Sem exposição de dados de outros usuários

## Performance

- Queries otimizadas com joins
- Realtime apenas para tabelas necessárias
- Cleanup de canais ao desmontar
- Passive listeners para performance
- Computed properties para reatividade eficiente
