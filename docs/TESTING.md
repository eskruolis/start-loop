# Testing

| Kind       | Where                                                   | Runs with                    | What it proves                                                            |
| ---------- | ------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------- |
| Unit       | `src/**/__tests__/*.test.ts`                            | `pnpm test` (Vitest)         | pure logic, mapping, validation, the theme's contrast                     |
| Contract   | `src/server/data/__tests__/repository-contract.test.ts` | `pnpm test`                  | every data source behaves the same (memory and a real in-memory Postgres) |
| End-to-end | `e2e/*.spec.ts`                                         | `pnpm test:e2e` (Playwright) | a person can do the job, on a desktop and a phone                         |
| By eye     | the browser                                             | `/verify-ui` skill           | the screen is right: layout, states, both themes                          |

## Unit tests

- One test file per logic file, next to it in `__tests__/`.
- Test behaviour with real-looking data ("1.234,50 €", 31 December at 23:30 UTC), including edge cases.
- Every bug fix adds a test that fails without the fix.

## End-to-end tests

- Written like a person uses the app: `getByRole`, `getByLabel`, visible text. No CSS selectors, no reaching into the database.
- `e2e/auth.setup.ts` creates the admin once; tests reuse the sign-in. Tests that need another user (a member) sign up inside the test.
- Each run starts its own dev server on port 3200 with its own build folder (`.next-e2e`), its own empty database (temp folder) and its own Postgres port, so it can run while your `pnpm dev` is running and never touches your data.
- Every file Playwright writes goes to the temp folder (a file written inside the project reloads the dev server's pages).
- Two projects: `desktop` (Chrome) and `phone` (Pixel 7). A feature is not done until both pass.
- On failure: the screenshot, page snapshot and trace are printed; open a trace with `pnpm exec playwright show-trace <path>`.

## Checking by eye (`/verify-ui`)

After a UI change, open it in the browser and look, as the person using it would:
phone (375 px) and desktop; light and dark; empty list, full list, a very long value; the error
state (submit an empty form); keyboard only. Screenshots in the PR for visual changes.

## When tests run

- `git commit` → Biome formats staged files.
- `git push` → typecheck + unit tests (lefthook).
- Pull request → CI runs lint, typecheck, unit tests, build and e2e.
