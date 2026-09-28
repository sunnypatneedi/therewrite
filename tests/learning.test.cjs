const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/learning.js'), 'utf8');
const key = 'therewrite.learning.v1';

function loadAndSave(raw, options = {}) {
  const events = {};
  const documentEvents = {};
  let saved;
  const localStorage = {
    getItem(requestedKey) {
      assert.equal(requestedKey, key);
      if (options.blocked) throw new Error('Storage blocked');
      return raw;
    },
    setItem(requestedKey, value) {
      assert.equal(requestedKey, key);
      if (options.blocked) throw new Error('Storage blocked');
      saved = value;
    }
  };
  vm.runInNewContext(source, {
    localStorage,
    clearTimeout,
    window: { addEventListener(name, handler) { events[name] = handler; } },
    document: {
      getElementById() { return null; },
      querySelector() { return null; },
      addEventListener(name, handler) { documentEvents[name] = handler; }
    }
  }, { filename: 'assets/learning.js' });
  if (options.pin) documentEvents['lab:pin']({ detail: options.pin });
  events.pagehide();
  return saved === undefined ? undefined : JSON.parse(saved);
}

test('first visit and unreadable storage recover to an uncompleted lesson', () => {
  for (const raw of [null, '{bad json', 'null', '[]', '{"version":2}']) {
    const state = loadAndSave(raw);
    assert.equal(state.version, 1);
    assert.equal(state.profile.submitted, false);
    assert.deepEqual(state.answers, {});
    assert.deepEqual(state.attempts, {});
    assert.equal(state.trace, 0);
    assert.equal(state.detours, 0);
    assert.deepEqual(state.lab.pins, []);
  }
});

test('valid choices, responses, and project notes survive a save cycle', () => {
  const original = {
    version: 1,
    profile: { lens: 'systems', depth: 'operator', pace: 'guided', format: 'read', knowledge: 'reuse', submitted: true },
    answers: { prior: 'training', queue: 'queue' },
    attempts: { prior: 2, queue: 1 },
    trace: 3,
    detours: 1,
    lab: {
      thesis: 'A tutor for small electronics projects', user: 'First-time builders',
      bottleneck: 'Unclear next step', assumptions: 'The learner can describe the circuit',
      risks: 'An unsafe wiring suggestion', next: 'Observe one task',
      pins: [{ id: 'security', title: 'Security & Safety', note: 'Review consequential actions.' }]
    }
  };
  assert.deepEqual(loadAndSave(JSON.stringify(original)), original);
});

test('saved selections without a submitted attempt do not become passed checks', () => {
  const state = loadAndSave(JSON.stringify({
    version: 1,
    answers: { prior: 'training', queue: 'queue' },
    attempts: { prior: 0 }
  }));
  assert.deepEqual(state.answers, {});
  assert.deepEqual(state.attempts, {});
});

test('stored state is bounded and accepts only known choices and layer pins', () => {
  const state = loadAndSave(JSON.stringify({
    version: 1,
    profile: { lens: 'unknown', depth: null, pace: 'guided', format: 'read', knowledge: 'invalid', submitted: true },
    answers: { prior: 'inference', queue: 'invented', bonus: 'complete' },
    attempts: { prior: 100000, queue: -3 },
    trace: 100,
    detours: 100,
    lab: {
      thesis: 'a'.repeat(2000), user: 123, unexpected: 'ignored',
      pins: [null, { id: 'invented', title: 'Unsupported' },
        { id: 'training', title: 't'.repeat(120), note: 'n'.repeat(500) },
        { id: 'training', title: 'Duplicate' }, { id: 'model', title: 12 }]
    }
  }));
  assert.equal(state.profile.lens, 'builder');
  assert.equal(state.profile.depth, 'beginner');
  assert.equal(state.profile.pace, 'guided');
  assert.equal(state.profile.submitted, false);
  assert.deepEqual(state.answers, { prior: 'inference' });
  assert.deepEqual(state.attempts, { prior: 999 });
  assert.equal(state.trace, 3);
  assert.equal(state.detours, 2);
  assert.equal(state.lab.thesis.length, 1400);
  assert.equal(state.lab.user, '');
  assert.equal(state.lab.unexpected, undefined);
  assert.equal(state.lab.pins.length, 1);
  assert.equal(state.lab.pins[0].title.length, 90);
  assert.equal(state.lab.pins[0].note.length, 300);
});

test('repeated pin events keep one copy and preserve the project notes', () => {
  const raw = JSON.stringify({ version: 1, lab: { thesis: 'Keep this idea', pins: [{ id: 'energy', title: 'Energy', note: 'Original' }] } });
  const state = loadAndSave(raw, { pin: { id: 'energy', title: 'Energy again', note: 'Duplicate' } });
  assert.equal(state.lab.thesis, 'Keep this idea');
  assert.deepEqual(state.lab.pins, [{ id: 'energy', title: 'Energy', note: 'Original' }]);
});

test('blocked browser storage does not stop the lesson or a pin action', () => {
  assert.doesNotThrow(() => loadAndSave(null, { blocked: true, pin: { id: 'inference', title: 'Inference', note: 'Keep working in this tab.' } }));
});
