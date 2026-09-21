const fs = require('node:fs');
const path = require('node:path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Usage: node examples/validate-banking-account.js [account.json] [version]
const [input = path.join(__dirname, 'banking-account.json'), version = '1.35.0'] =
  process.argv.slice(2);

try {
  const directory = path.join(__dirname, '..', version, 'schemas');
  // Allow schema annotations such as x-cds-type; validation rules still apply.
  const ajv = new Ajv({ strictSchema: false });
  addFormats(ajv);

  for (const sector of ['common', 'banking']) {
    for (const filename of fs.readdirSync(path.join(directory, sector))) {
      if (!filename.endsWith('.json')) continue;
      const schema = JSON.parse(
        fs.readFileSync(path.join(directory, sector, filename), 'utf8')
      );
      // Match the keys used by $ref, without changing the schema files.
      const key = sector === 'common' ? `common/${filename}` : filename;
      ajv.addSchema(schema, key);
    }
  }

  const validate = ajv.getSchema('BankingAccountV2.json');
  const account = JSON.parse(fs.readFileSync(input, 'utf8'));
  if (validate(account)) {
    console.log(`Valid BankingAccountV2 (${version}).`);
  } else {
    console.error(JSON.stringify(validate.errors, null, 2));
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
