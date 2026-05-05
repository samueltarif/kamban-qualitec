# Debug de Email em Produção - Guia Completo

## Problema Atual

**Sintoma**: Email funciona em localhost mas retorna 500 em produção
**Erro**: `[useEmailNotifications] Error sending task assigned email: FetchError: [POST] "/api/emails/task-assigned": 500`

## Logs Adicionados

Foram adicionados logs detalhados em cada etapa crítica da API `/api/emails/task-assigned`:

### STEP 1: Reading request body
- Payload recebido (taskId, assigneeId)
- Request ID único para rastreamento

### STEP 2: Loading runtime config
- Verificação de TODAS as variáveis de ambiente
- Prefixos das chaves (primeiros caracteres) para confirmar presença
- Lista de variáveis ausentes (se houver)
- **CRÍTICO**: Se alguma variável estiver ausente, retorna erro 500 imediatamente

### STEP 3: Creating Supabase client
- Confirmação de criação do cliente

### STEP 4-5: Fetching data
- Preferências de email
- Dados da tarefa
- Dados do destinatário

### STEP 6: Configuring email transporter
- Configuração do Nodemailer
- **NOVO**: Verificação de conexão com `transporter.verify()`
- Logs de erro específicos para problemas de SMTP

### STEP 7: Generating email HTML
- **NOVO**: Verificação se `generateTaskAssignmentEmail` está disponível
- Detecção de problemas de build/import
- Try/catch específico para erros de template

### STEP 8: Sending email
- Try/catch específico para erros de envio
- Logs de código de erro SMTP
- Logs de resposta do servidor SMTP

## Variáveis de Ambiente Necessárias em Produção

### Supabase (OBRIGATÓRIAS)
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Email SMTP (OBRIGATÓRIAS)
```env
EMAIL_SMTP=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-app-ou-api-key
EMAIL_FROM_NAME=Sistema Kanban
```

### App (OBRIGATÓRIAS)
```env
PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

## Logs a Procurar em Produção

### 1. Variáveis de Ambiente Ausentes
```
[task-assigned] ✗ CRITICAL: Missing environment variables: [EMAIL_USER, EMAIL_PASS]
```
**Causa**: Variáveis não configuradas no painel de deploy
**Solução**: Adicionar variáveis no Vercel/Netlify/etc

### 2. Erro de Template
```
[task-assigned] ✗ CRITICAL: generateTaskAssignmentEmail is not a function!
[task-assigned] Type: undefined
```
**Causa**: Auto-import do Nuxt não funcionou no build de produção
**Solução**: Verificar se `server/utils/emailTemplates.ts` está no build

### 3. Erro de SMTP - Autenticação
```
[task-assigned] ✗ Error configuring/verifying transporter: Invalid login
[task-assigned] Transport error code: EAUTH
```
**Causa**: Credenciais de email incorretas
**Solução**: Verificar EMAIL_USER e EMAIL_PASS

### 4. Erro de SMTP - Conexão
```
[task-assigned] ✗ Error configuring/verifying transporter: Connection timeout
[task-assigned] Transport error code: ETIMEDOUT
```
**Causa**: Servidor SMTP inacessível ou porta bloqueada
**Solução**: Verificar EMAIL_SMTP e EMAIL_PORT

### 5. Erro de SMTP - Host não encontrado
```
[task-assigned] ✗ Error configuring/verifying transporter: getaddrinfo ENOTFOUND
[task-assigned] Transport error code: ENOTFOUND
```
**Causa**: EMAIL_SMTP incorreto
**Solução**: Verificar valor de EMAIL_SMTP

### 6. Erro de Remetente Não Autorizado
```
[task-assigned] ✗ Error sending email: Sender address rejected
```
**Causa**: EMAIL_USER não está autorizado no provedor
**Solução**: Verificar configuração do provedor (Gmail, SendGrid, etc)

## Principais Hipóteses e Como Identificar

### Hipótese 1: Variáveis de Ambiente Ausentes
**Como identificar**:
```
Config check: {
  hasEmailUser: false,  ← PROBLEMA
  hasEmailPass: false   ← PROBLEMA
}
```
**Solução**: Adicionar variáveis no painel de deploy

### Hipótese 2: Auto-import Quebrado em Produção
**Como identificar**:
```
[task-assigned] ✗ CRITICAL: generateTaskAssignmentEmail is not a function!
```
**Solução**: Verificar build, pode precisar import explícito

### Hipótese 3: Credenciais SMTP Inválidas
**Como identificar**:
```
Transport error code: EAUTH
```
**Solução**: Gerar nova senha de app (Gmail) ou verificar API key

### Hipótese 4: Provedor Bloqueando
**Como identificar**:
```
Error sending email: Sender address rejected
```
**Solução**: Verificar configuração do provedor, domínio verificado, etc

### Hipótese 5: Porta SMTP Bloqueada
**Como identificar**:
```
Transport error code: ETIMEDOUT
```
**Solução**: Tentar porta alternativa (587 ao invés de 465)

## Checklist de Debug em Produção

1. ✅ Verificar logs do servidor (Vercel Logs, Netlify Functions, etc)
2. ✅ Procurar por "Missing environment variables"
3. ✅ Procurar por "generateTaskAssignmentEmail is not a function"
4. ✅ Procurar por códigos de erro SMTP (EAUTH, ETIMEDOUT, ENOTFOUND)
5. ✅ Verificar se todas as variáveis de ambiente estão configuradas
6. ✅ Verificar se os valores das variáveis estão corretos (sem espaços, aspas, etc)
7. ✅ Testar credenciais SMTP localmente com script simples
8. ✅ Verificar se o build incluiu `server/utils/emailTemplates.ts`

## Como Testar Cada Hipótese

### Teste 1: Variáveis de Ambiente
1. Acesse o painel de deploy (Vercel/Netlify)
2. Vá em Settings → Environment Variables
3. Verifique se TODAS as variáveis listadas acima existem
4. Verifique se não há espaços ou caracteres extras
5. Redeploy após adicionar/corrigir

### Teste 2: Auto-import
1. Verifique os logs de build
2. Procure por "server/utils/emailTemplates.ts" no output
3. Se não aparecer, pode ser problema de build
4. Solução temporária: import explícito ao invés de auto-import

### Teste 3: SMTP
1. Use um script Node.js simples para testar:
```javascript
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'seu-email@gmail.com',
    pass: 'sua-senha-app'
  }
})
transporter.verify().then(console.log).catch(console.error)
```

## Configuração Específica por Provedor

### Gmail
```env
EMAIL_SMTP=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # Senha de app (16 caracteres)
```
**Importante**: Precisa habilitar "Senhas de app" nas configurações do Google

### SendGrid
```env
EMAIL_SMTP=smtp.sendgrid.net
EMAIL_PORT=465
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Mailgun
```env
EMAIL_SMTP=smtp.mailgun.org
EMAIL_PORT=465
EMAIL_USER=postmaster@seu-dominio.mailgun.org
EMAIL_PASS=sua-api-key
```

## Próximos Passos

1. **Deploy com logs adicionados**
2. **Testar em produção**
3. **Verificar logs do servidor**
4. **Identificar qual STEP falha**
5. **Aplicar correção específica**

## Request ID

Cada requisição agora tem um ID único no formato `req_timestamp_random`.
Use este ID para rastrear logs específicos de uma requisição.

Exemplo:
```
[task-assigned] Request ID: req_1714320000000_abc123xyz
```

Procure por este ID nos logs para ver toda a sequência de uma requisição específica.
