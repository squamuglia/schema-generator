#!/usr/bin/env node

import { buildClientSchema } from 'graphql/utilities/buildClientSchema';
import { printSchema } from 'graphql/utilities/schemaPrinter';
import commander from 'commander';
import fetch from 'isomorphic-fetch';
import fs from 'fs';
import util from 'util';

const writeFile = util.promisify(fs.writeFile);

const HEADER_COMMENT = `
# ----------------------- IMPORTANT -------------------------------
#
#      The contents of this file are AUTOMATICALLY GENERATED.  Please do
#      not edit this file directly.  To modify its contents, make
#      changes to your schema in Prismic, and re-run this command line.
#
# -----------------------------------------------------------------
`;

const QUERY = `
query IntrospectionQuery {
    __schema {
      queryType {
        name
      }
      mutationType {
        name
      }
      subscriptionType {
        name
      }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }
  
  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }
  
  fragment InputValue on __InputValue {
    name
    description
    type {
      ...TypeRef
    }
    defaultValue
  }
  
  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
  `;

export async function generateSchema(
	gqlUrl: string,
	outputFilename: string
): Promise<void> {
	// Get schema
	const schemaData = await fetch(gqlUrl, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
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
	commander
		.usage('[options] ...')
		.description('Downloads the latest Prismic GraphQL schema file.')
		.option(
			'-r, --repository-name <repository>',
			'Url for prismic endpoint: [your-repository].prismic.io'
		)
		.option(
			'-o, --output-filename <fileName>',
			'Name of file to be output. Should be appended with .gql'
		)
		.parse(process.argv);

	const { gqlUrl, outputFilename } = commander;

	if (!gqlUrl || !outputFilename) {
		commander.help();
		return;
	}

	await generateSchema(gqlUrl, outputFilename);
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});

module.exports = run;