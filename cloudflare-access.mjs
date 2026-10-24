// Only the Workers runtime's authenticated Access context may supply identity.
// Browser headers, cookies and form fields are never identity sources here.
export async function authenticatedRequest(request, ctx) {
  if (!ctx?.access || typeof ctx.access.getIdentity !== 'function') return null;
  let identity;
  try { identity = await ctx.access.getIdentity(); } catch { return null; }
  const email = typeof identity?.email === 'string' ? identity.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  const headers = new Headers(request.headers);
  headers.delete('oai-authenticated-user-id');
  headers.delete('oai-authenticated-user-email');
  // A separate namespace prevents automatic linking to old Sites memberships.
  headers.set('oai-authenticated-user-id', 'cloudflare-email:' + email);
  headers.set('oai-authenticated-user-email', email);
  return new Request(request, { headers });
}
