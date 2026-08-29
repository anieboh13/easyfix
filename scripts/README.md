# scripts/

One-off utility scripts, not part of the running app.

- **`seed-token.js`** — one-time setup: exchanges an AliExpress OAuth code
  for your first access/refresh token pair, saved to the database. See the
  comment at the top of the file for how to get a fresh code. Only needed
  again if AliExpress revokes access, you switch app credentials, or
  you're setting the project up fresh somewhere new.

- **`get-sku.js`** — debug helper: prints the raw SKU/variant API response
  for one product, useful when you need to see exactly what AliExpress
  returns without digging through the app. Edit the `product_id` at the
  top, then run `node scripts/get-sku.js`.

Both scripts read credentials from `.env` — make sure yours is filled in
before running either one.