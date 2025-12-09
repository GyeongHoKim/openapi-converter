import { Converter } from "./converter.js";

export class PostmanConverter extends Converter {
	convert(input: string): never {
		throw new Error();
	}
}
