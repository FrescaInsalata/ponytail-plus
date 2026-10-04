---
name: ponytail-review
description: >
  Over-engineering review of a diff or a plan: finds what to delete, one line
  per finding (location, what to cut, what replaces it), ending with
  "net: -N lines possible". Also the contract gate that closes a wide plan or
  implementation. Use when the user says "review for over-engineering", "what
  can we delete", "is this over-engineered", "cut it down", "contract this",
  or invokes /ponytail-review. Lists findings, applies nothing unless asked.
---

Review the diff (default: the current uncommitted changes, else the last
commit) or the plan just written. The best outcome is getting shorter.

Read the code each finding touches before flagging it. Before any `delete:` or
`reuse:`, grep the tree (tests, fixtures, string and dynamic references too).

## Format

`L<line>: <tag> <what>. <replacement>.`, or `<file>:L<line>: ...` across files.
For a plan: `step <n>: <tag> <what>. <replacement>.`

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `reuse:` duplicates a helper already in this repo. Name the path.
- `yagni:` one-implementation interface, config nobody sets, one-caller layer.
- `shrink:` same logic, fewer lines. Show the shorter form.

✅ `L12-38: stdlib: 27-line email validator class. "@" in email; real validation is the confirmation mail.`
✅ `L4: native: moment.js for one format call. Intl.DateTimeFormat, 0 deps.`
✅ `repo.py:L88: yagni: AbstractRepository with one implementation. Inline until a second exists.`
❌ "This class might be more complex than necessary, have you considered…"

End with `net: -<N> lines possible.` Nothing to cut: `Lean already. Ship.`

## Correctness pass

Complexity is the job, but if you see a real bug, security hole or data-loss
risk on the way, list it first under `bugs:`, one line each. Don't hunt for
them here; a normal review does that.

## Never flag

The one runnable check, trust-boundary validation, data-loss handling,
security, accessibility, anything explicitly requested.
