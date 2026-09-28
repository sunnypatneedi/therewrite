const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Load the public pure API while deliberately leaving the page uninitialized.
// These tests exercise the teaching model without a browser or DOM library.
const window = { addEventListener() {} };
const document = { readyState: 'loading', addEventListener() {} };
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname, '../assets/stack.js'), 'utf8'),
  { window, document, console },
  { filename: 'assets/stack.js' }
);

const simulate = (inputs) => window.RewriteStack.simulate(inputs);
const baseline = {
  compute: 50,
  latency: 50,
  modelSize: 50,
  traffic: 50,
  safety: 50,
  regulatory: 50,
  capital: 50
};

function assertValidResult(result) {
  assert.equal(result.stress.length, 10, 'every stack layer has a pressure value');
  for (const pressure of result.stress) {
    assert.ok(Number.isFinite(pressure), 'pressure must be finite');
    assert.ok(pressure >= 0 && pressure <= 1, 'pressure stays within its display range');
  }
  assert.ok(Number.isInteger(result.bottleneck));
  assert.ok(result.bottleneck >= 0 && result.bottleneck < result.stress.length);
  assert.equal(
    result.stress[result.bottleneck],
    Math.max(...result.stress),
    'the highlighted bottleneck must be a layer with greatest pressure'
  );
}

test('every extreme slider combination produces a valid bottleneck', () => {
  const keys = Object.keys(baseline);
  for (let mask = 0; mask < 2 ** keys.length; mask++) {
    const inputs = Object.fromEntries(keys.map((key, index) => [key, (mask & (1 << index)) ? 100 : 0]));
    assertValidResult(simulate(inputs));
  }
});

test('missing, malformed, and out-of-range inputs cannot poison the lesson', () => {
  assertValidResult(simulate());
  assertValidResult(simulate({}));
  for (const value of [-100, 1000, NaN, Infinity, -Infinity, 'invalid', null, undefined]) {
    assertValidResult(simulate(Object.fromEntries(Object.keys(baseline).map((key) => [key, value]))));
  }
});

test('the same scenario has the same result and leaves inputs unchanged', () => {
  const inputs = Object.freeze({ ...baseline, traffic: 85, latency: 10 });
  assert.deepEqual(simulate(inputs), simulate(inputs));
  assert.equal(inputs.traffic, 85);
  assert.equal(inputs.latency, 10);
});

test('more traffic increases inference pressure when everything else is fixed', () => {
  const quiet = simulate({ ...baseline, traffic: 0 });
  const busy = simulate({ ...baseline, traffic: 100 });
  assert.ok(busy.stress[5] > quiet.stress[5]);
});

test('allowing more response time relieves inference pressure', () => {
  const immediate = simulate({ ...baseline, latency: 0 });
  const flexible = simulate({ ...baseline, latency: 100 });
  assert.ok(flexible.stress[5] < immediate.stress[5]);
});

test('more available capital relieves economic pressure', () => {
  const constrained = simulate({ ...baseline, capital: 0 });
  const funded = simulate({ ...baseline, capital: 100 });
  assert.ok(funded.stress[8] < constrained.stress[8]);
});

test('more compute budget relieves scarcity while adding operating pressure', () => {
  const constrained = simulate({ ...baseline, compute: 0 });
  const ample = simulate({ ...baseline, compute: 100 });
  assert.ok(ample.stress[2] < constrained.stress[2], 'compute capacity is less constrained');
  assert.ok(ample.stress[5] < constrained.stress[5], 'serving has more capacity');
  assert.ok(ample.stress[0] > constrained.stress[0], 'running capacity needs power');
  assert.ok(ample.stress[8] > constrained.stress[8], 'running capacity costs money');
});
