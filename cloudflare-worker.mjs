import { api } from './server.mjs';
import { authenticatedRequest } from './cloudflare-access.mjs';
import assets from '../dist-cloudflare/assets.mjs';

export default {
  async fetch(request, env, ctx) {
    const verified = await authenticatedRequest(request, ctx);
    if (!verified) return new Response('Sign-in is required. The administrator must enable Cloudflare Access for all traffic.', {
      status: 401, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }
    });
    const path = new URL(request.url).pathname;
    if (path.startsWith('/api/')) return api(verified, env, ctx);
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405 });
    const asset = assets[path];
    if (!asset) return new Response('Not found', { status: 404 });
    return new Response(request.method === 'HEAD' ? null : asset.body, { headers: {
      'content-type': asset.type, 'cache-control': 'no-store',
      'x-content-type-options': 'nosniff', 'referrer-policy': 'same-origin',
      'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' blob: data:; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
    }});
  }
};
