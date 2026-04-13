# Sistema de Convites para Tarefas

## Visão Geral

Sistema completo de convites para colaborar em tarefas, inspirado no Monday.com. Permite que usuários com permissão de edição convidem outras pessoas para colaborar em tarefas específicas via e-mail.

## Fluxo Completo

### 1. Envio do Convite

**Quem pode convidar:**
- Membros do board com role `owner` ou `editor`

**Como funciona:**
1. Usuário abre o modal da tarefa
2. Clica no botão "Convidar" no footer do modal
3. Preenche o e-mail do convidado e mensagem opcional
4. Sistema valida permissões e cria convite
5. Convite é salvo na tabela `task_invitations` com token único
6. Notificação é criada se o usuário já existir no sistema
7. E-mail é enviado (placeholder - integração futura)

**Endpoint:** `POST /api/tasks/invite`

**Segurança:**
- Valida autenticação via JWT
- Verifica se usuário é membro do board
- Verifica se usuário tem role `owner` ou `editor`
- Valida formato do e-mail
- Gera token seguro de 32 bytes
- Convite expira em 7 dias

### 2. Recebimento do E-mail

**Conteúdo do e-mail:**
- Nome do convidador
- Nome do board
- Título e descrição da tarefa
- Mensagem personalizada (se houver)
- Botão "Aceitar convite" com link único
- Aviso de expiração (7 dias)

**Template:** `server/templates/task-invitation-email.html`

**Variáveis do template:**
- `{{INVITER_NAME}}` - Nome do convidador
- `{{INVITER_INITIALS}}` - Iniciais do convidador
- `{{BOARD_NAME}}` - Nome do board
- `{{TASK_TITLE}}` - Título da tarefa
- `{{TASK_DESCRIPTION}}` - Descrição da tarefa (opcional)
- `{{MESSAGE}}` - Mensagem personalizada (opcional)
- `{{INVITE_URL}}` - URL do convite
- `{{INVITEE_EMAIL}}` - E-mail do convidado
- `{{APP_URL}}` - URL da aplicação

### 3. Aceitação do Convite

**Página de convite:** `/invite/[token]`

**Fluxo:**
1. Usuário clica no link do e-mail
2. Sistema carrega dados do convite via `GET /api/invitations/[token]`
3. Valida se convite existe, não expirou e não foi aceito
4. Mostra informações do convite (convidador, board, tarefa)
5. Se usuário não está autenticado, redireciona para login
6. Após login, retorna para página do convite
7. Usuário clica em "Aceitar convite"
8. Sistema valida e-mail do usuário autenticado
9. Adiciona usuário ao board como `viewer`
10. Adiciona usuário como responsável da tarefa
11. Marca convite como aceito
12. Redireciona para o board com modal da tarefa aberto

**Endpoints:**
- `GET /api/invitations/[token]` - Busca dados do convite
- `POST /api/invitations/accept` - Aceita o convite

**Segurança:**
- Valida token único
- Verifica expiração (7 dias)
- Verifica se já foi aceito
- Valida que e-mail do usuário autenticado corresponde ao convite
- Usa service role key para operações privilegiadas

### 4. Redirecionamento Automático

Após aceitar o convite:
1. Usuário é redirecionado para `/boards/[boardId]?task=[taskId]`
2. Board page detecta query param `task`
3. Abre automaticamente o modal da tarefa
4. Usuário vê a tarefa que foi convidado a colaborar

## Estrutura do Banco de Dados

### Tabela: `task_invitations`

```sql
CREATE TABLE task_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES tasks(id),
  board_id UUID NOT NULL REFERENCES boards(id),
  inviter_id UUID NOT NULL REFERENCES profiles(id),
  invitee_email TEXT NOT NULL,
  invitee_id UUID REFERENCES profiles(id),
  token TEXT NOT NULL UNIQUE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Campos:**
- `id` - ID único do convite
- `task_id` - Tarefa para qual o usuário foi convidado
- `board_id` - Board que contém a tarefa
- `inviter_id` - Usuário que enviou o convite
- `invitee_email` - E-mail do convidado
- `invitee_id` - ID do usuário convidado (preenchido ao aceitar)
- `token` - Token único e seguro para validação
- `message` - Mensagem personalizada opcional
- `status` - Status do convite (`pending`, `accepted`, `expired`)
- `expires_at` - Data de expiração (7 dias após criação)
- `accepted_at` - Data de aceitação
- `created_at` - Data de criação

### RLS Policies

```sql
-- Usuários podem ver convites enviados para seu e-mail
CREATE POLICY "Users can view invitations sent to them"
ON task_invitations FOR SELECT
USING (
  invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR invitee_id = auth.uid()
);

-- Usuários podem ver convites que enviaram
CREATE POLICY "Users can view invitations they sent"
ON task_invitations FOR SELECT
USING (inviter_id = auth.uid());

