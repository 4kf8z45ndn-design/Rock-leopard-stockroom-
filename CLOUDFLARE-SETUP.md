# Staff sign-in without ChatGPT

This independent deployment uses Cloudflare Access email PINs. Each approved
person uses their own email; no ChatGPT or GitHub account is needed to use the app.
The hosting administrator needs a company Cloudflare account. This branch is
prepared code, not a published service. Production Access login still needs testing.

## Company hosting setup

1. Create or use the company's Cloudflare account and enable Zero Trust.
   Give Joshua and the company representative separate administrator access.
   Review the chosen service plan and any billing requirements before enabling it.
2. Check out this branch and use Node 22 or newer. Install Wrangler 4 using your
   package manager. Run `wrangler login` in your own terminal; do not share tokens
   or passwords in chat or commit them to GitHub.
3. Run `wrangler d1 create bouldr-stockroom`. Put the returned database ID in
   `wrangler.jsonc`, replacing the explicit placeholder.
4. Run `wrangler r2 bucket create bouldr-stockroom-photos`.
5. Run `wrangler d1 migrations apply DB --remote` to create the tables in the new,
   empty company database. Review the target account before confirming.
6. Run `node scripts/build-cloudflare.mjs`, `node --test tests/*.test.mjs`, then
   `wrangler deploy`. Wrangler's build hook also regenerates the web assets.
   Save the URL returned by deployment; do not guess the hostname.
7. In Workers & Pages, select this Worker, open **Access**, and protect **All
   traffic**, including production. In Zero Trust configure the Access application
   with an **Allow** policy listing only approved individual email addresses.
   Do not use Everyone, a Bypass policy, or the entire company email domain.
8. Add **One-time PIN** under Zero Trust identity providers/login methods and
   enable it for this application. Staff enter their approved email and the code
   emailed to them. The website checks the runtime's verified `ctx.access`
   identity on every request, so even an unprotected hostname fails closed.

## Staff and business setup

The requested first company email is `chewthefat@bouldrbar.com`. Add Joshua's
confirmed sign-in email as well. For individually attributable stock changes,
each staff member needs their own mailbox rather than sharing the company inbox.

After login, the designated business owner creates the business once. In Settings,
create a staff or manager access code for each colleague. The colleague signs in
with their approved email and selects **Join with an access code**. Approving an
email permits entry to the website; the access code grants membership in the
specific stockroom. Codes expire after 24 hours and are single-use.

The website's **Sign out** link ends its Access session. Test signing out and back
in as a different person on the shared company computer before use.

## Existing records and integrations

This creates a separate database and photo bucket. The GitHub export does not
contain live stock records or uploaded photographs. Nothing is migrated by these
commands. If the old Site contains real records, retain it and arrange a verified
database/photo export and restore before switching staff over. The app's current
JSON export alone is not a complete backup or a self-service restore.

Access identities use `cloudflare-email:<normalised email>`; old Sites memberships
are deliberately not linked automatically. Any migration must explicitly map
verified owners/members and preserve their business roles.

Square and notification settings remain optional server-side secrets, described
in `.env.example`. They do not move from ChatGPT hosting automatically. No AI
provider is required for core stock management; photo recognition is not connected.

## Acceptance checks before staff use

- An unapproved email cannot log in; spoofed identity headers cannot read data.
- Two approved people join the same business and see the same saved stock.
- Staff cannot edit products or manage access; viewers cannot change stock.
- A count survives a page reload and appears in the history under the right user.
- A delivery photograph uploads and can only be read by members of its business.
- Sign out prevents further API access until sign-in.

Local tests cover the trusted identity boundary and existing business permissions.
They do not prove the company's live Access policy, email delivery or storage setup.

## References

- https://developers.cloudflare.com/workers/configuration/cloudflare-access/
- https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/
- https://developers.cloudflare.com/workers/wrangler/commands/d1/
- https://developers.cloudflare.com/workers/wrangler/commands/r2/

The original Sites build remains available through `npm run build`. Only the
independent build uses the new entry point; do not deploy the original Sites
entry point on independent hosting because it trusts platform-supplied headers.
