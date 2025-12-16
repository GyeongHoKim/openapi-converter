import { Converter } from "./converter.js";

export class APIDogConverter extends Converter {
	convert(_input: string): never {
		throw new Error();
	}
}
