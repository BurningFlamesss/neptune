import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
	server: {
		SERVER_URL: z.string(),
		APP_USER: z.string(),
		APP_PASSWORD: z.string(),
		LLM_API_KEY: z.string()
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,

	onValidationError(issues) {
		console.error("Invalid Environment Variable");
		issues.map((issue) =>
			console.error(`  ${issue.path?.join(".")}: ${issue.message}`),
		);
		process.exit(1);
	},
});
