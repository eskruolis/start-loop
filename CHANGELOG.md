# Changelog

All notable changes, newest first. Format: [Keep a Changelog](https://keepachangelog.com/),
versions: [Semantic Versioning](https://semver.org/). Written by `/release`.

## [v0.1.0] — 2026-11-13

The starting point: a signed-in app with a dashboard and a Sales module that reads and writes
Postgres, Google Sheets or both.

### ✨ Features

- Sign up / sign in (the first account is admin), roles checked on the server.
- Dashboard: revenue, open amount, average sale, drafts; revenue by month and by category.
- Sales: searchable, sortable, paged list; create, edit and delete in dialogs; money in cents.
- Data layer: one Repository interface with Postgres, Google Sheets and memory adapters, chosen per module.
- Scripts: local Postgres for development, migrations, demo seed, Sheets check and Sheets → Postgres copy.
- Light, dark and system themes; phone and desktop layouts.
