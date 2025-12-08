import { readFile, writeFile } from "node:fs/promises";

export interface OpenAPISpec {
	openapi: string;
	info: {
		title: string;
		version: string;
		description?: string;
	};
	paths: Record<string, unknown>;
}

export async function convertToOpenAPI(
	inputPath: string,
	outputPath: string,
): Promise<void> {
	const content = await readFile(inputPath, "utf-8");
	const inputData = JSON.parse(content);

	// TODO: Implement actual conversion logic for different formats
	const openAPISpec: OpenAPISpec = {
		openapi: "3.0.0",
		info: {
			title: inputData.info?.name || "API",
			version: "1.0.0",
			description: inputData.info?.description,
		},
		paths: {},
	};

	await writeFile(outputPath, JSON.stringify(openAPISpec, null, 2));
}
