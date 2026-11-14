import { describe, expect, it } from "vitest"
import { commitMessageProblems } from "../commit-message"

const ok = (message: string) => expect(commitMessageProblems(message)).toEqual([])
const fails = (message: string, pattern: RegExp) =>
  expect(commitMessageProblems(message).join(" ")).toMatch(pattern)

describe("commit messages", () => {
  it("accepts well-formed messages", () => {
    ok("feat(sales): export the list as CSV")
    ok("fix: read dates written as 13/11/2026")
    ok("chore(deps): update next to 16.4.7")
    ok(
      "feat(sales)!: store amounts in cents\n\nBREAKING CHANGE: run pnpm db:migrate before deploying"
    )
    ok(
      "refactor(data): one paging helper\n\nEvery adapter paged on its own; now applyQuery does it.\n"
    )
    ok(
      "docs: explain DATA_SOURCE_<MODULE>\n# Please enter the commit message\n# Lines starting with #"
    )
  })

  it("leaves messages git writes itself alone", () => {
    ok("Merge branch 'main' into feat/invoices")
    ok('Revert "feat(sales): export the list as CSV"')
    ok("fixup! feat(sales): export the list as CSV")
  })

  it("refuses what does not follow the rules", () => {
    fails("", /empty/)
    fails("Added export button", /type\(scope\)/)
    fails("feature(sales): export", /Unknown type/)
    fails("feat(Sales): export the list", /scope/)
    fails("feat: Export the list", /lowercase/)
    fails("feat: added export", /command/)
    fails("fix: stuff", /says nothing/)
    fails("feat: export the list.", /full stop/)
    fails(`feat(sales): ${"a".repeat(70)}`, /72/)
    fails("feat: export\nmore text", /empty line/)
    fails("feat!: cents\n\nBREAKING CHANGE amounts", /BREAKING CHANGE:/)
  })
})
