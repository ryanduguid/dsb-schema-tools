
# JSON Schema Tool

## Overview

The JSON Schema Files Repository holds a comprehensive collection of JSON schema files derived from the official published [Consumer Data Standards](https://consumerdatastandardsaustralia.github.io/standards/#introduction) (CDS). The [Data Standards Body](https://consumerdatastandards.gov.au/about) maintains this repository of schema files to facilitate robust schema validation. 

## Using the JSON Schema Files

The repository is organised by release versions of the [Consumer Data Standards](https://consumerdatastandardsaustralia.github.io/standards/#introduction). For instance, to find schemas related to CDS release version 1.29.0, navigate to the 1.29.0 folder located in the repository's root directory.

This tool:

- is maintained regularly to ensure compatibility with the latest Consumer Data Standards.
- assists Data Holders with regulatory adherence by facilitating schema validation of data formats against the CDS, ensuring that the CDR API interactions comply with the required specifications and regulations.
- helps maintain data integrity and interoperability within the CDR ecosystem.

The schema files can be used for a variety of purposes. For instance, they can be used to 

- build a customised test harness for data holder payload validation
- create and maintain documentation
- build a data holder and/or data recipient solution

Example: You can use these files within our Postman Collection to validate your Data Holder API schemas during CDR API testing and development process. For more information, refer to the [Quick Start](#quick-start) section below.

## Quick Start

The DSB provides an easy and quick way for the Data Holders to validate their API schemas using a combination of [DSB Postman Collections](https://www.postman.com/data-standards-body/workspace/cdr-tests), the [AJV (Another JSON Schema Validator) plugin](https://ajv.js.org/) configured within the Postman collection and the JSON schemas. 


### How They Work Together

The [DSB Postman Collections](https://www.postman.com/data-standards-body/workspace/cdr-tests) will reference the latest version folder within this repository and include the `postman-validation-<SECTOR>-<VERSION>.json` file for API validation purposes, depending on which Postman collection file is referenced (banking/energy/common).

The `postman-validation-<SECTOR>-<VERSION>.json` was created with the `build-sector-postman-schema-files.js` utility. It combines the individual json files into a single file for better performance in Postman. 

When an API call is made using [Postman](https://www.postman.com/), the [Ajv](https://ajv.js.org/) plugin automatically validates the response against the JSON schema  designated for the particular API endpoint being tested. The schema acts as a "template" to ensure that the API response adheres to the required data structure and data types as specified by the CDS. If discrepancies are found (e.g., missing required fields, incorrect data types, additional properties not defined in the schema etc), AJV flags these as validation errors. The test results are displayed within Postman for debugging purposes to assist the developers or testers within the CDR Community during their CDR API testing and development process.

For more information on API testing with Postman, refer to the [Postman documentation](https://learning.postman.com/docs/writing-scripts/test-scripts/).

## Validate banking data with Node.js

The schemas also work with Ajv outside Postman. Using Node.js 18 or later, run
the [banking account example](examples/validate-banking-account.js) from the
repository root:

```bash
npm ci
node examples/validate-banking-account.js
```

The example validates a [synthetic account](examples/banking-account.json)
against `BankingAccountV2.json` in release `1.35.0`. To validate your own account
object and choose a checked-in release:

```bash
node examples/validate-banking-account.js account.json 1.31.0
```

Use an individual account object, not the full API response envelope. The command
exits with code 0 for valid data, or code 1 with error details for invalid data or
a file/schema loading error.

The schema files do not declare `$id`. Register each banking schema with its
filename as the Ajv key, for example
`ajv.addSchema(schema, 'BankingProductCategory.json')`. The key must match the
corresponding `$ref`; an arbitrary name will not resolve that reference. The
example also registers common schemas under `common/<filename>`, following the
existing sector validator. All schemas come from the same release.

The example uses the existing `ajv-formats` dependency and `strictSchema: false`
to allow annotations such as `x-cds-type`. Those annotations do not themselves
add validation rules. Schema validation alone does not establish CDR compliance.

Run the example's regression checks with Node's built-in test runner:

```bash
node --test examples/validate-banking-account.test.js
```

## Reporting Issues

Encountered an issue? We're here to help. Please visit our [issue reporting guidelines](https://d61cds.notion.site/Issue-Reporting-Guidelines-71a329a0658c4b69a232eab95822509b?pvs=4) for submitting an issue.

## Stay Updated

Join our newsletter to receive the latest updates, release notes, and alerts. [Subscribe here](https://consumerdatastandards.us18.list-manage.com/subscribe?u=fb3bcb1ec5662d9767ab3c414&id=a4414b3906).

## License

The artefact is released under the [MIT License](https://github.com/ConsumerDataStandardsAustralia/java-artefacts/blob/master/LICENSE), which allows the community to use and modify it freely.

## Disclaimer

The artefacts in this repository are offered without warranty or liability, in accordance with the [MIT licence.](https://github.com/ConsumerDataStandardsAustralia/java-artefacts/blob/master/LICENSE)

[The Data Standards Body](https://consumerdatastandards.gov.au/about/) (DSB) develops these artefacts in the course of its work, in order to perform quality assurance on the Australian Consumer Data Right Standards (Data Standards).

The DSB makes this repository, and its artefacts, public [on a non-commercial basis](https://github.com/ConsumerDataStandardsAustralia/java-artefacts/blob/master/LICENSE) in the interest of supporting the participants in the CDR ecosystem.

The resources of the DSB are primarily directed towards assisting the [Data Standards Chair](https://consumerdatastandards.gov.au/about/) for [developing the Data Standards](https://github.com/ConsumerDataStandardsAustralia/standards).

Consequently, the development work provided on the artefacts in this repository is on a best-effort basis, and the DSB acknowledges the use of these tools alone is not sufficient for, nor should they be relied upon with respect to [accreditation](https://www.accc.gov.au/focus-areas/consumer-data-right-cdr-0/cdr-draft-accreditation-guidelines), conformance, or compliance purposes.