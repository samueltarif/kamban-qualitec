# Correção de Email em Produção - Resumo Executivo

## Problema

Email funciona em localhost mas retorna 500 em produção ao associar responsável.

## Causa Raiz Provável

Baseado na análise, as causas mais prováveis são (em ordem de probabilidade):

### 1. Variáveis de Ambiente Ausentes (80% de probabilidade)
- EMAIL_USER, EMAIL_PASS, EMAIL_SMTP, EMAIL_PORT não configuradas em produção
- Ou configuradas com valores incorretos

### 2. Auto-import Quebrado no Build (15% de probabilidade)
- Função `generateTaskAssignmentEmail` não disponível em produção
- Nuxt auto-import pode não funcionar no build otimizado

### 3. Credenciais SMTP Inválidas (5% de probabilidade)
- Senha de app expirada ou revogada
- Remetente não autorizado no provedor

## Alterações Aplicadas

### Arquivo: `server/api/emails/task-assigned.post.ts`

**Logs adicionados**:
1. Request ID único para rastreamento
2. Environment (NODE_ENV)
3. Validação explícita de variáveis de ambiente
4. Prefixos de chaves (primeiros caracteres) para confirmar presença
5. Lista de variáveis ausentes
6. Verificação de conexão SMTP com `transporter.verify()`
7. Verificação se `generateTaskAssignmentEmail` é função
8. Try/catch específicos para template e envio
9. Códigos de erro SMTP detalhados
10. Mensagens de erro contextualizadas

**Melhorias**:
- Erro 500 agora retorna causa específica
- Cada STEP logado separadamente
- Erros categorizados (CONFIG, TEMPLATE, SMTP)
- Stack traces completos

## Variáveis de Ambiente Necessárias

### Obrigatórias em Produção:

```env
# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Email SMTP
EMAIL_SMTP=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM_NAME=Sistema Kanban

# App
PUBLIC_APP_URL=https://seu-dominio.vercel.app
```

## Logs a Procurar em Produção

### Erro de Variáveis Ausentes:
```
[task-assigned] ✗ CRITICAL: Missing environment variables: [EMAIL_USER, EMAIL_PASS]
```

### Erro de Template:
```
[task-assigned] ✗ CRITICAL: generateTaskAssignmentEmail is not a function!
```

### Erro de SMTP:
```
[task-assigned] Transport error code: EAUTH
```

## Como Testar

1. **Deploy** com as alterações
2. **Associar** um responsável em produção
3. **Verificar logs** do servidor (Vercel Logs, etc)
4. **Procurar** por:
   - Request ID da requisição
   - Qual STEP falhou
   - Mensagem de erro específica
5. **Aplicar correção** baseada no erro encontrado

## Correções Possíveis

### Se: "Missing environment variables"
**Solução**: Adicionar variáveis no painel de deploy

### Se: "generateTaskAssignmentEmail is not a function"
**Solução**: Problema de build, pode precisar import explícito

### Se: "EAUTH"
**Solução**: Gerar nova senha de app no Gmail

### Se: "ETIMEDOUT"
**Solução**: Tentar porta 587 ao invés de 465

### Se: "ENOTFOUND"
**Solução**: Verificar EMAIL_SMTP

## Arquivos Alterados

- `server/api/emails/task-assigned.post.ts` - Logs detalhados e validações

## Documentação

- `docs/EMAIL_PRODUCTION_DEBUG.md` - Guia completo de debug
- `docs/EMAIL_PRODUCTION_FIX_SUMMARY.md` - Este resumo

## Próximos Passos

1. Commit e push das alterações
2. Deploy em produção
3. Testar associação de responsável
4. Verificar logs do servidor
5. Identificar causa exata
6. Aplicar correção específica
7. Validar funcionamento
