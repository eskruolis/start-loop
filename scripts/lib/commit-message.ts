/**
 * The commit message rules (Conventional Commits, as this repo writes them), in one place:
 * the git hook checks every commit with it and CI checks every pull request title, because a
 * squash merge turns the PR title into the commit on `main` that `/release` reads.
 */

/** Allowed types and what each means for the next version (see docs/GIT-WORKFLOW.md). */
export const COMMIT_TYPES = {
  feat: "a new thing users can do (minor bump)",
  fix: "a bug fixed (patch)",
  perf: "faster, same behaviour (patch)",
  refactor: "code restructured, same behaviour (patch)",
  docs: "documentation only (patch)",
  test: "tests only (patch)",
  build: "build, dependencies, tooling (patch)",
  ci: "CI workflows (patch)",
  chore: "anything else that ships nothing (patch)",
  revert: "undoes an earlier commit (patch)",
} as const

export const MAX_HEADER_LENGTH = 72

const HEADER = /^(?<type>[a-z]+)(?:\((?<scope>[^)]*)\))?(?<breaking>!)?: (?<subject>.*)$/
const SCOPE = /^[a-z0-9][a-z0-9-]*$/
const WIP = /^(wip|tmp|temp|test|fix|update|changes|stuff|misc)\b\.?$/i

/** Messages git writes itself; they are left alone. */
function isGenerated(header: string): boolean {
  return /^(Merge |Revert "|fixup! |squash! |amend! )/.test(header)
}

/** Drops the comment lines git adds to the message file and the trailing blank lines. */
export function cleanMessage(raw: string): string {
  return raw
    .split("\n")
    .filter((line) => !line.startsWith("#"))
    .join("\n")
    .trim()
}

/** Returns what is wrong with the message, or an empty list when it follows the rules. */
export function commitMessageProblems(raw: string): string[] {
  const message = cleanMessage(raw)
  const [header = "", second, ...body] = message.split("\n")
  if (header === "") return ["The message is empty."]
  if (isGenerated(header)) return []

  const problems: string[] = []
  const match = HEADER.exec(header)
  if (!match?.groups) {
    return [
      `The first line must look like "type(scope): what changed", e.g. "feat(sales): export the list as CSV".`,
    ]
  }
  const { type = "", scope, subject = "" } = match.groups

  if (!(type in COMMIT_TYPES)) {
    problems.push(`Unknown type "${type}". Use one of: ${Object.keys(COMMIT_TYPES).join(", ")}.`)
  }
  if (scope !== undefined && !SCOPE.test(scope)) {
    problems.push(
      `The scope "${scope}" must be one lowercase word or kebab-case (a module or area: sales, sheets, auth).`
    )
  }
  if (subject.trim() === "") problems.push("Say what changed after the colon.")
  if (subject !== subject.trimStart()) problems.push("Put exactly one space after the colon.")
  if (/[.!?]$/.test(subject)) problems.push("No full stop at the end of the first line.")
  if (/^[A-Z][a-z]/.test(subject))
    problems.push(
      `Start with a lowercase verb ("add", "fix", "show"), not "${subject.split(" ")[0]}".`
    )
  if (
    /^(added|fixed|changed|updated|removed|adds|fixes|changes|updates|removes)\b/i.test(subject)
  ) {
    problems.push(`Write it as a command: "add …", "fix …" (it completes "This commit will …").`)
  }
  if (WIP.test(subject.trim()))
    problems.push(`"${subject.trim()}" says nothing. Name what changed for the user or the code.`)
  if (header.length > MAX_HEADER_LENGTH) {
    problems.push(
      `The first line is ${header.length} characters; keep it to ${MAX_HEADER_LENGTH}. Details go in the body.`
    )
  }
  if (second !== undefined && second.trim() !== "") {
    problems.push("Leave an empty line between the first line and the body.")
  }
  const footer = body.join("\n")
  if (/^BREAKING[ -]CHANGE(?!: \S)/m.test(footer)) {
    problems.push(`Write the footer as "BREAKING CHANGE: what breaks and how to upgrade".`)
  }
  return problems
}
