export interface FileHandler {
	readFile<T extends string | Buffer>(path: string): T;
	writeFile<T extends string | Buffer>(path: string, data: T): never;
}
