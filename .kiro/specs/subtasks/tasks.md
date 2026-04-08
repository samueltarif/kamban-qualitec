# Plano de Implementação — Subtarefas (Task 5.2.10)

## Visão Geral

Implementação completa do sistema de subtarefas dentro do TaskModal, incluindo criação, edição, toggle de conclusão, exclusão e controle de permissões.

---

## Tarefas

### 1. Verificar e criar RLS policies para subtasks
- [ ] 1.1 Verificar policies existentes na tabela `subtasks`
  - Usar `mcp_supabase_list_tables` com verbose=true
  - Verificar se RLS está habilitado
  - _Requisitos: RNF1.1, RNF1.2, RNF1.3_

- [ ] 1.2 Criar migration com policies de segurança
  - Criar `supabase/migrations/20260408000001_add_subtasks_rls.sql`
  - Policy SELECT: todos os membros do board
  - Policy INSERT/UPDATE/DELETE: apenas owner e editor
  - Verificar join com tasks → board_members → access_role
  - _Requisitos: RNF1.1, RNF1.2, RNF1.3_

- [ ] 1.3 Aplicar migration no Supabase
  - Usar `mcp_supabase_apply_migration`
  - Validar que policies foram criadas
  - _Requisitos: RNF1.1_

### 2. Criar composable useSubtasks
- [ ] 2.1 Criar `app/composables/useSubtasks.ts`
  - Aceitar `taskId` como parâmetro
  - Estado reativo: `subtasks`, `loading`, `creating`, `error`
  - _Requisitos: RF1.1, RNF2.1_

- [ ] 2.2 Implementar `fetchSubtasks()`
  - Query Supabase: select * from subtasks where task_id = ?
  - Order by sort_order ASC
  - Tratar erro sem lançar exceção
  - _Requisitos: RF1.1, RNF2.1_

- [ ] 2.3 Implementar `createSubtask(title: string)`
  - Validar título não vazio
  - Calcular próximo sort_order (max + 1)
  - Insert no Supabase
  - Atualização otimista da lista local
  - _Requisitos: RF3.1, RF3.2, RF3.4, RF3.5, RNF2.2_

- [ ] 2.4 Implementar `toggleSubtask(id: string, isDone: boolean)`
  - Update is_done no Supabase
  - Atualização otimista
  - Reverter em caso de erro
  - _Requisitos: RF5.1, RF5.4, RNF2.2_

- [ ] 2.5 Implementar `updateSubtask(id: string, updates: Partial<Subtask>)`
  - Update campos no Supabase
  - Atualização otimista
  - Reverter em caso de erro
  - _Requisitos: RF4.1, RF4.2, RNF2.2_

- [ ] 2.6 Implementar `deleteSubtask(id: string)`
  - Delete no Supabase
  - Remover da lista local imediatamente
  - Reverter em caso de erro
  - _Requisitos: RF6.3, RF6.4, RNF2.2_

### 3. Criar componente SubtaskItem
- [ ] 3.1 Criar `app/components/SubtaskItem.vue`
  - Props: `subtask`, `canEdit`
  - Emits: `toggle`, `update`, `delete`
  - _Requisitos: RF2.4_

- [ ] 3.2 Implementar checkbox de conclusão
  - Input type="checkbox" com :checked="subtask.is_done"
  - Disabled quando !canEdit
  - Emit 'toggle' no @change
  - Aria-label descritivo
  - _Requisitos: RF5.1, RF5.2, RNF3.1, RNF4.1_

- [ ] 3.3 Implementar título editável inline
  - Click ativa modo de edição (input)
  - Enter salva, Esc cancela
  - Blur salva alteração
  - Validar título não vazio
  - Estilo line-through quando is_done=true
  - _Requisitos: RF4.1, RF4.2, RF4.3, RF4.4, RF5.2_

- [ ] 3.4 Implementar botão de exclusão
  - Ícone trash visível no hover (desktop) ou sempre (mobile)
  - Min-width e min-height 44px
  - Click abre modal de confirmação
  - _Requisitos: RF6.1, RF6.2, RNF3.1_

- [ ] 3.5 Implementar modal de confirmação de exclusão
  - Usar BaseModal size="sm"
  - Exibir título da subtarefa
  - Botões: Cancelar e Excluir (danger)
  - Emit 'delete' ao confirmar
  - _Requisitos: RF6.2, RF6.3_

### 4. Criar componente SubtasksSection
- [ ] 4.1 Criar `app/components/SubtasksSection.vue`
  - Props: `taskId`, `boardId`
  - Usar `useSubtasks(taskId)` e `useBoardPermissions(boardId)`
  - _Requisitos: RF2.1_

- [ ] 4.2 Implementar header com contador
  - Título "Subtarefas"
  - Contador "(X/Y)" quando lista não vazia
  - Barra de progresso visual (opcional)
  - _Requisitos: RF2.2, RF7.1, RF7.2, RF7.3_

