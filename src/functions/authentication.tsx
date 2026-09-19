import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
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
		try {
			if (!context.session) {
				throw new Error("Unauthorized: Cannot complete registration without session");
			}

			const rawHeadersObject = getRequestHeaders();

			const isLoopback = data.redirectUri.startsWith("http://localhost") || data.redirectUri.startsWith("http://127.0.0.1") || data.redirectUri.startsWith("http://[::1]");
			
			const client = await auth.api.createOAuthClient({
				headers: rawHeadersObject as any,
				body: {
					client_name: data.appName,
					redirect_uris: [data.redirectUri],
					grant_types: ["authorization_code", "refresh_token"],
					response_types: ["code"],
					token_endpoint_auth_method: "client_secret_basic",
					application_type: isLoopback ? "native" : "web",
				},
			});

			return {
				clientId: client.client_id,
				clientSecret: client.client_secret,
			};
		} catch (error: any) {
			console.error("registerThirdPartyApp error:", error);
			const apiError = error?.body?.error_description || error?.body?.message || error?.message || "Failed to register the app";
			throw new Error(apiError);
		}
	});