---
name: ponytail-audit
description: >
  Whole-repo over-engineering audit: a ranked list of what to delete, simplify,
  or replace with stdlib/native/existing code, biggest cut first. Use when the
  user says "audit this codebase", "find bloat", "what can I delete from this
  repo", or invokes /ponytail-audit. One-shot report, applies nothing.
---

`/ponytail-review`, repo-wide. Same tags (`delete` `stdlib` `native` `reuse`
`yagni` `shrink`), whole tree instead of a diff.

## Hunt

Deps the stdlib or platform already ships, single-implementation interfaces,
one-product factories, wrappers that only delegate, dead flags and config,
hand-rolled stdlib, helpers duplicating one already in the repo.

Token diet: start from the manifest (package.json, pyproject, go.mod…) and
`git ls-files`, grep for patterns, read only the regions you flag. Skip
vendored, generated and build output.

Before any `delete:`, grep the whole tree for the symbol, including tests,
fixtures and string or dynamic references.

## Output

One line per finding, ranked biggest cut first:
`<tag> <what to cut>. <replacement>. [path:line]`

End with `net: -<N> lines, -<M> deps possible.` Nothing: `Lean already. Ship.`

Complexity only; correctness and security belong to a normal review. Never
flag the safety floor (validation, data-loss handling, security,
accessibility) or the one runnable check.
