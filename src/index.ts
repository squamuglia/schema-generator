#!/usr/bin/env node

import { buildClientSchema } from 'graphql/utilities/buildClientSchema';
import { printSchema } from 'graphql/utilities/schemaPrinter';
import { getIntrospectionQuery } from 'graphql/utilities/introspectionQuery';
import { program } from 'commander';
import fetch from 'isomorphic-fetch';
import fs from 'fs';
import util from 'util';

const writeFile = util.promisify(fs.writeFile);

const HEADER_COMMENT = `
# ----------------------- IMPORTANT -------------------------------
#
#      The contents of this file are AUTOMATICALLY GENERATED.  Please do
#      not edit this file directly.  To modify its contents, make
#      changes to your schema, and re-run this command line.
#
# -----------------------------------------------------------------
`;

export async function generateSchema(
	url: string,
	outputFilename: string,
	rawHeaders?: string[]
): Promise<void> {
	const headers = { 'Content-Type': 'application/json' };

	rawHeaders?.forEach((h) => {
		if (!h.includes(':')) {
			console.error('Invalid headers: header must be key value pair', h);
		}
		const [key, value] = h.split(':');
		headers[key.trim()] = value.trim();
	});

	const body = JSON.stringify({ query: getIntrospectionQuery() });

	// Get schema
	const schemaData = await fetch(url, {
		method: 'POST',
		body,
		headers,
	});

	// Convert to SDL
	const schemaJson = await schemaData.json();
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
		.description('Downloads a GraphQL schema file from an endpoint.')
		.option(
			'-u, --url <url>',
			'Url for graphql api endpoint. ex: https://website.com/graphql'
		)
		.option(
			'-o, --output-filename <fileName>',
			'Name of file to be output. Should be appended with .gql'
		)
		.option('-h, --headers [headers...]', 'Headers to be appended to request')
		.parse(process.argv);

	const { url, outputFilename, headers } = program.opts();

	if (!url || !outputFilename) {
		return program.help();
	}

	await generateSchema(url, outputFilename, headers);
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});

module.exports = run;
