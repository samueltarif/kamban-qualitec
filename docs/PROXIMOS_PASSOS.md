# Próximos Passos - Sistema de Email e UI

## ✅ Correções Implementadas

### 1. Z-Index dos Dropdowns
- **Problema**: Dropdowns das colunas (Status, Prioridade, Responsável, etc.) ficavam atrás de novas tarefas adicionadas
- **Solução**: Aumentado z-index de `9999` para `99999` em todos os componentes:
  - `StatusCell.vue`
  - `PriorityCell.vue`
  - `AssigneeCell.vue`
  - `TimelineCell.vue`
  - `AttachmentsModal.vue`
  - `NotificationsPanel.vue`
- **Status**: ✅ Corrigido e enviado para produção

### 2. URL de Produção nos Emails
- **Problema**: Links nos emails apontavam para `localhost:3000`
- **Solução**: Atualizado `.env` com `NUXT_PUBLIC_APP_URL=https://kamban-qualitec.vercel.app`
- **Status**: ✅ Corrigido localmente, precisa configurar na Vercel

## 🔧 Ações Necessárias na Vercel

### Configurar Variáveis de Ambiente

Para o sistema de emails funcionar em produção, você precisa adicionar as seguintes variáveis na Vercel:

1. Acesse: https://vercel.com/lmesquadriasites-projects/backlog/settings/environment-variables

2. Adicione estas variáveis (uma por uma):

```
NUXT_EMAIL_USER=catalogo@qualitec.ind.br
NUXT_EMAIL_PASS=Instrumentos@2026
NUXT_EMAIL_SMTP=smtp.skymail.net.br
NUXT_EMAIL_PORT=465
NUXT_EMAIL_FROM_NAME=Sistema Kanban Qualitec
NUXT_PUBLIC_APP_URL=https://kamban-qualitec.vercel.app
```

3. Para cada variável:
   - Clique em "Add New"
   - Cole o nome e valor
   - Selecione: **Production**, **Preview** e **Development**
   - Clique em "Save"

4. Após adicionar todas, faça um **Redeploy**:
   - Vá em "Deployments"
   - Clique nos 3 pontos do último deployment
   - Clique em "Redeploy"

### Verificar se Funcionou

Após o redeploy, teste:

1. **Teste de configuração**:
   - Acesse: https://kamban-qualitec.vercel.app/api/email/test
   - Deve retornar `"success": true`

2. **Teste de envio**:
   - Atribua um usuário a uma tarefa
   - O usuário deve receber um email automaticamente

## 📋 Checklist de Verificação

- [ ] Variáveis de ambiente adicionadas na Vercel
- [ ] Redeploy realizado
- [ ] Endpoint `/api/email/test` retorna sucesso
- [ ] Email automático enviado ao atribuir responsável
- [ ] Links no email apontam para `https://kamban-qualitec.vercel.app`
- [ ] Dropdowns das colunas clicáveis em todas as tarefas

## 📚 Documentação Criada

- `docs/CONFIGURACAO_VERCEL.md` - Guia completo de configuração
- `docs/NOTIFICACOES_EMAIL.md` - Documentação do sistema de emails
- `docs/TROUBLESHOOTING_EMAIL.md` - Solução de problemas

## 🐛 Problemas Conhecidos Resolvidos

1. ✅ Dropdowns ficando atrás de novas tarefas
2. ✅ Links de localhost nos emails
3. ✅ Estrutura do runtimeConfig causando erro 500
4. ✅ Emails não sendo enviados automaticamente

## 💡 Dicas

- Se os emails não funcionarem após configurar, verifique os logs na Vercel:
  - Deployments > [último deployment] > View Function Logs
  
- As variáveis de ambiente só são aplicadas em novos deploys

- Para testar localmente, use o arquivo `.env` que já está configurado
