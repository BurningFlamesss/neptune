import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/lib/auth.ts";
import { sessionMiddleware } from "#/middleware/authentication.tsx";

const registerThirdPartyAppSchema = z.object({
	appName: z.string(),
	redirectUri: z.url(),
});

export const registerThirdPartyApp = createServerFn()
	.middleware([sessionMiddleware])
	.validator(registerThirdPartyAppSchema)
	.handler(async ({ data, context }) => {
		const client = await auth.api.createOAuthClient({
			body: {
				client_name: data.appName,
				redirect_uris: [data.redirectUri],
				grant_types: ["authorization_code", "refresh_token"],
				response_types: ["code"],
				token_endpoint_auth_method: "client_secret_basic",
			},
		});

		return {
			clientId: client.client_id,
			clientSecret: client.client_secret,
		};
	});
