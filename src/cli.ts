#!/usr/bin/env node
import meow from "meow";
import { exit } from "process";
import { createConverter } from "./converter/factory.js";
import { type Flags, validateFlags } from "./flags.js";

const cli = meow(
	`
	Usage
		$ oac
		$ openapi-converter

	Options:
		-o, --output <path>        Output file path
		-p, --provider <provider>  Provider to use
		-h, --help                 Show help message
	`,
	{
		importMeta: import.meta,
		flags: {
			output: {
				type: "string",
				shortFlag: "o",
			},
			provider: {
				type: "string",
				shortFlag: "p",
			},
		},
	},
);

let flags: Flags;
try {
	flags = validateFlags(cli.flags);
} catch (e) {
	console.error(e);
	exit(1);
}

const converter = createConverter(flags);
const inputPath = cli.input.at(0);
if (!inputPath) {
	console.error("There is no input path");
	exit(1);
}

try {
	converter.convert(inputPath);
} catch (e) {
	console.error(e);
	exit(1);
}

exit(0);
