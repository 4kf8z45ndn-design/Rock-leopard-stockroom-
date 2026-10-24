import fs from 'node:fs';
fs.mkdirSync('dist-cloudflare', { recursive: true });
const assets = {};
for (const [path, file, type] of [['/', 'index.html', 'text/html'], ['/app.js', 'app.js', 'text/javascript'], ['/style.css', 'style.css', 'text/css']]) {
  let body = fs.readFileSync('web/' + file, 'utf8');
  if (file === 'index.html') body = body.replace('<div class="header-controls">', '<div class="header-controls"><a class="secondary" href="/cdn-cgi/access/logout">Sign out</a>');
  if (file === 'app.js') body = body
    .replaceAll('close this page and reopen the stockroom from your signed-in ChatGPT account.', 'sign out, then reopen the stockroom and sign in with your approved work email.')
    .replaceAll('People need access to this private Site and a business membership. Codes do not send messages or change Site sharing.', 'People need an approved email and a business membership. Give each colleague their own access code after their email is approved.');
  assets[path] = { body, type: type + '; charset=utf-8' };
}
fs.writeFileSync('dist-cloudflare/assets.mjs', 'export default ' + JSON.stringify(assets) + ';\n');
console.log('Built independent Cloudflare stockroom assets.');
