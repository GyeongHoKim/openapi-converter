import { readFile, unlink, writeFile } from "node:fs/promises";
import { afterEach, describe, expect, it } from "vitest";
import { convertToOpenAPI } from "../src/index.js";

describe("convertToOpenAPI", () => {
	const inputFile = "test-input.json";
	const outputFile = "test-output.json";

	afterEach(async () => {
		await unlink(inputFile).catch(() => {});
		await unlink(outputFile).catch(() => {});
	});

	it("creates a valid OpenAPI spec", async () => {
		const mockInput = {
			info: {
				name: "Test API",
				description: "A test API",
			},
		};

		await writeFile(inputFile, JSON.stringify(mockInput));
		await convertToOpenAPI(inputFile, outputFile);

		const output = await readFile(outputFile, "utf-8");
		const spec = JSON.parse(output);

		expect(spec.openapi).toBe("3.0.0");
		expect(spec.info.title).toBe("Test API");
		expect(spec.info.description).toBe("A test API");
	});
});
