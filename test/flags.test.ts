import { describe, expect, it } from "vitest";
import { validateFlags } from "../src/flags.js";

describe("valid flags", () => {
	it("should return Flags type if output and provider both exists", () => {
		const output = "./openapi.json";
		const provider = "postman";
		const flags = {
			output,
			provider,
		} as unknown;
		const result = validateFlags(flags);
		expect(result.output).toBe(output);
		expect(result.provider).toBe(provider);
	});
});
