# Rock Leopard / Bouldr Bar Stockroom

Phone-friendly stock management pilot for Bouldr Bar, Rock Leopard Brewery in Thamesmead.

## Features

Stock counts, deliveries, barcodes, recipes, wastage, transfers, purchase orders, role-based workspaces, Square sales review and optional low-stock emails.

## Development

Use Node.js 22 or newer (tests use node:sqlite).

```sh
npm ci
npm run build
npm test
```

Targets Cloudflare Workers with Sites-managed authentication, D1 (DB) and R2 (BUCKET). GitHub stores the source; it does not host this backend. Other hosting requires equivalent storage bindings and a replacement trusted authentication layer.

## Configuration

`.env.example` contains empty credential settings. Keep real API keys in server-side hosting secrets. This source backup excludes live stock records, uploaded photos and runtime secrets.

See [RELEASE.md](RELEASE.md) for functionality and limitations.

## Snapshot

Source commit: `378102adec6c8423368e378df1d9b960aa255dff`. Exported 19 October 2026. Build and all 37 existing tests passed before export.
