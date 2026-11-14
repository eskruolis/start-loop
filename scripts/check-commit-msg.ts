/**
 * Checks a commit message against scripts/lib/commit-message.ts.
 *   tsx scripts/check-commit-msg.ts .git/COMMIT_EDITMSG    (the commit-msg hook)
 *   tsx scripts/check-commit-msg.ts --text "feat: …"        (CI, for the PR title)
 */
import { readFileSync } from "node:fs"
import { COMMIT_TYPES, commitMessageProblems } from "./lib/commit-message"

const [first, second] = process.argv.slice(2)
const message = first === "--text" ? (second ?? "") : first ? readFileSync(first, "utf8") : ""
const problems = commitMessageProblems(message)

if (problems.length > 0) {
  console.error(`\n✖ Commit message: ${message.split("\n")[0]}\n`)
  for (const problem of problems) console.error(`  - ${problem}`)
  console.error("\n  Format: type(scope): what changed   (≤ 72 characters, English, a command)")
  console.error("  Example: fix(sheets): read dates written as 13/11/2026\n")
  console.error("  Types:")
  for (const [type, meaning] of Object.entries(COMMIT_TYPES))
    console.error(`    ${type.padEnd(9)}${meaning}`)
  console.error("\n  Rules: docs/GIT-WORKFLOW.md#commits\n")
  process.exitCode = 1
}
