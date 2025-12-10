import { describe, expect, it } from "vitest";
import { ValidationError } from "../src/errors/validation.js";
import { validateFlags } from "../src/flags.js";

describe("valid flags", () => {
	it("should return Flags type if output and provider both exists", () => {
		const output = "./test.json";
		const provider = "postman";
		const flags = {
			output,
			provider,
		} as unknown;
		const result = validateFlags(flags);
		expect(result.output).toBe(output);
		expect(result.provider).toBe(provider);
	});

	it("should return Flags type with default value if only output given", () => {
		const output = "./test.json";
		const defaultProvider = "postman";
		const flags = {
			output,
		} as unknown;
		const result = validateFlags(flags);
		expect(result.output).toBe(output);
		expect(result.provider).toBe(defaultProvider);
	});

	it("should return Flags type with default value if only provider given", () => {
		const defaultOuput = "./openapi.json";
		const provider = "bruno";
		const flags = {
			provider,
		} as unknown;
		const result = validateFlags(flags);
		expect(result.output).toBe(defaultOuput);
		expect(result.provider).toBe(provider);
	});

	it("should return Flags type with default value without any input", () => {
		const defaultOuput = "./openapi.json";
		const defaultProvider = "postman";
		const flags = {} as unknown;
		const result = validateFlags(flags);
		expect(result.output).toBe(defaultOuput);
		expect(result.provider).toBe(defaultProvider);
	});
});

describe("invalid flags", () => {
	it("should throw ValidationError with unsupported provider", () => {
		const notSupportedProvider = "something-special";
		const flags = {
			provider: notSupportedProvider,
		} as unknown;
		expect(() => validateFlags(flags)).toThrow(ValidationError);
	});

	it("should throw ValidationError with unsported extension", () => {
		const unSupportedOutput = "./openapi.md";
		const flags = {
			output: unSupportedOutput,
		} as unknown;
		expect(() => validateFlags(flags)).toThrow(ValidationError);
	});

	it("should throw ValidationError with no extension", () => {
		const noExtensionOutput = "json";
		const flags = {
			output: noExtensionOutput,
		} as unknown;
		expect(() => validateFlags(flags)).toThrow(ValidationError);
	});
});
