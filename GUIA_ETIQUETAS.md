# Guia de Etiquetas (Labels)

## Visão Geral

O sistema de etiquetas permite categorizar e filtrar tarefas usando tags coloridas. Inspirado no Monday.com e Trello, as etiquetas facilitam a organização visual e a busca de tarefas relacionadas.

## Funcionalidades

### 1. Criar Etiquetas

As etiquetas são criadas por board e podem ser reutilizadas em múltiplas tarefas.

**Como criar:**
1. Clique na célula de etiquetas de qualquer tarefa
2. Clique em "Criar nova etiqueta"
3. Digite o nome da etiqueta (máx. 50 caracteres)
4. Escolha uma cor da paleta
5. Clique em "Criar"

**Cores disponíveis:**
- 18 cores pré-definidas inspiradas no Tailwind CSS
- Formato hexadecimal (#RRGGBB)
- Cores vibrantes para fácil identificação visual

### 2. Adicionar Etiquetas às Tarefas

**Na linha da tarefa:**
- Clique na célula de etiquetas
- Selecione as etiquetas desejadas (múltipla seleção)
- As etiquetas aparecem imediatamente

**No modal da tarefa:**
- Abra o modal da tarefa
- Na seção "Etiquetas", clique para abrir o dropdown
- Selecione ou desmarque etiquetas

### 3. Visualização

**Na linha da tarefa:**
- Mostra até 2 etiquetas por padrão (configurável)
- Etiquetas adicionais são indicadas com "+N"
- Cores vibrantes para fácil identificação

**No modal da tarefa:**
- Mostra até 5 etiquetas
- Lista completa disponível no dropdown

### 4. Buscar Etiquetas

No dropdown de etiquetas:
- Digite no campo de busca
- Filtra etiquetas por nome
- Busca case-insensitive

### 5. Gerenciar Etiquetas

**Editar etiqueta:**
- Atualmente não implementado (futuro)
- Será possível editar nome e cor

**Excluir etiqueta:**
- Atualmente não implementado (futuro)
- Removerá a etiqueta de todas as tarefas

## Segurança

### Validações Implementadas

**Nome da etiqueta:**
- Não pode ser vazio
- Máximo 50 caracteres
- Previne XSS (< > & " ' `)
- Previne SQL injection

**Cor da etiqueta:**
- Formato hexadecimal obrigatório (#RRGGBB)
- Validação no frontend e backend
- Normalização para lowercase

### Políticas RLS

**Tabela `labels`:**
- Apenas colaboradores e masters podem criar/editar/excluir
- Guests e observers têm acesso somente leitura

**Tabela `task_labels`:**
- Apenas colaboradores e masters podem adicionar/remover
- Vinculada às permissões da tarefa

### Índices de Performance

Índices criados para otimizar consultas:
- `idx_labels_board_id` - Buscar labels por board
- `idx_task_labels_task_id` - Buscar labels de uma tarefa
- `idx_task_labels_label_id` - Buscar tarefas com uma label
- `idx_task_labels_task_label` - Índice composto para queries complexas

## Arquitetura

### Composables

**`useLabels(boardId)`**
- Gerencia labels de um board
- CRUD completo de labels
- Validação de input
- Cache local reativo

**`useTaskLabels(taskId)`**
- Gerencia labels de uma tarefa específica
- Adicionar/remover labels
- Toggle de labels
- Sincronização com banco

### Componentes

**`LabelsCell.vue`**
- Exibe labels na linha da tarefa
- Dropdown para seleção
- Criação inline de novas labels
- Mobile-first (touch targets >= 44px)

### Banco de Dados

**Tabela `labels`:**
```sql
CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id),
  name TEXT NOT NULL,
  color TEXT NOT NULL
);
```

**Tabela `task_labels`:**
```sql
CREATE TABLE task_labels (
  task_id UUID NOT NULL REFERENCES tasks(id),
  label_id UUID NOT NULL REFERENCES labels(id),
  PRIMARY KEY (task_id, label_id)
);
```

## Uso no Código

### Criar uma label

```typescript
import { useLabels } from '~/composables/useLabels'

const { createLabel } = useLabels(boardId)

await createLabel('Urgente', '#ef4444')
```

### Adicionar label a uma tarefa

```typescript
import { useTaskLabels } from '~/composables/useTaskLabels'

const { addLabel } = useTaskLabels(taskId)

await addLabel(labelId)
```

### Listar labels de uma tarefa

```typescript
import { useTaskLabels } from '~/composables/useTaskLabels'

const { taskLabels, fetchTaskLabels } = useTaskLabels(taskId)

await fetchTaskLabels()
console.log(taskLabels.value) // Array de labels
```

## Filtros (Futuro)

Funcionalidades planejadas:
- Filtrar tarefas por label
- Filtros combinados (múltiplas labels)
- Salvar filtros personalizados
- Visualização por label (agrupamento)

## Boas Práticas

1. **Nomenclatura:**
   - Use nomes descritivos e curtos
   - Evite abreviações confusas
   - Mantenha consistência entre boards

2. **Cores:**
   - Use cores consistentes para categorias similares
   - Evite muitas cores diferentes
   - Considere acessibilidade (contraste)

3. **Organização:**
   - Crie labels antes de começar a usá-las
   - Não crie labels duplicadas
   - Revise e limpe labels não utilizadas

4. **Performance:**
   - Limite o número de labels por tarefa (recomendado: 3-5)
   - Use filtros para encontrar tarefas com labels específicas

## Testes

### Testes de Segurança

**`tests/security/labels-rls.test.ts`**
- Valida políticas RLS
- Previne acesso não autorizado
- Testa SQL injection e XSS

**`tests/security/labels-validation.test.ts`**
- Valida input de nome e cor
- Testa sanitização de dados
- Valida formato de UUID

### Executar Testes

```bash
npm run test
```

## Troubleshooting

### Labels não aparecem
- Verifique se o board_id está correto
- Confirme que o usuário tem permissão de leitura
- Verifique o console para erros

### Não consigo criar labels
- Verifique se o usuário é colaborador ou master
- Confirme que o nome não está vazio
- Verifique se a cor está no formato correto

### Performance lenta
- Verifique se os índices foram criados
- Limite o número de labels por board
- Use paginação para boards grandes

## Roadmap

Funcionalidades futuras:
- [ ] Editar labels existentes
- [ ] Excluir labels
- [ ] Filtrar tarefas por label
- [ ] Agrupar tarefas por label
- [ ] Estatísticas de uso de labels
- [ ] Importar/exportar labels
- [ ] Templates de labels por tipo de board
