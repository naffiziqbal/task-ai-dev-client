# client — PSL Litigation Operator UI

Next.js 15 (App Router) frontend for the PSL litigation workflow. Operators
upload documents, monitor ingest, generate drafts, edit them, and approve
learned style rules.

This is a standalone codebase. It does not share modules with the backend —
the small set of TypeScript types it consumes from the API live in
`src/api-types.ts`.

## Quick start

```bash
cp .env.example .env             # NEXT_PUBLIC_API_URL=http://localhost:4000
pnpm install
pnpm dev                         # next dev, listens on :3000
```

The backend must be running at `NEXT_PUBLIC_API_URL` for the UI to be useful —
see [`../backend/README.md`](../backend/README.md) for how to bring it up.

## Scripts

| script        | what it does                  |
| ------------- | ----------------------------- |
| `pnpm dev`    | `next dev` on port 3000       |
| `pnpm build`  | production build (`.next/`)   |
| `pnpm start`  | serve the production build    |

## Layout

```
src/
├── app/
│   ├── cases/                list, detail, upload
│   ├── cases/[id]/drafts/    editor + citation viewer
│   └── admin/style-rules/    learned-rule approval
├── lib/                      API client helpers
└── api-types.ts              local copy of the types the API returns
```
