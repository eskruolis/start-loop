import { readdirSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

/** The README's version badges are typed by hand; this keeps them equal to package.json. */
const pkg = JSON.parse(readFileSync("package.json", "utf8")) as {
  version: string
  packageManager: string
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
}
const readme = readFileSync("README.md", "utf8")
const deps = { ...pkg.dependencies, ...pkg.devDependencies }

const BADGES: Record<string, string> = {
  "Next.js": "next",
  React: "react",
  TypeScript: "typescript",
  Tailwind_CSS: "tailwindcss",
  "shadcn%2Fui": "shadcn",
  Drizzle_ORM: "drizzle-orm",
  Better_Auth: "better-auth",
  Zod: "zod",
  Vitest: "vitest",
  Playwright: "@playwright/test",
  Biome: "@biomejs/biome",
}

function badgeVersion(label: string): string | undefined {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`img\\.shields\\.io/badge/${escaped}-([0-9.]+)-`).exec(readme)?.[1]
}

describe("README badges", () => {
  it.each(Object.entries(BADGES))("%s shows the installed version", (label, name) => {
    expect(badgeVersion(label)).toBe(deps[name]?.replace(/^[\^~]/, ""))
  })

  it("shows the app and pnpm versions", () => {
    expect(badgeVersion("version")).toBe(pkg.version)
    expect(badgeVersion("pnpm")).toBe(pkg.packageManager.replace("pnpm@", ""))
  })

  it("counts the skills and lessons it names", () => {
    const skills = readdirSync(".claude/skills").length
    const lessons = readFileSync("docs/LESSONS.md", "utf8").match(/^\d+\. /gm)?.length
    expect(readme).toContain(`badge/skills-${skills}-`)
    expect(readme).toContain(`badge/lessons-${lessons}-`)
  })
})
