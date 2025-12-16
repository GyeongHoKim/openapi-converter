import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import SwaggerParser from "@apidevtools/swagger-parser";
import { afterEach, describe, expect, it } from "vitest";
import { BrunoConverter } from "../../src/converter/bruno-converter.js";
import { FSFileHandler } from "../../src/infrastructure/file-handler.js";

describe("BrunoConverter E2E", () => {
	const testDir = join(process.cwd(), "test/fixtures");
	const inputDir = join(testDir, "bruno-collection");
	const outputFileJson = join(testDir, "output-openapi.json");
	const outputFileYaml = join(testDir, "output-openapi.yaml");

	afterEach(() => {
		if (existsSync(outputFileJson)) {
			unlinkSync(outputFileJson);
		}
		if (existsSync(outputFileYaml)) {
			unlinkSync(outputFileYaml);
		}
	});

	it("should convert bruno collection to OpenAPI JSON and validate with swagger-parser", async () => {
		const fileHandler = new FSFileHandler();
		const converter = new BrunoConverter(outputFileJson, fileHandler);

		converter.convert(inputDir);

		expect(existsSync(outputFileJson)).toBe(true);

		const openApiContent = readFileSync(outputFileJson, "utf-8");
		const openApiSpec = JSON.parse(openApiContent);

		const validatedSpec = await SwaggerParser.validate(openApiSpec);
		expect(validatedSpec).toBeDefined();
		expect("openapi" in validatedSpec || "swagger" in validatedSpec).toBe(true);
	});

	it("should convert bruno collection to OpenAPI YAML and validate with swagger-parser", async () => {
		const fileHandler = new FSFileHandler();
		const converter = new BrunoConverter(outputFileYaml, fileHandler);

		converter.convert(inputDir);

		expect(existsSync(outputFileYaml)).toBe(true);

		const validatedSpec = await SwaggerParser.validate(outputFileYaml);
		expect(validatedSpec).toBeDefined();
		expect("openapi" in validatedSpec || "swagger" in validatedSpec).toBe(true);
	});
});
