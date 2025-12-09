import { Converter } from "./converter.js";

export class BrunoConverter extends Converter {
	convert(input: string): never {
		throw new Error();
	}
}
