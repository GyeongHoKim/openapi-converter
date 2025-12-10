import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import SwaggerParser from "@apidevtools/swagger-parser";
import { afterEach, describe, expect, it } from "vitest";
import { PostmanConverter } from "../../src/converter/postman-converter.js";
import { FSFileHandler } from "../../src/infrastructure/file-handler.js";

describe("PostmanConverter E2E", () => {
	const testDir = join(process.cwd(), "test");
	const inputFile = join(testDir, "postman_collection.json");
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

	it("should convert postman collection to OpenAPI JSON and validate with swagger-parser", async () => {
		const fileHandler = new FSFileHandler();
		const converter = new PostmanConverter(outputFileJson, fileHandler);

		converter.convert(inputFile);

		expect(existsSync(outputFileJson)).toBe(true);

		const openApiContent = readFileSync(outputFileJson, "utf-8");
		const openApiSpec = JSON.parse(openApiContent);

		const validatedSpec = await SwaggerParser.validate(openApiSpec);
		expect(validatedSpec).toBeDefined();
		expect("openapi" in validatedSpec || "swagger" in validatedSpec).toBe(true);
	});

	it("should convert postman collection to OpenAPI YAML and validate with swagger-parser", async () => {
		const fileHandler = new FSFileHandler();
		const converter = new PostmanConverter(outputFileYaml, fileHandler);

		converter.convert(inputFile);

		expect(existsSync(outputFileYaml)).toBe(true);

		const validatedSpec = await SwaggerParser.validate(outputFileYaml);
		expect(validatedSpec).toBeDefined();
		expect("openapi" in validatedSpec || "swagger" in validatedSpec).toBe(true);
	});
});
