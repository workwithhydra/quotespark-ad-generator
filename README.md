# quotespark-ad-generator (deprecated)

> **This tool has been migrated into [hydra-ops](https://github.com/workwithhydra/hydra-ops).**
> All visual ad generation, Meta shipping, and per-client performance tracking now lives in hydra-ops under `/ads/[clientId]`. New work should happen there.

The standalone deployment at `quotespark-ad-generator-kxa4usdox.vercel.app` is kept running for reference but no longer receives feature work. To archive this repo, GitHub → repo settings → Archive (manual step).

## What moved where

| Old (quotespark) | New (hydra-ops) |
|---|---|
| `lib/system-prompt.ts` (hardcoded prompt) | `clients.fields` JSON + `lib/ads/visual-prompt.ts` universal scaffold |
| `lib/clients.ts` (in-code client list) | `clients` table in Neon |
| `localStorage` ad batches | `adVisualConcepts` table |
| `components/AdRenderer{,916}.tsx` | `components/VisualAdRenderer.tsx` (single component, ratio prop) |
| `app/api/meta/{campaigns,adsets,create-ads,upload}` | `app/api/meta/*` + `lib/meta/client.ts` (with credential storage + perf sync) |

## Original docs (kept for reference)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

```bash
npm run dev
```
