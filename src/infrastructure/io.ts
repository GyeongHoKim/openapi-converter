export interface FileHandler {
	readFile(path: string): string;
	writeFile<T extends string | Buffer>(path: string, data: T): void;
}
