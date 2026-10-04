---
name: ponytail-debt
description: >
  Harvest every `ponytail:` comment into a debt ledger, so deliberate shortcuts
  don't rot into "later means never". Use when the user says "ponytail debt",
  "list the shortcuts", "what did we defer", or invokes /ponytail-debt.
  One-shot report, changes nothing.
---

Every deliberate shortcut carries `ponytail: <ceiling>, <upgrade trigger>`.

## Scan

`git grep -nE '(#|//|/\*|--|;) ?ponytail:'` (outside git:
`grep -rnE --exclude-dir={.git,node_modules,dist,build} '(#|//|/\*|--|;) ?ponytail:' .`).
The comment prefix keeps prose that merely mentions the convention out.

## Output

Grouped by file, one row per marker:

`<file>:<line>, <what was simplified>. ceiling: <limit>. upgrade: <trigger>.`

Tag `no-trigger` on any marker that names no upgrade path: those are the ones
that silently rot. Want owners? `git blame -L<line>,<line> <file>`.

End with `<N> markers, <M> with no trigger.` Nothing: `No ponytail debt. Clean ledger.`

Reads only. Asked to persist it? Write `PONYTAIL-DEBT.md`.
