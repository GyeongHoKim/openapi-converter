import type { FileHandler } from "./io.js";

export class FSFileHandler implements FileHandler {
	readFile<T extends string | Buffer>(path: string): T {
		throw new Error();
	}

	writeFile<T extends string | Buffer>(path: string, data: T): never {
		throw new Error();
	}
}
