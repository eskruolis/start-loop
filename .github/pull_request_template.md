## What and why

<!-- 1–3 bullets: what changed, and the reason (link the task if there is one) -->

-

## How to try it

<!-- Steps a non-developer can follow on the preview: "open Sales, add a sale, search for it" -->

1.

## Checks

- [ ] `pnpm check` and `pnpm build` pass
- [ ] `pnpm test:e2e` passes (UI changes)
- [ ] New logic has unit tests; fixed bugs have a regression test
- [ ] Looked at on a phone and a desktop, in light and dark (`/verify-ui`)
- [ ] Migration included and only adds things (if a table changed)
- [ ] New env vars in `src/server/env.ts`, `.env.example`, `docs/ENVIRONMENT.md` (names only)
- [ ] AGENTS.md / docs updated if a rule or command changed

## Deploy steps

<!-- Migrations to apply, env vars to set, scripts to run after deploy. "None" if none. -->

None.

## Screenshots

<!-- Phone and desktop for visual changes. Delete if none. -->
