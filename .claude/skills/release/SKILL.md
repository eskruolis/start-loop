---

name: release
description: Cut a release - group commits since the last tag, propose the SemVer version, write CHANGELOG.md, tag and publish a GitHub release, list deployment steps (migrations, env vars)
---

# /release

Run only when the owner asks for a release.

1. `git fetch origin --tags`; be on an up-to-date `main` with a clean working tree; CI green on `main`.
2. Range: last tag `git describe --tags --abbrev=0` (none → whole history) to `HEAD`. Nothing new → stop.
3. Group commit subjects: 💥 Breaking, ✨ Features, 🐛 Fixes, ⚡ Performance, ♻️ Refactors, 📝 Docs, 🏗️ Chores. Write each line for the business reader (what changed for them), scope first.
4. Propose the version (major for breaking, minor for features, else patch; stay on 0.x before launch) and **wait for the owner's confirmation**.
5. Deployment notes: new files in `drizzle/` (migrations: apply to production first, docs/DEPLOYMENT.md), new env vars (names only), new scheduled jobs or external services.
6. Prepend to `CHANGELOG.md` (Keep a Changelog: `## [vX.Y.Z] — YYYY-MM-DD`, one summary sentence, the groups, a compare link at the bottom), bump `version` in package.json, commit `chore(release): vX.Y.Z` through a PR (`/ship`) or, if the owner allows direct release commits, on `main`.
7. After it is on `main`: `git tag vX.Y.Z && git push origin vX.Y.Z`, then `gh release create vX.Y.Z --notes-file <the changelog section>`.
8. After the deploy: apply migrations if any, check `/api/health` on production, report the version and the steps done.
