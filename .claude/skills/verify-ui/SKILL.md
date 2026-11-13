---

name: verify-ui
description: Check a UI change in the browser the way a person uses it - phone and desktop, light and dark, empty/full/long/error states, keyboard - and report with screenshots
---

# /verify-ui [page or feature]

Tests passing is not the same as the screen being right. Look at it.

1. Start the app with the `app` entry of `.claude/launch.json` (preview tool), sign in (create an account on a fresh database; the first one is admin), seed demo data if useful (`pnpm db:seed` while the app runs).
2. For each changed page, at **375×812 (phone)** and **1280×800 (desktop)**, in **light** and **dark**:
   - first load: no layout jump, the loading skeleton appears and is replaced cleanly;
   - empty state, a full list, a very long value (60+ characters) in every text field;
   - the main action end to end (create, edit, delete) by clicking and typing, not by calling code;
   - the error path: submit an empty form, a wrong value;
   - keyboard only: Tab through, Enter submits, Esc closes dialogs;
   - nothing is wider than the screen, nothing overlaps, numbers line up right.
3. Compare with the existing screens: same header, spacing, buttons and badges. No new styles.
4. Report: what was checked, screenshots of each changed screen (phone + desktop), and every problem found with where it is. Fix problems before calling the work done.
