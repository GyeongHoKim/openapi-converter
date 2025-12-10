import { describe, expect, it } from "vitest";
import { Converter } from "../../src/converter/converter";
import { createConverter } from "./../../src/converter/factory";
import type { ProviderFlag } from "../../src/flags";

describe("valid parameter", () => {
	const validProviderFlags: ProviderFlag[][] = [
		["postman"],
		["apidog"],
		["bruno"],
	];
	it.each(
		validProviderFlags,
	)("should return Converter when valid provider: %s", (provider: ProviderFlag) => {
		const flags = {
			output: "./test.json",
			provider,
		};

		const converter = createConverter(flags);
		expect(converter).toBeInstanceOf(Converter);
	});
});
