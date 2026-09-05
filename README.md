# NextCRM — MVP SaaS

CRM multi-tenant para pequenas e médias empresas, construído com React + TypeScript + Vite + Supabase.

## O que já existe

- Login e cadastro por e-mail/senha via Supabase Auth
- Onboarding para criação da primeira organização
- Isolamento multi-tenant com `organization_id` + Row Level Security
- Pipeline Kanban com drag-and-drop nativo
- Contatos e empresas
- Negócios/oportunidades
- Tarefas e follow-ups
- Dashboard com indicadores básicos
- Tela de detalhes do contato
- Modo demonstração automático quando Supabase não estiver configurado
- Base pronta para evoluir para Inbox, WhatsApp/Instagram, automações e IA

## Stack de custo baixo

- Frontend: React + TypeScript + Vite
- Backend/Banco/Auth: Supabase
- Hospedagem recomendada: Vercel ou Cloudflare Pages
- Repositório: GitHub

Todos possuem camada gratuita adequada para desenvolvimento e MVP, sujeita aos limites de uso de cada provedor.

## Rodar localmente

```bash
npm install
cp .env.example .env
npm run dev
```

Sem preencher `.env`, o sistema abre em **modo demonstração** com dados locais.

## Configurar Supabase

1. Crie ou use um projeto no Supabase.
2. Abra o SQL Editor.
3. Execute `supabase/schema.sql`.
4. Em Project Settings/API, copie a URL do projeto e a chave pública (`anon`/publishable).
5. Crie `.env`:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
```

6. Rode `npm run dev`.

## Deploy gratuito

### Vercel

1. Envie o projeto para GitHub.
2. Importe o repositório na Vercel.
3. Configure as duas variáveis de ambiente.
4. Build command: `npm run build`
5. Output directory: `dist`

## Próximas fases recomendadas

1. Inbox omnichannel
2. WhatsApp Business Platform / Cloud API
3. Instagram Messaging
4. Webhooks e fila de eventos
5. Lead scoring
6. Resumo de conversas por IA
7. Automação de follow-up
8. Convite de usuários e papéis avançados
9. Planos/assinaturas e cobrança
10. Logs de auditoria e métricas comerciais

## Segurança

- Nunca coloque `service_role` no frontend.
- Use somente a chave pública no `VITE_SUPABASE_ANON_KEY`.
- O isolamento entre empresas é aplicado pelas políticas RLS do banco.
- Antes de vender em produção, faça revisão de segurança, LGPD, backup, rate limiting e testes de isolamento entre tenants.
