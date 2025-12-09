import * as z from "zod";
import { ValidationError } from "./errors/validation.js";

const flags = z.object({
	output: z.string().optional(),
	provider: z.enum(["postman", "apidog", "bruno"]).optional(),
});

export type Flags = z.infer<typeof flags>;

export const validateFlags = (input: unknown): Flags => {
	const result = flags.safeParse(input);
	if (result.error) {
		throw new ValidationError(z.prettifyError(result.error));
	}
	return result.data;
};