-- Membros do board com editor/owner podem criar convites
CREATE POLICY "Board members can create invitations"
ON task_invitations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM board_members
    WHERE board_members.board_id = task_invitations.board_id
      AND board_members.user_id = auth.uid()
      AND board_members.access_role IN ('owner', 'editor')
  )
);

-- Usuários podem atualizar convites enviados para eles
CREATE POLICY "Users can update their own invitations"
ON task_invitations FOR UPDATE
USING (
  invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
  OR invitee_id = auth.uid()
);
```

## Componentes

### `TaskInviteButton.vue`

Botão e modal para enviar convites.

**Props:**
- `taskId: string` - ID da tarefa
- `boardId: string` - ID do board

**Funcionalidades:**
- Input de e-mail com validação
- Textarea para mensagem opcional
- Contador de caracteres (500 max)
- Feedback de sucesso/erro
- Loading state durante envio
- Info box explicando o que acontece ao convidar

### Página `/invite/[token].vue`

Página de aceitação de convite.

**Estados:**
- Loading - Carregando dados do convite
- Error - Convite inválido, expirado ou já aceito
- Success - Mostra dados do convite e botão de aceitar

**Funcionalidades:**
- Mostra informações do convidador
- Mostra dados do board e tarefa
- Mostra mensagem personalizada (se houver)
- Aviso de expiração
- Botão de aceitar (ou login se não autenticado)
- Redirecionamento automático após aceitar

## Integração com Serviço de E-mail

**Status atual:** Placeholder (logs no console)

**Para integrar:**

1. Escolher serviço de e-mail:
   - Supabase Edge Functions + Resend
   - SendGrid
   - AWS SES
   - Mailgun

2. Adicionar variáveis de ambiente:
   ```env
   EMAIL_SERVICE_API_KEY=xxx
   EMAIL_FROM_ADDRESS=noreply@seudominio.com
   EMAIL_FROM_NAME=Sua Plataforma
   ```

3. Implementar função de envio em `server/api/tasks/invite.post.ts`:
   ```typescript
   // Substituir o console.log por:
   await sendEmail({
     to: inviteeEmail,
     from: process.env.EMAIL_FROM_ADDRESS,
     subject: `${inviter?.full_name} convidou você para colaborar`,
     html: renderTemplate('task-invitation-email.html', {
       INVITER_NAME: inviter?.full_name,
       INVITER_INITIALS: getInitials(inviter?.full_name),
       BOARD_NAME: board?.name,
       TASK_TITLE: task.title,
       TASK_DESCRIPTION: task.description,
       MESSAGE: message,
       INVITE_URL: inviteUrl,
       INVITEE_EMAIL: inviteeEmail,
       APP_URL: process.env.NUXT_PUBLIC_APP_URL
     })
   })
   ```

## Casos de Uso

### Caso 1: Convidar usuário que já existe no sistema

1. Sistema detecta que e-mail já está cadastrado
2. Verifica se já é membro do board
3. Se já for membro, apenas adiciona como responsável da tarefa
4. Se não for membro, cria convite normalmente
5. Cria notificação in-app além do e-mail

### Caso 2: Convidar usuário novo

1. Sistema cria convite com e-mail
2. Envia e-mail com link de convite
3. Usuário clica no link
4. Sistema redireciona para cadastro/login
5. Após autenticação, valida e-mail e aceita convite
6. Adiciona ao board e tarefa

### Caso 3: Convite expirado

1. Usuário tenta acessar convite após 7 dias
2. Sistema retorna erro 410 (Gone)
3. Página mostra mensagem de expiração
4. Sugere solicitar novo convite

### Caso 4: Convite já aceito

1. Usuário tenta acessar convite já aceito
2. Sistema retorna erro 409 (Conflict)
3. Página mostra mensagem que já foi aceito
4. Oferece link para ir direto ao board

## Segurança

### Validações Backend

✅ Autenticação obrigatória via JWT
✅ Verificação de permissões (owner/editor)
✅ Validação de formato de e-mail
✅ Token único e seguro (32 bytes)
✅ Expiração de 7 dias
✅ Validação de e-mail ao aceitar
✅ RLS policies no Supabase
✅ Service role key para operações privilegiadas

### Proteções

- Token não pode ser reutilizado após aceito
- E-mail do usuário autenticado deve corresponder ao convite
- Convites expirados não podem ser aceitos
- Apenas membros do board podem convidar
- Apenas owners/editors podem convidar

## Melhorias Futuras

- [ ] Integrar serviço de e-mail real
- [ ] Adicionar limite de convites por usuário/dia
- [ ] Permitir reenviar convite expirado
- [ ] Adicionar histórico de convites no board
- [ ] Notificações push quando convite é aceito
- [ ] Permitir cancelar convite pendente
- [ ] Adicionar analytics de convites (taxa de aceitação)
- [ ] Suporte a convite em massa (múltiplos e-mails)
- [ ] Permitir definir role customizado ao convidar
- [ ] Template de e-mail customizável por organização
