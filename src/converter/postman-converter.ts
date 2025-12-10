import * as jsYaml from "js-yaml";
import * as postman2openapi from "postman2openapi";
import { ConvertError } from "../errors/convert.js";
import { ValidationError } from "../errors/validation.js";
import { isSupportedExtesion, type SupportedExtension } from "../flags.js";
import type { FileHandler } from "../infrastructure/io.js";
import { Converter } from "./converter.js";

export class PostmanConverter extends Converter {
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
		const collectionString = this.fileHandler.readFile<string>(input);
		const collection = JSON.parse(collectionString);
		let openapi: any;
		try {
			openapi = postman2openapi.transpile(collection);
		} catch (e) {
			throw new ConvertError();
		}
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
