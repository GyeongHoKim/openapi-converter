import { readFileSync, writeFileSync } from "node:fs";
import type { FileHandler } from "./io.js";

export class FSFileHandler implements FileHandler {
	readFile(path: string): string {
		return readFileSync(path, "utf-8");
	}

	writeFile<T extends string | Buffer>(path: string, data: T): void {
		writeFileSync(path, data, "utf-8");
	}
}
