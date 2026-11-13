# Design system

Plain, calm, readable: a neutral shadcn theme with light, dark and "follow the system", built for
long working days in tables and forms.

## Tokens (src/app/globals.css)

All colours are CSS variables in `:root` (light) and `.dark` (dark), exposed to Tailwind through
`@theme inline`. Use the Tailwind names, never raw colours.

| Use           | Classes                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------- |
| Page and text | `bg-background text-foreground`, secondary text `text-muted-foreground`                  |
| Surfaces      | `bg-card`, `bg-muted`, `bg-popover`, borders `border` (token `--border`)                 |
| Main action   | `Button` (default variant = `--primary`)                                                 |
| Danger        | `Button variant="destructive"`, text `text-destructive`                                  |
| Statuses      | `StatusBadge tone="success / warning / info / danger / neutral"`                         |
| Charts        | `var(--chart-1)` … `var(--chart-5)` (five hues that stay apart for colour-blind readers) |

**Branding** = change `--primary`, `--primary-foreground`, `--ring` (and the sidebar's) in both blocks,
then `pnpm test`: `theme-contrast.test.ts` fails if any text drops below 4.5:1 in either theme.

Radius comes from `--radius`. Font: Geist (sans) and Geist Mono, set in `app/layout.tsx`.

## Components

- **shadcn primitives** live in `src/components/ui` (generated). Add more with `pnpm dlx shadcn@4.23.0 add <name>`. Already added: alert-dialog, avatar, badge, breadcrumb, button, card, chart, checkbox, dialog, dropdown-menu, empty, field, input, label, popover, select, separator, sheet, sidebar, skeleton, sonner, spinner, table, tabs, textarea, tooltip.
- **App components** in `src/components/app`, the building blocks of every screen:
  - `PageHeader` — title, one line on what the page is for, the page's main actions.
  - `DataTable` — every list: search, sortable columns, pages, all in the URL; rows keyed by id; `meta.align: "right"` for numbers, `meta.hideBelow` to drop columns on phones.
  - `KpiCard` — a headline number with an ⓘ hint saying exactly what it counts.
  - `StatusBadge` — every state; each module maps its statuses to tones once.
  - `MoneyInput` — every amount field (typed text → cents).
  - `ThemeToggle`, `UserMenu`, `AppSidebar` — the shell.

## Screen patterns

- **List page:** `PageHeader` → `DataTable` (search left, main action right) → pagination. Empty list: `Empty` with what to do next.
- **Create / edit:** a `Dialog` with a form (see `sale-form-dialog.tsx`): labels on every field, required marked `*`, errors under the field, one primary button saying what it does ("Add sale", "Save changes"), cancel beside it. The dialog scrolls on small screens.
- **Delete:** an `AlertDialog` naming the record and saying it cannot be undone; the destructive button says "Delete".
- **Dashboard:** a row of `KpiCard`s, then charts in cards. Charts say their period in the description.
- **Detail page** (when a record has many fields or related lists): header with status and actions, then sections in cards.
- Icon-only buttons always have an `aria-label` (and a tooltip if the icon is not obvious).
- Toasts confirm what happened ("Sale added"); errors say what to do.

## Layout rules

- Phones first: 360 px must work. Secondary columns hide on small screens; forms stack.
- Spacing scale: `gap-2` inside a group, `gap-4` between groups, `gap-6` between page sections; page padding `p-4 md:p-6`. No one-off pixel values.
- Numbers right-aligned with tabular figures (`tabular-nums`, automatic in table cells).
- Long text truncates in tables (`truncate` with a max width), never widens the page.
- Focus is always visible (global `:focus-visible` ring). Motion is reduced when the system asks.

## Accessibility checklist for every new screen

- One `h1` per page (`PageHeader` does it); dialogs have titles.
- Every input has a label; errors are linked (`Field` + `FieldError`).
- Works with the keyboard alone (Tab, Enter, Esc).
- Text contrast ≥ 4.5:1 in both themes (the test checks tokens; check custom combinations by eye).
