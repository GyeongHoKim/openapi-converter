import { Converter } from "./converter.js";

export class APIDogConverter extends Converter {
	convert(input: string): never {
		throw new Error();
	}
}
