import { BadRequestError } from "../errors/bad-request.js";
import type { Flags } from "../flags.js";
import { FSFileHandler } from "../infrastructure/file-handler.js";
import { APIDogConverter } from "./apidog-converter.js";
import { BrunoConverter } from "./bruno-converter.js";
import type { Converter } from "./converter.js";
import { PostmanConverter } from "./postman-converter.js";

export const createConverter = (flags: Flags): Converter => {
	const provider = flags.provider.toLowerCase();
	const outputPath = flags.output;
	const fileHandler = new FSFileHandler();
	switch (provider) {
		case "postman":
			return new PostmanConverter(outputPath, fileHandler);
		case "apidog":
			return new APIDogConverter(outputPath, fileHandler);
		case "bruno":
			return new BrunoConverter(outputPath, fileHandler);
		default:
			throw new BadRequestError(`Not Supported: ${provider}`);
	}
};
