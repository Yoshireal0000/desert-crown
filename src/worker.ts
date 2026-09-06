/// <reference path="./worker-configuration.d.ts" />

type AuthUser = { email: string; role: 'customer' | 'owner' };
type OrderInput = { items: unknown[]; subtotalCents: number };

const json = (value: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(value), { ...init, headers: { 'content-type': 'application/json; charset=utf-8', ...init.headers } });
const hash = async (value: string) => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};
const now = () => new Date().toISOString();
const parseCookies = (request: Request) => Object.fromEntries((request.headers.get('cookie') || '').split(';').map((part) => part.trim().split('=').map(decodeURIComponent)).filter(([key]) => key));
const readUser = async (request: Request, env: Env): Promise<AuthUser | null> => {
  const token = parseCookies(request).dc_session;
  if (!token) return null;
  const session = await env.DB.prepare('SELECT email FROM sessions WHERE token_hash = ? AND expires_at > ?').bind(await hash(token), Date.now()).first<{ email: string }>();
  if (!session) return null;
  const owners = env.OWNER_EMAILS.split(',').map((email) => email.trim().toLowerCase());
  return { email: session.email, role: owners.includes(session.email.toLowerCase()) ? 'owner' : 'customer' };
};
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    if (request.method !== 'POST' && request.method !== 'GET') return json({ error: 'Method not allowed' }, { status: 405 });
    try {
      if (url.pathname === '/api/auth/request-code' && request.method === 'POST') {
        const { email } = await request.json<{ email?: string }>();
        const normalized = email?.trim().toLowerCase();
        if (!normalized || !/^\S+@\S+\.\S+$/.test(normalized)) return json({ error: 'Enter a valid email address.' }, { status: 400 });
        return json({ error: 'Email sign-in is unavailable until a transactional email sender is configured.' }, { status: 503 });
      }
      if (url.pathname === '/api/auth/verify' && request.method === 'POST') {
        const { email, code } = await request.json<{ email?: string; code?: string }>();
        const normalized = email?.trim().toLowerCase();
        if (!normalized || !code) return json({ error: 'Email and code are required.' }, { status: 400 });
        const record = await env.DB.prepare('SELECT code_hash, expires_at, attempts FROM verification_codes WHERE email = ?').bind(normalized).first<{ code_hash: string; expires_at: number; attempts: number }>();
        if (!record || record.expires_at < Date.now() || record.attempts >= 5 || record.code_hash !== await hash(code)) {
          if (record) await env.DB.prepare('UPDATE verification_codes SET attempts = attempts + 1 WHERE email = ?').bind(normalized).run();
          return json({ error: 'That code is invalid or expired.' }, { status: 400 });
        }
        await env.DB.batch([
          env.DB.prepare('INSERT INTO users (email, role, verified_at, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET verified_at = excluded.verified_at').bind(normalized, 'customer', now(), now()),
          env.DB.prepare('DELETE FROM verification_codes WHERE email = ?').bind(normalized),
        ]);
        const token = crypto.randomUUID() + crypto.randomUUID();
        await env.DB.prepare('INSERT INTO sessions (token_hash, email, expires_at, created_at) VALUES (?, ?, ?, ?)').bind(await hash(token), normalized, Date.now() + 30 * 24 * 60 * 60_000, now()).run();
        return json({ ok: true, user: { email: normalized } }, { headers: { 'set-cookie': `dc_session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000` } });
      }
      if (url.pathname === '/api/account') {
        const user = await readUser(request, env);
        if (!user) return json({ error: 'Sign in required.' }, { status: 401 });
        const orders = await env.DB.prepare('SELECT id, subtotal_cents as subtotalCents, status, created_at as createdAt FROM orders WHERE email = ? ORDER BY created_at DESC').bind(user.email).all();
        return json({ user, orders: orders.results });
      }
      if (url.pathname === '/api/orders' && request.method === 'POST') {
        const user = await readUser(request, env);
        if (!user) return json({ error: 'Verify your email before creating an order.' }, { status: 401 });
        const body = await request.json<OrderInput>();
        if (!Array.isArray(body.items) || !Number.isInteger(body.subtotalCents) || body.subtotalCents < 0) return json({ error: 'Invalid order.' }, { status: 400 });
        const id = `DC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
        await env.DB.prepare('INSERT INTO orders (id, email, items_json, subtotal_cents, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id, user.email, JSON.stringify(body.items), body.subtotalCents, 'pending_payment', now(), now()).run();
        return json({ ok: true, orderId: id });
      }
      if (url.pathname === '/api/owner/orders') {
        const user = await readUser(request, env);
        if (!user || user.role !== 'owner') return json({ error: 'Owner access required.' }, { status: 403 });
        const orders = await env.DB.prepare('SELECT id, email, subtotal_cents as subtotalCents, status, created_at as createdAt FROM orders ORDER BY created_at DESC LIMIT 100').all();
        return json({ orders: orders.results });
      }
      return json({ error: 'Not found' }, { status: 404 });
    } catch (error) {
      console.error(JSON.stringify({ event: 'api_error', path: url.pathname, error: error instanceof Error ? error.message : 'unknown' }));
      return json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
  },
} satisfies ExportedHandler<Env>;
