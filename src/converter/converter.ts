import type { FileHandler } from "../infrastructure/io.js";

export abstract class Converter {
	constructor(
		protected readonly outputPath: string,
		protected readonly fileHandler: FileHandler,
	) {}
	abstract convert(input: string): void;
}
