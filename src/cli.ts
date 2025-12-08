#!/usr/bin/env node

import { parseArgs } from "node:util";
import { convertToOpenAPI } from "./index.js";

const { values, positionals } = parseArgs({
	options: {
		output: {
			type: "string",
			short: "o",
			description: "Output file path for the OpenAPI specification",
		},
		help: {
			type: "boolean",
			short: "h",
			description: "Show help message",
		},
	},
	allowPositionals: true,
});

if (values.help || positionals.length === 0) {
	console.log(`
Usage: openapi-converter [options] <input-file>

Convert API collection files to OpenAPI v3 format

Options:
  -o, --output <path>    Output file path (default: openapi.json)
  -h, --help             Show this help message

Supported formats:
  - Postman Collection (v2.1)
  - Apidog Collection
  - Bruno Collection
`);
	process.exit(values.help ? 0 : 1);
}

const inputFile = positionals[0];
const outputFile = values.output || "openapi.json";

try {
	await convertToOpenAPI(inputFile, outputFile);
	console.log(`✓ Successfully converted to ${outputFile}`);
} catch (error) {
	console.error("Error:", error instanceof Error ? error.message : error);
	process.exit(1);
}
