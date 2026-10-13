# Noir website

The public site and developer docs, built with Next.js (App Router) as a static export.

```bash
npm ci
npm run dev      # http://localhost:3000
npm run build    # static site in out/
```

- Deployed to GitHub Pages by `.github/workflows/pages.yml` on pushes to `main`;
  the workflow sets `NEXT_PUBLIC_BASE_PATH` / `NEXT_PUBLIC_SITE_URL` for the Pages URL.
- Pages: `/` (product) and `/docs/*` (quickstart, SDK, REST API, webhooks, contracts).
- SEO: per-page metadata (title, description, canonical, Open Graph, Twitter),
  JSON-LD (Organization, MobileApplication, FAQPage, TechArticle, BreadcrumbList),
  `sitemap.xml`, `robots.txt`, `manifest.webmanifest` and a 1200×630 share card (`public/og.png`).
- Contract IDs, release links and other facts live in `lib/site.ts`; update them there after a redeploy.
