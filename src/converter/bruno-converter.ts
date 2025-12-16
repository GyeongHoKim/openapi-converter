import { convertBrunoCollectionToOpenAPISync } from "@gyeonghokim/bruno-to-openapi";
import * as jsYaml from "js-yaml";
import { ConvertError } from "../errors/convert.js";
import { ValidationError } from "../errors/validation.js";
import { isSupportedExtesion, type SupportedExtension } from "../flags.js";
import type { FileHandler } from "../infrastructure/io.js";
import { Converter } from "./converter.js";

type OpenAPISpec = Record<string, unknown>;

interface BrunoConversionResult {
	spec: OpenAPISpec;
}

function isBrunoConversionResult(
	value: unknown,
): value is BrunoConversionResult {
	return (
		typeof value === "object" &&
		value !== null &&
		"spec" in value &&
		typeof (value as { spec: unknown }).spec === "object" &&
		(value as { spec: unknown }).spec !== null
	);
}

export class BrunoConverter extends Converter {
	private outputFileExtension: SupportedExtension;

	constructor(outputPath: string, fileHandler: FileHandler) {
		super(outputPath, fileHandler);
		const chunks = outputPath.split(".");
		const extension = chunks[chunks.length - 1];
		if (!isSupportedExtesion(extension)) {
			throw new ValidationError("Unsupported extension");
		}
		this.outputFileExtension = extension;
	}

	convert(input: string): void {
		let result: unknown;
		try {
			result = convertBrunoCollectionToOpenAPISync(input);
		} catch (_e) {
			throw new ConvertError();
		}

		if (!isBrunoConversionResult(result)) {
			throw new ConvertError();
		}

		const openapi = result.spec;

		if (this.outputFileExtension === "json") {
			this.fileHandler.writeFile(
				this.outputPath,
				JSON.stringify(openapi, null, 2),
			);
		} else {
			this.fileHandler.writeFile(this.outputPath, jsYaml.dump(openapi));
		}
	}
}
