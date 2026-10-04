// node --test hooks/ponytail.test.js
const test = require('node:test');
const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { detectModeSwitch, detectPhase } = require('./ponytail');

const hook = (kind, input) => {
  const out = execFileSync('node', [path.join(__dirname, 'ponytail.js'), kind], { input: JSON.stringify(input) }).toString();
  return out ? JSON.parse(out).hookSpecificOutput.additionalContext : '';
};

test('mode switches', () => {
  assert.equal(detectModeSwitch('/ponytail ultra'), 'ultra');
  assert.equal(detectModeSwitch('/ponytail-plus:ponytail lite'), 'lite');
  assert.equal(detectModeSwitch('/ponytail'), 'full');
  assert.equal(detectModeSwitch('stop ponytail'), 'off');
  assert.equal(detectModeSwitch('/ponytail-review'), null);
  assert.equal(detectModeSwitch('add a ponytail field'), null);
});

test('phase routing', () => {
  assert.equal(detectPhase("let's plan the auth flow"), 'understand');
  assert.equal(detectPhase('progetta il database'), 'understand');
  assert.equal(detectPhase('review this diff'), 'review');
  assert.equal(detectPhase('cosa posso eliminare qui?'), 'review');
  assert.equal(detectPhase('fix the login bug'), 'implement');
  assert.equal(detectPhase('fix the login bug', 'plan'), 'understand');
});

test('mode persists per session and off silences', () => {
  const sid = `test-${process.pid}`;
  assert.match(hook('session', { session_id: sid, source: 'startup' }), /ACTIVE \[full\]/);
  assert.match(hook('prompt', { session_id: sid, prompt: '/ponytail ultra' }), /ACTIVE \[ultra\]/);
  assert.match(hook('prompt', { session_id: sid, prompt: 'add a button' }), /^\[ponytail ultra\] Phase IMPLEMENT/);
  assert.match(hook('subagent', { session_id: sid }), /\[ultra\]/);
  assert.match(hook('session', { session_id: sid, source: 'compact' }), /\[ultra\]/);
  hook('prompt', { session_id: sid, prompt: 'stop ponytail' });
  assert.equal(hook('prompt', { session_id: sid, prompt: 'add a button' }), '');
  assert.match(hook('session', { session_id: sid, source: 'startup' }), /\[full\]/);
});
