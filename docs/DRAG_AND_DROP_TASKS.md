# Drag and Drop de Tarefas

## Visão Geral

Implementação de reordenação de tarefas dentro do mesmo grupo através de drag and drop, seguindo o padrão Monday.com.

## Funcionalidades

### Desktop
- Arraste tarefas pelo handle (ícone de 6 pontos) que aparece ao passar o mouse
- Solte a tarefa sobre outra para reposicionar
- Feedback visual durante o arraste (opacidade reduzida)
- Indicador visual da posição de drop (borda superior azul)

### Mobile
- Drag and drop desabilitado em mobile (< 1024px)
- Prioridade para scroll horizontal para visualizar colunas
- Evita conflito entre gestos de arraste e scroll

## Arquitetura

### Frontend

#### Componentes
- `TaskRow.vue`: Adiciona handle de drag (desktop only) e emite eventos
- `app/pages/boards/[id].vue`: Gerencia estado de drag e coordena reordenação

#### Composables
- `useTasks.ts`: Função `reorderTasks()` para persistir nova ordem
- `useBoardData.ts`: Carrega tarefas ordenadas por `position`

### Backend

#### API Endpoint
- `POST /api/tasks/reorder`
- Valida entrada com Zod
- Verifica permissões (master, owner, editor)
- Atualiza posições em batch

#### Segurança
- RLS policies verificam organização e role
- Validação de que todas as tarefas pertencem ao mesmo grupo
- Verificação de permissões no board antes de atualizar

### Banco de Dados

#### Estrutura
- Coluna `position` (int) na tabela `tasks`
- Índice composto `idx_tasks_group_position` para performance

#### Ordenação
- Tarefas sempre carregadas com `ORDER BY position ASC`
- Posições atualizadas sequencialmente (0, 1, 2, ...)

## Fluxo de Reordenação

1. Usuário arrasta tarefa pelo handle (desktop)
2. Frontend atualiza array localmente (optimistic update)
3. Chama API `/api/tasks/reorder` com nova ordem
4. Backend valida permissões e atualiza posições
5. Em caso de erro, frontend faz rollback recarregando do banco

## Segurança

### Validações
- ✅ Usuário autenticado
- ✅ Todas as tarefas pertencem ao mesmo grupo
- ✅ Usuário tem permissão de edição no board
- ✅ Tarefas pertencem à organização do usuário

### RLS Policies
- Política `tasks: collaborator+ manages in org boards` garante acesso apenas a boards da organização
- Verificação adicional no endpoint para roles owner/editor

## Performance

### Otimizações
- Índice composto `(group_id, position)` para queries rápidas
- Cache com stale-while-revalidate em `useBoardData`
- Optimistic updates no frontend
- Batch update de posições no backend

### Considerações
- Reordenação dentro do mesmo grupo (não entre grupos)
- Posições recalculadas sequencialmente a cada reordenação
- Sem gaps nas posições

## Mobile-First

### Decisões de Design
- Drag desabilitado em mobile para evitar conflito com scroll horizontal
- Handle visível apenas em desktop (lg:flex)
- Touch targets adequados (min 44px)
- Scroll horizontal prioritário em telas pequenas

## Testes

### Casos de Teste
- [ ] Arrastar tarefa para cima dentro do grupo
- [ ] Arrastar tarefa para baixo dentro do grupo
- [ ] Arrastar primeira tarefa para última posição
- [ ] Arrastar última tarefa para primeira posição
- [ ] Verificar persistência após reload
- [ ] Verificar rollback em caso de erro de rede
- [ ] Verificar que usuário sem permissão não pode reordenar
- [ ] Verificar que mobile não ativa drag (apenas scroll)

## Próximos Passos

### Melhorias Futuras
- [ ] Drag and drop entre grupos diferentes
- [ ] Animações suaves de transição
- [ ] Undo/redo de reordenação
- [ ] Drag and drop em mobile com long press
- [ ] Suporte a multi-seleção de tarefas

## Referências

- Inspiração: Monday.com task reordering
- Padrão: Drag handle explícito (não drag no corpo inteiro)
- Acessibilidade: Handle visível no hover, cursor grab/grabbing
