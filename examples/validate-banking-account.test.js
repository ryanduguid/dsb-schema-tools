const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const script = path.join(__dirname, 'validate-banking-account.js');
const fixture = path.join(__dirname, 'banking-account.json');
const sample = JSON.parse(fs.readFileSync(fixture, 'utf8'));

function run(args, cwd) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd,
    encoding: 'utf8',
    timeout: 10000,
  });
  assert.ifError(result.error);
  return result;
}

test('the bundled example runs outside the repository directory', () => {
  const result = run([], os.tmpdir());
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Valid BankingAccountV2 \(1\.35\.0\)/);
  assert.equal(result.stderr, '');
});

for (const version of ['1.31.0', '1.35.0']) {
  test(`accepts the sample with schema references in ${version}`, () => {
    const result = run([fixture, version]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
  });

  for (const [name, changes, keyword] of [
    ['invalid product category', { productCategory: 'NOT_A_CATEGORY' }, 'enum'],
    ['missing required property', { displayName: undefined }, 'required'],
    ['incorrect account ID type', { accountId: 123 }, 'type'],
    ['string instead of boolean', { isOwned: 'true' }, 'type'],
  ]) {
    test(`rejects ${name} in ${version}`, (t) => {
      const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cds-ajv-'));
      const input = path.join(directory, 'account.json');
      t.after(() => {
        fs.rmSync(input, { force: true });
        fs.rmdirSync(directory);
      });
      fs.writeFileSync(input, JSON.stringify({ ...sample, ...changes }));

      const result = run([input, version]);

      assert.equal(result.status, 1);
      assert.equal(result.stdout, '');
      const errors = JSON.parse(result.stderr);
      assert.ok(errors.some((error) => error.keyword === keyword));
    });
  }
}

test('reports malformed input JSON without a successful validation', (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cds-ajv-'));
  const input = path.join(directory, 'account.json');
  t.after(() => {
    fs.rmSync(input, { force: true });
    fs.rmdirSync(directory);
  });
  fs.writeFileSync(input, '{');

  const result = run([input]);

  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
  assert.ok(result.stderr.trim());
});

for (const [name, args] of [
  ['missing input file', [path.join(__dirname, 'does-not-exist.json')]],
  ['missing release', [fixture, 'does-not-exist']],
]) {
  test(`reports a ${name} as an error`, () => {
    const result = run(args);
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /ENOENT/);
  });
}
