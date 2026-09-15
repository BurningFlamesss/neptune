import { createEnv } from "@t3-oss/env-core";

export const clientEnv = createEnv({
	clientPrefix: "_CLIENT",
	client: {},
	runtimeEnv: import.meta.env,
	emptyStringAsUndefined: true,

	onValidationError(issues) {
		console.error("Invalid Environment Variable");
		issues.map((issue) =>
			console.error(`  ${issue.path?.join(".")}: ${issue.message}`),
		);
		process.exit(1);
	},
});
