// Cloudflare Pages Function webhook scaffold. Do not mark orders as paid from browser redirects.
interface Env { MERCADO_PAGO_ACCESS_TOKEN: string; MERCADO_PAGO_WEBHOOK_SECRET: string; SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string }
export const onRequestPost: PagesFunction<Env> = async ({request,env}) => {
  if (!env.MERCADO_PAGO_ACCESS_TOKEN || !env.MERCADO_PAGO_WEBHOOK_SECRET || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return new Response('Webhook not configured',{status:503});
  // TODO before production: validate x-signature using the official Mercado Pago manifest algorithm,
  // fetch the payment from Mercado Pago with the server token, verify external_reference and amount,
  // record event idempotently, then update the order in a DB transaction.
  // Fail closed: never acknowledge an unverified payment as processed.
  return new Response('Webhook integration pending',{status:501});
};
