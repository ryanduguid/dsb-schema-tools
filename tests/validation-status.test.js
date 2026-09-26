const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

const source = fs.readFileSync(path.join(__dirname, '../validate-sector-schemas.js'), 'utf8');

function runValidator(invalidSector) {
  const output = [];
  const status = { exitCode: 0 };
  const fixtureFs = {
    readdirSync(directory) {
      return path.basename(directory) === 'common' ? [] : ['example.json'];
    },
    readFileSync(file) {
      const sector = path.basename(path.dirname(file));
      return JSON.stringify(sector === invalidSector
        ? { type: 'object', properties: { value: { $ref: 'missing.json' } } }
        : { type: 'object', properties: { value: { type: 'string' } } });
    },
  };
  vm.runInNewContext(source, {
    __dirname: path.join(__dirname, 'fixtures'),
    require: name => name === 'fs' ? fixtureFs : require(name),
    process: status,
    console: { log: message => output.push(message) },
  });
  return { output, status };
}

test('valid schemas leave a successful exit status', () => {
  const { output, status } = runValidator();
  assert.equal(status.exitCode, 0);
  assert.equal(output.filter(line => line.startsWith('Validated ')).length, 6);
});

test('only the three banking and energy sectors load common schemas', () => {
  const { output } = runValidator();
  assert.deepEqual(output.filter(line => line.startsWith('Added Common ')), [
    'Added Common for banking validation',
    'Added Common for energy validation',
    'Added Common for energy_sdh validation',
  ]);
});

test('a schema compilation error fails validation and allows later sectors to run', () => {
  const { output, status } = runValidator('banking');
  assert.equal(status.exitCode, 1);
  assert.ok(output.some(line => line.startsWith('ERROR in file example.json:')));
  assert.ok(output.includes('Validated dcr'));
});
