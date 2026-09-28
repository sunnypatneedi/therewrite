const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test('every production JavaScript file passes the native syntax check', () => {
  const files = fs.readdirSync(path.join(root, 'assets')).filter((name) => name.endsWith('.js'));
  assert.ok(files.length > 0);
  for (const name of files) {
    assert.doesNotThrow(
      () => execFileSync(process.execPath, ['--check', path.join(root, 'assets', name)], { stdio: 'pipe' }),
      `${name} must parse before publication`
    );
  }
});

test('script and stylesheet paths resolve under the GitHub Pages project path', () => {
  const refs = [...html.matchAll(/<(?:script|link)\b[^>]*\b(?:src|href)=["']([^"']+)["'][^>]*>/g)].map((match) => match[1]);
  assert.ok(refs.length > 0);
  for (const ref of refs) {
    const url = new URL(ref, 'https://example.test/therewrite/index.html');
    if (url.origin !== 'https://example.test') continue;
    assert.ok(url.pathname.startsWith('/therewrite/'), `${ref} must work below /therewrite/`);
    const relative = decodeURIComponent(url.pathname.slice('/therewrite/'.length));
    assert.ok(fs.statSync(path.join(root, relative)).isFile(), `${ref} must exist`);
  }
});

test('static navigation targets exist and static element IDs are unique', () => {
  const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, 'duplicate IDs break labels and navigation');
  for (const [, target] of html.matchAll(/\bhref=["']#([^"']+)["']/g)) {
    assert.ok(ids.includes(target), `navigation target #${target} must exist`);
  }
});
