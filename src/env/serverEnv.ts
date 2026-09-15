import { createEnv } from "@t3-oss/env-core";

export const serverEnv = createEnv({
	server: {},
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
