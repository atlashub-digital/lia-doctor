import { createHmac } from 'node:crypto';

type Config = { apiUrl?: string; token?: string; redisUrl?: string; redisToken?: string };
type Turn = { role: 'user' | 'assistant'; text: string };
const headers = { 'cache-control': 'no-store', 'content-type': 'application/json; charset=utf-8' };
function json(error: string, status: number) { return Response.json({ error }, { status, headers }); }

async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid');
  const decoder = new TextDecoder(); let length = 0, text = '';
  try {
    for (;;) { const { done, value } = await reader.read(); if (done) break; length += value.byteLength; if (length > 64_000) { await reader.cancel(); throw new Error('too_large'); } text += decoder.decode(value, { stream: true }); }
    return JSON.parse(text + decoder.decode()) as unknown;
  } finally { reader.releaseLock(); }
}
function parse(body: unknown): { message: string; history: Turn[] } | null {
  if (!body || typeof body !== 'object') return null;
  const { message, history } = body as Record<string, unknown>;
  if (typeof message !== 'string' || !message.trim() || message.trim().length > 2000) return null;
  if (history !== undefined && (!Array.isArray(history) || history.length > 12)) return null;
  const turns: Turn[] = [];
  for (const turn of (history || []) as unknown[]) {
    if (!turn || typeof turn !== 'object') return null;
    const { role, text } = turn as Record<string, unknown>;
    if ((role !== 'user' && role !== 'assistant') || typeof text !== 'string' || !text.trim() || text.length > 4000) return null;
    turns.push({ role, text });
  }
  // Identity, clinical context and arbitrary client properties are never forwarded.
  return { message: message.trim(), history: turns };
}

/** Core contract confirmed against levelab-lia/src/chat/{chat.controller,chat.dto}.ts.
 * Durable abuse budget fails closed when Redis is unavailable; no local demo.
 * No prompts, replies, IP addresses or credentials are logged or persisted here.
 */
export function createChatHandler(config: Config, requestFetch: typeof fetch = fetch) {
  return async function handle(request: Request) {
    const requestUrl = new URL(request.url);
    // Next's internal request URL may use localhost behind a reverse proxy.
    // Compare to the incoming Host and platform-supplied protocol, not that URL.
    const host = request.headers.get('host') || requestUrl.host;
    const protocol = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() || requestUrl.protocol.slice(0, -1);
    if (request.headers.get('origin') && request.headers.get('origin') !== `${protocol}://${host}`) return json('invalid_origin', 403);
    if (!request.headers.get('content-type')?.startsWith('application/json')) return json('invalid_request', 400);
    let parsed;
    try { parsed = parse(await readBody(request)); } catch { return json('invalid_request', 400); }
    if (!parsed) return json('invalid_request', 400);
    const { apiUrl, token, redisUrl, redisToken } = config;
    if (!apiUrl || !token || !redisUrl || !redisToken) return json('not_configured', 503);
    try {
      if (new URL(apiUrl).protocol !== 'https:' || new URL(redisUrl).protocol !== 'https:') return json('not_configured', 503);
    } catch { return json('not_configured', 503); }
    try {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const key = `lia:public:${createHmac('sha256', token).update(ip).digest('hex')}`;
      // One atomic fixed-window counter shared by all server instances; TTL 10 min.
      const script = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],600) end; return n";
      const budget = await requestFetch(redisUrl, { method: 'POST', headers: { authorization: `Bearer ${redisToken}`, 'content-type': 'application/json' }, body: JSON.stringify(['EVAL', script, '1', key]), cache: 'no-store', signal: AbortSignal.timeout(3000) });
      if (!budget.ok) return json('limiter_unavailable', 503);
      const count = await budget.json() as { result?: unknown };
      if (typeof count.result !== 'number' || !Number.isFinite(count.result)) return json('limiter_unavailable', 503);
      if (count.result > 20) return Response.json({ error: 'rate_limited' }, { status: 429, headers: { ...headers, 'retry-after': '600' } });
    } catch { return json('limiter_unavailable', 503); }
    try {
      const response = await requestFetch(`${apiUrl.replace(/\/$/, '')}/api/v1/chat`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-lia-service-token': token }, body: JSON.stringify({ ...parsed, channel: 'web' }), cache: 'no-store', signal: AbortSignal.timeout(25_000) });
      if (!response.ok) return json('upstream_error', response.status === 429 ? 429 : 502);
      const data: unknown = await response.json();
      if (!data || typeof data !== 'object' || !('reply' in data) || typeof data.reply !== 'string' || !data.reply.trim() || data.reply.length > 16000) return json('empty_reply', 502);
      return Response.json({ reply: data.reply, action: 'action' in data && data.action === 'handoff' ? 'handoff' : 'reply' }, { headers });
    } catch { return json('upstream_unavailable', 504); }
  };
}
