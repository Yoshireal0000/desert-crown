# Desert Crown

Premium, mobile-first storefront for Desert Crown's hooded farwa collection. Built with React, TypeScript, Vite, and Cloudflare Workers static assets.

## Local development

```bash
npm install
npm run dev
```

Run `npm run build` for the production build and `npm run lint` for static linting.

## Cloudflare deployment

The included `wrangler.jsonc` serves the Vite `dist/` folder as a single-page application, including direct route support.

```bash
npm run build
npx wrangler deploy
```

Authenticate with `wrangler login` (or the official Cloudflare MCP OAuth setup) before the first deployment. No secrets are required for the current storefront. Use `.env.example` as the source for future public environment variables; never commit real keys.

## Content and images

- Product details and prices live near the top of `src/App.tsx` in the `ps` collection.
- The original collection photo is `public/desert-crown-collection.png`. Replace it with your own licensed photography using the same filename, or update its references in `src/App.tsx`.
- Color backgrounds and typography are defined in `src/App.css`.
- Checkout is intentionally a clear coming-soon state. Connect a payment provider only after its credentials and backend flow are configured.
- Contact and email signup forms are UI-only placeholders. Connect a vetted form/email provider or Worker endpoint before collecting customer data.
