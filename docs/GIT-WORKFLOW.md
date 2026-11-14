# Git, pull requests, versions

## Branches

- `main` = production. Protected: changes only through pull requests with green checks (set this in GitHub → Settings → Branches → add rule for `main`: require a pull request and the `ci` and `pr-title` checks). In Settings → General → Pull Requests allow **squash merging** only, with the default message "Pull request title", so every PR is one well-named commit on `main`.
- One branch per change, from up-to-date `main`: `feat/<what>`, `fix/<what>`, `chore/<what>`, `docs/<what>`.
- Small PRs (one feature or fix). Several small ones beat one big one.
- When real users depend on the app, add a `dev` branch as staging (deployed to a staging URL with its own database): features merge into `dev`, and a release PR moves `dev` → `main`. Until then `main` is enough.

## Commits (Conventional Commits)

The `commit-msg` hook checks every commit and CI checks every PR title (`scripts/lib/commit-message.ts`,
one rule set for both). A refused commit prints what is wrong and an example; fix the message, never
skip the hook with `--no-verify`.

```
type(scope): what changed            ← first line, ≤ 72 characters
                                     ← empty line
Why, when it is not obvious: the     ← body, optional, wrapped near 72
problem, the reason for this way.
                                     ← empty line
BREAKING CHANGE: what breaks and     ← footer, only for breaking changes
how to upgrade.
Refs: #42                            ← links to issues or tasks
```

| Type       | When                                              | Version           |
| ---------- | ------------------------------------------------- | ----------------- |
| `feat`     | something new users can do                        | minor (0.**3**.0) |
| `fix`      | a bug fixed                                       | patch (0.2.**1**) |
| `perf`     | faster, same behaviour                            | patch             |
| `refactor` | code restructured, same behaviour                 | patch             |
| `docs`     | documentation only                                | patch             |
| `test`     | tests only                                        | patch             |
| `build`    | dependencies, tooling, build                      | patch             |
| `ci`       | GitHub workflows                                  | patch             |
| `chore`    | anything else that ships nothing                  | patch             |
| `revert`   | undoes an earlier commit (`git revert` writes it) | patch             |

`!` after the type (`feat(sales)!: …`) or a `BREAKING CHANGE:` footer → major. Before 1.0 a breaking change is called out in the changelog but the version stays `0.x`.

**Scope** = the module or area touched, lowercase: `sales`, `invoices`, `sheets`, `postgres`, `auth`, `ui`, `deps`. One scope; leave it out when the change spans everything.

**Subject:**

- English, a command that completes "This commit will …": `add`, `fix`, `show`, `remove` (not `added`, `fixes`).
- Lowercase start, no full stop, no ticket number (that goes in the footer).
- Says what changed for the user or the code, not how you felt about it.

| ✗                                    | ✓                                                        |
| ------------------------------------ | -------------------------------------------------------- |
| `fix stuff`                          | `fix(sales): keep the total when a sale is edited twice` |
| `Updated sales page.`                | `feat(sales): filter the list by customer`               |
| `wip`                                | (commit when one step works; squash before the PR)       |
| `feat: sales, auth, charts and deps` | four commits, one per change                             |

**Commit habits:**

- One logical change per commit, each one leaving the app working (tests pass). Formatting-only and dependency bumps are their own commits.
- Commit generated files with their source: a schema change and its `drizzle/` migration in the same commit.
- Never rewrite pushed history on a shared branch (`--force`, `--amend` after push). On your own unmerged branch, `git push --force-with-lease` only.
- PRs are squash-merged: the PR title becomes the one commit on `main`, so it follows the same rules (CI checks it).
- Commits Claude makes follow these rules too, plus the `Co-Authored-By` line Claude Code adds.

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
- `pnpm-lock.yaml` is committed; CI installs with `--frozen-lockfile`.
