#!/usr/bin/env node
// ponytail-plus: one hook file, dispatched by argv[2].
//   session  -> SessionStart:     reset mode to default, inject the doctrine.
//   prompt   -> UserPromptSubmit: track mode switches, route the work phase.
//   subagent -> SubagentStart:    hand the doctrine to subagents.
// Mode is per session (tmp file keyed by session_id), so parallel sessions don't fight.

const fs = require('fs');
const os = require('os');
const path = require('path');

const MODES = ['lite', 'full', 'ultra', 'off'];
const defaultMode = () => (MODES.includes(process.env.PONYTAIL_DEFAULT_MODE) ? process.env.PONYTAIL_DEFAULT_MODE : 'full');

const stateFile = (sid) => path.join(os.tmpdir(), 'ponytail-plus', String(sid || 'default').replace(/[^\w-]/g, '_'));
const readMode = (sid) => { try { const m = fs.readFileSync(stateFile(sid), 'utf8').trim(); return MODES.includes(m) ? m : defaultMode(); } catch { return defaultMode(); } };
const writeMode = (sid, m) => { try { fs.mkdirSync(path.dirname(stateFile(sid)), { recursive: true }); fs.writeFileSync(stateFile(sid), m); } catch { /* best effort */ } };

// "/ponytail ultra", "/ponytail-plus:ponytail lite", "stop ponytail", "normal mode". null = no switch.
function detectModeSwitch(prompt) {
  const p = String(prompt || '').trim().toLowerCase();
  if (/^(stop ponytail|normal mode|ferma ponytail|modalit[aà] normale)\b/.test(p)) return 'off';
  const m = p.match(/^\/(?:ponytail-plus:)?ponytail(?:\s+(lite|full|ultra|off))?\s*$/);
  return m ? (m[1] || 'full') : null;
}

// Ordered, first match wins: understand before review (a plan review is planning),
// review before implement ("review this fix" is not "fix").
const PHASES = [
  ['understand', /(^|\s)\/(plan|spec|design|investigate|brainstorm)[\w-]*\b|\b(let'?s (plan|design|think|brainstorm)|how should (i|we)|trade-?offs?|architect|research|pianifica|progetta|come dovrei|come dovremmo|valuta|ragioniamo|analizza|pro e contro)\b/i],
  ['review', /(^|\s)\/(review|code-review|qa|ponytail-review|ponytail-audit)\b|\b(review|over-?engineer\w*|what can (i|we) (delete|cut|remove)|rivedi|revisiona|cosa posso (eliminare|togliere|tagliare))\b/i],
];
const detectPhase = (prompt, permissionMode) =>
  permissionMode === 'plan' ? 'understand' : (PHASES.find(([, re]) => re.test(String(prompt || ''))) || ['implement'])[0];

const LEVEL = {
  lite: 'lite: build what is asked; name the lazier alternative in one line, user picks.',
  full: 'full: the ladder enforced, shortest correct diff, shortest explanation.',
  ultra: 'ultra: YAGNI extremist, deletion before addition; ship the minimum and challenge the rest of the requirement in the same breath.',
};

const LADDER = 'Ladder, stop at the first rung that holds: 1) needs to exist? (YAGNI) 2) already in this codebase? reuse 3) stdlib 4) native platform feature 5) installed dependency 6) one line 7) only then the minimum that works.';
const FLOOR = 'Never cut: trust-boundary validation, data-loss error handling, security, accessibility, anything explicitly requested.';

const PHASE_RULE = {
  understand: 'Phase UNDERSTAND: think expensive. Read fully, trace the real flow, state assumptions, weigh trade-offs; ask only when a wrong guess is costly. The ladder governs only the code the plan proposes: end a wide plan with a contract pass (what can be dropped).',
  implement: `Phase IMPLEMENT: write cheap. ${LADDER} Surgical: every changed line traces to the request. Bug = root cause, fix the shared function once. Non-trivial logic leaves ONE runnable check. Mark deliberate shortcuts with a \`ponytail:\` comment (ceiling + upgrade path). Code first, then at most 3 lines: skipped X, add when Y.`,
  review: 'Phase REVIEW: two passes. 1) correctness/security bugs. 2) delete-list: one line per finding `L<n>: delete|stdlib|native|reuse|yagni|shrink: <what>. <replacement>.` End with `net: -N lines possible.` or `Lean already. Ship.`',
};

function doctrine(mode) {
  return [
    `PONYTAIL-PLUS ACTIVE [${mode}]. Lazy senior dev: lazy about the solution, never about understanding. Think expensive, write cheap.`,
    LADDER,
    LEVEL[mode],
    FLOOR,
    'Phases route each turn: understand (think freely) / implement (ladder at max) / review (bugs + delete-list).',
    'Token diet: reasoning and tool output are billed. Grep before reading, read only the region you need, never re-read unchanged context, do not walk the ladder aloud.',
    'Full rules: the ponytail skill. Switch: /ponytail lite|full|ultra|off, or "stop ponytail".',
  ].join('\n');
}

function emit(event, text) {
  if (!text) return;
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: event, additionalContext: text } }));
}

function readStdin() {
  return new Promise((resolve) => {
    let s = '';
    if (process.stdin.isTTY) return resolve({});
    process.stdin.on('data', (c) => { s += c; });
    process.stdin.on('end', () => { try { resolve(JSON.parse(s.replace(/^﻿/, '')) || {}); } catch { resolve({}); } });
    setTimeout(() => resolve({}), 1000).unref();
  });
}

async function main() {
  const kind = process.argv[2];
  const input = await readStdin();
  const sid = input.session_id;

  if (kind === 'session') {
    // Resume/compact keep the session's chosen level; a fresh start resets to default.
    const mode = input.source === 'startup' || input.source === 'clear' ? defaultMode() : readMode(sid);
    writeMode(sid, mode);
    if (mode !== 'off') emit('SessionStart', doctrine(mode));
  } else if (kind === 'prompt') {
    const sw = detectModeSwitch(input.prompt);
    if (sw) writeMode(sid, sw);
    const mode = sw || readMode(sid);
    if (sw) return emit('UserPromptSubmit', sw === 'off' ? 'Ponytail-plus OFF: back to normal coding style until /ponytail.' : doctrine(mode));
    if (mode !== 'off') emit('UserPromptSubmit', `[ponytail ${mode}] ${PHASE_RULE[detectPhase(input.prompt, input.permission_mode)]}`);
  } else if (kind === 'subagent') {
    const mode = readMode(sid);
    if (mode !== 'off') emit('SubagentStart', doctrine(mode));
  }
}

if (require.main === module) main();

module.exports = { detectModeSwitch, detectPhase, doctrine };
