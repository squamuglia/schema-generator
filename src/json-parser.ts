#!/usr/bin/env node

import { buildClientSchema } from 'graphql/utilities/buildClientSchema';
import { printSchema } from 'graphql/utilities/schemaPrinter';
import { program } from 'commander';
import fs from 'fs';
import util from 'util';

const writeFile = util.promisify(fs.writeFile);

const HEADER_COMMENT = `
# ----------------------- IMPORTANT -------------------------------
#
#      The contents of this file are AUTOMATICALLY GENERATED.  Please do
#      not edit this file directly.  To modify its contents, make
#      changes to your json schema, and re-run this command line.
#
# -----------------------------------------------------------------
`;

export async function generateSchema(
	inputFilename: string,
	outputFilename: string
): Promise<void> {
	// Get schema
	const schemaJson = JSON.parse(fs.readFileSync(inputFilename, 'utf8'));

	// Convert to SDL
	const sdl = `
  ${HEADER_COMMENT}

  ${
		json2Sdl(schemaJson).replace(
			/Json/gm,
			'JSON'
		) /* Uppercase JSON for consistency*/
	}
  `;

	// Write to filename
	await writeFile(outputFilename, sdl);
	console.log('Success!');
}

function json2Sdl(rawjson: any): string {
	// Credit to https://github.com/potatosalad/graphql-introspection-json-to-sdl
	if (!!rawjson && typeof rawjson === 'object') {
		if (typeof rawjson.__schema === 'object') {
			const data = rawjson;
			const schema = buildClientSchema(data);
			const print = printSchema(schema);

			return print;
		} else if (
			typeof rawjson.data === 'object' &&
			typeof rawjson.errors === 'undefined'
		) {
			const data = rawjson.data;
			const schema = buildClientSchema(data);
			const print = printSchema(schema);

			return print;
		} else if (typeof rawjson.errors === 'object') {
			throw new Error(JSON.stringify(rawjson.errors, null, 2));
		} else {
			throw new Error('No "data" key found in JSON object');
		}
	} else {
		throw new Error('Invalid JSON object');
	}
}

async function run(): Promise<void> {
	program
		.usage('[options] ...')
		.description('Builds a schema from a local json file.')
		.option(
			'-i, --input-filename <fileName>',
			'Path to file to be parsed. Should be appened with .json'
		)
		.option(
			'-o, --output-filename <fileName>',
			'Name of file to be output. Should be appended with .gql'
		)
		.parse(process.argv);

	const { inputFilename, outputFilename } = program.opts();

	if (!inputFilename || !outputFilename) {
		return program.help();
	}

	await generateSchema(inputFilename, outputFilename);
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});

module.exports = run;