- [ ] 4.3 Implementar input de criação
  - Placeholder "Adicionar subitem..."
  - Visível apenas quando canEdit=true
  - Enter chama createSubtask()
  - Limpar input após criação
  - Botão "Adicionar" visível quando input não vazio
  - _Requisitos: RF2.3, RF3.1, RF3.3, RNF3.1_

- [ ] 4.4 Implementar lista de subtarefas
  - Renderizar SubtaskItem para cada subtask
  - Ordenar por sort_order
  - Passar canEdit como prop
  - Handlers para toggle, update, delete
  - _Requisitos: RF2.4_

- [ ] 4.5 Implementar estado vazio
  - Exibir "Nenhuma subtarefa ainda" quando lista vazia
  - _Requisitos: RF2.5_

- [ ] 4.6 Carregar subtarefas ao montar
  - onMounted(() => fetchSubtasks())
  - _Requisitos: RNF2.1_

### 5. Integrar SubtasksSection no TaskModal
- [ ] 5.1 Importar SubtasksSection em TaskModal.vue
  - Import explícito (não auto-import)
  - _Requisitos: RF2.1_

- [ ] 5.2 Adicionar seção após descrição
  - Inserir antes da seção de anexos
  - Passar taskId e boardId como props
  - Adicionar border-top para separação visual
  - _Requisitos: RF2.1_

### 6. Criar migration de auditoria (opcional)
- [ ] 6.1 Criar trigger `log_subtask_activity()`
  - Logar INSERT, UPDATE, DELETE
  - Inserir em activity_logs
  - Detectar subtask_created, subtask_completed, subtask_reopened, subtask_updated, subtask_deleted
  - _Requisitos: (opcional - não bloqueia MVP)_

### 7. Testes e validação
- [ ] 7.1 Testar criação de subtarefa
  - Como editor: criar subtarefa com sucesso
  - Como viewer: input não aparece
  - Validar título vazio não cria
  - Validar contador atualiza

- [ ] 7.2 Testar toggle de conclusão
  - Marcar como concluída: texto fica riscado
  - Desmarcar: texto volta ao normal
  - Contador atualiza em tempo real
  - Viewer não consegue clicar no checkbox

- [ ] 7.3 Testar edição inline
  - Click no título ativa edição
  - Enter salva, Esc cancela
  - Blur salva alteração
  - Título vazio não salva

- [ ] 7.4 Testar exclusão
  - Botão trash abre modal
  - Cancelar fecha modal sem excluir
  - Confirmar remove subtarefa
  - Viewer não vê botão trash

- [ ] 7.5 Testar mobile
  - Touch targets >= 44px
  - Botões visíveis sem hover
  - Input funciona com teclado virtual
  - Scroll funciona corretamente

- [ ] 7.6 Testar permissões
  - Owner: todas as operações
  - Editor: todas as operações
  - Viewer: apenas visualização
  - Guest: apenas visualização
  - Observer: apenas visualização

### 8. Checkpoint final
- [ ] 8.1 Verificar todos os critérios de aceite
  - Revisar lista de CA1 a CA6 em requirements.md
  - Validar cada item

- [ ] 8.2 Executar getDiagnostics
  - Verificar erros de TypeScript
  - Corrigir warnings

- [ ] 8.3 Testar em diferentes navegadores
  - Chrome, Firefox, Safari
  - Mobile: iOS Safari, Chrome Android

- [ ] 8.4 Documentar mudanças
  - Atualizar backlog (marcar 5.2.10 como ✅)
  - Commit com mensagem descritiva

---

## Ordem de Execução Recomendada

1. **Segurança primeiro**: Tarefas 1.1 → 1.2 → 1.3 (RLS policies)
2. **Lógica de negócio**: Tarefas 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 (composable)
3. **Componentes**: Tarefas 3.1 → 3.2 → 3.3 → 3.4 → 3.5 (SubtaskItem)
4. **Container**: Tarefas 4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.6 (SubtasksSection)
5. **Integração**: Tarefas 5.1 → 5.2 (TaskModal)
6. **Auditoria** (opcional): Tarefa 6.1
7. **Validação**: Tarefas 7.1 → 7.2 → 7.3 → 7.4 → 7.5 → 7.6
8. **Finalização**: Tarefas 8.1 → 8.2 → 8.3 → 8.4

---

## Notas

- Seguir padrão mobile-first em todos os componentes
- Usar design tokens do projeto (`tokens.css`, `tailwind.config.ts`)
- Imports explícitos (nunca auto-imports)
- Atualização otimista para melhor UX
- RLS policies são críticas — não pular tarefa 1
- Auditoria (tarefa 6) é opcional para MVP, mas recomendada
