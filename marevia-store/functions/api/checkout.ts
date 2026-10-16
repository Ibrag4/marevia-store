// Cloudflare Pages Function starter. Requires server-side env vars and SQL/RPC implementation before production.
interface Env { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; MERCADO_PAGO_ACCESS_TOKEN: string; PUBLIC_SITE_URL: string }
export const onRequestPost: PagesFunction<Env> = async ({request,env}) => {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.MERCADO_PAGO_ACCESS_TOKEN || !env.PUBLIC_SITE_URL) return Response.json({error:'Checkout não configurado. Configure as variáveis de ambiente no servidor.'},{status:503});
  // SECURITY: Do not accept prices or totals from the browser. Implement a transactional RPC that
  // loads each variant, verifies stock, computes totals and creates the pending order before adding MP preference.
  // This scaffold deliberately fails closed instead of accepting an unsafe client-side order.
  let body: unknown; try { body=await request.json(); } catch { return Response.json({error:'JSON inválido.'},{status:400}); }
  if (!body || typeof body !== 'object') return Response.json({error:'Dados inválidos.'},{status:400});
  return Response.json({error:'Backend de pedidos ainda precisa ser conectado à função transacional do Supabase e ao Mercado Pago. Nenhum pedido ou pagamento foi criado.'},{status:501});
};
