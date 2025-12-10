import * as z from "zod";
import { ValidationError } from "./errors/validation.js";

const flags = z.object({
	output: z.string().optional(),
	provider: z.enum(["postman", "apidog", "bruno"]).optional(),
});

export type Flags = {
	output: string;
	provider: string;
};

const DEFAULT_OUTPUT = "./openapi.json";
const DEFAULT_PROVIDER = "postman";

export const validateFlags = (input: unknown): Flags => {
	const result = flags.safeParse(input);
	if (result.error) {
		throw new ValidationError(z.prettifyError(result.error));
	}
	const { output, provider } = result.data;
	return {
		output: output ?? DEFAULT_OUTPUT,
		provider: provider ?? DEFAULT_PROVIDER,
	};
};
