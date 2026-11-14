# Git, pull requests, versions

## Branches

- `main` = production. Protected: changes only through pull requests with green checks (set this in GitHub → Settings → Branches → add rule for `main`: require a pull request and the `ci` and `pr-title` checks). In Settings → General → Pull Requests allow **squash merging** only, with the default message "Pull request title", so every PR is one well-named commit on `main`.
- One branch per change, from up-to-date `main`: `feat/<what>`, `fix/<what>`, `chore/<what>`, `docs/<what>`.
- Small PRs (one feature or fix). Several small ones beat one big one.
- When real users depend on the app, add a `dev` branch as staging (deployed to a staging URL with its own database): features merge into `dev`, and a release PR moves `dev` → `main`. Until then `main` is enough.

## Commits (Conventional Commits)

Every commit follows [Conventional Commits](https://www.conventionalcommits.org): `type(scope): description`.
commitlint checks each commit (git hook) and each PR title (CI) with the standard preset.

```
feat(sales): export the list as CSV
fix(sheets): read dates written as 13/11/2026
docs: explain DATA_SOURCE_<MODULE>
feat(sales)!: store amounts in cents
```

- Types: `feat`, `fix`, `perf`, `refactor`, `docs`, `test`, `build`, `ci`, `chore`, `style`, `revert`.
- The type decides the next version: `feat` → minor, `fix` and the rest → patch, `!` or a `BREAKING CHANGE:` footer → major.
- English. PRs are squash-merged, so the PR title becomes the commit on `main`.

## Pull requests

Use `/ship`. It: merges the latest `main`, runs every check (`pnpm check`, `pnpm build`, `pnpm test:e2e`),
opens the PR with the template, reviews its own diff (critical / warning / nit), fixes criticals
and warnings in one commit, and comments a review summary. Merge when CI is green.

Before pushing more commits to an open PR, check it was not merged meanwhile:
`gh pr view --json state,mergedAt`. A merged PR needs a new branch and PR.

## Releases

Use `/release`. It lists the commits since the last tag, groups them (Features, Fixes, …), proposes
the version, writes `CHANGELOG.md`, tags `vX.Y.Z` and creates a GitHub release. Before 1.0 the
version stays `0.x`; `1.0.0` is the day the business runs on the app.

## Dependencies

- Versions are pinned exactly in `package.json` (no `^`) for the framework pieces, so a fresh install builds the same app.
- Upgrade on purpose, one area per PR (`chore(deps): …`), reading the release notes (caching and breaking changes), then the full check including e2e.
- The README's version badges are typed by hand: update them with the upgrade (a test fails until they match `package.json`).
- `pnpm-lock.yaml` is committed; CI installs with `--frozen-lockfile`.
