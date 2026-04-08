# Requisitos — Subtarefas (Task 5.2.10)

## Visão Geral

Implementar funcionalidade de criação e gerenciamento de subtarefas dentro do modal de tarefa. Subtarefas permitem quebrar entregas em partes menores e rastrear progresso granular.

## Contexto

- **Tarefa do Backlog**: 5.2.10 — Criar subtarefa
- **Dependências**: 2.1.11 (tabela subtasks ✅), 5.1.3 (TaskModal ✅)
- **Prioridade**: Alta
- **Inspiração**: Monday.com (subitems com checkbox inline)

## Objetivos

1. Permitir criar subtarefas dentro do modal de tarefa
2. Exibir lista de subtarefas com checkbox de conclusão
3. Mostrar progresso visual (X/Y concluídas)
4. Edição inline do título da subtarefa
5. Reordenação por drag & drop (fase futura)
6. Exclusão de subtarefa com confirmação

## Requisitos Funcionais

### RF1: Estrutura de Dados
- **RF1.1**: Usar tabela `subtasks` existente com campos:
  - `id` (uuid, PK)
  - `task_id` (uuid, FK para tasks)
  - `title` (text, obrigatório)
  - `is_done` (boolean, default false)
  - `sort_order` (int, default 0)
  - `created_at` (timestamptz)

### RF2: Interface no TaskModal
- **RF2.1**: Adicionar seção "Subtarefas" no TaskModal após a descrição
- **RF2.2**: Exibir contador de progresso: "Subtarefas (2/5)" no header da seção
- **RF2.3**: Input inline para adicionar nova subtarefa (placeholder: "Adicionar subitem...")
- **RF2.4**: Lista de subtarefas existentes com:
  - Checkbox para marcar como concluída
  - Título editável inline
  - Botão de exclusão (ícone trash, visível no hover)
- **RF2.5**: Estado vazio: "Nenhuma subtarefa ainda" quando lista vazia

### RF3: Criação de Subtarefa
- **RF3.1**: Input aceita Enter para criar subtarefa
- **RF3.2**: Validar título não vazio (mínimo 1 caractere)
- **RF3.3**: Limpar input após criação bem-sucedida
- **RF3.4**: Adicionar no final da lista (maior sort_order + 1)
- **RF3.5**: Atualização otimista da UI

### RF4: Edição de Subtarefa
- **RF4.1**: Click no título ativa modo de edição inline
- **RF4.2**: Enter ou blur salva alteração
- **RF4.3**: Esc cancela edição e restaura valor original
- **RF4.4**: Validar título não vazio antes de salvar

### RF5: Toggle de Conclusão
- **RF5.1**: Click no checkbox alterna estado `is_done`
- **RF5.2**: Aplicar estilo visual: texto riscado quando concluída
- **RF5.3**: Atualizar contador de progresso em tempo real
- **RF5.4**: Atualização otimista da UI

### RF6: Exclusão de Subtarefa
- **RF6.1**: Botão trash visível apenas no hover (desktop) ou sempre (mobile)
- **RF6.2**: Confirmação obrigatória antes de excluir
- **RF6.3**: Modal de confirmação: "Excluir subitem '[título]'?"
- **RF6.4**: Remover da lista após confirmação

### RF7: Progresso Visual
- **RF7.1**: Calcular percentual: (concluídas / total) * 100
- **RF7.2**: Exibir barra de progresso visual (opcional para MVP)
- **RF7.3**: Atualizar contador no header da seção

## Requisitos Não-Funcionais

### RNF1: Segurança
- **RNF1.1**: RLS policies devem verificar `board_access_role` via task_id → board_id
- **RNF1.2**: Apenas `owner` e `editor` podem criar/editar/excluir subtarefas
- **RNF1.3**: `viewer`, `guest`, `observer` podem apenas visualizar
- **RNF1.4**: Validação de permissões no backend (RLS) e frontend (UI disabled)

### RNF2: Performance
- **RNF2.1**: Carregar subtarefas junto com task detail (1 query)
- **RNF2.2**: Atualização otimista para melhor UX
- **RNF2.3**: Debounce de 300ms na edição inline

### RNF3: UX/UI
- **RNF3.1**: Mobile-first: touch targets mínimo 44px
- **RNF3.2**: Feedback visual imediato em todas as ações
- **RNF3.3**: Estados de loading discretos (spinner pequeno)
- **RNF3.4**: Mensagens de erro amigáveis

### RNF4: Acessibilidade
- **RNF4.1**: Checkbox com label associado
- **RNF4.2**: Input com placeholder descritivo
- **RNF4.3**: Botões com aria-label
- **RNF4.4**: Navegação por teclado funcional

## Critérios de Aceite

### CA1: Criação
- [ ] Usuário com permissão de edição pode adicionar subtarefa
- [ ] Enter no input cria subtarefa e limpa campo
- [ ] Subtarefa aparece na lista imediatamente
- [ ] Contador de progresso atualiza

### CA2: Edição
- [ ] Click no título ativa edição inline
- [ ] Enter salva, Esc cancela
- [ ] Título atualizado persiste no banco

### CA3: Conclusão
- [ ] Checkbox alterna estado is_done
- [ ] Texto fica riscado quando concluída
- [ ] Contador atualiza em tempo real

### CA4: Exclusão
- [ ] Botão trash abre modal de confirmação
- [ ] Confirmação remove subtarefa
- [ ] Lista atualiza imediatamente

### CA5: Permissões
- [ ] Viewer não vê botões de ação
- [ ] Viewer não pode editar ou criar
- [ ] Editor pode fazer todas as operações

### CA6: Mobile
- [ ] Touch targets >= 44px
- [ ] Botões visíveis sem hover
- [ ] Input funciona com teclado virtual

## Fora do Escopo (Fase Futura)

- Reordenação por drag & drop (Tarefa 5.2.12)
- Subtarefas aninhadas (sub-subtarefas)
- Atribuir responsável a subtarefa
- Data de prazo em subtarefa
- Comentários em subtarefa

## Referências

- Backlog: Fase 5, Épico 5.2, Tarefa 5.2.10
- Tabela: `public.subtasks` (já existe)
- Componente: `app/components/TaskModal.vue`
- Inspiração: Monday.com subitems
