#!/usr/bin/env bash
# One-time setup of a fresh copy of start-loop. Safe to run again: every step skips what is done.
#   ./setup.sh            everything
#   ./setup.sh --no-browsers   skip the Playwright browser download (~150 MB)
set -euo pipefail
cd "$(dirname "$0")"

say()  { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }
ok()   { printf '  ✓ %s\n' "$1"; }
warn() { printf '  ! %s\n' "$1"; }
fail() { printf '  ✖ %s\n' "$1"; exit 1; }

WANT_NODE="$(tr -d 'v \n' < .nvmrc)"

say "Node $WANT_NODE"
if ! node -v 2>/dev/null | grep -q "^v$WANT_NODE\."; then
  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  if command -v nvm >/dev/null 2>&1; then
    nvm install "$WANT_NODE" >/dev/null && nvm use "$WANT_NODE" >/dev/null
  else
    fail "Node $WANT_NODE is needed. Install nvm (https://github.com/nvm-sh/nvm), then run ./setup.sh again."
  fi
fi
ok "node $(node -v)"

say "pnpm"
if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || fail "Run 'corepack enable' (or 'npm i -g pnpm'), then ./setup.sh again."
fi
ok "pnpm $(pnpm -v)"

say "Git"
command -v git >/dev/null 2>&1 || fail "Install git first (macOS: xcode-select --install)."
if [ ! -d .git ]; then git init -b main >/dev/null && ok "new repository on branch main"; else ok "repository found"; fi

say "Packages"
pnpm install --frozen-lockfile
ok "installed (git hooks installed by lefthook)"
pnpm exec lefthook install >/dev/null 2>&1 || true

say ".env.local"
if [ -f .env.local ]; then
  ok "already there, left as it is"
else
  cp .env.example .env.local
  SECRET="$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")"
  # Replace the placeholder line without printing the secret.
  node -e '
    const fs = require("fs"); const p = ".env.local";
    const s = fs.readFileSync(p, "utf8").replace(/^BETTER_AUTH_SECRET=.*$/m, "BETTER_AUTH_SECRET=" + process.argv[1]);
    fs.writeFileSync(p, s);
  ' "$SECRET"
  ok "created from .env.example with a fresh BETTER_AUTH_SECRET"
fi

if [ "${1:-}" != "--no-browsers" ]; then
  say "Browser for the UI tests"
  pnpm exec playwright install chromium
  ok "chromium ready (pnpm test:e2e)"
fi

say "Database"
pnpm db:migrate
ok "local Postgres ready, tables created"

say "Tools for working with Claude Code (optional, checked only)"
command -v claude >/dev/null 2>&1 && ok "claude $(claude --version 2>/dev/null | head -1)" \
  || warn "Claude Code not found: https://claude.com/claude-code"
command -v gh >/dev/null 2>&1 && ok "gh found (pull requests from Claude)" \
  || warn "GitHub CLI not found (brew install gh, then gh auth login): needed for /ship and /release"
if command -v claude >/dev/null 2>&1; then
  if claude plugin list 2>/dev/null | grep -q "reflect-mod"; then
    ok "reflect-mod installed"
  else
    warn "reflect-mod not installed yet. Claude Code offers it when you trust this folder, or run:"
    printf '      claude plugin marketplace add bayramannakov/claude-reflect\n'
    printf '      claude plugin install reflect-mod@claude-reflect-marketplace\n'
  fi
fi

say "Checks"
pnpm check >/dev/null 2>&1 || fail "pnpm check found problems: run it to see them."
ok "types, lint and unit tests pass"

printf '\n\033[1mDone.\033[0m Next:\n  pnpm dev        → http://localhost:3000 (the first account becomes the admin)\n  pnpm db:seed    → demo data, in a second terminal\n  claude          → start building (see "Build it with Claude Code" in README.md)\n\n'
