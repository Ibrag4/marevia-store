# MARÉVIA — loja virtual

Projeto inicial de e-commerce em React + TypeScript + Vite. Inclui identidade visual, home, catálogo, páginas individuais por slug, filtros, favoritos, sacola persistida, formulário de checkout demonstrativo, migração inicial do Supabase e esqueletos de funções Cloudflare.

> **Importante:** esta versão ainda NÃO está pronta para receber pagamentos ou pedidos reais. O checkout e o webhook retornam erro intencionalmente até que o backend transacional, a validação de webhook e as credenciais sejam configurados. Não remova essa proteção sem implementar as verificações descritas abaixo. Os produtos e estoques do frontend são dados de demonstração.

## Requisitos
- Node.js 20 ou superior recomendado
- npm

## Executar localmente
```bash
npm install
cp .env.example .env.local
npm run dev
```
Abra o endereço informado pelo Vite. Não são necessárias credenciais para explorar o frontend demonstrativo.

## Build
```bash
npm run typecheck
npm run build
npm run preview
```

## Rotas implementadas no frontend
- `/` home
- `/catalogo` catálogo com filtros e ordenação
- `/categoria/biquinis`, `/categoria/maios`, `/categoria/saidas-de-praia`
- `/produto/:slug` página individual compartilhável
- `/busca?q=termo` busca
- `/favoritos` favoritos locais
- `/sacola` sacola local persistente
- `/checkout` formulário demonstrativo (não cobra nem cria pedido)
- `/tabela-de-medidas`, `/politica-de-privacidade`, `/trocas-e-devolucoes`
- `/admin` placeholder sem operações administrativas

## Configurar Supabase
1. Crie um projeto no Supabase.
2. Abra o SQL Editor e execute `supabase/migrations/001_initial_schema.sql`.
3. Confira as políticas RLS. O catálogo público só permite ler produtos publicados; não há política pública para pedidos, pagamentos ou dados privados.
4. Cadastre produtos reais e variantes via backend administrativo seguro (ainda precisa ser implementado) e carregue imagens com URLs autorizadas.
5. Configure as variáveis de frontend `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` apenas quando a aplicação passar a consultar o Supabase. A chave anon/public pode aparecer no frontend; a service role nunca pode.

## Pagamentos e backend — etapas obrigatórias antes de vender
As funções `functions/api/checkout.ts` e `functions/api/mercadopago-webhook.ts` são esqueletos seguros que falham fechados. Elas não criam pedidos ou pagamentos ainda. Para ativar a venda real, implemente e teste: 
1. Uma função transacional/RPC no Postgres que valide variantes, preços atuais, cupons e estoque e crie um pedido pendente com snapshots dos itens.
2. Reserva de estoque com prazo e liberação idempotente para pedidos expirados/cancelados.
3. Criação de preferência do Mercado Pago no servidor usando apenas valores calculados no banco.
4. URLs de retorno que nunca marquem pagamento como aprovado por conta própria.
5. Webhook Mercado Pago: validação da assinatura conforme documentação oficial, consulta do pagamento pela API com token secreto, validação de moeda/valor/referência externa e atualização idempotente em transação.
6. Testes com credenciais de teste e notificações reais de sandbox antes de produção.
7. Autenticação Supabase e verificação server-side de perfil admin para cada endpoint administrativo. Nunca confie em `role` vindo do navegador.
8. Integração de frete real ou regra comercial própria claramente definida; hoje o frete é apenas informativo.

## Deploy Cloudflare Pages
1. Envie o repositório para GitHub sem `.env` ou segredos.
2. Crie um projeto Cloudflare Pages conectado ao repositório.
3. Build command: `npm run build`. Output directory: `dist`.
4. Configure as variáveis secretas no painel Cloudflare Pages (não prefixe segredos com `VITE_`).
5. Para usar Pages Functions, mantenha a pasta `functions/` na raiz do projeto e teste a execução no ambiente Pages.
6. A regra `public/_redirects` permite fallback SPA para as rotas diretas.
7. Teste `/produto/biquini-flor-de-sal` abrindo diretamente a URL pública e recarregando a página.

## Produtos e links do Instagram
Cada item demonstrativo tem `slug` em `src/data/products.ts`. A URL local é, por exemplo, `/produto/biquini-flor-de-sal`. Depois de publicar, use a URL pública completa + esse caminho no Instagram. Para mudar fotos, preços e descrições demonstrativas, edite `src/data/products.ts`. Para uma operação real, migre os dados para o banco e mantenha slugs únicos no servidor.

## Limitações conhecidas desta entrega
- Produtos e estoque atuais são demonstrações estáticas.
- O carrinho/favoritos usam localStorage e não sincronizam entre dispositivos.
- O checkout valida campos no navegador, mas não cria pedido nem processa pagamento.
- As funções de checkout e webhook são placeholders seguros (HTTP 501).
- O painel admin não permite operações ainda.
- O frete não está conectado a transportadora.
- Fotos externas e fontes web dependem de disponibilidade e licença; substitua por imagens próprias/licenciadas antes de vender.
- Política de privacidade, trocas e medidas são modelos a personalizar.

## Próxima fase recomendada
Implementar as RPCs de estoque/pedido, integrar Supabase no catálogo, finalizar Mercado Pago + webhook, criar painel admin com controle de acesso e testar compra de ponta a ponta. Não declare a loja pronta para produção até validar esse fluxo.


## Antes de publicar
- A loja está posicionada em biquínis e maiôs; nomes, preços, cores, tamanhos e estoque são exemplos para protótipo.
- As imagens atuais são referências externas do Unsplash, não fotos garantidas dos produtos. Substitua por fotos autorizadas e fiéis ao produto que será enviado.
- Revise descrições, medidas, preços, estoque, política de troca, frete e dados comerciais antes de receber pagamentos.
- O checkout e os endpoints de pagamento continuam em modo demonstrativo; não aceite pedidos reais sem concluir a integração de backend e gateway.
