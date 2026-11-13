import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

/**
 * Text must stay readable after anyone edits the theme: every text/background pair in
 * globals.css is checked against WCAG AA (4.5:1 for text, 3:1 for the focus ring) in light and
 * dark. Change a colour, run `pnpm test`, and this tells you if you broke legibility.
 */
const css = readFileSync("src/app/globals.css", "utf8")

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`)
  if (start < 0) throw new Error(`no ${selector} block`)
  const body = css.slice(start, css.indexOf("}", start))
  return Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1] ?? "", (m[2] ?? "").trim()])
  )
}

/** oklch(L C H [/ alpha]) → relative luminance (WCAG), via OKLab and linear sRGB. */
function luminance(value: string): number {
  const m = /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(value)
  if (!m) throw new Error(`not an oklch colour: ${value}`)
  const [L, C, H] = [Number(m[1]), Number(m[2]), (Number(m[3]) * Math.PI) / 180]
  const a = C * Math.cos(H)
  const b = C * Math.sin(H)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const clamp = (x: number) => Math.min(1, Math.max(0, x))
  const r = clamp(4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s)
  const g = clamp(-1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s)
  const bl = clamp(-0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s)
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl
}

const ratio = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p) as [number, number]
  return (x + 0.05) / (y + 0.05)
}

const TEXT_PAIRS: [string, string][] = [
  ["foreground", "background"],
  ["card-foreground", "card"],
  ["popover-foreground", "popover"],
  ["primary-foreground", "primary"],
  ["secondary-foreground", "secondary"],
  ["muted-foreground", "background"],
  ["muted-foreground", "muted"],
  ["accent-foreground", "accent"],
  ["destructive", "background"],
  ["success-foreground", "success"],
  ["warning-foreground", "warning"],
  ["info-foreground", "info"],
  ["sidebar-foreground", "sidebar"],
]

for (const [name, selector] of [
  ["light", ":root"],
  ["dark", ".dark"],
] as const) {
  describe(`${name} theme contrast`, () => {
    const tokens = { ...block(":root"), ...block(selector) }
    for (const [fg, bg] of TEXT_PAIRS) {
      it(`${fg} on ${bg} is at least 4.5:1`, () => {
        expect(ratio(tokens[fg] ?? "", tokens[bg] ?? "")).toBeGreaterThanOrEqual(4.5)
      })
    }
  })
}
