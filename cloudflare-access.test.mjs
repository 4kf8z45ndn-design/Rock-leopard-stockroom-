import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticatedRequest } from '../src/cloudflare-access.mjs';
import worker from '../src/cloudflare-worker.mjs';

const signedIn = email => ({ access: { getIdentity: async () => ({ email }) } });
const spoofed = () => new Request('https://stock.example/api/bootstrap', { headers: {
  'oai-authenticated-user-id': 'owner', 'oai-authenticated-user-email': 'owner@example.com',
  'Cf-Access-Authenticated-User-Email': 'owner@example.com', 'Cf-Access-Jwt-Assertion': 'fake'
}});
test('forged identity headers cannot bypass Access for API or website', async () => {
  assert.equal(await authenticatedRequest(spoofed(), {}), null);
  assert.equal((await worker.fetch(spoofed(), {}, {})).status, 401);
  assert.equal((await worker.fetch(new Request('https://stock.example/'), {}, {})).status, 401);
});
test('missing, invalid and unavailable Access identities fail closed', async () => {
  for (const email of [undefined, '', 'invalid', 42]) assert.equal(await authenticatedRequest(spoofed(), signedIn(email)), null);
  assert.equal(await authenticatedRequest(spoofed(), { access: { getIdentity: async () => { throw Error('offline'); } } }), null);
});
test('verified email overrides forged owner identity and has a stable separate ID', async () => {
  const r = await authenticatedRequest(spoofed(), signedIn(' Staff@Example.com '));
  assert.equal(r.headers.get('oai-authenticated-user-id'), 'cloudflare-email:staff@example.com');
  assert.equal(r.headers.get('oai-authenticated-user-email'), 'staff@example.com');
  const other = await authenticatedRequest(spoofed(), signedIn('other@example.com'));
  assert.notEqual(other.headers.get('oai-authenticated-user-id'), r.headers.get('oai-authenticated-user-id'));
});
test('request body and CSRF headers survive authenticated forwarding', async () => {
  const r = await authenticatedRequest(new Request('https://stock.example/api/join', { method: 'POST', headers: { 'x-stockroom-request': '1', origin: 'https://stock.example' }, body: '{"code":"test"}' }), signedIn('staff@example.com'));
  assert.equal(await r.text(), '{"code":"test"}');
  assert.equal(r.headers.get('x-stockroom-request'), '1');
  assert.equal(r.headers.get('origin'), 'https://stock.example');
});
test('independent page offers sign out and has no ChatGPT sign-in instructions', async () => {
  const r = await worker.fetch(new Request('https://stock.example/'), {}, signedIn('staff@example.com'));
  assert.equal(r.status, 200);
  assert.match(await r.text(), /\/cdn-cgi\/access\/logout/);
  const js = await worker.fetch(new Request('https://stock.example/app.js'), {}, signedIn('staff@example.com'));
  assert.doesNotMatch(await js.text(), /ChatGPT/);
});
