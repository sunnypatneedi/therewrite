const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/experience.js'), 'utf8');

function eventTarget(properties = {}) {
  const listeners = new Map();
  return Object.assign({
    addEventListener(type, listener) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(listener);
    },
    emit(type) {
      for (const listener of listeners.get(type) || []) listener({ type });
    }
  }, properties);
}

function element(properties = {}) {
  const classes = new Set();
  return eventTarget(Object.assign({
    textContent: '',
    value: '',
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    classList: {
      toggle(name, active) { if (active) classes.add(name); else classes.delete(name); },
      contains(name) { return classes.has(name); }
    }
  }, properties));
}

function opening(reduced = false) {
  const elements = Object.fromEntries([
    'boot-progress', 'boot-play', 'scene-fields', 'scene-count',
    'scene-kicker', 'scene-explanation', 'opening'
  ].map(id => [id, element()]));
  elements.opening.offsetHeight = 800;
  const rows = Array.from({ length: 7 }, (_, index) => {
    const state = element();
    return element({ dataset: { stage: String(index + 1) }, state,
      querySelector(selector) {
        assert.equal(selector, '.scene-state');
        return state;
      }
    });
  });
  const preference = eventTarget({ matches: reduced });
  const window = eventTarget({ scrollY: 0 });
  const document = eventTarget({
    hidden: false,
    getElementById(id) { return elements[id]; },
    querySelectorAll(selector) { assert.equal(selector, '.scene-layer'); return rows; }
  });
  let nextTimer = 1;
  const timers = new Map();
  vm.runInNewContext(source, {
    document, window,
    matchMedia(query) { assert.equal(query, '(prefers-reduced-motion: reduce)'); return preference; },
    setInterval(callback, delay) {
      assert.ok(delay > 0, 'playback must advance over time');
      const id = nextTimer++;
      timers.set(id, callback);
      return id;
    },
    clearInterval(id) { timers.delete(id); }
  }, { filename: 'assets/experience.js' });
  return {
    elements, rows, preference, window, document, timers,
    tick() { for (const callback of [...timers.values()]) callback(); },
    stage() { return Number(elements['boot-progress'].value); },
    play() { elements['boot-play'].emit('click'); }
  };
}

test('normal motion starts at the physical foundation without autoplay', () => {
  const scene = opening();
  assert.equal(scene.stage(), 1);
  assert.equal(scene.timers.size, 0);
  assert.deepEqual(scene.rows.map(row => row.classList.contains('is-online')), [true, false, false, false, false, false, false]);
  assert.equal(scene.rows[0].state.textContent, 'Online');
  assert.equal(scene.rows[1].state.textContent, 'Waiting');
  assert.equal(scene.elements['scene-fields'].classList.contains('is-online'), false);
  assert.match(scene.elements['boot-progress'].attributes['aria-valuetext'], /ENERGY; stage 1 of 8/);
});

test('reduced motion reveals the full system and never starts playback', () => {
  const scene = opening(true);
  assert.equal(scene.stage(), 8);
  assert.ok(scene.rows.every(row => row.classList.contains('is-online')));
  assert.equal(scene.elements['scene-fields'].classList.contains('is-online'), true);
  assert.equal(scene.elements['boot-play'].textContent, 'Show full system');
  scene.play();
  assert.equal(scene.stage(), 8);
  assert.equal(scene.timers.size, 0);
});

test('explicit playback progresses through the system and stops at stage eight', () => {
  const scene = opening();
  scene.play();
  assert.equal(scene.elements['boot-play'].textContent, 'Pause sequence');
  assert.equal(scene.timers.size, 1);
  const stages = [];
  for (let index = 0; index < 7; index++) { scene.tick(); stages.push(scene.stage()); }
  assert.deepEqual(stages, [2, 3, 4, 5, 6, 7, 8]);
  assert.equal(scene.timers.size, 0);
  assert.equal(scene.elements['boot-play'].textContent, 'Replay the sequence');
  assert.equal(scene.elements['scene-fields'].classList.contains('is-online'), true);
  scene.tick();
  assert.equal(scene.stage(), 8, 'the sequence must not loop');
});

test('manual scrubbing cancels playback and retains the learner’s chosen stage', () => {
  const scene = opening();
  scene.play();
  scene.tick();
  scene.elements['boot-progress'].value = '4';
  scene.elements['boot-progress'].emit('input');
  assert.equal(scene.stage(), 4);
  assert.equal(scene.timers.size, 0);
  scene.tick();
  scene.window.scrollY = 1000;
  scene.window.emit('scroll');
  assert.equal(scene.stage(), 4, 'scrolling must not override a manual selection');
  assert.match(scene.elements['scene-explanation'].textContent, /before a live request/);
});

test('hiding the tab stops playback without losing the current stage', () => {
  const scene = opening();
  scene.play();
  scene.tick();
  scene.document.hidden = true;
  scene.document.emit('visibilitychange');
  assert.equal(scene.timers.size, 0);
  scene.tick();
  assert.equal(scene.stage(), 2);
  scene.document.hidden = false;
  scene.document.emit('visibilitychange');
  assert.equal(scene.timers.size, 0, 'returning to the tab must not restart playback');
});

test('enabling reduced motion during playback cancels it and reveals all stages', () => {
  const scene = opening();
  scene.play();
  scene.tick();
  scene.preference.matches = true;
  scene.preference.emit('change');
  assert.equal(scene.timers.size, 0);
  assert.equal(scene.stage(), 8);
  assert.ok(scene.rows.every(row => row.classList.contains('is-online')));
  assert.equal(scene.elements['boot-play'].textContent, 'Show full system');
});
