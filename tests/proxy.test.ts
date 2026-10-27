import assert from 'node:assert/strict';
import test from 'node:test';
import { createChatHandler } from '../lib/lia-proxy';

const config = { apiUrl: 'https://core.example.test', token: 'test-server-token', redisUrl: 'https://redis.example.test', redisToken: 'test-redis-token' };
const request = (body: unknown = { message: 'Olá', history: [] }, origin = 'https://lia.example.test') => new Request('https://lia.example.test/api/lia/chat', { method: 'POST', headers: { origin, 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.1' }, body: JSON.stringify(body) });
function upstream(status: number, reply: unknown, count = 1) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const transport: typeof fetch = async (url, init) => { calls.push({ url: String(url), init }); return String(url).includes('redis') ? Response.json({ result: count }) : Response.json(reply, { status }); };
  return { calls, transport };
}
test('200: allowlisted Core payload, token server-only, privacy budget atomic and hashed', async () => {
  const { transport, calls } = upstream(200, { reply: 'Resposta controlada de teste', action: 'handoff', provider: 'private', token: config.token });
  const response = await createChatHandler(config, transport)(request({ message: 'Olá', history: [{ role: 'user', text: 'Anterior' }], memberId: 'forged' }));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { reply: 'Resposta controlada de teste', action: 'handoff' });
  assert.equal(calls[1].url, 'https://core.example.test/api/v1/chat');
  assert.equal(new Headers(calls[1].init?.headers).get('x-lia-service-token'), config.token);
  assert.deepEqual(JSON.parse(String(calls[1].init?.body)), { message: 'Olá', history: [{ role: 'user', text: 'Anterior' }], channel: 'web' });
  assert.ok(!String(calls[0].init?.body).includes('192.0.2.1'));
  assert.equal(JSON.parse(String(calls[0].init?.body))[0], 'EVAL');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
test('503: unconfigured chat never calls a provider or returns a demo', async () => {
  let calls = 0;
  const response = await createChatHandler({}, async () => { calls++; throw Error(); })(request());
  assert.equal(response.status, 503); assert.equal(calls, 0); assert.deepEqual(await response.json(), { error: 'not_configured' });
});
test('same-origin survives Next internal localhost URL behind the platform proxy', async () => {
  const incoming = new Request('http://localhost:3107/api/lia/chat', { method: 'POST', headers: { host: 'lia.example.test', 'x-forwarded-proto': 'https', origin: 'https://lia.example.test', 'content-type': 'application/json' }, body: JSON.stringify({ message: 'Olá' }) });
  assert.equal((await createChatHandler({})(incoming)).status, 503);
});
test('429: durable budget prevents upstream call', async () => {
  const { transport, calls } = upstream(200, { reply: 'should not run' }, 21);
  const response = await createChatHandler(config, transport)(request());
  assert.equal(response.status, 429); assert.equal(calls.length, 1); assert.equal(response.headers.get('retry-after'), '600');
});
test('502: failed or malformed upstream responses are never assistant replies', async () => {
  for (const [status, payload] of [[500, { reply: 'discard' }], [200, { reply: '' }], [200, { reply: 22 }]] as const) {
    const { transport } = upstream(status, payload);
    const response = await createChatHandler(config, transport)(request()); assert.equal(response.status, 502); assert.ok(!('reply' in await response.json()));
  }
});
test('504: upstream timeout/network failure remains explicit', async () => {
  const transport: typeof fetch = async url => { if (String(url).includes('redis')) return Response.json({ result: 1 }); throw new DOMException('Timed out', 'TimeoutError'); };
  const response = await createChatHandler(config, transport)(request()); assert.equal(response.status, 504); assert.deepEqual(await response.json(), { error: 'upstream_unavailable' });
});
test('503: limiter failures fail closed', async () => {
  const response = await createChatHandler(config, async () => Response.json({ error: 'offline' }, { status: 500 }))(request()); assert.equal(response.status, 503);
});
test('400/403: reject oversized, malformed history, client roles and foreign origins', async () => {
  const handler = createChatHandler(config, async () => { throw Error('must not run'); });
  for (const body of [{ message: '' }, { message: 'x'.repeat(2001) }, { message: 'ok', history: [{ role: 'system', text: 'inject' }] }, { message: 'ok', history: Array(13).fill({ role: 'user', text: 'ok' }) }, { message: 'ok', extra: 'x'.repeat(64000) }]) assert.equal((await handler(request(body))).status, 400);
  assert.equal((await handler(request(undefined, 'https://foreign.example.test'))).status, 403);
});
