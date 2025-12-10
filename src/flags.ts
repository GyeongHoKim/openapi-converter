import * as z from "zod";
import { ValidationError } from "./errors/validation.js";

const flags = z.object({
	output: z.string().optional(),
	provider: z.enum(["postman", "apidog", "bruno"]).optional(),
});

const supportedProviders = ["postman", "apidog", "bruno"] as const;
const supportedExtensions = ["json", "yml", "yaml"] as const;
export type ProviderFlag = (typeof supportedProviders)[number];
export type SupportedExtension = (typeof supportedExtensions)[number];
export type Flags = {
	output: string;
	provider: ProviderFlag;
};

const isSupportedExtesion = (ext: unknown): ext is SupportedExtension => {
	if (typeof ext !== "string") {
		return false;
	}
	return ["json", "yml", "yaml"].includes(ext);
};

const DEFAULT_OUTPUT = "./openapi.json";
const DEFAULT_PROVIDER = "postman";

export const validateFlags = (input: unknown): Flags => {
	const result = flags.safeParse(input);
	if (result.error) {
		throw new ValidationError(z.prettifyError(result.error));
	}
	let { output, provider } = result.data;
	output ??= DEFAULT_OUTPUT;
	provider ??= DEFAULT_PROVIDER;

	if (!output.includes(".")) {
		throw new ValidationError("Unsupported extension");
	}

	const chunks = output.split(".");
	if (!isSupportedExtesion(chunks[chunks.length - 1])) {
		throw new ValidationError("Unsupported extension");
	}

	return {
		output,
		provider,
	};
};
