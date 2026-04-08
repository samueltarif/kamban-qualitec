# 📋 Guia de Uso - Subtarefas

## Como Criar Subtarefas

### Passo 1: Abrir o Modal da Tarefa
- Clique em **qualquer tarefa existente** na lista do board
- **NÃO** clique em "+ Nova tarefa" (isso cria uma tarefa nova, não uma subtarefa)

### Passo 2: Localizar a Seção de Subtarefas
Dentro do modal da tarefa, role para baixo até encontrar a seção **"Subtarefas"**

A ordem das seções no modal é:
1. Título (editável)
2. Status, Prioridade, Datas, Orçamento, Responsáveis
3. Descrição
4. **→ SUBTAREFAS ←** (aqui!)
5. Anexos
6. Histórico de Atividades

### Passo 3: Criar uma Subtarefa
1. Digite o título da subtarefa no campo **"Adicionar subitem..."**
2. Pressione **Enter** ou clique no botão **"Adicionar"**
3. A subtarefa aparecerá imediatamente na lista

### Funcionalidades Disponíveis

#### ✅ Marcar como Concluída
- Clique no **checkbox** à esquerda da subtarefa
- O texto ficará riscado quando concluída
- O contador de progresso atualiza automaticamente

#### ✏️ Editar Título
- Clique no **texto da subtarefa** para editar
- Pressione **Enter** para salvar ou **Esc** para cancelar

#### 🗑️ Excluir Subtarefa
- Passe o mouse sobre a subtarefa (desktop) ou toque nela (mobile)
- Clique no **ícone de lixeira** que aparece
- Confirme a exclusão no modal

#### 📊 Progresso Visual
- O contador mostra **"Subtarefas (X/Y)"** onde:
  - X = número de subtarefas concluídas
  - Y = total de subtarefas
- A barra de progresso visual mostra o percentual concluído

## Permissões

- **Owner e Editor**: podem criar, editar e excluir subtarefas
- **Viewer, Guest, Observer**: podem apenas visualizar subtarefas

## Exemplo Visual

```
┌─────────────────────────────────────────────────────┐
│ Modal da Tarefa: "Implementar login"               │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [Título editável]                                   │
│                                                     │
│ Status: [Em andamento ▼]  Prioridade: [Alta ▼]    │
│ Início: [08/04/2026]      Prazo: [10/04/2026]     │
│                                                     │
│ Descrição:                                          │
│ ┌─────────────────────────────────────────────┐   │
│ │ Implementar sistema de autenticação...      │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ─────────────────────────────────────────────────  │
│                                                     │
│ Subtarefas (2/3)                    ████░░ 67%     │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ Adicionar subitem...                        │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ☑ Criar formulário de login                   🗑   │
│ ☑ Integrar com Supabase Auth                  🗑   │
│ ☐ Adicionar validação de campos               🗑   │
│                                                     │
│ ─────────────────────────────────────────────────  │
│                                                     │
│ Anexos (0)                                          │
│ [Área de upload]                                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Dicas

1. **Role para baixo** - A seção de subtarefas não fica no topo do modal
2. **Use Enter** - Mais rápido que clicar no botão "Adicionar"
3. **Edição rápida** - Clique direto no texto para editar
4. **Progresso visual** - Acompanhe o andamento com o contador

## Troubleshooting

### "Não vejo a seção de subtarefas"
- Certifique-se de que clicou em uma **tarefa existente**, não em "+ Nova tarefa"
- **Role para baixo** no modal - a seção fica após a descrição

### "Não consigo criar subtarefas"
- Verifique se você tem permissão de **Editor** ou **Owner** no board
- Viewers, Guests e Observers não podem criar subtarefas

### "O botão 'Adicionar' não aparece"
- O botão só aparece quando você **digita algo** no campo
- Você também pode pressionar **Enter** sem clicar no botão
