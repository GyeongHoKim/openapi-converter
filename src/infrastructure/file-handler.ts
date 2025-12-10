import { readFileSync, writeFileSync } from "node:fs";
import type { FileHandler } from "./io.js";

export class FSFileHandler implements FileHandler {
	readFile<T extends string | Buffer>(path: string): T {
		const content = readFileSync(path, "utf-8");
		return content as T;
	}

	writeFile<T extends string | Buffer>(path: string, data: T): void {
		writeFileSync(path, data, "utf-8");
	}
}
